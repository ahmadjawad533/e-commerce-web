// routes/api/index.js
// Central mount point for all /api/v1 routes.
// Imported once in server.js as:  app.use('/api/v1', require('./routes/api/index'));

const express  = require('express');
const router   = express.Router();

// ── Sub-routers ───────────────────────────────────────────────────────────────
router.use('/auth',     require('./auth'));
router.use('/products', require('./products'));
router.use('/orders',   require('./orders'));
router.use('/user',     require('./user'));

// ── Sales data endpoint ───────────────────────────────────────────────────────
const { getSalesData } = require('../../controllers/salesController');
router.get('/sales-data', getSalesData);

// ── API health check ──────────────────────────────────────────────────────────
// GET /api/v1/health  — quick ping to confirm the API is alive
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Engine API v1 is running.',
    timestamp: new Date().toISOString(),
  });
});

// ── API 404 handler ───────────────────────────────────────────────────────────
// Catches any /api/v1/* route that doesn't match above
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

module.exports = router;
