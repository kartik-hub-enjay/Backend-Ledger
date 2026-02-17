const express = require("express");
const router = express.Router();
const {registerUserController,loginUserController} = require("../controller/authController");

router.post("/register",registerUserController);
router.post("/login",loginUserController);


module.exports = router;