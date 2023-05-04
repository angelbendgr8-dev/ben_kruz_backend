const express = require("express");
const HttpException = require("../helpers/HttpException");

var jwt = require("jsonwebtoken");
const notificationsSettings = require("../services/notifications");
notificationsSettingsUpdate = async (req, res, next) => {
  try {
    const notiSettings = req.body;
    const user = req.user;
    const updatedData = await notificationsSettings.notificationsSettings(
      user,
      notiSettings
    );
    res
      .status(200)
      .json({
        status: "success",
        data: { preference: updatedData },
        message: "successfully updated your notifications",
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

getPreference = async (req, res, next) => {
  try {
    const user = req.user;
    const updatedData = await notificationsSettings.getPreference(user);
    res
      .status(200)
      .json({
        status: "success",
        data: { preference: updatedData },
        message: "user preference",
      });
  } catch (error) {
    next(error);
  }
};

getNotifications = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;
    // console.log(authToken);
    const token = authToken.split(" ")[1];
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!verified["id"] || !authToken)
      throw new HttpException(401, "Authorization failed");
    const notifications = await notificationsSettings.getNotifications(
      verified["id"]
    );
    res.status(200).json({
      status: "success",
      data: { ...notifications },
      message: "user notifications",
    });
  } catch (error) {
    next(error);
  }
};

getGeneralNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationsSettings.getGeneralNotifications();
    res.status(200).json({
      status: "success",
      data: { preference: notifications },
      message: "users notifications",
    });
  } catch (error) {
    next(error);
  }
};
clearNotifications = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;
    // console.log(authToken);
    const token = authToken.split(" ")[1];
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!verified["id"] || !authToken)
      throw new HttpException(401, "Authorization failed");
    await notificationsSettings.clearNotifications(verified["id"]);
    res.status(200).json({
      status: "success",
      data: {},
      message: "notifications cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};

readNotification = async (req, res, next) => {
  const authToken = req.headers.authorization;
  // console.log(authToken);
  const token = authToken.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!verified["id"] || !authToken)
      throw new HttpException(401, "Authorization failed");
    const notification = await notificationsSettings.readNotification(
      verified["id"],
      req.params.id
    );
    res.status(200).json({
      status: "success",
      data: notification,
      message: "notification updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getGeneralNotifications,
  readNotification,
  clearNotifications,
  getPreference,
  notificationsSettingsUpdate,
};
