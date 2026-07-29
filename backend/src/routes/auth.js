const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshTokenHash,
  refreshTokenExpiryString,
} = require('../utils/tokens');
const { toMySQLDateTime } = require('../utils/dates');
const { generateOTP, hashOTP, verifyOTPHash, otpExpiryDate } = require('../utils/otp');
const { sendOTPEmail, sendTempPasswordEmail } = require('../services/email');
const { authenticate, requireRole } = require('../middleware/auth');
const { parseDeviceBrowser } = require('../utils/deviceParser');

const router = express.Router();
const RESET_PASSWORD_MAX_OTP_ATTEMPTS = 3;
const RESET_PASSWORD_MAX_RESENDS = 3;
const RESET_PASSWORD_COOLDOWN_MINUTES = 10;
const ADMIN_REGISTER_MAX_OTP_ATTEMPTS = 3;
const ADMIN_REGISTER_MAX_RESENDS = 3;
const ADMIN_REGISTER_COOLDOWN_MINUTES = 10;

function resetPasswordCooldownMessage() {
  return 'Too many failed attempts. Please wait 10 minutes before trying to reset your password again.';
}

function adminRegisterCooldownMessage() {
  return 'Too many failed attempts. Please wait 10 minutes before trying to register an admin account again.';
}

async function loadUserBranches(userId) {
  const [permanent] = await pool.query(
    'SELECT branch_id FROM user_branches WHERE user_id = ?',
    [userId]
  );
  const [granted] = await pool.query(
    'SELECT branch_id FROM access_grants WHERE user_id = ? AND expires_at > NOW()',
    [userId]
  );
  return [...new Set([
    ...permanent.map((r) => r.branch_id),
    ...granted.map((r) => r.branch_id),
  ])];
}

function formatMysqlDate(value) {
  if (!value) return null;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value).split('T')[0];
}

function mapStaffProfileRow(row) {
  return {
    id: `E-${String(row.id).padStart(4, '0')}`,
    profileId: row.id,
    userId: row.user_id,
    branchId: row.branch_id,
    branchName: row.branch_name,
    branchAddress: row.branch_address,
    role: row.staff_type,
    lastName: row.last_name,
    firstName: row.first_name,
    middleName: row.middle_name || '',
    nickname: row.nickname || '',
    suffix: row.suffix || '',
    birthday: formatMysqlDate(row.birthday),
    age: row.age || '',
    gender: row.gender || '',
    civilStatus: row.civil_status || '',
    religion: row.religion || '',
    nationality: row.nationality || '',
    homeAddress: row.home_address || '',
    contactNumber: row.contact_number || '',
    email: row.email || '',
    position: row.position || row.staff_type,
    specialization: row.specialization || '',
    workDepartment: row.work_department || '',
    serviceNames: row.service_names || '',
    medicalDegree: row.medical_degree || '',
    licenseNumber: row.license_number || '',
    yearsExperience: row.years_experience || 0,
    skills: row.skills || '',
    startDate: formatMysqlDate(row.start_date),
    employmentType: row.employment_type || '',
    shiftType: row.shift_type || '',
    workDays: row.work_days || '',
    workStartTime: row.work_start_time || '',
    workEndTime: row.work_end_time || '',
    accessRole: row.user_role
      ? row.user_role === 'dentist'
        ? 'Dentist'
        : 'Receptionist'
      : 'No Web Access',
    status: row.status || 'Active',
  };
}

