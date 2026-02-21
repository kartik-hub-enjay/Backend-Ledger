const {authMiddleware} = require("../middlewares/authMiddleware")
const {createTransaction} = require("../controller/transactionController")
const express = require("express")
const router = express.Router();

router.post("/",authMiddleware,createTransaction)

module.exports =router