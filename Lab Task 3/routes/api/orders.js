// routes/api/orders.js
// Protected order endpoints — valid JWT required on every route.

const express                        = require('express');
const router                         = express.Router();
const { verifyToken }                = require('../../middleware/verifyToken');
const { createOrder, getMyOrders }   = require('../../controllers/api/orderController');

// All routes below this line require a valid Bearer token
router.use(verifyToken);

// POST /api/v1/orders   — place a new order
router.post('/', createOrder);

// GET  /api/v1/orders   — list orders (own orders for users, all for admins)
router.get('/', getMyOrders);

module.exports = router;
