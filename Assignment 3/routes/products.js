// routes/products.js
// Mounts the /products route and delegates logic to the controller.

const express           = require('express');
const router            = express.Router();
const { getProducts }   = require('../controllers/productController');

// GET /products?page=1&search=tee&category=Men&minPrice=500&maxPrice=3000
router.get('/', getProducts);

module.exports = router;
