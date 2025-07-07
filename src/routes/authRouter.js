const express = require("express");
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation.js")
const User = require("../models/user.js")
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth.js");
require('dotenv').config();
const sendOtpEmail = require('../utils/sendOtpEmail'); 



// ✅ Store OTPs by emailId
const otpStore = {}; // { [emailId]: { otp, expiresAt } }
const verifiedEmails = new Set();

// ✅ Send OTP via Email
authRouter.post("/send-otp", async (req, res) => {
  const { emailId } = req.body;

  if (!emailId) {
    return res.status(400).json({ error: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await sendOtpEmail(emailId, otp); // Send OTP to email
   

    otpStore[emailId] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // valid for 5 minutes
    };

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("❌ OTP email error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// ✅ Verify OTP
authRouter.post("/verify-otp", (req, res) => {
  const { emailId, otp } = req.body;

  const record = otpStore[emailId];

  if (!record) return res.status(400).json({ error: "OTP not sent" });
  if (Date.now() > record.expiresAt) return res.status(400).json({ error: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });

  verifiedEmails.add(emailId);
  delete otpStore[emailId]; // cleanup

  res.status(200).json({ message: "OTP verified" });
});

// ✅ Signup route (with email OTP verification)
authRouter.post("/signup", async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const { fullName, emailId, password, stream, city, mobileNumber, className } = req.body;

    const isAdmin = emailId === adminEmail;

    // OTP verification check (skip for admin)
    if (!isAdmin && !verifiedEmails.has(emailId)) {
      return res.status(403).json({ error: "Please verify OTP before signing up" });
    }

    if (!isAdmin) {
      validateSignUpData(req);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      emailId,
      stream: isAdmin ? undefined : stream,
      className: isAdmin ? undefined : className,
      city,
      mobileNumber,
      password: passwordHash,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });

    verifiedEmails.delete(emailId); // cleanup

    res.json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the user: " + err.message);
  }
});


// Example using Express
authRouter.get('/signup', (req, res) => {
  res.json({
    streams: ['JEE', 'NEET', 'Other'],
    classes: ['IX', 'X', 'XI', 'XII', 'Dropper']
  });
});

// GET /user – return user info and isAdmin status dynamically
authRouter.get("/user", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("fullName emailId photoUrl");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isAdmin = user.emailId === process.env.ADMIN_EMAIL;

    res.json({
      fullName: user.fullName,
      emailId: user.emailId,
      profileImage: user.photoUrl,
      isAdmin, // dynamically checked here
    });
  } catch (err) {
    res.status(500).send("Failed to fetch user");
  }
});



// Login API
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + 8 * 3600000),
      });

       // Check for admin email
      const isAdmin = emailId === process.env.ADMIN_EMAIL;

      res.send({
        message: isAdmin ? "Welcome Admin" : "Login successful",
        token, // ✅ Send token to frontend
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          emailId: user.emailId,
        },
      });
    } else {
      throw new Error("Incorrect Password");
    }
  } catch (err) {
    res.status(400).send("Error logging in: " + err.message);
  }
});

//Logout API
authRouter.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,       // Set to true in production with HTTPS
    sameSite: "lax",
    path: "/",           // ✅ MUST specify the same path as when it was set
  });
  res.status(200).send("Logout successful!!");
});


module.exports = authRouter;