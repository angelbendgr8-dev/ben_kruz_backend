const mongoose = require("mongoose");

const languageSchema = new mongoose.Schema({
  name: { type: String, default: null },
  status:{type:Boolean, default:true},
  created:{type:Date,default:Date.now()}
});

module.exports = mongoose.model("language", languageSchema);