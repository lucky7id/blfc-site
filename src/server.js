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

// instances
const app = express();
const blfc = express.Router();
const db = new Db();
const mailer = new Mailer();
const defaultClient = SquareConnect.ApiClient.instance;
const { oauth2 } = defaultClient.authentications;
const square = new SquareConnect.CheckoutApi();

oauth2.accessToken = process.env.SQUARE_ACCESS_TOKEN;

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

const createOrder = (tip, id, email) => ({
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
          amount: 80 * 100,
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

blfc.post('/riders', (req, res, next) => {
  const id = uuid();
  const atName = /^@/;
  const badChars = /[^\w@\s\+\.\?\\\-\(\)\!]/g;
  const {
    name, char_name, email, verify_email, birth_date, twitter, telegram, tip,
  } = sanitize(req.body);

  const tipAmount = tip ? parseInt(tip, 10) : 0;
  const minAge = moment()
    .set('y', 2018)
    .set('M', 5)
    .set('d', 8)
    .subtract(21, 'y');

  console.log('\n[Rider Add]', req.body, '\n');

  if (!name) return next('Name is required.');
  if (!char_name) return next('Character name is required. This will be used as your display name.');
  if (!email || !isemail.validate(email)) return next('A valid email is required. Confirmation will be sent to this address.');
  if (email !== verify_email) return next('Provided emails do not match.');
  if (!birth_date) return next('Date of Birth is required.');
  if (twitter.toString().trim().length && !atName.test(twitter)) return next('Twitter and Telegram names must start with an @');
  if (telegram.toString().trim().length && !atName.test(telegram)) return next('Twitter and Telegram names must start with an @');
  if (badChars.test(name) || badChars.test(char_name)) return next('Trying to be a sneaky skunk? Names are only allowed to use alphanumeric values and characters "+-!?.\\()"');

  return db.getByEmail(email)
    .then((rider) => {
      if (rider && rider.length) throw new Error('email-found');

      return db.addRider({
        id, name, char_name, email, birth_date: moment(birth_date).format('YYYY-MM-DD'), twitter, telegram, tip,
      });
    })
    .then(() => {
      if (moment(birth_date, 'MM-DD-YYYY').isAfter(minAge)) throw new Error('not-21');

      return db.getConfirmedCount();
    })
    .then((rows) => {
      if (!rows || rows.length >= 50) throw new Error('bus-full');

      mailer.sendWelcome(email, name, id);
      res.send({ url: `http://api.yukine.me/blfc/checkout/${id}` });
    })
    .then(() => db.getInterest(email))
    .then((interest) => {
      if (interest && interest.length) return db.removeInterest(email);

      return undefined;
    })
    .catch(next);
});

blfc.get('/confirm', (req, res, next) => {
  if (!req.query.referenceId) return;

  //@todo verify id from square
  db.updateUser({ confirmed: true }, { id: req.query.referenceId })
    .then(() => db.getById(req.query.referenceId))
    .then((user) => {
      mailer.sendConfirm(user[0].email, user[0].name, req.query.referenceId);
      res.redirect(`http://yukine.me/blfc/?confirmed=true&cid=${req.query.referenceId}`);
    })
    .catch(next);
});

blfc.post('/interest', (req, res, next) => {
  if (!req.body.email || !isemail.validate(req.body.email)) return next('Must submit a valid email');

  console.log('\n[Interest Add]', req.body, '\n');

  return db.addInterest(req.body.email)
    .then(() => {
      mailer.sendInterest(req.body.email, req.body.email);
      res.send({ success: true });
    })
    .catch(next);
});

blfc.get('/checkout/:id', (req, res, next) => {
  let foundRider;

  console.log(`\n[checkout][id]: ${req.params.id}\n`);

  db.getById(req.params.id)
    .then(([rider]) => {
      if (!rider) throw new Error('No rider found');
      console.log(rider);
      foundRider = rider;

      return square.createCheckout(
        process.env.SQUARE_LOCATION_ID,
        createOrder(rider.tip, rider.id, rider.email)
      );
    })
    .then((squareRes) => {
      if (!squareRes.checkout.id) return next('Could not get valid square id');

      console.log(`\n[checkout][square res]: ${squareRes.checkout.checkout_page_url}`, foundRider, '\n');

      return db.updateUser({ checkout_id: squareRes.checkout.id, tip: foundRider.tip }, { id: req.params.id })
        .then(() => res.redirect(squareRes.checkout.checkout_page_url))
        .catch(next);
    })
    .catch((e) => {
      console.error(`\n[checkout][Fail]: ${e.message || e}\n`)

      res.send('Could not get a valid square link');
    });
});

const errorHandler = function errorHandler(err, req, res, next) {
  console.error(err); //eslint-disable-line

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
