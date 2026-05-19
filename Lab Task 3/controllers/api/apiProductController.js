// controllers/api/apiProductController.js
// Public API endpoints for browsing products.
// All responses are JSON — no EJS rendering here.

const Product = require('../../models/Product');

const PAGE_SIZE = 8; // products per page (same as the storefront)

// ════════════════════════════════════════════════════════════════════════════
// GET /api/v1/products
// Returns a paginated, filterable list of products.
//
// Query params (all optional):
//   page       — page number, default 1
//   limit      — items per page, default 8, max 50
//   search     — partial name match (case-insensitive)
//   category   — exact category match (case-insensitive)
//   minPrice   — minimum price
//   maxPrice   — maximum price
//   sortBy     — field to sort by: price | rating | name | createdAt (default)
//   order      — asc | desc (default desc)
// ════════════════════════════════════════════════════════════════════════════
async function getAllProducts(req, res) {
  try {
    // ── 1. Parse and sanitise query params ───────────────────────────────────
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(50, Math.max(1, parseInt(req.query.limit) || PAGE_SIZE));
    const search   = (req.query.search   || '').trim();
    const category = (req.query.category || '').trim();
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    // Whitelist sortable fields to prevent injection
    const allowedSortFields = ['price', 'rating', 'name', 'createdAt'];
    const sortBy  = allowedSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
    const order   = req.query.order === 'asc' ? 1 : -1;

    // ── 2. Build filter object ───────────────────────────────────────────────
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      filter.price = {};
      if (!isNaN(minPrice)) filter.price.$gte = minPrice;
      if (!isNaN(maxPrice)) filter.price.$lte = maxPrice;
    }

    // ── 3. Count + fetch ─────────────────────────────────────────────────────
    const total    = await Product.countDocuments(filter);
    const products = await Product
      .find(filter)
      .sort({ [sortBy]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // .lean() returns plain JS objects — faster for JSON responses

    // ── 4. Build pagination metadata ─────────────────────────────────────────
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      // Pagination info at the top so clients don't have to count
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      data: products,
    });

  } catch (err) {
    console.error('getAllProducts API error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GET /api/v1/products/:id
// Returns a single product by its MongoDB _id.
// ════════════════════════════════════════════════════════════════════════════
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `No product found with id: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });

  } catch (err) {
    // Mongoose throws a CastError when the id format is invalid
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id format.',
      });
    }

    console.error('getProductById API error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { getAllProducts, getProductById };
