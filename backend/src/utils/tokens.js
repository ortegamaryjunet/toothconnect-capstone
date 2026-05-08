const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: `${process.env.JWT_ACCESS_EXPIRES_MIN}m`,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

async function hashRefreshToken(token) {
  return bcrypt.hash(token, 8);
}

async function verifyRefreshTokenHash(token, hash) {
  return bcrypt.compare(token, hash);
}

function refreshTokenIdleWindowMs(platform) {
  if (platform === 'web') {
    return parseInt(process.env.JWT_REFRESH_WEB_IDLE_MIN, 10) * 60 * 1000;
  }
  return parseInt(process.env.JWT_REFRESH_MOBILE_IDLE_DAYS, 10) * 24 * 60 * 60 * 1000;
}

function refreshTokenExpiryString(platform) {
  const { toMySQLDateTime } = require('./dates');
  return toMySQLDateTime(new Date(Date.now() + refreshTokenIdleWindowMs(platform)));
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshTokenHash,
  refreshTokenIdleWindowMs,
  refreshTokenExpiryString,
};