// routes/sales.js
// Sales dashboard routes — mounted at /admin/sales in server.js

const express = require('express');
const router = express.Router();
const { getSalesDashboard } = require('../controllers/salesController');

// ── Sales Dashboard ──────────────────────────────────────────────────────────
// GET /admin/sales
router.get('/', getSalesDashboard);

module.exports = router;
