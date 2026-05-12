const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const pool = require('./src/config/db');
const authRoutes = require('./src/routes/auth');
const { authenticate, requireRole } = require('./src/middleware/auth');

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

const treatmentRoutes = require('./src/routes/treatments');
app.use('/api/treatments', treatmentRoutes);

const riskAssessmentRoutes = require('./src/routes/riskAssessments');
app.use('/api/risk-assessments', riskAssessmentRoutes);

const pushRoutes = require('./src/routes/push');
app.use('/api/push', pushRoutes);

const messageRoutes = require('./src/routes/messages');
app.use('/api/messages', messageRoutes);

const notificationRoutes = require('./src/routes/notifications');
app.use('/api/notifications', notificationRoutes);

const cronAdminRoutes = require('./src/routes/cronAdmin');
app.use('/api/cron-admin', cronAdminRoutes);

app.get('/api/admin/ping',  authenticate, requireRole('admin'),        (req, res) => res.json({ message: 'Admin only', user: req.user }));
app.get('/api/dentist/ping',authenticate, requireRole('dentist'),      (req, res) => res.json({ message: 'Dentist only', user: req.user }));
app.get('/api/recep/ping',  authenticate, requireRole('receptionist'), (req, res) => res.json({ message: 'Receptionist only', user: req.user }));
app.get('/api/patient/ping',authenticate, requireRole('patient'),      (req, res) => res.json({ message: 'Patient only', user: req.user }));

const PORT = process.env.PORT || 4000;
const { startCronJobs } = require('./src/services/cron');
startCronJobs();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Mock email mode: ${process.env.MOCK_EMAIL === 'true' ? 'ON (OTPs print to console)' : 'OFF (using Resend)'}`);
});