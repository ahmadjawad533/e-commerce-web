// seedOrders.js
// Helper script to generate test orders for the sales dashboard
// Run with: node seedOrders.js

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engine-fashion';

// Order statuses to randomly assign
const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/**
 * Generate random orders for testing the sales dashboard
 */
async function seedOrders() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all products and users
    const products = await Product.find();
    const users = await User.find();

    if (products.length === 0) {
      console.log('❌ No products found. Please seed products first.');
      process.exit(1);
    }

    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      process.exit(1);
    }

    console.log(`Found ${products.length} products and ${users.length} users`);

    // Generate 20 random orders
    const ordersToCreate = [];
    const NUM_ORDERS = 20;

    for (let i = 0; i < NUM_ORDERS; i++) {
      // Pick a random user
      const randomUser = users[Math.floor(Math.random() * users.length)];

      // Pick 1-3 random products
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;

      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const priceAtPurchase = randomProduct.price;

        orderItems.push({
          product: randomProduct._id,
          quantity,
          priceAtPurchase,
        });

        totalAmount += priceAtPurchase * quantity;
      }

      // Random status
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

      // Random date within last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      ordersToCreate.push({
        user: randomUser._id,
        items: orderItems,
        totalAmount,
        status,
        shippingAddress: {
          street: '123 Main St',
          city: 'Karachi',
          country: 'Pakistan',
        },
        createdAt,
      });
    }

    // Clear existing orders (optional - comment out if you want to keep existing orders)
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing orders');

    // Insert new orders
    const createdOrders = await Order.insertMany(ordersToCreate);
    console.log(`✅ Created ${createdOrders.length} test orders`);

    // Display summary
    const totalRevenue = createdOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    console.log('\n📊 Summary:');
    console.log(`   Total Orders: ${createdOrders.length}`);
    console.log(`   Total Revenue: PKR ${totalRevenue.toLocaleString()}`);
    console.log(`   Average Order Value: PKR ${(totalRevenue / createdOrders.length).toFixed(2)}`);

    // Count by status
    const statusCounts = {};
    STATUSES.forEach(status => {
      statusCounts[status] = createdOrders.filter(o => o.status === status).length;
    });
    console.log('\n   Orders by Status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   - ${status}: ${count}`);
    });

    console.log('\n✅ Seeding complete! Visit http://localhost:3000/admin/sales to see the dashboard.');

  } catch (err) {
    console.error('❌ Seeding error:', err);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the seeder
seedOrders();
