// middleware/verifyToken.js
// Protects API routes by validating the JWT in the Authorization header.
//
// Usage in a route file:
//   const { verifyToken, requireAdmin } = require('../middleware/verifyToken');
//   router.get('/profile', verifyToken, profileController);
//   router.delete('/users/:id', verifyToken, requireAdmin, deleteUser);

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── verifyToken ───────────────────────────────────────────────────────────────
// Reads the Bearer token from the Authorization header, verifies it,
// then attaches the full user document to req.user so downstream
// handlers can use it without another DB call.
async function verifyToken(req, res, next) {
  try {
    // 1. Pull the Authorization header value
    const authHeader = req.headers['authorization'];

    // Header must exist and look like "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // 2. Extract the token string (everything after "Bearer ")
    const token = authHeader.split(' ')[1];

    // 3. Verify the token signature and expiry using our secret
    //    jwt.verify throws if the token is invalid or expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch the user from DB to make sure they still exist
    //    (handles the case where a user was deleted after the token was issued)
    const user = await User.findById(decoded.user_id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.',
      });
    }

    // 5. Attach user to the request object for use in route handlers
    req.user = user;
    next();

  } catch (err) {
    // jwt.verify throws specific error types we can handle gracefully
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.',
      });
    }

    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }

    // Unexpected error
    console.error('verifyToken error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
}

// ── requireAdmin ──────────────────────────────────────────────────────────────
// Must be used AFTER verifyToken (relies on req.user being set).
// Returns 403 if the authenticated user is not an admin.
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden. Admin access required.',
  });
}

module.exports = { verifyToken, requireAdmin };
