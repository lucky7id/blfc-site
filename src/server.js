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
          amount: 70 * 100,
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
  const {
    name, char_name, email, verify_email, birth_date, twitter, telegram, tip,
  } = req.body;
  const tipAmount = tip ? parseInt(tip, 10) : 0;
  const minAge = moment()
    .set('y', 2018)
    .set('M', 5)
    .set('d', 8)
    .subtract(21, 'y');

  console.log('\n[Rider Add]', req.body, '\n');

  if (!name) return next('Name is required.');
  if (!char_name) return next('Character name is required. This will be used as your display name.');
  if (!email) return next('A valid email is required. Confirmation will be sent to this address.');
  if (email !== verify_email) return next('Provided emails do not match.');
  if (!birth_date) return next('Date of Birth is required.');

  return db.getByEmail(email)
    .then((rider) => {
      if (rider && rider.length) throw new Error('email-found');

      return db.addRider({
        id, name, char_name, email, birth_date, twitter, telegram, tip,
      });
    })
    .then(() => {
      if (moment(birth_date, 'MM-DD-YYYY').isAfter(minAge)) throw new Error('not-21');

      return db.getConfirmedCount();
    })
    .then((rows) => {
      if (!rows || rows.length >= 61) throw new Error('bus-full');

      return square.createCheckout(
        process.env.SQUARE_LOCATION_ID,
        createOrder(tipAmount, id, email)
      );
    })
    .then((squareRes) => {
      if (!squareRes.checkout.id) return next('Could not get valid square id');

      mailer.sendWelcome(email, squareRes.checkout.checkout_page_url, name, id);

      return db.updateUser({ checkout_id: squareRes.checkout.id, tip: tipAmount }, { id })
        .then(() => res.send({url: squareRes.checkout.checkout_page_url}))
        .catch(next);
    })
    .catch(next);
});

blfc.get('/confirm', (req, res, next) => {
  if (!req.query.referenceId) return;

  db.updateUser({ confirmed: true }, { id: req.query.referenceId })
    .then(() => db.getById(req.query.referenceId))
    .then((user) => {
      mailer.sendWelcome(user[0].email, req.query.referenceId);
      res.redirect(`http://yukine.me/blfc/?confirmed=true&cid=${req.query.referenceId}`);
    })
    .catch(next);
});

const errorHandler = function errorHandler(err, req, res, next) {
  console.error(err);

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
