const { pwdSaltRounds } = require("../helpers/constants");
const { sendResponse } = require("../helpers/functions");

const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const userInfo = require("../models/user");

const { BAD_REQUEST, OK, UNAUTHORIZED, CREATED, SERVICE_UNAVAILABLE } =
  StatusCodes;

/**
 * Update User Profile function
 * @param req
 * @param res
 */
const updateProfileName = async (req, res) => {
  const authToken = req.headers.authorization;
  // console.log(authToken)
  const token = authToken.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!authToken || !verified["id"]) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
    } else {
      const user = await userInfo
        .findOne({ _id: verified["id"] })
        .select("-confirmationCode -password");

      user.name = req.body.name;
      user.info = req.body.info;

      const updatedUser = await user.save();
      if (user === updatedUser) {
        sendResponse(res, OK, "success", updatedUser, []);
      } else {
        sendResponse(
          res,
          SERVICE_UNAVAILABLE,
          "Could Not update your Profile at this time",
          "error",
          {}
        );
      }
    }
  } catch (e) {
    sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
  }
};
const updateProfileMobileNumber = async (req, res) => {
  const authToken = req.headers.authorization;
  console.log(authToken);
  const token = authToken.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!authToken || !verified["id"]) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
    } else {
      const user = await userInfo
        .findOne({ _id: verified["id"] })
        .select("-confirmationCode -password");

      user.mobileNumber = req.body.number;
      const updatedUser = await user.save();
      if (user === updatedUser) {
        sendResponse(res, OK, "success", updatedUser, []);
      } else {
        sendResponse(res, SERVICE_UNAVAILABLE, "error", {}, []);
      }
    }
  } catch (e) {
    sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
  }
};

/**
 * change user Password functionality
 * @param req
 * @param res
 */
const changePassword = async (req, res) => {
  const authToken = req.headers.authorization;
  console.log(req.body);
  const token = authToken.split(" ")[1];
  try {
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!verified["id"] || !authToken) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
    } else {
      const user = await userInfo.findOne({ _id: verified["id"] });

      const passwordEqual = await bcrypt.compare(
        req.body.old_password,
        user.password
      );
      // console.log(req.body.password);
      if (passwordEqual) {
        console.log("here");
        await bcrypt
          .hash(req.body.password, pwdSaltRounds)
          .then(function (hash) {
            user.password = hash;
          });
        const updatedUser = await user.save();
        if (updatedUser) {
          sendResponse(res, OK, "success", {}, {});
        } else {
          sendResponse(
            res,
            SERVICE_UNAVAILABLE,
            "Password not changed",
            "error",
            {}
          );
        }
      } else {
        sendResponse(
          res,
          BAD_REQUEST,
          "Incorrect Password supplied",
          "error",
          {}
        );
      }
    }
  } catch (e) {
    sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
  }
};

const updateProfilePics = async (req, res) => {
  const authToken = req.headers.authorization;
  const token = authToken.split(" ")[1];
  try {
    console.log(token);
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!verified["id"] || !authToken) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
    } else {
      const user = await userInfo.findOne({ _id: verified["id"] });

      user.profilePics = req.body.location;

      const updatedUser = await user.save();
      if (user === updatedUser) {
        sendResponse(res, OK, "success", updatedUser, []);
      } else {
        sendResponse(
          res,
          SERVICE_UNAVAILABLE,
          "Profile Pics not Updated",
          "error",
          {}
        );
      }
    }
  } catch (error) {
    sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
  }
};

const updateNotificationStatus = async(req,res) => {
  const authToken = req.headers.authorization;
  const token = authToken.split(" ")[1];
  console.log(req.body.notify);
  try {
    console.log(token);
    const verified = jwt.verify(token, process.env.JWT_TOKEN);
    if (!verified["id"] || !authToken) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
    } else {
      const user = await userInfo.findOne({ _id: verified["id"] });

      user.notification = req.body.notify;

      const updatedUser = await user.save();
      if (user === updatedUser) {
        sendResponse(res, OK, "success", updatedUser, []);
      } else {
        sendResponse(
          res,
          SERVICE_UNAVAILABLE,
          "notification status update failed",
          "error",
          {}
        );
      }
    }
  } catch (error) {
    sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
  }
}

module.exports = {
  updateProfilePics,
  updateProfileName,
  changePassword,
  updateProfileMobileNumber,
  updateNotificationStatus,
};
