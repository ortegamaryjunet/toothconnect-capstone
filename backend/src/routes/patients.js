const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s()]{7,30}$/;

function normalizeText(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  return trimmed || null;
}

function normalizeRequired(value) {
  return String(value || '').trim();
}

function normalizeDate(value) {
  const cleaned = normalizeText(value);
  if (!cleaned) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

  const match = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, month, day, year] = match;
  return `${year}-${month}-${day}`;
}

function validatePatientProfile(body) {
  const fullName = normalizeRequired(body.full_name || body.fullName);
  const email = normalizeRequired(body.email).toLowerCase();
  const contactNumber = normalizeRequired(body.contact_number || body.contact);
  const address = normalizeRequired(body.address || body.homeAddress);
  const errors = {};

  if (!fullName) errors.full_name = 'Full name is required.';
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!contactNumber) {
    errors.contact_number = 'Contact number is required.';
  } else if (!PHONE_REGEX.test(contactNumber)) {
    errors.contact_number = 'Please enter a valid contact number.';
  }

  if (!address) errors.address = 'Address is required.';

  const ageValue = normalizeText(body.age);
  const age = ageValue === null ? null : Number.parseInt(ageValue, 10);
  if (ageValue !== null && (Number.isNaN(age) || age < 0 || age > 130)) {
    errors.age = 'Please enter a valid age.';
  }

  return {
    errors,
    profile: {
      full_name: fullName,
      email,
      contact_number: contactNumber,
      address,
      birthday: normalizeDate(body.birthday),
      age: ageValue === null || Number.isNaN(age) ? null : age,
      nationality: normalizeText(body.nationality),
      occupation: normalizeText(body.occupation),
      sex: normalizeText(body.sex),
      civil_status: normalizeText(body.civil_status || body.civilStatus),
      emergency_contact_name: normalizeText(body.emergency_contact_name || body.emergencyContactName),
      emergency_contact_number: normalizeText(body.emergency_contact_number || body.emergencyContactNumber),
      medical_conditions: normalizeText(body.medical_conditions || body.medicalConditions),
      allergies: normalizeText(body.allergies),
      medications: normalizeText(body.medications),
      dental_history: normalizeText(body.dental_history || body.dentalHistory),
    },
  };
}

function buildStaffPatientProfile(body) {
  const fullName = normalizeRequired(body.full_name || body.fullName || body.name);
  const email = normalizeRequired(body.email || body.emailAddress).toLowerCase();
  const contactNumber = normalizeRequired(body.contact_number || body.contactNumber || body.contact || body.phone);
  const errors = {};

  if (!fullName) errors.full_name = 'Full name is required.';
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!contactNumber) {
    errors.contact_number = 'Contact number is required.';
  } else if (!PHONE_REGEX.test(contactNumber)) {
    errors.contact_number = 'Please enter a valid contact number.';
  }

  const ageValue = normalizeText(body.age);
  const age = ageValue === null ? null : Number.parseInt(ageValue, 10);
  if (ageValue !== null && (Number.isNaN(age) || age < 0 || age > 130)) {
    errors.age = 'Please enter a valid age.';
  }

  return {
    errors,
    profile: {
      full_name: fullName,
      email,
      contact_number: contactNumber,
      address: normalizeText(body.address || body.homeAddress),
      birthday: normalizeDate(body.birthday),
      age: ageValue === null || Number.isNaN(age) ? null : age,
      nationality: normalizeText(body.nationality),
      occupation: normalizeText(body.occupation),
      sex: normalizeText(body.sex || body.gender),
      civil_status: normalizeText(body.civil_status || body.civilStatus),
      emergency_contact_name: normalizeText(body.emergency_contact_name || body.emergencyContactName),
      emergency_contact_number: normalizeText(body.emergency_contact_number || body.emergencyContactNumber),
      medical_conditions: normalizeText(body.medical_conditions || body.medicalConditions),
      allergies: normalizeText(body.allergies),
      medications: normalizeText(body.medications),
      dental_history: normalizeText(body.dental_history || body.dentalHistory),
      nickname: normalizeText(body.nickname),
      suffix: normalizeText(body.suffix),
      religion: normalizeText(body.religion),
      dental_insurance: normalizeText(body.dental_insurance || body.dentalInsurance),
      effective_date: normalizeDate(body.effective_date || body.effectiveDate),
      office_number: normalizeText(body.office_number || body.officeNo),
      fax_number: normalizeText(body.fax_number || body.faxNo),
      is_minor: body.is_minor != null ? Boolean(body.is_minor) : (body.isMinor != null ? Boolean(body.isMinor) : null),
      guardian_name: normalizeText(body.guardian_name || body.guardianName),
      guardian_occupation: normalizeText(body.guardian_occupation || body.guardianOccupation),
      referral: normalizeText(body.referral),
      consultation_reason: normalizeText(body.consultation_reason || body.consultationReason),
      physician_name: normalizeText(body.physician_name || body.physicianName),
      physician_specialty: normalizeText(body.physician_specialty || body.physicianSpecialty),
      physician_office_address: normalizeText(body.physician_office_address || body.officeAddress),
      physician_office_number: normalizeText(body.physician_office_number || body.officeNumber),
      previous_dentist: normalizeText(body.previous_dentist || body.previousDentist),
      last_dental_visit: normalizeText(body.last_dental_visit || body.lastDentalVisit),
    },
  };
}

