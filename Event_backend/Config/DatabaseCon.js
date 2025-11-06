import mysql from 'mysql2';
import { URL } from 'url';
import 'dotenv/config';

const mysqlUrl = new URL('mysql://7BwYZV8pqsv5d1i.root:JcdhlSC3TEcYfndd@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/Event_Managment?ssl={"rejectUnauthorized":true}');

const db = mysql.createConnection({
    host: mysqlUrl.hostname,
    port: mysqlUrl.port || 3306,
    user: mysqlUrl.username,
    password: mysqlUrl.password,
    database: mysqlUrl.pathname.slice(1),
    ssl: {
        rejectUnauthorized: false
    },
    enableKeepAlive: true
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        setTimeout(() => db.connect(), 2000); // Retry after 2 seconds
    } else {
        console.log('Connected to database successfully!');
    }
});

// Handle connection errors
db.on('error', err => {
    console.error('Database error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        db.connect();
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
        db.connect();
    }
    if (err.code === 'ER_AUTH_USER_CREDENTIALS') {
        db.connect();
    }
});

// Keep connection alive
setInterval(() => {
    db.ping(err => {
        if (err) {
            console.error('Ping error:', err);
            db.connect();
        }
    });
}, 60000); // Ping every 60 seconds

export default db;