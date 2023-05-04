const HttpException = require('../helpers/HttpException');
const AWS = require("aws-sdk");
const { hash } = require('bcrypt');

AWS.config.update({ region: "us-east-2" });

async function sendOtp(mobile_number, otp_code) {
  if (!(mobile_number))
    throw new HttpException(400, "data can't be empty", {});
  const params = {
    Message: `TEXT_MESSAGE : ${otp_code}` /* required */,
    PhoneNumber: mobile_number,
  };
  // Create the promise and SES service object
  const sendPromise = new AWS.SNS({ apiVersion: "2010-03-31" })
    .publish(params)
    .promise();
  const response = sendPromise
    .then(function (data) {
      console.log(data);
      console.log(
        `Message ${params.Message} sent to the topic ${params.PhoneNumber}`
      );
      // console.log("MessageID is " + data.MessageId);
      return true;
    })
    .catch(function (err) {
      console.log(err);
      throw new HttpException(500, "unable to send otp, please try again", {});
    });
  return response;
}
async function generateMobileOtp() {
  // console.log(mobile_number);
  const otp_code = Math.random().toString().substring(2, 8);
  const otp_hash = await hash(otp_code, 10);
  return { otp_hash, otp_code };
}
async function verifyOtp(otp_hash, otp_code){
  if (isEmpty(otp_code)) throw new HttpException(400, "data can't be empty", {});
  const isOptMatching = await compare(otp_code, otp_hash);
  if (isOptMatching) {
    return true;
  } else {
    throw new HttpException(409, `verification failed`, { otp_code: 'invalid otp supplied' });
  }
}

module.exports = { sendOtp,generateMobileOtp,verifyOtp };
