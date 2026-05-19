// controllers/api/authController.js
// Handles user registration and login, returns a signed JWT on success.

const jwt  = require('jsonwebtoken');
const User = require('../../models/User');

// ── Helper: build and sign a JWT ─────────────────────────────────────────────
function signToken(user) {
  const payload = {
    user_id: user._id,   // used by verifyToken to fetch the user
    role:    user.role,  // used by requireAdmin without an extra DB call
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );
}

// ════════════════════════════════════════════════════════════════════════════
// POST /api/v1/auth/register
// Create a new user account and return a JWT immediately.
// Body: { name, email, password }
// ════════════════════════════════════════════════════════════════════════════
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // ── Basic validation ─────────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and password are all required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // ── Check for duplicate email ─────────────────────────────────────────────
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with that email already exists.',
      });
    }

    // ── Create user (password is hashed by the pre-save hook in User.js) ─────
    const user = await User.create({ name, email, password });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// POST /api/v1/auth/login
// Validate credentials and return a signed JWT.
// Body: { email, password }
// ════════════════════════════════════════════════════════════════════════════
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // ── Basic validation ─────────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required.',
      });
    }

    // ── Find user by email ────────────────────────────────────────────────────
    // We need the password field here so we can compare it — it's excluded
    // by default in other queries via .select('-password')
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      // Use a generic message — don't reveal whether the email exists
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Compare the submitted password against the stored hash ────────────────
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Issue JWT ─────────────────────────────────────────────────────────────
    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      // Tell the client when the token expires so it can refresh proactively
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });

  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { register, login };
