// middleware/authAdmin.js
// Optional authentication middleware for protecting admin routes
// 
// USAGE:
// const authAdmin = require('../middleware/authAdmin');
// router.get('/sales', authAdmin, getSalesDashboard);
//
// NOTE: This is a basic example. Customize based on your authentication strategy.

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify admin authentication
 * Checks for JWT token in cookies or Authorization header
 */
function authAdmin(req, res, next) {
  // Try to get token from cookie first, then from Authorization header
  const token = req.cookies?.adminToken || 
                req.headers.authorization?.split(' ')[1];

  if (!token) {
    // No token found - redirect to login or return 401
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }
    return res.redirect('/admin/login?redirect=' + encodeURIComponent(req.originalUrl));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if user is admin (customize based on your User schema)
    if (decoded.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    // Attach user info to request object
    req.admin = decoded;
    next();
  } catch (err) {
    console.error('authAdmin error:', err.message);

    // Invalid or expired token
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }
    return res.redirect('/admin/login?error=Session+expired');
  }
}

module.exports = authAdmin;
