// controllers/salesController.js
// Handles sales dashboard and real-time sales data API

const Order = require('../models/Order');
const Product = require('../models/Product');

// ════════════════════════════════════════════════════════════════════════════
// GET /admin/sales
// Render the sales dashboard page with initial data
// ════════════════════════════════════════════════════════════════════════════
async function getSalesDashboard(req, res) {
  try {
    // Fetch initial sales data
    const salesData = await calculateSalesData();

    res.render('admin/sales', {
      title: 'Sales Dashboard — Engine',
      ...salesData,
    });
  } catch (err) {
    console.error('getSalesDashboard error:', err);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: err.message,
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// GET /api/v1/sales-data
// Return JSON with real-time sales statistics
// ════════════════════════════════════════════════════════════════════════════
async function getSalesData(req, res) {
  try {
    const salesData = await calculateSalesData();

    res.status(200).json({
      success: true,
      data: salesData,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('getSalesData error:', err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HELPER — Calculate all sales statistics
// Returns an object with totalRevenue, totalOrders, topProduct, recentOrders
// ════════════════════════════════════════════════════════════════════════════
async function calculateSalesData() {
  // ── 1. Calculate total revenue and total orders ────────────────────────────
  const revenueResult = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
  const totalOrders = revenueResult.length > 0 ? revenueResult[0].totalOrders : 0;

  // ── 2. Find top selling product ─────────────────────────────────────────────
  // Unwind the items array, group by product, sum quantities, sort descending
  const topProductResult = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productDetails',
      },
    },
    { $unwind: '$productDetails' },
  ]);

  let topProduct = 'N/A';
  let topProductQuantity = 0;
  let topProductId = null;

  if (topProductResult.length > 0) {
    topProduct = topProductResult[0].productDetails.name;
    topProductQuantity = topProductResult[0].totalQuantity;
    topProductId = topProductResult[0]._id;
  }

  // ── 3. Get recent orders (last 10) ──────────────────────────────────────────
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // ── 4. Calculate average order value ────────────────────────────────────────
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ── 5. Get total products sold ──────────────────────────────────────────────
  const totalProductsSoldResult = await Order.aggregate([
    { $unwind: '$items' },
    {
      $group: {
        _id: null,
        totalProductsSold: { $sum: '$items.quantity' },
      },
    },
  ]);

  const totalProductsSold =
    totalProductsSoldResult.length > 0
      ? totalProductsSoldResult[0].totalProductsSold
      : 0;

  return {
    totalRevenue: totalRevenue.toFixed(2),
    totalOrders,
    topProduct,
    topProductQuantity,
    topProductId,
    averageOrderValue: averageOrderValue.toFixed(2),
    totalProductsSold,
    recentOrders,
  };
}

module.exports = {
  getSalesDashboard,
  getSalesData,
};
