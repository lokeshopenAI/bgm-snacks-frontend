const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const sendEmail = require('../utils/sendEmail');

// Middleware to authenticate user from JWT token
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

router.post('/', authenticate, async (req, res) => {
  try {
    const { products, address, paymentMethod, totalAmount } = req.body;

    // Populate product details for each order item
    const populatedProducts = await Promise.all(products.map(async (item) => {
      const prod = await Product.findById(item.product);
      if (!prod) throw new Error('Product not found: ' + item.product);
      return {
        product: prod._id,
        name: prod.name,
        price: prod.price,
        quantity: item.quantity
      };
    }));

    const order = new Order({
      user: req.user._id,
      products: populatedProducts.map(item => ({ product: item.product, quantity: item.quantity })),
      address,
      paymentMethod,
      totalAmount
    });

    await order.save();

    // Create formatted product list string for emails
    const productListHtml = populatedProducts.map(item =>
      `<li>${item.quantity} x ${item.name} (₹${item.price} each)</li>`
    ).join('');

    // Email to user
    await sendEmail(req.user.email, 'Order Confirmation - BGM SNACKs', `
      <h2>Your Order Details</h2>
      <p>Thank you for your order! Here are your details:</p>
      <p><b>Name:</b> ${req.user.name}</p>
      <p><b>Phone:</b> ${req.user.phone}</p>
      <p><b>Email:</b> ${req.user.email}</p>
      <p><b>Address:</b> ${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}</p>
      <p><b>Products:</b></p>
      <ul>${productListHtml}</ul>
      <p><b>Total:</b> ₹${totalAmount}</p>
      <p><b>Payment Method:</b> ${paymentMethod}</p>
    `);

    // Email to company
    await sendEmail('bgmbiscuits@example.com', 'New Order Received', `
      <h2>New Order from ${req.user.name}</h2>
      <p><b>Phone:</b> ${req.user.phone}</p>
      <p><b>Email:</b> ${req.user.email}</p>
      <p><b>Address:</b> ${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}</p>
      <p><b>Products:</b></p>
      <ul>${productListHtml}</ul>
      <p><b>Total:</b> ₹${totalAmount}</p>
      <p><b>Payment Method:</b> ${paymentMethod}</p>
    `);

    res.json({ message: 'Order placed successfully', orderId: order._id });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;
