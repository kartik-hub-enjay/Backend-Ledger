const express = require("express");
const authRouter = require("./routes/authRoute")
const accountRouter = require("./routes/accountRoutes");
const transactionRouter = require("./routes/transactionRoutes")
const cookieParser = require("cookie-parser")


const app = express();
app.use(express.json());
app.use(cookieParser());

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Server is running!", status: "success" });
});

app.use("/api/auth",authRouter);
app.use("/api/accounts",accountRouter);
app.use("/api/transactions",transactionRouter)

module.exports = app;