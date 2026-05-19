// server.js
// Entry point — connects to MongoDB then starts the Express server.

const express  = require('express');
const path     = require('path');
const mongoose = require('mongoose');

const indexRoutes   = require('./routes/index');
const productRoutes = require('./routes/products');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MongoDB connection ────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engine-fashion';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅  MongoDB connected:', MONGO_URI))
  .catch((err) => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1); // stop the server if DB is unreachable
  });

// ── Template engine ───────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static assets (CSS, JS, images) ──────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/', indexRoutes);
app.use('/products', productRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Engine server running at http://localhost:${PORT}`);
});
