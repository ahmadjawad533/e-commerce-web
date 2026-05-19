// seed.js
// Run once with:  node seed.js
// Clears the products collection and inserts 25 sample products.

const mongoose = require('mongoose');
const Product  = require('./models/Product');

// ── Change this URI if your MongoDB is hosted elsewhere ──────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/engine-fashion';

const sampleProducts = [
  // ── Men ──────────────────────────────────────────────────────────────────
  {
    name: 'Classic Crew Neck Tee',
    price: 1490,
    category: 'Men',
    rating: 4.3,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop',
  },
  {
    name: 'Slim Fit Chino Trousers',
    price: 2990,
    category: 'Men',
    rating: 4.5,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&auto=format&fit=crop',
  },
  {
    name: 'Casual Polo Shirt',
    price: 1890,
    category: 'Men',
    rating: 4.1,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop',
  },
  {
    name: 'Straight Fit Denim Jeans',
    price: 3290,
    category: 'Men',
    rating: 4.6,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop',
  },
  {
    name: 'Oxford Button-Down Shirt',
    price: 2490,
    category: 'Men',
    rating: 4.4,
    stock: 70,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop',
  },
  {
    name: 'Zip-Up Hoodie',
    price: 3990,
    category: 'Men',
    rating: 4.7,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&auto=format&fit=crop',
  },
  {
    name: 'Linen Kurta',
    price: 2190,
    category: 'Men',
    rating: 4.2,
    stock: 110,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&auto=format&fit=crop',
  },
  {
    name: 'Cargo Shorts',
    price: 1790,
    category: 'Men',
    rating: 3.9,
    stock: 88,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=500&auto=format&fit=crop',
  },

  // ── Women ─────────────────────────────────────────────────────────────────
  {
    name: 'Floral Wrap Dress',
    price: 3490,
    category: 'Women',
    rating: 4.8,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&auto=format&fit=crop',
  },
  {
    name: 'Linen Co-ord Set',
    price: 4990,
    category: 'Women',
    rating: 4.6,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&auto=format&fit=crop',
  },
  {
    name: 'Embroidered Lawn Suit',
    price: 5490,
    category: 'Women',
    rating: 4.9,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop',
  },
  {
    name: 'High-Waist Trousers',
    price: 2790,
    category: 'Women',
    rating: 4.3,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=500&auto=format&fit=crop',
  },
  {
    name: 'Striped Midi Skirt',
    price: 2290,
    category: 'Women',
    rating: 4.1,
    stock: 72,
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&auto=format&fit=crop',
  },
  {
    name: 'Oversized Knit Sweater',
    price: 3790,
    category: 'Women',
    rating: 4.5,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop',
  },
  {
    name: 'Satin Blouse',
    price: 2590,
    category: 'Women',
    rating: 4.4,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=500&auto=format&fit=crop',
  },
  {
    name: 'Denim Jacket',
    price: 4490,
    category: 'Women',
    rating: 4.7,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&auto=format&fit=crop',
  },

  // ── Kids ──────────────────────────────────────────────────────────────────
  {
    name: 'Graphic Print T-Shirt',
    price: 990,
    category: 'Kids',
    rating: 4.2,
    stock: 150,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&auto=format&fit=crop',
  },
  {
    name: 'Jogger Pants',
    price: 1290,
    category: 'Kids',
    rating: 4.0,
    stock: 130,
    image: 'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=500&auto=format&fit=crop',
  },
  {
    name: 'Hooded Sweatshirt',
    price: 1890,
    category: 'Kids',
    rating: 4.5,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500&auto=format&fit=crop',
  },
  {
    name: 'Floral Frock',
    price: 1490,
    category: 'Kids',
    rating: 4.6,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop',
  },
  {
    name: 'Denim Dungaree',
    price: 1990,
    category: 'Kids',
    rating: 4.3,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=500&auto=format&fit=crop',
  },

  // ── Accessories ───────────────────────────────────────────────────────────
  {
    name: 'Leather Belt',
    price: 1190,
    category: 'Accessories',
    rating: 4.1,
    stock: 200,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop',
  },
  {
    name: 'Canvas Tote Bag',
    price: 890,
    category: 'Accessories',
    rating: 4.0,
    stock: 180,
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop',
  },
  {
    name: 'Wool Scarf',
    price: 1390,
    category: 'Accessories',
    rating: 4.4,
    stock: 95,
    image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=500&auto=format&fit=crop',
  },
  {
    name: 'Snapback Cap',
    price: 990,
    category: 'Accessories',
    rating: 3.8,
    stock: 160,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB:', MONGO_URI);

    // Wipe existing products so we start fresh every run
    await Product.deleteMany({});
    console.log('🗑   Cleared existing products');

    // Insert all sample products at once
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`🌱  Seeded ${inserted.length} products successfully`);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB');
  }
}

seed();