function mapProfile(row) {
  if (!row) return null;

  return {
    user_id: row.user_id || row.id,
    full_name: row.full_name || row.name,
    email: row.profile_email || row.email,
    contact_number: row.contact_number || row.phone,
    address: row.address || '',
    birthday: row.birthday,
    age: row.age,
    nationality: row.nationality,
    occupation: row.occupation,
    sex: row.sex,
    civil_status: row.civil_status,
    emergency_contact_name: row.emergency_contact_name,
    emergency_contact_number: row.emergency_contact_number,
    medical_conditions: row.medical_conditions,
    allergies: row.allergies,
    medications: row.medications,
    dental_history: row.dental_history,
    created_at: row.profile_created_at,
    updated_at: row.profile_updated_at,
    patient_since: row.patient_since || row.created_at,
  };
}

async function getPatientProfile(userId) {
  const [rows] = await pool.query(
    `SELECT
       u.id, u.name, u.email, u.phone, u.created_at,
       pp.user_id, pp.full_name, pp.email AS profile_email,
       pp.contact_number, pp.address, pp.birthday, pp.age, pp.nationality,
       pp.occupation, pp.sex, pp.civil_status, pp.emergency_contact_name,
       pp.emergency_contact_number, pp.medical_conditions, pp.allergies,
       pp.medications, pp.dental_history, pp.created_at AS profile_created_at,
       pp.updated_at AS profile_updated_at
     FROM users u
     LEFT JOIN patient_profile pp ON pp.user_id = u.id
     WHERE u.id = ? AND u.role = 'patient'`,
    [userId]
  );

  return rows[0] ? mapProfile(rows[0]) : null;
}

function mapPatientSearchRow(row) {
  return {
    id: row.id,
    name: row.full_name || row.name,
    email: row.profile_email || row.email,
    contact_number: row.contact_number || row.phone || '',
    address: row.address || '',
  };
}

function splitName(fullName = '') {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);

  return {
    firstName: parts[0] || '',
    middleName: parts.length > 2 ? parts.slice(1, -1).join(' ') : '',
    lastName: parts.length > 1 ? parts[parts.length - 1] : '',
  };
}

function mapPatientAccountRow(row) {
  const fullName = row.full_name || row.name || '';
  const nameParts = splitName(fullName);

  return {
    id: row.id,
    patient_id: row.id,
    info_id: row.id,
    user_id: row.id,
    full_name: fullName,
    first_name: nameParts.firstName,
    middle_name: nameParts.middleName,
    last_name: nameParts.lastName,
    email: row.profile_email || row.email || '',
    contact_number: row.contact_number || row.phone || '',
    status: row.status || 'Active',
    created_at: row.created_at,
    registered_at: row.created_at,
    deactivated_at: row.deactivated_at || null,
    birthday: row.birthday,
    age: row.age,
    gender: row.sex || '',
    address: row.address || '',
  };
}

