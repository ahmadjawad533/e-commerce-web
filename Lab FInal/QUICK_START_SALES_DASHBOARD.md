# 🚀 Quick Start Guide - Sales Dashboard

## ⚡ Get Started in 3 Steps

### Step 1: Generate Test Orders (Optional)
If you don't have orders in your database yet:

```bash
node seedOrders.js
```

This will create 20 random test orders with various statuses and dates.

### Step 2: Start Your Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

### Step 3: Access the Dashboard

Open your browser and navigate to:
```
http://localhost:3000/admin/sales
```

---

## 🎯 What You'll See

### Dashboard Metrics
- **Total Revenue** - Sum of all order amounts
- **Total Orders** - Count of all orders
- **Average Order Value** - Revenue divided by orders
- **Products Sold** - Total quantity of items sold

### Top Selling Product
- Product name with highest total quantity sold
- Link to edit the product

### Recent Transactions
- Last 10 orders with full details
- Customer name, items, amount, status, date

---

## 🔄 Real-Time Updates

The dashboard automatically refreshes every **10 seconds** without page reload.

**Visual Indicators:**
- 🔄 "Updating..." appears during refresh
- Stat cards animate when values change
- "Last updated" timestamp shows refresh time

---

## 🧪 Testing Real-Time Updates

1. Open the sales dashboard
2. Open browser DevTools → Console
3. You should see: `🔄 Real-time sales polling started (every 10 seconds)`
4. In another tab, create a new order via your API
5. Wait up to 10 seconds and watch the stats update automatically!

---

## 📡 API Endpoint

You can also access the sales data directly as JSON:

```bash
curl http://localhost:3000/api/v1/sales-data
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": "15000.00",
    "totalOrders": 42,
    "topProduct": "iPhone 15",
    "topProductQuantity": 15,
    "averageOrderValue": "357.14",
    "totalProductsSold": 128,
    "recentOrders": [...]
  },
  "timestamp": "2026-05-19T12:00:00.000Z"
}
```

---

## 🎨 Customization

### Change Update Frequency

Edit `/views/admin/sales.ejs` line ~200:
```javascript
const POLL_INTERVAL = 10000; // Change to 5000 for 5 seconds
```

### Add Authentication

Uncomment and apply the `authAdmin` middleware:

```javascript
// routes/sales.js
const authAdmin = require('../middleware/authAdmin');
router.get('/', authAdmin, getSalesDashboard);

// routes/api/index.js
router.get('/sales-data', authAdmin, getSalesData);
```

---

## 📂 File Structure

```
Engine/
├── controllers/
│   └── salesController.js          ← Sales logic & aggregations
├── routes/
│   └── sales.js                    ← Sales dashboard route
├── routes/api/
│   └── index.js                    ← Modified: added /sales-data endpoint
├── views/admin/
│   └── sales.ejs                   ← Sales dashboard template
├── views/admin/partials/
│   └── sidebar.ejs                 ← Modified: added sales link
├── middleware/
│   └── authAdmin.js                ← Optional: authentication
├── seedOrders.js                   ← Helper: generate test orders
└── server.js                       ← Modified: mounted sales routes
```

---

## ✅ Features Checklist

- [x] Real-time updates every 10 seconds
- [x] Total revenue calculation
- [x] Total orders count
- [x] Average order value
- [x] Products sold metric
- [x] Top selling product with link
- [x] Recent orders table (last 10)
- [x] Status badges (color-coded)
- [x] Loading animations
- [x] Responsive design
- [x] JSON API endpoint
- [x] Clean MVC structure
- [x] Fully commented code

---

## 🐛 Troubleshooting

**Problem:** Stats show 0 or N/A
- **Solution:** Run `node seedOrders.js` to create test data

**Problem:** Real-time updates not working
- **Solution:** Check browser console for errors, verify jQuery is loaded

**Problem:** "Cannot GET /admin/sales"
- **Solution:** Make sure server is running and routes are mounted correctly

**Problem:** MongoDB connection error
- **Solution:** Check `.env` file for correct `MONGO_URI`

---

## 📚 Full Documentation

For detailed implementation details, see:
- `SALES_DASHBOARD_IMPLEMENTATION.md` - Complete technical documentation

---

## 🎉 That's It!

Your sales dashboard is ready to use. Enjoy real-time insights into your e-commerce business!

**Questions?** Check the full documentation or review the inline code comments.
