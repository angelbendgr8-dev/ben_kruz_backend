const mongoose = require("mongoose");
const { model, Schema, Types } = require("mongoose");

const replyCommentSchema = new Schema(
  {
    reply: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    commentId: {
      type: Types.ObjectId,
      ref: 'videoComments',
      required: true,
    },
    likes: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    dislikes: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    likeCount: {
      type: Number,
      required: true,
    },
    dislikeCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("replyModel", replyCommentSchema);
