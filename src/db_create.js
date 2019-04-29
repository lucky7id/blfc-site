require('dotenv').config();
const mysql = require('mysql');

const riders = `
CREATE TABLE IF NOT EXISTS riders (
  id VARCHAR(255) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  name VARCHAR(255) NOT NULL,
  char_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  twitter VARCHAR(255),
  telegram VARCHAR(255),
  tip INT DEFAULT 0,
  confirmed BOOLEAN DEFAULT FALSE,
  tos_accepted BOOLEAN DEFAULT FALSE,
  checkout_id VARCHAR(255) DEFAULT NULL,
  transaction_id VARCHAR(255) DEFAULT NULL,
  show_twitter BOOLEAN DEFAULT TRUE,
  show_telegram BOOLEAN DEFAULT TRUE,
  tier VARCHAR(255) NOT NULL,
  extra_bag BOOLEAN NOT NULL
)ENGINE=InnoDB`;

const connection = mysql.createConnection({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection
  .query(riders, (e) => {
    if (e) {
      console.error(e);
      throw e;
    }

    connection.destroy();
    process.exit(0);
});
  
