// routes/api/user.js
// Protected user profile endpoints — valid JWT required.

const express                          = require('express');
const router                           = express.Router();
const { verifyToken }                  = require('../../middleware/verifyToken');
const { getProfile, updateProfile }    = require('../../controllers/api/userController');

// All routes below require a valid Bearer token
router.use(verifyToken);

// GET /api/v1/user/profile   — fetch own profile
router.get('/profile', getProfile);

// PUT /api/v1/user/profile   — update name or email
router.put('/profile', updateProfile);

module.exports = router;
