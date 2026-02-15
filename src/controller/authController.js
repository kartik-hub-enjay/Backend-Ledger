const userModel = require("../models/userModel");

/** 
* - POST /api/auth/register
* - for registartion of user
*/

async function registerUserController(req,res){
    const {email , name , password} = req.body;

    const isExists = userModel.findOne({email : email});

    if(isExists){
        res.status(422).json({message : "User already exists with this email.", status:"failed"});
    }

    const user = await userModel.create({email , password , name });
}

module.exports = {
    registerUserController,
}