const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hh, mm] = timeStr.split(':');
  const h = parseInt(hh, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mm} ${period}`;
}

async function notifyDentistAboutRequestDecision(dentistId, status, requestType) {
  const title =
    status === 'approved' ? 'Schedule request approved' : 'Schedule request rejected';
  const body =
    `Your ${requestType === 'leave' ? 'leave' : 'schedule transfer'} request was ${status}.`;

  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_type)
     VALUES (?, ?, ?, ?, ?)`,
    [
      dentistId,
      `schedule_request_${status}`,
      title,
      body,
      'schedule_request',
    ]
  );
}

// GET /api/dentist-dashboard — stats, upcoming appointments, and recent feedback
router.get('/', requireRole('dentist'), async (req, res) => {
  const dentistId = req.user.user_id;
  try {
    const [[totals]] = await pool.query(
      `SELECT COUNT(*) AS totalAppointments, COUNT(DISTINCT patient_id) AS totalPatients
       FROM appointments WHERE dentist_id = ?`,
      [dentistId]
    );

    const [[{ newPatients }]] = await pool.query(
      `SELECT COUNT(DISTINCT patient_id) AS newPatients
       FROM appointments
       WHERE dentist_id = ?
         AND YEAR(start_time) = YEAR(CURDATE())
         AND MONTH(start_time) = MONTH(CURDATE())
         AND patient_id NOT IN (
           SELECT DISTINCT patient_id FROM appointments
           WHERE dentist_id = ? AND start_time < DATE_FORMAT(CURDATE(), '%Y-%m-01')
         )`,
      [dentistId, dentistId]
    );

    const [[{ returningPatients }]] = await pool.query(
      `SELECT COUNT(*) AS returningPatients FROM (
         SELECT patient_id FROM appointments WHERE dentist_id = ?
         GROUP BY patient_id HAVING COUNT(*) > 1
       ) t`,
      [dentistId]
    );

    const [ageRows] = await pool.query(
      `SELECT
         SUM(CASE WHEN TIMESTAMPDIFF(YEAR, pp.birthday, CURDATE()) <= 12 THEN 1 ELSE 0 END) AS childCount,
         SUM(CASE WHEN TIMESTAMPDIFF(YEAR, pp.birthday, CURDATE()) BETWEEN 13 AND 19 THEN 1 ELSE 0 END) AS teenCount,
         SUM(CASE WHEN TIMESTAMPDIFF(YEAR, pp.birthday, CURDATE()) BETWEEN 20 AND 59 THEN 1 ELSE 0 END) AS adultCount,
         SUM(CASE WHEN TIMESTAMPDIFF(YEAR, pp.birthday, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS olderCount
       FROM (SELECT DISTINCT patient_id FROM appointments WHERE dentist_id = ?) a
       LEFT JOIN patient_profile pp ON pp.user_id = a.patient_id`,
      [dentistId]
    );

    const [[ratings]] = await pool.query(
      `SELECT
         AVG(rating) AS averageRating,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS r5,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS r4,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS r3,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS r2,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS r1,
         COUNT(*) AS totalRatings
       FROM patient_feedback WHERE dentist_id = ?`,
      [dentistId]
    );

    const [upcoming] = await pool.query(
      `SELECT a.id, a.start_time, a.status, u.name AS patientName, s.name AS service
       FROM appointments a
       JOIN users u ON u.id = a.patient_id
       JOIN services s ON s.id = a.service_id
       WHERE a.dentist_id = ? AND a.start_time >= NOW() AND a.status = 'scheduled'
       ORDER BY a.start_time ASC LIMIT 10`,
      [dentistId]
    );

    const [feedback] = await pool.query(
      `SELECT pf.id, pf.feedback, pf.rating, pf.submitted_at, u.name AS patientName
       FROM patient_feedback pf
       JOIN users u ON u.id = pf.patient_id
       WHERE pf.dentist_id = ?
       ORDER BY pf.submitted_at DESC LIMIT 5`,
      [dentistId]
    );

    const totalRatings = Number(ratings?.totalRatings || 0);
    const pct = (n) => (totalRatings ? Math.round((Number(n || 0) / totalRatings) * 100) : 0);

    res.json({
      totalPatients: Number(totals.totalPatients || 0),
      totalAppointments: Number(totals.totalAppointments || 0),
      newPatients: Number(newPatients || 0),
      returningPatients: Number(returningPatients || 0),
      childCount: Number(ageRows[0]?.childCount || 0),
      teenCount: Number(ageRows[0]?.teenCount || 0),
      adultCount: Number(ageRows[0]?.adultCount || 0),
      olderCount: Number(ageRows[0]?.olderCount || 0),
      averageRating: ratings?.averageRating ? Number(ratings.averageRating).toFixed(1) : 0,
      rating5: pct(ratings?.r5),
      rating4: pct(ratings?.r4),
      rating3: pct(ratings?.r3),
      rating2: pct(ratings?.r2),
      rating1: pct(ratings?.r1),
      upcomingAppointments: upcoming.map((a) => ({
        id: a.id,
        time: new Date(a.start_time).toLocaleTimeString('en-PH', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        patientName: a.patientName,
        service: a.service,
        status: a.status,
      })),
      feedbackList: feedback.map((f) => ({
        id: f.id,
        patientName: f.patientName,
        message: f.feedback || '',
        date: new Date(f.submitted_at).toLocaleDateString('en-PH'),
        rating: f.rating,
      })),
    });
  } catch (err) {
    console.error('[dentist-dashboard]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dentist-dashboard/schedule — weekly schedule from dentist_schedules
router.get('/schedule', requireRole('dentist'), async (req, res) => {
  const dentistId = req.user.user_id;
  try {
    const [scheduleRows] = await pool.query(
      `SELECT ds.weekday, ds.start_time, ds.end_time, b.name AS branchName, b.address AS branchAddress
       FROM dentist_schedules ds
       JOIN branches b ON b.id = ds.branch_id
       WHERE ds.dentist_id = ?
       ORDER BY ds.weekday ASC`,
      [dentistId]
    );

    const [profileRows] = await pool.query(
      `SELECT b.name AS branchName
       FROM staff_profile sp
       LEFT JOIN branches b ON b.id = sp.branch_id
       WHERE sp.user_id = ? LIMIT 1`,
      [dentistId]
    );

    const branchName =
      profileRows[0]?.branchName || scheduleRows[0]?.branchName || 'N/A';

    const scheduleMap = {};
    for (const row of scheduleRows) {
      if (!scheduleMap[row.weekday]) {
        scheduleMap[row.weekday] = {
          startTime: row.start_time,
          endTime: row.end_time,
          branchAddress: row.branchAddress || null,
        };
      }
    }

    const weeklySchedule = DAY_NAMES.map((day, idx) => {
      const entry = scheduleMap[idx];
      if (entry) {
        return {
          day,
          status: 'Working',
          time: `${formatTime12h(entry.startTime)} – ${formatTime12h(entry.endTime)}`,
          branchAddress: entry.branchAddress,
        };
      }
      return { day, status: 'Off', time: '—', branchAddress: null };
    });

    const workingDays = DAY_NAMES.filter((_, idx) => scheduleMap[idx]).join(', ') || 'N/A';
    const firstRow = scheduleRows[0];
    const workingTime = firstRow
      ? `${formatTime12h(firstRow.start_time)} – ${formatTime12h(firstRow.end_time)}`
      : 'N/A';

    const todayWeekday = new Date().getDay();
    const todayBranchAddress = scheduleMap[todayWeekday]?.branchAddress || null;

    res.json({
      branchName,
      workingDays,
      workingTime,
      weeklySchedule,
      todayBranchAddress: todayBranchAddress || 'Off',
    });
  } catch (err) {
    console.error('[dentist-schedule]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/dentist-dashboard/schedule-requests — submit leave or transfer request
router.post('/schedule-requests', requireRole('dentist'), async (req, res) => {
  const dentistId = req.user.user_id;
  const { request_type, date_from, date_to, reason, requested_branch_id, transfer_type, duration } = req.body;

  if (!request_type || !['leave', 'transfer'].includes(request_type)) {
    return res.status(400).json({ message: 'Invalid request_type' });
  }
  if (request_type === 'leave' && (!date_from || !date_to)) {
    return res.status(400).json({ message: 'date_from and date_to are required for leave requests' });
  }
  if (request_type === 'transfer' && !requested_branch_id) {
    return res.status(400).json({ message: 'requested_branch_id is required for transfer requests' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO schedule_requests
         (dentist_id, request_type, date_from, date_to, reason, requested_branch_id, transfer_type, duration)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dentistId,
        request_type,
        date_from || null,
        date_to || null,
        reason || null,
        requested_branch_id || null,
        transfer_type || null,
        duration || null,
      ]
    );

    const requestId = result.insertId;
    const [[dentistRow]] = await pool.query('SELECT name FROM users WHERE id = ?', [dentistId]);
    const dentistName = dentistRow?.name || 'A dentist';
    const requestLabel = request_type === 'leave' ? 'leave' : 'transfer';
    const [admins] = await pool.query(
      "SELECT id FROM users WHERE role = 'Admin' AND status = 'Active'"
    );
    for (const admin of admins) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
         VALUES (?, 'schedule_request', ?, ?, 'schedule_request', ?)`,
        [
          admin.id,
          'New Leave Request',
          `${dentistName} submitted a ${requestLabel} request. Please review and take action.`,
          requestId,
        ]
      );
    }

    res.status(201).json({ id: requestId, message: 'Request submitted' });
  } catch (err) {
    console.error('[schedule-requests POST]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dentist-dashboard/patient-visits — weekly new/returning breakdown for this dentist
router.get('/patient-visits', requireRole('dentist'), async (req, res) => {
  const dentistId = req.user.user_id;
  const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1);
  const year = parseInt(req.query.year, 10) || new Date().getFullYear();

  try {
    const [rows] = await pool.query(
      `SELECT
         a.patient_id,
         DAY(a.start_time) AS day_of_month,
         CASE
           WHEN fa.first_appt >= DATE_FORMAT(a.start_time, '%Y-%m-01')
           THEN 'new'
           ELSE 'returning'
         END AS visit_type
       FROM appointments a
       JOIN (
         SELECT patient_id, MIN(start_time) AS first_appt
         FROM appointments
         WHERE dentist_id = ?
         GROUP BY patient_id
       ) fa ON fa.patient_id = a.patient_id
       WHERE a.dentist_id = ?
         AND YEAR(a.start_time) = ?
         AND MONTH(a.start_time) = ?
         AND a.status != 'cancelled'`,
      [dentistId, dentistId, year, month]
    );

    const daysInMonth = new Date(year, month, 0).getDate();
    const weekCount = Math.ceil(daysInMonth / 7);
    const newPatients = Array(weekCount).fill(0);
    const returningPatients = Array(weekCount).fill(0);

    for (const row of rows) {
      const weekIdx = Math.floor((row.day_of_month - 1) / 7);
      if (row.visit_type === 'new') {
        newPatients[weekIdx] += 1;
      } else {
        returningPatients[weekIdx] += 1;
      }
    }

    res.json({ newPatients, returningPatients });
  } catch (err) {
    console.error('[dentist-patient-visits]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/dentist-dashboard/schedule-requests — list my requests
router.get('/schedule-requests', requireRole('dentist'), async (req, res) => {
  const dentistId = req.user.user_id;
  try {
    const [rows] = await pool.query(
      `SELECT sr.id, sr.request_type, sr.status, sr.date_from, sr.date_to, sr.reason,
              sr.transfer_type, sr.duration, sr.submitted_at,
              b.name AS requested_branch_name
       FROM schedule_requests sr
       LEFT JOIN branches b ON b.id = sr.requested_branch_id
       WHERE sr.dentist_id = ?
       ORDER BY sr.submitted_at DESC`,
      [dentistId]
    );
    res.json(rows);
  } catch (err) {
    console.error('[schedule-requests GET]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/schedule-requests', requireRole('admin'), async (req, res) => {
  const status = String(req.query.status || '').trim().toLowerCase();

  try {
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('sr.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT sr.id, sr.dentist_id, sr.request_type, sr.status, sr.date_from, sr.date_to,
              sr.reason, sr.requested_branch_id, sr.transfer_type, sr.duration,
              sr.submitted_at,
              u.name AS dentist_name,
              home_branch.address AS current_branch_address,
              requested_branch.name AS requested_branch_name
       FROM schedule_requests sr
       JOIN users u ON u.id = sr.dentist_id
       LEFT JOIN branches home_branch ON home_branch.id = u.home_branch_id
       LEFT JOIN branches requested_branch ON requested_branch.id = sr.requested_branch_id
       ${whereClause}
       ORDER BY
         CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END,
         sr.submitted_at DESC`,
      params
    );

    // Load each dentist's working weekdays from dentist_schedules to compute working days
    const dentistIds = [...new Set(rows.map(r => r.dentist_id))];
    const dentistWorkdays = {};

    if (dentistIds.length > 0) {
      const [scheduleRows] = await pool.query(
        `SELECT dentist_id, weekday FROM dentist_schedules WHERE dentist_id IN (?)`,
        [dentistIds]
      );
      for (const s of scheduleRows) {
        if (!dentistWorkdays[s.dentist_id]) dentistWorkdays[s.dentist_id] = new Set();
        dentistWorkdays[s.dentist_id].add(Number(s.weekday));
      }
    }

    function countWorkingDays(dateFrom, dateTo, workdays) {
      if (!dateFrom || !dateTo || !workdays || workdays.size === 0) return null;
      let count = 0;
      const cur = new Date(dateFrom + 'T00:00:00');
      const end = new Date(dateTo + 'T00:00:00');
      while (cur <= end) {
        if (workdays.has(cur.getDay())) count++;
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    }

    const enrichedRows = rows.map(r => {
      const workdays = dentistWorkdays[r.dentist_id];
      const working_days = (r.date_from && r.date_to)
        ? countWorkingDays(
            String(r.date_from).slice(0, 10),
            String(r.date_to).slice(0, 10),
            workdays
          )
        : null;
      return { ...r, working_days };
    });

    res.json({ requests: enrichedRows });
  } catch (err) {
    console.error('[admin schedule-requests GET]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/admin/schedule-requests/:id', requireRole('admin'), async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const status = String(req.body.status || '').trim().toLowerCase();

  if (!id) {
    return res.status(400).json({ message: 'Invalid request id' });
  }

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'status must be approved or rejected' });
  }

  try {
    const [existingRows] = await pool.query(
      `SELECT id, dentist_id, request_type, status
       FROM schedule_requests
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({ message: 'Schedule request not found' });
    }

    const request = existingRows[0];

    if (request.status === status) {
      return res.json({ message: `Request already ${status}.` });
    }

    await pool.query(
      `UPDATE schedule_requests
       SET status = ?
       WHERE id = ?`,
      [status, id]
    );

    await notifyDentistAboutRequestDecision(
      request.dentist_id,
      status,
      request.request_type
    );

    res.json({ message: `Request ${status}.` });
  } catch (err) {
    console.error('[admin schedule-requests PATCH]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/audit-logs', requireRole('admin'), async (req, res) => {
  const { from, to } = req.query;
  try {
    const conditions = [];
    const params = [];
    if (from) { conditions.push('DATE(al.created_at) >= ?'); params.push(from); }
    if (to) { conditions.push('DATE(al.created_at) <= ?'); params.push(to); }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT al.id, al.action, al.created_at,
              al.device_browser, al.log_status,
              u.name AS user_name, u.role AS user_role
       FROM audit_logs al
       JOIN users u ON u.id = al.user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT 500`,
      params
    );
    res.json({ logs: rows });
  } catch (err) {
    console.error('[admin audit-logs]', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
