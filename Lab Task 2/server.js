const express = require('express');
const path    = require('path');
const routes  = require('./routes/index');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Template engine ──────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static assets (CSS, JS, images) ─────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ───────────────────────────────────────
app.use('/', routes);

// ── 404 handler ──────────────────────────────────
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// ── Start server ─────────────────────────────────
app.listen(PORT, () => {
  console.log(`Engine server running at http://localhost:${PORT}`);
});
