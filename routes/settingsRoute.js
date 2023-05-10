var express = require("express");
var setting = express.Router();
const {
  updateProfileName,
  updateProfilePics,
  updateProfileMobileNumber,
  changePassword,
  updateNotificationStatus,
} = require("../controllers/settingsController");
const { createTemplate, getTemplate } = require("../services/ses.service");

const appTokenMiddleware = require("../middlewares/appTokenValidation");

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api

setting.post("/update/profile/name", appTokenMiddleware, updateProfileName);
setting.post(
  "/update/profile/number",
  appTokenMiddleware,
  updateProfileMobileNumber
);
setting.post("/update/profile/pics", appTokenMiddleware, updateProfilePics);
setting.post("/change/password", appTokenMiddleware, changePassword);
setting.get("/create/template", appTokenMiddleware, createTemplate);
setting.get("/get/template", appTokenMiddleware, getTemplate);
setting.post(
  "/update/notification",
  appTokenMiddleware,
  updateNotificationStatus
);

module.exports = setting;
