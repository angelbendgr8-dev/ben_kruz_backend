
const { model, Schema, Document, Types } = require('mongoose');

const userNotificationSchema = new Schema(
  {
    expireAt: {
      type: Date,
      default: Date.now(),
      expires: 345600, // 4 days
    },
    userId: {
      type: String,
    },
    triggerId: {
      type: Types.ObjectId,
      ref: 'userModel',
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['regular', 'general', 'Deposit', 'Subscription', 'Debit', 'Credit', 'Action','Upload'],
      default: 'general',
      required: true,
    },
    status: {
      type: String,
      default: 'unread',
    },

    link: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

const userNotificationsModel = model('UserNotifications', userNotificationSchema);

module.exports = userNotificationsModel;
