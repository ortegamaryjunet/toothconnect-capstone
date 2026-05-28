const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../config/db');
const { APPOINTMENT_BUFFER_MINUTES, toMySQLDateTime } = require('../utils/scheduling');

function hash32FNV1a(input) {
  const str = String(input ?? '');
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

let cachedOnlineAppointmentsHasAssignedDentistId = null;
async function onlineAppointmentsHasAssignedDentistId() {
  if (cachedOnlineAppointmentsHasAssignedDentistId !== null) {
    return cachedOnlineAppointmentsHasAssignedDentistId;
  }

  try {
    const [rows] = await db.query(
      `SELECT 1 AS ok
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'online_appointments_tbl'
         AND COLUMN_NAME = 'assigned_dentist_id'
       LIMIT 1`
    );
    cachedOnlineAppointmentsHasAssignedDentistId = rows.length > 0;
  } catch (_) {
    cachedOnlineAppointmentsHasAssignedDentistId = false;
  }

  return cachedOnlineAppointmentsHasAssignedDentistId;
}

async function createNotification({
  userId = null,
  type,
  title,
  body,
  relatedType,
  relatedId
}) {
  if (userId === null || userId === undefined) {
    // Some DB schemas disallow NULL user_id. Treat as "no direct recipient".
    return;
  }
  await db.query(
    `INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      related_type,
      related_id,
      is_read,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
    [userId, type, title, body, relatedType, relatedId]
  );
}

async function notifyBranchReceptionists(branchId, notification) {
  if (!branchId) return;

  const [receptionists] = await db.query(
    `SELECT DISTINCT u.id
     FROM users u
     LEFT JOIN user_branches ub ON ub.user_id = u.id
     WHERE u.role = 'receptionist'
       AND u.status = 'Active'
       AND (u.home_branch_id = ? OR ub.branch_id = ?)`,
    [branchId, branchId]
  );

  if (receptionists.length === 0) return;

  await db.query(
    `INSERT INTO notifications (user_id, type, title, body, related_type, related_id, is_read, created_at)
     VALUES ${receptionists.map(() => '(?, ?, ?, ?, ?, ?, 0, NOW())').join(', ')}`,
    receptionists.flatMap((r) => [
      r.id,
      notification.type,
      notification.title,
      notification.body,
      notification.relatedType || null,
      notification.relatedId || null,
    ])
  );
}

async function resolveBranchIdFromText(text) {
  const cleaned = String(text || '').trim().replace(/ Branch$/i, '').trim();
  if (!cleaned) return null;

  const wanted = canonicalizeBranchText(cleaned);

  const [rows] = await db.query(`SELECT id, name, address FROM branches`);
  for (const b of rows) {
    const addr = canonicalizeBranchText(b.address);
    const name = canonicalizeBranchText(b.name);
    if (wanted && (wanted === addr || wanted === name)) {
      return b.id;
    }
  }

  return null;
}

function canonicalizeBranchText(value) {
  if (value === undefined || value === null) return '';
  // Handle common mojibake for ñ (PiÃ±as) and similar cases.
  let s = String(value).trim();
  s = s.replace(/Ã±/g, 'ñ').replace(/Ã‘/g, 'Ñ');

  // Lowercase + remove diacritics (ñ -> n) for stable matching.
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.toLowerCase();

  // Keep alphanumerics only.
  s = s.replace(/[^a-z0-9]+/g, '');
  return s;
}

async function listClinicServices() {
  const [rows] = await db.query(
    `SELECT
       id,
       CASE
         WHEN LOWER(name) = 'consultation' THEN 'General Dentistry Consultation'
         ELSE name
       END AS name,
       duration_min,
       price
     FROM services
     WHERE status = 'Active'
     ORDER BY name ASC`
  );
  return rows;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

async function findUserByEmail(email) {
  const cleanedEmail = normalizeEmail(email);
  if (!cleanedEmail) return null;
  const [rows] = await db.query(
    `SELECT id, role
     FROM users
     WHERE LOWER(email) = LOWER(?)
     LIMIT 1`,
    [cleanedEmail]
  );
  return rows[0] || null;
}

async function getOrCreateWebsitePatient({ fullName, email, phoneNumber, homeBranchId = null }) {
  const cleanedEmail = normalizeEmail(email);
  if (!cleanedEmail) {
    const err = new Error('Email is required.');
    err.statusCode = 400;
    throw err;
  }

  const existingUser = await findUserByEmail(cleanedEmail);
  if (existingUser && existingUser.role !== 'patient') {
    const err = new Error('EMAIL_ALREADY_USED_NON_PATIENT');
    err.statusCode = 409;
    throw err;
  }

  const [existing] = await db.query(
    `SELECT u.id
     FROM users u
     LEFT JOIN patient_profile pp ON pp.user_id = u.id
     WHERE u.role = 'patient'
       AND (LOWER(u.email) = LOWER(?) OR LOWER(pp.email) = LOWER(?))
     ORDER BY u.id ASC
     LIMIT 1`,
    [cleanedEmail, cleanedEmail]
  );

  if (existing.length > 0) {
    const patientId = existing[0].id;
    // best-effort update basic contact fields
    try {
      await db.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [
        fullName || null,
        phoneNumber || null,
        patientId,
      ]);
      await db.query(
        `INSERT INTO patient_profile (user_id, full_name, email, contact_number, address)
         VALUES (?, ?, ?, ?, 'Not provided')
         ON DUPLICATE KEY UPDATE
           full_name = VALUES(full_name),
           email = VALUES(email),
           contact_number = VALUES(contact_number)`,
        [patientId, fullName || null, cleanedEmail, phoneNumber || null]
      );
      if (homeBranchId) {
        await db.query(
          `INSERT IGNORE INTO user_branches (user_id, branch_id, is_primary)
           VALUES (?, ?, TRUE)`,
          [patientId, homeBranchId]
        );
      }
    } catch (_) {
      // ignore profile update failures
    }
    return patientId;
  }

  const password = crypto.randomBytes(18).toString('hex');
  const passwordHash = await bcrypt.hash(password, 10);

  const [result] = await db.query(
    `INSERT INTO users (role, home_branch_id, name, email, password_hash, phone, email_verified, must_change_password)
     VALUES ('patient', ?, ?, ?, ?, ?, TRUE, TRUE)`,
    [homeBranchId, fullName || 'Website Patient', cleanedEmail, passwordHash, phoneNumber || null]
  );

  await db.query(
    `INSERT INTO patient_profile (user_id, full_name, email, contact_number, address)
     VALUES (?, ?, ?, ?, 'Not provided')`,
    [result.insertId, fullName || 'Website Patient', cleanedEmail, phoneNumber || '',]
  );

  if (homeBranchId) {
    await db.query(
      `INSERT IGNORE INTO user_branches (user_id, branch_id, is_primary)
       VALUES (?, ?, TRUE)`,
      [result.insertId, homeBranchId]
    );
  }

  return result.insertId;
}

async function findServiceByReason(reasonForBooking) {
  const reason = String(reasonForBooking || '').trim();
  if (!reason) return null;

  const [rows] = await db.query(
    `SELECT id, name, category, duration_min, time_buffer_min, price
     FROM services
     WHERE status = 'Active'
       AND (
         LOWER(name) = LOWER(?)
         OR LOWER(name) LIKE CONCAT('%', LOWER(?), '%')
         OR LOWER(?) LIKE CONCAT('%', LOWER(name), '%')
       )
     ORDER BY (LOWER(name) = LOWER(?)) DESC, name ASC
     LIMIT 1`,
    [reason, reason, reason, reason]
  );

  return rows[0] || null;
}

function parseDateParts(appointmentDate) {
  const m = String(appointmentDate || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

function parseTimeParts(appointmentTime) {
  const m = String(appointmentTime || '').trim().match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!m) return null;
  return { hh: Number(m[1]), mm: Number(m[2]), ss: Number(m[3] || 0) };
}

function parseTimePartsFlexible(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { hh: value.getUTCHours(), mm: value.getUTCMinutes(), ss: value.getUTCSeconds() };
  }
  return parseTimeParts(String(value));
}

function clinicLocalToUtcDate({ year, month, day, hh, mm, ss }) {
  // Clinic is Philippines (UTC+8). Store UTC in DB.
  return new Date(Date.UTC(year, month - 1, day, hh - 8, mm, ss || 0, 0));
}

function clinicLocalDayBoundsToUtc(dateKey) {
  const parts = parseDateParts(dateKey);
  if (!parts) return null;
  const start = clinicLocalToUtcDate({ ...parts, hh: 0, mm: 0, ss: 0 });
  const end = clinicLocalToUtcDate({ ...parts, hh: 24, mm: 0, ss: 0 });
  return { start, end, parts };
}

function clinicSlotTimes() {
  // Mirror the website’s UI slots.
  return [
    '10:00:00',
    '10:30:00',
    '11:00:00',
    '11:30:00',
    '12:00:00',
    '13:30:00',
    '14:00:00',
    '14:30:00',
    '15:00:00',
    '15:30:00',
    '16:00:00',
    '16:30:00',
    '17:00:00',
    '17:30:00',
    '18:00:00',
    '18:30:00',
  ];
}

function toMinutesFrom12h({ hh, mm, period }) {
  let h = Number(hh);
  const m = Number(mm);
  const p = String(period || '').toUpperCase();
  if (p === 'PM' && h !== 12) h += 12;
  if (p === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function parseOperatingHoursToMinutes(operatingHours) {
  const raw = String(operatingHours || '').trim();
  const m = raw.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );
  if (!m) return null;
  const startMin = toMinutesFrom12h({ hh: m[1], mm: m[2], period: m[3] });
  const endMin = toMinutesFrom12h({ hh: m[4], mm: m[5], period: m[6] });
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin) || endMin <= startMin) return null;
  return { startMin, endMin };
}

function minutesToTimeString(min) {
  const hh = Math.floor(min / 60);
  const mm = min % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
}

function generateSlots30Min({ startMin, endMin }) {
  const slots = [];

  // Keep the legacy lunch gap to avoid surprising existing clients.
  // Still 30-minute intervals as required.
  const lunchStart = 12 * 60;
  const lunchEnd = 13 * 60 + 30;

  for (let t = startMin; t + 30 <= endMin; t += 30) {
    if (t >= lunchStart && t < lunchEnd) continue;
    slots.push(minutesToTimeString(t));
  }
  return slots;
}

function timeToMinutes(timeStr) {
  const t = parseTimePartsFlexible(timeStr);
  if (!t) return null;
  return t.hh * 60 + t.mm;
}

function weekdayForClinicDate(dateKey) {
  const parts = parseDateParts(dateKey);
  if (!parts) return null;
  // UTC midnight of the local date represents the local calendar date for weekday purposes here.
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

function alternateWeekday(weekday) {
  // Some databases store weekday as 1-7 (Sun=7) instead of 0-6 (Sun=0).
  if (weekday === 0) return 7;
  return weekday;
}

async function listAvailableSlots({ date, branch, serviceName }) {
  const bounds = clinicLocalDayBoundsToUtc(date);
  if (!bounds) {
    const err = new Error('date must be YYYY-MM-DD');
    err.statusCode = 400;
    throw err;
  }

  const branchId = await resolveBranchIdFromText(branch);
  if (!branchId) {
    const err = new Error('Invalid branch');
    err.statusCode = 400;
    throw err;
  }

  const service = await findServiceByReason(serviceName);
  if (!service) {
    const err = new Error('Invalid service');
    err.statusCode = 400;
    throw err;
  }

  const weekday = weekdayForClinicDate(date);
  const weekdayAlt = alternateWeekday(weekday);
  const isSunday = weekday === 0 || weekdayAlt === 7;

  const [branchRows] = await db.query(
    `SELECT operating_hours FROM branches WHERE id = ? LIMIT 1`,
    [branchId]
  );
  const parsedHours = parseOperatingHoursToMinutes(branchRows[0]?.operating_hours);
  const slotTimes = parsedHours ? generateSlots30Min(parsedHours) : clinicSlotTimes();

  let dentistRows = [];

  if (!isSunday) {
    // Use service.category to narrow dentists, then require the exact service_id for safety.
    const [rows] = await db.query(
      `SELECT DISTINCT u.id AS dentist_id, dsch.start_time, dsch.end_time
       FROM users u
       JOIN dentist_schedules dsch
         ON dsch.dentist_id = u.id
        AND dsch.branch_id = ?
        AND dsch.weekday IN (?, ?)
       JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
       JOIN services s ON s.id = dsv.service_id AND s.category = ?
       WHERE u.role = 'dentist' AND u.status = 'Active'
         AND NOT EXISTS (
           SELECT 1 FROM schedule_requests sr
           WHERE sr.dentist_id = u.id
             AND sr.request_type = 'leave'
             AND sr.status = 'approved'
             AND ? BETWEEN sr.date_from AND sr.date_to
         )`,
      [branchId, weekday, weekdayAlt, service.id, service.category, date]
    );
    dentistRows = rows;

    if (dentistRows.length === 0) {
      // Fallback: allow exact service match even if category strings differ in DB.
      const [fallbackRows] = await db.query(
        `SELECT DISTINCT u.id AS dentist_id, dsch.start_time, dsch.end_time
         FROM users u
         JOIN dentist_schedules dsch
           ON dsch.dentist_id = u.id
          AND dsch.branch_id = ?
          AND dsch.weekday IN (?, ?)
         JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
         WHERE u.role = 'dentist' AND u.status = 'Active'
           AND NOT EXISTS (
             SELECT 1 FROM schedule_requests sr
             WHERE sr.dentist_id = u.id
               AND sr.request_type = 'leave'
               AND sr.status = 'approved'
               AND ? BETWEEN sr.date_from AND sr.date_to
           )`,
        [branchId, weekday, weekdayAlt, service.id, date]
      );
      dentistRows = fallbackRows;
    }
  } else {
    // Sunday special: first-come, first-served across branches.
    // Any active dentist offering the service is eligible; conflicts are checked globally via appointments.
    const [rows] = await db.query(
      `SELECT DISTINCT u.id AS dentist_id
       FROM users u
       JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
       JOIN services s ON s.id = dsv.service_id AND s.category = ?
       WHERE u.role = 'dentist' AND u.status = 'Active'
         AND NOT EXISTS (
           SELECT 1 FROM schedule_requests sr
           WHERE sr.dentist_id = u.id
             AND sr.request_type = 'leave'
             AND sr.status = 'approved'
             AND ? BETWEEN sr.date_from AND sr.date_to
         )`,
      [service.id, service.category, date]
    );
    dentistRows = rows.map((r) => ({
      dentist_id: r.dentist_id,
      start_time: minutesToTimeString(parsedHours?.startMin ?? 10 * 60),
      end_time: minutesToTimeString(parsedHours?.endMin ?? 19 * 60),
    }));

    if (dentistRows.length === 0) {
      const [fallbackRows] = await db.query(
        `SELECT DISTINCT u.id AS dentist_id
         FROM users u
         JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
         WHERE u.role = 'dentist' AND u.status = 'Active'
           AND NOT EXISTS (
             SELECT 1 FROM schedule_requests sr
             WHERE sr.dentist_id = u.id
               AND sr.request_type = 'leave'
               AND sr.status = 'approved'
               AND ? BETWEEN sr.date_from AND sr.date_to
           )`,
        [service.id, date]
      );
      dentistRows = fallbackRows.map((r) => ({
        dentist_id: r.dentist_id,
        start_time: minutesToTimeString(parsedHours?.startMin ?? 10 * 60),
        end_time: minutesToTimeString(parsedHours?.endMin ?? 19 * 60),
      }));
    }
  }

  if (dentistRows.length === 0) return [];

  const dentistIds = dentistRows.map((r) => r.dentist_id);
  const placeholders = dentistIds.map(() => '?').join(',');

  const [apptRows] = await db.query(
    `SELECT a.dentist_id, a.start_time, a.duration_min, COALESCE(s.time_buffer_min, ?) AS time_buffer_min
     FROM appointments a
     LEFT JOIN services s ON s.id = a.service_id
     WHERE dentist_id IN (${placeholders})
       AND status IN ('scheduled','arrived')
       AND start_time >= ? AND start_time < ?`,
    [APPOINTMENT_BUFFER_MINUTES, ...dentistIds, toMySQLDateTime(bounds.start), toMySQLDateTime(bounds.end)]
  );

  // Availability rule for website UI:
  // - Block overlaps using existing appointment duration + buffer (prevents double-booking)
  // - Do NOT require the selected service to "fit" within the dentist's schedule end time
  const busyByDentist = {};
  for (const id of dentistIds) busyByDentist[id] = [];
  for (const a of apptRows) {
    const startMs = new Date(a.start_time).getTime();
    const endMs =
      startMs +
      (Number(a.duration_min || 30) + Number(a.time_buffer_min || APPOINTMENT_BUFFER_MINUTES)) * 60 * 1000;
    busyByDentist[a.dentist_id]?.push({ startMs, endMs });
  }

  const serviceBufferMin = Number.isFinite(Number(service.time_buffer_min))
    ? Number(service.time_buffer_min)
    : APPOINTMENT_BUFFER_MINUTES;
  const requiredMinutes = Number(service.duration_min || 30) + serviceBufferMin;

  const result = [];
  for (const slot of slotTimes) {
    const slotMinutes = timeToMinutes(slot);
    if (slotMinutes === null) continue;

    const slotStartUtc = clinicLocalToUtcDate({ ...bounds.parts, ...parseTimeParts(slot) });
    const slotStartMs = slotStartUtc.getTime();
    const slotEndMs = slotStartMs + requiredMinutes * 60 * 1000;

    let hasDentist = false;
    for (const d of dentistRows) {
      const schedStartMin = timeToMinutes(String(d.start_time));
      const schedEndMin = timeToMinutes(String(d.end_time));
      if (schedStartMin === null || schedEndMin === null) continue;

      // Must start within dentist schedule window (in local minutes)
      if (slotMinutes < schedStartMin) continue;
      if (slotMinutes >= schedEndMin) continue;

      const busy = busyByDentist[d.dentist_id] || [];
      const overlaps = busy.some((b) => slotStartMs < b.endMs && slotEndMs > b.startMs);
      if (!overlaps) {
        hasDentist = true;
        break;
      }
    }

    if (hasDentist) result.push(slot);
  }

  return result;
}

function parseMonthKey(month) {
  const m = String(month || '').trim().match(/^(\d{4})-(\d{2})$/);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]) };
}

async function listAvailableDays({ month, branch, serviceName }) {
  const monthParts = parseMonthKey(month);
  if (!monthParts) {
    const err = new Error('month must be YYYY-MM');
    err.statusCode = 400;
    throw err;
  }

  const { year, month: mo } = monthParts;
  const first = new Date(year, mo - 1, 1);
  const next = new Date(year, mo, 1);
  const lastDay = new Date(next.getTime() - 24 * 60 * 60 * 1000).getDate();

  const branchId = await resolveBranchIdFromText(branch);
  if (!branchId) {
    const err = new Error('Invalid branch');
    err.statusCode = 400;
    throw err;
  }

  const service = await findServiceByReason(serviceName);
  if (!service) {
    const err = new Error('Invalid service');
    err.statusCode = 400;
    throw err;
  }

  const days = [];
  for (let day = 1; day <= lastDay; day += 1) {
    const dateKey = `${year}-${String(mo).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekday = weekdayForClinicDate(dateKey);
    const weekdayAlt = alternateWeekday(weekday);
    const isSunday = weekday === 0 || weekdayAlt === 7;

    if (isSunday) {
      // Sunday special: dentists are first-come-first-served across branches.
      // Enable the date if at least one active dentist offers the service.
      const [rows] = await db.query(
        `SELECT 1
         FROM users u
         JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
         WHERE u.role = 'dentist' AND u.status = 'Active'
           AND NOT EXISTS (
             SELECT 1 FROM schedule_requests sr
             WHERE sr.dentist_id = u.id
               AND sr.request_type = 'leave'
               AND sr.status = 'approved'
               AND ? BETWEEN sr.date_from AND sr.date_to
           )
         LIMIT 1`,
        [service.id, dateKey]
      );
      if (rows.length > 0) days.push(dateKey);
      continue;
    }

    // Weekdays/ Saturdays: enable the date if at least one dentist offering the service
    // is scheduled in the selected branch for that weekday.
    let [rows] = await db.query(
      `SELECT 1
       FROM users u
       JOIN dentist_schedules dsch
         ON dsch.dentist_id = u.id
        AND dsch.branch_id = ?
        AND dsch.weekday IN (?, ?)
       JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
       JOIN services s ON s.id = dsv.service_id AND s.category = ?
       WHERE u.role = 'dentist' AND u.status = 'Active'
         AND NOT EXISTS (
           SELECT 1 FROM schedule_requests sr
           WHERE sr.dentist_id = u.id
             AND sr.request_type = 'leave'
             AND sr.status = 'approved'
             AND ? BETWEEN sr.date_from AND sr.date_to
         )
       LIMIT 1`,
      [branchId, weekday, weekdayAlt, service.id, service.category, dateKey]
    );

    if (rows.length === 0) {
      // Fallback: allow exact service match even if category strings differ.
      [rows] = await db.query(
        `SELECT 1
         FROM users u
         JOIN dentist_schedules dsch
           ON dsch.dentist_id = u.id
          AND dsch.branch_id = ?
          AND dsch.weekday IN (?, ?)
         JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
         WHERE u.role = 'dentist' AND u.status = 'Active'
           AND NOT EXISTS (
             SELECT 1 FROM schedule_requests sr
             WHERE sr.dentist_id = u.id
               AND sr.request_type = 'leave'
               AND sr.status = 'approved'
               AND ? BETWEEN sr.date_from AND sr.date_to
           )
         LIMIT 1`,
        [branchId, weekday, weekdayAlt, service.id, dateKey]
      );
    }

    if (rows.length > 0) days.push(dateKey);
  }
  return days;
}

async function autoBookAppointment(appointmentData) {
  const {
    appointmentDate,
    appointmentTime,
    durationMinutes,
    fullName,
    email,
    phoneNumber,
    location,
    reasonForBooking,
  } = appointmentData || {};

  const dateParts = parseDateParts(appointmentDate);
  const timeParts = parseTimeParts(appointmentTime);
  if (!dateParts || !timeParts) {
    const err = new Error('Invalid appointment date/time.');
    err.statusCode = 400;
    throw err;
  }

  const branchId = await resolveBranchIdFromText(location);
  if (!branchId) {
    const err = new Error('Invalid branch location.');
    err.statusCode = 400;
    throw err;
  }

  const service = await findServiceByReason(reasonForBooking);
  if (!service) {
    const err = new Error('Invalid service. Please pick a valid reason for booking.');
    err.statusCode = 400;
    throw err;
  }

  const patientId = await getOrCreateWebsitePatient({
    fullName,
    email,
    phoneNumber,
    homeBranchId: branchId,
  });

  // Validate requested slot against the same logic used by the website UI
  // (branch + service dentist matching, operating hours, and global dentist conflicts).
  const uiSlots = await listAvailableSlots({
    date: appointmentDate,
    branch: location,
    serviceName: reasonForBooking,
  });
  const wantedKey = String(appointmentTime).slice(0, 5);
  const allowed = Array.isArray(uiSlots) && uiSlots.some((s) => String(s).slice(0, 5) === wantedKey);
  if (!allowed) {
    const err = new Error('No available dentist for the selected service and time.');
    err.statusCode = 409;
    throw err;
  }

  // Prevent duplicate active bookings for the same email + reason(service)
  const [dupActive] = await db.query(
    `SELECT 1
     FROM appointments a
     JOIN users u ON u.id = a.patient_id
     WHERE LOWER(u.email) = LOWER(?)
       AND a.service_id = ?
       AND a.status IN ('scheduled','arrived')
     LIMIT 1`,
    [normalizeEmail(email), service.id]
  );
  if (dupActive.length > 0) {
    const err = new Error('DUPLICATE_ACTIVE_REASON');
    err.statusCode = 409;
    throw err;
  }

  const startUtc = clinicLocalToUtcDate({ ...dateParts, ...timeParts });
  const serviceBufferMin = Number.isFinite(Number(service.time_buffer_min))
    ? Number(service.time_buffer_min)
    : APPOINTMENT_BUFFER_MINUTES;
  const blockedEndUtc = new Date(startUtc.getTime() + (Number(service.duration_min || 30) + serviceBufferMin) * 60 * 1000);

  const weekday = new Date(Date.UTC(dateParts.year, dateParts.month - 1, dateParts.day)).getUTCDay();
  const weekdayAlt = alternateWeekday(weekday);
  const isSunday = weekday === 0 || weekdayAlt === 7;

  const [candidateRows] = await db.query(
    isSunday
      ? `SELECT DISTINCT u.id
         FROM users u
         JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
         JOIN services s ON s.id = dsv.service_id AND s.category = ?
         WHERE u.role = 'dentist'
           AND u.status = 'Active'
           AND NOT EXISTS (
             SELECT 1 FROM schedule_requests sr
             WHERE sr.dentist_id = u.id
               AND sr.request_type = 'leave'
               AND sr.status = 'approved'
               AND ? BETWEEN sr.date_from AND sr.date_to
           )
         ORDER BY u.id ASC`
      : `SELECT DISTINCT u.id
         FROM users u
         JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
         JOIN dentist_schedules dsch ON dsch.dentist_id = u.id AND dsch.branch_id = ? AND dsch.weekday IN (?, ?)
         JOIN services s ON s.id = dsv.service_id AND s.category = ?
         WHERE u.role = 'dentist'
           AND u.status = 'Active'
           AND NOT EXISTS (
             SELECT 1 FROM schedule_requests sr
             WHERE sr.dentist_id = u.id
               AND sr.request_type = 'leave'
               AND sr.status = 'approved'
               AND ? BETWEEN sr.date_from AND sr.date_to
           )
         ORDER BY u.id ASC`,
    isSunday
      ? [service.id, service.category, appointmentDate]
      : [service.id, branchId, weekday, weekdayAlt, service.category, appointmentDate]
  );

  let dentistCandidates = candidateRows;
  if (dentistCandidates.length === 0) {
    const [fallbackCandidates] = await db.query(
      isSunday
        ? `SELECT DISTINCT u.id
           FROM users u
           JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
           WHERE u.role = 'dentist'
             AND u.status = 'Active'
             AND NOT EXISTS (
               SELECT 1 FROM schedule_requests sr
               WHERE sr.dentist_id = u.id
                 AND sr.request_type = 'leave'
                 AND sr.status = 'approved'
                 AND ? BETWEEN sr.date_from AND sr.date_to
             )
           ORDER BY u.id ASC`
        : `SELECT DISTINCT u.id
           FROM users u
           JOIN dentist_services dsv ON dsv.dentist_id = u.id AND dsv.service_id = ?
           JOIN dentist_schedules dsch ON dsch.dentist_id = u.id AND dsch.branch_id = ? AND dsch.weekday IN (?, ?)
           WHERE u.role = 'dentist'
             AND u.status = 'Active'
             AND NOT EXISTS (
               SELECT 1 FROM schedule_requests sr
               WHERE sr.dentist_id = u.id
                 AND sr.request_type = 'leave'
                 AND sr.status = 'approved'
                 AND ? BETWEEN sr.date_from AND sr.date_to
             )
           ORDER BY u.id ASC`,
      isSunday ? [service.id, appointmentDate] : [service.id, branchId, weekday, weekdayAlt, appointmentDate]
    );
    dentistCandidates = fallbackCandidates;
  }

  // Branch-wide rule: block overlapping windows across the branch.
  const [branchSlotConflicts] = await db.query(
    `SELECT a.id
     FROM appointments a
     LEFT JOIN services s ON s.id = a.service_id
     WHERE a.branch_id = ?
       AND a.status IN ('scheduled','arrived')
       AND a.start_time < ?
       AND TIMESTAMPADD(MINUTE, a.duration_min + COALESCE(s.time_buffer_min, ?), a.start_time) > ?
     LIMIT 1`,
    [
      branchId,
      toMySQLDateTime(blockedEndUtc),
      APPOINTMENT_BUFFER_MINUTES,
      toMySQLDateTime(startUtc),
    ]
  );
  if (branchSlotConflicts.length > 0) {
    const err = new Error('This time slot is already taken at this branch.');
    err.statusCode = 409;
    throw err;
  }

  const availableDentists = [];
  for (const row of dentistCandidates) {
    const dentistId = row.id;
    const [conflicts] = await db.query(
      `SELECT a.id
       FROM appointments a
       LEFT JOIN services s ON s.id = a.service_id
       WHERE a.dentist_id = ?
         AND a.status IN ('scheduled','arrived')
         AND a.start_time < ?
         AND TIMESTAMPADD(MINUTE, a.duration_min + COALESCE(s.time_buffer_min, ?), a.start_time) > ?
       LIMIT 1`,
      [dentistId, toMySQLDateTime(blockedEndUtc), APPOINTMENT_BUFFER_MINUTES, toMySQLDateTime(startUtc)]
    );
    if (conflicts.length === 0) {
      availableDentists.push(dentistId);
    }
  }

  let selectedDentistId = null;
  if (availableDentists.length === 1) {
    selectedDentistId = availableDentists[0];
  } else if (availableDentists.length > 1) {
    // Round-robin-style tie-breaker: when multiple dentists are free for the exact
    // same service + branch + datetime, rotate deterministically by slot key.
    const sorted = availableDentists.slice().sort((a, b) => Number(a) - Number(b));
    const rrKey = `${branchId || ''}:${service.id || ''}:${appointmentDate}:${appointmentTime}`;
    selectedDentistId = sorted[hash32FNV1a(rrKey) % sorted.length];
  }

  if (!selectedDentistId) {
    const err = new Error('No available dentist for the selected service and time.');
    err.statusCode = 409;
    throw err;
  }

  // Ensure no duplicate appointment for the same patient + time + branch
  const [existing] = await db.query(
    `SELECT id
     FROM appointments
     WHERE branch_id = ? AND patient_id = ?
       AND start_time = ?
       AND status IN ('scheduled','arrived','completed')
     LIMIT 1`,
    [branchId, patientId, toMySQLDateTime(startUtc)]
  );
  if (existing.length > 0) {
    throw new Error('APPOINTMENT_ALREADY_EXISTS');
  }

  const [result] = await db.query(
    `INSERT INTO appointments (branch_id, patient_id, dentist_id, service_id, start_time, duration_min, status, dentist_note)
     VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
    [
      branchId,
      patientId,
      selectedDentistId,
      service.id,
      toMySQLDateTime(startUtc),
      service.duration_min || Number(durationMinutes) || 30,
      reasonForBooking ? `Website reason: ${String(reasonForBooking).trim()}` : null,
    ]
  );

  // Log to online_appointments_tbl as Converted (optional) without blocking timeslots.
  try {
    const [onlineResult] = await db.query(
      `INSERT INTO online_appointments_tbl (
        appointment_date, appointment_time, duration_minutes, full_name, email, phone_number, location, reason_for_booking, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Converted', NOW())`,
      [
        appointmentDate,
        appointmentTime,
        service.duration_min || Number(durationMinutes) || 30,
        fullName,
        email || null,
        phoneNumber,
        location,
        reasonForBooking || null,
      ]
    );

    // best-effort: store dentist assignment if column exists
    if (await onlineAppointmentsHasAssignedDentistId()) {
      await db.query('UPDATE online_appointments_tbl SET assigned_dentist_id = ? WHERE id = ?', [
        selectedDentistId,
        onlineResult.insertId,
      ]);
    }
  } catch (_) {
    // ignore if online table doesn't exist in a local/dev DB
  }

  await notifyBranchReceptionists(branchId, {
    type: 'Appointment',
    title: 'New Website Appointment',
    body: `${fullName} booked ${service.name} on ${appointmentDate} at ${appointmentTime}.`,
    relatedType: 'appointment',
    relatedId: result.insertId,
  });

  return { appointmentId: result.insertId, dentistId: selectedDentistId, serviceId: service.id };
}

async function assignDentist(appointmentId, reasonForBooking, location) {
  if (!reasonForBooking || !location) return;
  if (!(await onlineAppointmentsHasAssignedDentistId())) return;
  try {
    const [rows] = await db.query(
      `SELECT ds.dentist_id
       FROM services s
       JOIN dentist_services ds ON ds.service_id = s.id
       JOIN user_branches ub ON ub.user_id = ds.dentist_id
       JOIN branches b ON b.id = ub.branch_id
       JOIN users u ON u.id = ds.dentist_id
       WHERE (
         LOWER(s.name) = LOWER(?)
         OR LOWER(s.name) LIKE CONCAT('%', LOWER(?), '%')
         OR LOWER(?) LIKE CONCAT('%', LOWER(s.name), '%')
       )
       AND b.address = TRIM(REPLACE(?, ' Branch', ''))
       AND u.status = 'Active'
       ORDER BY (LOWER(s.name) = LOWER(?)) DESC
       LIMIT 1`,
      [reasonForBooking, reasonForBooking, reasonForBooking, location, reasonForBooking]
    );
    if (rows.length > 0) {
      await db.query(
        'UPDATE online_appointments_tbl SET assigned_dentist_id = ? WHERE id = ?',
        [rows[0].dentist_id, appointmentId]
      );
    }
  } catch (_) {
    // best-effort; never fail the appointment save
  }
}

async function saveAppointment(appointmentData) {
  const {
    appointmentDate,
    appointmentTime,
    durationMinutes,
    fullName,
    email,
    phoneNumber,
    location,
    reasonForBooking
  } = appointmentData;

  const [existing] = await db.query(
    `SELECT id
     FROM online_appointments_tbl
     WHERE appointment_date = ?
       AND appointment_time = ?
       AND full_name = ?
       AND phone_number = ?
     LIMIT 1`,
    [appointmentDate, appointmentTime, fullName, phoneNumber]
  );

  if (existing.length > 0) {
    throw new Error('APPOINTMENT_ALREADY_EXISTS');
  }

  const [result] = await db.query(
    `INSERT INTO online_appointments_tbl (
      appointment_date,
      appointment_time,
      duration_minutes,
      full_name,
      email,
      phone_number,
      location,
      reason_for_booking,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
    [
      appointmentDate,
      appointmentTime,
      durationMinutes || 30,
      fullName,
      email || null,
      phoneNumber,
      location,
      reasonForBooking || null
    ]
  );

  const branchId = await resolveBranchIdFromText(location);
  await notifyBranchReceptionists(branchId, {
    type: 'Appointment',
    title: 'New Appointment Request',
    body: `${fullName} requested an appointment on ${appointmentDate} at ${appointmentTime}.`,
    relatedType: 'appointment',
    relatedId: result.insertId,
  });

  await assignDentist(result.insertId, reasonForBooking, location);

  return result;
}

async function saveInquiry(inquiryData) {
  const {
    fullName,
    emailAddress,
    phoneNumber,
    branch,
    concern,
    message
  } = inquiryData;

  const [existing] = await db.query(
    `SELECT id
     FROM online_inquiries_tbl
     WHERE full_name = ?
       AND email_address = ?
       AND phone_number = ?
       AND branch = ?
       AND concern = ?
     LIMIT 1`,
    [fullName, emailAddress, phoneNumber, branch, concern]
  );

  if (existing.length > 0) {
    throw new Error('INQUIRY_ALREADY_EXISTS');
  }

  const [result] = await db.query(
    `INSERT INTO online_inquiries_tbl (
      full_name,
      email_address,
      phone_number,
      branch,
      concern,
      message,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      fullName,
      emailAddress,
      phoneNumber,
      branch,
      concern,
      message
    ]
  );

  const inquiryId = result.insertId;

  const branchId = await resolveBranchIdFromText(branch);
  await notifyBranchReceptionists(branchId, {
    type: 'Inquiry',
    title: 'New Online Inquiry',
    body: `${fullName} sent an inquiry for ${branch} about ${concern}.`,
    relatedType: 'inquiry',
    relatedId: inquiryId,
  });

  return result;
}

async function listAppointments({ search = '', status = '', branchNames = null } = {}) {
  if (branchNames !== null && branchNames.length === 0) return [];

  const hasAssigned = await onlineAppointmentsHasAssignedDentistId();

  let sql = `
    SELECT
      o.*,
      ${hasAssigned ? 'u.name' : 'NULL'} AS assigned_dentist_name
    FROM online_appointments_tbl o
    ${hasAssigned ? 'LEFT JOIN users u ON u.id = o.assigned_dentist_id' : ''}
    WHERE 1 = 1
  `;

  const params = [];

  if (branchNames && branchNames.length > 0) {
    sql += ` AND TRIM(REPLACE(o.location, ' Branch', '')) IN (${branchNames.map(() => '?').join(',')})`;
    params.push(...branchNames);
  }

  if (search) {
    sql += `
      AND (
        o.full_name LIKE ?
        OR o.email LIKE ?
        OR o.phone_number LIKE ?
        OR o.location LIKE ?
      )
    `;

    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  if (status) {
    sql += ' AND o.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY o.created_at DESC';

  const [rows] = await db.query(sql, params);

  return rows;
}

async function getBookedSlots(date, branch) {
  // Website online appointments for this date + branch
  const [onlineRows] = await db.query(
    `SELECT
       TIME_FORMAT(appointment_time, '%H:%i:%s') AS booked_time,
       duration_minutes
     FROM online_appointments_tbl
     WHERE appointment_date = ? AND location = ? AND status IN ('Pending','Confirmed')`,
    [date, branch]
  );

  // Shared appointments table (web walk-ins, mobile bookings)
  // branch param is e.g. "Makati Branch" — strip " Branch" to match branches.address ("Makati")
  const [apptRows] = await db.query(
    `SELECT
       TIME_FORMAT(TIME(a.start_time), '%H:%i:%s') AS booked_time,
       a.duration_min,
       COALESCE(s.time_buffer_min, ?) AS time_buffer_min
     FROM appointments a
     LEFT JOIN services s ON s.id = a.service_id
     JOIN branches b ON a.branch_id = b.id
     WHERE DATE(a.start_time) = ?
       AND b.address = TRIM(REPLACE(?, ' Branch', ''))
       AND a.status IN ('scheduled', 'arrived')`,
    [APPOINTMENT_BUFFER_MINUTES, date, branch]
  );

  // Operating hours for this branch
  const [branchRows] = await db.query(
    `SELECT operating_hours FROM branches WHERE address = TRIM(REPLACE(?, ' Branch', '')) LIMIT 1`,
    [branch]
  );

  const slotSet = new Set();
  const stepMinutes = 30;
  function addSlotSpan(timeText, durationMinutes, bufferMinutes = APPOINTMENT_BUFFER_MINUTES) {
    const match = String(timeText || '').match(/^(\d{2}):(\d{2})/);
    if (!match) return;

    const baseMinutes = Number(match[1]) * 60 + Number(match[2]);
    const span = Math.max(stepMinutes, Number(durationMinutes) || stepMinutes) + bufferMinutes;
    for (let minutes = 0; minutes < span; minutes += stepMinutes) {
      const current = baseMinutes + minutes;
      const hh = String(Math.floor(current / 60)).padStart(2, '0');
      const mm = String(current % 60).padStart(2, '0');
      slotSet.add(`${hh}:${mm}:00`);
    }
  }

  onlineRows.forEach((row) => addSlotSpan(row.booked_time, row.duration_minutes));
  apptRows.forEach((row) => addSlotSpan(row.booked_time, row.duration_min, row.time_buffer_min));

  const bookedSlots = Array.from(slotSet).sort();

  return {
    bookedSlots,
    operatingHours: branchRows[0]?.operating_hours || null
  };
}

async function updateAppointmentStatus(id, status) {
  const [result] = await db.query(
    `UPDATE online_appointments_tbl
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return result;
}

async function getBranchNamesByIds(branchIds) {
  if (!branchIds || branchIds.length === 0) return [];
  const [rows] = await db.query(
    `SELECT address FROM branches WHERE id IN (${branchIds.map(() => '?').join(',')})`,
    branchIds
  );
  return rows.map(r => r.address).filter(Boolean);
}

async function getInquiryById(id) {
  const [rows] = await db.query(
    'SELECT * FROM online_inquiries_tbl WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function saveInquiryReply(inquiryId, { replyMessage, repliedBy, sentToEmail }) {
  const [result] = await db.query(
    `INSERT INTO inquiry_replies (inquiry_id, replied_by, reply_message, sent_to_email, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [inquiryId, repliedBy, replyMessage, sentToEmail]
  );
  return result.insertId;
}

async function getInquiryReplies(inquiryId) {
  const [rows] = await db.query(
    `SELECT ir.id, ir.inquiry_id, ir.reply_message, ir.sent_to_email, ir.created_at,
            u.name AS replied_by_name
     FROM inquiry_replies ir
     JOIN users u ON u.id = ir.replied_by
     WHERE ir.inquiry_id = ?
     ORDER BY ir.created_at ASC`,
    [inquiryId]
  );
  return rows;
}

async function listInquiries({ search = '', branchNames = [] } = {}) {
  if (branchNames.length === 0) return [];

  let sql = `
    SELECT oi.*,
      (SELECT COUNT(*) FROM inquiry_replies ir WHERE ir.inquiry_id = oi.id) AS reply_count,
      (SELECT MAX(ir.created_at) FROM inquiry_replies ir WHERE ir.inquiry_id = oi.id) AS last_replied_at
    FROM online_inquiries_tbl oi
    WHERE oi.branch IN (${branchNames.map(() => '?').join(',')})
  `;

  const params = [...branchNames];

  if (search) {
    sql += `
      AND (
        oi.full_name LIKE ?
        OR oi.email_address LIKE ?
        OR oi.phone_number LIKE ?
        OR oi.branch LIKE ?
        OR oi.concern LIKE ?
      )
    `;

    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }

  sql += ' ORDER BY oi.created_at DESC';

  const [rows] = await db.query(sql, params);

  return rows;
}

// ── Website CMS ──────────────────────────────────────────────────────────────

async function getContent() {
  const [rows] = await db.query('SELECT section, field_key, field_value FROM website_content ORDER BY section, id');
  const map = {};
  for (const r of rows) {
    const k = `${r.section}_${r.field_key}`;
    map[k] = r.field_value;
  }
  return map;
}

async function upsertContent(fields) {
  for (const [key, value] of Object.entries(fields)) {
    const sep = key.indexOf('_');
    if (sep < 1) continue;
    const section = key.slice(0, sep);
    const field_key = key.slice(sep + 1);
    await db.query(
      `INSERT INTO website_content (section, field_key, field_value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE field_value = VALUES(field_value)`,
      [section, field_key, value]
    );
  }
}

async function listFaqs({ all = false } = {}) {
  const sql = all
    ? 'SELECT * FROM website_faqs ORDER BY sort_order ASC, id ASC'
    : "SELECT * FROM website_faqs WHERE status = 'active' ORDER BY sort_order ASC, id ASC";
  const [rows] = await db.query(sql);
  return rows;
}

async function createFaq({ question, answer, sort_order = 0, status = 'active' }) {
  const [result] = await db.query(
    'INSERT INTO website_faqs (question, answer, sort_order, status) VALUES (?, ?, ?, ?)',
    [question, answer, sort_order, status]
  );
  return result.insertId;
}

async function updateFaq(id, { question, answer, sort_order, status }) {
  await db.query(
    'UPDATE website_faqs SET question = ?, answer = ?, sort_order = ?, status = ? WHERE id = ?',
    [question, answer, sort_order ?? 0, status ?? 'active', id]
  );
}

async function deleteFaq(id) {
  await db.query('DELETE FROM website_faqs WHERE id = ?', [id]);
}

async function listWebsiteServices({ all = false } = {}) {
  const sql = all
    ? 'SELECT * FROM website_services ORDER BY sort_order ASC, id ASC'
    : "SELECT * FROM website_services WHERE status = 'active' ORDER BY sort_order ASC, id ASC";
  const [rows] = await db.query(sql);
  return rows;
}

async function createWebsiteService({ name, image_path, description, slug, sort_order = 0, status = 'active' }) {
  const [result] = await db.query(
    'INSERT INTO website_services (name, image_path, description, slug, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, image_path || null, description || null, slug || null, sort_order, status]
  );
  return result.insertId;
}

async function updateWebsiteService(id, { name, image_path, description, slug, sort_order, status }) {
  await db.query(
    'UPDATE website_services SET name = ?, image_path = ?, description = ?, slug = ?, sort_order = ?, status = ? WHERE id = ?',
    [name, image_path || null, description || null, slug || null, sort_order ?? 0, status ?? 'active', id]
  );
}

async function deleteWebsiteService(id) {
  await db.query('DELETE FROM website_services WHERE id = ?', [id]);
}

async function listAnnouncements({ all = false } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  let sql, params;
  if (all) {
    sql = 'SELECT * FROM website_announcements ORDER BY created_at DESC';
    params = [];
  } else {
    sql = `SELECT * FROM website_announcements
           WHERE status = 'active'
             AND (start_date IS NULL OR start_date <= ?)
             AND (end_date IS NULL OR end_date >= ?)
           ORDER BY created_at DESC`;
    params = [today, today];
  }
  const [rows] = await db.query(sql, params);
  return rows;
}

async function createAnnouncement({ title, message, start_date, end_date, status = 'active' }) {
  const [result] = await db.query(
    'INSERT INTO website_announcements (title, message, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
    [title, message, start_date || null, end_date || null, status]
  );
  return result.insertId;
}

async function updateAnnouncement(id, { title, message, start_date, end_date, status }) {
  await db.query(
    'UPDATE website_announcements SET title = ?, message = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
    [title, message, start_date || null, end_date || null, status ?? 'active', id]
  );
}

async function deleteAnnouncement(id) {
  await db.query('DELETE FROM website_announcements WHERE id = ?', [id]);
}

module.exports = {
  saveAppointment,
  autoBookAppointment,
  saveInquiry,
  listAppointments,
  getBookedSlots,
  updateAppointmentStatus,
  getBranchNamesByIds,
  getInquiryById,
  saveInquiryReply,
  getInquiryReplies,
  listInquiries,
  listClinicServices,
  listAvailableSlots,
  listAvailableDays,
  getContent,
  upsertContent,
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  listWebsiteServices,
  createWebsiteService,
  updateWebsiteService,
  deleteWebsiteService,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
