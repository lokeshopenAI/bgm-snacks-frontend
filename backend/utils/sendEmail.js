const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: EMAIL_USER,
    to,
    subject,
    html
  });
}

module.exports = sendEmail;
