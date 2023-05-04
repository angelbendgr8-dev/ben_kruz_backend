var express = require("express");
const Home = require("../controllers/homeController");
const authMiddleware = require("../middlewares/auth.middleware");
var homeRouter = express.Router();

/* GET users listing. */
homeRouter.post("/save/subscription", Home.saveSubscription);
homeRouter.post("/save/preferences", Home.savePreferences);
homeRouter.post(
  "/update/language/preferences",
  Home.updateLanguagesPreferences
);
homeRouter.post("/save/token", Home.saveToken);
homeRouter.post("/update/preferences", Home.updatePreferences);
homeRouter.get("/create/category", Home.createCategory);
homeRouter.get("/get/categories", Home.getCategories);
homeRouter.get("/get/my/categories", authMiddleware, Home.getMyCategories);
homeRouter.post("/follow/user", Home.followUser);
homeRouter.get(
  "/get/category/videos/:title",
  authMiddleware,
  Home.getCategoryVideos
);
homeRouter.get("/get/languages", Home.getLanguages);
homeRouter.get("/get/videos", Home.getVideos);
homeRouter.get("/get/recent/videos", Home.getRecent);
homeRouter.get("/get/short_videos", Home.getShorts);
homeRouter.get("/get/languages", Home.getLanguages);
homeRouter.get("/get/my/videos/:id", Home.getMyVideos);
homeRouter.get("/get/video/:id", Home.getSingleVideoById);
homeRouter.get("/get/my/short_videos", Home.getMyShorts);
homeRouter.get("/get/short_video/:id", Home.getSingleShortById);
homeRouter.get("/get/short_videos/:id", Home.getShortsById);
homeRouter.get("/get/videos/:id", Home.getVideosById);
homeRouter.get("/get/liked_videos", Home.getLikedVideos);
homeRouter.get("/get/watch/list", Home.getWatchList);
homeRouter.post("/search/video", Home.searchContent);
homeRouter.post("/search/profile", Home.searchProfile);
homeRouter.post("/add/history", authMiddleware, Home.addHistory);
homeRouter.get("/get/history", authMiddleware, Home.getHistory);
homeRouter.post("/delete/history", authMiddleware, Home.deleteHistory);
homeRouter.post("/end/subscription", authMiddleware, Home.endSubscription);

homeRouter.get(`/user/:id`, Home.getUserById);

module.exports = homeRouter;
