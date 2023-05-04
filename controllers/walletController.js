const express = require("express");
const HttpException = require("../helpers/HttpException");

var jwt = require("jsonwebtoken");
const { sendResponse } = require("../helpers/functions");
const bcrypt = require("bcrypt");
const {
  fundWallet,
  getWallet,
  createBeneficiary,
} = require("../services/wallet.service");
const transactionModel = require("../models/transaction.model");

const { sendOtp, generateMobileOtp } = require("../services/sns.service");

class WalletController {
  depositToWallet = async (req, res, next) => {
    const data = req.body;

    const authToken = req.headers.authorization;
    console.log(authToken);
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");
      const wallet = await fundWallet(data, verified["id"]);
      sendResponse(res, 200, "success", wallet, {});
    } catch (error) {
      console.log(error);
      next(error);

    }
  };

  getWallet = async (req, res, next) => {
    const data = req.body;

    const authToken = req.headers.authorization;
    console.log(authToken);
    const token = authToken.split(" ")[1];
    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");
      const wallet = await getWallet(verified["id"]);
      res.status(200).json({ data: wallet, message: "All Wallets" });
    } catch (error) {
      next(error);
    }
  };

  transferForSubscribe = async (req, res, next) => {
    const data = req.body;
    const user_id = req.user._id;
    try {
      await walletService.transferForSubscribe(data, user_id);
      res.status(200).json({ data: {}, message: "Successfully subscribed" });
    } catch (error) {
      next(error);
    }
  };

  preBeneficiary = async (req, res, next) => {
    try {
      const user = req.user;
      const { otp_hash, otp_code } = await generateMobileOtp();
      //we have to change this template to reflect beneficiary in wallet
      const result = await sendOtp(user.mobileNumber, otp_code);
      // sendResponse(res, CREATED, "success", { otp_hash });

      res.status(200).json({
        status: "success",
        data: { otp_hash },
        message: "Otp Sent Successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  createBeneficiary = async (req, res, next) => {
    try {
      const data = req.body;
      const user = req.user;
      const passwordEqual = await bcrypt.compare(
        req.body.password.trim(),
        user.password
      );
      if (!passwordEqual) {
        throw new HttpException(409, "Invalid password provided", {});
      }
      const wallet = await createBeneficiary(user, data);
      res
        .status(201)
        .json({
          data: wallet,
          message: "Created beneficiary",
          status: "success",
        });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  fetchTransactions = async (req, res, next) => {
    const data = req.body;

    const authToken = req.headers.authorization;
    console.log(authToken);
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");
      const transactions = await transactionModel
        .find({ userId: verified["id"] })
        .sort({ createdAt: -1 })
        .populate({ path: "recipient", model: "userModel",select:'username' })
        .populate({ path: "sender", model: "userModel",select:'username' })
        .exec();
      console.log(transactions);
      res.status(201).json({
        data: transactions,
        message: "wallet transactions fetch successfully",
      });
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new WalletController();
