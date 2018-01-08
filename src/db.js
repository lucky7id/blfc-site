require('dotenv').config();
const mysql = require('mysql');
const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

class Db {
  constructor() {
    this.pool = pool;
  }

  getRiders() {
    const options = {
      sql: 'SELECT char_name, twitter, telegram, confirmed FROM riders GROUP BY confirmed'
    };

    return this.getQuery(options);
  }

  addRider(rider) {
    const options = {
      sql: 'INSERT INTO riders SET ?',
      values: [rider]
    };

    return this.getQuery(options);
  }

  updateUser(set, wheres) {
    const options = {
      sql: 'UPDATE riders SET ? WHERE ?',
      values: [
        set,
        wheres
      ]
    }

    return this.getQuery(options);
  }

  getQuery(options) {
    return new Promise((resolve, reject) => {
      this.pool.query(options, (e, res, fields) => {
        console.log({e, res})
        if (e) return reject(e);

        return resolve(e);
      });
    });
  }
}

module.exports = Db;