var express = require('express');
var userRouter = express.Router();

const appTokenMiddleware = require("../middlewares/appTokenValidation");
/* GET users listing. */
userRouter.post('/save/subscription',appTokenMiddleware, Home.saveSubscription);
userRouter.post('/save/preferences',appTokenMiddleware, Home.savePreferences);
userRouter.get(`$user/:id`,appTokenMiddleware, Home.getUserById);

module.exports = userRouter;
