const express = require("express");
const multer = require("multer");
const path = require("path");
const profileRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const {validateProfileEditData} = require("../utils/validation.js");

  const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "profileImages");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profileImages");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, and WEBP files allowed"), false);
};

const upload = multer({ storage, fileFilter });





// Get profile API (without password)
profileRouter.get("/view", userAuth, async (req, res) => {
  try {
    const user = await req.user;

    const userProfile = await User.findById(user._id).select("-password");
    if (!userProfile) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(userProfile);
  } catch (err) {
    res.status(400).send("Error fetching profile: " + err.message);
  }
});



profileRouter.patch("/edit", userAuth, upload.single("photo"), async (req, res) => {
  try {
    const updates = req.body || {};

    // ✅ Add image URL if uploaded
    if (req.file) {
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/profileImages/${req.file.filename}`;
      updates.photoUrl = imageUrl;
    }

    // ✅ Validate fields
    const { error } = validateProfileEditData(updates);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // ✅ Safely update only allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Edit Profile Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});





module.exports = profileRouter;