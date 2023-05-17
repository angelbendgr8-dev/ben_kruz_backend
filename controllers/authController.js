const express = require("express");
const {
  saveToDatabase,
  sendResponse,
  genHash,
  sendSms,
} = require("../helpers/functions");
const userModel = require("../models/user");
var jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { pwdSaltRounds, authUrl, url } = require("../helpers/constants");
const { JWT_TOKEN } = process.env;
const hmacSHA512 = require("crypto-js/hmac-sha512");
const Base64 = require("crypto-js/enc-base64");
const { StatusCodes } = require("http-status-codes");
const tokens = require("../models/tokens");
const randomstring = require("randomstring");
const walletModel = require("../models/wallet.model");
const HttpException = require("../helpers/HttpException");
const { createWallet } = require("../services/wallet.service");
const { sendOtp, generateMobileOtp } = require("../services/sns.service");
const { sendTemplatedEmail } = require("../services/ses.service");
const notifications = require("../services/notifications");
const sendMail = require("../services/mailgun.service");

const { BAD_REQUEST, OK, UNAUTHORIZED, CREATED, SERVICE_UNAVAILABLE } =
  StatusCodes;

class Auth {
  async login(req, res, next) {
    const { email, password, authType } = req.body;
    // console.log(loginInfo);
    try {
      const userInfo = await userModel.findOne({
        $or: [
          { email: email.trim().toLocaleLowerCase() },
          { username: email.trim().toLocaleLowerCase() },
          { mobileNumber: email.trim().toLocaleLowerCase() },
        ],
      });
      if (!userInfo)
        throw new HttpException(
          419,
          "Email address or username not found. Please enter a valid email address or create a new account.",
          {}
        );
        await notifications.getPreference(userInfo);
     await sendMail('confirmEmail','Email Confirmation',{name:userInfo.name, email:userInfo.email, token:userInfo.confirmationCode}).catch(err =>console.log(err));
      if (userInfo.authType === "social" && authType === "social") {
        const token = jwt.sign({ id: userInfo._id }, JWT_TOKEN);
        const data = {
          userInfo,
          token: token,
        };
        const wallet = await walletModel.findOne({ user: userInfo._id });
        if (!wallet) {
          console.log(wallet);
          await createWallet(userInfo._id);
        }

        sendResponse(res, OK, "success", data, []);
      } else {
        const passwordEqual = await bcrypt.compare(
          password.trim(),
          userInfo.password
        );

        if (passwordEqual) {
          userInfo.password = "";
          const token = jwt.sign({ id: userInfo._id }, JWT_TOKEN);
          const data = {
            userInfo,
            token: token,
          };
          const wallet = await walletModel.findOne({ user: userInfo._id });
          if (!wallet) {
            console.log(wallet);
            await createWallet(userInfo._id);
          }

          sendResponse(res, OK, "success", data, []);
        } else {
          throw new HttpException(
            207,
            "Incorrect password. Please check your password and try again."
          );
        }
      }
    } catch (error) {
      next(error);
    }
  }
  async validate(req, res, next) {
    const { email, username, mobileNumber } = req.body;
    // console.log(loginInfo);
    try {
      const userInfo = await userModel.findOne({
        $or: [
          { email: email.trim().toLocaleLowerCase() },
          { username: username.trim().toLocaleLowerCase() },
        ],
      });
      if(userInfo?.mobileNumber && userInfo.mobileNumber === mobileNumber){
        sendResponse(res, OK, "failed", {}, []);
      }
      if (!userInfo) {
        sendResponse(res, OK, "success", {}, []);
      } else {
        sendResponse(res, OK, "failed", {}, []);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async verifyMobile(req, res, next) {
    const { email,username } = req.body;
    const { otp_hash, otp_code } = await generateMobileOtp();
    console.log(otp_code, otp_hash);
    try {
      const result = await sendTemplatedEmail("otp_template", {
        email: email,
        username: username,
        otp_code,
      });
      sendResponse(res, CREATED, "success", { otp_hash });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async register(req, res) {
    try {
      const userInfo = { ...req.body };
      await bcrypt.hash(userInfo.password, pwdSaltRounds).then(function (hash) {
        userInfo.password = hash;
      });
      const secret = Base64.stringify(hmacSHA512(userInfo.email, JWT_TOKEN))
        .replace(/\//g, "_")
        .replace(/\+/g, "-");
      const hash = await genHash(secret);
      userInfo.confirmationCode = hash;

      const newUser = new userModel(userInfo);
      const token = jwt.sign({ id: newUser._id }, JWT_TOKEN, {
        expiresIn: 86400,
      });
     

      const savedUser = await saveToDatabase(newUser);
      await notifications.getPreference(savedUser);
      // console.log(savedUser);
      if (newUser == savedUser) {
        savedUser.password = "";
        savedUser.status = null;
        savedUser.verified = true;
        savedUser.confimationCode = "";

        try {
          // await sendMail('mailconfirmation','Email Confirmation',{name:savedUser.name, email:savedUser.email, token:token,url:authUrl}).catch(err =>console.log(err));
        } catch (error) {
          console.log(error);
        }
        await createWallet(savedUser._id);
        // await new UserNotifSettingModel({ userId: newUser.id }).save();
        const data = {
          savedUser,
          token: token,
        };
        sendResponse(res, CREATED, "success", data, []);
      } else {
        console.log("here");
        sendResponse(res, BAD_REQUEST, "Unable to Register", "error", {});
      }
    } catch (e) {
      console.log(e);
    }
  }
  async passwordReset(req, res, next) {
    try {
      const user = await userModel.findOne({ email: req.body.email });
      if (!user) throw new HttpException(409, "No user with email found", {});

      const { otp_hash, otp_code } = await generateMobileOtp();

      const result = await sendTemplatedEmail("otp_template", {
        email: user.email,
        username: user.username,
        otp_code,
      });
      console.log(result);
      sendResponse(res, CREATED, "success", { otp_hash });

      // sendResponse(res, OK, "success", [], []);
    } catch (error) {
      next(error);
      // sendResponse(res, OK, "error", {}, error);
    }
  }
  async confirmPasswordReset(req, res, next) {
    const data = req.body;
    console.log(data);
    try {
      const user = await userModel.findOne({ email: data.email });
      if (!user) throw new HttpException(409, "No user with email found", {});

      await bcrypt.hash(data.password, pwdSaltRounds).then(function (hash) {
        user.password = hash;
      });
      // user.password = req.body.password;
      await user.save();

      sendResponse(
        res,
        OK,
        "success",
        { msg: "Password reset successfully" },
        []
      );
    } catch (error) {
      // res.send("An error occured");
      // console.log(error);
      next(error);
    }
  }

  async verifyUser(req, res, next) {
    userModel
      .findOne({
        confirmationCode: req.params.confirmationCode,
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: "User Not found." });
        }

        user.status = "Active";
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          } else {
            sendResponse(
              res,
              OK,
              "Email verification Successful",
              "success",
              {}
            );
          }
        });
      })
      .catch((e) => console.log("error", e));
  }
  async confirmOtp(req, res, next) {
    const { otp_code, otp_hash } = req.body;
    console.log(req.body);
    try {
      const isOtpMatching = await bcrypt.compare(otp_code, otp_hash);
      if (!isOtpMatching)
        throw new HttpException("409", "unable to verify otp", {});

      sendResponse(res, OK, "success", { verified: true }, []);
      // return;
    } catch (error) {
      next(error);
    }
  }

  // async sendOtp(req,res,next){
  //   const userInfo = await userModel.findOne({ username: {'$regex': req.body.username,$options:'i'}  });
  //   const otp = Math.floor(100000 + Math.random() * 900000);
  //   userInfo.otpCode = otp;
  //   await userInfo.save();
  //   userInfo.password = '';
  //   userInfo.status = null;
  //   userInfo.verified = '';
  //   try {
  //     const result = await TwilioService.sendOtp(userInfo.mobileNumber.substr(1));
  //     console.log(result);
  //     sendResponse(res, OK, 'success', {user},[])
  //   } catch (error) {

  //   }
  // }
}

module.exports = new Auth();
