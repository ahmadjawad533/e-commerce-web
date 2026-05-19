// controllers/adminController.js
// Handles all admin CRUD operations for products.

const Product = require('../models/Product');
const fs      = require('fs');
const path    = require('path');

// ── Helper: delete an uploaded image file from disk ──────────────────────────
function deleteImageFile(imagePath) {
  if (!imagePath) return;
  // imagePath stored in DB is like "/uploads/filename.jpg"
  const fullPath = path.join(__dirname, '../public', imagePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.warn('Could not delete image file:', fullPath);
  });
}

// ════════════════════════════════════════════════════════════════════════════
// GET /admin
// Dashboard — shows all products in a table
// ════════════════════════════════════════════════════════════════════════════
async function getDashboard(req, res) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.render('admin/dashboard', {
      title:    'Admin Dashboard — Engine',
      products,
      success:  req.query.success || null,  // flash-style message via query param
      error:    req.query.error   || null,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).render('admin/error', { title: 'Error', message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GET /admin/products/new
// Show the "Add Product" form
// ════════════════════════════════════════════════════════════════════════════
function getAddProduct(req, res) {
  res.render('admin/product-form', {
    title:   'Add Product — Admin',
    product: null,   // null = we are creating, not editing
    errors:  [],
    action:  '/admin/products',
    method:  'POST',
  });
}

// ════════════════════════════════════════════════════════════════════════════
// POST /admin/products
// Handle "Add Product" form submission
// ════════════════════════════════════════════════════════════════════════════
async function postAddProduct(req, res) {
  // ── Collect and validate fields ──────────────────────────────────────────
  const { name, price, category, rating, stock } = req.body;
  const errors = validateProductFields({ name, price, category, rating, stock });

  if (errors.length > 0) {
    // If a file was uploaded but validation failed, delete it to avoid orphans
    if (req.file) deleteImageFile('/uploads/' + req.file.filename);

    return res.render('admin/product-form', {
      title:   'Add Product — Admin',
      product: req.body,   // re-fill the form with what the user typed
      errors,
      action:  '/admin/products',
      method:  'POST',
    });
  }

  try {
    // Build the image path that will be stored in MongoDB
    // e.g.  /uploads/1716000000000-shirt.jpg
    const imagePath = req.file ? '/uploads/' + req.file.filename : '';

    await Product.create({
      name:     name.trim(),
      price:    parseFloat(price),
      category: category.trim(),
      rating:   parseFloat(rating),
      stock:    parseInt(stock),
      image:    imagePath,
    });

    res.redirect('/admin?success=Product+added+successfully');
  } catch (err) {
    console.error('postAddProduct error:', err);
    res.status(500).render('admin/error', { title: 'Error', message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GET /admin/products/:id/edit
// Show the "Edit Product" form pre-filled with existing data
// ════════════════════════════════════════════════════════════════════════════
async function getEditProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.redirect('/admin?error=Product+not+found');
    }

    res.render('admin/product-form', {
      title:   'Edit Product — Admin',
      product,
      errors:  [],
      // POST to /admin/products/:id?_method=PUT  (method-override)
      action:  `/admin/products/${product._id}?_method=PUT`,
      method:  'POST',
    });
  } catch (err) {
    console.error('getEditProduct error:', err);
    res.status(500).render('admin/error', { title: 'Error', message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// PUT /admin/products/:id
// Handle "Edit Product" form submission
// ════════════════════════════════════════════════════════════════════════════
async function putEditProduct(req, res) {
  const { name, price, category, rating, stock } = req.body;
  const errors = validateProductFields({ name, price, category, rating, stock });

  if (errors.length > 0) {
    if (req.file) deleteImageFile('/uploads/' + req.file.filename);

    return res.render('admin/product-form', {
      title:   'Edit Product — Admin',
      product: { ...req.body, _id: req.params.id },
      errors,
      action:  `/admin/products/${req.params.id}?_method=PUT`,
      method:  'POST',
    });
  }

  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.redirect('/admin?error=Product+not+found');

    // If a new image was uploaded, delete the old one from disk
    if (req.file && existing.image) {
      deleteImageFile(existing.image);
    }

    const updatedImage = req.file
      ? '/uploads/' + req.file.filename
      : existing.image; // keep the old image if no new one was uploaded

    await Product.findByIdAndUpdate(req.params.id, {
      name:     name.trim(),
      price:    parseFloat(price),
      category: category.trim(),
      rating:   parseFloat(rating),
      stock:    parseInt(stock),
      image:    updatedImage,
    });

    res.redirect('/admin?success=Product+updated+successfully');
  } catch (err) {
    console.error('putEditProduct error:', err);
    res.status(500).render('admin/error', { title: 'Error', message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// DELETE /admin/products/:id
// Delete a product and its image file
// ════════════════════════════════════════════════════════════════════════════
async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.redirect('/admin?error=Product+not+found');

    // Remove the image file from disk before deleting the DB record
    if (product.image) deleteImageFile(product.image);

    await Product.findByIdAndDelete(req.params.id);

    res.redirect('/admin?success=Product+deleted+successfully');
  } catch (err) {
    console.error('deleteProduct error:', err);
    res.status(500).render('admin/error', { title: 'Error', message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER — validate required product fields
// Returns an array of error strings (empty = valid)
// ════════════════════════════════════════════════════════════════════════════
function validateProductFields({ name, price, category, rating, stock }) {
  const errors = [];

  if (!name || name.trim() === '')
    errors.push('Product name is required.');

  if (!price || isNaN(price) || parseFloat(price) < 0)
    errors.push('A valid price (0 or more) is required.');

  if (!category || category.trim() === '')
    errors.push('Category is required.');

  if (!rating || isNaN(rating) || parseFloat(rating) < 0 || parseFloat(rating) > 5)
    errors.push('Rating must be a number between 0 and 5.');

  if (!stock || isNaN(stock) || parseInt(stock) < 0)
    errors.push('Stock must be a whole number (0 or more).');

  return errors;
}

module.exports = {
  getDashboard,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  putEditProduct,
  deleteProduct,
};
