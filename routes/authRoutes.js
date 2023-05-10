var express = require('express')
const { validate } = require('../validations/validate')
var auth = express.Router()
const Auth = require('../controllers/authController')
const { loginValidation, passwordResetValidation, registerValidation, confirmPasswordResetValidation } = require('../validations/authValidation')
const appTokenMiddleware = require('../validations/appTokenValidation');

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api
auth.post('/login',appTokenMiddleware, validate(loginValidation),Auth.login);
auth.post('creator/register',Auth.register);
// define the register api
auth.post('/register',appTokenMiddleware, validate(registerValidation),Auth.register);
auth.post('/validate',appTokenMiddleware, validate(registerValidation),Auth.validate);
auth.post('/reset/password',appTokenMiddleware, validate(passwordResetValidation),Auth.passwordReset);
auth.post('/password-reset',appTokenMiddleware, validate(confirmPasswordResetValidation),Auth.confirmPasswordReset);
auth.get("/confirm/:confirmationCode",appTokenMiddleware, Auth.verifyUser);
auth.post("/confirm/otp",appTokenMiddleware, Auth.confirmOtp);
auth.post("/verify/mobile",appTokenMiddleware, Auth.verifyMobile);
// auth.post('/send/otp', Auth.verifyMobile);

module.exports = auth;