const mongoose = require("mongoose");

const shortCommentsSchema = new mongoose.Schema({
  
  user:{
    type:Object,
  },
  comment: { type: String, default: null },
  videoId: { type: mongoose.Schema.Types.ObjectId,ref:'shorts' },
  likes:[{type:mongoose.Schema.Types.ObjectId,ref:'userModel'}],
  replies:[{type:mongoose.Schema.Types.ObjectId,ref:'shortComments'}],
  created: { type: Date, default: Date.now() }
});

module.exports = mongoose.model("shortComments", shortCommentsSchema);