const FormData =  require('form-data');
const Mailgun = require('mailgun.js');

const  { MAILGUN_API_KEY } = process.env;

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: 'api',
  key: MAILGUN_API_KEY,
});


const  sendMail = async(templateName, subject, options) => {
    const response = await mg.messages.create('sandbox15fd384620f041a3b6d512409cb01ca7.mailgun.org', {
      from: 'tialalasandbox@gmail.com',
      to: options.email,
      subject: subject,
      template: templateName,
      'h:X-Mailgun-Variables': JSON.stringify(options),
    });
    // logs any error
    if (response.message === 'Queued. Thank you.') {
      return true;
    } else {
      return false;
    }
  }

module.exports = sendMail;