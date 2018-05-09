// set config
require('dotenv').config();

const Db = require('./db');
const Mailer = require('./mailer');

const db = new Db();
const mailer = new Mailer();

db.getConfirmedCount()
  .then((riders) => {
      riders.forEach(rider => {
        mailer.sendFinal(rider.email, rider.char_name);
        console.log(`Emailed: ${rider.email} ${rider.char_name}`);
      });
  });