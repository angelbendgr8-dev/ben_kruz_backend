var express = require("express");
const walletController = require("../controllers/walletController");
const { validate } = require("../validations/validate");

const authMiddleware = require("../middlewares/auth.middleware");
const { depositToWallet } = require("../validations/walletValidation");
var walletRouter = express.Router();

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api

walletRouter.get("/", walletController.getWallet);
walletRouter.post(
  "/deposit",
  validate(depositToWallet),
  walletController.depositToWallet
);
walletRouter.get("/transfer/subscribe", walletController.transferForSubscribe);
walletRouter.get("/fetch/transactions", walletController.fetchTransactions);
walletRouter.post(
  "/get/security/otp",
  authMiddleware,
  walletController.preBeneficiary
);
walletRouter.post(
  "/create/beneficiary",
  authMiddleware,
  walletController.createBeneficiary
);

module.exports = walletRouter;
