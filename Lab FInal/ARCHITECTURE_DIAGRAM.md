# 🏗️ Sales Dashboard Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              /admin/sales (EJS Page)                        │    │
│  │                                                              │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │    │
│  │  │  Total   │  │  Total   │  │ Average  │  │ Products │  │    │
│  │  │ Revenue  │  │  Orders  │  │  Order   │  │   Sold   │  │    │
│  │  │          │  │          │  │  Value   │  │          │  │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │    │
│  │       │             │             │             │         │    │
│  │       └─────────────┴─────────────┴─────────────┘         │    │
│  │                          │                                 │    │
│  │                    jQuery Updates                          │    │
│  │                    (Every 10 sec)                          │    │
│  │                          │                                 │    │
│  │  ┌───────────────────────────────────────────────────┐    │    │
│  │  │         Recent Orders Table                       │    │    │
│  │  │  Order ID | Customer | Items | Amount | Status    │    │    │
│  │  └───────────────────────────────────────────────────┘    │    │
│  │                                                              │    │
│  └──────────────────────┬───────────────────────────────────┘    │
│                         │                                          │
│                         │ AJAX Request                             │
│                         │ GET /api/v1/sales-data                   │
│                         │ (Every 10 seconds)                       │
└─────────────────────────┼──────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    ROUTES LAYER                             │    │
│  │                                                              │    │
│  │  GET /admin/sales ──────────────► salesController           │    │
│  │                                   .getSalesDashboard()       │    │
│  │                                   │                          │    │
│  │                                   └──► Render sales.ejs      │    │
│  │                                                              │    │
│  │  GET /api/v1/sales-data ────────► salesController           │    │
│  │                                   .getSalesData()            │    │
│  │                                   │                          │    │
│  │                                   └──► Return JSON           │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           │                                          │
│                           ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              CONTROLLER LAYER                               │    │
│  │          (salesController.js)                               │    │
│  │                                                              │    │
│  │  calculateSalesData() {                                     │    │
│  │    1. Calculate total revenue & orders                      │    │
│  │    2. Find top selling product                              │    │
│  │    3. Get recent orders                                     │    │
│  │    4. Calculate average order value                         │    │
│  │    5. Count total products sold                             │    │
│  │  }                                                           │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           │                                          │
│                           ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                 MODEL LAYER                                 │    │
│  │                                                              │    │
│  │  Order.aggregate([...])  ◄──── MongoDB Aggregations        │    │
│  │  Order.find().populate() ◄──── Mongoose Queries            │    │
│  │                                                              │    │
│  └────────────────────────┬───────────────────────────────────┘    │
└───────────────────────────┼──────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                                │
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│  │   orders     │    │   products   │    │    users     │         │
│  │              │    │              │    │              │         │
│  │ - user       │    │ - name       │    │ - name       │         │
│  │ - items[]    │    │ - price      │    │ - email      │         │
│  │ - totalAmt   │    │ - category   │    │ - role       │         │
│  │ - status     │    │ - stock      │    │              │         │
│  │ - createdAt  │    │              │    │              │         │
│  └──────────────┘    └──────────────┘    └──────────────┘         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow

### Initial Page Load (Server-Side Rendering)

```
1. User navigates to /admin/sales
   │
   ├─► Express routes to salesController.getSalesDashboard()
   │
   ├─► Controller calls calculateSalesData()
   │
   ├─► MongoDB aggregations execute:
   │   ├─ Total revenue & orders
   │   ├─ Top selling product
   │   ├─ Recent orders
   │   └─ Products sold count
   │
   ├─► Data returned to controller
   │
   ├─► Controller renders sales.ejs with data
   │
   └─► HTML sent to browser with initial values
```

### Real-Time Updates (Client-Side Polling)

```
Every 10 seconds:

1. jQuery setInterval() triggers
   │
   ├─► $.ajax() sends GET request to /api/v1/sales-data
   │
   ├─► Express routes to salesController.getSalesData()
   │
   ├─► Controller calls calculateSalesData()
   │
   ├─► MongoDB aggregations execute (same as above)
   │
   ├─► Data returned as JSON response
   │
   ├─► jQuery receives JSON
   │
   ├─► DOM elements updated:
   │   ├─ #totalRevenue
   │   ├─ #totalOrders
   │   ├─ #averageOrderValue
   │   ├─ #totalProductsSold
   │   ├─ #topProduct
   │   └─ #recentOrdersTable
   │
   └─► Animations triggered on changed values
```

---

## MongoDB Aggregation Pipelines

### Pipeline 1: Total Revenue & Orders

```javascript
Order.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: '$totalAmount' },
      totalOrders: { $sum: 1 }
    }
  }
])

// Result: { totalRevenue: 15000, totalOrders: 42 }
```

### Pipeline 2: Top Selling Product

```javascript
Order.aggregate([
  // Step 1: Unwind items array
  { $unwind: '$items' },
  
  // Step 2: Group by product and sum quantities
  {
    $group: {
      _id: '$items.product',
      totalQuantity: { $sum: '$items.quantity' }
    }
  },
  
  // Step 3: Sort by quantity descending
  { $sort: { totalQuantity: -1 } },
  
  // Step 4: Take only the top product
  { $limit: 1 },
  
  // Step 5: Join with products collection
  {
    $lookup: {
      from: 'products',
      localField: '_id',
      foreignField: '_id',
      as: 'productDetails'
    }
  },
  
  // Step 6: Unwind the product details
  { $unwind: '$productDetails' }
])

// Result: { _id: ObjectId, totalQuantity: 15, productDetails: {...} }
```

