const express = require('express');
const router  = express.Router();

// Product data — easy to swap for a DB later
const products = [
  {
    id: 1,
    name: 'Classic Crew Neck Tee',
    price: 'PKR 1,490',
    originalPrice: 'PKR 1,990',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop',
    alt: 'Classic White Crew Neck T-Shirt',
  },
  {
    id: 2,
    name: 'Slim Fit Chino Trousers',
    price: 'PKR 2,990',
    originalPrice: 'PKR 3,990',
    badge: 'Sale',
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop',
    alt: 'Slim Fit Chino Trousers',
  },
  {
    id: 3,
    name: 'Floral Wrap Dress',
    price: 'PKR 3,490',
    originalPrice: null,
    badge: null,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop',
    alt: "Women's Floral Wrap Dress",
  },
  {
    id: 4,
    name: 'Casual Polo Shirt',
    price: 'PKR 1,890',
    originalPrice: 'PKR 2,490',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop',
    alt: "Men's Casual Polo Shirt",
  },
  {
    id: 5,
    name: 'Linen Co-ord Set',
    price: 'PKR 4,990',
    originalPrice: 'PKR 5,990',
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop',
    alt: "Women's Linen Co-ord Set",
  },
  {
    id: 6,
    name: 'Straight Fit Denim Jeans',
    price: 'PKR 3,290',
    originalPrice: 'PKR 4,200',
    badge: null,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop',
    alt: "Men's Denim Jeans",
  },
];

const categories = [
  {
    name: 'Men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&auto=format&fit=crop',
    alt: "Men's clothing collection",
  },
  {
    name: 'Women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop',
    alt: "Women's clothing collection",
  },
  {
    name: 'Kids',
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop',
    alt: "Kids' clothing collection",
  },
];

// GET /
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Engine — Fashion for Everyone',
    products,
    categories,
  });
});

module.exports = router;
