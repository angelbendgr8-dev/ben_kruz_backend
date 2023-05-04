const HttpException = require("../helpers/HttpException");
const userNotificationsModel = require("../models/userNotifications");
const userModel = require("../models/user");
const preferenceModel = require("../models/preference.model");

class NotificationsService {
  //  preference = preferenceModel;
  userNotification = userNotificationsModel;

  async createNotification(data) {
    const notifications = await this.userNotification.create({
      userId: data?.userId,
      triggerId: data.triggerId,
      title: data.title,
      content: data.content,
      type: data.type,
    });
    return notifications ? true : false;
  }

  async notificationsSettings(user, data) {
    const notiSettings = data;
    if (!notiSettings)
      throw new HttpException(400, "Preferenc update data required");
    // const user = req.user;
    let pref = await preferenceModel.findOne({ user: user._id });
    if (!pref) pref = await preferenceModel.create({ user: user._id });
    const preference = await preferenceModel.findOneAndUpdate(
      { user: user._id },
      {
        ...notiSettings,
      },
      {
        new: true,
      }
    );

    return preference;
  }

  async getPreference(user) {
    console.log(user);
    let pref = await preferenceModel
      .findOne({ user: user._id })
      .select("-_id -__v");
    if (!pref) pref = await preferenceModel.create({ user: user._id });
    return pref;
  }

  async getNotifications(user) {
    // const page = +req.query.page;
    // const limit = +req.query.limit;

    // console.log(user);
    const notifications = await userNotificationsModel
      .find({ userId: user })
      .populate({
        path: "triggerId",
        model: userModel,
        select: "username profilePics name ",
      })
      .sort({ createdAt: -1 });
    // console.log(notifications);
    if (!notifications)
      throw new HttpException(409, `You have no notifications`);
    // const { data, totalContent, totalPages, unreadCount } =
    //   await functionPaginateNotification(
    //     page,
    //     limit,
    //     notifications,
    //     this.userNotification,
    //     user
    //   );
    return {
      notifications,
      // totalContent,
      // totalPages,
      // unread: unreadCount,
    };
  }

  async getGeneralNotifications() {
    const notifications = await this.userNotification.find({ type: "general" });
    return notifications;
  }

  async readNotification(userId, id) {
    const notification = await this.userNotification
      .findOne({
        _id: id,
        userId: userId,
      })
      .populate({
        path: "triggerId",
        model: userModel,
        select: "username profilePics name ",
      });
    notification.status = "read";
    notification.save();
    return notification;
  }
  async clearNotifications(userId) {
    console.log("here");
    await this.userNotification.deleteMany({
      userId: userId,
    });
    return;
  }
}

module.exports = new NotificationsService();
