const mongoose = require("mongoose");
const { model, Schema, Types } = require("mongoose");

const videoViewModel = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: { type: Types.ObjectId, ref: "video" },
    info: {type: Object}
   
  },
  { timestamps: true }
);

module.exports = mongoose.model("videoViewModel", videoViewModel);
