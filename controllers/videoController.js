const express = require("express");
const {
  saveToDatabase,
  sendResponse,
  sendPushMessage,
} = require("../helpers/functions");
var jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");
const userModel = require("../models/user");
const moment = require("moment");
const _ = require("lodash");
const videoModel = require("../models/videos");
const shorts = require("../models/shorts");
const streamModel = require("../models/Livestream");
const categoryModel = require("../models/category");
const videoComments = require("../models/videocomments");
const shortComments = require("../models/shortsComments");
const Mux = require("@mux/mux-node");

const { functionPaginate } = require("../helpers/pagination");
const { Video } = new Mux(
  process.env.MUX_ACCESS_KEY,
  process.env.MUX_SECRET_KEY
);
const {
  uploadVideo,
  uploadImage,
  uploadShort,
  uploadThumbnail,
  deleteVideo,
} = require("../services/cloudinary.service");

const { BAD_REQUEST, OK, UNAUTHORIZED } = StatusCodes;
const notifications = require("../services/notifications");
const HttpException = require("../helpers/HttpException");
const videocomments = require("../models/videocomments");
const replycomments = require("../models/replycomments");
const webhooksModel = require("../models/webhooks.model");
const videoViews = require("../models/videoViews");

class AppVideo {
  /**
   * Update User Profile function
   * @param req
   * @param res
   */

