const express = require("express");
const { saveToDatabase, sendResponse } = require("../helpers/functions");
var jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const users = require("../models/admins");
const moment = require("moment");
const subscribeService = require("../services/subscribe.service");

const { BAD_REQUEST, OK, UNAUTHORIZED, CREATED, SERVICE_UNAVAILABLE } =
  StatusCodes;

class UserController {
  /**
   * Update User Profile function
   * @param req
   * @param res
   */
 

  subscribe = async (
    req,
    res,
    next
  ) => {
    try {
      const status = await subscribeService.subscribeToPerson(req);
      res
        .status(200)
        .json({
          status: "success",
          data: {},
          message: `successfully ${status}`,
        });
    } catch (error) {
      next(error);
    }
  };

  resetSubscriptions = async (
    req,
    res,
    next
  ) => {
    try {
      const userId = req.user._id;
      const { id } = req.body;
      const updatedUser = await subscribeService.resetSubscriptions(
        userId,
        id
      );
      if (updatedUser) {
        res
          .status(200)
          .json({
            status: "success",
            data: updatedUser,
            message: `successful`,
          });
      } else {
        res
          .status(200)
          .json({ status: "success", data: {}, message: `successful` });
      }
    } catch (error) {
      next(error);
    }
  };
   getUserById = async (req, res, next) => {
    try {
      const userId = req.params.id;
      const findOneUserData = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
