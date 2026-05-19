// routes/api/products.js
// Public product endpoints — no token required.

const express                              = require('express');
const router                               = express.Router();
const { getAllProducts, getProductById }   = require('../../controllers/api/apiProductController');

// GET /api/v1/products          — paginated + filtered list
router.get('/', getAllProducts);

// GET /api/v1/products/:id      — single product
router.get('/:id', getProductById);

module.exports = router;
