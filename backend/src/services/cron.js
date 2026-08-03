const cron = require('node-cron');
const pool = require('../config/db');
const { sendPushToUser } = require('./push');

const CLINIC_TIMEZONE = 'Asia/Manila';

async function createNotification(userId, type, title, body, relatedType, relatedId) {
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, type, title, body, relatedType || null, relatedId || null]
  );
}

function formatClinicTime(value) {
  return new Date(value).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: CLINIC_TIMEZONE,
  });
}

function formatDentistName(name) {
  const cleanName = String(name || 'your dentist').trim();
  return cleanName.toLowerCase().startsWith('dr.') ? cleanName : `Dr. ${cleanName}`;
}

async function sendAppointmentReminders() {
  try {
    const [appts24] = await pool.query(
      `SELECT a.id, a.patient_id, a.start_time, a.dentist_id,
              s.name AS service_name, d.name AS dentist_name, b.name AS branch_name
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       JOIN users d ON d.id = a.dentist_id
       JOIN branches b ON b.id = a.branch_id
       WHERE a.status = 'scheduled'
         AND a.reminder_sent_24h = FALSE
         AND a.start_time > DATE_ADD(UTC_TIMESTAMP(), INTERVAL 23 HOUR)
         AND a.start_time < DATE_ADD(UTC_TIMESTAMP(), INTERVAL 25 HOUR)`
    );

    for (const a of appts24) {
      const localTime = formatClinicTime(a.start_time);
      const dentistName = formatDentistName(a.dentist_name);
      const body24 = `Your ${a.service_name} appointment is tomorrow at ${localTime} with ${dentistName} at ${a.branch_name}.`;
      await createNotification(
        a.patient_id,
        'appointment_reminder',
        'Appointment Reminder',
        body24,
        'appointment',
        a.id
      );
      sendPushToUser(a.patient_id, { title: 'Appointment Reminder', body: body24, data: { type: 'appointment_reminder', appointment_id: a.id } }).catch(() => {});
      await pool.query('UPDATE appointments SET reminder_sent_24h = TRUE WHERE id = ?', [a.id]);
    }
    if (appts24.length > 0) console.log(`[cron] Sent ${appts24.length} 24-hour reminders`);

    const [appts2] = await pool.query(
      `SELECT a.id, a.patient_id, a.start_time, a.dentist_id,
              s.name AS service_name, d.name AS dentist_name, b.name AS branch_name
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       JOIN users d ON d.id = a.dentist_id
       JOIN branches b ON b.id = a.branch_id
       WHERE a.status = 'scheduled'
         AND a.reminder_sent_2h = FALSE
         AND a.start_time > DATE_ADD(UTC_TIMESTAMP(), INTERVAL 110 MINUTE)
         AND a.start_time < DATE_ADD(UTC_TIMESTAMP(), INTERVAL 130 MINUTE)`
    );

    for (const a of appts2) {
      const localTime = formatClinicTime(a.start_time);
      const dentistName = formatDentistName(a.dentist_name);
      const body2h = `Your ${a.service_name} appointment is at ${localTime} with ${dentistName} at ${a.branch_name}. Please prepare and arrive on time.`;
      await createNotification(
        a.patient_id,
        'appointment_reminder',
        'Appointment Reminder',
        body2h,
        'appointment',
        a.id
      );
      sendPushToUser(a.patient_id, { title: 'Appointment Reminder', body: body2h, data: { type: 'appointment_reminder_2h', appointment_id: a.id } }).catch(() => {});
      await pool.query('UPDATE appointments SET reminder_sent_2h = TRUE WHERE id = ?', [a.id]);
    }
    if (appts2.length > 0) console.log(`[cron] Sent ${appts2.length} 2-hour reminders`);

    const [appts1] = await pool.query(
      `SELECT a.id, a.patient_id, a.start_time, a.dentist_id,
              s.name AS service_name, d.name AS dentist_name, b.name AS branch_name
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       JOIN users d ON d.id = a.dentist_id
       JOIN branches b ON b.id = a.branch_id
       WHERE a.status = 'scheduled'
         AND a.reminder_sent_1h = FALSE
         AND a.start_time > DATE_ADD(UTC_TIMESTAMP(), INTERVAL 50 MINUTE)
         AND a.start_time < DATE_ADD(UTC_TIMESTAMP(), INTERVAL 70 MINUTE)`
    );

    for (const a of appts1) {
      const localTime = formatClinicTime(a.start_time);
      const dentistName = formatDentistName(a.dentist_name);
      const body1h = `Your ${a.service_name} appointment is at ${localTime} with ${dentistName} at ${a.branch_name}. This is your final reminder. Please arrive on time.`;
      await createNotification(
        a.patient_id,
        'appointment_reminder',
        'Appointment Reminder',
        body1h,
        'appointment',
        a.id
      );
      sendPushToUser(a.patient_id, { title: 'Appointment Reminder', body: body1h, data: { type: 'appointment_reminder_1h', appointment_id: a.id } }).catch(() => {});
      await pool.query('UPDATE appointments SET reminder_sent_1h = TRUE WHERE id = ?', [a.id]);
    }
    if (appts1.length > 0) console.log(`[cron] Sent ${appts1.length} 1-hour reminders`);

    return { sent_24h: appts24.length, sent_2h: appts2.length, sent_1h: appts1.length };
  } catch (err) {
    console.error('[cron] Appointment reminder error:', err);
    return { error: err.message };
  }
}

