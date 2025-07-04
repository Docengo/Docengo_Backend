const express = require("express");
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation.js")
const User = require("../models/user.js")
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth.js");
require('dotenv').config();



//SIGNUP API
authRouter.post("/signup", async (req, res) => {

    try{

      const adminEmail = process.env.ADMIN_EMAIL;

    //Encrypt the password
    const {fullName, emailId, password, stream, city, mobileNumber, className} = req.body;

    const isAdmin = emailId === adminEmail;

    //Validate the data
     // Conditionally validate only if not admin
    if (!isAdmin) {
      validateSignUpData(req); // this should check for stream, className, etc.
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        fullName, emailId, stream: isAdmin ? undefined : stream,
         city, mobileNumber, className: isAdmin ? undefined : className, password : passwordHash
    });

        const savedUser = await user.save();

             //Create a JWT token
             const token = await savedUser.getJWT();

             //Add the token to the cookie and send the response back to the user
             res.cookie("token", token, 
                    {expires : new Date(Date.now() + 8 * 3600000)});

        res.json({message : "User added successfully", data: savedUser});
    }
    catch (err){
        res.status(400).send("Error saving the user: " + err.message);
    }
})

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
    res.cookie("token", null, {expires : new Date(Date.now())});
    res.send("Logout successful!!");
})


module.exports = authRouter;