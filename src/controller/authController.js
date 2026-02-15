const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

/** 
* - POST /api/auth/register
* - for registartion of user
*/

async function registerUserController(req,res){
    try {
        const {email , name , password} = req.body;

        const isExists = await userModel.findOne({email : email});

        if(isExists){
            return res.status(422).json({message : "User already exists with this email.", status:"failed"});
        }

        const user = await userModel.create({email , password , name });
        const token = jwt.sign({userId : user._id} , process.env.JWT_SECRET,{expiresIn:"3d"});

        res.cookie("token",token);
        return res.status(201).json({
            message: "User registered successfully",
            status: "success",
            user:{
                _id : user._id,
                email : user.email,
                name : user.name
            },
            token
        });
    } catch(error) {
        console.error('Registration error:', error);
        return res.status(500).json({message : "Internal server error", status:"failed"});
    }
}

module.exports = {
    registerUserController,
}