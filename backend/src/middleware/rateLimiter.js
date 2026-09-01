const rateLimit = require('express-rate-limit');

function isMobileLoginRequest(req) {
  const platform = String(req.body?.platform || '').toLowerCase();
  const appOs = String(req.headers['x-app-os'] || '').toLowerCase();
  return platform === 'mobile' || appOs === 'ios' || appOs === 'android';
}

// 10 login attempts per 15 minutes per IP
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: isMobileLoginRequest,
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

// 5 OTP or registration requests per 10 minutes per IP
exports.registerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again after 10 minutes.' },
});

// Allows one password reset OTP, three resends, OTP checks for each code, and the final reset.
exports.passwordResetLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again after 5 minutes.' },
});
