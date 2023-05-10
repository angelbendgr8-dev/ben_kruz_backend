var express = require('express');
const systemController = require('../controllers/systemController');
const authMiddleware = require('../middlewares/auth.middleware');
var systemRouter = express.Router();

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api

systemRouter.get('/get/links',authMiddleware,systemController.getLinks);

module.exports = systemRouter;