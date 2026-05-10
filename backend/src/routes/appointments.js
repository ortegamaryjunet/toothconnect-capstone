const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const { toMySQLDateTime, parseISOToDate, addMinutes, rangesOverlap } = require('../utils/scheduling');
const { suggestSlots } = require('../services/scheduler');

const router = express.Router();

router.use(authenticate);

router.get('/_meta/services-and-branches', async (req, res) => {
  try {
    const [services] = await pool.query(
      `SELECT id, name, duration_min, price FROM services ORDER BY name ASC`
    );
    const [branches] = await pool.query(
      `SELECT id, name, address FROM branches ORDER BY name ASC`
    );
    res.json({ services, branches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', async (req, res) => {
  const { branch_id, from, to, dentist_id, status } = req.query;
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
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT
         a.id, a.branch_id, a.patient_id, a.dentist_id, a.service_id,
         a.start_time, a.duration_min, a.status, a.created_at,
         b.name AS branch_name,
         p.name AS patient_name, p.email AS patient_email,
         d.name AS dentist_name,
         s.name AS service_name, s.price AS service_price
       FROM appointments a
       JOIN branches b ON b.id = a.branch_id
       JOIN users p ON p.id = a.patient_id
       JOIN users d ON d.id = a.dentist_id
       JOIN services s ON s.id = a.service_id
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
      `SELECT a.*, b.name AS branch_name, p.name AS patient_name,
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
  const { branch_id, patient_id, dentist_id, service_id, start_time } = req.body;
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  if (!branch_id || !dentist_id || !service_id || !start_time) {
    return res.status(400).json({ message: 'branch_id, dentist_id, service_id, and start_time are required' });
  }

  const effectivePatientId = role === 'patient' ? userId : patient_id;
  if (!effectivePatientId) {
    return res.status(400).json({ message: 'patient_id is required when staff create appointments' });
  }

  if ((role === 'receptionist' || role === 'admin') && !userBranches.includes(branch_id)) {
    return res.status(403).json({ message: 'No access to this branch' });
  }

  try {
    const [services] = await pool.query('SELECT id, duration_min FROM services WHERE id = ?', [service_id]);
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
    const end = addMinutes(start, service.duration_min);

    const [conflicts] = await pool.query(
      `SELECT id FROM appointments
       WHERE dentist_id = ? AND status IN ('scheduled','completed')
         AND start_time < ? AND DATE_ADD(start_time, INTERVAL duration_min MINUTE) > ?`,
      [dentist_id, toMySQLDateTime(end), toMySQLDateTime(start)]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Time slot conflicts with an existing appointment' });
    }

    const [result] = await pool.query(
      `INSERT INTO appointments (branch_id, patient_id, dentist_id, service_id, start_time, duration_min, status)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`,
      [branch_id, effectivePatientId, dentist_id, service_id, toMySQLDateTime(start), service.duration_min]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'appointment_created', ?, ?)`,
      [userId, branch_id, JSON.stringify({
        appointment_id: result.insertId,
        patient_id: effectivePatientId,
        dentist_id,
        service_id,
        start_time: toMySQLDateTime(start),
        created_by_role: role,
      })]
    );

    res.status(201).json({ id: result.insertId, message: 'Appointment created' });
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

    await pool.query(`UPDATE appointments SET status = 'cancelled' WHERE id = ?`, [id]);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'appointment_cancelled', ?, ?)`,
      [userId, appt.branch_id, JSON.stringify({ appointment_id: id, cancelled_by_role: role })]
    );

    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/status', requireRole('dentist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const userId = req.user.user_id;

  if (!['completed', 'no_show'].includes(status)) {
    return res.status(400).json({ message: 'Status must be completed or no_show' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM appointments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Appointment not found' });
    const appt = rows[0];

    if (req.user.role === 'dentist' && appt.dentist_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (appt.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot change status of ${appt.status} appointment` });
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

router.post('/suggest', async (req, res) => {
  const { branch_id, service_id, from, to, patient_id } = req.body;
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  if (!branch_id || !service_id || !from || !to) {
    return res.status(400).json({ message: 'branch_id, service_id, from, and to are required' });
  }

  const effectivePatientId = role === 'patient' ? userId : patient_id;
  if (!effectivePatientId) {
    return res.status(400).json({ message: 'patient_id is required when staff request suggestions' });
  }

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
      limit: 3,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
});

module.exports = router;