
const mongoose = require("mongoose")

const connectToDB = () => {
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log("MONGO DB Connected");
    }).catch((err)=>{
        console.log("DB Connection failed: ",err.message);
        process.exit(1); // this will stop the server
    })
}


module.exports = connectToDB
