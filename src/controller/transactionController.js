const accountModel = require("../models/accountModel");
const transactionModel = require("../models/transactionModel")
const ledgerModel = require("../models/ledgerModel")
const {emailService} = require("../services/emailService")
const mongoose = require("mongoose")
/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. check account status
 * 4. Derive sender balance for ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction COMPLETED
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req,res){

    /**
     * 1. Validating request
     */

    const {fromAccount , toAccount , amount , idempotencyKey} = req.body
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"fromAccount , toAccount , amount , idempotencyKey are required to initiate a transaction"
        })
    }
    const fromUserAccount = await accountModel.findOne({
        _id:fromAccount
    })
    const toUserAccount = await accountModel.findOne({
        _id:toAccount
    })
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({message:"Invalid fromAccount or toAccount"})
    }

    /**
     * 2. Validating idempotencyKey
     */

    const istransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey
    })
    if(istransactionAlreadyExists){
        if(istransactionAlreadyExists.status == "COMPLETED"){
            return res.status(200).json({message:"transaction successfully completed"})
        }
        if(istransactionAlreadyExists.status == "PENDING"){
            return res.status(200).json({message:"Transaction is still processing"})
        }
        if(istransactionAlreadyExists.status == "FAILED"){
            return res.status(500).json({message:"Transaction is FAILED , please retry"})
        }
        if(istransactionAlreadyExists.status == "REVERSED"){
            return res.status(200).json({message:"Transaction is been reversed , try again"})
        }

    }

    /**
     * 3. Checking account status
     */

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({message:"from and to account status should be ACTIVE"})
    }

    /**
     * 4. Deriving senders balance from ledger
     */

    const balance = await fromUserAccount.getBalance()
    if(balance < amount){
        return res.status(400).json({
            message:`Insufficient balance,Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    /**
     * 5. Creating Transaction (PENDING)
     */

    const session = await mongoose.startSession()
    
    try {
        session.startTransaction()

        const transaction = await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        }],{session})

        /**
         * 6. Creating DEBIT Ledger entry
         */

        const debitLedgerEntry = await ledgerModel.create([{
            account:fromAccount,
            amount:amount,
            transaction:transaction[0]._id,
            type:"DEBIT"
        }],{session})

         /**
         * 7. Creating CREDIT Ledger entry
         */

        const creditLedgerEntry = await ledgerModel.create([{
            account:toAccount,
            amount:amount,
            transaction:transaction[0]._id,
            type:"CREDIT"
        }],{session})

         /**
         * 8. Mark transaction COMPLETED
         */

         transaction[0].status = "COMPLETED"
         await transaction[0].save({session})

         /**
          * 9. Commit MongoDB session
          */

         await session.commitTransaction()
         session.endSession()

         /**
          * 10. Send email notification
          */
         try {
             await emailService.sendTransactionEmail(req.user.email,req.user.name,amount,toAccount)
         } catch(emailError) {
             console.error('Failed to send transaction email:', emailError)
             // Don't fail the transaction for email errors
         }
         
         return res.status(201).json({
            message:"Transaction completed successfully",
            transaction:transaction[0]
         })

    } catch(error) {
        // Rollback transaction on error
        await session.abortTransaction()
        session.endSession()
        
        console.error('Transaction failed:', error)
        
        // Check if it's a duplicate key error (idempotency key already exists)
        if(error.code === 11000) {
            return res.status(409).json({
                message: "Transaction with this idempotency key already exists",
                status: "failed"
            })
        }
        
        // Check if it's a write conflict (retry-able error)
        if(error.code === 112 || error.errorLabels?.includes('TransientTransactionError')) {
            return res.status(503).json({
                message: "Transaction conflict occurred. Please retry the operation.",
                status: "failed",
                retryable: true
            })
        }
        
        return res.status(500).json({
            message: "Transaction failed due to internal error",
            status: "failed",
            error: error.message
        })
    }

}

async function createInitialFundsTransaction(req,res) {
    const {toAccount,amount,idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message:"toAccount , amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id:toAccount
    })

    if(!toUserAccount){
        return res.status(400).json({
            message:"Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        
        user:req.user._id
    })

    if(!fromUserAccount){
        return res.status(400).json({
            message:"System user account not found"
        })
    }
    const session = await mongoose.startSession()
    
    try {
        session.startTransaction()

        const transaction = await transactionModel.create([{
            fromAccount:fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status:"PENDING"
        }],{session})

        const debitLedgerEntry = await ledgerModel.create([{
            account:fromUserAccount._id,
            amount:amount,
            transaction:transaction[0]._id,
            type:"DEBIT"
        }],{session})
        
        const creditLedgerEntry = await ledgerModel.create([{
            account:toAccount,
            amount:amount,
            transaction:transaction[0]._id,
            type:"CREDIT"
        }],{session})

        transaction[0].status = "COMPLETED"
        await transaction[0].save({session})

        await session.commitTransaction()
        session.endSession()

        return res.status(201).json({
            message:"Initial funds transaction completed successfully",
            transaction:transaction[0]
        })
    } catch(error) {
        // Rollback transaction on error
        await session.abortTransaction()
        session.endSession()
        
        console.error('Initial funds transaction failed:', error)
        
        // Check if it's a duplicate key error
        if(error.code === 11000) {
            return res.status(409).json({
                message: "Transaction with this idempotency key already exists",
                status: "failed"
            })
        }
        
        // Check if it's a write conflict (retry-able error)
        if(error.code === 112 || error.errorLabels?.includes('TransientTransactionError')) {
            return res.status(503).json({
                message: "Transaction conflict occurred. Please retry the operation.",
                status: "failed",
                retryable: true
            })
        }
        
        return res.status(500).json({
            message: "Initial funds transaction failed due to internal error",
            status: "failed",
            error: error.message
        })
    }
}
module.exports = {
    createTransaction,
    createInitialFundsTransaction
}