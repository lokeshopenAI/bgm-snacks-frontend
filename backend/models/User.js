const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true },
  password: String,
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  addresses: [{
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  }]
});

module.exports = mongoose.model('User', UserSchema);
