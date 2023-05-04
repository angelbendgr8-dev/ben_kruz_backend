const { model, Schema } = require("mongoose");

const transactionHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "userModel",
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "userModel",
    },
    description:{
      type: String,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "userModel",
    },
    amount: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["CREDIT", "DEBIT", "CHARGES"],
      default: "NULL",
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("transactionHistory", transactionHistorySchema);
