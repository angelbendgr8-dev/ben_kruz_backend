const mongoose = require("mongoose");

const shortsSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel'
  },
  video: { type: String, default: null },
  public_id: { type: String },
  thumbnail:{type:String},
  comments:{type: Array, default:[]},
  likes:[],
  views:[],
  numberOfComments: {type: Number, default:0},
  status: { type: Boolean, default: true },
  created: { type: Date, default: Date.now() }
},{timestamps: true});

module.exports = mongoose.model("shorts", shortsSchema);