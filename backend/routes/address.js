const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

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

// Get user addresses
router.get('/', authenticate, (req, res) => {
  res.json(req.user.addresses);
});

// Add new address
router.post('/', authenticate, async (req, res) => {
  const { street, city, state, zip, country } = req.body;
  req.user.addresses.push({ street, city, state, zip, country });
  await req.user.save();
  res.json(req.user.addresses);
});

module.exports = router;
