const express = require('express');
const { validationResult, ValidationChain } = require('express-validator');
const { BAD_REQUEST } = require('http-status-codes');
const HttpException = require('../helpers/HttpException');
// can be reused by many routes

// parallel processing
const validate = validations => {
  
  return async (req, res, next) => {
    try {
      
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const {errors} = validationResult(req);
      console.log(errors[0]);
      if (errors.length === 0) {
        return next();
      }
  
      throw new HttpException(409,errors[0].msg,errors)
    } catch (error) {
        next(error)
    }
    
  };
};

module.exports = {validate}