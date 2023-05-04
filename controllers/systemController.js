
const express = require('express');
const { saveToDatabase, sendResponse } = require('../helpers/functions');
var jwt = require('jsonwebtoken');
const {StatusCodes} = require('http-status-codes');
const users = require('../models/admins');
const moment = require('moment');


const { BAD_REQUEST, OK, UNAUTHORIZED, CREATED, SERVICE_UNAVAILABLE } = StatusCodes;

class System {

/**
 * Update User Profile function
 * @param req 
 * @param res 
 */
 getLinks = async (req, res) => {
        
    const links = await users.findOne({is_admin:1}).select('terms helpdesk privacy');
    // res.json(links);
    if(links){
        sendResponse(res, OK, 'success', links, [])
    }else{
        sendResponse(res, OK, 'error', [], [{'msg':'Links not found','params':'system'}])
    }
}


}

module.exports = new System();
