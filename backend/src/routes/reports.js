const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

function normalizeDateRange(from, to) {
  return {
    fromDate: from || '1970-01-01',
    toDate: to || '2999-12-31',
  };
}

function formatDate(value) {
  if (!value) return 'N/A';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function formatBranchLocation(branchName, address) {
  const parts = String(address || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return branchName || 'Branch';
  }

  const cityPart = parts.find((part) => !/\d/.test(part)) || parts[parts.length - 1];
  return cityPart.replace(/\b(branch|clinic)\b/gi, '').trim() || cityPart;
}

function buildFeedbackBranchClause(branchId) {
  if (!branchId) {
    return { clause: '', params: [] };
  }

  const parsedBranchId = Number.parseInt(branchId, 10);

  if (Number.isNaN(parsedBranchId)) {
    const err = new Error('Invalid branch id');
    err.statusCode = 400;
    throw err;
  }

  return { clause: ' AND pf.branch_id = ?', params: [parsedBranchId] };
}

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

router.get('/admin-dashboard', async (req, res) => {
  const now = new Date();
  const visitMonth = Math.min(Math.max(parsePositiveInt(req.query.visit_month, now.getMonth() + 1), 1), 12);
  const visitYear = parsePositiveInt(req.query.visit_year, now.getFullYear());
  const incomeYear = parsePositiveInt(req.query.income_year, now.getFullYear());
  const lastVisitDay = new Date(visitYear, visitMonth, 0).getDate();
  const visitStart = formatSqlDate(visitYear, visitMonth, 1);
  const visitEnd = formatSqlDate(visitYear, visitMonth, lastVisitDay);

  try {
    const [[patientCount]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM users
       WHERE role = 'patient'`
    );

    const [[appointmentCount]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM appointments`
    );

    const [[employeeCount]] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM staff_profile
       WHERE status <> 'Archived'`
    );

    const [[revenueTotal]] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM payments
       WHERE status = 'verified'
         AND YEAR(COALESCE(paid_at, verified_at, created_at)) = ?`,
      [incomeYear]
    );

    const [visitRows] = await pool.query(
      `SELECT
         FLOOR((DAY(a.start_time) - 1) / 7) AS week_index,
         SUM(CASE WHEN a.start_time = first_visit.first_start THEN 1 ELSE 0 END) AS new_patients,
         SUM(CASE WHEN a.start_time <> first_visit.first_start THEN 1 ELSE 0 END) AS returning_patients
       FROM appointments a
       JOIN (
         SELECT patient_id, MIN(start_time) AS first_start
         FROM appointments
         GROUP BY patient_id
       ) first_visit ON first_visit.patient_id = a.patient_id
       WHERE DATE(a.start_time) BETWEEN ? AND ?
       GROUP BY week_index
       ORDER BY week_index ASC`,
      [visitStart, visitEnd]
    );

    const weekCount = Math.ceil(new Date(visitYear, visitMonth, 0).getDate() / 7);
    const newPatients = emptyNumberArray(weekCount);
    const returningPatients = emptyNumberArray(weekCount);

    visitRows.forEach((row) => {
      const index = Number(row.week_index);
      if (index >= 0 && index < weekCount) {
        newPatients[index] = Number(row.new_patients || 0);
        returningPatients[index] = Number(row.returning_patients || 0);
      }
    });

    const [stockRows] = await pool.query(
      `SELECT quantity, low_stock_threshold
       FROM supplies
       UNION ALL
       SELECT quantity, low_stock_threshold
       FROM medicines
       UNION ALL
       SELECT quantity, low_stock_threshold
       FROM equipment`
    );

    const stockSummary = stockRows.reduce(
      (summary, row) => {
        const quantity = Number(row.quantity || 0);
        const threshold = Number(row.low_stock_threshold || 0);

        summary.totalProduct += 1;

        if (quantity <= 0) {
          summary.outStock += 1;
        } else if (quantity <= threshold) {
          summary.lowStock += 1;
        } else {
          summary.inStock += 1;
        }

        return summary;
      },
      { totalProduct: 0, inStock: 0, lowStock: 0, outStock: 0 }
    );

    const [incomeRows] = await pool.query(
      `SELECT
         MONTH(COALESCE(paid_at, verified_at, created_at)) AS month_number,
         SUM(amount) AS total
       FROM payments
       WHERE status = 'verified'
         AND YEAR(COALESCE(paid_at, verified_at, created_at)) = ?
       GROUP BY month_number`,
      [incomeYear]
    );

    const [expenseRows] = await pool.query(
      `SELECT
         MONTH(expense_date) AS month_number,
         SUM(amount) AS total
       FROM clinic_expenses
       WHERE status = 'recorded'
         AND YEAR(expense_date) = ?
       GROUP BY month_number`,
      [incomeYear]
    );

    const income = emptyNumberArray(12);
    const expenses = emptyNumberArray(12);

    incomeRows.forEach((row) => {
      const index = Number(row.month_number) - 1;
      if (index >= 0 && index < 12) income[index] = Number(row.total || 0);
    });

    expenseRows.forEach((row) => {
      const index = Number(row.month_number) - 1;
      if (index >= 0 && index < 12) expenses[index] = Number(row.total || 0);
    });

    const expenseLabels = [
      'Rental',
      'Wages',
      'Dental Supplies',
      'Dental Equipment',
      'Medicines',
      'Others',
    ];
    const expenseBreakdown = Object.fromEntries(expenseLabels.map((label) => [label, 0]));

    const [expenseCategoryRows] = await pool.query(
      `SELECT category, SUM(amount) AS total
       FROM clinic_expenses
       WHERE status = 'recorded'
         AND YEAR(expense_date) = ?
       GROUP BY category`,
      [incomeYear]
    );

    expenseCategoryRows.forEach((row) => {
      const category = String(row.category || '').toLowerCase();
      let label = 'Others';

      if (category.includes('rent')) label = 'Rental';
      else if (category.includes('wage') || category.includes('salary') || category.includes('payroll')) label = 'Wages';
      else if (category.includes('equipment')) label = 'Dental Equipment';
      else if (category.includes('medicine') || category.includes('medication')) label = 'Medicines';
      else if (category.includes('supply') || category.includes('supplies')) label = 'Dental Supplies';

      expenseBreakdown[label] += Number(row.total || 0);
    });

    const [latestFeedbackRows] = await pool.query(
      `SELECT
         pf.id,
         pf.rating,
         pf.feedback,
         pf.submitted_at,
         COALESCE(pp.full_name, patient.name) AS patient_name,
         dentist.name AS dentist_name
       FROM patient_feedback pf
       JOIN users patient ON patient.id = pf.patient_id
       JOIN users dentist ON dentist.id = pf.dentist_id
       LEFT JOIN patient_profile pp ON pp.user_id = patient.id
       ORDER BY pf.submitted_at DESC
       LIMIT 3`
    );

    const [[feedbackSummary]] = await pool.query(
      `SELECT
         ROUND(AVG(rating), 2) AS average_rating,
         COUNT(*) AS total_feedback
       FROM patient_feedback`
    );

    const [ratingRows] = await pool.query(
      `SELECT rating, COUNT(*) AS total
       FROM patient_feedback
       GROUP BY rating`
    );

    const ratingCounts = [5, 4, 3, 2, 1].map((rating) => {
      const row = ratingRows.find((item) => Number(item.rating) === rating);
      return row ? Number(row.total || 0) : 0;
    });

    res.json({
      stats: {
        totalPatients: Number(patientCount.total || 0),
        totalAppointments: Number(appointmentCount.total || 0),
        totalEmployees: Number(employeeCount.total || 0),
        revenue: Number(revenueTotal.total || 0),
      },
      patientVisits: {
        newPatients,
        returningPatients,
      },
      stockSummary,
      incomeExpenses: {
        income,
        expenses,
      },
      expenseBreakdown: {
        labels: expenseLabels,
        data: expenseLabels.map((label) => expenseBreakdown[label]),
      },
      patientFeedback: latestFeedbackRows.map((row) => ({
        id: row.id,
        patientName: row.patient_name,
        dentistName: row.dentist_name,
        rating: Number(row.rating || 0),
        feedback: row.feedback || 'No written feedback.',
        submittedAt: formatDate(row.submitted_at),
      })),
      patientSatisfaction: {
        averageRating: Number(feedbackSummary.average_rating || 0),
        totalFeedback: Number(feedbackSummary.total_feedback || 0),
        ratingCounts,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/clinic-dentist-performance', async (req, res) => {
  const { branch_id, from, to } = req.query;

  try {
    const { fromDate, toDate } = normalizeDateRange(from, to);
    const joinConditions = [
      'a.dentist_id = u.id',
      'DATE(a.start_time) BETWEEN ? AND ?',
    ];
    const params = [fromDate, toDate];

    if (branch_id) {
      const branchId = Number.parseInt(branch_id, 10);

      if (Number.isNaN(branchId)) {
        return res.status(400).json({ message: 'Invalid branch id' });
      }

      joinConditions.push('a.branch_id = ?');
      params.push(branchId);
    }

    const [rows] = await pool.query(
      `SELECT
         u.id AS dentist_id,
         u.name AS dentist_name,
         COUNT(DISTINCT a.patient_id) AS total_patients,
         SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS treatments_done,
         MAX(CASE WHEN a.status = 'completed' THEN DATE(a.start_time) ELSE NULL END) AS latest_completed_date,
         MAX(DATE(a.start_time)) AS latest_appointment_date
       FROM users u
       LEFT JOIN appointments a ON ${joinConditions.join(' AND ')}
       WHERE u.role = 'dentist'
       GROUP BY u.id, u.name
       ORDER BY treatments_done DESC, total_patients DESC, u.name ASC`,
      params
    );

    const feedbackConditions = ['DATE(pf.submitted_at) BETWEEN ? AND ?'];
    const feedbackParams = [fromDate, toDate];

    if (branch_id) {
      feedbackConditions.push('pf.branch_id = ?');
      feedbackParams.push(Number.parseInt(branch_id, 10));
    }

    const feedbackWhereClause = `WHERE ${feedbackConditions.join(' AND ')}`;

    const [dentistRatingRows] = await pool.query(
      `SELECT
         pf.dentist_id,
         ROUND(AVG(pf.rating), 2) AS average_rating
       FROM patient_feedback pf
       ${feedbackWhereClause}
       GROUP BY pf.dentist_id`,
      feedbackParams
    );

    const dentistRatings = new Map(
      dentistRatingRows.map((row) => [
        Number(row.dentist_id),
        Number(row.average_rating || 0),
      ])
    );

    const [ratingRows] = await pool.query(
      `SELECT pf.rating, COUNT(*) AS total
       FROM patient_feedback pf
       ${feedbackWhereClause}
       GROUP BY pf.rating`,
      feedbackParams
    );

    const ratingCounts = [1, 2, 3, 4, 5].map((rating) => {
      const row = ratingRows.find((item) => Number(item.rating) === rating);
      return row ? Number(row.total || 0) : 0;
    });

    const reportRows = rows.map((row) => [
      `D-${String(row.dentist_id).padStart(3, '0')}`,
      row.dentist_name,
      String(Number(row.total_patients || 0)),
      String(Number(row.treatments_done || 0)),
      dentistRatings.has(Number(row.dentist_id))
        ? dentistRatings.get(Number(row.dentist_id)).toFixed(2)
        : 'N/A',
      formatDate(row.latest_completed_date || row.latest_appointment_date),
    ]);

    res.json({
      title: 'Clinic and Dentist Performance Reports',
      mainChartTitle: 'Completed Appointments by Dentist',
      statusChartTitle: 'Dentist Rating Distribution',
      labels: rows.map((row) => row.dentist_name),
      mainData: rows.map((row) => Number(row.treatments_done || 0)),
      statusLabels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      statusData: ratingCounts,
      headers: [
        'ID',
        'Dentist Name',
        'Total Patients',
        'Treatments Done',
        'Rating',
        'Date',
      ],
      rows: reportRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/patient-satisfaction', async (req, res) => {
  const { branch_id, from, to } = req.query;

  try {
    const { fromDate, toDate } = normalizeDateRange(from, to);
    const branch = buildFeedbackBranchClause(branch_id);

    const [feedbackRows] = await pool.query(
      `SELECT
         pf.id,
         pf.appointment_id,
         pf.rating,
         pf.feedback,
         pf.submitted_at,
         b.name AS branch_name,
         COALESCE(pp.full_name, patient.name) AS patient_name,
         dentist.name AS dentist_name
       FROM patient_feedback pf
       JOIN branches b ON b.id = pf.branch_id
       JOIN users patient ON patient.id = pf.patient_id
       JOIN users dentist ON dentist.id = pf.dentist_id
       LEFT JOIN patient_profile pp ON pp.user_id = patient.id
       WHERE DATE(pf.submitted_at) BETWEEN ? AND ? ${branch.clause}
       ORDER BY pf.submitted_at DESC`,
      [fromDate, toDate, ...branch.params]
    );

    const [dentistRows] = await pool.query(
      `SELECT
         dentist.name AS dentist_name,
         ROUND(AVG(pf.rating), 2) AS average_rating
       FROM patient_feedback pf
       JOIN users dentist ON dentist.id = pf.dentist_id
       WHERE DATE(pf.submitted_at) BETWEEN ? AND ? ${branch.clause}
       GROUP BY dentist.id, dentist.name
       ORDER BY average_rating DESC, dentist.name ASC`,
      [fromDate, toDate, ...branch.params]
    );

    const [ratingRows] = await pool.query(
      `SELECT pf.rating, COUNT(*) AS total
       FROM patient_feedback pf
       WHERE DATE(pf.submitted_at) BETWEEN ? AND ? ${branch.clause}
       GROUP BY pf.rating`,
      [fromDate, toDate, ...branch.params]
    );

    const ratingCounts = [1, 2, 3, 4, 5].map((rating) => {
      const row = ratingRows.find((item) => Number(item.rating) === rating);
      return row ? Number(row.total || 0) : 0;
    });

    res.json({
      title: 'Patient Satisfaction Ratings and Feedback Reports',
      mainChartTitle: 'Average Rating by Dentist',
      statusChartTitle: 'Rating Distribution',
      labels: dentistRows.map((row) => row.dentist_name),
      mainData: dentistRows.map((row) => Number(row.average_rating || 0)),
      statusLabels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      statusData: ratingCounts,
      headers: [
        'ID',
        'Patient Name',
        'Rating',
        'Feedback',
        'Dentist',
        'Date',
      ],
      rows: feedbackRows.map((row) => [
        `FB-${String(row.id).padStart(3, '0')}`,
        row.patient_name,
        String(row.rating),
        row.feedback || 'N/A',
        row.dentist_name,
        formatDate(row.submitted_at),
      ]),
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      message: err.statusCode ? err.message : 'Server error',
    });
  }
});

router.get('/patient-visits', async (req, res) => {
  const { branch_id, from, to } = req.query;

  try {
    const { fromDate, toDate } = normalizeDateRange(from, to);
    const conditions = ['DATE(a.start_time) BETWEEN ? AND ?'];
    const params = [fromDate, toDate];

    if (branch_id) {
      const branchId = Number.parseInt(branch_id, 10);

      if (Number.isNaN(branchId)) {
        return res.status(400).json({ message: 'Invalid branch id' });
      }

      conditions.push('a.branch_id = ?');
      params.push(branchId);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [visitRows] = await pool.query(
      `SELECT
         a.id,
         a.start_time,
         a.status,
         b.name AS branch_name,
         b.address AS branch_address,
         COALESCE(pp.full_name, patient.name) AS patient_name,
         dentist.name AS dentist_name,
         s.name AS service_name
       FROM appointments a
       JOIN branches b ON b.id = a.branch_id
       JOIN users patient ON patient.id = a.patient_id
       JOIN users dentist ON dentist.id = a.dentist_id
       JOIN services s ON s.id = a.service_id
       LEFT JOIN patient_profile pp ON pp.user_id = patient.id
       ${whereClause}
       ORDER BY a.start_time DESC`,
      params
    );

    const [monthlyRows] = await pool.query(
      `SELECT
         DATE_FORMAT(a.start_time, '%Y-%m') AS month_key,
         DATE_FORMAT(a.start_time, '%M %Y') AS month_label,
         COUNT(*) AS total
       FROM appointments a
       ${whereClause}
       GROUP BY month_key, month_label
       ORDER BY month_key ASC`,
      params
    );

    const [statusRows] = await pool.query(
      `SELECT a.status, COUNT(*) AS total
       FROM appointments a
       ${whereClause}
       GROUP BY a.status
       ORDER BY total DESC, a.status ASC`,
      params
    );

    res.json({
      title: 'Patient Visit Reports',
      mainChartTitle: 'Patient Visits by Month',
      statusChartTitle: 'Appointment Status',
      labels: monthlyRows.map((row) => row.month_label),
      mainData: monthlyRows.map((row) => Number(row.total || 0)),
      statusLabels: statusRows.map((row) => row.status),
      statusData: statusRows.map((row) => Number(row.total || 0)),
      headers: [
        'ID',
        'Patient Name',
        'Branch Location',
        'Dentist',
        'Visit Date',
        'Purpose',
        'Status',
      ],
      rows: visitRows.map((row) => [
        `PV-${String(row.id).padStart(3, '0')}`,
        row.patient_name,
        formatBranchLocation(row.branch_name, row.branch_address),
        row.dentist_name,
        formatDate(row.start_time),
        row.service_name,
        row.status,
      ]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/patient-treatments', async (req, res) => {
  const { branch_id, from, to } = req.query;

  try {
    const { fromDate, toDate } = normalizeDateRange(from, to);
    const conditions = ['DATE(a.start_time) BETWEEN ? AND ?'];
    const params = [fromDate, toDate];

    if (branch_id) {
      const branchId = Number.parseInt(branch_id, 10);

      if (Number.isNaN(branchId)) {
        return res.status(400).json({ message: 'Invalid branch id' });
      }

      conditions.push('a.branch_id = ?');
      params.push(branchId);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [treatmentRows] = await pool.query(
      `SELECT
         t.id,
         t.tooth_number,
         t.condition_type,
         t.notes,
         t.created_at,
         a.start_time,
         a.status AS appointment_status,
         b.name AS branch_name,
         b.address AS branch_address,
         s.name AS service_name,
         COALESCE(pp.full_name, patient.name) AS patient_name,
         dentist.name AS dentist_name
       FROM treatments t
       JOIN appointments a ON a.id = t.appointment_id
       JOIN branches b ON b.id = a.branch_id
       JOIN services s ON s.id = a.service_id
       JOIN users patient ON patient.id = a.patient_id
       JOIN users dentist ON dentist.id = t.dentist_id
       LEFT JOIN patient_profile pp ON pp.user_id = patient.id
       ${whereClause}
       ORDER BY a.start_time DESC, t.created_at DESC`,
      params
    );

    const [monthlyRows] = await pool.query(
      `SELECT
         DATE_FORMAT(a.start_time, '%Y-%m') AS month_key,
         DATE_FORMAT(a.start_time, '%M %Y') AS month_label,
         COUNT(*) AS total
       FROM treatments t
       JOIN appointments a ON a.id = t.appointment_id
       ${whereClause}
       GROUP BY month_key, month_label
       ORDER BY month_key ASC`,
      params
    );

    const [treatmentTypeRows] = await pool.query(
      `SELECT COALESCE(t.condition_type, 'Unspecified') AS treatment_type, COUNT(*) AS total
       FROM treatments t
       JOIN appointments a ON a.id = t.appointment_id
       ${whereClause}
       GROUP BY treatment_type
       ORDER BY total DESC, treatment_type ASC`,
      params
    );

    res.json({
      title: 'Patient Treatment Reports',
      mainChartTitle: 'Patient Treatments by Month',
      statusChartTitle: 'Treatment Types',
      labels: monthlyRows.map((row) => row.month_label),
      mainData: monthlyRows.map((row) => Number(row.total || 0)),
      statusLabels: treatmentTypeRows.map((row) => row.treatment_type),
      statusData: treatmentTypeRows.map((row) => Number(row.total || 0)),
      headers: [
        'ID',
        'Patient Name',
        'Branch Location',
        'Treatment',
        'Tooth',
        'Dentist',
        'Treatment Date',
        'Notes',
        'Status',
      ],
      rows: treatmentRows.map((row) => [
        `TR-${String(row.id).padStart(3, '0')}`,
        row.patient_name,
        formatBranchLocation(row.branch_name, row.branch_address),
        row.service_name || 'N/A',
        row.tooth_number ? String(row.tooth_number) : 'N/A',
        row.dentist_name,
        formatDate(row.start_time),
        row.notes || 'N/A',
        row.appointment_status,
      ]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stock-availability', async (req, res) => {
  const { branch_id } = req.query;

  try {
    let branchClause = '';
    const params = [];

    if (branch_id) {
      const branchId = Number.parseInt(branch_id, 10);

      if (Number.isNaN(branchId)) {
        return res.status(400).json({ message: 'Invalid branch id' });
      }

      branchClause = 'WHERE i.branch_id = ?';
      params.push(branchId);
    }

    const [supplies] = await pool.query(
      `SELECT
         CONCAT('SP-', LPAD(i.id, 3, '0')) AS item_code,
         i.supply_name AS item_name,
         'Supply' AS item_type,
         COALESCE(i.category, 'Supplies') AS category,
         i.quantity,
         i.low_stock_threshold,
         i.unit,
         b.name AS branch_name,
         b.address AS branch_address
       FROM supplies i
       JOIN branches b ON b.id = i.branch_id
       ${branchClause}
       ORDER BY i.supply_name ASC`,
      params
    );

    const [medicines] = await pool.query(
      `SELECT
         CONCAT('MD-', LPAD(i.id, 3, '0')) AS item_code,
         i.medicine_name AS item_name,
         'Medicine' AS item_type,
         COALESCE(i.category, 'Medicine') AS category,
         i.quantity,
         i.low_stock_threshold,
         i.unit,
         b.name AS branch_name,
         b.address AS branch_address
       FROM medicines i
       JOIN branches b ON b.id = i.branch_id
       ${branchClause}
       ORDER BY i.medicine_name ASC`,
      params
    );

    const [equipment] = await pool.query(
      `SELECT
         CONCAT('EQ-', LPAD(i.id, 3, '0')) AS item_code,
         i.equipment_name AS item_name,
         'Equipment' AS item_type,
         COALESCE(i.category, 'Equipment') AS category,
         i.quantity,
         i.low_stock_threshold,
         COALESCE(i.maintenance_status, 'unit') AS unit,
         b.name AS branch_name,
         b.address AS branch_address
       FROM equipment i
       JOIN branches b ON b.id = i.branch_id
       ${branchClause}
       ORDER BY i.equipment_name ASC`,
      params
    );

    const rows = [...supplies, ...medicines, ...equipment];

    const statusFor = (row) => {
      const quantity = Number(row.quantity || 0);
      const threshold = Number(row.low_stock_threshold || 0);

      if (quantity <= 0) return 'Out of Stock';
      if (quantity <= threshold) return 'Low Stock';
      return 'Available';
    };

    const statusCounts = rows.reduce(
      (counts, row) => {
        counts[statusFor(row)] += 1;
        return counts;
      },
      { Available: 0, 'Low Stock': 0, 'Out of Stock': 0 }
    );

    const typeTotals = rows.reduce((totals, row) => {
      totals[row.item_type] = (totals[row.item_type] || 0) + Number(row.quantity || 0);
      return totals;
    }, {});

    const typeLabels = Object.keys(typeTotals).sort((a, b) => a.localeCompare(b));

    res.json({
      title: 'Stock Items Availability Reports',
      mainChartTitle: 'Available Quantity by Item Type',
      statusChartTitle: 'Stock Status',
      labels: typeLabels,
      mainData: typeLabels.map((label) => typeTotals[label]),
      statusLabels: ['Available', 'Low Stock', 'Out of Stock'],
      statusData: [
        statusCounts.Available,
        statusCounts['Low Stock'],
        statusCounts['Out of Stock'],
      ],
      headers: [
        'ID',
        'Item Name',
        'Branch Location',
        'Item Type',
        'Category',
        'Quantity',
        'Unit',
        'Status',
      ],
      rows: rows.map((row) => [
        row.item_code,
        row.item_name,
        formatBranchLocation(row.branch_name, row.branch_address),
        row.item_type,
        row.category,
        String(Number(row.quantity || 0)),
        row.unit || 'unit',
        statusFor(row),
      ]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/consumption', async (req, res) => {
  const { branch_id, from, to } = req.query;

  try {
    const { fromDate, toDate } = normalizeDateRange(from, to);
    const conditions = ['DATE(ac.recorded_at) BETWEEN ? AND ?'];
    const params = [fromDate, toDate];

    if (branch_id) {
      const branchId = Number.parseInt(branch_id, 10);

      if (Number.isNaN(branchId)) {
        return res.status(400).json({ message: 'Invalid branch id' });
      }

      conditions.push('a.branch_id = ?');
      params.push(branchId);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await pool.query(
      `SELECT
         ac.item_name,
         ac.category,
         b.name AS branch_name,
         b.address AS branch_address,
         YEAR(ac.recorded_at) AS year_number,
         MONTH(ac.recorded_at) AS month_number,
         MONTHNAME(ac.recorded_at) AS month_name,
         QUARTER(ac.recorded_at) AS quarter_number,
         SUM(ac.quantity_used) AS consumed_quantity
       FROM appointment_consumption ac
       JOIN appointments a ON a.id = ac.appointment_id
       JOIN branches b ON b.id = a.branch_id
       ${whereClause}
       GROUP BY
         ac.item_name,
         ac.category,
         b.id,
         b.name,
         b.address,
         year_number,
         month_number,
         month_name,
         quarter_number
       ORDER BY year_number DESC, month_number DESC, ac.item_name ASC`,
      params
    );

    const [monthRows] = await pool.query(
      `SELECT
         DATE_FORMAT(ac.recorded_at, '%Y-%m') AS month_key,
         DATE_FORMAT(ac.recorded_at, '%M %Y') AS month_label,
         SUM(ac.quantity_used) AS consumed_quantity
       FROM appointment_consumption ac
       JOIN appointments a ON a.id = ac.appointment_id
       ${whereClause}
       GROUP BY month_key, month_label
       ORDER BY month_key ASC`,
      params
    );

    const highCount = rows.filter((row) => Number(row.consumed_quantity || 0) > 100).length;
    const normalCount = rows.length - highCount;

    res.json({
      title: 'Monthly and Quarterly Consumption Reports',
      mainChartTitle: 'Consumed Quantity by Month',
      statusChartTitle: 'Consumption Status',
      labels: monthRows.map((row) => row.month_label),
      mainData: monthRows.map((row) => Number(row.consumed_quantity || 0)),
      statusLabels: ['Normal', 'High'],
      statusData: [normalCount, highCount],
      headers: [
        'ID',
        'Item Name',
        'Branch Location',
        'Category',
        'Month',
        'Quarter',
        'Consumed Quantity',
        'Status',
      ],
      rows: rows.map((row, index) => {
        const consumedQuantity = Number(row.consumed_quantity || 0);

        return [
          `CN-${String(index + 1).padStart(3, '0')}`,
          row.item_name,
          formatBranchLocation(row.branch_name, row.branch_address),
          row.category,
          `${row.month_name} ${row.year_number}`,
          `Q${row.quarter_number}`,
          String(consumedQuantity),
          consumedQuantity > 100 ? 'High' : 'Normal',
        ];
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
