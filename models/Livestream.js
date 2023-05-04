const mongoose = require("mongoose");

const streamSchema = new mongoose.Schema({
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
  },
  streamkey: { type: String },
  playbackId: { type: String },
  comments: { type: Array, default: [] },
  type: { type: String, enum: ["free", "premium"], default: "free" },
  price:{type: Number},
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }],
  views: [{ type: mongoose.Schema.Types.ObjectId, ref: "userModel" }],
  live: { type: Boolean, default: true },
  created: { type: Date, default: Date.now() },
});

module.exports = mongoose.model("streams", streamSchema);
