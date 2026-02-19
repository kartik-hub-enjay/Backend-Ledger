const express = require("express");
const authRouter = require("./routes/authRoute")
const accountRouter = require("./routes/accountRoutes");
const cookieParser = require("cookie-parser")


const app = express();
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Server is running!", status: "success" });
});

app.use("/api/auth",authRouter);
app.use("api/accounts",accountRouter);

module.exports = app;