const {authMiddleware} = require("../middlewares/authMiddleware")
const express = require("express")
const router = express.Router();

router.post("/",authMiddleware)

module.exports =router