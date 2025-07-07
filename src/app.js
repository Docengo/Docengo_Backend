const express = require("express");
const connectDB = require("./config/database")
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://www.docengo.com",
  "https://docengo.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


app.use(cookieParser());
app.use(express.json());


const authRouter = require("./routes/authRouter.js");
app.use("/", authRouter);
 
const doubtRouter = require("./routes/doubtRouter.js");
app.use("/doubt", doubtRouter);

const helpRouter = require("./routes/helpRouter.js");
app.use("/help", helpRouter);

const profileRouter = require("./routes/profileRouter.js");
app.use("/profile", profileRouter);

const authCheckRouter = require("./routes/authCheckRouter.js");
app.use("/auth", authCheckRouter);

const feedbackRouter = require("./routes/feedbackRouter.js");
app.use("/feedback", feedbackRouter);

const paymentRouter = require("./routes/paymentRouter.js");
app.use("/payment", paymentRouter);


connectDB()
        .then(() => {
            console.log("Database connection established...");
            app.listen(2707, () => {
            console.log("Server is successfully listening on port 2707");
            });
        })
        .catch((err) => {
            console.error("Database cannot be connected");
        });

