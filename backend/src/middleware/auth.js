const { verifyAccessToken } = require('../utils/tokens');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  try {
    const token = header.slice(7);
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: role not allowed' });
    }
    next();
  };
}

function requireBranchAccess(branchIdParam = 'branchId') {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const branchId = parseInt(
      req.params[branchIdParam] ?? req.body[branchIdParam] ?? req.query[branchIdParam],
      10
    );
    if (Number.isNaN(branchId)) {
      return res.status(400).json({ message: `Missing ${branchIdParam}` });
    }
    if (!req.user.branches.includes(branchId)) {
      return res.status(403).json({ message: 'Forbidden: no access to this branch' });
    }
    next();
  };
}

module.exports = { authenticate, requireRole, requireBranchAccess };