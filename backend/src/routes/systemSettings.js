const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
const CLINIC_LOGO_KEY = 'clinic_logo_path';
let settingsTableReady = false;

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedTypes.includes(String(file.mimetype || '').toLowerCase())) return cb(null, true);
    return cb(new Error('Only PNG, JPG, WEBP, HEIC, and HEIF image files are allowed.'));
  },
});

async function ensureSystemSettingsTable() {
  if (settingsTableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clinic_system_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  settingsTableReady = true;
}

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return false;
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return true;
}

async function uploadClinicLogo(file) {
  if (!configureCloudinary()) throw new Error('Cloudinary is not configured.');
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'toothconnect/system', public_id: 'clinic-logo', overwrite: true, invalidate: true, resource_type: 'image' },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    stream.end(file.buffer);
  });
}

router.get('/clinic-logo', async (req, res) => {
  try {
    await ensureSystemSettingsTable();
    const [rows] = await pool.query(
      'SELECT setting_value FROM clinic_system_settings WHERE setting_key = ? LIMIT 1',
      [CLINIC_LOGO_KEY]
    );
    const path = rows[0]?.setting_value || '';
    return res.json({ path, cleared: rows.length > 0 && !path });
  } catch (error) {
    console.error('Fetch clinic logo error:', error);
    return res.status(500).json({ message: 'Failed to load clinic logo.' });
  }
});

router.post('/clinic-logo/upload', authenticate, requireRole('admin'), logoUpload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No clinic logo uploaded.' });
  try {
    const path = await uploadClinicLogo(req.file);
    return res.json({ path, url: path });
  } catch (error) {
    console.error('Upload clinic logo error:', error);
    return res.status(500).json({ message: error.message || 'Failed to upload clinic logo.' });
  }
});

router.put('/clinic-logo', authenticate, requireRole('admin'), async (req, res) => {
  const path = String(req.body?.path || '').trim();
  if (path && !/^https:\/\//i.test(path)) return res.status(400).json({ message: 'A valid uploaded logo URL is required.' });
  try {
    await ensureSystemSettingsTable();
    await pool.query(
      `INSERT INTO clinic_system_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [CLINIC_LOGO_KEY, path]
    );
    return res.json({ path, cleared: !path });
  } catch (error) {
    console.error('Save clinic logo error:', error);
    return res.status(500).json({ message: 'Failed to save clinic logo.' });
  }
});

module.exports = router;
