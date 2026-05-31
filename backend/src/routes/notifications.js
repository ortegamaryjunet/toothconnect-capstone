const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  const userId = req.user.user_id;
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);

  try {
    const [rows] = await pool.query(
      `SELECT id, type, title, body, related_type, related_id, is_read, read_at, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [userId, limit]
    );

    const [unreadResult] = await pool.query(
      'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      notifications: rows,
      unread_count: unreadResult[0].unread,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/unread-count', async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    res.json({ unread_count: rows[0].unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/read', async (req, res) => {
  const userId = req.user.user_id;
  const id = parseInt(req.params.id, 10);

  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:id/unread', async (req, res) => {
  const userId = req.user.user_id;
  const id = parseInt(req.params.id, 10);
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = FALSE, read_at = NULL WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Marked as unread' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/read-all', async (req, res) => {
  const userId = req.user.user_id;
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    res.json({ marked_read: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/test-low-stock', async (req, res) => {
  const userId = req.user.user_id;
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, related_type, is_read, created_at)
       VALUES (?, 'low_stock', 'Low Stock Alert', 'Low Stock: Item has reached the critical level. Immediate restocking is advised.', 'inventory', FALSE, NOW())`,
      [userId]
    );
    res.json({ message: 'Low stock notification sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