async function loadDentistScheduleEntriesByDentistIds(dentistIds = []) {
  const ids = (Array.isArray(dentistIds) ? dentistIds : [])
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (ids.length === 0) return new Map();

  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT
       ds.dentist_id,
       ds.branch_id,
       b.name AS branch_name,
       b.address AS branch_address,
       ds.weekday,
       ds.start_time,
       ds.end_time
     FROM dentist_schedules ds
     LEFT JOIN branches b ON b.id = ds.branch_id
     WHERE ds.dentist_id IN (${placeholders})
     ORDER BY ds.dentist_id ASC, ds.weekday ASC, ds.branch_id ASC`,
    ids
  );

  const byDentist = new Map();
  for (const row of rows) {
    const dentistId = Number(row.dentist_id);
    if (!byDentist.has(dentistId)) byDentist.set(dentistId, []);
    byDentist.get(dentistId).push({
      branch_id: Number(row.branch_id),
      branch_name: row.branch_name || null,
      branch_address: row.branch_address || null,
      weekday: Number(row.weekday),
      start_time: row.start_time ? String(row.start_time).slice(0, 8) : null,
      end_time: row.end_time ? String(row.end_time).slice(0, 8) : null,
    });
  }

  return byDentist;
}

async function replaceDentistSchedules(dentistId, scheduleEntries = []) {
  const id = Number(dentistId);
  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error('Invalid dentist id');
    err.statusCode = 400;
    throw err;
  }

  const entries = Array.isArray(scheduleEntries) ? scheduleEntries : [];
  const cleaned = [];

  for (const entry of entries) {
    const branchId = Number(entry?.branch_id);
    const weekday = Number(entry?.weekday);
    const startTime = entry?.start_time ? String(entry.start_time).slice(0, 8) : null;
    const endTime = entry?.end_time ? String(entry.end_time).slice(0, 8) : null;

    if (!Number.isInteger(branchId) || branchId <= 0) continue;
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) continue;
    if (!startTime || !endTime) continue;

    cleaned.push({ branchId, weekday, startTime, endTime });
  }

  if (entries.length > 0 && cleaned.length === 0) {
    const err = new Error('Invalid schedule_entries');
    err.statusCode = 400;
    throw err;
  }

  const [[dentist]] = await pool.query(
    'SELECT id, role, home_branch_id FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  if (!dentist || dentist.role !== 'dentist') {
    const err = new Error('Dentist not found');
    err.statusCode = 404;
    throw err;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM dentist_schedules WHERE dentist_id = ?', [id]);

    if (cleaned.length > 0) {
      await conn.query(
        `INSERT INTO dentist_schedules (dentist_id, branch_id, weekday, start_time, end_time)
         VALUES ${cleaned.map(() => '(?, ?, ?, ?, ?)').join(', ')}`,
        cleaned.flatMap((row) => [id, row.branchId, row.weekday, row.startTime, row.endTime])
      );

      const extraBranches = [...new Set(cleaned.map((row) => row.branchId))].filter(
        (b) => Number(b) !== Number(dentist.home_branch_id)
      );
      for (const branchId of extraBranches) {
        await conn.query(
          'INSERT IGNORE INTO user_branches (user_id, branch_id, is_primary) VALUES (?, ?, FALSE)',
          [id, branchId]
        );
      }
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

function normalizeScheduleEntry(entry) {
  const branchId = Number(entry?.branch_id ?? entry?.branchId);
  const weekday = Number(entry?.weekday);
  const startTime = entry?.start_time || entry?.startTime;
  const endTime = entry?.end_time || entry?.endTime;

  if (!Number.isInteger(branchId) || branchId <= 0) return null;
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return null;
  if (!startTime || !endTime) return null;

  return {
    branch_id: branchId,
    weekday,
    start_time: String(startTime).slice(0, 8),
    end_time: String(endTime).slice(0, 8),
  };
}

function formatScheduleLockDay(lock) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return dayNames[Number(lock.weekday)] || `weekday ${lock.weekday}`;
}

function schedulesForWeekday(entries, weekday) {
  return entries
    .map(normalizeScheduleEntry)
    .filter((entry) => entry && Number(entry.weekday) === Number(weekday))
    .map((entry) => `${entry.branch_id}|${entry.start_time}|${entry.end_time}`)
    .sort();
}

function sameScheduleList(a, b) {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

async function getDentistScheduleLocks(dentistId) {
  const [rows] = await pool.query(
    `SELECT
       a.branch_id,
       b.name AS branch_name,
       b.address AS branch_address,
       DAYOFWEEK(a.start_time) - 1 AS weekday,
       COUNT(*) AS appointment_count,
       MIN(a.start_time) AS next_appointment_at
     FROM appointments a
     JOIN branches b ON b.id = a.branch_id
     WHERE a.dentist_id = ?
       AND a.status IN ('scheduled', 'arrived')
     GROUP BY a.branch_id, b.name, b.address, DAYOFWEEK(a.start_time) - 1
     ORDER BY weekday ASC, b.name ASC`,
    [dentistId]
  );

  return rows.map((row) => ({
    branch_id: Number(row.branch_id),
    branch_name: row.branch_name || '',
    branch_address: row.branch_address || '',
    weekday: Number(row.weekday),
    day_name: formatScheduleLockDay(row),
    appointment_count: Number(row.appointment_count || 0),
    next_appointment_at: row.next_appointment_at || null,
  }));
}

async function assertDentistScheduleChangeAllowed(dentistId, nextScheduleEntries, nextBranchId, currentBranchId) {
  const locks = await getDentistScheduleLocks(dentistId);
  if (locks.length === 0) return;

  const normalizedNextBranchId = Number(nextBranchId || 0);
  const normalizedCurrentBranchId = Number(currentBranchId || 0);
  const hasCurrentBranchAppointments = locks.some(
    (lock) => Number(lock.branch_id) === normalizedCurrentBranchId
  );

  if (
    normalizedNextBranchId > 0 &&
    normalizedCurrentBranchId > 0 &&
    normalizedNextBranchId !== normalizedCurrentBranchId &&
    hasCurrentBranchAppointments
  ) {
    const branchLock = locks.find((lock) => Number(lock.branch_id) === normalizedCurrentBranchId);
    const branchName = branchLock?.branch_address || branchLock?.branch_name || 'the assigned branch';
    const err = new Error(
      `Assigned Branch cannot be changed because this dentist still has active appointments in ${branchName}. Complete or mark those appointments first.`
    );
    err.statusCode = 409;
    throw err;
  }

  if (!Array.isArray(nextScheduleEntries)) return;

  const [currentRows] = await pool.query(
    `SELECT branch_id, weekday, start_time, end_time
     FROM dentist_schedules
     WHERE dentist_id = ?`,
    [dentistId]
  );

  const lockedWeekdays = [...new Set(locks.map((lock) => Number(lock.weekday)))];
  const changedDays = lockedWeekdays.filter((weekday) => {
    const currentForDay = schedulesForWeekday(currentRows, weekday);
    const nextForDay = schedulesForWeekday(nextScheduleEntries, weekday);
    return !sameScheduleList(currentForDay, nextForDay);
  });

  if (changedDays.length > 0) {
    const labels = changedDays.map((weekday) => formatScheduleLockDay({ weekday })).join(', ');
    const err = new Error(
      `${labels} cannot be edited because this dentist has active appointments on ${changedDays.length === 1 ? 'that day' : 'those days'}. Complete or mark those appointments first.`
    );
    err.statusCode = 409;
    throw err;
  }
}

function extractCity(address) {
  if (!address) return null;
  const parts = String(address).split(',').map((p) => p.trim()).filter(Boolean);
  return parts[parts.length - 1] || null;
}

function normalizeNullable(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function normalizeInt(value, fallback = 0) {
  const text = normalizeNullable(value);
  if (text === null) return fallback;
  const parsed = Number.parseInt(text, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function staffPayloadToDb(payload = {}, { allowStatus = false } = {}) {
  const firstName = normalizeNullable(payload.first_name ?? payload.firstName);
  const lastName = normalizeNullable(payload.last_name ?? payload.lastName);

  return {
    branch_id: payload.branch_id ?? payload.branchId ?? null,
    first_name: firstName,
    middle_name: normalizeNullable(payload.middle_name ?? payload.middleName),
    last_name: lastName,
    nickname: normalizeNullable(payload.nickname),
    suffix: normalizeNullable(payload.suffix),
    birthday: normalizeNullable(payload.birthday),
    age: normalizeInt(payload.age, null),
    gender: normalizeNullable(payload.gender),
    civil_status: normalizeNullable(payload.civil_status ?? payload.civilStatus),
    religion: normalizeNullable(payload.religion),
    nationality: normalizeNullable(payload.nationality),
    home_address: normalizeNullable(payload.home_address ?? payload.homeAddress),
    contact_number: normalizeNullable(payload.contact_number ?? payload.contactNumber),
    email: normalizeNullable(payload.email),
    position: normalizeNullable(payload.position),
    specialization: normalizeNullable(payload.specialization),
    work_department: normalizeNullable(payload.work_department ?? payload.workDepartment),
    medical_degree: normalizeNullable(payload.medical_degree ?? payload.medicalDegree),
    license_number: normalizeNullable(payload.license_number ?? payload.licenseNumber),
    years_experience: normalizeInt(payload.years_experience ?? payload.yearsExperience, 0),
    skills: normalizeNullable(payload.skills),
    start_date: normalizeNullable(payload.start_date ?? payload.startDate),
    employment_type: normalizeNullable(payload.employment_type ?? payload.employmentType),
    shift_type: normalizeNullable(payload.shift_type ?? payload.shiftType),
    work_days: Array.isArray(payload.work_days)
      ? payload.work_days.join(', ')
      : normalizeNullable(payload.work_days ?? payload.workDays),
    work_start_time: normalizeNullable(payload.work_start_time ?? payload.workStartTime),
    work_end_time: normalizeNullable(payload.work_end_time ?? payload.workEndTime),
    status: allowStatus ? normalizeNullable(payload.status) : null,
  };
}

async function fetchStaffProfileBy(whereClause, params) {
  const [rows] = await pool.query(
    `SELECT
       sp.*,
       u.role AS user_role,
       b.name AS branch_name,
       b.address AS branch_address,
       GROUP_CONCAT(svc.name ORDER BY svc.name SEPARATOR ', ') AS service_names
     FROM staff_profile sp
     LEFT JOIN users u ON u.id = sp.user_id
     LEFT JOIN branches b ON b.id = sp.branch_id
     LEFT JOIN dentist_services ds ON ds.dentist_id = sp.user_id
     LEFT JOIN services svc ON svc.id = ds.service_id
     WHERE ${whereClause}
     GROUP BY sp.id
     LIMIT 1`,
    params
  );

  if (!rows[0]) return null;

  const mapped = mapStaffProfileRow(rows[0]);
  if (rows[0].user_role === 'dentist' && mapped.userId) {
    try {
      const schedulesByDentist = await loadDentistScheduleEntriesByDentistIds([mapped.userId]);
      mapped.scheduleEntries = schedulesByDentist.get(Number(mapped.userId)) || [];
    } catch (_) {
      mapped.scheduleEntries = [];
    }
  }

  return mapped;
}

async function updateStaffProfile(profileId, payload, { allowBranch = false, allowStatus = false } = {}) {
  const profile = staffPayloadToDb(payload, { allowStatus });

  if (!profile.first_name || !profile.last_name) {
    const err = new Error('First name and last name are required');
    err.statusCode = 400;
    throw err;
  }

  const [existingProfileRows] = await pool.query(
    'SELECT user_id FROM staff_profile WHERE id = ? LIMIT 1',
    [profileId]
  );

  if (existingProfileRows.length === 0) {
    const err = new Error('Staff profile not found');
    err.statusCode = 404;
    throw err;
  }

  const linkedUserId = existingProfileRows[0].user_id;

  if (linkedUserId && profile.email) {
    const [duplicates] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
      [profile.email, linkedUserId]
    );

    if (duplicates.length > 0) {
      const err = new Error('Email is already used by another account');
      err.statusCode = 409;
      throw err;
    }
  }

  const fields = [
    'first_name = ?',
    'middle_name = ?',
    'last_name = ?',
    'nickname = ?',
    'suffix = ?',
    'birthday = ?',
    'age = ?',
    'gender = ?',
    'civil_status = ?',
    'religion = ?',
    'nationality = ?',
    'home_address = ?',
    'contact_number = ?',
    'email = ?',
    'position = ?',
    'specialization = ?',
    'work_department = ?',
    'medical_degree = ?',
    'license_number = ?',
    'years_experience = ?',
    'skills = ?',
    'start_date = ?',
    'employment_type = ?',
    'shift_type = ?',
    'work_days = ?',
    'work_start_time = ?',
    'work_end_time = ?',
  ];
  const values = [
    profile.first_name,
    profile.middle_name,
    profile.last_name,
    profile.nickname,
    profile.suffix,
    profile.birthday,
    profile.age,
    profile.gender,
    profile.civil_status,
    profile.religion,
    profile.nationality,
    profile.home_address,
    profile.contact_number,
    profile.email,
    profile.position,
    profile.specialization,
    profile.work_department,
    profile.medical_degree,
    profile.license_number,
    profile.years_experience,
    profile.skills,
    profile.start_date,
    profile.employment_type,
    profile.shift_type,
    profile.work_days,
    profile.work_start_time,
    profile.work_end_time,
  ];

  if (allowBranch && profile.branch_id) {
    fields.push('branch_id = ?');
    values.push(profile.branch_id);
  }

  if (allowStatus && ['Active', 'Inactive', 'Archived'].includes(profile.status)) {
    fields.push('status = ?');
    values.push(profile.status);
  }

  values.push(profileId);

  const [result] = await pool.query(
    `UPDATE staff_profile SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  if (result.affectedRows === 0) {
    const err = new Error('Staff profile not found');
    err.statusCode = 404;
    throw err;
  }

  const [profileRows] = await pool.query(
    `SELECT sp.user_id, sp.first_name, sp.middle_name, sp.last_name, sp.email, sp.contact_number
     FROM staff_profile sp
     WHERE sp.id = ?`,
    [profileId]
  );

  const updated = profileRows[0];
  if (updated?.user_id) {
    const fullName = [updated.first_name, updated.middle_name, updated.last_name]
      .filter(Boolean)
      .join(' ');

    await pool.query(
      `UPDATE users
       SET name = ?, email = COALESCE(?, email), phone = ?
       WHERE id = ?`,
      [fullName, updated.email, updated.contact_number || null, updated.user_id]
    );
  }
}

