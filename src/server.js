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

// instances
const app = express();
const blfc = express.Router();
const db = new Db();
const defaultClient = SquareConnect.ApiClient.instance;
const oauth2 = defaultClient.authentications['oauth2'];
const square = new SquareConnect.CheckoutApi();

oauth2.accessToken = process.env.SQUARE_ACCESS_TOKEN;

const errorHandler = (err, req, res, next) => {
  res.status(500).send({error: err.message || err});
};

const createOrder = (tip, id, email) => {
  return SquareConnect.CreateCheckoutRequest({
    idempotencyKey: id,
    askForShippingAddress: false,
    merchantSupportEmail: 'blfcbaybus@gmail.com',
    prePopulateBuyerEmail: email,
    redirectUrl: 'http://api.yukine.me/blfc/confirm',
    order: SquareConnect.CreateOrderRequest({
      referenceId: id,
      lineItems: [
        {
          name: 'Seat Reservation',
          quantity: '1',
          basePriceMoney: {
            amount: 70,
            currency: 'USD'
          }
        },
        {
          name: 'Tip',
          quantity: tip ? '1' : '0',
          basePriceMoney: {
            amount: tip,
            currency: 'USD'
          }
        }
      ]
    })
  });
};

app.use(morgan('dev'));
app.use(bodyParser.json());

blfc.get('/riders', (req, res, next) => {
  db.getRiders()
    .then(riders => {
      console.log(riders);
      res.send(riders);
    })
    .catch(next)
});

blfc.post('/riders', (req, res, next) => {
  const minAge = moment().set('y', 2018).set('M', 5).set('d', 8).subtract(21, 'y');
  const id = uuid();
  const {name, char_name, email, verify_email, birth_date, twitter, telegram, tip} = req.body;
  const tipAmount = tip ? 0 : parseInt(tip, 10);

  if (!name) return next('Name is required.');
  if (!char_name) return next('Character name is required. This will be used as your display name.');
  if (!email) return next('A valid email is required. Confirmation will be sent to this address.');
  if (email !== verify_email) return next('Provided emails do not match.');
  if (!birth_date) return next('Date of Birth is required.')

  db.addRider({name, char_name, email, birth_date, twitter, telegram, tip})
    .then(dbRes => {
      if (moment(birth_date).isAfter(minAge)) return res.send({status: 'not-21'});
      
      return square.createCheckout(process.env.SQUARE_LOCATION_ID, createOrder(tipAmount, id, email));
    })
    .then(squareRes => {
      if (!squareRes.order.id) return next('Could not get valid square id');
      
      db.updateUser({checkout_id: squareRes.order.id, tip: tipAmount}, {id})
        .then(_ => res.redirect(`https://connect.squareup.com/v2/checkout?c=${squareRes.order.id}&l=${squareRes.order.location_id}`))
        .catch(next);
    })
    .catch(next);
});

blfc.get('/confirm', (req, res, next) => {
  console.log(req.query);

  if (true) return;

  db.updateUser({confirmed: true})
    .then(dbRes => {
      res.redirect(`http://yukine.me/blfc/?confirmed=true&cid=${req.query.referenceId}`);
    })
    .catch(next);
});

app.use('/blfc', blfc);
app.use(errorHandler);
app.listen(4000, () => console.log('server started on 4000'));