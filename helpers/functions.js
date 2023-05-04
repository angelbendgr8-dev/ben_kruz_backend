const bcrypt = require('bcrypt');
const { pwdSaltRounds, url } = require('./constants');
const admin = require("firebase-admin");

const FCMserviceAccount = require('../kruz_firebase_admin.json');
const serviceAccount = FCMserviceAccount;
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const credentials = {
    apiKey: process.env.AFRICAS_TALKING_API_KEY,         
    username: 'sandbox',     
  };

const Africastalking = require('africastalking');


const at = Africastalking(credentials);
const sms = at.SMS;


async function saveToDatabase(model) {
    try {
        return await model.save();
    } catch (e) {
        console.log(e);
        return Error(e)
    } 
}

function sendResponse(res, code, status, data,errors) {
    res.status(code).json({
        code,
        status,
        data,
        errors
    })
}
const genHash = async (value) => {
    const salt = await bcrypt.genSalt(pwdSaltRounds)
    const hash = await bcrypt.hashSync(value, salt);
    return hash;

}

const sendMail = async (templateName,subject,options) =>{

    mg.messages.create('sandbox5e6c2fd68d2b4ed4845d0c0b806d0b56.mailgun.org', {
        from: "ogunmakinjuolanrewajuofficial@gmail.com",
        to: options.email,
        subject: subject,
        template: templateName,
        'h:X-Mailgun-Variables': JSON.stringify(options),
      })
      .then(msg => console.log(msg)) // logs response data
      .catch(err => console.log(err)); // logs any error
    
}
const sendSms = async (mobileNumber,secret) => {
   
        const options = {
          to: `+${mobileNumber}`,
          message: `your otp-token for Kruz request is ${secret}`,
        }
    const result = await sms.send(options);
    return result;
}
const  sendPushMessage = (token, data) => {
    admin.messaging().send({
        token: token,
        data: {
            customData: "Deneme",
            id: "1",
            ad: "Yasin",
            subTitle: "Kruz",
            type: data.type ? data.type : '',
        },
        notification: {
            body: data.message,
            title: data.title
        },
        android: {
            notification: {
                body: data.message,
                title: data.title,
                color: "#fff566",
                priority: "high",
                sound: "default",
                vibrateTimingsMillis: [200, 500, 800],

            }
        },

    }).then((msg) => {
        console.log(msg)
    })
}
const  sendMultiPushMessage = (tokens, data) => {
    admin.messaging().sendMulticast({
        tokens: tokens,
        data: {
            customData: "Deneme",
            id: "1",
            ad: "Yasin",
            subTitle: "Kruz",
            type: data.type ? data.type : '',
        },
        notification: {
            body: data.message,
            title: data.title
        },
        android: {
            notification: {
                body: data.message,
                title: data.title,
                color: "#fff566",
                priority: "high",
                sound: "default",
                vibrateTimingsMillis: [200, 500, 800],

            }
        },

    }).then((msg) => {
        console.log(msg)
    })
}
module.exports = {
    saveToDatabase,
    sendResponse,
    genHash,
    sendMail,
    sendSms,
    sendPushMessage,
    sendMultiPushMessage,
}