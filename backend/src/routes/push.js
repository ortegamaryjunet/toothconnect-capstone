const express = require('express');
const pool = require('../config/db');
const { authenticate, requireRole } = require('../middleware/auth');
const push = require('../services/push');

const router = express.Router();

router.use(authenticate);

router.post('/token', async (req, res) => {
  const { push_token } = req.body;
  const userId = req.user.user_id;

  if (!push_token) {
    await pool.query(
      'UPDATE users SET push_token = NULL, push_token_updated_at = NOW() WHERE id = ?',
      [userId]
    );
    console.log(`[push] Token cleared for user ${userId}`);
    return res.json({ message: 'Push token cleared' });
  }

  if (!push.isValidExpoPushToken(push_token)) {
    console.log(`[push] Invalid token registration attempt for user ${userId}`);
    return res.status(400).json({ message: 'Invalid Expo push token format' });
  }

  try {
    await pool.query(
      'UPDATE users SET push_token = ?, push_token_updated_at = NOW() WHERE id = ?',
      [push_token, userId]
    );
    console.log(`[push] Token registered for user ${userId}`);
    res.json({ message: 'Push token registered' });
  } catch (err) {
    console.error(`[push] Failed to register token for user ${userId}:`, err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/registration-status', async (req, res) => {
  const userId = req.user.user_id;
  const {
    success,
    reason,
    stage,
    error,
    existing_status,
    final_status,
    project_id,
    device_name,
    os,
  } = req.body || {};

  console.log(
    `[push] Registration status for user ${userId}: ` +
    `success=${Boolean(success)} ` +
    `reason=${reason || 'none'} ` +
    `stage=${stage || 'unknown'} ` +
    `permission=${final_status || existing_status || 'unknown'} ` +
    `project_id=${project_id || 'missing'} ` +
    `os=${os || 'unknown'} ` +
    `device=${device_name || 'unknown'} ` +
    `error=${error || 'none'}`
  );

  res.json({ message: 'Push registration status logged' });
});

router.post('/_test', requireRole('admin'), async (req, res) => {
  const { user_id, title, body } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required' });
  }

  const result = await push.sendPushToUser(user_id, {
    title: title || 'Test notification',
    body: body || 'This is a test from the ToothConnect backend.',
    data: { type: 'test' },
  });

  res.json(result);
});

router.post('/_test-self', async (req, res) => {
  const userId = req.user.user_id;
  const { title, body } = req.body;

  const result = await push.sendPushToUser(userId, {
    title: title || 'Hello from ToothConnect',
    body: body || 'Push notifications are working on your device.',
    data: { type: 'test' },
  });

  res.json(result);
});

module.exports = router;
