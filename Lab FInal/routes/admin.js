// routes/admin.js
// All admin routes — mounted at /admin in server.js

const express  = require('express');
const router   = express.Router();
const upload   = require('../config/multer');
const {
  getDashboard,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  putEditProduct,
  deleteProduct,
} = require('../controllers/adminController');

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get('/', getDashboard);

// ── Create ───────────────────────────────────────────────────────────────────
router.get('/products/new', getAddProduct);

// upload.single('image') processes the file field named "image" in the form
router.post('/products', upload.single('image'), postAddProduct);

// ── Edit ─────────────────────────────────────────────────────────────────────
router.get('/products/:id/edit', getEditProduct);

// method-override lets us send PUT from an HTML form via ?_method=PUT
router.put('/products/:id', upload.single('image'), putEditProduct);

// ── Delete ───────────────────────────────────────────────────────────────────
router.delete('/products/:id', deleteProduct);

module.exports = router;
