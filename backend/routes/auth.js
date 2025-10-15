const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
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

// Helper to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Signup API
router.post('/signup', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email already registered' });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ error: 'Phone already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60000; // OTP valid for 10 mins

    const newUser = new User({ name, email, phone, password: hashedPassword, otp, otpExpires });
    await newUser.save();

    // Send OTP by email (can be adapted for SMS)
    await sendEmail(email, 'Your OTP for BGM SNACKs Signup', `<h2>Your OTP is ${otp}</h2>`);

    res.json({ message: 'OTP sent to your email for verification.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// OTP Verification API
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.json({ message: 'User verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login API
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: 'Invalid phone or password' });
    if (!user.isVerified) return res.status(400).json({ error: 'User not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid phone or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, addresses: user.addresses } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Example in backend/routes/auth.js
router.put('/update-profile', authenticate, async (req, res) => {
  try {
    const { name, email, phone, addresses } = req.body;
    // Optional: validate email/phone uniqueness except current user
    const user = await User.findById(req.user._id);

    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ error: 'Email already in use' });
    }
    if (phone !== user.phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) return res.status(400).json({ error: 'Phone already in use' });
    }

    user.name = name;
    user.email = email;
    user.phone = phone;
    user.addresses = addresses || [];

    await user.save();
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
