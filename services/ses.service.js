const {
  CreateTemplateCommand,
  GetTemplateCommand,
  SendTemplatedEmailCommand,
  SESClient,
} = require("@aws-sdk/client-ses");
const AWS = require("aws-sdk");
// import { getUniqueName, postfix } from '../../src/utils/util-string';

const REGION = "us-east-2";

AWS.config.update({ region: REGION });
// Set the AWS Region.
const sesClient = new SESClient({ region: REGION });
// const TEMPLATE_NAME = getUniqueName('TestTemplateName');
// const VERIFIED_EMAIL = postfix(getUniqueName('teemealeheen'), '@gmail.com');
// const USER = { firstName: 'Timi', emailAddress: VERIFIED_EMAIL };

async function sendMail() {
  const params = {
    Destination: {
      /* required */
      ToAddresses: [
        "teemealeheen@gmail.com",
        /* more items */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: "HTML_FORMAT_BODY",
        },
        Text: {
          Charset: "UTF-8",
          Data: "TEXT_FORMAT_BODY",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Test email",
      },
    },
    Source: " devops@gilah.io" /* required */,
    ReplyToAddresses: [
      "noreply@gilah.io",
      /* more items */
    ],
  };

  // Create the promise and SES service object
  const sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
    .sendEmail(params)
    .promise();

  // Handle promise's fulfilled/rejected states
  sendPromise
    .then(function (data) {
      console.log(data.MessageId);
    })
    .catch(function (err) {
      console.error(err, err.stack);
    });
}

async function createTemplate(name,subject,template) {
  // otp_template
  const createTemplateCommand = new CreateTemplateCommand({
    /**
     * The template feature in Amazon SES is based on the Handlebars template system.
     */
    Template: {
      /**
       * The name of an existing template in Amazon SES.
       */
      TemplateName: name,
      HtmlPart: template,
      SubjectPart: subject,
    },
  });
  try {
    const response = await sesClient.send(createTemplateCommand);
    console.log(response);
  } catch (err) {
    console.log("Failed to create template.", err);
    return err;
  }
}

async function sendTemplatedEmail(templateName, options) {
  console.log(templateName);
  const createTemplateCommand = new SendTemplatedEmailCommand({
    Destination: { ToAddresses: [options.email] },
    TemplateData: JSON.stringify({
      contact: { firstName: options.username, opt_code: options.otp_code },
    }),
    Source: "devops@gilah.io",
    Template: templateName,
  });
  try {
    const data = await sesClient.send(createTemplateCommand);
    return data;
  } catch (err) {
    console.log("Failed to create template.", err);
    return err;
  }
}
async function getTemplate() {
  const getTemplateCommand = new GetTemplateCommand({
    TemplateName: "otp_template",
  });
  try {
    const response = await sesClient.send(getTemplateCommand);
    console.log(response);
  } catch (err) {
    console.log("Failed to get email template.", err);
    return err;
  }
}

module.exports = {
  getTemplate,
  sendMail,
  sendTemplatedEmail,
  createTemplate,
};