async function issueTokens(user, platform, userAgent) {
  const branches = await loadUserBranches(user.id);

  const accessToken = signAccessToken({
    user_id: user.id,
    role: user.role,
    branches,
  });

  const refreshToken = generateRefreshToken();
  const refreshHash = await hashRefreshToken(refreshToken);
  const expiresAt = refreshTokenExpiryString(platform);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, platform, expires_at, last_used_at, user_agent)
     VALUES (?, ?, ?, ?, NOW(), ?)`,
    [user.id, refreshHash, platform, expiresAt, userAgent || null]
  );

  return { accessToken, refreshToken, branches };
}

function setRefreshCookie(res, token) {
  const maxAge = parseInt(process.env.JWT_REFRESH_WEB_IDLE_MIN, 10) * 60 * 1000;
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/api/auth',
  });
}

async function loadBranchesWithStats() {
  const [rows] = await pool.query(
    `SELECT
       b.id,
       b.name,
       b.address,
       b.phone,
       b.contact_person,
       DATE_FORMAT(b.date_opened, '%Y-%m-%d') AS date_opened,
       b.operating_hours,
       CASE
         WHEN b.date_opened IS NULL THEN b.years_active
         ELSE GREATEST(YEAR(CURDATE()) - YEAR(b.date_opened), 0)
       END AS years_active,
       b.status,
       (
         SELECT COUNT(*)
         FROM users u
         WHERE u.role = 'dentist'
           AND u.home_branch_id = b.id
       ) AS dentist_count,
       (
         SELECT COUNT(*)
         FROM services s
       ) AS service_count
     FROM branches b
     ORDER BY b.name ASC`
  );

  return rows;
}

function calculateYearsActive(dateOpened) {
  const openedYear = Number(String(dateOpened || '').slice(0, 4));

  if (!openedYear) {
    return null;
  }

  return String(Math.max(0, new Date().getFullYear() - openedYear));
}

async function loadServices() {
  const [rows] = await pool.query(
    `SELECT
       id,
       name,
       category,
       price,
       duration_min,
       time_buffer_min,
       status
     FROM services
     ORDER BY name ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category || 'General Dentistry',
    price: Number(row.price || 0),
    duration: row.duration_min,
    duration_min: row.duration_min,
    time_buffer_min: Number(row.time_buffer_min ?? 30),
    status: row.status || 'Active',
  }));
}

