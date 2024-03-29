const express = require("express");
const {
  saveToDatabase,
  sendResponse,
  sendPushMessage,
} = require("../helpers/functions");
const { functionPaginate } = require("../helpers/pagination");
var jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const userModel = require("../models/user");
const category = require("../models/category");
const language = require("../models/language");
const moment = require("moment");
const _ = require("lodash");
const videoModel = require("../models/videos");
const shortModel = require("../models/shorts");
const subscribeService = require("../services/subscribe.service");
const HttpException = require("../helpers/HttpException");
const notifications = require("../services/notifications");
const { DateTime, Interval } = require("luxon");
const videoViews = require("../models/videoViews");
const transactionHistory = require("../models/transaction.model");

const { BAD_REQUEST, OK, UNAUTHORIZED, CREATED, SERVICE_UNAVAILABLE } =
  StatusCodes;

class Home {
  /**
   * Update User Profile function
   * @param req
   * @param res
   */

  saveSubscription = async (req, res, next) => {
    const data = req.body;
    const authToken = req.headers.authorization;
    console.log(authToken);
    const token = authToken.split(" ")[1];
    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");
      const status = await subscribeService.subscribeToPerson(
        data,
        verified["id"]
      );
      res.status(200).json({
        status: "success",
        data: {},
        message: `successfully ${status}`,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  saveComment = async (req, res) => {
    const reqBody = { ...req.body };
    const authToken = req.headers.authorization;
    console.log(authToken);
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const user = await userModel.findOne({ _id: verified["id"] });
        const currentGame = await game.findOne({ _id: reqBody.videoId });
        // res.json(currentGame)
        const tempComment = {
          name: user.name,
          comment: reqBody.comment,
          date: moment(),
        };
        const newComment = new comment(tempComment);
        // res.json(newComment);
        if (!currentGame.comments) {
          const comments = [];
          comments.push(newComment);
          await game.findOneAndUpdate({ _id: id }, { comments: comments });
        } else {
          const comments = currentGame.comments;
          comments.push(newComment);
          await game.findOneAndUpdate(
            { _id: reqBody.videoId },
            { comments: comments }
          );
        }
        const updatedGame = await game.findOne({ _id: reqBody.videoId });
        sendResponse(res, OK, "error", updatedGame.comments, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
    }
  };
  getCategories = async (req, res) => {
    try {
      const categories = await category.find({ name: { $ne: "For you" } });
      if (categories) {
        sendResponse(res, OK, "error", categories, []);
        return;
      }
      sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getMyCategories = async (req, res) => {
    try {
      const user = req.user;
      const foryou = await category.find({ name: "For you" }).select("_v,name");

      const categories = await category.find({
        _id: { $in: [foryou[0]._id, ...user.preferences] },
      });
      if (categories) {
        sendResponse(res, OK, "error", categories.reverse(), []);
        return;
      }
      sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getCategoryVideos = async (req, res) => {
    const { title } = req.params;
    const user = req.user;
    const page = +req.query.page;
    const limit = +req.query.limit;
    try {
      let videos = [];
      let length;

      if (title === "For_you") {
        const following = user.following.map((item) => item.id);
        console.log(following);
        if (following.length === 0) {
          length = await videoModel.find({ video: { $ne: null } });
          videos = videoModel
            .find({ video: { $ne: null } })
            .sort("-views")

            .populate({
              path: "uploader",
              model: userModel,
              select: "username profilePics subscribersCount subscribers",
            });
        } else {
          length = await videoModel.find({
            uploader: { $in: following },
            video: { $ne: null },
          });
          videos = videoModel
            .find({ uploader: { $in: following }, video: { $ne: null } })
            .sort("-created")
            .populate({
              path: "uploader",
              model: userModel,
              select: "username profilePics subscribersCount subscribers",
            });
        }
        const { data, totalContent, totalPages } = await functionPaginate(
          page,
          limit,
          videos,
          length.length
        );
        // console.log(data);
        sendResponse(
          res,
          OK,
          "success",
          { videos: data, totalContent, totalPages },
          []
        );
      } else if (title === "All") {
        length = await videoModel.find({ video: { $ne: null } });
        videos = videoModel
          .find({ video: { $ne: null } })
          .sort("-created")

          .populate({
            path: "uploader",
            model: userModel,
            select: "username profilePics subscribersCount subscribers",
          });
        // const { data, totalContent, totalPages } = await functionPaginate(
        //   page,
        //   limit,
        //   videos,
        //   videoModel
        // );
        // // console.log(data);
        // sendResponse(
        //   res,
        //   OK,
        //   "success",
        //   { videos: data, totalContent, totalPages },
        //   []
        // );
      } else {
        length = await category.findOne({ name: title });
        videos = videoModel
          .find({ video: { $ne: null } })
          .where("_id")
          .in(length.videos)
          .sort("-created")
          .populate({
            path: "uploader",
            model: userModel,
            select: "username profilePics subscribersCount subscribers",
          });
        const { data, totalContent, totalPages } = await functionPaginate(
          page,
          limit,
          videos,
          length.videos.length
        );
        console.log(videos);
        sendResponse(
          res,
          OK,
          "success",
          { videos: data, totalContent, totalPages },
          []
        );
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getLanguages = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const languages = await language.find({});
        if (languages) {
          sendResponse(res, OK, "error", languages, []);
          return;
        }

        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  createCategory = async (req, res) => {
    //  const data = {
    //      name: 'Comedy',
    //  }
    const langs = ["English", "Ibo", "Yoruba", "Hausa"];

    _.map(langs, async (name) => {
      const data = {
        name,
      };
      const newCategory = new language(data);
      await newCategory.save();
    });
    //  newCategory.save();
    res.send("category created");
  };

  getVideos = async (req, res) => {
    const page = +req.query.page;
    const limit = +req.query.limit;
    const country = req.query.country;

    try {
      const user = req.user;
      // console.log(authToken)
      const now = DateTime.now();
      const diff = now.minus({ days: 30 }).toISO();
      let content;
      let sorted;
      content = await videoViews
        .find({ "info.country": country, createdAt: { $gte: diff } })
        .select("videoId");

      let presence = _.countBy(content, (item) => item.videoId);
      if (_.size(presence) > 3) {
        sorted = Object.keys(presence).sort(function (a, b) {
          return presence[b] - presence[a];
        });
      } else {
        content = await videoViews
          .find({ createdAt: { $gte: diff } })
          .select("videoId");
        presence = _.countBy(content, (item) => item.videoId);
        sorted = Object.keys(presence).sort(function (a, b) {
          return presence[b] - presence[a];
        });
      }
      const trending = sorted.slice(0, 20);
      const trendingVideos = await videoModel.find({ _id: { $in: trending } });
      sendResponse(res, OK, "success", trendingVideos, []);
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getRecent = async (req, res) => {
    const page = +req.query.page;
    const limit = +req.query.limit;
    const country = req.query.country;
    // console.log(country);

    try {
      const authToken = req.headers.authorization;
      // console.log(authToken)
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        let videos;
        videos = await videoModel
          .aggregate([{ $sample: { size: 20 } }])
          .match({ video: { $ne: null }, country: country })
          .sort({ createdAt: -1 });

        if (_.size(videos) < 5) {
          videos = await videoModel
            .aggregate([{ $sample: { size: 20 } }])
            .match({ video: { $ne: null } })
            .sort({ createdAt: -1 });
        }
        sendResponse(res, OK, "success", videos, []);

        // if (videos) {
        //   sendResponse(res, OK, "error", videos, []);
        //   return;
        // }

        // sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getMyVideos = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    const page = +req.query.page;
    const limit = +req.query.limit;
    console.log(req.params);

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const content = await videoModel.find({
          uploader: req.params.id,
          video: { $ne: null },
        });

        sendResponse(res, OK, "success", content.length, {});
      }
    } catch (error) {
      // console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getLikedVideos = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const user = await userModel
          .find({ _id: verified["id"] })
          .populate("likedVideos")
          .exec();
        // console.log(user.likedVideos);
        if (user) {
          sendResponse(res, OK, "success", user, []);
          return;
        }

        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getWatchList = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const user = await userModel
          .find({ _id: verified["id"] })
          .populate("watchLater")
          .exec();
        // console.log(user.likedVideos);
        if (user) {
          sendResponse(res, OK, "success", user, []);
          return;
        }

        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getLikedVideos = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const user = await userModel
          .find({ _id: verified["id"] })
          .populate("likedVideos")
          .exec();
        console.log(user.likedVideos);
        if (user) {
          sendResponse(res, OK, "success", user, []);
          return;
        }

        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };

  getShorts = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    const page = +req.query.page;
    const limit = +req.query.limit;

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const shorts = await shortModel
          .aggregate([{ $sample: { size: 20 } }])
          .match({ video: { $ne: null } });
        console.log(shorts);
        // if (shorts) {
        //   const { data, totalContent, totalPages } = await functionPaginate(
        //     page,
        //     limit,
        //     shorts,
        //     shortModel
        //   );
        sendResponse(res, OK, "success", { shorts }, []);
        return;
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  // getShorts = async (req, res) => {
  //     const authToken = req.headers.authorization;
  //     // console.log(authToken)
  //     const token = authToken.split(' ')[1];

  //     try {

  //         const verified = jwt.verify(token, process.env.JWT_TOKEN);
  //         if (!verified['id'] || !authToken) {
  //             sendResponse(res, UNAUTHORIZED, 'UNAUTHORIZED', 'error', {});

  //         } else {

  //             // const shorts = await shortModel.find({}).populate('uploader').exec();
  //             const total = await shorts.countDocuments();
  //             const skip = Math.floor(Math.random() * total) + 1;
  //             const shorts = await shorts.findOne({}).skip(skip).populate('uploader').exec();
  //             console.log(shorts);
  //             if (shorts) {
  //                 sendResponse(res, OK, 'success', shorts, []);
  //                 return
  //             }
  //             // console.log(shorts);
  //             sendResponse(res, OK, 'error', [], [{ 'msg': `Fetch Error` }]);
  //         }
  //     } catch (error) {
  //         console.log(error);
  //         sendResponse(res, OK, 'error', [], [{ 'msg': `Unauthorized` }]);
  //     }
  // }
  getMyShorts = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    const page = +req.query.page;
    const limit = +req.query.limit;

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const content = await shortModel.find({
          uploader: verified["id"],
          video: { $ne: null },
        });
        if (shorts) {
          const { data, totalContent, totalPages } = await functionPaginate(
            page,
            limit,
            content,
            videoModel
          );
          sendResponse(
            res,
            OK,
            "success",
            { shorts: data, totalContent, totalPages },
            []
          );
          return;
        }
        console.log(shorts);
        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      // console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getShortsById = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    const { id } = req.params;
    const page = +req.query.page;
    const limit = +req.query.limit;

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const shortsCount = await shortModel.find({ uploader: id });
        const shorts = shortModel
          .find({ uploader: id, video: { $ne: null } })
          .sort("-created")
          .populate({
            path: "uploader",
            model: userModel,
            select: "username profilePhoto",
          });
        if (shorts) {
          const { data, totalContent, totalPages } = await functionPaginate(
            page,
            limit,
            shorts,
            shortsCount.length
          );
          sendResponse(
            res,
            OK,
            "success",
            { shorts: data, totalContent, totalPages },
            []
          );
          return;
        }
        // console.log(shorts);
        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      // console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getSingleShortById = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    const { id } = req.params;
    const page = +req.query.page;
    const limit = +req.query.limit;

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const shorts = await shortModel.findOne({
          _id: id,
          video: { $ne: null },
        });
        if (shorts) {
          sendResponse(res, OK, "success", shorts, []);
          return;
        }
        // console.log(shorts);
        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      // console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  getSingleVideoById = async (req, res, next) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    const { id } = req.params;
    console.log(id);
    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const video = await videoModel
          .findOne({
            _id: id,
            video: { $ne: null },
          })
          .populate({ path: "uploader", model: userModel });

        if (video) {
          sendResponse(res, OK, "success", video, []);
          return;
        }
        // console.log(shorts);
        throw new HttpException(419, "resource not found", []);
      }
    } catch (error) {
      next(error);
    }
  };
  getVideosById = async (req, res) => {
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    const { id } = req.params;
    const page = +req.query.page;
    const limit = +req.query.limit;

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const videos = videoModel
          .find({ uploader: id, video: { $ne: null } })
          .sort("-created");
        const vidLength = await videoModel
          .find({ uploader: id })
          .sort("-created");

        if (videos) {
          const { data, totalContent, totalPages } = await functionPaginate(
            page,
            limit,
            videos,
            vidLength.length
          );
          sendResponse(
            res,
            OK,
            "success",
            { videos: data, totalContent, totalPages },
            []
          );
          return;
        }
        // console.log(shorts);
        sendResponse(res, OK, "error", [], [{ msg: `Fetch Error` }]);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  savePreferences = async (req, res) => {
    const { preferences, token } = req.body;
    const authToken = req.headers.authorization;
    console.log(token);
    // const token = authToken.split(' ')[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      console.log(verified);
      if (!verified["id"]) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        let user = await userModel.findOne({ _id: verified["id"] });
        _.map(preferences, async function (option) {
          await userModel.findByIdAndUpdate(verified["id"], {
            $push: { preferences: option },
          });
        });

        const updatedUser = await userModel.findOne({ _id: verified["id"] });
        sendResponse(res, OK, "success", updatedUser, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  updateLanguagesPreferences = async (req, res) => {
    const { languages } = req.body;
    const authToken = req.headers.authorization;
    // console.log(token);
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      console.log(verified);
      if (!verified["id"]) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        let user = await userModel.findOne({ _id: verified["id"] });
        user.languages = [];
        await user.save();
        await Promise.all(
          _.map(languages, async function (option) {
            await userModel.findByIdAndUpdate(verified["id"], {
              $push: { languages: option },
            });
          })
        );

        const updatedUser = await userModel.findOne({ _id: verified["id"] });
        sendResponse(res, OK, "success", updatedUser, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };

  updatePreferences = async (req, res) => {
    const { preferences } = req.body;
    const authToken = req.headers.authorization;
    // console.log(authToken)
    const token = authToken.split(" ")[1];
    // const token = authToken.split(' ')[1];
    // console.log(preferences);

    try {
      // console.log(token);
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      console.log(verified);
      if (!verified["id"]) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        let user = await userModel.findOne({ _id: verified["id"] });
        user.preferences = [];
        await user.save();
        await Promise.all(
          _.map(preferences, async function (option) {
            await userModel.findByIdAndUpdate(verified["id"], {
              $push: { preferences: option },
            });
          })
        );

        const updatedUser = await userModel.findOne({ _id: verified["id"] });
        sendResponse(res, OK, "success", updatedUser, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", [], [{ msg: `Unauthorized` }]);
    }
  };
  followUser = async (req, res) => {
    const reqBody = { ...req.body };
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // const user = await userModel.findOne({_id:verified['id']});
        const user = await userModel.findOne({ _id: reqBody.uploaderId });
        const me = await userModel.findOne({ _id: verified["id"] });

        if (user.follower && user.follower.length > 0) {
          const follower = user.follower.filter((follow) =>
            follow.id.equals(verified["id"])
          );
          if (follower.length === 0) {
            await userModel.findByIdAndUpdate(user._id, {
              $push: { follower: { id: verified["id"], time: moment.now() } },
            });
            await notifications.createNotification({
              userId: verified["id"],
              triggerId: user._id,
              title: `Following Notification`,
              content: `Awesome, you're now following @${user.username}! You'll be the first to know about their latest uploads`,
              type: "regular",
              link: ``,
            });
            await notifications.createNotification({
              userId: user._id,
              triggerId: user._id,
              title: `Following Notification`,
              content: `You're getting more popular! @${me.username} just followed your account. Keep up the great work!`,
              type: "regular",
              link: ``,
            });
          } else {
            const followey = user.follower.filter(
              (follow) => !follow.id.equals(verified["id"])
            );
            user.follower = followey;
            await user.save();
          }
        } else {
          await userModel.findByIdAndUpdate(user._id, {
            $push: { follower: { id: verified["id"], time: moment.now() } },
          });
          await notifications.createNotification({
            userId: verified["id"],
            triggerId: user._id,
            title: `Following Notification`,
            content: `Awesome, you're now following @${user.username}! You'll be the first to know about their latest uploads`,
            type: "regular",
            link: ``,
          });
          await notifications.createNotification({
            userId: user._id,
            triggerId: user._id,
            title: `Following Notification`,
            content: `You're getting more popular! @${me.username} just followed your account. Keep up the great work!`,
            type: "regular",
            link: ``,
          });
        }
        if (me.following && me.following.length > 0) {
          const following = me.following.filter((follow) =>
            follow.id.equals(user._id)
          );
          if (following.length === 0) {
            await userModel.findByIdAndUpdate(me._id, {
              $push: { following: { id: user._id, time: moment.now() } },
            });
          } else {
            const followey = me.following.filter(
              (follow) => !follow.id.equals(user._id)
            );
            me.following = followey;
            await me.save();
          }
        } else {
          await userModel.findByIdAndUpdate(me._id, {
            $push: { following: { id: user._id, time: moment.now() } },
          });
        }
        const newUser = await userModel.findOne({ _id: reqBody.uploaderId });
        sendResponse(res, OK, "success", newUser, []);
      }
    } catch (error) {
      console.log(error);

      sendResponse(res, OK, "error", {}, []);
    }
  };
  addHistory = async (req, res, next) => {
    const reqBody = { ...req.body };

    try {
      // const user = await userModel.findOne({_id:verified['id']});
      const user = req.user;

      if (user.history && user.history.length > 0) {
        const history = user.history.filter((video) =>
          video.video.equals(reqBody.videoId)
        );
        if (history.length === 0) {
          await userModel.findByIdAndUpdate(user._id, {
            $push: {
              history: {
                video: reqBody.videoId,
                previousTime: reqBody.previousTime,
              },
            },
          });
        } else {
          let histories = user.history.map((video) => {
            if (video.video.equals(reqBody.videoId)) {
              const newvideo = {
                video: reqBody.videoId,
                previousTime: reqBody.previousTime,
              };
              return newvideo;
            } else {
              return video;
            }
          });
          if (histories.length > 10) {
            histories = histories.slice(1);
          }
          await userModel.findByIdAndUpdate(user._id, {
            history: histories,
          });
        }
      } else {
        await userModel.findByIdAndUpdate(user._id, {
          $push: {
            history: {
              video: reqBody.videoId,
              previousTime: reqBody.previousTime,
            },
          },
        });
      }
      const newUser = await userModel.findOne({ _id: user._id });
      sendResponse(res, OK, "success", newUser, []);
    } catch (error) {
      console.log(error);

      sendResponse(res, OK, "error", {}, []);
    }
  };
  getHistory = async (req, res, next) => {
    const reqBody = { ...req.body };

    try {
      // const user = await userModel.findOne({_id:verified['id']});
      const user = req.user;

      const newUser = await userModel
        .findOne({ _id: user._id })
        .populate({ path: "history.video", model: videoModel })
        .exec();
      const history = newUser.history.filter((his) => his.video !== null);
      sendResponse(res, OK, "success", history, []);
    } catch (error) {
      console.log(error);

      sendResponse(res, OK, "error", {}, []);
    }
  };
  deleteHistory = async (req, res, next) => {
    const reqBody = { ...req.body };

    try {
      // const user = await userModel.findOne({_id:verified['id']});
      const user = req.user;

      const history = user.history.filter(
        (video) => !video.video.equals(reqBody.videoId)
      );

      user.history = history;
      user.save();

      const newUser = await userModel
        .findOne({ _id: user._id })
        .populate({ path: "history.video", model: videoModel })
        .exec();
      sendResponse(res, OK, "success", newUser.history, []);
    } catch (error) {
      console.log(error);

      sendResponse(res, OK, "error", {}, []);
    }
  };
  getUserById = async (req, res, next) => {
    // const userId = req.params.id;
    const authToken = req.headers.authorization;
    // console.log(authToken);
    const token = authToken.split(" ")[1];
    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");
      const userId = req.params.id;
      const findOneUserData = await userModel.findOne({ _id: userId });
      // console.log(findOneUserData)
      res.status(200).json({ data: findOneUserData, message: "user info" });
    } catch (error) {
      next(error);
    }
  };
  saveToken = async (req, res, next) => {
    try {
      const authToken = req.headers.authorization;
      // console.log(authToken);
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");

      const user = await userModel.findOne({ _id: verified["id"] });
      console.log(req.body);
      user.fcmToken = req.body.fcmToken;
      const updatedUser = await user.save();
      if (user === updatedUser) {
        sendResponse(res, OK, "Token Generated Successfully", updatedUser, {});
      }
    } catch (err) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  getSubScribers = async (req, res, next) => {
    try {
      const user = req.user;
      const page = +req.query.page;
      const limit = +req.query.limit;

      let subscriptions = user.subscriptions.map(
        (subscription) => subscription.id
      );
      subscriptions = userModel
        .find({ _id: { $in: subscriptions } })
        .select("username profilePics");
      const { data, totalContent, totalPages } = await functionPaginate(
        page,
        limit,
        subscriptions,
        user.subscriptions.length
      );
      // console.log(data);
      sendResponse(
        res,
        OK,
        "success",
        { subscriptions: data, totalContent, totalPages },
        []
      );
    } catch (err) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  getFollowers = async (req, res, next) => {
    try {
      const user = req.user;
      const page = +req.query.page;
      const limit = +req.query.limit;

      let followers = user.follower.map((follower) => follower.id);
      followers = userModel
        .find({ _id: { $in: followers } })
        .select("username profilePics");
      const { data, totalContent, totalPages } = await functionPaginate(
        page,
        limit,
        followers,
        user.follower.length
      );
      // console.log(data);
      sendResponse(
        res,
        OK,
        "success",
        { followers: data, totalContent, totalPages },
        []
      );
    } catch (err) {
      console.log(err);
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  getProfileFollowers = async (req, res, next) => {
    try {
      const userId = req.query.userId;
      const page = +req.query.page;
      const limit = +req.query.limit;
      const user = await userModel.findOne({ _id: userId });
      console.log(user);

      let followers = user.follower.map((follower) => follower.id);
      followers = userModel
        .find({ _id: { $in: followers } })
        .select("username profilePics");
      const { data, totalContent, totalPages } = await functionPaginate(
        page,
        limit,
        followers,
        user.follower.length
      );
      // console.log(data);
      sendResponse(
        res,
        OK,
        "success",
        { followers: data, totalContent, totalPages },
        []
      );
    } catch (err) {
      console.log(err);
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  getFollowings = async (req, res, next) => {
    try {
      const user = req.user;
      const page = +req.query.page;
      const limit = +req.query.limit;

      let followers = user.following.map((follower) => follower.id);
      followers = userModel
        .find({ _id: { $in: followers } })
        .select("username profilePics");
      const { data, totalContent, totalPages } = await functionPaginate(
        page,
        limit,
        followers,
        user.follower.length
      );
      // console.log(data);
      sendResponse(
        res,
        OK,
        "success",
        { followers: data, totalContent, totalPages },
        []
      );
    } catch (err) {
      console.log(err);
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  getProfileFollowings = async (req, res, next) => {
    try {
      const userId = req.query.userId;
      console.log(userId);
      const page = +req.query.page;
      const limit = +req.query.limit;
      const user = await userModel.findOne({ _id: userId });

      let followers = user.following.map((follower) => follower.id);
      followers = userModel
        .find({ _id: { $in: followers } })
        .select("username profilePics");
      const { data, totalContent, totalPages } = await functionPaginate(
        page,
        limit,
        followers,
        user.follower.length
      );
      // console.log(data);
      sendResponse(
        res,
        OK,
        "success",
        { followers: data, totalContent, totalPages },
        []
      );
    } catch (err) {
      console.log(err);
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  searchContent = async (req, res, next) => {
    try {
      const authToken = req.headers.authorization;
      // console.log(authToken);
      const token = authToken.split(" ")[1];
      const page = +req.body.page;
      const limit = +req.body.limit;
      const { search } = req.body;
      console.log(page);
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");
      let total = await videoModel.find({
        description: { $regex: ".*" + search + ".*", $options: "i" },
        video: { $ne: null },
      });
      let videos = videoModel
        .find({
          description: { $regex: ".*" + search + ".*", $options: "i" },
          video: { $ne: null },
        })
        .populate({ path: "uploader", model: "userModel" });

      const { data, totalContent, totalPages } = await functionPaginate(
        page,
        limit,
        videos,
        total.length
      );
      // console.log(data);
      sendResponse(
        res,
        OK,
        "success",
        { videos: data, totalContent, totalPages },
        []
      );
    } catch (err) {
      console.log(err);
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  searchProfile = async (req, res, next) => {
    try {
      const authToken = req.headers.authorization;
      console.log(authToken);
      const token = authToken.split(" ")[1];
      const page = +req.body.page;
      const limit = +req.body.limit;
      console.log(page);
      const { search } = req.body;
      console.log(search);
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");
      let total = await userModel.find({
        username: { $regex: ".*" + search + ".*", $options: "i" },
      });
      console.log(total);
      let profiles = userModel.find({
        username: { $regex: ".*" + search + ".*", $options: "i" },
      });

      const { data, totalContent, totalPages } = await functionPaginate(
        page,
        limit,
        profiles,
        total.length
      );
      sendResponse(
        res,
        OK,
        "success",
        { profiles: data, totalContent, totalPages },
        []
      );
    } catch (err) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  endSubscription = async (req, res, next) => {
    try {
      const { userId, creatorId } = req.body;
      const user = req.user;
      const creator = await userModel.findOne({ _id: creatorId });
      const userInfo = await userModel.findOne({ _id: userId });
      console.log(userInfo.subscriptions);
      if (creator.subscribers.length > 0) {
        const isSubscribed = creator.subscribers.find((id) =>
          id.equals(userId)
        );

        console.log(typeof isSubscribed);
        let updatedCreator;

        if (isSubscribed) {
          const subscribers = creator.subscribers.filter(
            (id) => !id.equals(userId)
          );
          const subscribeTime = creator.subscribeTime.filter(
            (object) => !object.id.equals(userId)
          );

          const subscriptions = userInfo.subscriptions.filter(
            (subs) => !subs.id.equals(creatorId)
          );
          userInfo.subscriptions = subscriptions;
          userInfo.save();

          updatedCreator = await userModel.findOneAndUpdate(
            { _id: creatorId },
            {
              $set: {
                subscribers,
                subscribeTime,
                subscribersCount: creator.subscribersCount - 1,
              },
            },
            { new: true }
          );
        }
        sendResponse(res, OK, "success", user, []);
      } else {
        throw new HttpException(
          409,
          "you are not subscribed to this creator",
          {}
        );
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
  checkSubscriptions = async (req, res, next) => {
    const user = req.user;
    const subscriptions = user.subscriptions.filter((item) => {
      const expiry = DateTime.fromISO(item.expiresIn);

      const today = DateTime.now();

      const diff = Interval.fromDateTimes(today, expiry);
      const result = diff.length("days");
      if (result < 1) {
        return true;
      }
      return false;
    });

    if (subscriptions.length > 0) {
      await sendPushMessage(user?.fcmToken, {
        title: "Subscription expiry notification",
        message: `${subscriptions.length} of your subscription(s) is expiring soon. Check your subscriptions and renew today to keep the exclusive content coming.`,
      });
    }
    res.send(200);
  };

  profileAnalysis = async (req, res, next) => {
    const { from, to } = req.query;
    let range = {};
    let balance;
    let graphData = {};
    console.log(typeof from);

    if (!_.isEmpty(from) && from !== "undefined") {
      console.log("hello");
      range["from"] = from;
    }
    if (!_.isEmpty(to) && to !== "undefined") {
      range["to"] = to;
    }
    let videos;
    let subscriptions;

    if (!_.isEmpty(range)) {
      balance = await transactionHistory.find({
        userId: req.user._id,
        type: "CREDIT",
        description: "credit for subscription",
        createdAt: { $gte: range.from, $lte: moment(range.to).add(1, "days") },
      });
      videos = await videoModel.find({
        uploader: req.user._id,
        video: { $ne: null },
        createdAt: { $gte: range.from, $lte: moment(range.to).add(1, "days") },
      });
      subscriptions = await transactionHistory.find({
        userId: req.user._id,
        type: "CREDIT",
        description: "credit for subscription",
        createdAt: { $gte: range.from, $lte: moment(range.to).add(1, "days") },
      });

      graphData = await this.getGraphData(balance);
    } else {
      balance = await transactionHistory.find({
        userId: req.user._id,
        type: "CREDIT",
        description: "credit for subscription",
      });
      subscriptions = await transactionHistory.find({
        userId: req.user._id,
        type: "CREDIT",
        description: "credit for subscription",
      });
      graphData = await this.getGraphData(balance);
      videos = await videoModel.find({
        uploader: req.user._id,
        video: { $ne: null },
      });
    }

    const total = _.sumBy(balance, "amount");
    const totalSubscriptions = _.size(subscriptions);
    const views = _.sumBy(videos, "views");
    const comments = _.sumBy(videos, "numberOfComments");
    const likes = _.sumBy(videos, "likeCount");

    const data = {
      subscriptions: totalSubscriptions,
      total,
      views,
      comments,
      likes,
      graphData,
    };
    sendResponse(res, OK, "success", data, []);
  };

  getGraphData = async (data) => {
    console.log(data);
    const processedData = _.map(data, (item) => {
      return {
        Month: moment(item.createdAt).format("MMM"),
        amount: item.amount,
      };
    });
    const grouped = _.groupBy(processedData, (item) => item.Month);
    const dataSet = _.map(grouped, (item) => {
      const sum = _.sumBy(item, (item) => item.amount);
      return {
        Month: item[0].Month,
        amount: sum,
      };
    });

    let labels = _.map(dataSet, (item) => item.Month).reverse();
    const dataLength = labels.length;
    const others = new Array(6 - dataLength);
    console.log(others.length);
    const otherLabels = [];
    const otherAmount = [];
    for (let i = 0; i <= 6 - dataLength; i++) {
      otherLabels.push(
        moment()
          .subtract(dataLength + i, "month")
          .format("MMM")
      );
      otherAmount.push(0);
    }

    let amount = _.map(dataSet, (item) => item.amount);
    labels = [...otherLabels.reverse(),...labels];
    amount = [...otherAmount.reverse(),...amount.reverse()];
    return { labels, amount };
  };
}

module.exports = new Home();
