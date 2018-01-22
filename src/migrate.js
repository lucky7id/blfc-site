require('dotenv').config();
const mysql = require('mysql');

const sql = `
CREATE TABLE IF NOT EXISTS interest (
  email VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
)ENGINE=InnoDB`;

const connection = mysql.createConnection({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.query(sql, (e, results, fields) => {
  if (e) console.error(e);

  connection.destroy();
  process.exit(0);
});
