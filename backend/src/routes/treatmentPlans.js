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
    if (role === 'patient') {
      if (patientId !== userId) {
        return res.status(403).json({ message: 'You can only view your own treatment plans' });
      }
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
      if (userBranches.length > 0) {
        const [check] = await pool.query(
          `SELECT 1 FROM appointments
           WHERE patient_id = ? AND branch_id IN (${userBranches.map(() => '?').join(',')})
           LIMIT 1`,
          [patientId, ...userBranches]
        );
        if (check.length === 0) {
          return res.status(403).json({ message: 'No appointments at your branch for this patient' });
        }
      }
    }

    const [rows] = await pool.query(
      `SELECT
         tp.id, tp.patient_id, tp.dentist_id, tp.tooth_number,
         tp.planned_treatment, tp.status, tp.notes, tp.date_completed,
         tp.created_at, tp.updated_at,
         d.name AS dentist_name
       FROM treatment_plans tp
       JOIN users d ON d.id = tp.dentist_id
       WHERE tp.patient_id = ?
       ORDER BY tp.tooth_number ASC, tp.created_at DESC`,
      [patientId]
    );

    res.json({ patient_id: patientId, plans: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireRole('dentist', 'admin'), async (req, res) => {
  const { patient_id, tooth_number, planned_treatment, status, notes, date_completed } = req.body;
  const userId = req.user.user_id;
  const role = req.user.role;

  if (!patient_id || !tooth_number || !planned_treatment) {
    return res.status(400).json({ message: 'patient_id, tooth_number, and planned_treatment are required' });
  }

  if (tooth_number < 11 || tooth_number > 48) {
    return res.status(400).json({ message: 'tooth_number must be valid FDI notation (11–48)' });
  }

  const allowedStatuses = ['planned', 'in_progress', 'completed'];
  const planStatus = status && allowedStatuses.includes(status) ? status : 'planned';

  try {
    if (role === 'dentist') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
        [userId, patient_id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'You have no appointments with this patient' });
      }
    }

    const dentistId = role === 'admin'
      ? (req.body.dentist_id || userId)
      : userId;

    const [result] = await pool.query(
      `INSERT INTO treatment_plans
         (patient_id, dentist_id, tooth_number, planned_treatment, status, notes, date_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        dentistId,
        tooth_number,
        planned_treatment.trim(),
        planStatus,
        notes ? notes.trim() : null,
        date_completed || null,
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Treatment plan created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/bulk', requireRole('dentist', 'admin'), async (req, res) => {
  const { patient_id, tooth_numbers, planned_treatment, status, notes, date_completed } = req.body;
  const userId = req.user.user_id;
  const role = req.user.role;

  if (!patient_id || !Array.isArray(tooth_numbers) || tooth_numbers.length === 0 || !planned_treatment) {
    return res.status(400).json({ message: 'patient_id, tooth_numbers (array), and planned_treatment are required' });
  }

  const validTeeth = tooth_numbers.filter(t => Number.isInteger(t) && t >= 11 && t <= 48);
  if (validTeeth.length === 0) {
    return res.status(400).json({ message: 'No valid FDI tooth numbers provided (11–48)' });
  }

  const allowedStatuses = ['planned', 'in_progress', 'completed'];
  const planStatus = status && allowedStatuses.includes(status) ? status : 'planned';

  try {
    if (role === 'dentist') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
        [userId, patient_id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'You have no appointments with this patient' });
      }
    }

    const dentistId = role === 'admin' ? (req.body.dentist_id || userId) : userId;
    const cleanTreatment = planned_treatment.trim();
    const cleanNotes = notes ? notes.trim() : null;

    const values = validTeeth.map(tooth => [
      patient_id,
      dentistId,
      tooth,
      cleanTreatment,
      planStatus,
      cleanNotes,
      date_completed || null,
    ]);

    await pool.query(
      `INSERT INTO treatment_plans
         (patient_id, dentist_id, tooth_number, planned_treatment, status, notes, date_completed)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ message: `${validTeeth.length} treatment plans created` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', requireRole('dentist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user.user_id;
  const role = req.user.role;
  const { planned_treatment, status, notes, date_completed } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM treatment_plans WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
    const plan = rows[0];

    if (role === 'dentist' && plan.dentist_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own treatment plans' });
    }

    const allowedStatuses = ['planned', 'in_progress', 'completed'];
    const planStatus = status && allowedStatuses.includes(status) ? status : plan.status;

    await pool.query(
      `UPDATE treatment_plans
       SET planned_treatment = ?,
           status = ?,
           notes = ?,
           date_completed = ?
       WHERE id = ?`,
      [
        planned_treatment ? planned_treatment.trim() : plan.planned_treatment,
        planStatus,
        notes !== undefined ? (notes ? notes.trim() : null) : plan.notes,
        date_completed !== undefined ? (date_completed || null) : plan.date_completed,
        id,
      ]
    );

    res.json({ message: 'Treatment plan updated' });
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
    const [rows] = await pool.query('SELECT * FROM treatment_plans WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
    const plan = rows[0];

    if (role === 'dentist' && plan.dentist_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own treatment plans' });
    }

    await pool.query('DELETE FROM treatment_plans WHERE id = ?', [id]);
    res.json({ message: 'Treatment plan deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;