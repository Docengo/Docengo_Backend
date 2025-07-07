const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
  host: "smtpout.secureserver.net", // ✅ correct GoDaddy SMTP host
  port: 465, // ✅ secure SSL port
  secure: true, // true for 465, false for 587
  auth: {
    user: "info@docengo.com", // your email
    pass: process.env.GODADDY_EMAIL_PASSWORD, // email password or app password
  },
});


async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: '"Docengo" <info@docengo.com>',
    to: toEmail,
    subject: 'Your OTP for Docengo Signup',
    html: `
      <p>Hi there 👋,</p>
      <p>Your OTP for signup is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 5 minutes. Please do not share it with anyone.</p>
      <br/>
      <p>Regards,<br/>Team Docengo</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendOtpEmail;
