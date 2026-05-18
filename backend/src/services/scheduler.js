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

function bucketForHour(hour) {
  if (hour < 12) return 'morning';
  if (hour < 16) return 'afternoon';
  return 'evening';
}

function getClinicHour(date) {
  return (date.getUTCHours() + CLINIC_TIMEZONE_OFFSET_MINUTES / 60) % 24;
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

async function getBranchAppointmentsOnDay(branchId, dayStart, dayEnd) {
  const [rows] = await pool.query(
    `SELECT start_time, duration_min FROM appointments
     WHERE branch_id = ?
       AND status IN ('scheduled','arrived','completed')
       AND start_time >= ? AND start_time < ?`,
    [branchId, toMySQLDateTime(dayStart), toMySQLDateTime(dayEnd)]
  );
  return rows.map(r => ({
    start: new Date(r.start_time),
    end: addMinutes(
      new Date(r.start_time),
      r.duration_min + APPOINTMENT_BUFFER_MINUTES
    ),
  }));
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
  let selectedSlotBooked = false;

  if (preferredStart) {
    const preferredBounds = dayBoundsForDate(preferredStart);
    const existing = await getBranchAppointmentsOnDay(
      branchId,
      preferredBounds.start,
      preferredBounds.end
    );
    const preferredEnd = addMinutes(
      preferredStart,
      service.duration_min + APPOINTMENT_BUFFER_MINUTES
    );

    selectedSlotBooked = existing.some(e =>
      rangesOverlap(preferredStart, preferredEnd, e.start, e.end)
    );
  }

  const allCandidates = [];
  let dayIndex = 0;

  for (const day of eachUTCDayInRange(from, to)) {
    const dayStart = day;
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekday = jsWeekday(day);

    for (const dentist of dentists) {
      const schedule = await getDentistSchedule(dentist.id, branchId, weekday);
      if (!schedule) continue;

      const clinic = clinicBoundsForDay(day);
      const workStart = maxDate(combineDateAndClinicTime(day, schedule.start_time), clinic.start);
      const workEnd = minDate(combineDateAndClinicTime(day, schedule.end_time), clinic.end);
      if (workStart >= workEnd) continue;

      const existing = await getBranchAppointmentsOnDay(branchId, dayStart, dayEnd);
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

  const suggestions = pickTopSuggestions(allCandidates, limit);

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
    selected_slot_booked: selectedSlotBooked,
    suggestions,
  };
}

function pickTopSuggestions(sortedCandidates, limit) {
  const picked = [];
  const seenKeys = new Set();

  for (const candidate of sortedCandidates) {
    if (picked.length >= limit) break;
    const key = candidate.start_time;
    if (seenKeys.has(key)) continue;
    picked.push(candidate);
    seenKeys.add(key);
  }
  return picked;
}

module.exports = { suggestSlots };
