const express = require("express");
const connectDB = require("./config/database")
const app = express();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173", // your frontend origin
    credentials: true,
  })
);

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

