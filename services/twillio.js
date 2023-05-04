const { OTP_SID, TWILIO_KEY, TWILIO_SID } = process.env;
const twilio = require("twilio");
const { sendResponse } = require("../helpers/functions");

const client = twilio(TWILIO_SID, TWILIO_KEY);



const sendOtp = async (mobile_number) => {
  console.log("here");
  let result;
  await client.verify
    .services(OTP_SID)
    .verifications.create({ to: mobile_number, channel: "whatsapp" })
    .then((verification) => {
      console.log(verification);
      result = true;
      return result;
    })
    .catch((error) => {
      console.log(error);
      sendResponse(res, 207, "unable to send sms", {}, {});
    });
  return result;
};
const verifyOtp = async (mobile_number, otp_code) => {
  let result;
  await client.verify
    .services(OTP_SID)
    .verificationChecks.create({ to: mobile_number, code: otp_code })
    .then(async (verification_check) => {
      const { status } = verification_check;
      // console.log(verification_check);
      if (status === "approved") {
        result = true;
        return result;
      } else {
        result = false;
        return;
      }
    })
    .catch((error) => {
      console.log(error);
      sendResponse(res, 207, "unable to verify sms", {}, {});
    });
  return result;
};

module.exports = { sendOtp, verifyOtp };
