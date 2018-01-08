require('dotenv').config();
const nodemailer = require('nodemailer');

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      type: 'OAuth2',
      user: process.env.MAIL_USER,
      serviceClient: process.env.MAIL_CLIENT,
      privateKey: process.env.MAIL_KEY,
    });
  }

  send(vars) {
    this.transporter.sendMail({
      from: 'blfcbaybus@gmail.com',
      to: 'lucky7id+testblfc@gmail.com',
      subject: 'This is a test',
      text: Object.keys(vars).map(prop => `${prop}: ${vars[prop]}`).join('\n\n'),
    });
  }
}

module.exports = Mailer;
