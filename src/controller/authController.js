const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const emailService = require("../services/emailService");
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

        // Send registration email
        

        res.cookie("token",token);
        res.status(201).json({
            message: "User registered successfully",
            status: "success",
            user:{
                _id : user._id,
                email : user.email,
                name : user.name
            },
            token
        });
        try {
            await emailService.sendRegistrationEmail(user.email, user.name);
            console.log('Registration email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
            // Continue with registration even if email fails
        }
    } catch(error) {
        console.error('Registration error:', error);
        return res.status(500).json({message : "Internal server error", status:"failed"});
    }
}

/**
 * - for user login
 * - POST /api/auth/login
 */
async function loginUserController(req,res){
    const {email,password} = req.body;
    const user = await userModel.findOne({email}).select("+password");
    if(!user){
        return res.status(401).json({"message":"Email or password is incorrect"})
    }
    const isPass = await user.comparePassword(password)
    if(!isPass){
        return res.status(401).json({"message":"Email or password is incorrect"});
    }
    const token = await jwt.sign({userId : user._id},process.env.JWT_SECRET,{expiresIn:"3d"})
    res.cookie("token",token)
    res.status(200).json({
        user:{
            _id : user._id,
            email:user.email,
            name:user.name
        },token
    })
}
module.exports = {
    registerUserController,
    loginUserController
}