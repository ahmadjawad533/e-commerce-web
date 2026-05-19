// controllers/api/userController.js
// Protected user-facing endpoints.

const User  = require('../../models/User');
const Order = require('../../models/Order');

// ════════════════════════════════════════════════════════════════════════════
// GET /api/v1/user/profile
// Returns the authenticated user's profile + their order count.
// req.user is already attached by verifyToken — no extra DB call needed.
// ════════════════════════════════════════════════════════════════════════════
async function getProfile(req, res) {
  try {
    // Count how many orders this user has placed
    const orderCount = await Order.countDocuments({ user: req.user._id });

    return res.status(200).json({
      success: true,
      data: {
        id:         req.user._id,
        name:       req.user.name,
        email:      req.user.email,
        role:       req.user.role,
        orderCount,
        memberSince: req.user.createdAt,
      },
    });

  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUT /api/v1/user/profile
// Update the authenticated user's name or email.
// Body: { name?, email? }
// ════════════════════════════════════════════════════════════════════════════
async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const updates = {};

    if (name  && name.trim())  updates.name  = name.trim();
    if (email && email.trim()) updates.email = email.toLowerCase().trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one field to update (name or email).',
      });
    }

    // Check if the new email is already taken by someone else
    if (updates.email) {
      const taken = await User.findOne({
        email: updates.email,
        _id:   { $ne: req.user._id },  // exclude the current user
      });

      if (taken) {
        return res.status(409).json({
          success: false,
          message: 'That email is already in use.',
        });
      }
    }

    const updated = await User
      .findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated.',
      data: {
        id:    updated._id,
        name:  updated.name,
        email: updated.email,
        role:  updated.role,
      },
    });

  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getProfile, updateProfile };
