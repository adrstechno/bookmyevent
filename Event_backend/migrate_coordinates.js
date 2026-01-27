import mysql from 'mysql2';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.HOST,
  port: process.env.DBPORT,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  ssl: { rejectUnauthorized: true }
});

const sql = fs.readFileSync('add_coordinates_to_booking.sql', 'utf8');

connection.execute(sql, (err, results) => {
  if (err) {
    console.error('❌ Migration failed:', err);
  } else {
    console.log('✅ Migration completed successfully');
  }
  connection.end();
});