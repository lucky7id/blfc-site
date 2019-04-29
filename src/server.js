// set config
require('dotenv').config();

// imports
const express = require('express');
const uuid = require('uuid/v4');
const SquareConnect = require('square-connect');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const moment = require('moment');
const Db = require('./db');
const Mailer = require('./mailer');
const cors = require('cors');
const isemail = require('isemail');
const xss = require('xss');
const winston = require('winston');
require('winston-daily-rotate-file');

// instances
const app = express();
const blfc = express.Router();
const db = new Db();
const defaultClient = SquareConnect.ApiClient.instance;
const { oauth2 } = defaultClient.authentications;
const square = new SquareConnect.CheckoutApi();
const TIERS = { pbr: 85, ipa: 90 };
const EXTRA_BAG_COST = 5;
let INTEREST_COUNT = 0;

oauth2.accessToken = process.env.SQUARE_ACCESS_TOKEN;

const baseMsg = {
  from: 'blfcbaybus@gmail.com',
  template_id: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

const transport = new (winston.transports.DailyRotateFile)({
  frequency: '1d',
  filename: './logs/blfc2019-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
});

const logger = winston.createLogger({
  transports: [
    transport,
  ],
});

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

const sanitize = (obj) => {
  const result = {};

  Object.keys(obj).forEach(key => {
    result[key] = xss(obj[key]);
  });

  return result;
}

logger.info('[TEST]', { prop: 'value' });
logger.info('[TEST OBJECT}', { rider: { name: 'yukine', body: { nested: true }, fin: 1234 } });
logger.error('[TEST ERROR}', { message: 'this was an error' });
const createOrder = (amt = 85, tip, id, email) => ({
  idempotency_key: id,
  ask_for_shipping_address: false,
  merchant_support_email: 'blfcbaybus@gmail.com',
  pre_populate_buyer_email: email,
  redirect_url: 'http://api.yukine.me/blfc/confirm',
  order: {
    reference_id: id,
    line_items: [
      {
        name: 'Seat Reservation',
        quantity: '1',
        base_price_money: {
          amount: amt * 100,
          currency: 'USD',
        },
      },
      {
        name: 'Tip',
        quantity: '1',
        base_price_money: {
          amount: tip * 100,
          currency: 'USD',
        },
      },
    ],
  },
});

blfc.get('/riders', (req, res, next) => {
  db.getRiders()
    .then((riders) => {
      res.send(riders);
    })
    .catch(next);
});

blfc.get('/ping', (req, res) => {
  INTEREST_COUNT++;
  console.log(`\n[Interest] Count this session: ${INTEREST_COUNT}`);
  logger.info('[Interest]', { ip: req.ip });

  res.send();
});

blfc.post('/riders', (req, res, next) => {
  const id = uuid();
  const atName = /^@/;
  const badChars = /[^\w@\s\+\.\?\\\-\(\)\!]/g;
  const {
    name, char_name, email, verify_email, birth_date, twitter, telegram, tip, tier, extra_bag = false
  } = sanitize(req.body);

  const tipAmount = tip ? parseInt(tip, 10) : 0;
  const minAge = moment()
    .set('y', 2018)
    .set('M', 5)
    .set('d', 8)
    .subtract(21, 'y');

  logger.info('[Rider Add]', { rider: req.body });

  if (!name) return next('Name is required.');
  if (!char_name) return next('Character name is required. This will be used as your display name.');
  if (!email || !isemail.validate(email)) return next('A valid email is required. Confirmation will be sent to this address.');
  if (email !== verify_email) return next('Provided emails do not match.');
  if (!birth_date) return next('Date of Birth is required.');
  if (twitter.toString().trim().length && !atName.test(twitter)) return next('Twitter and Telegram names must start with an @');
  if (telegram.toString().trim().length && !atName.test(telegram)) return next('Twitter and Telegram names must start with an @');
  if (badChars.test(name) || badChars.test(char_name)) return next('Trying to be a sneaky skunk? Names are only allowed to use alphanumeric values and characters "+-!?.\\()"');
  if (!TIERS[tier]) return next('Invalid tier selected');

  return db.getByEmail(email)
    .then((rider) => {
      if (rider && rider.length) throw new Error('email-found');

      return db.addRider({
        id, name, char_name, email, birth_date: moment(birth_date).format('YYYY-MM-DD'), twitter, telegram, tip: tipAmount, tier, extra_bag
      });
    })
    .then(() => {
      if (moment(birth_date, 'MM-DD-YYYY').isAfter(minAge)) throw new Error('not-21');

      return db.getConfirmedCount();
    })
    .then((rows) => {
      if (!rows || rows.length >= 50) throw new Error('bus-full');
      
      sgMail.send({
        to: email,
        from: 'blfcbaybus@gmail.com',
        template_id: 'd-4552e9310c3d4766b5b19e88a4ee9804', 
        dynamic_template_data: {
          user_name: char_name,
          square_link: `http://api.yukine.me/blfc/checkout/${id}`
        }
      });

      res.send({ url: `http://api.yukine.me/blfc/checkout/${id}` });
    })
    .catch(next);
});

blfc.get('/confirm', (req, res, next) => {
  if (!req.query.referenceId) return;

  //@todo verify id from square
  db.updateUser({ confirmed: true }, { id: req.query.referenceId })
    .then(() => db.getById(req.query.referenceId))
    .then((user) => {
      sgMail.send({
        to: user[0].email,
        from: 'blfcbaybus@gmail.com',
        template_id: 'd-d6b5de2a6fee4b24a1544f02a2dd0afe',
        dynamic_template_data: {
          user_name: user[0].char_name,
        }
      });
      res.redirect(`http://yukine.me/blfc/?confirmed=true&cid=${req.query.referenceId}`);
    })
    .catch(next);
});

blfc.get('/checkout/:id', (req, res, next) => {
  let foundRider;

  logger.info('[checkout]', { id: req.params.id });

  db.getById(req.params.id)
    .then(([rider]) => {
      if (!rider) throw new Error('No rider found');
      foundRider = rider;
      const amt = (TIERS[rider.tier] || TIERS.pbr) + (rider.extra_bag ? EXTRA_BAG_COST : 0);

      return square.createCheckout(
        process.env.SQUARE_LOCATION_ID,
        createOrder(amt, rider.tip, rider.id, rider.email)
      );
    })
    .then((squareRes) => {
      if (!squareRes.checkout.id) return next('Could not get valid square id');

      logger.info('[square callback]', { url: squareRes.checkout.checkout_page_url, rider: foundRider });

      return db.updateUser({ checkout_id: squareRes.checkout.id }, { id: req.params.id })
        .then(() => res.redirect(squareRes.checkout.checkout_page_url))
        .catch(next);
    })
    .catch((e) => {
      logger.error('[checkout][Fail]', {message: e.message || e });
      res.send('Could not get a valid square link');
    });
});

const errorHandler = function errorHandler(err, req, res, next) {
  logger.error('[Error Handler]', {message: err.message || err}); //eslint-disable-line

  if (err.message === 'bus-full') {
    return res.send({ status: 'bus-full' });
  }

  if (err.message === 'not-21') {
    return res.send({ status: 'not-21' });
  }

  return res.status(500).send({ error: err.message || err });
};

app.use('/blfc', blfc);
app.use(errorHandler);
app.listen(4000, () => console.log('server started on 4000'));