function branchScopeCondition(alias = 'u') {
  return `(
    ${alias}.home_branch_id IN (__BRANCH_PLACEHOLDERS__)
    OR ub.branch_id IN (__BRANCH_PLACEHOLDERS__)
    OR a.branch_id IN (__BRANCH_PLACEHOLDERS__)
  )`;
}

router.get('/', requireRole('receptionist', 'admin'), async (req, res) => {
  const userBranches = req.user.branches || [];
  const role = req.user.role;

  if (role !== 'admin' && userBranches.length === 0) {
    return res.json({ patients: [] });
  }

  try {
    const params = [];
    let scopedCondition = '';

    if (role !== 'admin') {
      const branchPlaceholders = userBranches.map(() => '?').join(',');
      scopedCondition = `AND ${branchScopeCondition('u').replaceAll(
        '__BRANCH_PLACEHOLDERS__',
        branchPlaceholders
      )}`;
      params.push(...userBranches, ...userBranches, ...userBranches);
    }

    const [rows] = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.status, u.created_at, u.deactivated_at,
         pp.full_name, pp.email AS profile_email, pp.contact_number,
         pp.address, pp.birthday, pp.age, pp.sex
       FROM users u
       LEFT JOIN patient_profile pp ON pp.user_id = u.id
       LEFT JOIN user_branches ub ON ub.user_id = u.id
       LEFT JOIN appointments a ON a.patient_id = u.id
       WHERE u.role = 'patient' ${scopedCondition}
       GROUP BY
         u.id, u.name, u.email, u.phone, u.status, u.created_at, u.deactivated_at,
         pp.full_name, pp.email, pp.contact_number, pp.address,
         pp.birthday, pp.age, pp.sex
       ORDER BY u.created_at DESC`,
      params
    );

    res.json({ patients: rows.map(mapPatientAccountRow) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', requireRole('receptionist', 'admin'), async (req, res) => {
  const q = normalizeRequired(req.query.q);
  const userBranches = req.user.branches || [];

  if (q.length < 2) {
    return res.json({ patients: [] });
  }

  if (userBranches.length === 0) {
    return res.json({ patients: [] });
  }

  try {
    const like = `%${q}%`;
    const branchPlaceholders = userBranches.map(() => '?').join(',');
    const scopedBranchCondition = branchScopeCondition('u').replaceAll(
      '__BRANCH_PLACEHOLDERS__',
      branchPlaceholders
    );
    const [rows] = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone,
         pp.full_name, pp.email AS profile_email, pp.contact_number, pp.address
       FROM users u
       LEFT JOIN patient_profile pp ON pp.user_id = u.id
       LEFT JOIN user_branches ub ON ub.user_id = u.id
       LEFT JOIN appointments a ON a.patient_id = u.id
       WHERE u.role = 'patient'
         AND u.status = 'Active'
         AND ${scopedBranchCondition}
         AND (
           u.name LIKE ?
           OR pp.full_name LIKE ?
           OR u.email LIKE ?
           OR pp.email LIKE ?
           OR u.phone LIKE ?
           OR pp.contact_number LIKE ?
         )
       GROUP BY u.id, u.name, u.email, u.phone, pp.full_name, pp.email, pp.contact_number, pp.address
       ORDER BY COALESCE(pp.full_name, u.name) ASC
       LIMIT 8`,
      [
        ...userBranches,
        ...userBranches,
        ...userBranches,
        like,
        like,
        like,
        like,
        like,
        like,
      ]
    );

    res.json({ patients: rows.map(mapPatientSearchRow) });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email address is already used by another account.' });
    }
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.post('/staff', requireRole('receptionist', 'admin'), async (req, res) => {
  const fullName = normalizeRequired(req.body.full_name || req.body.fullName || req.body.name);
  const contactNumber = normalizeRequired(req.body.contact_number || req.body.contactNumber || req.body.phone);
  const email = normalizeRequired(req.body.email).toLowerCase();
  const temporaryPassword = normalizeText(req.body.temporary_password || req.body.temporaryPassword);
  const homeBranchId = req.user.branches?.[0] || null;

  if (!fullName || !contactNumber || !email) {
    return res.status(400).json({ message: 'Patient name, contact number, and email are required.' });
  }

  if (!PHONE_REGEX.test(contactNumber)) {
    return res.status(400).json({ message: 'Please enter a valid contact number.' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (temporaryPassword && temporaryPassword.length < 8) {
    return res.status(400).json({ message: 'Temporary password must be at least 8 characters.' });
  }

  try {
    const [existing] = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone,
         pp.full_name, pp.email AS profile_email, pp.contact_number, pp.address
       FROM users u
       LEFT JOIN patient_profile pp ON pp.user_id = u.id
       WHERE u.role = 'patient'
         AND (
           LOWER(u.email) = LOWER(?)
           OR LOWER(pp.email) = LOWER(?)
         )
       ORDER BY u.id ASC
       LIMIT 1`,
      [
        email,
        email,
      ]
    );

    if (existing.length > 0) {
      const patient = existing[0];
      await updatePatientContact(patient.id, fullName, contactNumber, email);

      if (homeBranchId) {
        await attachPatientToBranch(patient.id, homeBranchId);
      }
      const saved = await getSearchPatientById(patient.id);
      return res.json({ patient: saved, created: false });
    }

    const accountPassword = temporaryPassword || crypto.randomBytes(18).toString('hex');
    const passwordHash = await bcrypt.hash(accountPassword, 10);

    const [result] = await pool.query(
      `INSERT INTO users (role, home_branch_id, name, email, password_hash, phone, email_verified, must_change_password)
       VALUES ('patient', ?, ?, ?, ?, ?, TRUE, TRUE)`,
      [homeBranchId, fullName, email, passwordHash, contactNumber]
    );

    if (homeBranchId) {
      await pool.query(
        `INSERT IGNORE INTO user_branches (user_id, branch_id, is_primary)
         VALUES (?, ?, TRUE)`,
        [result.insertId, homeBranchId]
      );
    }

    await pool.query(
      `INSERT INTO patient_profile (user_id, full_name, email, contact_number, address)
       VALUES (?, ?, ?, ?, ?)`,
      [result.insertId, fullName, email, contactNumber, 'Not provided']
    );

    const patient = await getSearchPatientById(result.insertId);
    res.status(201).json({ patient, created: true });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email address is already used by another account.' });
    }
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.patch('/:patientId/contact', requireRole('receptionist', 'admin'), async (req, res) => {
  const patientId = Number.parseInt(req.params.patientId, 10);
  const fullName = normalizeRequired(req.body.full_name || req.body.fullName || req.body.name);
  const contactNumber = normalizeRequired(req.body.contact_number || req.body.contactNumber || req.body.phone);
  const email = normalizeRequired(req.body.email).toLowerCase();

  if (Number.isNaN(patientId)) {
    return res.status(400).json({ message: 'Invalid patient id' });
  }

  if (!contactNumber || !PHONE_REGEX.test(contactNumber)) {
    return res.status(400).json({ message: 'Please enter a valid contact number.' });
  }

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  try {
    await updatePatientContact(patientId, fullName, contactNumber, email);
    const patient = await getSearchPatientById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ patient });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email address is already used by another account.' });
    }
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.patch('/:patientId/account', requireRole('receptionist', 'admin'), async (req, res) => {
  const patientId = Number.parseInt(req.params.patientId, 10);
  const fullName = normalizeRequired(req.body.full_name || req.body.fullName || req.body.name);
  const contactNumber = normalizeRequired(req.body.contact_number || req.body.contactNumber || req.body.phone);
  const email = normalizeRequired(req.body.email).toLowerCase();
  const status = normalizeRequired(req.body.status || 'Active');
  const temporaryPassword = normalizeText(req.body.temporary_password || req.body.temporaryPassword);

  if (Number.isNaN(patientId)) {
    return res.status(400).json({ message: 'Invalid patient id' });
  }

  if (!fullName || !contactNumber || !email) {
    return res.status(400).json({ message: 'Patient name, contact number, and email are required.' });
  }

  if (!PHONE_REGEX.test(contactNumber)) {
    return res.status(400).json({ message: 'Please enter a valid contact number.' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  if (!['Active', 'Inactive'].includes(status)) {
    return res.status(400).json({ message: 'Invalid account status.' });
  }

  if (temporaryPassword && temporaryPassword.length < 8) {
    return res.status(400).json({ message: 'Temporary password must be at least 8 characters.' });
  }

  try {
    await updatePatientContact(patientId, fullName, contactNumber, email);

    const updateFields = ['status = ?', "deactivated_at = IF(? = 'Inactive', CURDATE(), NULL)"];
    const updateParams = [status, status];

    if (temporaryPassword) {
      updateFields.push('password_hash = ?', 'must_change_password = TRUE');
      updateParams.push(await bcrypt.hash(temporaryPassword, 10));
    }

    updateParams.push(patientId);

    const [result] = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND role = 'patient'`,
      updateParams
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const [rows] = await pool.query(
      `SELECT
         u.id, u.name, u.email, u.phone, u.status, u.created_at, u.deactivated_at,
         pp.full_name, pp.email AS profile_email, pp.contact_number,
         pp.address, pp.birthday, pp.age, pp.sex
       FROM users u
       LEFT JOIN patient_profile pp ON pp.user_id = u.id
       WHERE u.id = ? AND u.role = 'patient'`,
      [patientId]
    );

    res.json({
      message: 'Patient account updated.',
      patient: rows[0] ? mapPatientAccountRow(rows[0]) : null,
    });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email address is already used by another account.' });
    }
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

async function getSearchPatientById(patientId) {
  const [rows] = await pool.query(
    `SELECT
       u.id, u.name, u.email, u.phone,
       pp.full_name, pp.email AS profile_email, pp.contact_number, pp.address
     FROM users u
     LEFT JOIN patient_profile pp ON pp.user_id = u.id
     WHERE u.id = ? AND u.role = 'patient'`,
    [patientId]
  );

  return rows[0] ? mapPatientSearchRow(rows[0]) : null;
}

async function updatePatientContact(patientId, fullName, contactNumber, email) {
  const [users] = await pool.query(
    `SELECT id, name, email, phone FROM users WHERE id = ? AND role = 'patient'`,
    [patientId]
  );

  if (users.length === 0) {
    return;
  }

  const user = users[0];
  const nextName = fullName || user.name;
  const nextEmail = email || user.email;

  const [duplicates] = await pool.query(
    `SELECT u.id
     FROM users u
     LEFT JOIN patient_profile pp ON pp.user_id = u.id
     WHERE u.id <> ?
       AND (LOWER(u.email) = LOWER(?) OR LOWER(pp.email) = LOWER(?))
     LIMIT 1`,
    [patientId, nextEmail, nextEmail]
  );

  if (duplicates.length > 0) {
    const err = new Error('Email address is already used by another account.');
    err.statusCode = 409;
    throw err;
  }

  await pool.query(
    `UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ? AND role = 'patient'`,
    [nextName, nextEmail, contactNumber, patientId]
  );

  await pool.query(
    `INSERT INTO patient_profile (user_id, full_name, email, contact_number, address)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       email = VALUES(email),
       contact_number = VALUES(contact_number)`,
    [patientId, nextName, nextEmail, contactNumber, 'Not provided']
  );
}

async function savePatientProfile(patientId, profile) {
  await updatePatientContact(
    patientId,
    profile.full_name,
    profile.contact_number,
    profile.email
  );

  await pool.query(
    `INSERT INTO patient_profile (
       user_id, full_name, email, contact_number, address,
       birthday, age, nationality, occupation, sex, civil_status,
       emergency_contact_name, emergency_contact_number,
       medical_conditions, allergies, medications, dental_history
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       email = VALUES(email),
       contact_number = VALUES(contact_number),
       address = VALUES(address),
       birthday = VALUES(birthday),
       age = VALUES(age),
       nationality = VALUES(nationality),
       occupation = VALUES(occupation),
       sex = VALUES(sex),
       civil_status = VALUES(civil_status),
       emergency_contact_name = VALUES(emergency_contact_name),
       emergency_contact_number = VALUES(emergency_contact_number),
       medical_conditions = VALUES(medical_conditions),
       allergies = VALUES(allergies),
       medications = VALUES(medications),
       dental_history = VALUES(dental_history)`,
    [
      patientId,
      profile.full_name, profile.email, profile.contact_number, profile.address || 'Not provided',
      profile.birthday, profile.age, profile.nationality, profile.occupation,
      profile.sex, profile.civil_status,
      profile.emergency_contact_name, profile.emergency_contact_number,
      profile.medical_conditions, profile.allergies, profile.medications, profile.dental_history,
    ]
  );
}

async function attachPatientToBranch(patientId, branchId) {
  await pool.query(
    `UPDATE users
     SET home_branch_id = COALESCE(home_branch_id, ?)
     WHERE id = ? AND role = 'patient'`,
    [branchId, patientId]
  );

  await pool.query(
    `INSERT IGNORE INTO user_branches (user_id, branch_id, is_primary)
     VALUES (?, ?, FALSE)`,
    [patientId, branchId]
  );
}

router.get('/dentists', requireRole('patient'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.home_branch_id,
        b.name    AS branch_name,
        b.address AS branch_address,
        GROUP_CONCAT(DISTINCT ub.branch_id ORDER BY ub.branch_id SEPARATOR ',') AS branch_ids,
        GROUP_CONCAT(DISTINCT svc.name  ORDER BY svc.name  SEPARATOR ', ') AS services,
        GROUP_CONCAT(DISTINCT ds.weekday ORDER BY ds.weekday SEPARATOR ',')  AS schedule_weekdays
      FROM users u
      LEFT JOIN branches b          ON b.id  = u.home_branch_id
      LEFT JOIN user_branches ub    ON ub.user_id = u.id
      LEFT JOIN dentist_services dsvc ON dsvc.dentist_id = u.id
      LEFT JOIN services svc          ON svc.id = dsvc.service_id AND svc.status = 'Active'
      LEFT JOIN dentist_schedules ds  ON ds.dentist_id  = u.id
      WHERE u.role = 'dentist' AND u.status = 'Active'
      GROUP BY u.id, u.name, u.home_branch_id, b.id, b.name, b.address
      ORDER BY u.name ASC
    `);
    res.json({ dentists: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/services', requireRole('patient'), async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, category, price, duration_min, description
      FROM services
      WHERE status = 'Active'
      ORDER BY name ASC
    `);
    res.json({ services: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', requireRole('patient'), async (req, res) => {
  try {
    const profile = await getPatientProfile(req.user.user_id);
    if (!profile) return res.status(404).json({ message: 'Patient not found' });
    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', requireRole('patient'), async (req, res) => {
  const { errors, profile } = validatePatientProfile(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  }

  try {
    const [duplicateEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
      [profile.email, req.user.user_id]
    );

    if (duplicateEmail.length > 0) {
      return res.status(409).json({
        message: 'Email is already used by another account.',
        errors: { email: 'Email is already used by another account.' },
      });
    }

    await pool.query(
      `UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ? AND role = 'patient'`,
      [profile.full_name, profile.email, profile.contact_number, req.user.user_id]
    );

    await pool.query(
      `INSERT INTO patient_profile (
         user_id, full_name, email, contact_number, address,
         birthday, age, nationality, occupation, sex, civil_status,
         emergency_contact_name, emergency_contact_number,
         medical_conditions, allergies, medications, dental_history
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         full_name = VALUES(full_name),
         email = VALUES(email),
         contact_number = VALUES(contact_number),
         address = VALUES(address),
         birthday = VALUES(birthday),
         age = VALUES(age),
         nationality = VALUES(nationality),
         occupation = VALUES(occupation),
         sex = VALUES(sex),
         civil_status = VALUES(civil_status),
         emergency_contact_name = VALUES(emergency_contact_name),
         emergency_contact_number = VALUES(emergency_contact_number),
         medical_conditions = VALUES(medical_conditions),
         allergies = VALUES(allergies),
         medications = VALUES(medications),
         dental_history = VALUES(dental_history)`,
      [
        req.user.user_id,
        profile.full_name,
        profile.email,
        profile.contact_number,
        profile.address,
        profile.birthday,
        profile.age,
        profile.nationality,
        profile.occupation,
        profile.sex,
        profile.civil_status,
        profile.emergency_contact_name,
        profile.emergency_contact_number,
        profile.medical_conditions,
        profile.allergies,
        profile.medications,
        profile.dental_history,
      ]
    );

    const saved = await getPatientProfile(req.user.user_id);
    res.json({ message: 'Profile saved.', profile: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:patientId/profile', requireRole('receptionist', 'admin'), async (req, res) => {
  const patientId = Number.parseInt(req.params.patientId, 10);
  const { errors, profile } = buildStaffPatientProfile(req.body);

  if (Number.isNaN(patientId)) {
    return res.status(400).json({ message: 'Invalid patient id' });
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: 'Please fix the highlighted fields.', errors });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND role = ? LIMIT 1',
      [patientId, 'patient']
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    await savePatientProfile(patientId, profile);

    if (req.user.role !== 'admin' && req.user.branches?.[0]) {
      await attachPatientToBranch(patientId, req.user.branches[0]);
    }

    const saved = await getPatientProfile(patientId);
    res.json({ message: 'Patient profile saved.', profile: saved });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email address is already used by another account.' });
    }
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.get('/:patientId/profile', requireRole('dentist', 'admin', 'receptionist'), async (req, res) => {
  const patientId = Number.parseInt(req.params.patientId, 10);
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  if (Number.isNaN(patientId)) {
    return res.status(400).json({ message: 'Invalid patient id' });
  }

  try {
    const params = [patientId];
    let accessCondition = '';

    if (role === 'dentist') {
      accessCondition = 'AND a.dentist_id = ?';
      params.push(userId);
    } else {
      if (userBranches.length === 0) {
        return res.status(403).json({ message: 'No branch access for this patient' });
      }

      accessCondition = `AND a.branch_id IN (${userBranches.map(() => '?').join(',')})`;
      params.push(...userBranches);
    }

    const [accessRows] = await pool.query(
      `SELECT
         COUNT(a.id) AS total_appointments,
         MAX(a.start_time) AS last_visit
       FROM appointments a
       WHERE a.patient_id = ? ${accessCondition}`,
      params
    );

    let access = accessRows[0];

    if (role === 'receptionist' && (!access || Number(access.total_appointments) === 0)) {
      const branchPlaceholders = userBranches.map(() => '?').join(',');
      const [branchRows] = await pool.query(
        `SELECT u.id
         FROM users u
         LEFT JOIN user_branches ub ON ub.user_id = u.id
         WHERE u.id = ?
           AND u.role = 'patient'
           AND (
             u.home_branch_id IN (${branchPlaceholders})
             OR ub.branch_id IN (${branchPlaceholders})
           )
         LIMIT 1`,
        [patientId, ...userBranches, ...userBranches]
      );

      if (branchRows.length > 0) {
        access = { total_appointments: 0, last_visit: null };
      }
    }

    if (!access || Number(access.total_appointments) === 0 && role !== 'receptionist') {
      return res.status(403).json({ message: 'No appointment access for this patient' });
    }

    const profile = await getPatientProfile(patientId);
    if (!profile) return res.status(404).json({ message: 'Patient not found' });

    res.json({
      profile: {
        ...profile,
        total_appointments: Number(access.total_appointments),
        last_visit: access.last_visit,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
