var express = require("express");
const {
  getNotifications,
  getGeneralNotifications,
  readNotification,
  notificationsSettingsUpdate,
  getPreference,
} = require("../controllers/notifications");
const authMiddleware = require("../middlewares/auth.middleware");

const appTokenMiddleware = require("../middlewares/appTokenValidation");
const { validate } = require("../validations/validate");
var notificationRouter = express.Router();

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api

notificationRouter.get("/",  appTokenMiddleware, getNotifications);
notificationRouter.get("/settings", appTokenMiddleware, authMiddleware, getPreference);
notificationRouter.post("/update/settings", appTokenMiddleware, authMiddleware, notificationsSettingsUpdate);
notificationRouter.post("/general", appTokenMiddleware,  getGeneralNotifications);
notificationRouter.get("/read/:id", appTokenMiddleware,  readNotification);
notificationRouter.post("/clear", appTokenMiddleware,  clearNotifications);

module.exports = notificationRouter;
