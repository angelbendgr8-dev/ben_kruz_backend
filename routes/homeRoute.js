var express = require("express");
const Home = require("../controllers/homeController");
const authMiddleware = require("../middlewares/auth.middleware");
var homeRouter = express.Router();

const appTokenMiddleware = require("../middlewares/appTokenValidation");

/* GET users listing. */
homeRouter.post(
  "/save/subscription",
  appTokenMiddleware,
  Home.saveSubscription
);
homeRouter.post("/save/preferences", appTokenMiddleware, Home.savePreferences);
homeRouter.post(
  "/update/language/preferences",
  appTokenMiddleware,
  Home.updateLanguagesPreferences
);
homeRouter.post("/save/token", appTokenMiddleware, Home.saveToken);
homeRouter.post(
  "/update/preferences",
  appTokenMiddleware,
  Home.updatePreferences
);
homeRouter.get("/create/category", appTokenMiddleware, Home.createCategory);
homeRouter.get("/get/categories", appTokenMiddleware, Home.getCategories);
homeRouter.get(
  "/get/my/categories",
  appTokenMiddleware,
  authMiddleware,
  Home.getMyCategories
);
homeRouter.post("/follow/user", appTokenMiddleware, Home.followUser);
homeRouter.get(
  "/get/category/videos/:title",
  authMiddleware,
  appTokenMiddleware,
  Home.getCategoryVideos
);
homeRouter.get("/get/languages", appTokenMiddleware, Home.getLanguages);
homeRouter.get("/get/videos", appTokenMiddleware,authMiddleware, Home.getVideos);
homeRouter.get("/get/recent/videos", appTokenMiddleware,authMiddleware, Home.getRecent);
homeRouter.get("/get/short_videos", appTokenMiddleware, Home.getShorts);
homeRouter.get("/get/languages", appTokenMiddleware, Home.getLanguages);
homeRouter.get("/get/my/videos/:id", appTokenMiddleware, Home.getMyVideos);
homeRouter.get("/get/video/:id", appTokenMiddleware, Home.getSingleVideoById);
homeRouter.get("/get/my/short_videos", appTokenMiddleware, Home.getMyShorts);
homeRouter.get(
  "/get/short_video/:id",
  appTokenMiddleware,
  Home.getSingleShortById
);
homeRouter.get("/get/short_videos/:id", appTokenMiddleware, Home.getShortsById);
homeRouter.get("/get/videos/:id", appTokenMiddleware, Home.getVideosById);
homeRouter.get("/get/liked_videos", appTokenMiddleware, Home.getLikedVideos);
homeRouter.get("/get/watch/list", appTokenMiddleware, Home.getWatchList);
homeRouter.post("/search/video", appTokenMiddleware, Home.searchContent);
homeRouter.post("/search/profile", appTokenMiddleware, Home.searchProfile);
homeRouter.post(
  "/add/history",
  appTokenMiddleware,
  authMiddleware,
  Home.addHistory
);
homeRouter.get(
  "/get/history",
  appTokenMiddleware,
  authMiddleware,
  Home.getHistory
);
homeRouter.post(
  "/delete/history",
  appTokenMiddleware,
  authMiddleware,
  Home.deleteHistory
);
homeRouter.post(
  "/end/subscription",
  appTokenMiddleware,
  authMiddleware,
  Home.endSubscription
);
homeRouter.post(
  "/check/subscriptions",
  appTokenMiddleware,
  authMiddleware,
  Home.checkSubscriptions
);
homeRouter.get(`/user/:id`, appTokenMiddleware, Home.getUserById);
homeRouter.get(
  "/get/user/analytics",
  appTokenMiddleware,
  authMiddleware,
  Home.profileAnalysis);
homeRouter.get(
  "/get/followers",
  appTokenMiddleware,
  authMiddleware,
  Home.getFollowers);
homeRouter.get(
  "/get/subscriptions",
  appTokenMiddleware,
  authMiddleware,
  Home.getSubScribers);

module.exports = homeRouter;
