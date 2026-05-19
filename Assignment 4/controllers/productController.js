// controllers/productController.js
// Handles all logic for the /products page.
// Keeps routes thin — routes just call these functions.

const Product = require('../models/Product');

// How many products to show per page
const PAGE_SIZE = 8;

// ── GET /products ────────────────────────────────────────────────────────────
async function getProducts(req, res) {
  try {
    // ── 1. Read query parameters (all are optional) ──────────────────────────
    const page     = Math.max(1, parseInt(req.query.page)     || 1);  // current page, min 1
    const search   = (req.query.search   || '').trim();               // name search string
    const category = (req.query.category || '').trim();               // category filter
    const minPrice = parseFloat(req.query.minPrice) || 0;             // price range low
    const maxPrice = parseFloat(req.query.maxPrice) || Infinity;      // price range high

    // ── 2. Build a MongoDB filter object ─────────────────────────────────────
    const filter = {};

    // Case-insensitive partial name search using a regex
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    // Exact category match (case-insensitive)
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Price range — only add if the user supplied at least one bound
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = minPrice;
      if (req.query.maxPrice) filter.price.$lte = maxPrice;
    }

    // ── 3. Count total matching documents (needed for pagination maths) ───────
    const totalProducts = await Product.countDocuments(filter);
    const totalPages    = Math.ceil(totalProducts / PAGE_SIZE);

    // Clamp page so we never go past the last page
    const safePage = Math.min(page, totalPages || 1);

    // ── 4. Fetch the slice of products for this page ──────────────────────────
    const products = await Product
      .find(filter)
      .sort({ createdAt: -1 })          // newest first
      .skip((safePage - 1) * PAGE_SIZE) // skip previous pages
      .limit(PAGE_SIZE);                // take only PAGE_SIZE items

    // ── 5. Fetch all distinct categories for the filter dropdown ─────────────
    const categories = await Product.distinct('category');

    // ── 6. Build a helper array of page numbers for the pagination UI ─────────
    // e.g. [1, 2, 3, 4, 5]
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    // ── 7. Render the view, passing everything the template needs ─────────────
    res.render('products', {
      title:        'Products — Engine',
      products,
      categories,
      // pagination
      currentPage:  safePage,
      totalPages,
      totalProducts,
      pageNumbers,
      // preserve active filters so the template can keep form values filled in
      filters: {
        search,
        category,
        minPrice: req.query.minPrice || '',
        maxPrice: req.query.maxPrice || '',
      },
    });

  } catch (err) {
    console.error('Error in getProducts:', err);
    res.status(500).send('Something went wrong. Please try again later.');
  }
}

module.exports = { getProducts };
