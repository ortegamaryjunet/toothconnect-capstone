const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

const attachmentUploadDir = path.join(__dirname, '../../uploads/treatment-plan-attachments');
const allowedAttachmentTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

if (!fs.existsSync(attachmentUploadDir)) {
  fs.mkdirSync(attachmentUploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, attachmentUploadDir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeBase = path
        .basename(file.originalname || 'attachment', ext)
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .slice(0, 60);
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeBase}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!allowedAttachmentTypes.has(String(file.mimetype || '').toLowerCase())) {
      return cb(new Error('Only image and PDF attachments are allowed.'));
    }
    cb(null, true);
  },
});

router.use(authenticate);

async function loadPlanForAccess(planId, user) {
  const [rows] = await pool.query(
    `SELECT tp.*, a.branch_id
     FROM treatment_plans tp
     LEFT JOIN appointments a ON a.patient_id = tp.patient_id
     WHERE tp.id = ?
     LIMIT 1`,
    [planId]
  );

  if (rows.length === 0) return null;

  const plan = rows[0];
  const role = user.role;
  const userId = user.user_id;
  const userBranches = user.branches || [];

  if (role === 'patient' && plan.patient_id !== userId) {
    const err = new Error('You can only view your own treatment plan attachments');
    err.statusCode = 403;
    throw err;
  }

  if (role === 'dentist') {
    const [check] = await pool.query(
      `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
      [userId, plan.patient_id]
    );
    if (check.length === 0) {
      const err = new Error('You have no appointments with this patient');
      err.statusCode = 403;
      throw err;
    }
  }

  if ((role === 'receptionist' || role === 'admin') && userBranches.length > 0) {
    const [check] = await pool.query(
      `SELECT 1 FROM appointments
       WHERE patient_id = ? AND branch_id IN (${userBranches.map(() => '?').join(',')})
       LIMIT 1`,
      [plan.patient_id, ...userBranches]
    );
    if (check.length === 0) {
      const err = new Error('No appointments at your branch for this patient');
      err.statusCode = 403;
      throw err;
    }
  }

  return plan;
}

async function listAttachments(planIds) {
  if (!Array.isArray(planIds) || planIds.length === 0) return {};

  const [attachments] = await pool.query(
    `SELECT id, treatment_plan_id, file_name, file_url, mime_type, file_size, uploaded_at
     FROM treatment_plan_attachments
     WHERE treatment_plan_id IN (${planIds.map(() => '?').join(',')})
     ORDER BY uploaded_at DESC, id DESC`,
    planIds
  );

  return attachments.reduce((acc, attachment) => {
    const key = attachment.treatment_plan_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(attachment);
    return acc;
  }, {});
}

router.get('/by-patient/:patientId', async (req, res) => {
  const patientId = parseInt(req.params.patientId, 10);
  const role = req.user.role;
  const userId = req.user.user_id;
  const userBranches = req.user.branches || [];

  try {
    if (role === 'patient') {
      if (patientId !== userId) {
        return res.status(403).json({ message: 'You can only view your own treatment plans' });
      }
    }

    if (role === 'dentist') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
        [userId, patientId]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'You have no appointments with this patient' });
      }
    }

    if (role === 'receptionist' || role === 'admin') {
      if (userBranches.length > 0) {
        const [check] = await pool.query(
          `SELECT 1 FROM appointments
           WHERE patient_id = ? AND branch_id IN (${userBranches.map(() => '?').join(',')})
           LIMIT 1`,
          [patientId, ...userBranches]
        );
        if (check.length === 0) {
          return res.status(403).json({ message: 'No appointments at your branch for this patient' });
        }
      }
    }

    const [rows] = await pool.query(
      `SELECT
         tp.id, tp.patient_id, tp.dentist_id, tp.tooth_number,
         tp.planned_treatment, tp.status, tp.notes, tp.date_completed,
         tp.created_at, tp.updated_at,
         d.name AS dentist_name
       FROM treatment_plans tp
       JOIN users d ON d.id = tp.dentist_id
       WHERE tp.patient_id = ?
       ORDER BY tp.tooth_number ASC, tp.created_at DESC`,
      [patientId]
    );

    const attachmentsByPlan = await listAttachments(rows.map((row) => row.id));
    const plans = rows.map((row) => ({
      ...row,
      attachments: attachmentsByPlan[row.id] || [],
      attachment_count: (attachmentsByPlan[row.id] || []).length,
    }));

    res.json({ patient_id: patientId, plans });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireRole('dentist', 'admin'), async (req, res) => {
  const { patient_id, tooth_number, planned_treatment, status, notes, date_completed } = req.body;
  const userId = req.user.user_id;
  const role = req.user.role;

  if (!patient_id || !tooth_number || !planned_treatment) {
    return res.status(400).json({ message: 'patient_id, tooth_number, and planned_treatment are required' });
  }

  if (tooth_number < 11 || tooth_number > 48) {
    return res.status(400).json({ message: 'tooth_number must be valid FDI notation (11–48)' });
  }

  const allowedStatuses = ['planned', 'in_progress', 'completed'];
  const planStatus = status && allowedStatuses.includes(status) ? status : 'planned';

  try {
    if (role === 'dentist') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
        [userId, patient_id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'You have no appointments with this patient' });
      }
    }

    const dentistId = role === 'admin'
      ? (req.body.dentist_id || userId)
      : userId;

    const [result] = await pool.query(
      `INSERT INTO treatment_plans
         (patient_id, dentist_id, tooth_number, planned_treatment, status, notes, date_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        dentistId,
        tooth_number,
        planned_treatment.trim(),
        planStatus,
        notes ? notes.trim() : null,
        date_completed || null,
      ]
    );

    res.status(201).json({ id: result.insertId, message: 'Treatment plan created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/bulk', requireRole('dentist', 'admin'), async (req, res) => {
  const { patient_id, tooth_numbers, planned_treatment, status, notes, date_completed } = req.body;
  const userId = req.user.user_id;
  const role = req.user.role;

  if (!patient_id || !Array.isArray(tooth_numbers) || tooth_numbers.length === 0 || !planned_treatment) {
    return res.status(400).json({ message: 'patient_id, tooth_numbers (array), and planned_treatment are required' });
  }

  const validTeeth = tooth_numbers.filter(t => Number.isInteger(t) && t >= 11 && t <= 48);
  if (validTeeth.length === 0) {
    return res.status(400).json({ message: 'No valid FDI tooth numbers provided (11–48)' });
  }

  const allowedStatuses = ['planned', 'in_progress', 'completed'];
  const planStatus = status && allowedStatuses.includes(status) ? status : 'planned';

  try {
    if (role === 'dentist') {
      const [check] = await pool.query(
        `SELECT 1 FROM appointments WHERE dentist_id = ? AND patient_id = ? LIMIT 1`,
        [userId, patient_id]
      );
      if (check.length === 0) {
        return res.status(403).json({ message: 'You have no appointments with this patient' });
      }
    }

    const dentistId = role === 'admin' ? (req.body.dentist_id || userId) : userId;
    const cleanTreatment = planned_treatment.trim();
    const cleanNotes = notes ? notes.trim() : null;

    const values = validTeeth.map(tooth => [
      patient_id,
      dentistId,
      tooth,
      cleanTreatment,
      planStatus,
      cleanNotes,
      date_completed || null,
    ]);

    await pool.query(
      `INSERT INTO treatment_plans
         (patient_id, dentist_id, tooth_number, planned_treatment, status, notes, date_completed)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ message: `${validTeeth.length} treatment plans created` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id', requireRole('dentist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user.user_id;
  const role = req.user.role;
  const { planned_treatment, status, notes, date_completed } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM treatment_plans WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
    const plan = rows[0];

    if (role === 'dentist' && plan.dentist_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own treatment plans' });
    }

    const allowedStatuses = ['planned', 'in_progress', 'completed'];
    const planStatus = status && allowedStatuses.includes(status) ? status : plan.status;

    await pool.query(
      `UPDATE treatment_plans
       SET planned_treatment = ?,
           status = ?,
           notes = ?,
           date_completed = ?
       WHERE id = ?`,
      [
        planned_treatment ? planned_treatment.trim() : plan.planned_treatment,
        planStatus,
        notes !== undefined ? (notes ? notes.trim() : null) : plan.notes,
        date_completed !== undefined ? (date_completed || null) : plan.date_completed,
        id,
      ]
    );

    res.json({ message: 'Treatment plan updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireRole('dentist', 'admin'), async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user.user_id;
  const role = req.user.role;

  try {
    const [rows] = await pool.query('SELECT * FROM treatment_plans WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Plan not found' });
    const plan = rows[0];

    if (role === 'dentist' && plan.dentist_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own treatment plans' });
    }

    await pool.query('DELETE FROM treatment_plans WHERE id = ?', [id]);
    res.json({ message: 'Treatment plan deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/attachments', async (req, res) => {
  const planId = parseInt(req.params.id, 10);

  try {
    const plan = await loadPlanForAccess(planId, req.user);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const attachmentsByPlan = await listAttachments([planId]);
    res.json({ attachments: attachmentsByPlan[planId] || [] });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
  }
});

router.post(
  '/:id/attachments',
  requireRole('dentist'),
  upload.array('attachments', 10),
  async (req, res) => {
    const planId = parseInt(req.params.id, 10);

    try {
      const plan = await loadPlanForAccess(planId, req.user);
      if (!plan) return res.status(404).json({ message: 'Plan not found' });

      if (plan.dentist_id !== req.user.user_id) {
        return res.status(403).json({ message: 'You can only add attachments to your own treatment plans' });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'At least one attachment is required' });
      }

      const values = req.files.map((file) => [
        planId,
        req.user.user_id,
        file.originalname,
        `/uploads/treatment-plan-attachments/${file.filename}`,
        file.mimetype,
        file.size,
      ]);

      await pool.query(
        `INSERT INTO treatment_plan_attachments
           (treatment_plan_id, uploaded_by, file_name, file_url, mime_type, file_size)
         VALUES ?`,
        [values]
      );

      const attachmentsByPlan = await listAttachments([planId]);
      res.status(201).json({
        message: 'Attachments uploaded',
        attachments: attachmentsByPlan[planId] || [],
      });
    } catch (err) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(file.path, () => {});
        });
      }
      console.error(err);
      res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
  }
);

router.delete('/attachments/:attachmentId', requireRole('dentist'), async (req, res) => {
  const attachmentId = parseInt(req.params.attachmentId, 10);

  try {
    const [rows] = await pool.query(
      `SELECT tpa.*, tp.dentist_id
       FROM treatment_plan_attachments tpa
       JOIN treatment_plans tp ON tp.id = tpa.treatment_plan_id
       WHERE tpa.id = ?`,
      [attachmentId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Attachment not found' });

    const attachment = rows[0];
    if (attachment.dentist_id !== req.user.user_id && attachment.uploaded_by !== req.user.user_id) {
      return res.status(403).json({ message: 'You can only delete attachments from your own treatment plans' });
    }

    await pool.query('DELETE FROM treatment_plan_attachments WHERE id = ?', [attachmentId]);

    if (attachment.file_url) {
      const relativePath = String(attachment.file_url).replace(/^\/uploads\//, '');
      const filePath = path.join(__dirname, '../../uploads', relativePath);
      fs.unlink(filePath, () => {});
    }

    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
