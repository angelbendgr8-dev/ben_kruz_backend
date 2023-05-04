var express = require('express');
var userRouter = express.Router();

/* GET users listing. */
userRouter.post('/save/subscription', Home.saveSubscription);
userRouter.post('/save/preferences', Home.savePreferences);
userRouter.get(`$user/:id`, Home.getUserById);

module.exports = userRouter;
