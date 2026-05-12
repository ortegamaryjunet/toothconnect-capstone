const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { sendAppointmentReminders, sendRecallReminders } = require('../services/cron');

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.post('/run-appointment-reminders', async (req, res) => {
  const result = await sendAppointmentReminders();
  res.json(result);
});

router.post('/run-recall-reminders', async (req, res) => {
  const result = await sendRecallReminders();
  res.json(result);
});

module.exports = router;