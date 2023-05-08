const user = require("../models/user");

const {body} = require("express-validator");
const HttpException = require("../helpers/HttpException");


const loginValidation = [
    body('email').isString().trim().custom(value => {
      return user.findOne({$or:[
                                {email:  value.toLocaleLowerCase().trim()},
                                {username:  value.toLocaleLowerCase().trim()},
                              ]}).then(user => {
            if (!user) {
             throw new HttpException(419,'Email address or username not found. Please enter a valid email address or create a new account.',{});
            }
          });
        }),
    body('password').isString().trim().escape(),
]
const registerValidation =[
    body('email').isEmail().withMessage('supply a valid email').custom(value => {
        return user.findOne({ email:  value.toLocaleLowerCase().trim() }).then(user => {
          if (user) {
            return Promise.reject('User with Email already exist');
          }
        });
    }),
    body('username').isString().custom(value => {
        return user.findOne({ username:  value.toLocaleLowerCase().trim() }).then(user => {
          if (user) {
            return Promise.reject('Username already exist');
          }
        });
    }),
    body('name').isString().trim().escape(),
    body('password').isString().trim().escape(),

]

const passwordResetValidation =[
   
    body('email','Email is required').isEmail().normalizeEmail().custom(value => {
      return user.findOne({ email: value }).then(user => {
        // console.log(user);
        if (!user) {
          return Promise.reject('E-mail Not Found');
        }
      });
    }),
    
]
const confirmPasswordResetValidation =[
  body('email','Email is required').isEmail().normalizeEmail(),
  body('password').isString().trim().escape(),
    
]

module.exports = {
    loginValidation,
    registerValidation,
    passwordResetValidation,
    confirmPasswordResetValidation,
}
