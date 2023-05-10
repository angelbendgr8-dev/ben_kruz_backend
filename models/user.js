const mongoose = require("mongoose");

const userModelSchema = new mongoose.Schema(
  {
    name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    username: { type: String, unique: true },
    mobileNumber: { type: String },
    profilePics: { type: String },
    token: { type: String },
    info: { type: String },
    dateOfBirth: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Active"],
      default: "Pending",
    },
    authType: {
      type: String,
      enum: ["social", "normal"],
      default: "normal",
    },
    otpCode: {
      type: String,
    },
    confirmationCode: {
      type: String,
    },
    email_verified: { type: Boolean, default: false },
    otp_verified: { type: Boolean, default: false },
    notification: { type: Boolean, default: false },
    appTokens: { type: String },
    subscribers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    subscribeTime: {
      type: [
        {
          expiresIn: String,
          id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      default: [],
    },
    subscribersCount: {
      type: Number,
      default: 0,
    },
    preferences: [{ type: mongoose.Schema.Types.ObjectId, ref: "category" }],
    languages: [{ type: mongoose.Schema.Types.ObjectId, ref: "language" }],
    locationInfo: { type: Object },
    currentSubscription: { type: Object },
    subscriptions: { type: Array },
    getMarketAd: { type: Boolean, default: false },
    beneficiaries: {
      type: [Object],
      default: [],
    },
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "video" }],
    watchLater: [{ type: mongoose.Schema.Types.ObjectId, ref: "video" }],
    history: [
      {
        type: {
          video: { type: mongoose.Schema.Types.ObjectId, ref: "video" },
          previousTime: Number,
        },
      },
    ],
    following: [
      {
        type: {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
          time: Date,
        },
      },
    ],
    follower: [
      {
        type: {
          id: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
          time: Date,
        },
      },
    ],
    fcmToken: { type: String, default: null },
    created: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

module.exports = mongoose.model("userModel", userModelSchema);
