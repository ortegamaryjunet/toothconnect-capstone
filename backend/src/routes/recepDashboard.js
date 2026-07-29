const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('receptionist', 'admin'));

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function emptyNumberArray(length) {
  return Array.from({ length }, () => 0);
}

function formatSqlDate(year, month, day) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

router.get('/', async (req, res) => {
  const userBranches = req.user.branches || [];

  if (userBranches.length === 0) {
    return res.json({
      stats: {
        totalPatients: 0,
        totalAppointments: 0,
        rescheduledAppointments: 0,
        pendingAppointments: 0,
        activeDentists: 0,
        cancelledAppointments: 0,
      },
      patientVisits: { newPatients: [], returningPatients: [] },
    });
  }

  const now = new Date();
  const visitMonth = Math.min(
    Math.max(parsePositiveInt(req.query.visit_month, now.getMonth() + 1), 1),
    12
  );
  const visitYear = parsePositiveInt(req.query.visit_year, now.getFullYear());
  const lastVisitDay = new Date(visitYear, visitMonth, 0).getDate();
  const visitStart = formatSqlDate(visitYear, visitMonth, 1);
  const visitEnd = formatSqlDate(visitYear, visitMonth, lastVisitDay);

  const ph = userBranches.map(() => '?').join(',');

  try {
    const [[patientRow]] = await pool.query(
      `SELECT COUNT(DISTINCT patient_id) AS total
       FROM appointments
       WHERE branch_id IN (${ph})`,
      userBranches
    );

    const [[appointmentRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM appointments a
       WHERE a.branch_id IN (${ph})
         AND NOT EXISTS (
           SELECT 1
           FROM audit_logs al
           WHERE al.action = 'appointment_created'
             AND CAST(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.reschedule_of')) AS UNSIGNED) = a.id
         )`,
      userBranches
    );

    const [[rescheduledRow]] = await pool.query(
      `SELECT COUNT(DISTINCT a.id) AS total
       FROM appointments a
       WHERE a.branch_id IN (${ph})
         AND a.status = 'scheduled'
         AND (
           EXISTS (
             SELECT 1
             FROM audit_logs al
             WHERE al.action = 'appointment_created'
               AND CAST(JSON_UNQUOTE(JSON_EXTRACT(al.details, '$.appointment_id')) AS UNSIGNED) = a.id
               AND JSON_EXTRACT(al.details, '$.reschedule_of') IS NOT NULL
           )
           OR a.dentist_note REGEXP '(^|[[:space:]])Rescheduled[[:space:]]*:'
         )`,
      userBranches
    );

    const [[pendingRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM appointments
       WHERE branch_id IN (${ph}) AND status = 'scheduled'`,
      userBranches
    );

    const [[cancelledRow]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM appointments
       WHERE branch_id IN (${ph}) AND status = 'cancelled'`,
      userBranches
    );

    // Active dentists are those with at least one schedule slot in this branch
    const [[dentistRow]] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) AS total
       FROM users u
       JOIN dentist_schedules ds ON ds.dentist_id = u.id
       WHERE u.role = 'dentist'
         AND u.status = 'Active'
         AND ds.branch_id IN (${ph})`,
      userBranches
    );

    // Weekly visit breakdown: new patient = first appointment ever, returning = any after first
    const [visitRows] = await pool.query(
      `SELECT
         FLOOR((DAY(a.start_time) - 1) / 7) AS week_index,
         SUM(CASE WHEN a.start_time = fv.first_start THEN 1 ELSE 0 END) AS new_patients,
         SUM(CASE WHEN a.start_time <> fv.first_start THEN 1 ELSE 0 END) AS returning_patients
       FROM appointments a
       JOIN (
         SELECT patient_id, MIN(start_time) AS first_start
         FROM appointments
         GROUP BY patient_id
       ) fv ON fv.patient_id = a.patient_id
       WHERE DATE(a.start_time) BETWEEN ? AND ?
         AND a.branch_id IN (${ph})
       GROUP BY week_index
       ORDER BY week_index ASC`,
      [visitStart, visitEnd, ...userBranches]
    );

    const weekCount = Math.ceil(lastVisitDay / 7);
    const newPatients = emptyNumberArray(weekCount);
    const returningPatients = emptyNumberArray(weekCount);

    visitRows.forEach((row) => {
      const index = Number(row.week_index);
      if (index >= 0 && index < weekCount) {
        newPatients[index] = Number(row.new_patients || 0);
        returningPatients[index] = Number(row.returning_patients || 0);
      }
    });

    res.json({
      stats: {
        totalPatients: Number(patientRow.total || 0),
        totalAppointments: Number(appointmentRow.total || 0),
        rescheduledAppointments: Number(rescheduledRow.total || 0),
        pendingAppointments: Number(pendingRow.total || 0),
        activeDentists: Number(dentistRow.total || 0),
        cancelledAppointments: Number(cancelledRow.total || 0),
      },
      patientVisits: { newPatients, returningPatients },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
