const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, default: null },
  status:{type:Boolean, default:true},
  videos:[{type: mongoose.Schema.Types.ObjectId,ref:'video'}],
  created:{type:Date,default:Date.now()},
  subscribers: [{type: mongoose.Schema.Types.ObjectId,ref:'userModel'}],
});

module.exports = mongoose.model("category", categorySchema);