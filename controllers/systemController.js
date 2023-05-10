
const express = require('express');
const { saveToDatabase, sendResponse } = require('../helpers/functions');
var jwt = require('jsonwebtoken');
const {StatusCodes} = require('http-status-codes');
const users = require('../models/admins');
const moment = require('moment');
const videoController = require('../controllers/videoController')

const { BAD_REQUEST, OK, UNAUTHORIZED, CREATED, SERVICE_UNAVAILABLE } = StatusCodes;

class System {

/**
 * Update User Profile function
 * @param req 
 * @param res 
 */
 getLinks = async (req, res) => {
        
    const user = req.user;
    await videoController.sendMultiplePushNotification(user,'short');
    // res.json(links);
    
}


}

module.exports = new System();
