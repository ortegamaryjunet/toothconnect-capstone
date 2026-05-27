const pool = require('../config/db');
const {
  APPOINTMENT_BUFFER_MINUTES,
  jsWeekday,
  parseISOToDate,
  addMinutes,
  rangesOverlap,
  generateCandidateSlots,
  startOfUTCDay,
  eachUTCDayInRange,
  toMySQLDateTime,
} = require('../utils/scheduling');
const { clinicDateKeyFromUtcDate } = require('../utils/clinic');
const { getApprovedLeavesForDentistsInRange, isDateKeyWithinRanges } = require('../utils/leaves');

const SCORE_WEIGHTS = {
  PREFERRED_TIME_OF_DAY: 3,
  SAME_DENTIST_AS_LAST_VISIT: 2,
  SOONEST_DAY_BONUS: 2,
  EARLIER_IN_DAY: 1,
};

const TIME_BUCKETS = {
  morning: { startHour: 10, endHour: 12 },
  afternoon: { startHour: 13, endHour: 16 },
  evening: { startHour: 16, endHour: 19 },
};

const CLINIC_START_HOUR = 10;
const CLINIC_END_HOUR = 19;
const CLINIC_TIMEZONE_OFFSET_MINUTES = 8 * 60;
const LUNCH_START_MINUTES = 12 * 60;
const LUNCH_END_MINUTES = 13 * 60 + 30; // next start is 1:30 PM

