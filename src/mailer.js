require('dotenv').config();
const nodemailer = require('nodemailer');

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.MAIL_CLIENT,
        clientSecret: process.env.MAIL_SECRET,
        refreshToken: process.env.MAIL_REFRESH
      },
    });
  }

  send(vars) {
    this.transporter.sendMail({
      from: 'blfcbaybus@gmail.com',
      to: 'lucky7id+testblfc@gmail.com',
      subject: 'This is a test',
      text: Object.keys(vars).map(prop => `${prop}: ${vars[prop]}`).join('\n\n'),
    }, (err, info) => {
      if (err) console.error(err);

      console.log('\n\n', 'mailer-info', info);
    });
  }
}

module.exports = Mailer;
