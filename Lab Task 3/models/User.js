// models/User.js
// Stores registered users. Passwords are hashed with bcrypt before saving.

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    email: {
      type:      String,
      required:  true,
      unique:    true,       // no duplicate emails
      lowercase: true,
      trim:      true,
    },
    password: {
      type:     String,
      required: true,
      minlength: 6,
    },
    // role controls what the user can access
    // 'user'  → regular customer
    // 'admin' → full admin panel access
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// ── Hash password before every save ──────────────────────────────────────────
// Only re-hash if the password field was actually changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // saltRounds = 10 is a good balance of security vs speed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method: compare a plain-text password against the stored hash ───
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
