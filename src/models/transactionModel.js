
const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associated from a account"],
        index:true
    },
    toAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        required:[true,"Transaction must be associated to a bank account"],
        index:true
    },
    status:{
        type:String,
        enum:["PENDING","COMPLETED","FAILED","REVERSED"],
        default:"PENDING"
    },
    amount:{
        type:Number,
        required:[true,"Amount is required to create a transaction"],
        min:[0,"amount cannot be negative"]
    },
    idempotanceKey:{
        type:String,
        required:[true,"Idempotancy key is required for creating a transaction"],
        index:true,
        unique:true
    }
}, {timestamps:true}
)

const transactionModel = mongoose.model("transaction",transactionSchema);
module.exports=transactionModel