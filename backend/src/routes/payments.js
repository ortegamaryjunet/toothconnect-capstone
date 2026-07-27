const crypto = require('crypto');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

async function notifyBranchReceptionists(branchId, notification) {
  const [receptionists] = await pool.query(
    `SELECT DISTINCT u.id
     FROM users u
     LEFT JOIN user_branches ub ON ub.user_id = u.id
     WHERE u.role = 'receptionist'
       AND u.status = 'Active'
       AND (u.home_branch_id = ? OR ub.branch_id = ?)`,
    [branchId, branchId]
  );

  if (receptionists.length === 0) {
    return;
  }

  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
     VALUES ${receptionists.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}`,
    receptionists.flatMap((receptionist) => [
      receptionist.id,
      notification.type,
      notification.title,
      notification.body,
      notification.relatedType || null,
      notification.relatedId || null,
    ])
  );
}

async function notifyReceiptUploaded(paymentId, appointment, amount) {
  const [details] = await pool.query(
    `SELECT patient.name AS patient_name, s.name AS service_name
     FROM appointments a
     JOIN users patient ON patient.id = a.patient_id
     JOIN services s ON s.id = a.service_id
     WHERE a.id = ?`,
    [appointment.id]
  );
  const detail = details[0] || {};

  await notifyBranchReceptionists(appointment.branch_id, {
    type: 'receipt_pending_validation',
    title: 'New receipt pending acknowledgement',
    body: `${detail.patient_name || 'A patient'} uploaded a receipt for ${detail.service_name || 'an appointment'} (${Number(amount || 0).toLocaleString('en-PH', { style: 'currency', currency: 'PHP' })}).`,
    relatedType: 'payment',
    relatedId: paymentId,
  });
}

const ALLOWED_RECEIPT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_RECEIPT_MIME_TYPES.has(String(file.mimetype || '').toLowerCase())) {
      cb(null, true);
      return;
    }

    cb(new Error('Proof of payment must be an image file.'));
  },
});

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return true;
}

async function uploadProofImage(file) {
  if (!file) {
    return null;
  }

  if (!configureCloudinary()) {
    const err = new Error('Cloudinary is not configured for proof uploads.');
    err.statusCode = 500;
    throw err;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'toothconnect/staff-payment-proofs',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          fileName: file.originalname,
          mimeType: file.mimetype,
        });
      }
    );

    stream.end(file.buffer);
  });
}

function userBranchFilter(req, requestedBranchId) {
  const userBranches = req.user.branches || [];

  if (requestedBranchId) {
    const branchId = Number.parseInt(requestedBranchId, 10);
    if (Number.isNaN(branchId)) {
      const err = new Error('Invalid branch id');
      err.statusCode = 400;
      throw err;
    }

    if (req.user.role !== 'admin' && !userBranches.includes(branchId)) {
      const err = new Error('No access to this branch');
      err.statusCode = 403;
      throw err;
    }

    return { clause: ' AND a.branch_id = ?', params: [branchId] };
  }

  if (req.user.role === 'admin') {
    return { clause: '', params: [] };
  }

  if (userBranches.length === 0) {
    const err = new Error('No branch access');
    err.statusCode = 403;
    throw err;
  }

  return {
    clause: ` AND a.branch_id IN (${userBranches.map(() => '?').join(',')})`,
    params: userBranches,
  };
}

function normalizeDateRange(from, to) {
  return {
    fromDate: from || '1970-01-01',
    toDate: to || '2999-12-31',
  };
}

function formatDate(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value).slice(0, 10);
}

function formatMysqlDateTime(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function paymentSelect() {
  return `SELECT
            p.id, p.appointment_id, p.branch_id, p.patient_id, p.amount,
            p.amount_received, p.payment_method, p.payment_source,
            p.ewallet_provider, p.reference_number,
            p.receipt_url, p.receipt_public_id, p.receipt_file_name,
            p.receipt_mime_type, p.receipt_uploaded_at, p.paid_at,
            p.proof_image_url, p.proof_image_public_id,
            p.proof_image_file_name, p.proof_image_mime_type,
            p.status, p.verified_by, p.verified_at, p.rejection_reason,
            p.recorded_by, p.recorded_at, p.created_at, p.updated_at,
            b.name AS branch_name,
            b.address AS branch_address,
            COALESCE(pp.full_name, patient.name) AS patient_name,
            patient.email AS patient_email,
            dentist.name AS dentist_name,
            s.name AS service_name,
            verifier.name AS verified_by_name,
            recorder.name AS recorded_by_name
          FROM payments p
          JOIN appointments a ON a.id = p.appointment_id
          JOIN branches b ON b.id = p.branch_id
          JOIN users patient ON patient.id = p.patient_id
          JOIN users dentist ON dentist.id = a.dentist_id
          JOIN services s ON s.id = a.service_id
          LEFT JOIN patient_profile pp ON pp.user_id = patient.id
          LEFT JOIN users verifier ON verifier.id = p.verified_by
          LEFT JOIN users recorder ON recorder.id = p.recorded_by`;
}

router.post('/cloudinary-signature', requireRole('patient'), async (req, res) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(500).json({ message: 'Cloudinary is not configured' });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = req.body.folder || 'toothconnect/payment-receipts';
  const params = { folder, timestamp };
  const signatureBase = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  const signature = crypto
    .createHash('sha1')
    .update(`${signatureBase}${apiSecret}`)
    .digest('hex');

  res.json({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
  });
});

router.post('/receipts', requireRole('patient'), async (req, res) => {
  const {
    appointment_id,
    amount,
    payment_method = 'ewallet',
    ewallet_provider,
    reference_number,
    receipt_url,
    receipt_public_id,
    receipt_file_name,
    receipt_mime_type,
    paid_at,
  } = req.body;

  if (!appointment_id || !amount || !receipt_url || !receipt_public_id) {
    return res.status(400).json({
      message: 'appointment_id, amount, receipt_url, and receipt_public_id are required',
    });
  }

  if (
    receipt_mime_type &&
    !ALLOWED_RECEIPT_MIME_TYPES.has(String(receipt_mime_type).toLowerCase())
  ) {
    return res.status(400).json({ message: 'Receipt must be an image file.' });
  }

  try {
    const [appointments] = await pool.query(
      `SELECT id, branch_id, patient_id FROM appointments WHERE id = ?`,
      [appointment_id]
    );

    if (appointments.length === 0) return res.status(404).json({ message: 'Appointment not found' });

    const appointment = appointments[0];
    if (appointment.patient_id !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only upload receipts for your own appointments' });
    }

    const [pendingPayments] = await pool.query(
      `SELECT id FROM payments
       WHERE appointment_id = ?
         AND patient_id = ?
         AND status = 'pending'
         AND receipt_url IS NULL
         AND payment_method IN ('ewallet', 'bank_transfer')
       ORDER BY id DESC
       LIMIT 1`,
      [appointment.id, appointment.patient_id]
    );

    if (pendingPayments.length > 0) {
      const paidAt = formatMysqlDateTime(paid_at);

      await pool.query(
        `UPDATE payments
         SET amount = ?, payment_method = ?, ewallet_provider = ?,
             amount_received = ?, payment_source = 'patient_upload',
             reference_number = ?, receipt_url = ?, receipt_public_id = ?,
             receipt_file_name = ?, receipt_mime_type = ?,
             receipt_uploaded_at = NOW(), paid_at = ?
         WHERE id = ?`,
        [
          amount,
          payment_method,
          ewallet_provider || null,
          amount,
          reference_number || null,
          receipt_url,
          receipt_public_id,
          receipt_file_name || null,
          receipt_mime_type || null,
          paidAt,
          pendingPayments[0].id,
        ]
      );

      try {
        await notifyReceiptUploaded(pendingPayments[0].id, appointment, amount);
      } catch (notificationErr) {
        console.error('Failed to create receipt notification:', notificationErr);
      }

      return res.status(200).json({
        id: pendingPayments[0].id,
        message: 'Receipt uploaded for admin verification.',
      });
    }

    const paidAt = formatMysqlDateTime(paid_at);

    const [result] = await pool.query(
      `INSERT INTO payments (
         appointment_id, branch_id, patient_id, amount, amount_received, payment_method,
         payment_source,
         ewallet_provider, reference_number, receipt_url, receipt_public_id,
         receipt_file_name, receipt_mime_type, receipt_uploaded_at, paid_at, status
       )
       VALUES (?, ?, ?, ?, ?, ?, 'patient_upload', ?, ?, ?, ?, ?, ?, NOW(), ?, 'pending')`,
      [
        appointment.id,
        appointment.branch_id,
        appointment.patient_id,
        amount,
        amount,
        payment_method,
        ewallet_provider || null,
        reference_number || null,
        receipt_url,
        receipt_public_id,
        receipt_file_name || null,
        receipt_mime_type || null,
        paidAt,
      ]
    );

    try {
      await notifyReceiptUploaded(result.insertId, appointment, amount);
    } catch (notificationErr) {
      console.error('Failed to create receipt notification:', notificationErr);
    }

    res.status(201).json({
      id: result.insertId,
      message: 'Receipt uploaded for admin verification.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/staff', requireRole('receptionist', 'admin'), upload.single('proof_image'), async (req, res) => {
  const {
    appointment_id,
    amount,
    payment_method,
    ewallet_provider,
    reference_number,
    staff_recorded,
  } = req.body;

  const normalizedMethod = String(payment_method || '').trim();
  const amountValue = Number(amount);
  const isStaffRecorded = staff_recorded === true || staff_recorded === 'true';

  if (
    !appointment_id ||
    !Number.isFinite(amountValue) ||
    amountValue <= 0 ||
    !['cash', 'ewallet', 'bank_transfer', 'card'].includes(normalizedMethod)
  ) {
    return res.status(400).json({
      message: 'appointment_id, amount, and payment_method are required',
    });
  }

  try {
    const proof = await uploadProofImage(req.file);
    const [appointments] = await pool.query(
      `SELECT id, branch_id, patient_id, status FROM appointments WHERE id = ?`,
      [appointment_id]
    );

    if (appointments.length === 0) return res.status(404).json({ message: 'Appointment not found' });

    const appointment = appointments[0];
    if (req.user.role !== 'admin' && !(req.user.branches || []).includes(appointment.branch_id)) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Appointment must be completed before recording payment' });
    }

    let paymentId;
    let paymentStatus;

    if (isStaffRecorded) {
      const [pendingPayments] = await pool.query(
        `SELECT id
         FROM payments
         WHERE appointment_id = ?
           AND patient_id = ?
           AND status = 'pending'
           AND receipt_url IS NULL
         ORDER BY id DESC
         LIMIT 1`,
        [appointment.id, appointment.patient_id]
      );

      if (pendingPayments.length > 0) {
        paymentId = pendingPayments[0].id;

        await pool.query(
          `UPDATE payments
           SET amount = ?,
               amount_received = ?,
               payment_method = ?,
               payment_source = 'staff_recorded',
               ewallet_provider = ?,
               reference_number = ?,
               proof_image_url = ?,
               proof_image_public_id = ?,
               proof_image_file_name = ?,
               proof_image_mime_type = ?,
               paid_at = NOW(),
               status = 'verified',
               verified_by = ?,
               verified_at = NOW(),
               recorded_by = ?,
               recorded_at = NOW(),
               rejection_reason = NULL
           WHERE id = ?`,
          [
            amountValue,
            amountValue,
            normalizedMethod,
            ewallet_provider || null,
            reference_number || null,
            proof?.url || null,
            proof?.publicId || null,
            proof?.fileName || null,
            proof?.mimeType || null,
            req.user.user_id,
            req.user.user_id,
            paymentId,
          ]
        );
      } else {
        const [result] = await pool.query(
          `INSERT INTO payments (
             appointment_id, branch_id, patient_id, amount, amount_received,
             payment_method, payment_source, ewallet_provider, reference_number,
             proof_image_url, proof_image_public_id, proof_image_file_name,
             proof_image_mime_type, paid_at, status, verified_by, verified_at,
             recorded_by, recorded_at
           )
           VALUES (?, ?, ?, ?, ?, ?, 'staff_recorded', ?, ?, ?, ?, ?, ?, NOW(), 'verified', ?, NOW(), ?, NOW())`,
          [
            appointment.id,
            appointment.branch_id,
            appointment.patient_id,
            amountValue,
            amountValue,
            normalizedMethod,
            ewallet_provider || null,
            reference_number || null,
            proof?.url || null,
            proof?.publicId || null,
            proof?.fileName || null,
            proof?.mimeType || null,
            req.user.user_id,
            req.user.user_id,
          ]
        );

        paymentId = result.insertId;
      }

      paymentStatus = 'verified';
    } else {
      const isCash = normalizedMethod === 'cash';
      const [result] = await pool.query(
        `INSERT INTO payments (
           appointment_id, branch_id, patient_id, amount, amount_received,
           payment_method, payment_source, ewallet_provider, reference_number,
           paid_at, status, verified_by, verified_at, recorded_by, recorded_at
         )
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appointment.id,
          appointment.branch_id,
          appointment.patient_id,
          amountValue,
          amountValue,
          normalizedMethod,
          isCash ? 'staff_recorded' : 'patient_upload',
          ewallet_provider || null,
          reference_number || null,
          isCash ? new Date() : null,
          isCash ? 'verified' : 'pending',
          isCash ? req.user.user_id : null,
          isCash ? new Date() : null,
          isCash ? req.user.user_id : null,
          isCash ? new Date() : null,
        ]
      );

      paymentId = result.insertId;
      paymentStatus = isCash ? 'verified' : 'pending';
    }

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, branch_id, details)
       VALUES (?, 'payment_recorded_by_staff', ?, ?)`,
      [req.user.user_id, appointment.branch_id, JSON.stringify({
        payment_id: paymentId,
        appointment_id: appointment.id,
        payment_method: normalizedMethod,
        amount: amountValue,
        payment_source: isStaffRecorded ? 'staff_recorded' : undefined,
      })]
    );

    if (!isStaffRecorded && paymentStatus === 'pending') {
      try {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
           VALUES (?, 'receipt_upload_enabled', 'Upload Your Receipt', ?, 'appointment', ?)`,
          [
            appointment.patient_id,
            'Your payment has been recorded. Please upload your receipt so we can verify it.',
            appointment.id,
          ]
        );
      } catch (notifErr) {
        console.error('Failed to create receipt upload notification:', notifErr);
      }
    }

    res.status(201).json({
      id: paymentId,
      status: paymentStatus,
      payment_source: isStaffRecorded ? 'staff_recorded' : (normalizedMethod === 'cash' ? 'staff_recorded' : 'patient_upload'),
      proof_image_url: proof?.url || null,
      message: paymentStatus === 'verified'
        ? 'Payment recorded and marked as paid.'
        : 'Payment method recorded. Awaiting patient receipt upload.',
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.get('/', requireRole('admin', 'receptionist'), async (req, res) => {
  const { status, branch_id, from, to, patient_id, payment_source } = req.query;

  try {
    const branch = userBranchFilter(req, branch_id);
    const { fromDate, toDate } = normalizeDateRange(from, to);
    const conditions = ['DATE(COALESCE(p.paid_at, p.created_at)) BETWEEN ? AND ?'];
    const params = [fromDate, toDate];

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (payment_source) {
      conditions.push('p.payment_source = ?');
      params.push(payment_source);
    }

    if (patient_id) {
      const pid = parseInt(patient_id, 10);
      if (!Number.isNaN(pid)) {
        conditions.push('p.patient_id = ?');
        params.push(pid);
      }
    }

    const [rows] = await pool.query(
      `${paymentSelect()}
       WHERE ${conditions.join(' AND ')} ${branch.clause}
       ORDER BY p.created_at DESC`,
      [...params, ...branch.params]
    );

    res.json({ payments: rows });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.patch('/:id/status', requireRole('admin', 'receptionist'), async (req, res) => {
  const paymentId = Number.parseInt(req.params.id, 10);
  const { status, rejection_reason } = req.body;

  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be verified or rejected' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id, branch_id, patient_id, appointment_id, status, receipt_url, payment_source FROM payments WHERE id = ?',
      [paymentId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Payment not found' });

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending receipts can be acknowledged or rejected.' });
    }

    if (existing[0].payment_source !== 'patient_upload') {
      return res.status(400).json({ message: 'Only patient-uploaded receipts can be acknowledged or rejected.' });
    }

    if (!existing[0].receipt_url) {
      return res.status(400).json({ message: 'Receipt must be uploaded before acknowledgement.' });
    }

    if (
      req.user.role === 'receptionist' &&
      !(req.user.branches || []).includes(Number(existing[0].branch_id))
    ) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query(
      `UPDATE payments
       SET status = ?, verified_by = ?, verified_at = NOW(),
           rejection_reason = ?
       WHERE id = ?`,
      [status, req.user.user_id, status === 'rejected' ? rejection_reason || null : null, paymentId]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, 'payment_status_updated', ?)`,
      [req.user.user_id, JSON.stringify({ payment_id: paymentId, status })]
    );

    try {
      const { patient_id, appointment_id } = existing[0];
      if (status === 'verified') {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
           VALUES (?, 'receipt_validated', 'Receipt Acknowledged', 'Your payment receipt has been acknowledged successfully.', 'appointment', ?)`,
          [patient_id, appointment_id]
        );
      } else {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
           VALUES (?, 'receipt_rejected', 'Receipt Rejected', ?, 'appointment', ?)`,
          [
            patient_id,
            rejection_reason || 'Your payment receipt was not accepted. Please contact the clinic.',
            appointment_id,
          ]
        );
      }
    } catch (notifErr) {
      console.error('Failed to create payment status notification:', notifErr);
    }

    res.json({ message: `Payment ${status}.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/reopen-upload', requireRole('admin', 'receptionist'), async (req, res) => {
  const paymentId = Number.parseInt(req.params.id, 10);

  try {
    const [existing] = await pool.query(
      'SELECT id, branch_id, status FROM payments WHERE id = ?',
      [paymentId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Payment not found' });

    if (existing[0].status !== 'rejected') {
      return res.status(400).json({ message: 'Only rejected receipts can be opened for re-upload.' });
    }

    if (
      req.user.role === 'receptionist' &&
      !(req.user.branches || []).includes(Number(existing[0].branch_id))
    ) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query(
      `UPDATE payments
       SET status = 'pending',
           receipt_url = NULL,
           receipt_public_id = NULL,
           receipt_file_name = NULL,
           receipt_mime_type = NULL,
           receipt_uploaded_at = NULL,
           paid_at = NULL,
           verified_by = NULL,
           verified_at = NULL,
           rejection_reason = NULL
       WHERE id = ?`,
      [paymentId]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, 'payment_receipt_reupload_enabled', ?)`,
      [req.user.user_id, JSON.stringify({ payment_id: paymentId })]
    );

    res.json({ message: 'Receipt upload has been re-enabled for this patient.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/amount', requireRole('admin', 'receptionist'), async (req, res) => {
  const paymentId = Number.parseInt(req.params.id, 10);
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than 0.' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT id, branch_id, status FROM payments WHERE id = ?',
      [paymentId]
    );
    if (existing.length === 0) return res.status(404).json({ message: 'Payment not found' });

    if (existing[0].status !== 'pending') {
      return res.status(400).json({ message: 'Only pending receipt amounts can be edited.' });
    }

    if (
      req.user.role === 'receptionist' &&
      !(req.user.branches || []).includes(Number(existing[0].branch_id))
    ) {
      return res.status(403).json({ message: 'No access to this branch' });
    }

    await pool.query(
      'UPDATE payments SET amount = ? WHERE id = ?',
      [amount, paymentId]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, details)
       VALUES (?, 'payment_amount_updated', ?)`,
      [req.user.user_id, JSON.stringify({ payment_id: paymentId, amount })]
    );

    res.json({ message: 'Payment amount updated.', amount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/expenses', requireRole('admin'), async (req, res) => {
  const { branch_id, from, to } = req.query;

  try {
    const branch = userBranchFilter(req, branch_id);
    const { fromDate, toDate } = normalizeDateRange(from, to);

    const [rows] = await pool.query(
      `SELECT e.*, b.name AS branch_name, u.name AS recorded_by_name
       FROM clinic_expenses e
       JOIN branches b ON b.id = e.branch_id
       LEFT JOIN users u ON u.id = e.recorded_by
       WHERE e.expense_date BETWEEN ? AND ? ${branch.clause.replaceAll('a.', 'e.')}
       ORDER BY e.expense_date DESC, e.created_at DESC`,
      [fromDate, toDate, ...branch.params]
    );

    res.json({ expenses: rows });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.post('/expenses', requireRole('admin'), async (req, res) => {
  const {
    branch_id,
    category,
    description,
    amount,
    expense_date,
    receipt_url,
    receipt_public_id,
  } = req.body;

  if (!branch_id || !category || !description || !amount || !expense_date) {
    return res.status(400).json({
      message: 'branch_id, category, description, amount, and expense_date are required',
    });
  }

  try {
    await userBranchFilter(req, branch_id);
    const [result] = await pool.query(
      `INSERT INTO clinic_expenses (
         branch_id, category, description, amount, expense_date,
         recorded_by, receipt_url, receipt_public_id, status
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'recorded')`,
      [
        branch_id,
        category,
        description,
        amount,
        expense_date,
        req.user.user_id,
        receipt_url || null,
        receipt_public_id || null,
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Expense recorded.' });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

router.get('/reports/revenue', requireRole('admin'), async (req, res) => {
  const { branch_id, from, to } = req.query;

  try {
    const branch = userBranchFilter(req, branch_id);
    const { fromDate, toDate } = normalizeDateRange(from, to);

    const [incomeRows] = await pool.query(
      `SELECT
         YEARWEEK(COALESCE(p.paid_at, p.verified_at, p.created_at), 3) AS period_key,
         MIN(DATE(COALESCE(p.paid_at, p.verified_at, p.created_at))) AS start_date,
         MAX(DATE(COALESCE(p.paid_at, p.verified_at, p.created_at))) AS end_date,
         SUM(p.amount) AS income
       FROM payments p
       JOIN appointments a ON a.id = p.appointment_id
       WHERE p.status = 'verified'
         AND DATE(COALESCE(p.paid_at, p.verified_at, p.created_at)) BETWEEN ? AND ?
         ${branch.clause}
       GROUP BY period_key
       ORDER BY period_key ASC`,
      [fromDate, toDate, ...branch.params]
    );

    const expenseBranchClause = branch.clause.replaceAll('a.', 'e.');
    const [expenseRows] = await pool.query(
      `SELECT
         YEARWEEK(e.expense_date, 3) AS period_key,
         MIN(e.expense_date) AS start_date,
         MAX(e.expense_date) AS end_date,
         SUM(e.amount) AS expense
       FROM clinic_expenses e
       WHERE e.status = 'recorded'
         AND e.expense_date BETWEEN ? AND ?
         ${expenseBranchClause}
       GROUP BY period_key
       ORDER BY period_key ASC`,
      [fromDate, toDate, ...branch.params]
    );

    const periods = new Map();
    for (const row of incomeRows) {
      periods.set(row.period_key, {
        period_key: row.period_key,
        start_date: row.start_date,
        end_date: row.end_date,
        income: Number(row.income || 0),
        expense: 0,
      });
    }

    for (const row of expenseRows) {
      const existing = periods.get(row.period_key) || {
        period_key: row.period_key,
        start_date: row.start_date,
        end_date: row.end_date,
        income: 0,
        expense: 0,
      };
      existing.start_date = existing.start_date || row.start_date;
      existing.end_date = existing.end_date || row.end_date;
      existing.expense = Number(row.expense || 0);
      periods.set(row.period_key, existing);
    }

    const rows = [...periods.values()].sort((a, b) => Number(a.period_key) - Number(b.period_key));
    const totalIncome = rows.reduce((sum, row) => sum + row.income, 0);
    const totalExpense = rows.reduce((sum, row) => sum + row.expense, 0);
    const verifiedPayments = await pool.query(
      `SELECT COUNT(*) AS count
       FROM payments p
       JOIN appointments a ON a.id = p.appointment_id
       WHERE p.status = 'verified'
         AND DATE(COALESCE(p.paid_at, p.verified_at, p.created_at)) BETWEEN ? AND ?
         ${branch.clause}`,
      [fromDate, toDate, ...branch.params]
    );
    const pendingPayments = await pool.query(
      `SELECT COUNT(*) AS count
       FROM payments p
       JOIN appointments a ON a.id = p.appointment_id
       WHERE p.status = 'pending'
         AND DATE(p.created_at) BETWEEN ? AND ?
         ${branch.clause}`,
      [fromDate, toDate, ...branch.params]
    );

    res.json({
      title: 'Revenue, Income, and Expense Reports',
      mainChartTitle: 'Revenue and Expense Overview',
      statusChartTitle: 'Financial Status',
      summary: {
        totalRecords: rows.length,
        activeData: verifiedPayments[0][0].count,
        thisMonth: rows.filter((row) => {
          const date = new Date(row.start_date);
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length,
        attention: pendingPayments[0][0].count,
      },
      labels: rows.map((row) => `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`),
      mainData: rows.map((row) => row.income),
      statusLabels: ['Income', 'Expense', 'Net'],
      statusData: [totalIncome, totalExpense, Math.max(totalIncome - totalExpense, 0)],
      headers: ['ID', 'Date', 'Description', 'Income', 'Expense', 'Net Amount', 'Status'],
      rows: rows.map((row, index) => {
        const net = row.income - row.expense;
        return [
          `RV-${String(index + 1).padStart(3, '0')}`,
          `${formatDate(row.start_date)} to ${formatDate(row.end_date)}`,
          'Verified payment income vs recorded expenses',
          row.income.toFixed(2),
          row.expense.toFixed(2),
          net.toFixed(2),
          net < 0 ? 'Critical' : net > 50000 ? 'High' : 'Normal',
        ];
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.statusCode ? err.message : 'Server error' });
  }
});

module.exports = router;
