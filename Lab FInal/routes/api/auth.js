// routes/api/auth.js
// Public authentication routes — no token required.

const express                = require('express');
const router                 = express.Router();
const { register, login }    = require('../../controllers/api/authController');

// POST /api/v1/auth/register  — create account + get token
router.post('/register', register);

// POST /api/v1/auth/login  — exchange credentials for token
router.post('/login', login);

module.exports = router;
