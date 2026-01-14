import mysql from 'mysql2';
import { URL } from 'url';
import 'dotenv/config';

const mysqlUrl = new URL('mysql://7BwYZV8pqsv5d1i.root:JcdhlSC3TEcYfndd@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/Event_Managment?ssl={"rejectUnauthorized":true}');

// Create connection pool for better connection management
const pool = mysql.createPool({
    host: mysqlUrl.hostname,
    port: mysqlUrl.port || 3306,
    user: mysqlUrl.username,
    password: mysqlUrl.password,
    database: mysqlUrl.pathname.slice(1),
    ssl: {
        rejectUnauthorized: false
    },
    connectionLimit: 10,
    acquireTimeoutMillis: 60000,
    connectTimeout: 60000,
    multipleStatements: true
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to database successfully!');
        connection.release();
    }
});

// Handle pool errors
pool.on('error', err => {
    console.error('Database pool error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection lost, pool will reconnect automatically');
    }
});

export default pool;