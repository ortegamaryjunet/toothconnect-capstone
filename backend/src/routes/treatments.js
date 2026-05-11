const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/by-patient/:patientId', async (req, res) => {
  const patientId = parseInt(req.params.patientId, 10);
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  try {
    if (role === 'patient' && userId !== patientId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (role === 'dentist') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
        [userId, patientId]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'You have no appointments with this patient' });
      }
    }

    if (role === 'receptionist' || role === 'admin') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments
         WHERE patient_id = ? AND branch_id IN (${userBranches.map(() => '?').join(',') || 'NULL'})
         LIMIT 1`,
        [patientId, ...userBranches]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'No appointments at your branch for this patient' });
      }
    }

    const [rows] = await pool.query(
      `SELECT
         t.id, t.appointment_id, t.dentist_id, t.tooth_number,
         t.condition_type, t.notes, t.created_at,
         a.start_time AS appointment_date, a.service_id,
         d.name AS dentist_name,
         s.name AS service_name
       FROM treatments t
       JOIN appointments a ON a.id = t.appointment_id
       JOIN users d ON d.id = t.dentist_id
       JOIN services s ON s.id = a.service_id
       WHERE a.patient_id = ?
       ORDER BY t.tooth_number ASC, t.created_at DESC`,
      [patientId]
    );

    const byTooth = {};
    for (const r of rows) {
      const tooth = r.tooth_number;
      if (!byTooth[tooth]) byTooth[tooth] = [];
      byTooth[tooth].push(r);
    }

    res.json({ patient_id: patientId, treatments: rows, by_tooth: byTooth });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireRole('dentist', 'admin'), async (req, res) => {
  const { appointment_id, tooth_number, condition_type, notes } = req.body;
  const userId = req.user.user_id;
  const role = req.user.role;

  if (!appointment_id || !tooth_number || !condition_type) {
    return res.status(400).json({ message: 'appointment_id, tooth_number, and condition_type are required' });
  }

  if (tooth_number < 11 || tooth_number > 48) {
    return res.status(400).json({ message: 'tooth_number must be valid FDI notation (11-48)' });
  }

  try {
    const [appts] = await pool.query('SELECT * FROM appointments WHERE id = ?', [appointment_id]);
    if (appts.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    const appt = appts[0];

    if (role === 'dentist' && appt.dentist_id !== userId) {
      return res.status(403).json({ message: 'You can only add treatments to your own appointments' });
    }

    const [result] = await pool.query(
      `INSERT INTO treatments (appointment_id, dentist_id, tooth_number, condition_type, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [appointment_id, appt.dentist_id, tooth_number, condition_type, notes || null]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'treatment_created', ?, ?)`,
      [userId, appt.branch_id, JSON.stringify({
        treatment_id: result.insertId,
        appointment_id,
        patient_id: appt.patient_id,
        tooth_number,
        condition_type,
      })]
    );

    res.status(201).json({ id: result.insertId, message: 'Treatment created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireRole('dentist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user.user_id;
  const role = req.user.role;

  try {
    const [rows] = await pool.query('SELECT * FROM treatments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Not found' });
    const t = rows[0];

    if (role === 'dentist' && t.dentist_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own treatments' });
    }

    await pool.query('DELETE FROM treatments WHERE id = ?', [id]);

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, 'treatment_deleted', ?)`,
      [userId, JSON.stringify({ treatment_id: id, tooth_number: t.tooth_number })]
    );

    res.json({ message: 'Treatment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/conditions', (req, res) => {
  res.json({
    conditions: [
      { code: 'healthy',       label: 'Healthy',         color: '#cbd5e0' },
      { code: 'caries',        label: 'Caries (cavity)', color: '#fc8181' },
      { code: 'filling',       label: 'Filling',         color: '#90cdf4' },
      { code: 'crown',         label: 'Crown',           color: '#fbd38d' },
      { code: 'extraction',    label: 'Extracted',       color: '#2d3748' },
      { code: 'root_canal',    label: 'Root canal',      color: '#b794f4' },
      { code: 'sealant',       label: 'Sealant',         color: '#9ae6b4' },
      { code: 'implant',       label: 'Implant',         color: '#f687b3' },
      { code: 'in_progress',   label: 'In progress',     color: '#fbd38d' },
    ],
  });
});

module.exports = router;