function hash32FNV1a(input) {
  const str = String(input ?? '');
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickRoundRobinCandidate(candidates, key) {
  if (!Array.isArray(candidates) || candidates.length <= 1) return candidates?.[0] || null;
  const idx = hash32FNV1a(key) % candidates.length;
  return candidates[idx] || candidates[0] || null;
}

function bucketForHour(hour) {
  if (hour < 12) return 'morning';
  if (hour < 16) return 'afternoon';
  return 'evening';
}

function getClinicHour(date) {
  return (date.getUTCHours() + CLINIC_TIMEZONE_OFFSET_MINUTES / 60) % 24;
}

function getClinicMinutes(date) {
  const localHour = getClinicHour(date);
  return localHour * 60 + date.getUTCMinutes();
}

function isInsideLunchLocal(slotStart, slotEnd) {
  const startMin = getClinicMinutes(slotStart);
  const endMin = getClinicMinutes(slotEnd);
  return startMin < LUNCH_END_MINUTES && endMin > LUNCH_START_MINUTES;
}

function clinicBoundsForDay(day) {
  const year = day.getUTCFullYear();
  const month = day.getUTCMonth();
  const date = day.getUTCDate();
  const start = new Date(Date.UTC(
    year,
    month,
    date,
    CLINIC_START_HOUR - CLINIC_TIMEZONE_OFFSET_MINUTES / 60,
    0,
    0,
    0
  ));
  const end = new Date(Date.UTC(
    year,
    month,
    date,
    CLINIC_END_HOUR - CLINIC_TIMEZONE_OFFSET_MINUTES / 60,
    0,
    0,
    0
  ));

  return { start, end };
}

function combineDateAndClinicTime(dateOnly, timeStr) {
  const [hh, mm, ss] = timeStr.split(':').map(Number);
  return new Date(Date.UTC(
    dateOnly.getUTCFullYear(),
    dateOnly.getUTCMonth(),
    dateOnly.getUTCDate(),
    hh - CLINIC_TIMEZONE_OFFSET_MINUTES / 60,
    mm,
    ss || 0,
    0
  ));
}

function maxDate(a, b) {
  return a > b ? a : b;
}

function minDate(a, b) {
  return a < b ? a : b;
}

function dayBoundsForDate(date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

async function getEligibleDentists(serviceId, branchId) {
  const [rows] = await pool.query(
    `SELECT DISTINCT u.id, u.name
     FROM users u
     JOIN dentist_services dsv ON dsv.dentist_id = u.id
     JOIN dentist_schedules dsch ON dsch.dentist_id = u.id
     WHERE u.role = 'dentist'
       AND u.status = 'Active'
       AND dsv.service_id = ?
       AND dsch.branch_id = ?`,
    [serviceId, branchId]
  );
  return rows;
}

async function getDentistSchedule(dentistId, branchId, weekday) {
  const [rows] = await pool.query(
    `SELECT start_time, end_time FROM dentist_schedules
     WHERE dentist_id = ? AND branch_id = ? AND weekday = ?
     LIMIT 1`,
    [dentistId, branchId, weekday]
  );
  return rows[0] || null;
}

async function getDentistAppointmentsOnDay(dentistId, dayStart, dayEnd) {
  const [rows] = await pool.query(
    `SELECT start_time, duration_min FROM appointments
     WHERE dentist_id = ?
        AND status IN ('scheduled','arrived')
        AND start_time >= ? AND start_time < ?`,
    [dentistId, toMySQLDateTime(dayStart), toMySQLDateTime(dayEnd)]
  );
  return rows.map(r => ({
    start: new Date(r.start_time),
    end: addMinutes(new Date(r.start_time), r.duration_min + APPOINTMENT_BUFFER_MINUTES),
  }));
}

async function getBranchBusyIntervalsOnDay(branchId, dayStart, dayEnd) {
  const [rows] = await pool.query(
    `SELECT start_time, duration_min FROM appointments
     WHERE branch_id = ?
       AND status IN ('scheduled','arrived')
       AND start_time >= ? AND start_time < ?`,
    [branchId, toMySQLDateTime(dayStart), toMySQLDateTime(dayEnd)]
  );
  return rows.map((r) => {
    const start = parseISOToDate(r.start_time);
    const end = addMinutes(start, Number(r.duration_min || 30) + APPOINTMENT_BUFFER_MINUTES);
    return { start, end };
  });
}

async function getPatientPreferences(patientId) {
  const [rows] = await pool.query(
    `SELECT a.start_time, a.dentist_id
     FROM appointments a
     WHERE a.patient_id = ? AND a.status IN ('scheduled','arrived','completed')
     ORDER BY a.start_time DESC
     LIMIT 10`,
    [patientId]
  );

  if (rows.length === 0) {
    return { preferredBucket: null, lastDentistId: null };
  }

  const lastDentistId = rows[0].dentist_id;

  const bucketCounts = { morning: 0, afternoon: 0, evening: 0 };
  for (const r of rows) {
    const hour = getClinicHour(new Date(r.start_time));
    bucketCounts[bucketForHour(hour)]++;
  }
  let preferredBucket = null;
  let maxCount = 0;
  for (const [bucket, count] of Object.entries(bucketCounts)) {
    if (count > maxCount) {
      maxCount = count;
      preferredBucket = bucket;
    }
  }

  return { preferredBucket, lastDentistId };
}

function scoreSlot({ slot, dentist, dayIndex, preferences, preferredStart }) {
  const breakdown = {};
  let score = 0;

  const slotHour = getClinicHour(slot.start);
  const slotBucket = bucketForHour(slotHour);

  if (preferences.preferredBucket && slotBucket === preferences.preferredBucket) {
    breakdown.matches_preferred_time_of_day = SCORE_WEIGHTS.PREFERRED_TIME_OF_DAY;
    score += SCORE_WEIGHTS.PREFERRED_TIME_OF_DAY;
  }

  if (preferences.lastDentistId && dentist.id === preferences.lastDentistId) {
    breakdown.same_dentist_as_last_visit = SCORE_WEIGHTS.SAME_DENTIST_AS_LAST_VISIT;
    score += SCORE_WEIGHTS.SAME_DENTIST_AS_LAST_VISIT;
  }

  if (dayIndex === 0) {
    breakdown.soonest_available_day = SCORE_WEIGHTS.SOONEST_DAY_BONUS;
    score += SCORE_WEIGHTS.SOONEST_DAY_BONUS;
  } else if (dayIndex === 1) {
    breakdown.next_day_bonus = 1;
    score += 1;
  }

  if (slotHour < 14) {
    breakdown.earlier_in_day = SCORE_WEIGHTS.EARLIER_IN_DAY;
    score += SCORE_WEIGHTS.EARLIER_IN_DAY;
  }

  if (preferredStart) {
    const distanceMinutes = Math.abs(slot.start.getTime() - preferredStart.getTime()) / 60000;
    breakdown.close_to_requested_time = Math.max(1, 10 - Math.floor(distanceMinutes / 60));
    score += breakdown.close_to_requested_time;
  }

  return { score, breakdown };
}

async function suggestSlots({
  patientId,
  branchId,
  serviceId,
  fromDate,
  toDate,
  preferredStartDate,
  limit = 3,
}) {
  const [services] = await pool.query(
    `SELECT id, name, duration_min FROM services
     WHERE id = ? AND status = 'Active'`,
    [serviceId]
  );
  if (services.length === 0) {
    throw new Error('Service not found');
  }
  const service = services[0];

  const dentists = await getEligibleDentists(serviceId, branchId);
  if (dentists.length === 0) {
    return {
      service: { id: service.id, name: service.name, duration_min: service.duration_min },
      suggestions: [],
      reason: 'No dentists at this branch offer this service',
    };
  }

  const preferences = await getPatientPreferences(patientId);

  const from = parseISOToDate(fromDate);
  const to = parseISOToDate(toDate);
  const preferredStart = preferredStartDate ? parseISOToDate(preferredStartDate) : null;

  const dentistIds = dentists.map((d) => Number(d.id)).filter(Boolean);
  const fromKey = clinicDateKeyFromUtcDate(from);
  const toKey = clinicDateKeyFromUtcDate(to);
  const approvedLeavesByDentist = await getApprovedLeavesForDentistsInRange(
    pool,
    dentistIds,
    fromKey,
    toKey
  );

  const allCandidates = [];
  let dayIndex = 0;

  for (const day of eachUTCDayInRange(from, to)) {
    const dayStart = day;
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekday = jsWeekday(day);
    const dayKey = clinicDateKeyFromUtcDate(dayStart);
    const branchBusyIntervals = await getBranchBusyIntervalsOnDay(branchId, dayStart, dayEnd);

    for (const dentist of dentists) {
      const leaveRanges = approvedLeavesByDentist.get(Number(dentist.id)) || null;
      if (dayKey && isDateKeyWithinRanges(dayKey, leaveRanges)) {
        continue;
      }

      let workStart, workEnd;

      if (weekday === 0) {
        // Sunday: dentists are on-call for all assigned branches — no schedule entry required.
        // Use full clinic hours. getDentistAppointmentsOnDay queries ALL branches,
        // so a booking at any branch blocks the dentist's Sunday availability everywhere.
        const clinic = clinicBoundsForDay(day);
        workStart = clinic.start;
        workEnd = clinic.end;
      } else {
        const schedule = await getDentistSchedule(dentist.id, branchId, weekday);
        if (!schedule) continue;

        const clinic = clinicBoundsForDay(day);
        workStart = maxDate(combineDateAndClinicTime(day, schedule.start_time), clinic.start);
        workEnd = minDate(combineDateAndClinicTime(day, schedule.end_time), clinic.end);
      }

      if (workStart >= workEnd) continue;

      const existing = await getDentistAppointmentsOnDay(dentist.id, dayStart, dayEnd);
      const candidates = [];

      if (
        preferredStart &&
        preferredStart >= workStart &&
        addMinutes(preferredStart, service.duration_min + APPOINTMENT_BUFFER_MINUTES) <= workEnd
      ) {
        candidates.push({
          start: new Date(preferredStart),
          end: addMinutes(preferredStart, service.duration_min + APPOINTMENT_BUFFER_MINUTES),
        });
      }

      candidates.push(...generateCandidateSlots({
        workStart,
        workEnd,
        durationMin: service.duration_min + APPOINTMENT_BUFFER_MINUTES,
        stepMin: 15,
      }));

      for (const slot of candidates) {
        if (slot.start <= new Date()) continue;
        if (isInsideLunchLocal(slot.start, slot.end)) continue;
        const branchConflict = branchBusyIntervals.some((b) =>
          rangesOverlap(slot.start, slot.end, b.start, b.end)
        );
        if (branchConflict) continue;

        const conflict = existing.some(e =>
          rangesOverlap(slot.start, slot.end, e.start, e.end)
        );
        if (conflict) continue;

        const { score, breakdown } = scoreSlot({
          slot,
          dentist,
          dayIndex,
          preferences,
          preferredStart,
        });

        const treatmentEnd = addMinutes(slot.start, service.duration_min);

        allCandidates.push({
          dentist_id: dentist.id,
          dentist_name: dentist.name,
          start_time: toMySQLDateTime(slot.start),
          end_time: toMySQLDateTime(treatmentEnd),
          distance_to_preferred_minutes: preferredStart
            ? Math.round(Math.abs(slot.start.getTime() - preferredStart.getTime()) / 60000)
            : null,
          score,
          breakdown,
        });
      }
    }
    dayIndex++;
  }

  allCandidates.sort((a, b) => {
    if (preferredStart) {
      if (a.distance_to_preferred_minutes !== b.distance_to_preferred_minutes) {
        return a.distance_to_preferred_minutes - b.distance_to_preferred_minutes;
      }
      return a.start_time.localeCompare(b.start_time);
    }

    if (b.score !== a.score) return b.score - a.score;
    return a.start_time.localeCompare(b.start_time);
  });

  const suggestions = pickTopSuggestions(allCandidates, limit, {
    branchId,
    serviceId: service.id,
  });

  return {
    service: { id: service.id, name: service.name, duration_min: service.duration_min },
    branch_id: branchId,
    patient_preferences: {
      preferred_time_of_day: preferences.preferredBucket,
      last_dentist_id: preferences.lastDentistId,
    },
    total_eligible_dentists: dentists.length,
    total_candidates_considered: allCandidates.length,
    preferred_start_time: preferredStart ? toMySQLDateTime(preferredStart) : null,
    selected_slot_booked: false,
    suggestions,
  };
}

function pickTopSuggestions(sortedCandidates, limit, { branchId, serviceId } = {}) {
  const picked = [];
  const seenKeys = new Set();
  const byStartTime = new Map();

  for (const c of sortedCandidates) {
    const k = c.start_time;
    if (!k) continue;
    const existing = byStartTime.get(k);
    if (existing) existing.push(c);
    else byStartTime.set(k, [c]);
  }

  for (const candidate of sortedCandidates) {
    if (picked.length >= limit) break;
    const key = candidate.start_time;
    if (seenKeys.has(key)) continue;

    // Tie-breaker: if multiple dentists share the same start_time and are otherwise
    // equally ranked, pick one deterministically using a round-robin-like rotation.
    const sameTime = byStartTime.get(key) || [];
    if (sameTime.length === 1) {
      picked.push(candidate);
      seenKeys.add(key);
      continue;
    }

    const top = sameTime[0];
    const tied = sameTime.filter((c) => {
      return (
        c.start_time === top.start_time &&
        (c.distance_to_preferred_minutes ?? null) === (top.distance_to_preferred_minutes ?? null) &&
        Number(c.score ?? 0) === Number(top.score ?? 0)
      );
    });

    const chosen = pickRoundRobinCandidate(
      tied.sort((a, b) => Number(a.dentist_id) - Number(b.dentist_id)),
      `${branchId || ''}:${serviceId || ''}:${key}`
    );

    picked.push(chosen || candidate);
    seenKeys.add(key);
  }
  return picked;
}

module.exports = { suggestSlots };
