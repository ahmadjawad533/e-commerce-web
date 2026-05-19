// models/Order.js
// Represents a customer order. Each order belongs to one user
// and contains one or more product line items.

const mongoose = require('mongoose');

// ── Sub-schema for a single line item inside an order ────────────────────────
const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Product',   // lets us use .populate('items.product')
      required: true,
    },
    quantity: {
      type:     Number,
      required: true,
      min:      1,
    },
    // Store the price at time of purchase so it doesn't change if the
    // product price is updated later
    priceAtPurchase: {
      type:     Number,
      required: true,
      min:      0,
    },
  },
  { _id: false } // no separate _id for each line item
);

// ── Main order schema ─────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    items: {
      type:     [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message:   'An order must have at least one item.',
      },
    },
    totalAmount: {
      type:     Number,
      required: true,
      min:      0,
    },
    // Shipping address — all fields optional for now
    shippingAddress: {
      street:  { type: String, trim: true },
      city:    { type: String, trim: true },
      country: { type: String, trim: true, default: 'Pakistan' },
    },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
