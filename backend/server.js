const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log(
  `[email] Mode: ${process.env.MOCK_EMAIL === 'true' ? 'MOCK (console only)' : 'REAL (Resend)'}`
);

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const { authenticate, requireRole } = require('./src/middleware/auth');
const { loginLimiter, registerLimiter, passwordResetLimiter } = require('./src/middleware/rateLimiter');

//FOR WEBSITE
const websiteRoutes = require('./src/routes/websiteRoutes');

const app = express();

const allowedOrigins = [
  ...(process.env.WEB_ORIGIN      || '').split(','),
  ...(process.env.WEBSITE_ORIGIN  || '').split(','),
  ...(process.env.WEBSITE_ORIGIN_2|| '').split(','),
].map(s => s.trim()).filter(Boolean);

function originHostname(origin) {
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function originPort(origin) {
  try {
    const url = new URL(origin);
    return url.port || (url.protocol === 'https:' ? '443' : '80');
  } catch {
    return '';
  }
}

function isEquivalentLocalhost(a, b) {
  const hostA = originHostname(a);
  const hostB = originHostname(b);
  const portA = originPort(a);
  const portB = originPort(b);

  const localhostSet = new Set(['localhost', '127.0.0.1']);
  return localhostSet.has(hostA) && localhostSet.has(hostB) && portA && portA === portB;
}
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    // Dev convenience: allow any localhost origin (Live Server ports vary)
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { hostname } = new URL(origin);
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return callback(null, true);
        }
      } catch (_) {
        // ignore
      }
    }

    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || isEquivalentLocalhost(origin, allowed))) {
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

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth/reset-password', passwordResetLimiter);
app.use('/api/auth', authRoutes);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

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

pool.query(
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at DATE NULL AFTER created_at`
).catch(() => {
  pool.query(`SHOW COLUMNS FROM users LIKE 'deactivated_at'`).then(([rows]) => {
    if (rows.length === 0) {
      pool.query(`ALTER TABLE users ADD COLUMN deactivated_at DATE NULL AFTER created_at`)
        .catch((err) => console.error('[migration] Failed to add deactivated_at to users:', err.message));
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
    email VARCHAR(150) NULL,
    phone_number VARCHAR(30) NOT NULL,
    location VARCHAR(255) NOT NULL,
    reason_for_booking TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_online_appt_date (appointment_date),
    INDEX idx_online_appt_status (status)
  )
`).catch(err => console.error('[migration] online_appointments_tbl:', err.message));

pool.query(
  `ALTER TABLE online_appointments_tbl ADD COLUMN IF NOT EXISTS email VARCHAR(150) NULL AFTER full_name`
).catch(() => {
  pool.query(`SHOW COLUMNS FROM online_appointments_tbl LIKE 'email'`).then(([rows]) => {
    if (rows.length === 0) {
      pool.query(`ALTER TABLE online_appointments_tbl ADD COLUMN email VARCHAR(150) NULL AFTER full_name`)
        .catch((err) => console.error('[migration] Failed to add email to online_appointments_tbl:', err.message));
    }
  });
});

pool.query(`
  CREATE TABLE IF NOT EXISTS online_inquiries_tbl (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email_address VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    branch VARCHAR(150) NOT NULL,
    concern VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_online_inquiry_phone (phone_number),
    INDEX idx_online_inquiry_branch (branch)
  )
`).catch(err => {
  console.error('[migration] online_inquiries_tbl:', err.message);
});

pool.query(`
  ALTER TABLE online_inquiries_tbl
  ADD COLUMN IF NOT EXISTS email_address VARCHAR(150) NOT NULL AFTER full_name
`).catch(() => {
  pool.query(`SHOW COLUMNS FROM online_inquiries_tbl LIKE 'email_address'`)
    .then(([rows]) => {
      if (rows.length === 0) {
        return pool.query(`
          ALTER TABLE online_inquiries_tbl
          ADD COLUMN email_address VARCHAR(150) NOT NULL AFTER full_name
        `);
      }
    })
    .catch(err => {
      console.error('[migration] Failed to add email_address:', err.message);
    });
});

pool.query(`
  ALTER TABLE online_inquiries_tbl
  ADD COLUMN IF NOT EXISTS branch VARCHAR(150) NOT NULL AFTER phone_number
`).catch(() => {
  pool.query(`SHOW COLUMNS FROM online_inquiries_tbl LIKE 'branch'`)
    .then(([rows]) => {
      if (rows.length === 0) {
        return pool.query(`
          ALTER TABLE online_inquiries_tbl
          ADD COLUMN branch VARCHAR(150) NOT NULL AFTER phone_number
        `);
      }
    })
    .catch(err => {
      console.error('[migration] Failed to add branch:', err.message);
    });
});

// ── Website CMS tables ────────────────────────────────────────────────────────

pool.query(`
  CREATE TABLE IF NOT EXISTS website_content (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    field_value TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wc_section_key (section, field_key)
  )
`).then(() => pool.query(
  'INSERT IGNORE INTO website_content (section, field_key, field_value) VALUES ?',
  [[
    ['hero', 'eyebrow',       'Smile with confidence. Shine with us.'],
    ['hero', 'heading',       "Let's illuminate your smile journey together!"],
    ['hero', 'description',   'Smile Empress Dental Hub delivers gentle and modern dental care focused on keeping every patient comfortable while achieving healthier, brighter, and more confident smiles.'],
    ['hero', 'stat1_value',   '10+'],
    ['hero', 'stat1_label',   'Dental Services'],
    ['hero', 'stat2_value',   '98%'],
    ['hero', 'stat2_label',   'Happy & Satisfied Patients'],
    ['hero', 'stat3_value',   '20+'],
    ['hero', 'stat3_label',   'Years of Dental Experience'],
    ['hero', 'dentist_name',  'Dra. Twinky D. Belino'],
    ['hero', 'dentist_title', 'Cosmetic Dentist'],
    ['about', 'paragraph1',   'Smile Empress Dental Hub is built on friendly, gentle, and quality dental care for every patient.'],
    ['about', 'paragraph2',   'Our clinic provides preventive care, cosmetic treatments, orthodontics, root canal treatment, dentures, crowns, veneers, clear aligners, and dental implants.'],
    ['about', 'paragraph3',   'Whether you need dental cleaning, a smile make-over, or complete oral care, our team is ready to help you achieve a healthier and brighter smile.'],
    ['contact', 'phone1',        '0977-066-5269'],
    ['contact', 'phone2',        '0916-525-8468'],
    ['contact', 'email',         'smileempressdentalhub@gmail.com'],
    ['contact', 'facebook_url',  'https://www.facebook.com/Thesmileempressdentalhub'],
    ['contact', 'tagline',       'Your Smile, Our Priority'],
    ['hours', 'weekdays',      'Monday to Saturday'],
    ['hours', 'weekday_time',  '10:00 AM - 7:00 PM'],
    ['hours', 'sunday',        'Sunday'],
    ['hours', 'sunday_note',   'By Appointment'],
    ['footer', 'brand_name',   'Smile Empress Dental Hub'],
    ['footer', 'team_name',    'ToothConnect by CODE IV: GECO'],
  ]]
)).catch(err => console.error('[migration] website_content:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS website_faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status ENUM('active','hidden') NOT NULL DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).then(() => pool.query('SELECT COUNT(*) AS cnt FROM website_faqs'))
  .then(([rows]) => {
    if (rows[0].cnt === 0) {
      return pool.query(
        'INSERT INTO website_faqs (question, answer, sort_order) VALUES ?',
        [[
          ['What services do you offer?', 'We offer deep scaling, teeth whitening, veneers, crowns, dentures, root canal treatment, braces, clear aligners, and dental implants.', 1],
          ['Do I need to make an appointment?', 'Yes. Booking an appointment helps us prepare your schedule and service properly.', 2],
          ['Do you accept walk-ins?', 'Walk-ins may be accepted depending on clinic availability.', 3],
          ['What is your clinic schedule?', 'We are open Monday to Saturday, 10:00 AM to 7:00 PM. Sunday is by appointment.', 4],
          ['How can I contact the clinic?', 'You may contact us at 0977-066-5269 or 0916-525-8468, or email us at smileempressdentalhub@gmail.com.', 5],
        ]]
      );
    }
  }).catch(err => console.error('[migration] website_faqs:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS website_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    image_path VARCHAR(255) NULL,
    description TEXT NULL,
    slug VARCHAR(100) NULL,
    sort_order INT NOT NULL DEFAULT 0,
    status ENUM('active','hidden') NOT NULL DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).then(() => pool.query('SELECT COUNT(*) AS cnt FROM website_services'))
  .then(([rows]) => {
    if (rows[0].cnt === 0) {
      return pool.query(
        'INSERT INTO website_services (name, image_path, description, slug, sort_order, status) VALUES ?',
        [[
          ['Deep Scaling',      './images/deep-scaling.webp',    'Deep scaling removes plaque, tartar, and buildup from teeth and gum areas. It helps improve gum health, freshen breath, and prevent dental problems caused by bacteria.',                                                        'scaling',       1, 'active'],
          ['Smile Make-Overs',  './images/smile-makeover.jpg',   'Smile make-overs improve the look of your smile through customized cosmetic dental treatments. It may include whitening, veneers, crowns, and other treatments based on your dental needs.',                                       'smilemakeovers',2, 'active'],
          ['Teeth Whitening',   './images/teeth-whitening.jpg',  'Teeth whitening helps reduce stains and discoloration for a cleaner and brighter smile. It is a simple cosmetic treatment that improves tooth color safely.',                                                                     'whitening',     3, 'active'],
          ['Veneers',           './images/veneers.jpg',          'Veneers are thin covers placed on the front part of the teeth. They help improve tooth shape, color, spacing, and overall smile appearance.',                                                                                     'veneers',       4, 'active'],
          ['Porcelain Crowns',  './images/crowns.jpeg',          'Porcelain jacket crowns protect and restore damaged teeth. They improve strength, appearance, and natural function for better chewing and smiling.',                                                                               'crowns',        5, 'active'],
          ['Dentures',          './images/dentures.jpg',         'Dentures replace missing teeth and support chewing, speaking, and smiling. They are made to fit comfortably and restore daily oral function.',                                                                                     'dentures',      6, 'active'],
          ['Root Canal',        './images/root-canal.jpg',       'Root canal treatment helps save infected or damaged teeth. It removes infection inside the tooth and helps reduce pain while keeping the natural tooth.',                                                                          'rootcanal',     7, 'active'],
          ['Braces',            './images/braces.jpg',           'Braces help align crooked teeth and correct bite problems. This treatment improves smile appearance, oral function, and long-term dental health.',                                                                                'braces',        8, 'active'],
          ['Clear Aligners',    './images/clear-aligner.webp',   'Clear aligners are removable trays that straighten teeth in a comfortable and discreet way. They are ideal for patients who want a cleaner orthodontic look.',                                                                    'aligners',      9, 'active'],
          ['Dental Implants',   './images/dental-implant.jpg',   'Dental implants replace missing teeth with strong and natural-looking support. They help restore comfort, chewing ability, and confidence when smiling.',                                                                         'implants',     10, 'active'],
        ]]
      );
    }
  }).catch(err => console.error('[migration] website_services:', err.message));

pool.query(`
  CREATE TABLE IF NOT EXISTS website_announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('active','hidden') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
`).catch(err => console.error('[migration] website_announcements:', err.message));

const { startCronJobs } = require('./src/services/cron');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(
    `Mock email mode: ${
      process.env.MOCK_EMAIL === 'true'
        ? 'ON (OTPs print to console)'
        : 'OFF (using Resend)'
    }`
  );
  startCronJobs();
});
