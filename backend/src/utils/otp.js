const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { toMySQLDateTime } = require('./dates');

function generateOTP() {
  const length = parseInt(process.env.OTP_LENGTH, 10) || 6;
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(length, '0');
}

async function hashOTP(code) {
  return bcrypt.hash(code, 5);
}

async function verifyOTPHash(code, hash) {
  return bcrypt.compare(code, hash);
}

function otpExpiryDate() {
  const minutes = parseInt(process.env.OTP_EXPIRES_MIN, 10) || 10;
  return toMySQLDateTime(new Date(Date.now() + minutes * 60 * 1000));
}

module.exports = { generateOTP, hashOTP, verifyOTPHash, otpExpiryDate };