const { Types, Schema, model } = require("mongoose");

const videoSchema = new Schema(
  {
    uploader: {
      type: Types.ObjectId,
      ref: "userModel",
    },
    user: {
      type: Object,
    },
    video: { type: String, default: null },
    type: { type: String },
    public_id: { type: String },
    languages: { type: Types.ObjectId, ref: "language" },
    categories: [{ type: Types.ObjectId, ref: "category" }],
    description: { type: String },
    thumbnail: { type: String },
    commentable: { type: Boolean, default: true },
    likable: { type: Boolean, default: true },
    showLike: { type: Boolean, default: true },
    country: { type: String },
    views: { type: Number },
    duration: { type: Number },
    height: { type: Number },
    width: { type: Number },
    comments: { type: Array, default: [] },
    likes: [{ type: Types.ObjectId, ref: "userModel" }],
    dislikes: [{ type: Types.ObjectId, ref: "userModel" }],
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    created: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

module.exports = model("video", videoSchema);
