const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');
const {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshTokenHash,
  refreshTokenExpiryString,
} = require('../utils/tokens');
const { toMySQLDateTime } = require('../utils/dates');
const { generateOTP, hashOTP, verifyOTPHash, otpExpiryDate } = require('../utils/otp');
const { sendOTPEmail, sendTempPasswordEmail } = require('../services/email');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

async function loadUserBranches(userId) {
  const [permanent] = await pool.query(
    'SELECT branch_id FROM user_branches WHERE user_id = ?',
    [userId]
  );
  const [granted] = await pool.query(
    'SELECT branch_id FROM access_grants WHERE user_id = ? AND expires_at > NOW()',
    [userId]
  );
  return [...new Set([
    ...permanent.map((r) => r.branch_id),
    ...granted.map((r) => r.branch_id),
  ])];
}

async function issueTokens(user, platform, userAgent) {
  const branches = await loadUserBranches(user.id);

  const accessToken = signAccessToken({
    user_id: user.id,
    role: user.role,
    branches,
  });

  const refreshToken = generateRefreshToken();
  const refreshHash = await hashRefreshToken(refreshToken);
  const expiresAt = refreshTokenExpiryString(platform);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, platform, expires_at, last_used_at, user_agent)
     VALUES (?, ?, ?, ?, NOW(), ?)`,
    [user.id, refreshHash, platform, expiresAt, userAgent || null]
  );

  return { accessToken, refreshToken, branches };
}

function setRefreshCookie(res, token) {
  const maxAge = parseInt(process.env.JWT_REFRESH_WEB_IDLE_MIN, 10) * 60 * 1000;
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/api/auth',
  });
}

router.get('/branches', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, address FROM branches ORDER BY name ASC'
    );
    res.json({ branches: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register/start', async (req, res) => {
  const { email, name, password, phone, branch_id } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Email, name, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  if (!branch_id) {
     res.status(400).json({ message: 'branch_id is required' });
  }

  const [branchCheck] = await pool.query('SELECT id FROM branches WHERE id = ?', [branch_id]);
  if (branchCheck.length === 0) {
    return res.status(400).json({ message: 'Invalid branch_id' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const code = generateOTP();
    const codeHash = await hashOTP(code);
    const expiresAt = otpExpiryDate();

    await pool.query(
      `UPDATE otp_codes SET consumed_at = NOW()
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL`,
      [email]
    );
    await pool.query(
      `INSERT INTO otp_codes (email, code_hash, purpose, expires_at) VALUES (?, ?, 'register', ?)`,
      [email, codeHash, expiresAt]
    );

    const passwordHash = await bcrypt.hash(password, 10);
    const pendingExpires = toMySQLDateTime(new Date(Date.now() + 30 * 60 * 1000));

    await pool.query(`DELETE FROM pending_registrations WHERE email = ? AND intended_role = 'patient'`, [email]);
    
    await pool.query(
      `INSERT INTO pending_registrations (email, name, phone, branch_id, password_hash, intended_role, expires_at)
       VALUES (?, ?, ?, ?, 'patient', ?)`,
      [email, name, phone, branch_id || null, passwordHash, pendingExpires]
    );

    await sendOTPEmail({ to: email, code, purpose: 'register' });

    res.json({ message: 'OTP sent. Check your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register/verify', async (req, res) => {
  const { email, code, platform = 'mobile' } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: 'Email and code are required' });
  }

  try {
    const [otps] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (otps.length === 0) {
      return res.status(400).json({ message: 'No valid OTP found. Request a new one.' });
    }

    const otp = otps[0];
    const maxAttempts = parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5;
    if (otp.attempts >= maxAttempts) {
      await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);
      return res.status(400).json({ message: 'Too many attempts. Request a new code.' });
    }

    const ok = await verifyOTPHash(code, otp.code_hash);
    if (!ok) {
      await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [otp.id]);
      return res.status(400).json({ message: 'Invalid code' });
    }

    const [pendings] = await pool.query(
      `SELECT * FROM pending_registrations
       WHERE email = ? AND intended_role = 'patient' AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (pendings.length === 0) {
      return res.status(400).json({ message: 'No pending registration found. Start over.' });
    }
    const pending = pendings[0];

    const [result] = await pool.query(
      `INSERT INTO users (role, name, email, password_hash, phone, email_verified)
       VALUES ('patient', ?, ?, ?, ?, TRUE)`,
      [pending.name, email, pending.password_hash, pending.phone]
    );
    const userId = result.insertId;
    const patientBranchId = pendingRow.branch_id;

      if (patientBranchId) {
        await pool.query(
          'UPDATE users SET home_branch_id = ? WHERE id = ?',
          [patientBranchId, newUserId]
        );
        await pool.query(
          'INSERT INTO user_branches (user_id, branch_id) VALUES (?, ?)',
          [newUserId, patientBranchId]
        );
      }

    await pool.query(`DELETE FROM pending_registrations WHERE email = ?`, [email]);

    await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);

    const user = { id: userId, role: 'patient' };
    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken, branches } = await issueTokens(user, platform, userAgent);

    if (platform === 'web') setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      refreshToken: platform === 'mobile' ? refreshToken : undefined,
      user: { id: userId, role: 'patient', name: pending.name, email, branches },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, platform = 'mobile' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const [users] = await pool.query(
      `SELECT id, role, name, email, password_hash, must_change_password, email_verified
       FROM users WHERE email = ?`,
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.role === 'patient' && !user.email_verified) {
      return res.status(403).json({ message: 'Email not verified. Please complete registration.' });
    }

    if (platform === 'web' && user.role === 'patient') {
      return res.status(403).json({ message: 'Patients use the mobile app to log in' });
    }
    if (platform === 'mobile' && user.role !== 'patient') {
      return res.status(403).json({ message: 'Staff log in via the web app' });
    }

    const userAgent = req.headers['user-agent'];
    const { accessToken, refreshToken, branches } = await issueTokens(user, platform, userAgent);

    if (platform === 'web') setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      refreshToken: platform === 'mobile' ? refreshToken : undefined,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        branches,
        must_change_password: !!user.must_change_password,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/refresh', async (req, res) => {
  const platform = req.body.platform || (req.cookies?.refresh_token ? 'web' : 'mobile');
  const submittedToken = platform === 'web' ? req.cookies?.refresh_token : req.body.refreshToken;
  if (!submittedToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const [tokens] = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE platform = ? AND revoked_at IS NULL AND expires_at > NOW()`,
      [platform]
    );

    let matched = null;
    for (const t of tokens) {
      if (await verifyRefreshTokenHash(submittedToken, t.token_hash)) {
        matched = t;
        break;
      }
    }
    if (!matched) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const [users] = await pool.query('SELECT id, role FROM users WHERE id = ?', [matched.user_id]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    const user = users[0];

    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [matched.id]);
    const { accessToken, refreshToken, branches } = await issueTokens(user, platform, req.headers['user-agent']);

    if (platform === 'web') setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      refreshToken: platform === 'mobile' ? refreshToken : undefined,
      user: { id: user.id, role: user.role, branches },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', authenticate, async (req, res) => {
  const platform = req.body.platform || (req.cookies?.refresh_token ? 'web' : 'mobile');
  const submittedToken = platform === 'web' ? req.cookies?.refresh_token : req.body.refreshToken;

  try {
    if (submittedToken) {
      const [tokens] = await pool.query(
        `SELECT id, token_hash FROM refresh_tokens
         WHERE user_id = ? AND platform = ? AND revoked_at IS NULL`,
        [req.user.user_id, platform]
      );
      for (const t of tokens) {
        if (await verifyRefreshTokenHash(submittedToken, t.token_hash)) {
          await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [t.id]);
          break;
        }
      }
    }

    if (platform === 'web') {
      res.clearCookie('refresh_token', { path: '/api/auth' });
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ message: 'If an account exists, an OTP has been sent.' });
    }

    const code = generateOTP();
    const codeHash = await hashOTP(code);
    const expiresAt = otpExpiryDate();

    await pool.query(
      `UPDATE otp_codes SET consumed_at = NOW()
       WHERE email = ? AND purpose = 'reset_password' AND consumed_at IS NULL`,
      [email]
    );
    await pool.query(
      `INSERT INTO otp_codes (email, code_hash, purpose, expires_at) VALUES (?, ?, 'register', ?)`,
      [email, codeHash, expiresAt]
    );

    await sendOTPEmail({ to: email, code, purpose: 'reset_password' });

    res.json({ message: 'If an account exists, an OTP has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const [otps] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE email = ? AND purpose = 'reset_password' AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (otps.length === 0) {
      return res.status(400).json({ message: 'No valid OTP found' });
    }
    const otp = otps[0];

    const ok = await verifyOTPHash(code, otp.code_hash);
    if (!ok) {
      await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [otp.id]);
      return res.status(400).json({ message: 'Invalid code' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = ?, must_change_password = FALSE WHERE email = ?',
      [passwordHash, email]
    );
    await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = NOW()
       WHERE user_id = (SELECT id FROM users WHERE email = ?) AND revoked_at IS NULL`,
      [email]
    );

    res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin-register/start', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json({ message: 'Email, name, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const [admins] = await pool.query(`SELECT id FROM users WHERE role = 'admin' LIMIT 1`);
    if (admins.length > 0) {
      return res.status(403).json({ message: 'An admin already exists. Contact your existing admin.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const code = generateOTP();
    const codeHash = await hashOTP(code);
    const expiresAt = otpExpiryDate();

    await pool.query(
      `UPDATE otp_codes SET consumed_at = NOW()
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL`,
      [email]
    );
    await pool.query(
      `INSERT INTO otp_codes (email, code_hash, purpose, expires_at) VALUES (?, ?, 'register', ?)`,
      [email, codeHash, expiresAt]
    );

    const passwordHash = await bcrypt.hash(password, 10);
    const pendingExpires = toMySQLDateTime(new Date(Date.now() + 30 * 60 * 1000));

    await pool.query(`DELETE FROM pending_registrations WHERE email = ? AND intended_role = 'admin'`, [email]);
    await pool.query(
      `INSERT INTO pending_registrations (email, name, password_hash, intended_role, expires_at)
       VALUES (?, ?, ?, 'admin', ?)`,
      [email, name, passwordHash, pendingExpires]
    );

    await sendOTPEmail({ to: email, code, purpose: 'register' });
    res.json({ message: 'OTP sent. Check your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin-register/verify', async (req, res) => {
  const { email, code, platform = 'web' } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });

  try {
    const [otps] = await pool.query(
      `SELECT * FROM otp_codes
       WHERE email = ? AND purpose = 'register' AND consumed_at IS NULL AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (otps.length === 0) return res.status(400).json({ message: 'No valid OTP found' });
    const otp = otps[0];

    const ok = await verifyOTPHash(code, otp.code_hash);
    if (!ok) {
      await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?', [otp.id]);
      return res.status(400).json({ message: 'Invalid code' });
    }

    const [pendings] = await pool.query(
      `SELECT * FROM pending_registrations
       WHERE email = ? AND intended_role = 'admin' AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [email]
    );
    if (pendings.length === 0) return res.status(400).json({ message: 'No pending registration. Start over.' });
    const pending = pendings[0];

    const [result] = await pool.query(
      `INSERT INTO users (role, name, email, password_hash, email_verified)
       VALUES ('admin', ?, ?, ?, TRUE)`,
      [pending.name, email, pending.password_hash]
    );
    const userId = result.insertId;

    await pool.query(`DELETE FROM pending_registrations WHERE email = ?`, [email]);

    const [branches] = await pool.query('SELECT id FROM branches');
    for (const b of branches) {
      await pool.query(
        `INSERT INTO user_branches (user_id, branch_id, is_primary) VALUES (?, ?, ?)`,
        [userId, b.id, false]
      );
    }

    await pool.query('UPDATE otp_codes SET consumed_at = NOW() WHERE id = ?', [otp.id]);

    const user = { id: userId, role: 'admin' };
    const { accessToken, refreshToken, branches: userBranches } = await issueTokens(user, platform, req.headers['user-agent']);
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { id: userId, role: 'admin', name: pending.name, email, branches: userBranches },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/staff', authenticate, requireRole('admin'), async (req, res) => {
  const { email, name, role, home_branch_id, branch_ids, phone } = req.body;
  if (!email || !name || !role || !home_branch_id || !branch_ids?.length) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  if (!['dentist', 'receptionist'].includes(role)) {
    return res.status(400).json({ message: 'Role must be dentist or receptionist' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ message: 'Email already in use' });

    const tempPassword = crypto.randomBytes(6).toString('base64').replace(/[+/=]/g, '').slice(0, 10) + '!1';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const [result] = await pool.query(
      `INSERT INTO users (role, home_branch_id, name, email, password_hash, phone, email_verified, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)`,
      [role, home_branch_id, name, email, passwordHash, phone || null]
    );
    const userId = result.insertId;

    for (const branchId of branch_ids) {
      await pool.query(
        `INSERT INTO user_branches (user_id, branch_id, is_primary) VALUES (?, ?, ?)`,
        [userId, branchId, branchId === home_branch_id]
      );
    }

    await sendTempPasswordEmail({ to: email, name, tempPassword });

    res.json({
      message: 'Staff account created. Temporary password sent by email.',
      tempPassword,
      user: { id: userId, role, name, email, home_branch_id, branch_ids },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  const [users] = await pool.query(
    'SELECT id, role, name, email, must_change_password FROM users WHERE id = ?',
    [req.user.user_id]
  );
  if (users.length === 0) return res.status(404).json({ message: 'User not found' });
  const branches = await loadUserBranches(req.user.user_id);
  res.json({ ...users[0], branches });
});

module.exports = router;