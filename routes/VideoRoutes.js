var express = require("express");
const AppVideo = require("../controllers/videoController");
var videoRouter = express.Router();

const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = multer({ dest: "uploads/" });

/* GET users listing. */
videoRouter.post(
  "/save/video",
  upload.fields([{ name: "file" }, { name: "thumbNail" }]),
  AppVideo.saveVideo
);
videoRouter.post("/upload", AppVideo.webhookVideo);
videoRouter.post("/view",authMiddleware, AppVideo.viewVideo);
videoRouter.post("/shorts/view", AppVideo.viewShort);
videoRouter.post("/create/stream", AppVideo.createStreamAsset);
videoRouter.post(
  "/save/short",
  upload.fields([{ name: "file" }]),
  AppVideo.saveShorts
);
videoRouter.get("/get/related/:id", AppVideo.getRelated);
videoRouter.get("/get/myrelated/:id", AppVideo.getMyRelated);
videoRouter.get("/get/uploader/:id", AppVideo.getUploader);
videoRouter.post("/like", authMiddleware, AppVideo.likeVideo);
videoRouter.post("/like/comment", authMiddleware, AppVideo.likeComment);
videoRouter.post("/dislike/comment", authMiddleware, AppVideo.dislikeComment);
videoRouter.post("/reply/comment", authMiddleware, AppVideo.replyComment);
videoRouter.post("/dislike/reply", authMiddleware, AppVideo.dislikeReply);
videoRouter.post("/like/reply", authMiddleware, AppVideo.likeReply);
videoRouter.post("/watchLater", AppVideo.watchLater);
videoRouter.post(
  "/remove/watchLater",
  authMiddleware,
  AppVideo.removeWatchLater
);
videoRouter.post("/like/short", AppVideo.likeShort);
videoRouter.get("/short/info/:id", AppVideo.getShortInfo);
videoRouter.get("/video/delete/:id/:type", AppVideo.deleteVideo);
videoRouter.get("/delete/short/:id", AppVideo.deleteShort);
videoRouter.get("/video/info/:id", AppVideo.getVideoInfo);
videoRouter.post("/comment", authMiddleware, AppVideo.commentOnVideo);
videoRouter.post("/comment/short", AppVideo.commentOnVideo);
videoRouter.post("/toggle/video/likes", AppVideo.hideVideoLike);
videoRouter.post("/toggle/video/comments", AppVideo.toggleVideoComment);
videoRouter.get("/get/comments/:id", authMiddleware, AppVideo.getVideoComments);
videoRouter.get(
  "/get/comments/replies/:id",
  authMiddleware,
  AppVideo.getCommentReplies
);
videoRouter.get(
  "/get/comments/replies/count/:id",
  authMiddleware,
  AppVideo.getCommentRepliesCount
);
videoRouter.get("/get/shorts/comments/:id", AppVideo.getShortComments);

module.exports = videoRouter;
