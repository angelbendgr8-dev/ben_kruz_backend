var express = require("express");
const walletController = require("../controllers/walletController");
const { validate } = require("../validations/validate");

const authMiddleware = require("../middlewares/auth.middleware");
const { depositToWallet } = require("../validations/walletValidation");
var walletRouter = express.Router();

const appTokenMiddleware = require("../middlewares/appTokenValidation");

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api

walletRouter.get("/", appTokenMiddleware, walletController.getWallet);
walletRouter.post(
  "/deposit",
  appTokenMiddleware,
  validate(depositToWallet),
  walletController.depositToWallet
);
walletRouter.get(
  "/transfer/subscribe",
  appTokenMiddleware,
  walletController.transferForSubscribe
);
walletRouter.get(
  "/fetch/transactions",
  appTokenMiddleware,
  walletController.fetchTransactions
);
walletRouter.post(
  "/get/security/otp",
  appTokenMiddleware,
  authMiddleware,
  walletController.preBeneficiary
);
walletRouter.post(
  "/create/beneficiary",
  appTokenMiddleware,
  authMiddleware,
  walletController.createBeneficiary
);

module.exports = walletRouter;