async function sendRecallReminders() {
  try {
    const [patients] = await pool.query(
      `SELECT id, name, recall_reminder_sent_at FROM users WHERE role = 'patient'`
    );

    let sent = 0;
    for (const p of patients) {
      const [lastApptRows] = await pool.query(
        `SELECT start_time FROM appointments
         WHERE patient_id = ? AND status = 'completed'
         ORDER BY start_time DESC LIMIT 1`,
        [p.id]
      );
      if (lastApptRows.length === 0) continue;

      const lastVisitDate = new Date(lastApptRows[0].start_time);
      const monthsSinceLastVisit =
        (Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      let recallMonths = 6;

      if (monthsSinceLastVisit < recallMonths) continue;

      if (p.recall_reminder_sent_at) {
        const daysSinceLastSent =
          (Date.now() - new Date(p.recall_reminder_sent_at).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastSent < 30) continue;
      }

      const recallBody = `Your last visit was ${Math.floor(monthsSinceLastVisit)} months ago. We recommend visits every ${recallMonths} months. Book an appointment when ready.`;
      await createNotification(
        p.id,
        'recall',
        'Time for a check-up',
        recallBody,
        null,
        null
      );
      sendPushToUser(p.id, { title: 'Time for a check-up', body: recallBody, data: { type: 'recall' } }).catch(() => {});
      await pool.query(
        'UPDATE users SET recall_reminder_sent_at = NOW() WHERE id = ?',
        [p.id]
      );
      sent++;
    }
    if (sent > 0) console.log(`[cron] Sent ${sent} recall reminders`);
    return { sent };
  } catch (err) {
    console.error('[cron] Recall reminder error:', err);
    return { error: err.message };
  }
}

async function expireAnnouncements() {
  try {
    const [result] = await pool.query(
      `
      UPDATE website_announcements
      SET status = 'expired'
      WHERE end_date < NOW()
      AND status = 'active'
      `
    );

    if (result.affectedRows > 0) {
      console.log(
        `[cron] Expired ${result.affectedRows} announcements`
      );
    }

    return {
      expired: result.affectedRows,
    };

  } catch (err) {
    console.error(
      "[cron] Announcement expiration error:",
      err
    );

    return {
      error: err.message,
    };
  }
}

function startCronJobs() {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[cron] Running appointment reminder job...');
    await sendAppointmentReminders();
  });


  cron.schedule('0 8 * * *', async () => {
    console.log('[cron] Running daily recall reminder job...');
    await sendRecallReminders();
  }, {
    timezone: 'Asia/Manila'
  });


  cron.schedule('* * * * *', async () => {
    console.log('[cron] Checking expired announcements...');
    await expireAnnouncements();
  }, {
    timezone: 'Asia/Manila'
  });


  console.log('[cron] Scheduled jobs started');
}

module.exports = {
  startCronJobs,
  sendAppointmentReminders,
  sendRecallReminders,
  expireAnnouncements,
}