router.get('/branches', async (req, res) => {
  try {
    const branches = await loadBranchesWithStats();
    res.json({ branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/services', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const services = await loadServices();
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Returns distinct service categories available at a branch (via dentists assigned there).
// Falls back to all categories when the branch has no dentists with linked services yet.
router.get('/branch-services/:branchId', authenticate, requireRole('admin'), async (req, res) => {
  const branchId = parseInt(req.params.branchId, 10);
  if (!branchId) {
    return res.status(400).json({ message: 'Invalid branch ID' });
  }
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT s.category
       FROM services s
       JOIN dentist_services ds ON ds.service_id = s.id
       JOIN user_branches ub ON ub.user_id = ds.dentist_id
       WHERE ub.branch_id = ?
         AND s.status = 'Active'
       ORDER BY s.category ASC`,
      [branchId]
    );
    let categories = rows.map((r) => r.category).filter(Boolean);
    if (categories.length === 0) {
      const [allRows] = await pool.query(
        `SELECT DISTINCT category FROM services WHERE status = 'Active' ORDER BY category ASC`
      );
      categories = allRows.map((r) => r.category).filter(Boolean);
    }
    res.json({ categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/services', authenticate, requireRole('admin'), async (req, res) => {
  const { name, category, price, duration, duration_min, time_buffer_min, status = 'Active' } = req.body;
  const durationMin = Number(duration_min || duration);
  const bufferMin = Number.isFinite(Number(time_buffer_min)) ? Number(time_buffer_min) : 30;
  const servicePrice = Number(price);

  if (!name || !category || !Number.isFinite(servicePrice) || !Number.isFinite(durationMin) || !status) {
    return res.status(400).json({
      message: 'Service name, category, price, duration, and status are required',
    });
  }

  if (!['Active', 'Inactive', 'Discontinued'].includes(status)) {
    return res.status(400).json({ message: 'Invalid service status' });
  }
  if (!Number.isFinite(bufferMin) || bufferMin < 0) {
    return res.status(400).json({ message: 'Time buffer must be a non-negative number' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO services (name, category, price, duration_min, time_buffer_min, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category, servicePrice, durationMin, bufferMin, status]
    );

    const services = await loadServices();
    res.status(201).json({ id: result.insertId, services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/services/:id', authenticate, requireRole('admin'), async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const { name, category, price, duration, duration_min, time_buffer_min, status } = req.body;
  const durationMin = Number(duration_min || duration);
  const bufferMin = Number.isFinite(Number(time_buffer_min)) ? Number(time_buffer_min) : 30;
  const servicePrice = Number(price);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid service id' });
  }

  if (!name || !category || !Number.isFinite(servicePrice) || !Number.isFinite(durationMin) || !status) {
    return res.status(400).json({
      message: 'Service name, category, price, duration, and status are required',
    });
  }

  if (!['Active', 'Inactive', 'Discontinued'].includes(status)) {
    return res.status(400).json({ message: 'Invalid service status' });
  }
  if (!Number.isFinite(bufferMin) || bufferMin < 0) {
    return res.status(400).json({ message: 'Time buffer must be a non-negative number' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE services
       SET name = ?,
           category = ?,
           price = ?,
           duration_min = ?,
           time_buffer_min = ?,
           status = ?
       WHERE id = ?`,
      [name, category, servicePrice, durationMin, bufferMin, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const services = await loadServices();
    res.json({ services });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/branches', authenticate, requireRole('admin'), async (req, res) => {
  const {
    name,
    address,
    phone,
    contact_person,
    date_opened,
    operating_hours,
    status = 'Active',
  } = req.body;
  const trimmedPhone = String(phone || '').trim();
  const yearsActive = calculateYearsActive(date_opened);

  if (!name || !address || !trimmedPhone || !status) {
    return res.status(400).json({ message: 'This field is required' });
  }

  if (!/^09\d{9}$/.test(trimmedPhone) && !/^\+[1-9]\d{7,14}$/.test(trimmedPhone)) {
    return res.status(400).json({ message: 'Contact number does not match the selected country code.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO branches
       (name, address, phone, contact_person, date_opened, operating_hours, years_active, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        address,
        trimmedPhone,
        contact_person || null,
        date_opened || null,
        operating_hours || null,
        yearsActive,
        status,
      ]
    );

    await pool.query(
      `INSERT IGNORE INTO user_branches (user_id, branch_id, is_primary)
       VALUES (?, ?, FALSE)`,
      [req.user.user_id, result.insertId]
    );

    const branches = await loadBranchesWithStats();
    res.status(201).json({ id: result.insertId, branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/branches/:id', authenticate, requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const {
    name,
    address,
    phone,
    contact_person,
    date_opened,
    operating_hours,
    status,
  } = req.body;
  const trimmedPhone = String(phone || '').trim();
  const yearsActive = calculateYearsActive(date_opened);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid branch id' });
  }
  if (!name || !address || !trimmedPhone || !status) {
    return res.status(400).json({ message: 'This field is required' });
  }

  if (!/^09\d{9}$/.test(trimmedPhone) && !/^\+[1-9]\d{7,14}$/.test(trimmedPhone)) {
    return res.status(400).json({ message: 'Contact number does not match the selected country code.' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE branches
       SET name = ?,
           address = ?,
           phone = ?,
           contact_person = ?,
           date_opened = ?,
           operating_hours = ?,
           years_active = ?,
           status = ?
       WHERE id = ?`,
      [
        name,
        address,
        trimmedPhone,
        contact_person || null,
        date_opened || null,
        operating_hours || null,
        yearsActive,
        status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const branches = await loadBranchesWithStats();
    res.json({ branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register/start', async (req, res) => {
  const { email, name, password, phone, branch_id } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Email, name, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  if (!branch_id) {
    return res.status(400).json({ message: 'branch_id is required' });
  }

  const [branchCheck] = await pool.query('SELECT id FROM branches WHERE id = ?', [branch_id]);
  if (branchCheck.length === 0) {
    return res.status(400).json({ message: 'Invalid branch_id' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const code = generateOTP();
    const codeHash = await hashOTP(code);
    const expiresAt = otpExpiryDate();

    await pool.query(
      `UPDATE otp_codes SET consumed_at = NOW()
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL`,
      [email]
    );
    await pool.query(
      `INSERT INTO otp_codes (email, code_hash, purpose, expires_at) VALUES (?, ?, 'register', ?)`,
      [email, codeHash, expiresAt]
    );

    const passwordHash = await bcrypt.hash(password, 10);
    const pendingExpires = toMySQLDateTime(new Date(Date.now() + 30 * 60 * 1000));

    await pool.query(`DELETE FROM pending_registrations WHERE email = ? AND intended_role = 'patient'`, [email]);
    
    await pool.query(
      `INSERT INTO pending_registrations (email, name, phone, branch_id, password_hash, intended_role, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [email, name, phone || null, branch_id, passwordHash, 'patient', pendingExpires]
);

    await sendOTPEmail({ to: email, code, purpose: 'register' });

    res.json({ message: 'OTP sent. Check your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register/verify', async (req, res) => {
  const { email, code, platform = 'mobile' } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  try {
    const [otps] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (otps.length === 0) {
      return res.status(400).json({ message: 'OTP is invalid' });
    }

    const otp = otps[0];
    const maxAttempts = RESET_PASSWORD_MAX_OTP_ATTEMPTS;
    if (otp.attempts >= maxAttempts) {
      await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);
      return res.status(429).json({ message: resetPasswordCooldownMessage() });
    }

    const ok = await verifyOTPHash(code, otp.code_hash);
    if (!ok) {
      const nextAttempts = Number(otp.attempts || 0) + 1;
      if (nextAttempts >= maxAttempts) {
        await pool.query('UPDATE otp_codes SET attempts = ?, consumed_at = NOW() WHERE id = ?', [nextAttempts, otp.id]);
        return res.status(429).json({ message: resetPasswordCooldownMessage() });
      }

      await pool.query('UPDATE otp_codes SET attempts = ? WHERE id = ?', [nextAttempts, otp.id]);
      return res.status(400).json({ message: 'Invalid code' });
    }

    const [pendings] = await pool.query(
      `SELECT * FROM pending_registrations
       WHERE email = ? AND intended_role = 'patient' AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (pendings.length === 0) {
      return res.status(400).json({ message: 'No pending registration found. Start over.' });
    }
    const pending = pendings[0];

    const [result] = await pool.query(
      `INSERT INTO users (role, name, email, password_hash, phone, email_verified)
       VALUES ('patient', ?, ?, ?, ?, TRUE)`,
      [pending.name, email, pending.password_hash, pending.phone]
    );
    const userId = result.insertId;
    const patientBranchId = pending.branch_id;

      if (patientBranchId) {
        await pool.query(
          'UPDATE users SET home_branch_id = ? WHERE id = ?',
          [patientBranchId, userId]
        );
        await pool.query(
          'INSERT INTO user_branches (user_id, branch_id) VALUES (?, ?)',
          [userId, patientBranchId]
        );
      }

    await pool.query(`DELETE FROM pending_registrations WHERE email = ?`, [email]);

    await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);

  res.json({
    message: 'Registration successful. Please log in.',
    email,
  });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, platform = 'mobile' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query(
      `SELECT u.id, u.role, u.name, u.email, u.password_hash, u.status,
              u.must_change_password, u.email_verified, u.home_branch_id,
              u.created_at, b.address AS home_branch_address
       FROM users u
       LEFT JOIN branches b ON b.id = u.home_branch_id
       WHERE u.email = ?`,
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    const user = users[0];

    if (platform === 'mobile' && user.role !== 'patient') {
      return res.status(403).json({ message: 'Staff log in via the web app' });
    }
    if (platform === 'web' && user.role === 'patient') {
      return res.status(403).json({ message: 'Patients use the mobile app to log in' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      const deviceBrowser = parseDeviceBrowser(req.headers['user-agent'], platform, req.headers['x-app-os']);
      pool.query(
        `INSERT INTO audit_logs (user_id, action, device_browser, log_status) VALUES (?, 'login_failed', ?, 'failed')`,
        [user.id, deviceBrowser]
      ).catch(() => {});
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    if (user.status !== 'Active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    if (user.role === 'patient' && !user.email_verified) {
      return res.status(403).json({ message: 'Email not verified. Please complete registration.' });
    }

    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken, branches } = await issueTokens(user, platform, userAgent);

    if (platform === 'web') setRefreshCookie(res, refreshToken);

    const loginDeviceBrowser = parseDeviceBrowser(userAgent, platform, req.headers['x-app-os']);
    pool.query(
      `INSERT INTO audit_logs (user_id, action, device_browser, log_status) VALUES (?, 'login_success', ?, 'success')`,
      [user.id, loginDeviceBrowser]
    ).catch(() => {});

    res.json({
      accessToken,
      refreshToken: platform === 'mobile' ? refreshToken : undefined,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        home_branch_id: user.home_branch_id || null,
        home_branch_city: extractCity(user.home_branch_address),
        branches,
        must_change_password: !!user.must_change_password,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  const platform = req.body.platform || (req.cookies?.refresh_token ? 'web' : 'mobile');
  const submittedToken = platform === 'web' ? req.cookies?.refresh_token : req.body.refreshToken;
  if (!submittedToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const [tokens] = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE platform = ? AND revoked_at IS NULL AND expires_at > NOW()`,
      [platform]
    );

    let matched = null;
    for (const t of tokens) {
      if (await verifyRefreshTokenHash(submittedToken, t.token_hash)) {
        matched = t;
        break;
      }
    }
    if (!matched) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const [users] = await pool.query(
      'SELECT id, role, status, home_branch_id FROM users WHERE id = ?',
      [matched.user_id]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    const user = users[0];

    if (user.status !== 'Active') {
      await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [matched.id]);
      return res.status(403).json({ message: 'Account is inactive' });
    }

    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [matched.id]);
    const { accessToken, refreshToken, branches } = await issueTokens(user, platform, req.headers['user-agent']);

    if (platform === 'web') setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      refreshToken: platform === 'mobile' ? refreshToken : undefined,
      user: {
        id: user.id,
        role: user.role,
        home_branch_id: user.home_branch_id || null,
        branches,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  const platform = req.body.platform || (req.cookies?.refresh_token ? 'web' : 'mobile');
  const submittedToken = platform === 'web' ? req.cookies?.refresh_token : req.body.refreshToken;

  try {
    if (submittedToken) {
      const [tokens] = await pool.query(
        `SELECT id, token_hash FROM refresh_tokens
         WHERE user_id = ? AND platform = ? AND revoked_at IS NULL`,
        [req.user.user_id, platform]
      );
      for (const t of tokens) {
        if (await verifyRefreshTokenHash(submittedToken, t.token_hash)) {
          await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [t.id]);
          break;
        }
      }
    }

    if (platform === 'web') {
      res.clearCookie('refresh_token', { path: '/api/auth' });
    }

    const logoutDeviceBrowser = parseDeviceBrowser(req.headers['user-agent'], platform, req.headers['x-app-os']);
    pool.query(
      `INSERT INTO audit_logs (user_id, action, device_browser, log_status) VALUES (?, 'logout', ?, 'success')`,
      [req.user.user_id, logoutDeviceBrowser]
    ).catch(() => {});

    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const normalizedEmail = email.trim().toLowerCase();
  const allowedRoles = ['admin', 'dentist', 'receptionist'];

  try {
    const [users] = await pool.query(
      'SELECT id, role FROM users WHERE LOWER(email) = ? LIMIT 1',
      [normalizedEmail]
    );

    if (users.length === 0 || !allowedRoles.includes(users[0].role)) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    const role = users[0].role.charAt(0).toUpperCase() + users[0].role.slice(1);
    res.json({ role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email, platform = 'web' } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const [users] = await pool.query(
      'SELECT id, role FROM users WHERE LOWER(email) = ? LIMIT 1',
      [normalizedEmail]
    );

    const allowedRoles = ['admin', 'dentist', 'receptionist'];

    if (users.length === 0) {
      if (platform === 'mobile') {
        return res.status(404).json({ message: 'No account found with this email address.' });
      }

      return res.json({
        message: 'If an account exists, an OTP has been sent.',
      });
    }

    if (platform === 'web' && !allowedRoles.includes(users[0].role)) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    const [cooldowns] = await pool.query(
      `SELECT
         TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(consumed_at, INTERVAL ? MINUTE)) AS retry_after_seconds,
         DATE_ADD(consumed_at, INTERVAL ? MINUTE) AS cooldown_until
       FROM otp_codes
       WHERE LOWER(email) = ?
         AND purpose = 'reset_password'
         AND attempts >= ?
         AND consumed_at IS NOT NULL
         AND consumed_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
         AND (
           SELECT COUNT(*)
           FROM otp_codes req
           WHERE LOWER(req.email) = LOWER(otp_codes.email)
             AND req.purpose = 'reset_password'
             AND req.created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
         ) >= ?
       ORDER BY consumed_at DESC
       LIMIT 1`,
      [
        RESET_PASSWORD_COOLDOWN_MINUTES,
        RESET_PASSWORD_COOLDOWN_MINUTES,
        normalizedEmail,
        RESET_PASSWORD_MAX_OTP_ATTEMPTS,
        RESET_PASSWORD_COOLDOWN_MINUTES,
        RESET_PASSWORD_COOLDOWN_MINUTES,
        RESET_PASSWORD_MAX_RESENDS + 1,
      ]
    );

    if (cooldowns.length > 0) {
      const retryAfterSeconds = Math.max(0, Number(cooldowns[0].retry_after_seconds || 0));
      return res.status(429).json({
        message: resetPasswordCooldownMessage(),
        retry_after_seconds: retryAfterSeconds,
        cooldown_until: cooldowns[0].cooldown_until,
      });
    }

    const [recentRequests] = await pool.query(
      `SELECT COUNT(*) AS request_count
       FROM otp_codes
       WHERE LOWER(email) = ?
         AND purpose = 'reset_password'
         AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [normalizedEmail, RESET_PASSWORD_COOLDOWN_MINUTES]
    );
    const resetOtpRequestLimit = RESET_PASSWORD_MAX_RESENDS + 1;
    if (Number(recentRequests[0]?.request_count || 0) >= resetOtpRequestLimit) {
      return res.status(429).json({
        message: 'OTP resend limit reached. Please wait before requesting another code.',
        retry_after_seconds: RESET_PASSWORD_COOLDOWN_MINUTES * 60,
      });
    }

    const code = generateOTP();
    const codeHash = await hashOTP(code);
    const expiresAt = otpExpiryDate();

    await pool.query(
      `UPDATE otp_codes 
       SET consumed_at = NOW()
       WHERE LOWER(email) = ? 
       AND purpose = 'reset_password' 
       AND consumed_at IS NULL`,
      [normalizedEmail]
    );

    await pool.query(
      `INSERT INTO otp_codes (email, code_hash, purpose, expires_at) 
       VALUES (?, ?, 'reset_password', ?)`,
      [normalizedEmail, codeHash, expiresAt]
    );

    await sendOTPEmail({
      to: normalizedEmail,
      code,
      purpose: 'reset_password',
    });

    res.json({
      message: 'OTP has been sent to your email.',
      email: normalizedEmail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password/verify', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [otps] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE email = ? AND purpose = 'reset_password' AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [normalizedEmail]
    );

    if (otps.length === 0) {
      return res.status(400).json({ message: 'OTP is invalid' });
    }

    const otp = otps[0];
    const maxAttempts = RESET_PASSWORD_MAX_OTP_ATTEMPTS;
    if (otp.attempts >= maxAttempts) {
      const [recentRequests] = await pool.query(
        `SELECT COUNT(*) AS request_count
         FROM otp_codes
         WHERE LOWER(email) = ?
           AND purpose = 'reset_password'
           AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
        [normalizedEmail, RESET_PASSWORD_COOLDOWN_MINUTES]
      );
      const usedAllResends = Number(recentRequests[0]?.request_count || 0) >= RESET_PASSWORD_MAX_RESENDS + 1;
      await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);
      if (!usedAllResends) {
        return res.status(400).json({
          message: 'OTP verification failed. Please request a new code.',
          code_exhausted: true,
        });
      }

      return res.status(429).json({
        message: 'OTP verification failed. Too many incorrect attempts. You will be redirected to the login page in 5 seconds.',
        retry_after_seconds: RESET_PASSWORD_COOLDOWN_MINUTES * 60,
        cooldown_until: new Date(Date.now() + RESET_PASSWORD_COOLDOWN_MINUTES * 60 * 1000),
        locked: true,
      });
    }

    const ok = await verifyOTPHash(code, otp.code_hash);
    if (!ok) {
      const nextAttempts = Number(otp.attempts || 0) + 1;
      if (nextAttempts >= maxAttempts) {
        const [recentRequests] = await pool.query(
          `SELECT COUNT(*) AS request_count
           FROM otp_codes
           WHERE LOWER(email) = ?
             AND purpose = 'reset_password'
             AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
          [normalizedEmail, RESET_PASSWORD_COOLDOWN_MINUTES]
        );
        const usedAllResends = Number(recentRequests[0]?.request_count || 0) >= RESET_PASSWORD_MAX_RESENDS + 1;

        await pool.query('UPDATE otp_codes SET attempts = ?, consumed_at = NOW() WHERE id = ?', [nextAttempts, otp.id]);
        if (!usedAllResends) {
          return res.status(400).json({
            message: 'OTP verification failed. Please request a new code.',
            code_exhausted: true,
          });
        }

        return res.status(429).json({
          message: 'OTP verification failed. Too many incorrect attempts. You will be redirected to the login page in 5 seconds.',
          retry_after_seconds: RESET_PASSWORD_COOLDOWN_MINUTES * 60,
          cooldown_until: new Date(Date.now() + RESET_PASSWORD_COOLDOWN_MINUTES * 60 * 1000),
          locked: true,
        });
      }

      await pool.query('UPDATE otp_codes SET attempts = ? WHERE id = ?', [nextAttempts, otp.id]);
      return res.status(400).json({ message: 'Invalid code' });
    }

    res.json({ message: 'OTP verified.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }
  if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must not contain special characters' });
  }
  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and contain a letter and number' });
  }

  try {
    const [otps] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE email = ? AND purpose = 'reset_password' AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (otps.length === 0) {
      return res.status(400).json({ message: 'OTP is invalid' });
    }
    const otp = otps[0];
    const maxAttempts = RESET_PASSWORD_MAX_OTP_ATTEMPTS;
    if (otp.attempts >= maxAttempts) {
      await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);
      return res.status(429).json({ message: resetPasswordCooldownMessage() });
    }

    const ok = await verifyOTPHash(code, otp.code_hash);
    if (!ok) {
      const nextAttempts = Number(otp.attempts || 0) + 1;
      if (nextAttempts >= maxAttempts) {
        await pool.query('UPDATE otp_codes SET attempts = ?, consumed_at = NOW() WHERE id = ?', [nextAttempts, otp.id]);
        return res.status(429).json({ message: resetPasswordCooldownMessage() });
      }

      await pool.query('UPDATE otp_codes SET attempts = ? WHERE id = ?', [nextAttempts, otp.id]);
      return res.status(400).json({ message: 'Invalid code' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, must_change_password = FALSE WHERE email = ?',
      [passwordHash, email]
    );
    await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW()
       WHERE user_id = (SELECT id FROM users WHERE email = ?) AND revoked_at IS NULL`,
      [email]
    );

    const [resetUser] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (resetUser.length > 0) {
      const appOs = req.headers['x-app-os'];
      const resetPlatform = req.body.platform || (appOs ? 'mobile' : 'web');
      const resetDeviceBrowser = parseDeviceBrowser(req.headers['user-agent'], resetPlatform, appOs);
      pool.query(
        `INSERT INTO audit_logs (user_id, action, device_browser, log_status) VALUES (?, 'password_changed', ?, 'success')`,
        [resetUser[0].id, resetDeviceBrowser]
      ).catch(() => {});
    }

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin-register/start', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Email, name, and password are required' });
  }
  if (!/^[a-zA-Z0-9]+$/.test(password)) {
    return res.status(400).json({ message: 'Password must not contain special characters' });
  }
  if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and contain a letter and number' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [admins] = await pool.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    if (admins.length > 0) {
      return res.status(403).json({ message: 'An admin already exists. Contact your existing admin.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const [cooldowns] = await pool.query(
      `SELECT
         TIMESTAMPDIFF(SECOND, NOW(), DATE_ADD(consumed_at, INTERVAL ? MINUTE)) AS retry_after_seconds,
         DATE_ADD(consumed_at, INTERVAL ? MINUTE) AS cooldown_until
       FROM otp_codes
       WHERE LOWER(email) = ?
         AND purpose = 'register'
         AND attempts >= ?
         AND consumed_at IS NOT NULL
         AND consumed_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
         AND (
           SELECT COUNT(*)
           FROM otp_codes req
           WHERE LOWER(req.email) = LOWER(otp_codes.email)
             AND req.purpose = 'register'
             AND req.created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)
         ) >= ?
       ORDER BY consumed_at DESC
       LIMIT 1`,
      [
        ADMIN_REGISTER_COOLDOWN_MINUTES,
        ADMIN_REGISTER_COOLDOWN_MINUTES,
        normalizedEmail,
        ADMIN_REGISTER_MAX_OTP_ATTEMPTS,
        ADMIN_REGISTER_COOLDOWN_MINUTES,
        ADMIN_REGISTER_COOLDOWN_MINUTES,
        ADMIN_REGISTER_MAX_RESENDS + 1,
      ]
    );

    if (cooldowns.length > 0) {
      const retryAfterSeconds = Math.max(0, Number(cooldowns[0].retry_after_seconds || 0));
      return res.status(429).json({
        message: adminRegisterCooldownMessage(),
        retry_after_seconds: retryAfterSeconds,
        cooldown_until: cooldowns[0].cooldown_until,
      });
    }

    const [recentRequests] = await pool.query(
      `SELECT COUNT(*) AS request_count
       FROM otp_codes
       WHERE LOWER(email) = ?
         AND purpose = 'register'
         AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
      [normalizedEmail, ADMIN_REGISTER_COOLDOWN_MINUTES]
    );
    const adminOtpRequestLimit = ADMIN_REGISTER_MAX_RESENDS + 1;
    if (Number(recentRequests[0]?.request_count || 0) >= adminOtpRequestLimit) {
      return res.status(429).json({
        message: 'OTP resend limit reached. Please wait before requesting another code.',
        retry_after_seconds: ADMIN_REGISTER_COOLDOWN_MINUTES * 60,
      });
    }

    const code = generateOTP();
    const codeHash = await hashOTP(code);
    const expiresAt = otpExpiryDate();

    await pool.query(
      `UPDATE otp_codes SET consumed_at = NOW()
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL`,
      [normalizedEmail]
    );
    await pool.query(
      `INSERT INTO otp_codes (email, code_hash, purpose, expires_at) VALUES (?, ?, 'register', ?)`,
      [normalizedEmail, codeHash, expiresAt]
    );

    const passwordHash = await bcrypt.hash(password, 10);
    const pendingExpires = toMySQLDateTime(new Date(Date.now() + 30 * 60 * 1000));

    await pool.query(`DELETE FROM pending_registrations WHERE email = ? AND intended_role = 'admin'`, [normalizedEmail]);
    await pool.query(
      `INSERT INTO pending_registrations (email, name, password_hash, intended_role, expires_at)
       VALUES (?, ?, ?, 'admin', ?)`,
      [normalizedEmail, name, passwordHash, pendingExpires]
    );

    await sendOTPEmail({ to: normalizedEmail, code, purpose: 'register' });
    res.json({ message: 'OTP sent. Check your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin-register/verify', async (req, res) => {
  const { email, code, platform = 'web' } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const [otps] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [normalizedEmail]
    );
    if (otps.length === 0) return res.status(400).json({ message: 'OTP is invalid' });
    const otp = otps[0];
    const maxAttempts = ADMIN_REGISTER_MAX_OTP_ATTEMPTS;
    if (otp.attempts >= maxAttempts) {
      const [recentRequests] = await pool.query(
        `SELECT COUNT(*) AS request_count
         FROM otp_codes
         WHERE LOWER(email) = ?
           AND purpose = 'register'
           AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
        [normalizedEmail, ADMIN_REGISTER_COOLDOWN_MINUTES]
      );
      const usedAllResends = Number(recentRequests[0]?.request_count || 0) >= ADMIN_REGISTER_MAX_RESENDS + 1;
      await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);
      if (!usedAllResends) {
        return res.status(400).json({
          message: 'OTP verification failed. Please request a new code.',
          code_exhausted: true,
        });
      }

      return res.status(429).json({
        message: 'OTP verification failed. Too many incorrect attempts. You will be redirected to the login page in 5 seconds.',
        retry_after_seconds: ADMIN_REGISTER_COOLDOWN_MINUTES * 60,
        cooldown_until: new Date(Date.now() + ADMIN_REGISTER_COOLDOWN_MINUTES * 60 * 1000),
        locked: true,
      });
    }

    const ok = await verifyOTPHash(code, otp.code_hash);
    if (!ok) {
      const nextAttempts = Number(otp.attempts || 0) + 1;
      if (nextAttempts >= maxAttempts) {
        const [recentRequests] = await pool.query(
          `SELECT COUNT(*) AS request_count
           FROM otp_codes
           WHERE LOWER(email) = ?
             AND purpose = 'register'
             AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
          [normalizedEmail, ADMIN_REGISTER_COOLDOWN_MINUTES]
        );
        const usedAllResends = Number(recentRequests[0]?.request_count || 0) >= ADMIN_REGISTER_MAX_RESENDS + 1;

        await pool.query('UPDATE otp_codes SET attempts = ?, consumed_at = NOW() WHERE id = ?', [nextAttempts, otp.id]);
        if (!usedAllResends) {
          return res.status(400).json({
            message: 'OTP verification failed. Please request a new code.',
            code_exhausted: true,
          });
        }

        return res.status(429).json({
          message: 'OTP verification failed. Too many incorrect attempts. You will be redirected to the login page in 5 seconds.',
          retry_after_seconds: ADMIN_REGISTER_COOLDOWN_MINUTES * 60,
          cooldown_until: new Date(Date.now() + ADMIN_REGISTER_COOLDOWN_MINUTES * 60 * 1000),
          locked: true,
        });
      }

      await pool.query('UPDATE otp_codes SET attempts = ? WHERE id = ?', [nextAttempts, otp.id]);
      return res.status(400).json({ message: 'Invalid code' });
    }

    const [pendings] = await pool.query(
      `SELECT * FROM pending_registrations
       WHERE email = ? AND intended_role = 'admin' AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [normalizedEmail]
    );
    if (pendings.length === 0) return res.status(400).json({ message: 'No pending registration. Start over.' });
    const pending = pendings[0];

    const [result] = await pool.query(
      `INSERT INTO users (role, name, email, password_hash, email_verified)
       VALUES ('admin', ?, ?, ?, TRUE)`,
      [pending.name, normalizedEmail, pending.password_hash]
    );
    const userId = result.insertId;

    await pool.query(`DELETE FROM pending_registrations WHERE email = ?`, [normalizedEmail]);

    const [branches] = await pool.query('SELECT id FROM branches');
    for (const b of branches) {
      await pool.query(
        `INSERT INTO user_branches (user_id, branch_id, is_primary) VALUES (?, ?, ?)`,
        [userId, b.id, false]
      );
    }

    await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);

    const user = { id: userId, role: 'admin' };
    const { accessToken, refreshToken, branches: userBranches } = await issueTokens(user, platform, req.headers['user-agent']);
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { id: userId, role: 'admin', name: pending.name, email: normalizedEmail, branches: userBranches },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.role,
         u.home_branch_id,
         u.status AS account_status,
         u.created_at,
         u.must_change_password,
         sp.status AS staff_status,
         sp.staff_type,
         sp.branch_id,
         b.name AS branch_name,
         b.address AS branch_address
       FROM users u
       LEFT JOIN staff_profile sp ON sp.user_id = u.id
       LEFT JOIN branches b ON b.id = COALESCE(sp.branch_id, u.home_branch_id)
       ORDER BY u.created_at DESC`
    );

    res.json({
      users: rows.map((row) => ({
        id: row.id,
        fullName: row.name,
        email: row.email,
        role: row.role.charAt(0).toUpperCase() + row.role.slice(1),
        branch_id: row.branch_id || row.home_branch_id,
        branch_name: row.branch_name,
        branch_address: row.branch_address,
        created: row.created_at,
        status: row.account_status || 'Active',
        must_change_password: !!row.must_change_password,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/users', authenticate, requireRole('admin'), async (req, res) => {
  const { fullName, email, role, branch_id, password, status = 'Active' } = req.body;
  const normalizedRole = String(role || '').toLowerCase();

  if (!fullName || !email || !normalizedRole) {
    return res.status(400).json({ message: 'Full name, email, and access role are required' });
  }
  if (!['admin', 'dentist', 'receptionist', 'patient'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Invalid access role' });
  }
  if (['dentist', 'receptionist', 'patient'].includes(normalizedRole) && !branch_id) {
    return res.status(400).json({ message: 'Branch is required for this role' });
  }
  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid account status' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const generatedPassword = password || crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10) + '!1';
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    const homeBranchId = branch_id || null;

    const [result] = await pool.query(
      `INSERT INTO users (role, home_branch_id, name, email, password_hash, status, email_verified, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [normalizedRole, homeBranchId, fullName, email, passwordHash, status, !password]
    );

    if (homeBranchId) {
      await pool.query(
        `INSERT INTO user_branches (user_id, branch_id, is_primary)
         VALUES (?, ?, TRUE)`,
        [result.insertId, homeBranchId]
      );
    }

    res.status(201).json({
      message: 'User account created.',
      tempPassword: generatedPassword,
      user: {
        id: result.insertId,
        fullName,
        email,
        role: normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1),
        branch_id: homeBranchId,
        status,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/users/:id', authenticate, requireRole('admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { fullName, email, role, branch_id, status } = req.body;
  const normalizedRole = String(role || '').toLowerCase();

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  if (!fullName || !email || !normalizedRole || !status) {
    return res.status(400).json({ message: 'Full name, email, access role, and status are required' });
  }
  if (!['admin', 'dentist', 'receptionist', 'patient'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Invalid access role' });
  }
  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid account status' });
  }
  if (['dentist', 'receptionist', 'patient'].includes(normalizedRole) && !branch_id) {
    return res.status(400).json({ message: 'Branch is required for this role' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [email, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const homeBranchId = branch_id || null;
    const [result] = await pool.query(
      `UPDATE users
       SET role = ?,
           home_branch_id = ?,
           name = ?,
           email = ?,
           status = ?
       WHERE id = ?`,
      [normalizedRole, homeBranchId, fullName, email, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await pool.query('DELETE FROM user_branches WHERE user_id = ?', [id]);
    if (homeBranchId) {
      await pool.query(
        `INSERT INTO user_branches (user_id, branch_id, is_primary)
         VALUES (?, ?, TRUE)`,
        [id, homeBranchId]
      );
    }

    if (status === 'Inactive') {
      await pool.query(
        `UPDATE refresh_tokens SET revoked_at = NOW()
         WHERE user_id = ? AND revoked_at IS NULL`,
        [id]
      );
    }

    res.json({ message: 'User account updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/staff-profiles', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         sp.*,
         u.role AS user_role,
         b.name AS branch_name,
         b.address AS branch_address
       FROM staff_profile sp
       LEFT JOIN users u ON u.id = sp.user_id
       LEFT JOIN branches b ON b.id = sp.branch_id
       ORDER BY sp.created_at DESC`
    );

    const dentistUserIds = rows
      .filter((row) => row.user_role === 'dentist' && row.user_id)
      .map((row) => row.user_id);

    const schedulesByDentist = await loadDentistScheduleEntriesByDentistIds(dentistUserIds);

    res.json({
      employees: rows.map((row) => {
        const mapped = mapStaffProfileRow(row);
        if (row.user_role === 'dentist') {
          mapped.scheduleEntries = schedulesByDentist.get(Number(row.user_id)) || [];
        }
        return mapped;
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/staff-profile/me', authenticate, requireRole('dentist', 'receptionist'), async (req, res) => {
  try {
    const profile = await fetchStaffProfileBy('sp.user_id = ?', [req.user.user_id]);
    if (!profile) return res.status(404).json({ message: 'Staff profile not found' });
    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/staff-profiles/:id/schedule-locks', authenticate, requireRole('admin'), async (req, res) => {
  const profileId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(profileId)) {
    return res.status(400).json({ message: 'Invalid staff profile id' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT sp.user_id, sp.branch_id, u.role
       FROM staff_profile sp
       LEFT JOIN users u ON u.id = sp.user_id
       WHERE sp.id = ?
       LIMIT 1`,
      [profileId]
    );

    const profile = rows[0] || null;
    if (!profile) {
      return res.status(404).json({ message: 'Staff profile not found' });
    }

    if (profile.role !== 'dentist' || !profile.user_id) {
      return res.json({
        hasLocks: false,
        branchLocked: false,
        lockedWeekdays: [],
        locks: [],
      });
    }

    const locks = await getDentistScheduleLocks(profile.user_id);
    const branchLocked = locks.some(
      (lock) => Number(lock.branch_id) === Number(profile.branch_id)
    );

    return res.json({
      hasLocks: locks.length > 0,
      branchLocked,
      lockedWeekdays: [...new Set(locks.map((lock) => Number(lock.weekday)))],
      locks,
    });
  } catch (err) {
    console.error('[staff schedule locks]', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/staff-profile/me', authenticate, requireRole('dentist', 'receptionist'), async (req, res) => {
  try {
    const current = await fetchStaffProfileBy('sp.user_id = ?', [req.user.user_id]);
    if (!current) return res.status(404).json({ message: 'Staff profile not found' });

    await updateStaffProfile(current.profileId, req.body, {
      allowBranch: false,
      allowStatus: false,
    });

    const profile = await fetchStaffProfileBy('sp.id = ?', [current.profileId]);
    res.json({ message: 'Staff profile updated.', profile });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.patch('/staff-profiles/:id', authenticate, requireRole('admin'), async (req, res) => {
  const profileId = Number.parseInt(req.params.id, 10);

  if (Number.isNaN(profileId)) {
    return res.status(400).json({ message: 'Invalid staff profile id' });
  }

  try {
    const wantsScheduleUpdate = Array.isArray(req.body?.schedule_entries);
    const wantsBranchUpdate =
      req.body?.branchId !== undefined || req.body?.branch_id !== undefined;
    let linkedUserIdForSchedule = null;
    let currentBranchIdForSchedule = null;

    if (wantsScheduleUpdate || wantsBranchUpdate) {
      const [urows] = await pool.query(
        `SELECT u.id, u.role, sp.branch_id
         FROM staff_profile sp
         LEFT JOIN users u ON u.id = sp.user_id
         WHERE sp.id = ?
         LIMIT 1`,
        [profileId]
      );
      const u = urows[0] || null;
      if (!u) {
        return res.status(404).json({ message: 'Staff profile not found' });
      }
      if (wantsScheduleUpdate && u.role !== 'dentist') {
        return res.status(400).json({ message: 'Only dentists have schedules' });
      }

      if (u.role === 'dentist' && u.id) {
        linkedUserIdForSchedule = u.id;
        currentBranchIdForSchedule = u.branch_id;
      }
    }

    if (linkedUserIdForSchedule && (wantsScheduleUpdate || wantsBranchUpdate)) {
      await assertDentistScheduleChangeAllowed(
        linkedUserIdForSchedule,
        req.body.schedule_entries,
        req.body.branchId ?? req.body.branch_id,
        currentBranchIdForSchedule
      );
    }

    await updateStaffProfile(profileId, req.body, {
      allowBranch: true,
      allowStatus: true,
    });

    if (wantsScheduleUpdate && linkedUserIdForSchedule) {
      await replaceDentistSchedules(linkedUserIdForSchedule, req.body.schedule_entries);
    }

    const profile = await fetchStaffProfileBy('sp.id = ?', [profileId]);
    res.json({ message: 'Staff profile updated.', profile });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.post('/staff-profiles', authenticate, requireRole('admin'), async (req, res) => {
  const { branch_id, staffProfile = {} } = req.body;

  if (!branch_id) {
    return res.status(400).json({ message: 'Assigned branch is required' });
  }
  if (!staffProfile.first_name || !staffProfile.last_name || !staffProfile.staff_type) {
    return res.status(400).json({ message: 'First name, last name, and staff type are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO staff_profile (
         user_id, branch_id, staff_type,
         first_name, middle_name, last_name, nickname, suffix,
         birthday, age, gender, civil_status, religion, nationality,
         home_address, contact_number, email,
         position, specialization, work_department, medical_degree, license_number,
         years_experience, skills, start_date, employment_type, shift_type,
         work_days, work_start_time, work_end_time, status
       )
       VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [
        branch_id,
        staffProfile.staff_type,
        staffProfile.first_name,
        staffProfile.middle_name || null,
        staffProfile.last_name,
        staffProfile.nickname || null,
        staffProfile.suffix || null,
        staffProfile.birthday || null,
        staffProfile.age || null,
        staffProfile.gender || null,
        staffProfile.civil_status || null,
        staffProfile.religion || null,
        staffProfile.nationality || null,
        staffProfile.home_address || null,
        staffProfile.contact_number || null,
        staffProfile.email || null,
        staffProfile.position || staffProfile.staff_type,
        staffProfile.specialization || null,
        staffProfile.work_department || null,
        staffProfile.medical_degree || null,
        staffProfile.license_number || null,
        staffProfile.years_experience || 0,
        staffProfile.skills || null,
        staffProfile.start_date || null,
        staffProfile.employment_type || null,
        staffProfile.shift_type || null,
        Array.isArray(staffProfile.work_days) ? staffProfile.work_days.join(', ') : staffProfile.work_days || null,
        staffProfile.work_start_time || null,
        staffProfile.work_end_time || null,
      ]
    );

    res.status(201).json({
      message: 'Staff profile created.',
      id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/staff', authenticate, requireRole('admin'), async (req, res) => {
  const {
    email,
    name,
    role,
    home_branch_id,
    branch_ids,
    phone,
    password,
    department,
    staffProfile = {},
  } = req.body;
  if (!email || !name || !role || !home_branch_id || !branch_ids?.length) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!['dentist', 'receptionist'].includes(role)) {
    return res.status(400).json({ message: 'Role must be dentist or receptionist' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Email already in use' });

    const tempPassword = password || crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10) + '!1';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const [result] = await pool.query(
      `INSERT INTO users (role, home_branch_id, name, email, password_hash, phone, email_verified, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)`,
      [role, home_branch_id, name, email, passwordHash, phone || null, !password]
    );
    const userId = result.insertId;

    for (const branchId of branch_ids) {
      await pool.query(
        `INSERT INTO user_branches (user_id, branch_id, is_primary) VALUES (?, ?, ?)`,
        [userId, branchId, branchId === home_branch_id]
      );
    }

    const firstName = staffProfile.first_name || name.split(' ')[0] || name;
    const lastName = staffProfile.last_name || name.split(' ').slice(1).join(' ') || name;
    const staffType = role === 'dentist' ? 'Dentist' : 'Receptionist';

    await pool.query(
      `INSERT INTO staff_profile (
         user_id, branch_id, staff_type,
         first_name, middle_name, last_name, nickname, suffix,
         birthday, age, gender, civil_status, religion, nationality,
         home_address, contact_number, email,
         position, specialization, work_department, medical_degree, license_number,
         years_experience, skills, start_date, employment_type, shift_type,
         work_days, work_start_time, work_end_time, status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
      [
        userId,
        home_branch_id,
        staffType,
        firstName,
        staffProfile.middle_name || null,
        lastName,
        staffProfile.nickname || null,
        staffProfile.suffix || null,
        staffProfile.birthday || null,
        staffProfile.age || null,
        staffProfile.gender || null,
        staffProfile.civil_status || null,
        staffProfile.religion || null,
        staffProfile.nationality || null,
        staffProfile.home_address || null,
        phone || staffProfile.contact_number || null,
        email,
        staffProfile.position || staffType,
        staffProfile.specialization || null,
        staffProfile.work_department || null,
        staffProfile.medical_degree || null,
        staffProfile.license_number || null,
        staffProfile.years_experience || 0,
        staffProfile.skills || null,
        staffProfile.start_date || null,
        staffProfile.employment_type || null,
        staffProfile.shift_type || null,
        Array.isArray(staffProfile.work_days) ? staffProfile.work_days.join(', ') : staffProfile.work_days || null,
        staffProfile.work_start_time || null,
        staffProfile.work_end_time || null,
      ]
    );

    if (role === 'dentist') {
      const DAY_TO_WEEKDAY = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
        Thursday: 4, Friday: 5, Saturday: 6,
      };

      const scheduleEntries = Array.isArray(staffProfile.schedule_entries)
        ? staffProfile.schedule_entries
        : [];

      // New path: optional per-day branch schedules.
      if (scheduleEntries.length > 0) {
        for (const entry of scheduleEntries) {
          const branchId = Number(entry.branch_id || home_branch_id);
          const weekday =
            Number.isInteger(entry.weekday)
              ? entry.weekday
              : DAY_TO_WEEKDAY[String(entry.day || '').trim()];
          const startTime = entry.start_time || staffProfile.work_start_time || null;
          const endTime = entry.end_time || staffProfile.work_end_time || null;

          if (!branchId || weekday === undefined || !startTime || !endTime) {
            continue;
          }

          await pool.query(
            'INSERT INTO dentist_schedules (dentist_id, branch_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
            [userId, branchId, weekday, startTime, endTime]
          );

          // Ensure the dentist is associated with any additional branches used in schedules.
          if (branchId !== Number(home_branch_id)) {
            await pool.query(
              'INSERT IGNORE INTO user_branches (user_id, branch_id, is_primary) VALUES (?, ?, FALSE)',
              [userId, branchId]
            );
          }
        }
      } else {
        // Backward-compatible path: all selected days use the home branch.
        const days = Array.isArray(staffProfile.work_days)
          ? staffProfile.work_days
          : String(staffProfile.work_days || '').split(',').map((d) => d.trim()).filter(Boolean);
        const workStart = staffProfile.work_start_time || null;
        const workEnd = staffProfile.work_end_time || null;
        if (days.length > 0 && workStart && workEnd) {
          for (const dayName of days) {
            const weekday = DAY_TO_WEEKDAY[dayName];
            if (weekday !== undefined) {
              await pool.query(
                'INSERT INTO dentist_schedules (dentist_id, branch_id, weekday, start_time, end_time) VALUES (?, ?, ?, ?, ?)',
                [userId, home_branch_id, weekday, workStart, workEnd]
              );
            }
          }
        }
      }

      const serviceCategory = staffProfile.work_department || department;
      if (serviceCategory) {
        const [svcRows] = await pool.query(
          'SELECT id FROM services WHERE category = ? AND status = ?',
          [serviceCategory, 'Active']
        );
        for (const svc of svcRows) {
          await pool.query(
            'INSERT IGNORE INTO dentist_services (dentist_id, service_id) VALUES (?, ?)',
            [userId, svc.id]
          );
        }
      }
    }

    if (!password) {
      await sendTempPasswordEmail({ to: email, name, tempPassword });
    }

    res.json({
      message: password ? 'Staff account created.' : 'Staff account created. Temporary password sent by email.',
      tempPassword,
      user: { id: userId, role, name, email, home_branch_id, branch_ids },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  const [users] = await pool.query(
    `SELECT u.id, u.role, u.name, u.email, u.phone, u.status, u.home_branch_id,
            u.created_at, u.must_change_password, b.address AS home_branch_address
     FROM users u
     LEFT JOIN branches b ON b.id = u.home_branch_id
     WHERE u.id = ?`,
    [req.user.user_id]
  );
  if (users.length === 0) return res.status(404).json({ message: 'User not found' });
  const branches = await loadUserBranches(req.user.user_id);
  const u = users[0];
  res.json({ ...u, home_branch_city: extractCity(u.home_branch_address), branches });
});

router.patch('/me', authenticate, requireRole('admin'), async (req, res) => {
  const { name, email, phone, status = 'Active', password = '' } = req.body;
  const trimmedName = String(name || '').trim();
  const trimmedEmail = String(email || '').trim();
  const trimmedPhone = String(phone || '').trim();

  if (!trimmedName || !trimmedEmail || !trimmedPhone || !status) {
    return res.status(400).json({ message: 'This field is required' });
  }

  if (/[0-9]/.test(trimmedName)) {
    return res.status(400).json({ message: 'Numbers are not allowed.' });
  }

  if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
    return res.status(400).json({ message: 'Special characters are not allowed.' });
  }

  if (!/^09\d{9}$/.test(trimmedPhone) && !/^\+[1-9]\d{7,14}$/.test(trimmedPhone)) {
    return res.status(400).json({ message: 'Contact number does not match the selected country code.' });
  }

  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid account status' });
  }

  if (password) {
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      return res.status(400).json({ message: 'Password must not contain special characters' });
    }

    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters and contain a letter and number',
      });
    }
  }

  try {
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ?',
      [trimmedEmail, req.user.user_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const updateFields = [
      'name = ?',
      'email = ?',
      'phone = ?',
      'status = ?',
    ];
    const updateParams = [trimmedName, trimmedEmail, trimmedPhone, status];

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateFields.push('password_hash = ?', 'must_change_password = FALSE');
      updateParams.push(passwordHash);
    }

    updateParams.push(req.user.user_id);

    await pool.query(
      `UPDATE users
       SET ${updateFields.join(', ')}
       WHERE id = ? AND role = 'admin'`,
      updateParams
    );

    if (password) {
      const adminDeviceBrowser = parseDeviceBrowser(req.headers['user-agent'], 'web', null);
      pool.query(
        `INSERT INTO audit_logs (user_id, action, device_browser, log_status) VALUES (?, 'password_changed', ?, 'success')`,
        [req.user.user_id, adminDeviceBrowser]
      ).catch(() => {});
    }

    const [users] = await pool.query(
      `SELECT id, role, name, email, phone, status, home_branch_id, created_at, must_change_password
       FROM users
       WHERE id = ?`,
      [req.user.user_id]
    );

    const branches = await loadUserBranches(req.user.user_id);

    res.json({
      message: 'Admin account updated.',
      user: { ...users[0], branches },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/staff-profile/me/previous-work', authenticate, requireRole('dentist', 'receptionist'), async (req, res) => {
  try {
    const profile = await fetchStaffProfileBy('sp.user_id = ?', [req.user.user_id]);
    if (!profile) return res.status(404).json({ message: 'Staff profile not found' });
    const [rows] = await pool.query(
      `SELECT id, company_name, company_address, position, specialization,
              start_month, end_month, responsibilities, reason_for_leaving, created_at
       FROM staff_previous_work
       WHERE staff_profile_id = ?
       ORDER BY COALESCE(start_month, '0000-00-00') DESC, id DESC`,
      [profile.profileId]
    );
    res.json({ previousWork: rows });
  } catch (err) {
    console.error('[staff-previous-work GET]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/staff-profile/me/previous-work', authenticate, requireRole('dentist', 'receptionist'), async (req, res) => {
  const { company_name, company_address, position, specialization, start_month, end_month, responsibilities, reason_for_leaving } = req.body;
  if (!company_name) return res.status(400).json({ message: 'Company name is required' });
  try {
    const profile = await fetchStaffProfileBy('sp.user_id = ?', [req.user.user_id]);
    if (!profile) return res.status(404).json({ message: 'Staff profile not found' });
    const toMonthDate = (val) => {
      if (!val) return null;
      return /^\d{4}-\d{2}$/.test(val) ? `${val}-01` : val;
    };
    const [result] = await pool.query(
      `INSERT INTO staff_previous_work
         (staff_profile_id, company_name, company_address, position, specialization,
          start_month, end_month, responsibilities, reason_for_leaving)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.profileId,
        company_name,
        company_address || null,
        position || null,
        specialization || null,
        toMonthDate(start_month),
        toMonthDate(end_month),
        responsibilities || null,
        reason_for_leaving || null,
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Work history added' });
  } catch (err) {
    console.error('[staff-previous-work POST]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/staff-profile/me/previous-work/:id', authenticate, requireRole('dentist', 'receptionist'), async (req, res) => {
  const entryId = Number.parseInt(req.params.id, 10);
  if (!entryId) return res.status(400).json({ message: 'Invalid id' });
  try {
    const profile = await fetchStaffProfileBy('sp.user_id = ?', [req.user.user_id]);
    if (!profile) return res.status(404).json({ message: 'Staff profile not found' });
    const [rows] = await pool.query(
      'SELECT id FROM staff_previous_work WHERE id = ? AND staff_profile_id = ?',
      [entryId, profile.profileId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Work history entry not found' });
    await pool.query('DELETE FROM staff_previous_work WHERE id = ?', [entryId]);
    res.json({ message: 'Work history deleted' });
  } catch (err) {
    console.error('[staff-previous-work DELETE]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
