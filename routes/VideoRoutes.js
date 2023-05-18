var express = require("express");
const AppVideo = require("../controllers/videoController");
var videoRouter = express.Router();

const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = multer({ dest: "uploads/" });

const appTokenMiddleware = require("../middlewares/appTokenValidation");

/* GET users listing. */
videoRouter.post(
  "/save/video",
  appTokenMiddleware,
  upload.fields([{ name: "file" }, { name: "thumbNail" }]),
  AppVideo.saveVideo
);
videoRouter.post("/upload",AppVideo.webhookVideo);
videoRouter.post(
  "/view",
  authMiddleware,
  appTokenMiddleware,
  AppVideo.viewVideo
);
videoRouter.post("/shorts/view", appTokenMiddleware, AppVideo.viewShort);
// videoRouter.post("/create/stream",appTokenMiddleware, AppVideo.createStreamAsset);
videoRouter.post(
  "/save/short",
  appTokenMiddleware,
  upload.fields([{ name: "file" }]),
  AppVideo.saveShorts
);
videoRouter.get("/get/related/:id", appTokenMiddleware, AppVideo.getRelated);
videoRouter.get(
  "/get/myrelated/:id",
  appTokenMiddleware,
  AppVideo.getMyRelated
);
videoRouter.get("/get/uploader/:id", appTokenMiddleware, AppVideo.getUploader);
videoRouter.post(
  "/like",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.likeVideo
);
videoRouter.post(
  "/like/comment",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.likeComment
);
videoRouter.post(
  "/dislike/comment",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.dislikeComment
);
videoRouter.post(
  "/reply/comment",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.replyComment
);
videoRouter.post(
  "/dislike/reply",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.dislikeReply
);
videoRouter.post(
  "/like/reply",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.likeReply
);
videoRouter.post("/watchLater", appTokenMiddleware, AppVideo.watchLater);
videoRouter.post(
  "/remove/watchLater",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.removeWatchLater
);
videoRouter.post("/like/short", appTokenMiddleware, AppVideo.likeShort);
videoRouter.get("/short/info/:id", appTokenMiddleware, AppVideo.getShortInfo);
videoRouter.get(
  "/video/delete/:id/:type",
  appTokenMiddleware,
  AppVideo.deleteVideo
);
videoRouter.get("/delete/short/:id", appTokenMiddleware, AppVideo.deleteShort);
videoRouter.get("/video/info/:id", appTokenMiddleware, AppVideo.getVideoInfo);
videoRouter.post(
  "/comment",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.commentOnVideo
);
videoRouter.post("/comment/short", appTokenMiddleware, AppVideo.commentOnVideo);
videoRouter.post(
  "/toggle/video/likes",
  appTokenMiddleware,
  AppVideo.hideVideoLike
);
videoRouter.post(
  "/toggle/video/comments",
  appTokenMiddleware,
  AppVideo.toggleVideoComment
);
videoRouter.get(
  "/get/comments/:id",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.getVideoComments
);
videoRouter.get(
  "/get/view/analytics/:id",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.getVideoAnalytics
);
videoRouter.get(
  "/get/comments/replies/:id",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.getCommentReplies
);
videoRouter.get(
  "/get/comments/replies/count/:id",
  appTokenMiddleware,
  authMiddleware,
  AppVideo.getCommentRepliesCount
);
videoRouter.get(
  "/get/shorts/comments/:id",
  appTokenMiddleware,
  AppVideo.getShortComments
);

module.exports = videoRouter;
