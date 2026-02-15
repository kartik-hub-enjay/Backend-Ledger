const express = require("express");
const authRouter = require("../src/routes/authRoute")


const app = express();
app.use(express.json);
app.use("/api/auth",authRouter);

module.exports = app;