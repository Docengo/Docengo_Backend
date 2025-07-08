const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();


const userSchema = new mongoose.Schema({
   fullName: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is not valid");
      }
    },
  },
  stream: {
    type: String,
    required: function () {
      return this.emailId !== process.env.ADMIN_EMAIL;
    },
    enum: ["JEE", "NEET", "Other"],
    default: "Other",
  },
  className:{
    type: String,
    required: function () {
      return this.emailId !== process.env.ADMIN_EMAIL;
    },
    enum: ["IX", "X", "XI", "XII", "Dropper"],
  },
  city: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  mobileNumber: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isMobilePhone(value, 'any')) {
        throw new Error("Mobile number is not valid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    validate(value) {
      if (!validator.isStrongPassword(value)) {
        throw new Error("Enter a strong passwordddddd");
      }
    },
  },
 photoUrl: {
  type: String,
  default:
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
  validate(value) {
    const isUrl = validator.isURL(value, {
      require_protocol: true,
      protocols: ["http", "https"],
      allow_underscores: true,
    });

    const isLocalUpload = value.startsWith("http://localhost") || value.startsWith("https://yourdomain.com");

    if (!isUrl && !isLocalUpload) {
      throw new Error("photoUrl is not a valid URL");
    }
  },
},

}, {
  timestamps: true,
});



// JWT generation
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
  expiresIn: "7d",
});

  return token;
};

// Password check
userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const isPasswordValid = await bcrypt.compare(passwordInputByUser, user.password);
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
