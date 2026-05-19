// server.js
// Entry point — loads env vars, connects to MongoDB, starts Express.

// Load .env variables FIRST — before any other require that might need them
require('dotenv').config();

const express        = require('express');
const path           = require('path');
const mongoose       = require('mongoose');
const methodOverride = require('method-override');

// ── Route modules ─────────────────────────────────────────────────────────────
const indexRoutes   = require('./routes/index');
const productRoutes = require('./routes/products');
const adminRoutes   = require('./routes/admin');
const salesRoutes   = require('./routes/sales');
const apiRoutes     = require('./routes/api/index');   // ← new API layer

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MongoDB connection ────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engine-fashion';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅  MongoDB connected:', MONGO_URI))
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Template engine ───────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Method override (HTML form PUT/DELETE support) ────────────────────────────
app.use(methodOverride('_method'));

// ── Static assets ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────────────────
// API routes are mounted first so /api/v1/* never falls through to the EJS 404
app.use('/api/v1', apiRoutes);

// Storefront + admin (EJS-rendered)
app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/sales', salesRoutes);

// ── EJS 404 handler (storefront only) ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Return JSON for API requests, HTML for everything else
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error.',
    });
  }

  res.status(500).render('admin/error', {
    title:   'Server Error',
    message: err.message || 'Something went wrong.',
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Engine server running at http://localhost:${PORT}`);
  console.log(`API available at  http://localhost:${PORT}/api/v1`);
});
