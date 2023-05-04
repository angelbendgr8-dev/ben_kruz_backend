var express = require('express')
const { validate } = require('../validations/validate')
var auth = express.Router()
const Auth = require('../controllers/authController')
const { loginValidation, passwordResetValidation, registerValidation, confirmPasswordResetValidation } = require('../validations/authValidation')

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api
auth.post('/login', validate(loginValidation),Auth.login);
auth.post('creator/register',Auth.register);
// define the register api
auth.post('/register', validate(registerValidation),Auth.register);
auth.post('/validate', validate(registerValidation),Auth.validate);
auth.post('/reset/password', validate(passwordResetValidation),Auth.passwordReset);
auth.post('/password-reset', validate(confirmPasswordResetValidation),Auth.confirmPasswordReset);
auth.get("/confirm/:confirmationCode", Auth.verifyUser);
auth.post("/confirm/otp", Auth.confirmOtp);
auth.post("/verify/mobile", Auth.verifyMobile);
// auth.post('/send/otp', Auth.verifyMobile);

module.exports = auth;