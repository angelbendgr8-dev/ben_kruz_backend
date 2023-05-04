
const {body} = require("express-validator");

const depositToWallet =[
   
    body('amount').isInt(),
    body('description').isString().trim().escape(),
    body('reference').isString().trim().escape(),
      
  ]

  module.exports ={
    depositToWallet
  }