const accountModel = require("../models/accountModel");
const transactionModel = require("../models/transactionModel")
const ledgerModel = require("../models/ledgerModel")

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

    const istransactionAlreadyExists = transactionModel.findOne({
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
    if(fromAccount.status !== "ACTIVE" || toAccount.status !== "ACTIVE"){
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
}