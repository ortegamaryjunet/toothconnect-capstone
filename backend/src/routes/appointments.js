const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const {
  APPOINTMENT_BUFFER_MINUTES,
  toMySQLDateTime,
  parseISOToDate,
  addMinutes,
  startOfUTCDay,
} = require('../utils/scheduling');
const { clinicDateKeyFromUtcDate } = require('../utils/clinic');
const { getApprovedLeaveForDentistOnDate } = require('../utils/leaves');
const { sendPushToUser } = require('../services/push');
const { suggestSlots } = require('../services/scheduler');

const router = express.Router();

router.use(authenticate);

async function notifyDentist(dentistId, notification) {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      dentistId,
      notification.type,
      notification.title,
      notification.body,
      notification.relatedType || null,
      notification.relatedId || null,
    ]
  );
}

async function notifyBranchReceptionists(branchId, notification) {
  const [receptionists] = await pool.query(
    `SELECT DISTINCT u.id
     FROM users u
     LEFT JOIN user_branches ub ON ub.user_id = u.id
     WHERE u.role = 'receptionist'
       AND u.status = 'Active'
       AND (u.home_branch_id = ? OR ub.branch_id = ?)`,
    [branchId, branchId]
  );

  if (receptionists.length === 0) {
    return;
  }

  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
     VALUES ${receptionists.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`,
    receptionists.flatMap((receptionist) => [
      receptionist.id,
      notification.type,
      notification.title,
      notification.body,
      notification.relatedType || null,
      notification.relatedId || null,
    ])
  );
}

// Get feedback for one completed appointment
router.get('/patient-feedback/appointment/:appointmentId', requireRole('patient'), async (req, res) => {
  const appointmentId = parseInt(req.params.appointmentId, 10);
  const patientId = req.user.user_id;

  try {
    const [appointments] = await pool.query(
      `SELECT id, branch_id, patient_id, dentist_id, status
       FROM appointments
       WHERE id = ? AND patient_id = ?`,
      [appointmentId, patientId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = appointments[0];

    if (appt.status !== 'completed') {
      return res.status(400).json({
        message: 'Feedback is only available for completed appointments',
      });
    }

    const [feedbackRows] = await pool.query(
      `SELECT id, appointment_id, rating, feedback, submitted_at, updated_at
       FROM patient_feedback
       WHERE appointment_id = ? AND patient_id = ?`,
      [appointmentId, patientId]
    );

    res.json({
      feedback: feedbackRows.length ? feedbackRows[0] : null,
    });
  } catch (err) {
    console.error('Get appointment feedback error:', err);
    res.status(500).json({ message: 'Server error while getting feedback' });
  }
});


// Submit or resubmit feedback for one completed appointment
router.post('/patient-feedback/appointment/:appointmentId', requireRole('patient'), async (req, res) => {
  const appointmentId = parseInt(req.params.appointmentId, 10);
  const patientId = req.user.user_id;
  const { rating, feedback } = req.body || {};

  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({
      message: 'Rating must be a number from 1 to 5',
    });
  }

  try {
    const [appointments] = await pool.query(
      `SELECT id, branch_id, patient_id, dentist_id, status
       FROM appointments
       WHERE id = ? AND patient_id = ?`,
      [appointmentId, patientId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appt = appointments[0];

    if (appt.status !== 'completed') {
      return res.status(400).json({
        message: 'Feedback can only be submitted for completed appointments',
      });
    }

    await pool.query(
      `INSERT INTO patient_feedback (
         appointment_id,
         branch_id,
         patient_id,
         dentist_id,
         rating,
         feedback
       )
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rating = VALUES(rating),
         feedback = VALUES(feedback),
         updated_at = CURRENT_TIMESTAMP`,
      [
        appt.id,
        appt.branch_id,
        appt.patient_id,
        appt.dentist_id,
        numericRating,
        feedback || null,
      ]
    );

    res.json({ message: 'Feedback saved successfully' });
  } catch (err) {
    console.error('Submit appointment feedback error:', err);
    res.status(500).json({ message: 'Server error while saving feedback' });
  }
});

// Admin: get all patient feedback for reports
router.get('/reports/patient-feedback', requireRole('admin'), async (req, res) => {
  try {
    const userBranches = req.user.branches || [];

    if (userBranches.length === 0) {
      return res.json({ feedback: [] });
    }

    const [rows] = await pool.query(
      `
      SELECT
        pf.id,
        pf.appointment_id,
        pf.rating,
        pf.feedback,
        pf.submitted_at,
        pf.updated_at,

        b.name AS branch_name,
        p.name AS patient_name,
        d.name AS dentist_name,
        s.name AS service_name,
        a.start_time AS appointment_time,
        a.status AS appointment_status

      FROM patient_feedback pf
      JOIN appointments a ON a.id = pf.appointment_id
      JOIN branches b ON b.id = pf.branch_id
      JOIN users p ON p.id = pf.patient_id
      JOIN users d ON d.id = pf.dentist_id
      JOIN services s ON s.id = a.service_id
      WHERE pf.branch_id IN (${userBranches.map(() => '?').join(',')})
      ORDER BY pf.submitted_at DESC
      `,
      userBranches
    );

    res.json({ feedback: rows });
  } catch (err) {
    console.error('Admin patient feedback report error:', err);
    res.status(500).json({ message: 'Server error while getting patient feedback report' });
  }
});

// Dentist: get feedback only for logged-in dentist
router.get('/dentist/patient-feedback', requireRole('dentist'), async (req, res) => {
  const dentistId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        pf.id,
        pf.appointment_id,
        pf.rating,
        pf.feedback,
        pf.submitted_at,
        pf.updated_at,

        p.name AS patient_name,
        s.name AS service_name,
        a.start_time AS appointment_time,
        a.status AS appointment_status,
        b.name AS branch_name

      FROM patient_feedback pf
      JOIN appointments a ON a.id = pf.appointment_id
      JOIN users p ON p.id = pf.patient_id
      JOIN services s ON s.id = a.service_id
      JOIN branches b ON b.id = pf.branch_id
      WHERE pf.dentist_id = ?
      ORDER BY pf.submitted_at DESC
      LIMIT 10
      `,
      [dentistId]
    );

    res.json({ feedback: rows });
  } catch (err) {
    console.error('Dentist patient feedback error:', err);
    res.status(500).json({ message: 'Server error while getting dentist feedback' });
  }
});

