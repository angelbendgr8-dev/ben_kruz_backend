const mongoose = require("mongoose");
const { model, Schema, Types } = require("mongoose");

const videoCommentsSchema = new mongoose.Schema(
  {
    user: { type: Types.ObjectId, ref: "userModel" },
    comment: { type: String, default: null },
    videoId: { type: Types.ObjectId, ref: "video" },
    type: {type:String},
    likes: [{ type: Types.ObjectId, ref: "userModel" }],
    dislikes: [{ type: Types.ObjectId, ref: "userModel" }],
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    created: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("videoComments", videoCommentsSchema);