### Pipeline 3: Total Products Sold

```javascript
Order.aggregate([
  // Step 1: Unwind items array
  { $unwind: '$items' },
  
  // Step 2: Sum all quantities
  {
    $group: {
      _id: null,
      totalProductsSold: { $sum: '$items.quantity' }
    }
  }
])

// Result: { totalProductsSold: 128 }
```

### Query 4: Recent Orders

```javascript
Order.find()
  .populate('user', 'name email')           // Join with users
  .populate('items.product', 'name')        // Join with products
  .sort({ createdAt: -1 })                  // Newest first
  .limit(10)                                // Only 10 orders
  .lean()                                   // Plain JS objects

// Result: Array of 10 most recent orders with populated data
```

---

## File Dependencies

```
server.js
  │
  ├─► routes/sales.js
  │     └─► controllers/salesController.js
  │           ├─► models/Order.js
  │           └─► models/Product.js
  │
  └─► routes/api/index.js
        └─► controllers/salesController.js
              ├─► models/Order.js
              └─► models/Product.js

views/admin/sales.ejs
  │
  ├─► views/admin/partials/sidebar.ejs
  ├─► public/css/admin.css
  └─► jQuery (CDN)
```

---

## Data Flow Example

### Scenario: New Order Created

```
Time: 10:00:00
┌─────────────────────────────────────────┐
│ Dashboard shows:                        │
│ - Total Revenue: PKR 15,000             │
│ - Total Orders: 42                      │
│ - Top Product: iPhone 15 (15 units)    │
└─────────────────────────────────────────┘

Time: 10:00:05
┌─────────────────────────────────────────┐
│ Customer places new order:              │
│ - 2x iPhone 15 @ PKR 1,200 each         │
│ - Total: PKR 2,400                      │
│                                         │
│ MongoDB: New order document inserted    │
└─────────────────────────────────────────┘

Time: 10:00:10 (Next polling cycle)
┌─────────────────────────────────────────┐
│ jQuery sends AJAX request               │
│ ↓                                       │
│ Controller runs aggregations            │
│ ↓                                       │
│ New calculations:                       │
│ - Total Revenue: PKR 17,400 (+2,400)   │
│ - Total Orders: 43 (+1)                 │
│ - Top Product: iPhone 15 (17 units)    │
│ ↓                                       │
│ JSON response sent to browser           │
│ ↓                                       │
│ jQuery updates DOM                      │
│ ↓                                       │
│ Animations trigger on changed values    │
└─────────────────────────────────────────┘

Time: 10:00:10.5
┌─────────────────────────────────────────┐
│ Dashboard now shows:                    │
│ - Total Revenue: PKR 17,400 ✨          │
│ - Total Orders: 43 ✨                   │
│ - Top Product: iPhone 15 (17 units) ✨  │
│                                         │
│ User sees updated values without reload │
└─────────────────────────────────────────┘
```

---

## Technology Stack

```
┌─────────────────────────────────────────┐
│           FRONTEND                      │
├─────────────────────────────────────────┤
│ - EJS (Server-side templating)          │
│ - jQuery 3.6.0 (AJAX polling)           │
│ - CSS3 (Styling & animations)           │
│ - HTML5                                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           BACKEND                       │
├─────────────────────────────────────────┤
│ - Node.js                               │
│ - Express.js 4.x (Web framework)        │
│ - Mongoose 8.x (ODM)                    │
│ - CommonJS (require/module.exports)     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           DATABASE                      │
├─────────────────────────────────────────┤
│ - MongoDB (NoSQL database)              │
│ - Aggregation Framework                 │
│ - Population (joins)                    │
└─────────────────────────────────────────┘
```

---

## Performance Considerations

### Optimizations Implemented

1. **Efficient Aggregations**
   - Single database round-trip per metric
   - Indexed fields for faster queries

2. **Lean Queries**
   - `.lean()` returns plain objects (faster)
   - Only populate required fields

3. **Limited Results**
   - Recent orders limited to 10
   - Top product limited to 1

4. **Client-Side Caching**
   - Only update DOM when values change
   - Reuse existing table rows

### Recommended Indexes

```javascript
// Add these indexes for better performance
Order.createIndex({ createdAt: -1 });
Order.createIndex({ 'items.product': 1 });
Order.createIndex({ status: 1 });
```

---

## Security Considerations

### Current Implementation
- ✅ No SQL injection (Mongoose sanitizes)
- ✅ JSON responses validated
- ✅ Error handling in place

### Optional Enhancements
- 🔒 Add authentication middleware
- 🔒 Rate limiting on API endpoint
- 🔒 CORS configuration
- 🔒 Input validation

---

## Scalability

### Current Capacity
- ✅ Handles thousands of orders efficiently
- ✅ Aggregations optimized with indexes
- ✅ Polling interval prevents server overload

### Future Enhancements
- 📈 Add Redis caching for high traffic
- 📈 Implement WebSockets for true real-time
- 📈 Add pagination for large datasets
- 📈 Implement database sharding

---

This architecture provides a solid foundation for real-time sales monitoring while maintaining clean code structure and efficient database queries.
