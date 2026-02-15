const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required to create an user"],
        unique:[true,,"User already exists"],
        trim:true,
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$ / , "Please enter a vlid email adress"],
    },
    name:{
        type:String,
        required:[true,"Please enter name"]
    },
    password:{
        type:String,
        required:[true,"Password is required to create a user"],
        minlength:[6,"Password should contain atleast 6 character"],
        select : false
    }
},{timestamps:true});

userSchema.pre("save",async function(next){

    if(!this.isModified(password)){
        return next()
    }

    const hash = await bcrypt.hash(this.password,10);
    this.password = hash;
    return next();
}); // this means whenever saving a user in user model , before saving the user details run the funtion which is asyncronus which will hash the password asyncronulsy while the other details will be saving and after hashing completed the hashed password willl be saved 

userSchema.methods.comparePassword = async function (password){
    return await bcrypt.compare(password,this.password)
} // this will add a method to usermodel , to compare the password 

const usermodel = mongoose.model("user",userSchema)

module.exports = usermodel;

