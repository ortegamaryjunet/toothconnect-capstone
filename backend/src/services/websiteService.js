const db = require('../config/db');

async function saveAppointment(appointmentData) {
  const {
    appointmentDate,
    appointmentTime,
    durationMinutes,
    fullName,
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
    `INSERT INTO online_appointments_tbl
     (
      appointment_date,
      appointment_time,
      duration_minutes,
      full_name,
      phone_number,
      location,
      reason_for_booking,
      status,
      created_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
    [
      appointmentDate,
      appointmentTime,
      durationMinutes || 30,
      fullName,
      phoneNumber,
      location,
      reasonForBooking || null
    ]
  );

  return result;
}

async function saveInquiry(inquiryData) {
  const {
    fullName,
    phoneNumber,
    concern,
    message
  } = inquiryData;

  const [existing] = await db.query(
    `SELECT id
     FROM online_inquiries_tbl
     WHERE full_name = ?
     AND phone_number = ?
     AND concern = ?
     LIMIT 1`,
    [fullName, phoneNumber, concern]
  );

  if (existing.length > 0) {
    throw new Error('INQUIRY_ALREADY_EXISTS');
  }

  const [result] = await db.query(
    `INSERT INTO online_inquiries_tbl
     (
      full_name,
      phone_number,
      concern,
      message,
      created_at
     )
     VALUES (?, ?, ?, ?, NOW())`,
    [fullName, phoneNumber, concern, message]
  );

  return result;
}

async function listAppointments({ search = '', status = '' } = {}) {
  let sql = `SELECT * FROM online_appointments_tbl WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND (full_name LIKE ? OR phone_number LIKE ? OR location LIKE ?)`;
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY created_at DESC`;

  const [rows] = await db.query(sql, params);
  return rows;
}

async function updateAppointmentStatus(id, status) {
  const [result] = await db.query(
    `UPDATE online_appointments_tbl SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result;
}

async function listInquiries({ search = '' } = {}) {
  let sql = `SELECT * FROM online_inquiries_tbl WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND (full_name LIKE ? OR phone_number LIKE ? OR concern LIKE ?)`;
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  sql += ` ORDER BY created_at DESC`;

  const [rows] = await db.query(sql, params);
  return rows;
}

module.exports = {
  saveAppointment,
  saveInquiry,
  listAppointments,
  updateAppointmentStatus,
  listInquiries,
};