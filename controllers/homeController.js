const express = require("express");
const { saveToDatabase, sendResponse } = require("../helpers/functions");
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
      const categories = await category.find({ name: { $ne: "For You" } });
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
        // const { data, totalContent, totalPages } = await functionPaginate(
        //   page,
        //   limit,
        //   videos,
        //   length.length
        // );
        // // console.log(data);
        // sendResponse(
        //   res,
        //   OK,
        //   "success",
        //   { videos: data, totalContent, totalPages },
        //   []
        // );
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
          .in(cat.videos)
          .sort("-created")
          .populate({
            path: "uploader",
            model: userModel,
            select: "username profilePics subscribersCount subscribers",
          });
      }
      // console.log(videos.length);
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

    try {
      const authToken = req.headers.authorization;
      // console.log(authToken)
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const content = videoModel
          .find({ video: { $ne: null } })
          .sort("-created");
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
          { videos: data, totalContent, totalPages },
          []
        );

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
  getRecent = async (req, res) => {
    const page = +req.query.page;
    const limit = +req.query.limit;

    try {
      const authToken = req.headers.authorization;
      // console.log(authToken)
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", {});
      } else {
        const videos = await videoModel
          .aggregate([{ $sample: { size: 20 } }])
          .match({ video: { $ne: null } });
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
            if (!video.video.equals(reqBody.videoId)) {
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
            $push: {
              history: histories
            },
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
      sendResponse(res, OK, "success", newUser.history, []);
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
    const authToken = req.headers.authorization;
    // console.log(authToken);
    const token = authToken.split(" ")[1];

    try {
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
    const authToken = req.headers.authorization;
    // console.log(authToken);
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken)
        throw new HttpException(401, "Authorization failed");

      const user = await userModel.findOne({ _id: verified["id"] });
      // console.log(req.body);
      user.fcmToken = req.body.fcmToken;
      const updatedUser = await user.save();
      if (user === updatedUser) {
        sendResponse(res, OK, "subscribers Successfully", updatedUser, {});
      }
    } catch (err) {
      sendResponse(res, UNAUTHORIZED, "UNAUTHORIZED", "error", err);
    }
  };
  searchContent = async (req, res, next) => {
    const authToken = req.headers.authorization;
    // console.log(authToken);
    const token = authToken.split(" ")[1];
    const page = +req.body.page;
    const limit = +req.body.limit;
    const { search } = req.body;
    console.log(page);
    try {
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
    const authToken = req.headers.authorization;
    console.log(authToken);
    const token = authToken.split(" ")[1];
    const page = +req.body.page;
    const limit = +req.body.limit;
    console.log(page);
    const { search } = req.body;
    console.log(search);
    try {
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
}

module.exports = new Home();
