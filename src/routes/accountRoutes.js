const express = require("express");
const {authMiddleware} = require("../middlewares/authMiddleware")
const {createAccountController} = require("../controller/accountController")

const router = express.Router();

/**
 * - POST /api/accounts/
 * - Create a new account
 * - Protected route
 */

router.post("/",authMiddleware,createAccountController)

module.exports=router