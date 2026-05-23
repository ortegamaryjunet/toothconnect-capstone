const db = require('../config/db');

async function createNotification({
  userId = null,
  type,
  title,
  body,
  relatedType,
  relatedId
}) {
  await db.query(
    `INSERT INTO notifications (
      user_id,
      type,
      title,
      body,
      related_type,
      related_id,
      is_read,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, 0, NOW())`,
    [userId, type, title, body, relatedType, relatedId]
  );
}

async function saveAppointment(appointmentData) {
  const {
    appointmentDate,
    appointmentTime,
    durationMinutes,
    fullName,
    email,
    phoneNumber,
    location,
    reasonForBooking
  } = appointmentData;

  const [existing] = await db.query(
    `SELECT id
     FROM online_appointments_tbl
     WHERE appointment_date = ?
       AND appointment_time = ?
       AND full_name = ?
       AND phone_number = ?
     LIMIT 1`,
    [appointmentDate, appointmentTime, fullName, phoneNumber]
  );

  if (existing.length > 0) {
    throw new Error('APPOINTMENT_ALREADY_EXISTS');
  }

  const [result] = await db.query(
    `INSERT INTO online_appointments_tbl (
      appointment_date,
      appointment_time,
      duration_minutes,
      full_name,
      email,
      phone_number,
      location,
      reason_for_booking,
      status,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
    [
      appointmentDate,
      appointmentTime,
      durationMinutes || 30,
      fullName,
      email || null,
      phoneNumber,
      location,
      reasonForBooking || null
    ]
  );

  await createNotification({
    userId: null,
    type: 'Appointment',
    title: 'New Appointment Request',
    body: `${fullName} requested an appointment on ${appointmentDate} at ${appointmentTime}.`,
    relatedType: 'appointment',
    relatedId: result.insertId
  });

  return result;
}

async function saveInquiry(inquiryData) {
  const {
    fullName,
    emailAddress,
    phoneNumber,
    branch,
    concern,
    message
  } = inquiryData;

  const [existing] = await db.query(
    `SELECT id
     FROM online_inquiries_tbl
     WHERE full_name = ?
       AND email_address = ?
       AND phone_number = ?
       AND branch = ?
       AND concern = ?
     LIMIT 1`,
    [fullName, emailAddress, phoneNumber, branch, concern]
  );

  if (existing.length > 0) {
    throw new Error('INQUIRY_ALREADY_EXISTS');
  }

  const [result] = await db.query(
    `INSERT INTO online_inquiries_tbl (
      full_name,
      email_address,
      phone_number,
      branch,
      concern,
      message,
      created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [
      fullName,
      emailAddress,
      phoneNumber,
      branch,
      concern,
      message
    ]
  );

  const inquiryId = result.insertId;

  await createNotification({
    userId: null,
    type: 'Inquiry',
    title: 'New Online Inquiry',
    body: `${fullName} sent an inquiry for ${branch} about ${concern}.`,
    relatedType: 'inquiry',
    relatedId: inquiryId
  });

  await db.query(
    `INSERT INTO messages (
      inquiry_id,
      sender_id,
      receiver_id,
      content,
      is_read,
      created_at
    )
    VALUES (?, NULL, NULL, ?, 0, NOW())`,
    [
      inquiryId,
      `Name: ${fullName}
Email: ${emailAddress}
Phone: ${phoneNumber}
Branch: ${branch}
Concern: ${concern}
Message: ${message}`
    ]
  );

  return result;
}

async function listAppointments({ search = '', status = '' } = {}) {
  let sql = `
    SELECT *
    FROM online_appointments_tbl
    WHERE 1 = 1
  `;

  const params = [];

  if (search) {
    sql += `
      AND (
        full_name LIKE ?
        OR email LIKE ?
        OR phone_number LIKE ?
        OR location LIKE ?
      )
    `;

    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  sql += ' ORDER BY created_at DESC';

  const [rows] = await db.query(sql, params);

  return rows;
}

async function updateAppointmentStatus(id, status) {
  const [result] = await db.query(
    `UPDATE online_appointments_tbl
     SET status = ?
     WHERE id = ?`,
    [status, id]
  );

  return result;
}

async function listInquiries({ search = '' } = {}) {
  let sql = `
    SELECT *
    FROM online_inquiries_tbl
    WHERE 1 = 1
  `;

  const params = [];

  if (search) {
    sql += `
      AND (
        full_name LIKE ?
        OR email_address LIKE ?
        OR phone_number LIKE ?
        OR branch LIKE ?
        OR concern LIKE ?
      )
    `;

    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }

  sql += ' ORDER BY created_at DESC';

  const [rows] = await db.query(sql, params);

  return rows;
}

// ── Website CMS ──────────────────────────────────────────────────────────────

async function getContent() {
  const [rows] = await db.query('SELECT section, field_key, field_value FROM website_content ORDER BY section, id');
  const map = {};
  for (const r of rows) {
    const k = `${r.section}_${r.field_key}`;
    map[k] = r.field_value;
  }
  return map;
}

async function upsertContent(fields) {
  for (const [key, value] of Object.entries(fields)) {
    const sep = key.indexOf('_');
    if (sep < 1) continue;
    const section = key.slice(0, sep);
    const field_key = key.slice(sep + 1);
    await db.query(
      `INSERT INTO website_content (section, field_key, field_value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE field_value = VALUES(field_value)`,
      [section, field_key, value]
    );
  }
}

async function listFaqs({ all = false } = {}) {
  const sql = all
    ? 'SELECT * FROM website_faqs ORDER BY sort_order ASC, id ASC'
    : "SELECT * FROM website_faqs WHERE status = 'active' ORDER BY sort_order ASC, id ASC";
  const [rows] = await db.query(sql);
  return rows;
}

async function createFaq({ question, answer, sort_order = 0, status = 'active' }) {
  const [result] = await db.query(
    'INSERT INTO website_faqs (question, answer, sort_order, status) VALUES (?, ?, ?, ?)',
    [question, answer, sort_order, status]
  );
  return result.insertId;
}

async function updateFaq(id, { question, answer, sort_order, status }) {
  await db.query(
    'UPDATE website_faqs SET question = ?, answer = ?, sort_order = ?, status = ? WHERE id = ?',
    [question, answer, sort_order ?? 0, status ?? 'active', id]
  );
}

async function deleteFaq(id) {
  await db.query('DELETE FROM website_faqs WHERE id = ?', [id]);
}

async function listWebsiteServices({ all = false } = {}) {
  const sql = all
    ? 'SELECT * FROM website_services ORDER BY sort_order ASC, id ASC'
    : "SELECT * FROM website_services WHERE status = 'active' ORDER BY sort_order ASC, id ASC";
  const [rows] = await db.query(sql);
  return rows;
}

async function createWebsiteService({ name, image_path, description, slug, sort_order = 0, status = 'active' }) {
  const [result] = await db.query(
    'INSERT INTO website_services (name, image_path, description, slug, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)',
    [name, image_path || null, description || null, slug || null, sort_order, status]
  );
  return result.insertId;
}

async function updateWebsiteService(id, { name, image_path, description, slug, sort_order, status }) {
  await db.query(
    'UPDATE website_services SET name = ?, image_path = ?, description = ?, slug = ?, sort_order = ?, status = ? WHERE id = ?',
    [name, image_path || null, description || null, slug || null, sort_order ?? 0, status ?? 'active', id]
  );
}

async function deleteWebsiteService(id) {
  await db.query('DELETE FROM website_services WHERE id = ?', [id]);
}

async function listAnnouncements({ all = false } = {}) {
  const today = new Date().toISOString().slice(0, 10);
  let sql, params;
  if (all) {
    sql = 'SELECT * FROM website_announcements ORDER BY created_at DESC';
    params = [];
  } else {
    sql = `SELECT * FROM website_announcements
           WHERE status = 'active'
             AND (start_date IS NULL OR start_date <= ?)
             AND (end_date IS NULL OR end_date >= ?)
           ORDER BY created_at DESC`;
    params = [today, today];
  }
  const [rows] = await db.query(sql, params);
  return rows;
}

async function createAnnouncement({ title, message, start_date, end_date, status = 'active' }) {
  const [result] = await db.query(
    'INSERT INTO website_announcements (title, message, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
    [title, message, start_date || null, end_date || null, status]
  );
  return result.insertId;
}

async function updateAnnouncement(id, { title, message, start_date, end_date, status }) {
  await db.query(
    'UPDATE website_announcements SET title = ?, message = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
    [title, message, start_date || null, end_date || null, status ?? 'active', id]
  );
}

async function deleteAnnouncement(id) {
  await db.query('DELETE FROM website_announcements WHERE id = ?', [id]);
}

module.exports = {
  saveAppointment,
  saveInquiry,
  listAppointments,
  updateAppointmentStatus,
  listInquiries,
  getContent,
  upsertContent,
  listFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  listWebsiteServices,
  createWebsiteService,
  updateWebsiteService,
  deleteWebsiteService,
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};