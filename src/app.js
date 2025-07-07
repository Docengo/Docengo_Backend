const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

// ✅ Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.docengo.com",
  "https://docengo.com"
];

// ✅ Safe CORS setup — never crashes the server
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("⚠️ Blocked by CORS:", origin);
      callback(null, false); // Don't throw
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// ✅ Routes
app.use("/", require("./routes/authRouter"));
app.use("/doubt", require("./routes/doubtRouter"));
app.use("/help", require("./routes/helpRouter"));
app.use("/profile", require("./routes/profileRouter"));
app.use("/auth", require("./routes/authCheckRouter"));
app.use("/feedback", require("./routes/feedbackRouter"));
app.use("/payment", require("./routes/paymentRouter"));

// ✅ Start the server only after DB connects
connectDB()
  .then(() => {
    console.log("✅ Database connection established...");
    const PORT = process.env.PORT || 2707;
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed", err);
  });
