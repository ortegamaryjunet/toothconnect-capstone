const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/threads', async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT
         other_user.id AS other_user_id,
         other_user.name AS other_user_name,
         other_user.role AS other_user_role,
         m.content AS last_message_body,
         m.sender_id AS last_message_from,
         m.created_at AS last_message_at,
         (
           SELECT COUNT(*) FROM messages m2
           WHERE m2.sender_id = other_user.id
             AND m2.receiver_id = ?
             AND m2.is_read = FALSE
         ) AS unread_count
       FROM (
         SELECT
           CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id,
           MAX(id) AS last_message_id
         FROM messages
         WHERE sender_id = ? OR receiver_id = ?
         GROUP BY other_id
       ) threads
       JOIN messages m ON m.id = threads.last_message_id
       JOIN users other_user ON other_user.id = threads.other_id
       ORDER BY m.created_at DESC`,
      [userId, userId, userId, userId]
    );
    res.json({ threads: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/thread/:otherUserId', async (req, res) => {
  const userId = req.user.user_id;
  const otherUserId = parseInt(req.params.otherUserId, 10);

  if (Number.isNaN(otherUserId)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.read_at, m.created_at,
              u_from.name AS from_user_name, u_from.role AS from_user_role
       FROM messages m
       JOIN users u_from ON u_from.id = m.sender_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [userId, otherUserId, otherUserId, userId]
    );
    res.json({ messages: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { receiver_id, content, branch_id } = req.body;
  const userId = req.user.user_id;
  const userRole = req.user.role;
  const userBranches = req.user.branches || [];

  if (!receiver_id || !content || !content.trim()) {
    return res.status(400).json({ message: 'receiver_id and content are required' });
  }
  if (receiver_id === userId) {
    return res.status(400).json({ message: 'Cannot send a message to yourself' });
  }

  try {
    const [recipients] = await pool.query(
      'SELECT id, role, name, home_branch_id FROM users WHERE id = ?',
      [receiver_id]
    );
    if (recipients.length === 0) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    const recipient = recipients[0];

    const validPairs = [
      ['patient', 'receptionist'],
      ['receptionist', 'patient'],
    ];
    const allowed = validPairs.some(
      pair => pair[0] === userRole && pair[1] === recipient.role
    );
    if (!allowed) {
      return res.status(403).json({
        message: `${userRole} cannot send messages to ${recipient.role}`,
      });
    }

    if (userRole === 'patient' && recipient.role === 'receptionist') {
      const [accessCheck] = await pool.query(
        `SELECT 1 FROM user_branches ub
         WHERE ub.user_id = ?
           AND (
             ub.branch_id IN (SELECT DISTINCT branch_id FROM appointments WHERE patient_id = ?)
             OR ub.branch_id = (SELECT home_branch_id FROM users WHERE id = ?)
           )
         LIMIT 1`,
        [receiver_id, userId, userId]
      );
      if (accessCheck.length === 0) {
        return res.status(403).json({
          message: 'You can only message receptionists at branches you visit',
        });
      }
    }
    
    let effectiveBranchId = branch_id;
    if (!effectiveBranchId) {
      if (userRole === 'patient') {
        effectiveBranchId = recipient.home_branch_id || (userBranches[0]) || null;
      } else {
        effectiveBranchId = userBranches[0] || recipient.home_branch_id || null;
      }
    }
    if (!effectiveBranchId) {
      return res.status(400).json({ message: 'Unable to determine branch for this message' });
    }

    const [result] = await pool.query(
      `INSERT INTO messages (branch_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)`,
      [effectiveBranchId, userId, receiver_id, content.trim()]
    );

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, related_type, related_id)
       VALUES (?, 'message', ?, ?, 'message', ?)`,
      [
        receiver_id,
        `New message from ${req.user.name || userRole}`,
        content.trim().slice(0, 100),
        result.insertId,
      ]
    );

    res.status(201).json({
      id: result.insertId,
      message: 'Message sent',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/thread/:otherUserId/read', async (req, res) => {
  const userId = req.user.user_id;
  const otherUserId = parseInt(req.params.otherUserId, 10);

  try {
    const [result] = await pool.query(
      `UPDATE messages
       SET is_read = TRUE, read_at = NOW()
       WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [otherUserId, userId]
    );

    res.json({ marked_read: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/contacts', async (req, res) => {
  const role = req.user.role;
  const userId = req.user.user_id;

  try {
    if (role === 'patient') {
      const [rows] = await pool.query(
        `SELECT DISTINCT u.id, u.name, u.role, b.id AS branch_id, b.name AS branch_name
         FROM users u
         JOIN user_branches ub ON ub.user_id = u.id
         JOIN branches b ON b.id = ub.branch_id
         WHERE u.role = 'receptionist'
           AND (
             b.id IN (SELECT DISTINCT branch_id FROM appointments WHERE patient_id = ?)
             OR b.id = (SELECT home_branch_id FROM users WHERE id = ?)
           )
         ORDER BY b.name, u.name`,
        [userId, userId]
      );
      res.json({ contacts: rows });
    } else {
      const [rows] = await pool.query(
        `SELECT DISTINCT u.id, u.name, u.role
         FROM users u
         JOIN appointments a ON a.patient_id = u.id
         WHERE u.role = 'patient'
         ORDER BY u.name`
      );
      res.json({ contacts: rows });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;