var express = require('express')
var setting = express.Router()
const { 
    updateProfileName, 
    updateProfilePics,
    updateProfileMobileNumber, 
    changePassword,
    updateNotificationStatus
} = require('../controllers/settingsController');
const { createTemplate, getTemplate } = require('../services/ses.service');

// middleware that is specific to this router
// auth.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// define the for login api

setting.post('/update/profile/name',updateProfileName);
setting.post('/update/profile/number',updateProfileMobileNumber);
setting.post('/update/profile/pics',updateProfilePics);
setting.post('/change/password',changePassword);
setting.get('/create/template',createTemplate);
setting.get('/get/template',getTemplate);
setting.post('/update/notification',updateNotificationStatus);

module.exports = setting;