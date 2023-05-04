const {  model, Schema } = require('mongoose');


const preferenceSchema = new Schema(
  {
    likeMyPost: {
      type: Boolean,
      default: false,
    },
    commentOnMyVideos: {
      type: Boolean,
      default: false,
    },
    commentOnShorts: {
      type: Boolean,
      default: false,
    },
    newFollower: {
      type: Boolean,
      default: false,
    },
    receivePayment: {
      type: Boolean,
      default: false,
    },
    contentUploads: {
      type: Boolean,
      default: false,
    },
    favoriteContents: {
      type: Boolean,
      default: false,
    },
    favoriteStories: {
      type: Boolean,
      default: false,
    },
    lightOrDark: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'userModel',
    },
  },
  { timestamps: true },
);

const preferenceModel = model('Preference', preferenceSchema);

module.exports = preferenceModel;
