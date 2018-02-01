require('dotenv').config();
const nodemailer = require('nodemailer');
const { htmlToText } = require('nodemailer-html-to-text');

const welcomeBody = (checkoutUrl, id) => (`
We've got your info, and have added you to the pre-confirmed list. You should have been redirected to Square's site for payment.
In case you were not redirected, you can finish your reservation <a href="http://yukine.me/blfc/checkout/${id}" style="color: #3498db; text-decoration: underline;">here</a>
<br />
<br />
<b>Confirmation Id:</b> ${id}
<br />
You should hold onto this confirmation id, until after BLFC.
<br />
<br />
Thanks,<br />
Yukine
`);

const interestBody = () => (`
Thanks for your interest! If you have any feedback please feel free to reply directly to this email, or join the telegram below.
When you are ready to complete sign up use <a href="http://yukine.me/blfc/?reserveCb=true" style="color: #3498db; text-decoration: underline;">this link.</a>
<br />
<br />
Thanks,<br />
Yukine
`);

const confirmedBody = () => (`
You are free to move about the bus! We've recieved your payment successfully, and your spot on the bus is now reserved.
As a reminder, you have until <b>April 15, 2018</b> to request a refund. Should you need to do that please refer to the links in the bottom.
<br />
Lastly, you are now invited to join the other confirmed riders in our telegram chat <a href="https://t.me/joinchat/Dpr3ylCiOVJ0oVtT77bzuA" style="color: #3498db; text-decoration: underline;">BLFC bus lounge</a>
<br />
<br />
Thanks,<br />
Yukine
`);

const template = (preheader, body, name) => (`
<!doctype html>
<html>

<head>
  <meta name="viewport" content="width=device-width">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Biggest Little Furry Coach</title>
  <style>
    @media only screen and (max-width: 620px) {
      table[class=body] h1 {
        font-size: 28px !important;
        margin-bottom: 10px !important;
      }

      table[class=body] p,
      table[class=body] ul,
      table[class=body] ol,
      table[class=body] td,
      table[class=body] span,
      table[class=body] a {
        font-size: 16px !important;
      }

      table[class=body] .wrapper,
      table[class=body] .article {
        padding: 10px !important;
      }

      table[class=body] .content {
        padding: 0 !important;
      }

      table[class=body] .container {
        padding: 0 !important;
        width: 100% !important;
      }

      table[class=body] .main {
        border-left-width: 0 !important;
        border-radius: 0 !important;
        border-right-width: 0 !important;
      }

      table[class=body] .btn table {
        width: 100% !important;
      }

      table[class=body] .btn a {
        width: 100% !important;
      }

      table[class=body] .img-responsive {
        height: auto !important;
        max-width: 100% !important;
        width: auto !important;
      }
    }

    @media all {
      .ExternalClass {
        width: 100%;
      }

      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }

      .apple-link a {
        color: inherit !important;
        font-family: inherit !important;
        font-size: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
        text-decoration: none !important;
      }

      .btn-primary table td:hover {
        background-color: #34495e !important;
      }

      .btn-primary a:hover {
        background-color: #34495e !important;
        border-color: #34495e !important;
      }
    }
  </style>
</head>

<body class="" style="background-color: #f6f6f6; font-family: sans-serif; -webkit-font-smoothing: antialiased; font-size: 14px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
  <table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #f6f6f6; width: 100%;"
    width="100%" bgcolor="#f6f6f6">
    <tr>
      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
      <td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; Margin: 0 auto;"
        width="580" valign="top">
        <div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;">

          <!-- START CENTERED WHITE CONTAINER -->
          <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">${preheader}</span>
          <table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background: #ffffff; border-radius: 3px; width: 100%;"
            width="100%">

            <!-- START MAIN CONTENT AREA -->
            <tr>
              <td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"
                valign="top">
                <table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"
                  width="100%">
                  <tr>
                    <td align="center" style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                      <img src="https://i.imgur.com/m352yEQ.png" class="yuki_header" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%; height: 5%; margin-bottom: 10px;">
                    </td>
                  </tr>
                  <tr>
                    <td align="center" class="title-img-container" style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                      <img src="https://i.imgur.com/EJyQZWY.png" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%; margin-bottom: 20px;">
                    </td>
                  </tr>
                  <tr>
                    <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi ${name},</p>
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">${body}</p>
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">As a reminder, if you have any questions or concerns feel free to reach out at:</p>
                      <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">
                        <b>Telegram (best option): </b>
                        <a href="https://t.me/joinchat/Dpr3yk0okkj9vPAwXH8A8A" style="color: #3498db; text-decoration: underline;">BLFC Bay Bus General</a>
                        <br>
                        <b>Email: </b>
                        <a href="mailto:blfcbaybus@gmail.com" style="color: #3498db; text-decoration: underline;">blfcbaybus@gmail.com</a>
                        <br>
                        <b>Twitter: </b>
                        <a href="https://twitter.com/yuki_husker" style="color: #3498db; text-decoration: underline;">@yuki_husker</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- END MAIN CONTENT AREA -->
          </table>

          <!-- START FOOTER -->
          <div class="footer" style="clear: both; Margin-top: 10px; text-align: center; width: 100%;"></div>
          <!-- END FOOTER -->

          <!-- END CENTERED WHITE CONTAINER -->
        </div>
      </td>
      <td style="font-family: sans-serif; font-size: 14px; vertical-align: top;" valign="top">&nbsp;</td>
    </tr>
  </table>
</body>

</html>
`)

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USER,
        clientId: process.env.MAIL_CLIENT,
        clientSecret: process.env.MAIL_SECRET,
        refreshToken: process.env.MAIL_REFRESH,
      },
    });

    this.transporter.use('compile', htmlToText());
  }

  sendWelcome(to, name, id) {
    this.transporter.sendMail({
      to,
      from: 'blfcbaybus@gmail.com',
      subject: 'Welcome to the Big Lit Fur Coach',
      html: template('Thanks for signing up!', welcomeBody(checkoutUrl, id), name),
    }, (err) => {
      if (err) console.error(err); //eslint-disable-line
    });
  }

  sendConfirm(to, name) {
    this.transporter.sendMail({
      to,
      from: 'blfcbaybus@gmail.com',
      subject: 'You are all set for the Big Lit Fur Coach',
      html: template('You are confirmed!', confirmedBody(), name),
    }, (err) => {
      if (err) console.error(err); //eslint-disable-line
    });
  }

  sendInterest(to, name) {
    this.transporter.sendMail({
      to,
      from: 'blfcbaybus@gmail.com',
      subject: 'Thanks for your interest is the Big Lit Fur Coach',
      html: template('Thanks for your interest!', interestBody(), name),
    }, (err) => {
      if (err) console.error(err); //eslint-disable-line
    });
  }
}

module.exports = Mailer;
