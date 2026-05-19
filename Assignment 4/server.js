// server.js
// Entry point — connects to MongoDB then starts the Express server.

const express        = require('express');
const path           = require('path');
const mongoose       = require('mongoose');
const methodOverride = require('method-override');

const indexRoutes   = require('./routes/index');
const productRoutes = require('./routes/products');
const adminRoutes   = require('./routes/admin');

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

// ── Body parsers (needed to read form POST data) ──────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Method override — lets HTML forms send PUT and DELETE requests ─────────────
// Usage: add ?_method=PUT or ?_method=DELETE to the form action URL
app.use(methodOverride('_method'));

// ── Static assets (CSS, JS, images, uploads) ──────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', indexRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).render('admin/error', {
    title:   'Server Error',
    message: err.message || 'Something went wrong.',
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Engine server running at http://localhost:${PORT}`);
});