  saveVideo = async (req, res) => {
    let {
      description,
      languages,
      categories,
      commentable,
      likable,
      duration,
      height,
      width,
      type,
      country,
    } = { ...req.body };
    // console.log("languages", languages);
    languages = languages;
    categories = categories.split(",");
    const { file, thumbNail } = req.files;
    let thumbnail = "";
    // console.log(req.files)
    // console.log(reqBody);

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const user = await userModel.findOne({ _id: verified["id"] });
        await notifications.createNotification({
          userId: verified["id"],
          triggerId: user._id,
          title: `Your Video upload is in progress`,
          content: `Video upload started`,
          type: "regular",
          link: ``,
        });

        // // console.log(video);
        const newVideo = new videoModel({
          description,
          languages,
          commentable,
          likable,
          type,
          duration,
          height,
          width,
          country,
        });
        newVideo.uploader = verified["id"];
        newVideo.public_id = `kruzvideos/${newVideo._id}`;
        const savedVid = await newVideo.save();
        uploadVideo(file[0], newVideo._id);
        if (thumbNail) {
          uploadThumbnail(thumbNail[0], newVideo._id);
        }
        _.map(categories, async function (cat) {
          await categoryModel.findByIdAndUpdate(cat, {
            $push: { videos: savedVid._id },
          });
          await videoModel.findByIdAndUpdate(savedVid._id, {
            $push: { categories: cat },
          });
        });
        if (newVideo === savedVid) {
          sendResponse(res, OK, "success", savedVid, []);
        } else {
          throw new HttpException(409, "video upload failed");
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  saveShorts = async (req, res) => {
    const { file } = req.files;
    console.log(file);
    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const user = await userModel.findOne({ _id: verified["id"] });
        await notifications.createNotification({
          userId: verified["id"],
          triggerId: user._id,
          title: `Your spark video upload is in progress`,
          content: `spark upload started`,
          type: "regular",
          link: ``,
        });

        const shortVideo = new shorts({
          uploader: verified["id"],
        });
        // shortVideo.uploader = verified["id"];
        shortVideo.public_id = `kruzshorts/${shortVideo._id}`;
        const savedVid = await shortVideo.save();
        uploadShort(file[0], shortVideo._id);
        if (shortVideo === savedVid) {
          sendResponse(res, OK, "success", savedVid, []);
        } else {
          sendResponse(
            res,
            OK,
            "error",
            {},
            { msg: "unable to create content" }
          );
        }
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  likeVideo = async (req, res, next) => {
    try {
      const { videoId } = req.body;
      const user = req.user;

      const video = await videoModel.findOne({ _id: videoId });
      console.log(video);
      const isLiked = video.likes.find((id) => id.equals(user._id));
      let updatedVideo;

      if (isLiked) {
        const likes = video.likes.filter((id) => !id.equals(user._id));
        // console.log(likes);
        updatedVideo = await videoModel.findOneAndUpdate(
          { _id: video._id },
          {
            $set: {
              likes,
              likeCount: video.likeCount - 1,
            },
          },
          { new: true }
        );
      } else {
        console.log("out");
        updatedVideo = await videoModel.findOneAndUpdate(
          { _id: video._id },
          {
            $set: {
              likes: [...video.likes, user._id],
              likeCount: video.likeCount + 1,
            },
          },
          { new: true }
        );
        // if (
        //   updatedVideo?.user?._id.toString() === req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.user?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.user?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `You liked your comment on the video - '${updatedComment?.videoId?.title}'`,
        //       type: "Action",
        //       // link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // } else if (
        //   updatedComment?.commenterId?._id.toString() !== req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.commenterId?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.commenterId?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `${req.user.userName} liked your comment on ${updatedComment?.videoId?.title}`,
        //       type: "Action",
        //       link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // }
      }
      sendResponse(res, OK, "success", updatedVideo, []);
    } catch (error) {
      console.log(error);
      throw new HttpException(409, "couln't like coment", {});
    }
  };
  watchLater = async (req, res) => {
    const reqBody = { ...req.body };

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const user = await userModel.findOne({ _id: verified["id"] });
        const video = await videoModel.findOne({ _id: reqBody.id });

        if (user.watchLater && user.watchLater.length > 0) {
          const selected = user.watchLater.filter((like) =>
            like.equals(video._id)
          );
          if (selected.length === 0) {
            await userModel.findByIdAndUpdate(user._id, {
              $push: { watchLater: video._id },
            });
          }
        } else {
          await userModel.findByIdAndUpdate(user._id, {
            $push: { watchLater: video._id },
          });
        }
        const newvideo = await videoModel.findOne({ _id: reqBody.video });
        sendResponse(res, OK, "success", newvideo, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  removeWatchLater = async (req, res, next) => {
    const reqBody = { ...req.body };

    try {
      const user = req.user;
      const video = await videoModel.findOne({ _id: reqBody.id });

      const selected = user.watchLater.filter((like) => like.equals(video._id));
      if (selected.length > 0) {
        const other = user.watchLater.filter((like) => !like.equals(video._id));
        await userModel.findByIdAndUpdate(user._id, {
          watchLater: other,
        });
      }

      const newvideo = await videoModel.findOne({ _id: reqBody.video });
      sendResponse(res, OK, "success", newvideo, []);
    } catch (error) {
      console.log(error);
      next(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  hideVideoLike = async (req, res) => {
    // console.log(req.body)
    const videoId = req.body.id;

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const user = await userModel.findOne({ _id: verified["id"] });
        const video = await videoModel.findOne({ _id: videoId });
        video.showLike = !video.showLike;

        await video.save();
        sendResponse(res, OK, "success", video, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  toggleVideoComment = async (req, res) => {
    const videoId = req.body.id;

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const user = await userModel.findOne({ _id: verified["id"] });
        const video = await videoModel.findOne({ _id: videoId });
        video.commentable = !video.commentable;

        await video.save();
        sendResponse(res, OK, "success", video, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  viewVideo = async (req, res, next) => {
    const reqBody = { ...req.body };
    const user = req.user;
    try {
      const video = await videoModel.findOne({_id: reqBody.video})
      
      const isView = await videoViews.findOne({
        videoId: reqBody.video,
        user: user._id,
      });
   
      if (_.isEmpty(isView)) {
        await videoViews.create({
          user: user._id,
          videoId: reqBody.video,
          info: reqBody.info,
        })
        await videoModel.findByIdAndUpdate(reqBody.video,{views: video.views+1 });
      } 
      sendResponse(res, OK, "success", {}, []);
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  deleteVideo = async (req, res) => {
    const { id, type } = req.params;

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        if (type === "video") {
          const video = await videoModel.findOne({ _id: id });
          deleteVideo(video.public_id);
          await videoModel.deleteOne({
            _id: id,
            uploader: verified["id"],
          });
        } else {
          const video = await shorts.findOne({ _id: id });
          deleteVideo(video.public_id);
          await shorts.deleteOne({
            _id: id,
            uploader: verified["id"],
          });
        }
        // console.log(video.views);

        sendResponse(res, OK, "success", [], []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  deleteShort = async (req, res) => {
    const id = req.params;

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const video = await short.findOne({ _id: id });
        deleteVideo(video.public_id);
        await short.deleteOne({
          _id: id,
          uploader: verified["id"],
        });
        // console.log(video.views);

        sendResponse(res, OK, "success", [], []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  likeShort = async (req, res) => {
    const reqBody = { ...req.body };

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // const user = await userModel.findOne({_id:verified['id']});
        const video = await shorts.findOne({ _id: reqBody.video });
        console.log(video);
        if (video.likes) {
          const likes = video.likes.filter(
            (like) => like.id === verified["id"]
          );
          if (likes.length === 0) {
            await shorts.findByIdAndUpdate(video._id, {
              $push: { likes: { id: verified["id"], time: moment.now() } },
            });
          } else {
            const likey = video.likes.filter(
              (like) => !like.id === verified["id"]
            );
            video.likes = likey;
            await video.save();
          }
        } else {
          await shorts.findByIdAndUpdate(video._id, {
            $push: { likes: { id: verified["id"], time: moment.now() } },
          });
        }
        const newvideo = await shorts.findOne({ _id: reqBody.video });
        sendResponse(res, OK, "success", newvideo, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  viewShort = async (req, res) => {
    const reqBody = { ...req.body };
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // const user = await userModel.findOne({_id:verified['id']});
        const video = await shorts.findOne({ _id: reqBody.video });
        // console.log(video);
        if (video.views.length > 0) {
          const views = video.views.filter(
            (view) => view.id === verified["id"]
          );
          if (views.length === 0) {
            await shorts.findByIdAndUpdate(video._id, {
              $push: { views: { id: verified["id"], time: moment.now() } },
            });
          } else {
          }
        } else {
          await shorts.findByIdAndUpdate(video._id, {
            $push: { views: { id: verified["id"], time: moment.now() } },
          });
        }
        const newvideo = await shorts.findOne({ _id: reqBody.video });
        sendResponse(res, OK, "success", newvideo, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  watchLaterVideo = async (req, res) => {
    const reqBody = { ...req.body };

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // const user = await userModel.findOne({_id:verified['id']});
        const video = await shorts.findOne({ _id: reqBody.video });
        console.log(video);
        if (video.likes) {
          const likes = video.likes.filter((like) =>
            like.equals(verified["id"])
          );
          if (likes.length === 0) {
            await shorts.findByIdAndUpdate(video._id, {
              $push: { likes: verified["id"] },
            });
          } else {
            const likey = video.likes.filter(
              (like) => !like.equals(verified["id"])
            );
            video.likes = likey;
            await video.save();
          }
        } else {
          await shorts.findByIdAndUpdate(video._id, {
            $push: { likes: verified["id"] },
          });
        }
        const newvideo = await shorts.findOne({ _id: reqBody.video });
        sendResponse(res, OK, "success", newvideo, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  commentOnVideo = async (req, res, next) => {
    const reqBody = { ...req.body };
    console.log(req.user);
    try {
      const video = await videoModel.findOne({ _id: reqBody.videoId });
      const user = await userModel
        .findOne({ _id: reqBody.user._id })
        .select("_id name profilePics");
      reqBody.user = user;
      reqBody.videoId = reqBody.videoId;
      const comment = new videoComments(reqBody);
      //  console.log(video);
      await comment.save();
      sendResponse(res, OK, "success", comment, []);
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  async deleteComment(req, res, next) {
    const { commentId } = req.params;
    const userComment = await this.comment.findOneAndDelete({ _id: commentId });

    return userComment;
  }

  async likeComment(req, res, next) {
    try {
      const { commentId, userId } = req.body;

      const comment = await videocomments.findOne({ _id: commentId });
      const isLiked = comment.likes.find((id) => id.equals(userId));
      let updatedComment;

      if (isLiked) {
        const likes = comment.likes.filter((id) => !id.equals(userId));
        console.log(likes);
        updatedComment = await videocomments.findOneAndUpdate(
          { _id: comment._id },
          {
            $set: {
              likes,
              likeCount: comment.likeCount - 1,
            },
          },
          { new: true }
        );
      } else {
        console.log("out");
        updatedComment = await videocomments.findOneAndUpdate(
          { _id: comment._id },
          {
            $set: {
              likes: [...comment.likes, userId],
              likeCount: comment.likeCount + 1,
            },
          },
          { new: true }
        );
        // if (
        //   updatedComment?.user?._id.toString() === req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.user?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.user?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `You liked your comment on the video - '${updatedComment?.videoId?.title}'`,
        //       type: "Action",
        //       // link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // } else if (
        //   updatedComment?.commenterId?._id.toString() !== req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.commenterId?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.commenterId?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `${req.user.userName} liked your comment on ${updatedComment?.videoId?.title}`,
        //       type: "Action",
        //       link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // }
      }
      sendResponse(res, OK, "success", updatedComment, []);
    } catch (error) {
      console.log(error);
      throw new HttpException(409, "couln't like coment", {});
    }
  }

  async dislikeComment(req, res, next) {
    try {
      const { commentId, userId } = req.body;
      const comment = await videocomments.findOne({ _id: commentId });
      console.log(comment);
      const isDisliked = comment.dislikes.find((id) => id.equals(userId));
      let updatedComment;
      if (isDisliked) {
        updatedComment = await videocomments.findOneAndUpdate(
          { _id: comment._id },
          {
            $set: {
              dislikes: comment.dislikes.filter((id) => !id.equals(userId)),
              dislikeCount: comment.dislikeCount - 1,
            },
          },
          { new: true }
        );
      } else {
        updatedComment = await videocomments.findOneAndUpdate(
          { _id: comment._id },
          {
            $set: {
              dislikes: [...comment.dislikes, userId],
              dislikeCount: comment.dislikeCount + 1,
            },
          },
          { new: true }
        );
      }
      sendResponse(res, OK, "success", updatedComment, []);
    } catch (error) {
      console.log(error);
      throw new HttpException(409, "couln't unlike coment", {});
    }
  }

  async replyComment(req, res, next) {
    try {
      const { commentId, userId, reply } = req.body;

      const newreply = new replycomments({
        reply: reply.trim(),
        user: userId,
        commentId,
        likes: [],
        dislikes: [],
        likeCount: 0,
        dislikeCount: 0,
      }).save();

      sendResponse(res, OK, "success", newreply, []);
    } catch (error) {
      console.log(error);
      throw new HttpException(409, "couln't add reply", {});
    }

    // if (req.user._id !== updatedComment.user) {
    //   const userPreference = await this.preference.findOne({
    //     user: comment.commenterId?._id,
    //   });
    //   if (userPreference?.commentOnMyPost) {
    //     await this.userNotification.create({
    //       userId: comment.commenterId,
    //       triggerId: req.user._id,
    //       title: `New reply on your comment`,
    //       content: `${req.user?.userName} replied to your comment`,
    //       type: "Action",
    //       link: `/player/${updatedComment?.videoId?._id}/${updatedComment?.videoId?.uploader_id}?repId=${updatedComment._id}`,
    //     });
    //     global.io.emit("newnotification", "welldone");
    //   }
    // }
  }

  async dislikeReply(req, res, next) {
    const { replyId, userId, commentId } = req.body;
    try {
      const { replyId, userId } = req.body;

      const reply = await replycomments.findOne({ _id: replyId });
      const isDisLiked = reply.dislikes.find((id) => id.equals(userId));
      let updatedReply;

      if (isDisLiked) {
        const dislikes = reply.dislikes.filter((id) => !id.equals(userId));

        updatedReply = await replycomments.findOneAndUpdate(
          { _id: reply._id },
          {
            $set: {
              dislikes,
              dislikeCount: reply.dislikeCount - 1,
            },
          },
          { new: true }
        );
      } else {
        console.log("out");
        updatedReply = await replycomments.findOneAndUpdate(
          { _id: reply._id },
          {
            $set: {
              dislikes: [...reply.dislikes, userId],
              dislikeCount: reply.dislikeCount + 1,
            },
          },
          { new: true }
        );
        // if (
        //   updatedComment?.user?._id.toString() === req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.user?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.user?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `You liked your comment on the video - '${updatedComment?.videoId?.title}'`,
        //       type: "Action",
        //       // link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // } else if (
        //   updatedComment?.commenterId?._id.toString() !== req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.commenterId?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.commenterId?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `${req.user.userName} liked your comment on ${updatedComment?.videoId?.title}`,
        //       type: "Action",
        //       link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // }
      }
      sendResponse(res, OK, "success", updatedReply, []);
    } catch (error) {
      console.log(error);
      throw new HttpException(409, "couln't like coment", {});
    }
  }

  async likeReply(req, res, next) {
    try {
      const { replyId, userId } = req.body;

      const reply = await replycomments.findOne({ _id: replyId });
      const isLiked = reply.likes.find((id) => id.equals(userId));
      let updatedReply;

      if (isLiked) {
        const likes = reply.likes.filter((id) => !id.equals(userId));

        updatedReply = await replycomments.findOneAndUpdate(
          { _id: reply._id },
          {
            $set: {
              likes,
              likeCount: reply.likeCount - 1,
            },
          },
          { new: true }
        );
      } else {
        console.log("out");
        updatedReply = await replycomments.findOneAndUpdate(
          { _id: reply._id },
          {
            $set: {
              likes: [...reply.likes, userId],
              likeCount: reply.likeCount + 1,
            },
          },
          { new: true }
        );
        // if (
        //   updatedComment?.user?._id.toString() === req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.user?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.user?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `You liked your comment on the video - '${updatedComment?.videoId?.title}'`,
        //       type: "Action",
        //       // link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // } else if (
        //   updatedComment?.commenterId?._id.toString() !== req.user._id.toString()
        // ) {
        //   const userPreference = await this.preference.findOne({
        //     user: updatedComment?.commenterId?._id,
        //   });
        //   if (userPreference?.likeMyComment) {
        //     await this.userNotification.create({
        //       userId: updatedComment?.commenterId?._id,
        //       triggerId: req.user._id,
        //       title: `New like on your comment`,
        //       content: `${req.user.userName} liked your comment on ${updatedComment?.videoId?.title}`,
        //       type: "Action",
        //       link: `/player/${updatedComment.videoId._id}/${updatedComment?.videoId?.uploader_id}`,
        //     });
        //     global.io.emit("newnotification", "welldone");
        //   }
        // }
      }
      sendResponse(res, OK, "success", updatedReply, []);
    } catch (error) {
      console.log(error);
      throw new HttpException(409, "couln't like coment", {});
    }
  }

  async deleteReply(req, res, next) {
    const { replyId, commentId } = req.body;
    const comment = await this.comment.findOne({ _id: commentId });
    const updatedComment = await this.comment.findOneAndUpdate(
      { _id: commentId },
      {
        $set: {
          replies: comment.replies.filter((each) => !each._id.equals(replyId)),
        },
      },
      { new: true }
    );
    return updatedComment;
  }
  commentOnShort = async (req, res) => {
    const reqBody = { ...req.body };

    try {
      const authToken = req.headers.authorization;
      const token = authToken.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // console.log(reqBody)
        const video = await shorts.findOne({ _id: reqBody.videoId });
        const user = await userModel
          .findOne({ _id: reqBody.user._id })
          .select("_id name profilePics");
        reqBody.user = user;
        reqBody.videoId = video._id;
        const comment = new shortComments(reqBody);
        //  console.log(video);
        await comment.save();
        sendResponse(res, OK, "success", comment, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getVideoComments = async (req, res) => {
    try {
      const page = +req.query.page;
      const limit = +req.query.limit;

      console.log(limit);

      const counter = await videoComments.find({ videoId: req.params.id });
      const comments = videoComments
        .find({ videoId: req.params.id })
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          model: userModel,
          select: "profilePics username",
        });
      if (comments) {
        const { data, totalContent, totalPages } = await functionPaginate(
          page,
          limit,
          comments,
          counter.length
        );
        console.log(data);
        sendResponse(
          res,
          OK,
          "success",
          { comments: data, totalContent, totalPages },
          []
        );
        // sendResponse(res, OK, "success", related, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getCommentReplies = async (req, res) => {
    try {
      const page = +req.query.page;
      const limit = +req.query.limit;

      console.log(limit);

      const counter = await replycomments.find({ commentId: req.params.id });
      const replies = replycomments
        .find({ commentId: req.params.id })
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          model: userModel,
          select: "profilePics username",
        });
      if (replies) {
        const { data, totalContent, totalPages } = await functionPaginate(
          page,
          limit,
          replies,
          counter.length
        );
        console.log(data);
        sendResponse(
          res,
          OK,
          "success",
          { replies: data, totalContent, totalPages },
          []
        );
        // sendResponse(res, OK, "success", related, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getCommentRepliesCount = async (req, res) => {
    try {
      const counter = await replycomments.find({ commentId: req.params.id });

      sendResponse(res, OK, "success", counter.length, []);
      // sendResponse(res, OK, "success", related, []);
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getShortComments = async (req, res) => {
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // console.log(reqBody)

        const comments = await shortComments.find({ videoId: req.params.id });
        console.log(comments);
        sendResponse(res, OK, "success", comments, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getShortInfo = async (req, res) => {
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // console.log(reqBody)

        const short = await shorts.findOne({ _id: req.params.id });
        // console.log(short);
        sendResponse(res, OK, "success", short, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getVideoInfo = async (req, res) => {
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        // console.log(reqBody)

        const video = await videoModel.findOne({ _id: req.params.id });
        // console.log(video);
        sendResponse(res, OK, "success", video, []);
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getRelated = async (req, res) => {
    const { id } = req.params;
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];
    const page = +req.query.page;
    const limit = +req.query.limit;
    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const video = await videoModel.findOne({ _id: id });
        // console.log(video);
        const related = [];
        // const video = await videoModel.find({})
        // await Promise.all(
        //   _.map(video.categories, async (category) => {
        //     console.log(category);
        //     const cat = await categoryModel
        //       .findOne({ _id: category })
        //       .populate("videos")
        //       .exec();
        //     if (cat) {
        //       cat.videos.map(async (video) => {
        //         const hasVideo = related.filter((temp) =>
        //           temp._id.equals(video._id)
        //         );
        //         if (hasVideo.length > 0) {
        //         } else {
        //           related.push(video);
        //         }
        //       });
        //     }
        //     // console.log(related);
        //   })
        // );
        const videos = videoModel
          .aggregate([{ $sample: { size: 20 } }])
          .match({ video: { $ne: null } });

        if (videos) {
          const { data, totalContent, totalPages } = await functionPaginate(
            page,
            limit,
            videos,
            videoModel
          );
          sendResponse(
            res,
            OK,
            "success",
            { related: data, totalContent, totalPages },
            []
          );
          // sendResponse(res, OK, "success", related, []);
        }
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getMyRelated = async (req, res) => {
    const { id } = req.params;
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];
    const page = +req.query.page;
    const limit = +req.query.limit;
    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const videoLength = await videoModel.find({
          uploader: id,
          video: { $ne: null },
        });
        const videos = videoModel.find({ uploader: id }).sort({ createdAt: 1 });

        // console.log(videos);
        if (videos) {
          const { data, totalContent, totalPages } = await functionPaginate(
            page,
            limit,
            videos,
            videoLength.length
          );
          sendResponse(
            res,
            OK,
            "success",
            { related: data, totalContent, totalPages },
            []
          );
          // sendResponse(res, OK, "success", related, []);
        }
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };
  getUploader = async (req, res) => {
    const { id } = req.params;
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const user = await userModel.findOne({ _id: id });

        console.log(user);
        if (user) {
          sendResponse(res, OK, "success", user, []);
        }
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };

  //   functions for livestreaming
  createStreamAsset = async (req, res) => {
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];

    try {
      const verified = jwt.verify(token, process.env.JWT_TOKEN);
      if (!verified["id"] || !authToken) {
        sendResponse(res, UNAUTHORIZED, "error", {});
      } else {
        const user = await userModel.findOne({ _id: verified["id"] });

        const response = await Video.LiveStreams.create({
          playback_policy: "",
          new_asset_settings: { playback_policy: "" },
        });
        console.log(response.playback_ids[0]);
        const stream = new streamModel({
          streamer: verified["id"],
          streamkey: response.stream_key,
          type: req.body.type,
          price: req.body.price,
          playbackId: response.playback_ids[0].id,
        });
        stream.save();
      }
    } catch (error) {
      console.log(error);
      sendResponse(res, OK, "error", {}, []);
    }
  };

  webhookVideo = async (req, res) => {
    webhooksModel.create({ activities: req.body });
    const {
      public_id,
      notification_type,
      original_filename,
      resource_type,
      secure_url,
      eager,
      folder,
    } = req.body;
    let user;
    if (notification_type === "upload") {
      if (public_id.includes("kruzvideos")) {
        console.log(public_id);
        const video = await videoModel.findOne({ public_id: public_id });
        video.video = secure_url;
        video.save();
        user = await userModel.findOne({ _id: video.uploader });
        await notifications.createNotification({
          userId: verified["id"],
          triggerId: user._id,
          title: `Your video ${video.description} has been uploaded successfully`,
          content: `Video Upload completed`,
          type: "regular",
          link: ``,
        });
        await sendPushMessage(user?.fcmToken, {
          title: "Upload Information",
          message: `Your video ${video.description} has been uploaded successfully`,
        });
      } else if (public_id.includes("kruzshorts")) {
        const video = await shorts.findOne({ public_id: public_id });
        video.video = secure_url;
        user = userModel.findOne({ _id: video.uploader });
        video.save();
        user = await userModel.findOne({ _id: video.uploader });
        await notifications.createNotification({
          userId: verified["id"],
          triggerId: user._id,
          title: `Your Spark has been uploaded successfully`,
          content: `Spark Upload completed`,
          type: "regular",
          link: ``,
        });
        await sendPushMessage(user?.fcmToken, {
          title: "Upload Information",
          message: `Your spark video ${video.description} has been uploaded successfully`,
        });
      } else if (resource_type === "image" && folder === "thumbnails") {
        const video = await videoModel.findOne({ public_id: public_id });
        video.thumbnail = secure_url;
        video.save();
      }
    }
    res.send(200);
  };
  sendMultiplePushNotification = (user) =>{

  }
}

module.exports = new AppVideo();
