import mysql from 'mysql2';
import { URL } from 'url';

// Load environment variables from .env file
import 'dotenv/config';

// Parse the MySQL connection URI
const mysqlUrl = new URL('mysql://7BwYZV8pqsv5d1i.root:JcdhlSC3TEcYfndd@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/Event_Managment?ssl={"rejectUnauthorized":true}');

const db = mysql.createConnection({
    host: mysqlUrl.hostname,
    port: mysqlUrl.port || 3306,
    user: mysqlUrl.username,
    password: mysqlUrl.password,
    database: mysqlUrl.pathname.slice(1), // Remove leading '/'
    ssl: {
        // rejectUnauthorized: true is generally recommended for production
        // to ensure the server certificate is valid.
        rejectUnauthorized: false // Set to false for development with self-signed certs
    }
});

db.connect(err => {
    if (err) {
        // Outputting the full error object can help with debugging
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to database successfully!');
    }
});

export default db;