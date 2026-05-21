const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

console.log(
  `[email] Mode: ${process.env.MOCK_EMAIL === 'true' ? 'MOCK (console only)' : 'REAL (Resend)'}`
);

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const { authenticate, requireRole } = require('./src/middleware/auth');

//FOR WEBSITE
const path = require('path');
const websiteRoutes = require('./src/routes/websiteRoutes');

const app = express();

const allowedOrigins = (process.env.WEB_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    callback(new Error('CORS not allowed for this origin'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

//FOR WEBSITE
app.use(express.urlencoded({ extended: true }));

app.use('/website', express.static(path.join(__dirname, 'website')));

app.use('/api/website', websiteRoutes);


app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ status: 'ok', db: rows[0].ok === 1 ? 'connected' : 'unknown' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRoutes);

const appointmentRoutes = require('./src/routes/appointments');
app.use('/api/appointments', appointmentRoutes);

const patientRoutes = require('./src/routes/patients');
app.use('/api/patients', patientRoutes);

const treatmentRoutes = require('./src/routes/treatments');
app.use('/api/treatments', treatmentRoutes);

const pushRoutes = require('./src/routes/push');
app.use('/api/push', pushRoutes);

const messageRoutes = require('./src/routes/messages');
app.use('/api/messages', messageRoutes);

const notificationRoutes = require('./src/routes/notifications');
app.use('/api/notifications', notificationRoutes);

const cronAdminRoutes = require('./src/routes/cronAdmin');
app.use('/api/cron-admin', cronAdminRoutes);

const inventoryRoutes = require('./src/routes/inventory');
app.use('/api/inventory', inventoryRoutes);

const paymentRoutes = require('./src/routes/payments');
app.use('/api/payments', paymentRoutes);

const reportRoutes = require('./src/routes/reports');
app.use('/api/reports', reportRoutes);

const recepDashboardRoutes = require('./src/routes/recepDashboard');
app.use('/api/recep-dashboard', recepDashboardRoutes);

const dentistDashboardRoutes = require('./src/routes/dentistDashboard');
app.use('/api/dentist-dashboard', dentistDashboardRoutes);

const treatmentPlanRoutes = require('./src/routes/treatmentPlans');
app.use('/api/treatment-plans', treatmentPlanRoutes);

const aiRoutes = require('./src/routes/ai');
app.use('/api/ai', aiRoutes);

app.get('/api/admin/ping',  authenticate, requireRole('admin'),        (req, res) => res.json({ message: 'Admin only', user: req.user }));
app.get('/api/dentist/ping',authenticate, requireRole('dentist'),      (req, res) => res.json({ message: 'Dentist only', user: req.user }));
app.get('/api/recep/ping',  authenticate, requireRole('receptionist'), (req, res) => res.json({ message: 'Receptionist only', user: req.user }));
app.get('/api/patient/ping',authenticate, requireRole('patient'),      (req, res) => res.json({ message: 'Patient only', user: req.user }));

pool.query(
  `ALTER TABLE services ADD COLUMN IF NOT EXISTS description TEXT NULL`
).catch(() => {
  pool.query(`SHOW COLUMNS FROM services LIKE 'description'`).then(([rows]) => {
    if (rows.length === 0) {
      pool.query(`ALTER TABLE services ADD COLUMN description TEXT NULL`)
        .catch((err) => console.error('[migration] Failed to add description to services:', err.message));
    }
  });
});

pool.query(
  `ALTER TABLE appointments ADD COLUMN IF NOT EXISTS dentist_note TEXT NULL`
).catch(() => {
  pool.query(`SHOW COLUMNS FROM appointments LIKE 'dentist_note'`).then(([rows]) => {
    if (rows.length === 0) {
      pool.query(`ALTER TABLE appointments ADD COLUMN dentist_note TEXT NULL`)
        .catch((err) => console.error('[migration] Failed to add dentist_note column:', err.message));
    }
  });
});

pool.query('DROP TABLE IF EXISTS risk_assessments')
  .catch((err) => console.error('[migration] Failed to drop risk_assessments:', err.message));

pool.query(`ALTER TABLE patient_profile MODIFY COLUMN address VARCHAR(255) NULL`)
  .catch(err => console.error('[migration] patient_profile address nullable:', err.message));

[
  `ALTER TABLE patient_profile ADD COLUMN nickname VARCHAR(100) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN suffix VARCHAR(20) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN religion VARCHAR(100) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN dental_insurance VARCHAR(150) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN effective_date DATE NULL`,
  `ALTER TABLE patient_profile ADD COLUMN office_number VARCHAR(30) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN fax_number VARCHAR(30) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN is_minor TINYINT(1) NULL DEFAULT 0`,
  `ALTER TABLE patient_profile ADD COLUMN guardian_name VARCHAR(100) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN guardian_occupation VARCHAR(100) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN referral VARCHAR(150) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN consultation_reason TEXT NULL`,
  `ALTER TABLE patient_profile ADD COLUMN physician_name VARCHAR(100) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN physician_specialty VARCHAR(100) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN physician_office_address VARCHAR(255) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN physician_office_number VARCHAR(30) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN previous_dentist VARCHAR(100) NULL`,
  `ALTER TABLE patient_profile ADD COLUMN last_dental_visit VARCHAR(100) NULL`,
].forEach(sql => {
  pool.query(sql).catch(err => {
    if (err.errno !== 1060) {
      console.error('[migration] patient_profile extended fields:', err.message);
    }
  });
});

pool.query(`
  CREATE TABLE IF NOT EXISTS treatment_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    dentist_id INT NOT NULL,
    tooth_number TINYINT NOT NULL,
    planned_treatment VARCHAR(255) NOT NULL,
    status ENUM('planned','in_progress','completed') NOT NULL DEFAULT 'planned',
    notes TEXT NULL,
    date_completed DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (dentist_id) REFERENCES users(id),
    INDEX idx_tp_patient (patient_id),
    INDEX idx_tp_dentist (dentist_id)
  )
`).catch(err => console.error('[migration] treatment_plans:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS schedule_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dentist_id INT NOT NULL,
    request_type ENUM('leave', 'transfer') NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    date_from DATE NULL,
    date_to DATE NULL,
    reason TEXT NULL,
    requested_branch_id INT NULL,
    transfer_type ENUM('permanent', 'temporary') NULL,
    duration VARCHAR(100) NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    reviewed_by INT NULL,
    FOREIGN KEY (dentist_id) REFERENCES users(id),
    FOREIGN KEY (requested_branch_id) REFERENCES branches(id),
    INDEX idx_schedule_requests_dentist (dentist_id)
  )
`).catch(err => console.error('[migration] schedule_requests:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS online_appointments_tbl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    location VARCHAR(255) NOT NULL,
    reason_for_booking TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_online_appt_date (appointment_date),
    INDEX idx_online_appt_status (status)
  )
`).catch(err => console.error('[migration] online_appointments_tbl:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS online_inquiries_tbl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    concern VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_online_inquiry_phone (phone_number)
  )
`).catch(err => console.error('[migration] online_inquiries_tbl:', err.message));

const PORT = process.env.PORT || 4000;
const { startCronJobs } = require('./src/services/cron');
startCronJobs();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock email mode: ${process.env.MOCK_EMAIL === 'true' ? 'ON (OTPs print to console)' : 'OFF (using Resend)'}`);
});
