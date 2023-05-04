const { model, Schema} = require("mongoose");


const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    
    transaction_history: {
      type: Array,
    },
    withdraw_history: {
      type: Array,
    },
    beneficiary: {
      type: new Schema({
        bank_name: {
          type: String,
          required: false,
        },
        account_number: {
          type: String,
          required: false,
        },
        account_name: {
          type: String,
          required: false,
        },
        code: {
          type: String,
          
        },
      }),
      required: false,
    },
  },
  { timestamps: true },
);


module.exports = model("walletModel", walletSchema);
