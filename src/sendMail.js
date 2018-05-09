// set config
require('dotenv').config();

const Db = require('./db');
const Mailer = require('./mailer');

const db = new Db();
const mailer = new Mailer();

db.getConfirmedCount()
  .then((riders) => {
      riders.forEach(console.log)
  });