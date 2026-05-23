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

module.exports = {
  saveAppointment,
  saveInquiry,
  listAppointments,
  updateAppointmentStatus,
  listInquiries
};