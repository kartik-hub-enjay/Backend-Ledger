const {authMiddleware,authSystemUserMiddleware} = require("../middlewares/authMiddleware")
const {createTransaction,createInitialFundsTransaction} = require("../controller/transactionController")
const express = require("express")
const router = express.Router();

router.post("/",authMiddleware,createTransaction)
/**
 * - POST /api/transactions/system/inital-funds
 * - Create initial funds transation from system user
 */
router.post("/system/initial-funds",authSystemUserMiddleware,createInitialFundsTransaction)
module.exports =router

// 6996baa4abab2b08df59f553
// 2c2d76f0-b060-4400-bc0b-fc9cb90d0558