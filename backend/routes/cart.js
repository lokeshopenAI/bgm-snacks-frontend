const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/User');
const Product = require('../models/Product');

// Middleware to authenticate user by JWT token
async function authenticate(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'Invalid token' });
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get cart for user
router.get('/', authenticate, async (req, res) => {
  res.json(req.user.cart || []);
});

// Add or update cart item
router.post('/', authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(400).json({ error: 'Product not found' });

    req.user.cart = req.user.cart || [];
    const existingItem = req.user.cart.find(item => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      req.user.cart.push({ productId, quantity });
    }
    await req.user.save();

    res.json(req.user.cart);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove from cart
router.delete('/:productId', authenticate, async (req, res) => {
  const { productId } = req.params;
  req.user.cart = req.user.cart.filter(item => item.productId.toString() !== productId);
  await req.user.save();
  res.json(req.user.cart);
});

module.exports = router;
