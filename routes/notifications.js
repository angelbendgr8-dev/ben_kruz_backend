var express = require("express");
const {
  getNotifications,
  getGeneralNotifications,
  readNotification,
  notificationsSettingsUpdate,
  getPreference,
} = require("../controllers/notifications");
const authMiddleware = require("../middlewares/auth.middleware");
const { validate } = require("../validations/validate");
var notificationRouter = express.Router();

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api

notificationRouter.get("/", getNotifications);
notificationRouter.get("/settings",authMiddleware, getPreference);
notificationRouter.post("/update/settings",authMiddleware, notificationsSettingsUpdate);
notificationRouter.post("/general", getGeneralNotifications);
notificationRouter.get("/read/:id", readNotification);
notificationRouter.post("/clear", clearNotifications);

module.exports = notificationRouter;
