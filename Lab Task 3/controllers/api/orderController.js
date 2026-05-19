// controllers/api/orderController.js
// Protected endpoints — all require a valid JWT (verifyToken middleware).

const Order   = require('../../models/Order');
const Product = require('../../models/Product');

// ════════════════════════════════════════════════════════════════════════════
// POST /api/v1/orders
// Create a new order for the authenticated user.
//
// Body:
// {
//   "items": [
//     { "product": "<productId>", "quantity": 2 },
//     { "product": "<productId>", "quantity": 1 }
//   ],
//   "shippingAddress": {          ← optional
//     "street": "Plot 14",
//     "city": "Islamabad",
//     "country": "Pakistan"
//   }
// }
// ════════════════════════════════════════════════════════════════════════════
async function createOrder(req, res) {
  try {
    const { items, shippingAddress } = req.body;

    // ── 1. Validate request body ─────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items must be a non-empty array.',
      });
    }

    // Each item must have a product id and a positive quantity
    for (const item of items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: 'Each item must include a product id.',
        });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a quantity of at least 1.',
        });
      }
    }

    // ── 2. Fetch all products in one query ───────────────────────────────────
    const productIds = items.map((i) => i.product);
    const products   = await Product.find({ _id: { $in: productIds } });

    // Build a quick lookup map: id → product document
    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });

    // ── 3. Validate stock and build line items ───────────────────────────────
    const orderItems  = [];
    let   totalAmount = 0;

    for (const item of items) {
      const product = productMap[item.product.toString()];

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      orderItems.push({
        product:         product._id,
        quantity:        item.quantity,
        priceAtPurchase: product.price,  // snapshot the price right now
      });

      totalAmount += product.price * item.quantity;
    }

    // ── 4. Deduct stock for each product ─────────────────────────────────────
    // Using Promise.all so all updates run in parallel
    await Promise.all(
      orderItems.map((item) =>
        Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        })
      )
    );

    // ── 5. Create the order document ─────────────────────────────────────────
    const order = await Order.create({
      user:            req.user._id,   // set by verifyToken middleware
      items:           orderItems,
      totalAmount,
      shippingAddress: shippingAddress || {},
    });

    // Populate product names for a richer response
    await order.populate('items.product', 'name price image');

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data:    order,
    });

  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product id format.',
      });
    }

    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GET /api/v1/orders
// Returns all orders belonging to the authenticated user.
// Admins see all orders.
// ════════════════════════════════════════════════════════════════════════════
async function getMyOrders(req, res) {
  try {
    // Admins can see every order; regular users only see their own
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    const orders = await Order
      .find(filter)
      .populate('items.product', 'name price image category')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count:   orders.length,
      data:    orders,
    });

  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = { createOrder, getMyOrders };
