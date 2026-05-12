const { Expo } = require('expo-server-sdk');
const pool = require('../config/db');

const expo = new Expo();

function isValidExpoPushToken(token) {
  return typeof token === 'string' && Expo.isExpoPushToken(token);
}

async function getUserPushToken(userId) {
  const [rows] = await pool.query(
    'SELECT push_token FROM users WHERE id = ?',
    [userId]
  );
  if (rows.length === 0) return null;
  return rows[0].push_token;
}

async function sendPushToUser(userId, { title, body, data }) {
  const token = await getUserPushToken(userId);
  if (!token) {
    console.log(`[push] No token registered for user ${userId}, skipping`);
    return { sent: false, reason: 'no_token' };
  }
  if (!isValidExpoPushToken(token)) {
    console.log(`[push] Invalid token format for user ${userId}: ${token}`);
    return { sent: false, reason: 'invalid_token' };
  }

  const message = {
    to: token,
    sound: 'default',
    title,
    body,
    data: data || {},
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    console.log(`[push] Sent to user ${userId}: "${title}"`);
    return { sent: true, tickets };
  } catch (err) {
    console.error(`[push] Failed to send to user ${userId}:`, err.message);
    return { sent: false, reason: 'send_failed', error: err.message };
  }
}

async function sendPushToUsers(userIds, { title, body, data }) {
  const results = [];
  for (const userId of userIds) {
    const res = await sendPushToUser(userId, { title, body, data });
    results.push({ userId, ...res });
  }
  return results;
}

module.exports = {
  sendPushToUser,
  sendPushToUsers,
  isValidExpoPushToken,
};