router.get('/_meta/services-and-branches', async (req, res) => {
  try {
    const role = req.user.role;
    const userBranches = req.user.branches || [];
    const [services] = await pool.query(
      `SELECT id, name, duration_min, price FROM services
       WHERE status = 'Active'
       ORDER BY name ASC`
    );
    let branchesQuery = `SELECT id, name, address FROM branches`;
    const branchesParams = [];

    if ((role === 'receptionist' || role === 'admin') && userBranches.length > 0) {
      branchesQuery += ` WHERE id IN (${userBranches.map(() => '?').join(',')})`;
      branchesParams.push(...userBranches);
    }

    branchesQuery += ` ORDER BY name ASC`;

    const [branches] = await pool.query(branchesQuery, branchesParams);

    const dentistConditions = [`u.role = 'dentist'`, `u.status = 'Active'`];
    const dentistParams = [];

    if ((role === 'receptionist' || role === 'admin') && userBranches.length > 0) {
      dentistConditions.push(`ub.branch_id IN (${userBranches.map(() => '?').join(',')})`);
      dentistParams.push(...userBranches);
    }

    const [dentists] = await pool.query(
      `SELECT DISTINCT u.id, u.name
       FROM users u
       LEFT JOIN user_branches ub ON ub.user_id = u.id
       WHERE ${dentistConditions.join(' AND ')}
       ORDER BY u.name ASC`,
      dentistParams
    );

    const [serviceAvailability] = await pool.query(
      `SELECT DISTINCT dsv.service_id, dsch.branch_id
       FROM dentist_services dsv
       JOIN users u ON u.id = dsv.dentist_id AND u.role = 'dentist' AND u.status = 'Active'
       JOIN dentist_schedules dsch ON dsch.dentist_id = dsv.dentist_id`
    );

    const branchIdsByService = {};
    for (const row of serviceAvailability) {
      if (!branchIdsByService[row.service_id]) {
        branchIdsByService[row.service_id] = [];
      }
      branchIdsByService[row.service_id].push(row.branch_id);
    }

    const annotatedServices = services.map(s => ({
      ...s,
      available_branch_ids: branchIdsByService[s.id] || [],
    }));

    // Attach service_ids to each dentist so the web form can filter by service
    const dentistIds = dentists.map(d => d.id);
    let dentistServiceMap = {};
    let dentistBranchMap = {};
    if (dentistIds.length > 0) {
      const placeholders = dentistIds.map(() => '?').join(',');
      const [dsRows] = await pool.query(
        `SELECT dentist_id, service_id FROM dentist_services WHERE dentist_id IN (${placeholders})`,
        dentistIds
      );
      for (const row of dsRows) {
        if (!dentistServiceMap[row.dentist_id]) dentistServiceMap[row.dentist_id] = [];
        dentistServiceMap[row.dentist_id].push(row.service_id);
      }
      const [dsBranchRows] = await pool.query(
        `SELECT DISTINCT dentist_id, branch_id FROM dentist_schedules WHERE dentist_id IN (${placeholders})`,
        dentistIds
      );
      for (const row of dsBranchRows) {
        if (!dentistBranchMap[row.dentist_id]) dentistBranchMap[row.dentist_id] = [];
        dentistBranchMap[row.dentist_id].push(row.branch_id);
      }
    }
    const annotatedDentists = dentists.map(d => ({
      ...d,
      service_ids: dentistServiceMap[d.id] || [],
      branch_ids: dentistBranchMap[d.id] || [],
    }));

    res.json({ services: annotatedServices, branches, dentists: annotatedDentists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/_meta/dentist-busy-slots', async (req, res) => {
  const { dentist_id, date } = req.query;
  if (!dentist_id || !date) {
    return res.status(400).json({ message: 'dentist_id and date are required' });
  }
  const dentistId = parseInt(dentist_id, 10);
  if (!dentistId) return res.status(400).json({ message: 'Invalid dentist_id' });

  const dateParts = date.split('-').map(Number);
  if (dateParts.length !== 3 || dateParts.some(Number.isNaN)) {
    return res.status(400).json({ message: 'date must be YYYY-MM-DD' });
  }
  const [y, mo, d] = dateParts;
  const dayStart = new Date(y, mo - 1, d, 0, 0, 0, 0);
  const dayEnd = new Date(y, mo - 1, d + 1, 0, 0, 0, 0);

  try {
    let leave = null;
    try {
      leave = await getApprovedLeaveForDentistOnDate(pool, dentistId, String(date).slice(0, 10));
    } catch (_) {
      leave = null;
    }

    const [rows] = await pool.query(
      `SELECT start_time, duration_min, status FROM appointments
       WHERE dentist_id = ?
         AND status IN ('scheduled','arrived')
         AND start_time >= ? AND start_time < ?`,
      [dentistId, toMySQLDateTime(dayStart), toMySQLDateTime(dayEnd)]
    );
    res.json({
      appointments: rows,
      on_leave: !!leave,
      leave: leave
        ? {
            id: leave.id,
            date_from: String(leave.date_from).slice(0, 10),
            date_to: String(leave.date_to).slice(0, 10),
            reason: leave.reason || null,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  const { branch_id, from, to, dentist_id, patient_id, status } = req.query;
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  try {
    const conditions = [];
    const params = [];

    if (role === 'patient') {
      conditions.push('a.patient_id = ?');
      params.push(userId);
    } else if (role === 'dentist') {
      conditions.push('a.dentist_id = ?');
      params.push(userId);
    } else if (role === 'receptionist' || role === 'admin') {
      if (userBranches.length === 0) {
        return res.json({ appointments: [] });
      }
      conditions.push(`a.branch_id IN (${userBranches.map(() => '?').join(',')})`);
      params.push(...userBranches);

      if (branch_id) {
        const requestedBranch = parseInt(branch_id, 10);
        if (!userBranches.includes(requestedBranch)) {
          return res.status(403).json({ message: 'No access to this branch' });
        }
        conditions.push('a.branch_id = ?');
        params.push(requestedBranch);
      }
    }

    if (from) {
      conditions.push('a.start_time >= ?');
      params.push(toMySQLDateTime(parseISOToDate(from)));
    }
    if (to) {
      conditions.push('a.start_time < ?');
      params.push(toMySQLDateTime(parseISOToDate(to)));
    }
    if (dentist_id) {
      conditions.push('a.dentist_id = ?');
      params.push(parseInt(dentist_id, 10));
    }
    if (patient_id) {
      conditions.push('a.patient_id = ?');
      params.push(parseInt(patient_id, 10));
    }
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT
         a.id, a.branch_id, a.patient_id, a.dentist_id, a.service_id,
         a.start_time, a.duration_min, a.status, a.dentist_note,
         a.cancellation_reason, a.cancelled_by, a.created_at,
         b.name AS branch_name, b.address AS branch_address,
         p.name AS patient_name, p.email AS patient_email,
         d.name AS dentist_name,
         s.name AS service_name, s.price AS service_price,
         pay.id AS payment_id, pay.status AS payment_status,
         pay.amount AS payment_amount, pay.payment_method,
         pay.ewallet_provider, pay.reference_number, pay.receipt_url,
         pay.receipt_uploaded_at, pay.paid_at, pay.verified_at,
         pay.rejection_reason
       FROM appointments a
       JOIN branches b ON b.id = a.branch_id
       JOIN users p ON p.id = a.patient_id
       JOIN users d ON d.id = a.dentist_id
       JOIN services s ON s.id = a.service_id
       LEFT JOIN (
         SELECT p1.*
         FROM payments p1
         JOIN (
           SELECT appointment_id, MAX(id) AS id
           FROM payments
           GROUP BY appointment_id
         ) latest ON latest.id = p1.id
       ) pay ON pay.appointment_id = a.id
       ${whereClause}
       ORDER BY a.start_time ASC`,
      params
    );

    res.json({ appointments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  try {
    const [rows] = await pool.query(
      `SELECT a.*, b.name AS branch_name, b.address AS branch_address, p.name AS patient_name,
              d.name AS dentist_name, s.name AS service_name, s.price AS service_price
       FROM appointments a
       JOIN branches b ON b.id = a.branch_id
       JOIN users p ON p.id = a.patient_id
       JOIN users d ON d.id = a.dentist_id
       JOIN services s ON s.id = a.service_id
       WHERE a.id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });
    const appt = rows[0];

    if (role === 'patient' && appt.patient_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (role === 'dentist' && appt.dentist_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if ((role === 'receptionist' || role === 'admin') && !userBranches.includes(appt.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    res.json({ appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireRole('receptionist', 'admin', 'patient'), async (req, res) => {
  const { branch_id, patient_id, dentist_id, service_id, start_time, reschedule_appointment_id, initial_status, note } = req.body;
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];
  const effectiveBranchId =
    role === 'patient'
      ? Number(branch_id)
      : Number(branch_id || userBranches[0]);

  if (!effectiveBranchId || !dentist_id || !service_id || !start_time) {
    return res.status(400).json({ message: 'branch, dentist_id, service_id, and start_time are required' });
  }

  const effectivePatientId = role === 'patient' ? userId : patient_id;
  if (!effectivePatientId) {
    return res.status(400).json({ message: 'patient_id is required when staff create appointments' });
  }

  if ((role === 'receptionist' || role === 'admin') && !userBranches.includes(effectiveBranchId)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [services] = await pool.query(
      `SELECT id, duration_min FROM services WHERE id = ? AND status = 'Active'`,
      [service_id]
    );
    if (services.length === 0) return res.status(400).json({ message: 'Invalid service' });
    const service = services[0];

    const [offers] = await pool.query(
      'SELECT 1 FROM dentist_services WHERE dentist_id = ? AND service_id = ?',
      [dentist_id, service_id]
    );
    if (offers.length === 0) {
      return res.status(400).json({ message: 'This dentist does not offer the requested service' });
    }

    const start = parseISOToDate(start_time);
    const clinicDateKey = clinicDateKeyFromUtcDate(start);
    if (!clinicDateKey) {
      return res.status(400).json({ message: 'Invalid start_time' });
    }

    // Block scheduling a dentist who is on an approved leave for the requested clinic date.
    const leave = await getApprovedLeaveForDentistOnDate(pool, Number(dentist_id), clinicDateKey);
    if (leave) {
      return res.status(409).json({
        message: `This dentist is on approved leave on ${clinicDateKey}. Please choose another date or dentist.`,
        leave: { from: String(leave.date_from).slice(0, 10), to: String(leave.date_to).slice(0, 10) },
      });
    }

    const blockedEnd = addMinutes(
      start,
      service.duration_min + APPOINTMENT_BUFFER_MINUTES
    );

    // Block conflicts with website-submitted (online) holds for the same branch + time window
    try {
      const [onlineConflicts] = await pool.query(
        `SELECT o.id
         FROM online_appointments_tbl o
         JOIN branches b ON b.id = ?
         WHERE TRIM(REPLACE(o.location, ' Branch', '')) = b.address
           AND o.status IN ('Pending', 'Confirmed')
           AND TIMESTAMP(o.appointment_date, o.appointment_time) < ?
           AND TIMESTAMPADD(MINUTE, IFNULL(o.duration_minutes, 30) + ?, TIMESTAMP(o.appointment_date, o.appointment_time)) > ?
         LIMIT 1`,
        [
          effectiveBranchId,
          toMySQLDateTime(blockedEnd),
          APPOINTMENT_BUFFER_MINUTES,
          toMySQLDateTime(start),
        ]
      );
      if (onlineConflicts.length > 0) {
        return res.status(409).json({ message: 'This time slot is already reserved by an online booking request' });
      }
    } catch (onlineErr) {
      // If the online table doesn't exist in a local/dev DB, ignore rather than breaking appointment creation.
      if (onlineErr?.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Online booking conflict check failed:', onlineErr);
      }
    }

    const [conflicts] = await pool.query(
      `SELECT id FROM appointments
       WHERE dentist_id = ? AND status IN ('scheduled','arrived')
          AND start_time < ?
         AND TIMESTAMPADD(MINUTE, duration_min + ?, start_time) > ?`,
      [
        dentist_id,
        toMySQLDateTime(blockedEnd),
        APPOINTMENT_BUFFER_MINUTES,
        toMySQLDateTime(start),
      ]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'This dentist already has an appointment at that time' });
    }

    // Validate and cancel old appointment when rescheduling
    let isReschedule = false;
    let oldAppt = null;
    if (reschedule_appointment_id) {
      const rescheduleId = parseInt(reschedule_appointment_id, 10);
      const [oldRows] = await pool.query(
        'SELECT * FROM appointments WHERE id = ? AND status = ?',
        [rescheduleId, 'scheduled']
      );
      if (oldRows.length === 0) {
        return res.status(400).json({ message: 'Original appointment not found or not reschedulable' });
      }
      oldAppt = oldRows[0];
      if (role === 'patient' && oldAppt.patient_id !== effectivePatientId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      await pool.query(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`, [rescheduleId]);
      isReschedule = true;
    }

    const effectiveStatus =
      (role === 'receptionist' || role === 'admin') && initial_status === 'arrived'
        ? 'arrived'
        : 'scheduled';

    const insertColumns = ['branch_id', 'patient_id', 'dentist_id', 'service_id', 'start_time', 'duration_min', 'status'];
    const insertValues = [effectiveBranchId, effectivePatientId, dentist_id, service_id, toMySQLDateTime(start), service.duration_min, effectiveStatus];
    const normalizedNote = typeof note === 'string' ? note.trim() : '';
    if (normalizedNote) {
      insertColumns.push('dentist_note');
      insertValues.push(normalizedNote);
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (${insertColumns.join(', ')})
       VALUES (${insertColumns.map(() => '?').join(', ')})`,
      insertValues
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'appointment_created', ?, ?)`,
      [userId, effectiveBranchId, JSON.stringify({
        appointment_id: result.insertId,
        patient_id: effectivePatientId,
        dentist_id,
        service_id,
        start_time: toMySQLDateTime(start),
        created_by_role: role,
        reschedule_of: reschedule_appointment_id || null,
      })]
    );

    // Notify the assigned dentist
    try {
      const [[detail]] = await pool.query(
        `SELECT u.name AS patient_name, s.name AS service_name
         FROM appointments a
         JOIN users u ON u.id = a.patient_id
         JOIN services s ON s.id = a.service_id
         WHERE a.id = ?`,
        [result.insertId]
      );
      const schedule = new Date(start).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
      });

      if (isReschedule) {
        await notifyDentist(dentist_id, {
          type: 'appointment_rescheduled',
          title: 'Appointment rescheduled',
          body: `${detail.patient_name} rescheduled their ${detail.service_name} appointment to ${schedule}.`,
          relatedType: 'appointment',
          relatedId: result.insertId,
        });
      } else {
        await notifyDentist(dentist_id, {
          type: 'appointment_new',
          title: 'New appointment booked',
          body: `${detail.patient_name} booked a ${detail.service_name} for ${schedule}.`,
          relatedType: 'appointment',
          relatedId: result.insertId,
        });
      }
    } catch (notificationErr) {
      console.error('Failed to create dentist notification:', notificationErr);
    }

    res.status(201).json({ id: result.insertId, message: isReschedule ? 'Appointment rescheduled' : 'Appointment created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/cancel', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];
  const { reason } = req.body || {};

  try {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });
    const appt = rows[0];

    if (appt.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot cancel an appointment that is ${appt.status}` });
    }

    if (role === 'patient' && appt.patient_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (role === 'dentist' && appt.dentist_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if ((role === 'receptionist' || role === 'admin') && !userBranches.includes(appt.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query(
      `UPDATE appointments SET status = 'cancelled', cancellation_reason = ?, cancelled_by = ? WHERE id = ?`,
      [reason || null, role, id]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'appointment_cancelled', ?, ?)`,
      [userId, appt.branch_id, JSON.stringify({ appointment_id: id, cancelled_by_role: role, reason: reason || null })]
    );

    if (role === 'patient') {
      const [details] = await pool.query(
        `SELECT u.name AS patient_name, s.name AS service_name, a.start_time
         FROM appointments a
         JOIN users u ON u.id = a.patient_id
         JOIN services s ON s.id = a.service_id
         WHERE a.id = ?`,
        [id]
      );
      const detail = details[0] || {};
      const schedule = detail.start_time
        ? new Date(detail.start_time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'their scheduled time';

      try {
        const cancellationNotif = {
          type: 'appointment_cancelled',
          title: 'Appointment cancelled by patient',
          body: `${detail.patient_name || 'A patient'} cancelled ${detail.service_name || 'an appointment'} for ${schedule}.`,
          relatedType: 'appointment',
          relatedId: id,
        };
        await Promise.all([
          notifyBranchReceptionists(appt.branch_id, cancellationNotif),
          notifyDentist(appt.dentist_id, cancellationNotif),
        ]);
      } catch (notificationErr) {
        console.error('Failed to create cancellation notification:', notificationErr);
      }
    }

    if (role === 'receptionist' || role === 'admin') {
      const [details] = await pool.query(
        `SELECT s.name AS service_name, a.start_time
         FROM appointments a
         JOIN services s ON s.id = a.service_id
         WHERE a.id = ?`,
        [id]
      );
      const detail = details[0] || {};
      const schedule = detail.start_time
        ? new Date(detail.start_time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        : 'your scheduled time';
      const notifBody = reason
        ? `Your ${detail.service_name || 'appointment'} on ${schedule} has been cancelled. Reason: ${reason}`
        : `Your ${detail.service_name || 'appointment'} on ${schedule} has been cancelled by the clinic.`;

      try {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
           VALUES (?, 'appointment_cancelled_by_staff', 'Appointment Cancelled', ?, 'appointment', ?)`,
          [appt.patient_id, notifBody, id]
        );
        sendPushToUser(appt.patient_id, { title: 'Appointment Cancelled', body: notifBody, data: { type: 'appointment_cancelled_by_staff', appointment_id: id } }).catch(() => {});
      } catch (notificationErr) {
        console.error('Failed to create patient cancellation notification:', notificationErr);
      }
    }

    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', requireRole('receptionist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  if (!['arrived', 'completed', 'no_show'].includes(status)) {
    return res.status(400).json({ message: 'Status must be arrived, completed, or no_show' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });
    const appt = rows[0];

    if (role === 'receptionist' && !userBranches.includes(appt.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }
    const allowedTransitions = {
      scheduled: ['arrived', 'no_show'],
      arrived: ['completed', 'no_show'],
    };
    const nextStatuses = allowedTransitions[appt.status] || [];

    if (!nextStatuses.includes(status)) {
      return res.status(400).json({ message: `Cannot mark a ${appt.status} appointment as ${status}` });
    }

    await pool.query(`UPDATE appointments SET status = ? WHERE id = ?`, [status, id]);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'appointment_status_changed', ?, ?)`,
      [userId, appt.branch_id, JSON.stringify({ appointment_id: id, new_status: status })]
    );

    res.json({ message: `Appointment marked ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/note', requireRole('dentist'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { note } = req.body;
  const userId = req.user.user_id;

  try {
    const [rows] = await pool.query('SELECT dentist_id, status FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });
    const appt = rows[0];

    if (appt.dentist_id !== userId) {
      return res.status(403).json({ message: 'You are not the dentist for this appointment' });
    }
    if (appt.status !== 'completed') {
      return res.status(400).json({ message: 'Can only add notes to completed appointments' });
    }

    await pool.query('UPDATE appointments SET dentist_note = ? WHERE id = ?', [note || null, id]);
    res.json({ message: 'Note saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Pre-flight conflict check used by the AI booking assistant before calling OpenAI.
// Checks (1) whether the patient already has an overlapping appointment and
// (2) whether the branch has a dentist free at the requested time.
// Returns the next available slot from CSP/weighted scoring when a conflict exists.
router.post('/conflict-check', requireRole('patient'), async (req, res) => {
  const { branch_id, service_id, requested_start, duration_min } = req.body;
  const patientId = req.user.user_id;
  const BUFFER = 15;

  if (!branch_id || !requested_start) {
    return res.status(400).json({ message: 'branch_id and requested_start are required.' });
  }

  let reqStart;
  try {
    reqStart = parseISOToDate(requested_start);
  } catch {
    return res.status(400).json({ message: 'Invalid requested_start.' });
  }

  const effectiveDuration = Math.max(15, parseInt(duration_min, 10) || 30);
  const reqEnd = addMinutes(reqStart, effectiveDuration + BUFFER);

  try {
    // 1. Patient-schedule conflict: does the patient already have an appointment
    //    whose window (duration + buffer) overlaps the requested window?
    const [patientConflicts] = await pool.query(
      `SELECT a.id, a.start_time, a.duration_min, sv.name AS service_name
       FROM appointments a
       JOIN services sv ON sv.id = a.service_id
       WHERE a.patient_id = ?
         AND a.status IN ('scheduled', 'arrived')
         AND a.start_time < ?
         AND DATE_ADD(a.start_time, INTERVAL (a.duration_min + ?) MINUTE) > ?`,
      [patientId, toMySQLDateTime(reqEnd), BUFFER, toMySQLDateTime(reqStart)]
    );

    const hasPatientConflict = patientConflicts.length > 0;

    // 2. Resolve a usable service_id for the slot-suggestion pass.
    //    If no service was supplied (text-input path), pick the first active service
    //    offered at this branch so we can still run the CSP scheduler.
    let effectiveServiceId = service_id ? parseInt(service_id, 10) : null;
    if (!effectiveServiceId) {
      const [anyService] = await pool.query(
        `SELECT ds.service_id
         FROM dentist_services ds
         JOIN users u ON u.id = ds.dentist_id
         LEFT JOIN user_branches ub ON ub.user_id = ds.dentist_id
         WHERE u.role = 'dentist' AND u.status = 'Active'
           AND (u.home_branch_id = ? OR ub.branch_id = ?)
         LIMIT 1`,
        [branch_id, branch_id]
      );
      effectiveServiceId = anyService[0]?.service_id || null;
    }

    // 3. Run the CSP scheduler to find the next available slot and detect
    //    branch-level unavailability (no dentist free within 15 min of request).
    let nextAvailable = null;
    let branchConflict = false;

    if (effectiveServiceId) {
      const from = startOfUTCDay(reqStart);
      const to = new Date(from.getTime() + 8 * 24 * 60 * 60 * 1000);

      const slotResult = await suggestSlots({
        patientId,
        branchId: parseInt(branch_id, 10),
        serviceId: effectiveServiceId,
        fromDate: from.toISOString(),
        toDate: to.toISOString(),
        preferredStartDate: reqStart,
        limit: 1,
      });

      const best = slotResult.suggestions?.[0] || null;
      const distance = best?.distance_to_preferred_minutes ?? 999;
      branchConflict = distance > 15;
      nextAvailable = best;
    }

    if (hasPatientConflict || branchConflict) {
      return res.json({
        conflict: true,
        conflict_type: hasPatientConflict ? 'patient_schedule' : 'branch_unavailable',
        existing: hasPatientConflict ? patientConflicts[0] : null,
        next_available: nextAvailable,
      });
    }

    return res.json({ conflict: false });
  } catch (err) {
    console.error('[conflict-check]', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/suggest', async (req, res) => {
  const { branch_id, service_id, from, to, patient_id, preferred_start } = req.body;
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  if (!branch_id || !service_id || !from || !to) {
    return res.status(400).json({ message: 'branch_id, service_id, from, and to are required' });
  }

  // For staff, patient_id is optional; 0 means no patient-preference weighting
  const effectivePatientId = role === 'patient' ? userId : (patient_id || 0);

  if ((role === 'receptionist' || role === 'admin') && !userBranches.includes(branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const result = await suggestSlots({
      patientId: effectivePatientId,
      branchId: branch_id,
      serviceId: service_id,
      fromDate: from,
      toDate: to,
      preferredStartDate: preferred_start,
      limit: 3,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

router.get('/_meta/my-patients', requireRole('dentist', 'admin'), async (req, res) => {
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  try {
    let query;
    let params;

    if (role === 'dentist') {
      query = `
        SELECT DISTINCT u.id,
               COALESCE(pp.full_name, u.name) AS name,
               COALESCE(pp.email, u.email) AS email,
               COALESCE(pp.contact_number, u.phone) AS phone,
               pp.age,
               pp.sex AS gender,
               MAX(a.start_time) AS last_visit,
               COUNT(a.id) AS total_appointments
        FROM users u
        JOIN appointments a ON a.patient_id = u.id
        LEFT JOIN patient_profile pp ON pp.user_id = u.id
        WHERE u.role = 'patient' AND a.dentist_id = ?
        GROUP BY u.id, name, email, phone, pp.age, pp.sex
        ORDER BY last_visit DESC
      `;
      params = [userId];
    } else {
      if (userBranches.length === 0) return res.json({ patients: [] });
      query = `
        SELECT DISTINCT u.id,
               COALESCE(pp.full_name, u.name) AS name,
               COALESCE(pp.email, u.email) AS email,
               COALESCE(pp.contact_number, u.phone) AS phone,
               pp.age,
               pp.sex AS gender,
               MAX(a.start_time) AS last_visit,
               COUNT(a.id) AS total_appointments
        FROM users u
        JOIN appointments a ON a.patient_id = u.id
        LEFT JOIN patient_profile pp ON pp.user_id = u.id
        WHERE u.role = 'patient' AND a.branch_id IN (${userBranches.map(() => '?').join(',')})
        GROUP BY u.id, name, email, phone, pp.age, pp.sex
        ORDER BY last_visit DESC
      `;
      params = userBranches;
    }

    const [rows] = await pool.query(query, params);
    res.json({ patients: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
