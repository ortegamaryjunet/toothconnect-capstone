const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const cambra = require('../services/cambra');

const router = express.Router();

router.use(authenticate);

router.get('/factors', (req, res) => {
  const view = req.query.view || 'patient';

  if (view === 'full') {
    const role = req.user.role;
    if (role !== 'dentist' && role !== 'admin') {
      return res.status(403).json({ message: 'Only clinicians can request the full factor list' });
    }
    return res.json({ view: 'full', factors: cambra.getAllFactors() });
  }

  return res.json({ view: 'patient', factors: cambra.getPatientFactors() });
});

router.post('/', async (req, res) => {
  const { patient_id, factor_codes, related_assessment_id } = req.body;
  const role = req.user.role;
  const userId = req.user.user_id;

  const validation = cambra.validateFactorCodes(factor_codes);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }

  let effectivePatientId;
  let assessedByRole;

  if (role === 'patient') {
    effectivePatientId = userId;
    assessedByRole = 'patient';
  } else if (role === 'dentist' || role === 'admin') {
    if (!patient_id) {
      return res.status(400).json({ message: 'patient_id is required when a clinician submits' });
    }
    effectivePatientId = patient_id;
    assessedByRole = 'dentist';

    if (role === 'dentist') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
        [userId, patient_id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'You have no appointments with this patient' });
      }
    }
  } else {
    return res.status(403).json({ message: 'Only patients and clinicians can submit assessments' });
  }

  if (related_assessment_id && assessedByRole !== 'dentist') {
    return res.status(400).json({ message: 'Only clinicians can link to a self-assessment' });
  }

  const result = cambra.computeScore(factor_codes);

  try {
    const [insertRes] = await pool.query(
      `INSERT INTO risk_assessments
       (patient_id, assessed_by_role, assessed_by_user_id, related_assessment_id,
        score, risk_level, factors)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        effectivePatientId,
        assessedByRole,
        userId,
        related_assessment_id || null,
        result.score,
        result.risk_level,
        JSON.stringify(factor_codes),
      ]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, 'risk_assessment_created', ?)`,
      [userId, JSON.stringify({
        assessment_id: insertRes.insertId,
        patient_id: effectivePatientId,
        role: assessedByRole,
        score: result.score,
        risk_level: result.risk_level,
      })]
    );

    res.status(201).json({
      id: insertRes.insertId,
      patient_id: effectivePatientId,
      assessed_by_role: assessedByRole,
      score: result.score,
      risk_level: result.risk_level,
      breakdown: result.breakdown,
      recommendations: result.recommendations,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  const patientId = parseInt(req.params.patientId, 10);
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

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
    if (userBranches.length === 0) return res.json({ assessments: [] });
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

  try {
    const [rows] = await pool.query(
      `SELECT ra.id, ra.patient_id, ra.assessed_by_role, ra.assessed_by_user_id,
              ra.related_assessment_id, ra.score, ra.risk_level, ra.factors, ra.assessed_at,
              u.name AS assessor_name
       FROM risk_assessments ra
       LEFT JOIN users u ON u.id = ra.assessed_by_user_id
       WHERE ra.patient_id = ?
       ORDER BY ra.assessed_at DESC`,
      [patientId]
    );

    const enriched = rows.map(r => {
      const factor_codes = r.factors ? r.factors : [];
      const recompute = cambra.computeScore(factor_codes);
      return {
        ...r,
        factor_codes,
        breakdown: recompute.breakdown,
        recommendations: recompute.recommendations,
      };
    });

    res.json({ assessments: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/patient/:patientId/latest', async (req, res) => {
  const patientId = parseInt(req.params.patientId, 10);
  const requestedRole = req.query.role;

  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

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
    if (userBranches.length === 0) return res.json({ assessment: null });
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

  try {
    const conditions = ['ra.patient_id = ?'];
    const params = [patientId];

    if (requestedRole === 'patient' || requestedRole === 'dentist') {
      conditions.push('ra.assessed_by_role = ?');
      params.push(requestedRole);
    }

    const [rows] = await pool.query(
      `SELECT ra.id, ra.patient_id, ra.assessed_by_role, ra.assessed_by_user_id,
              ra.related_assessment_id, ra.score, ra.risk_level, ra.factors, ra.assessed_at,
              u.name AS assessor_name
       FROM risk_assessments ra
       LEFT JOIN users u ON u.id = ra.assessed_by_user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY ra.assessed_at DESC
       LIMIT 1`,
      params
    );

    if (rows.length === 0) {
      return res.json({ assessment: null });
    }

    const r = rows[0];
    const factor_codes = r.factors ? r.factors : [];
    const recompute = cambra.computeScore(factor_codes);

    res.json({
      assessment: {
        ...r,
        factor_codes,
        breakdown: recompute.breakdown,
        recommendations: recompute.recommendations,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;