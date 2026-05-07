import mysql from 'mysql2';

// Note: dotenv is configured in Server.js before this module is loaded

// LOCAL DATABASE CONFIGURATION (ACTIVE)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'goeventifydb',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000,
    multipleStatements: true
});

// CLOUD DATABASE CONFIGURATION (COMMENTED OUT FOR LOCAL TESTING)
// import { URL } from 'url';
// const mysqlUrl = new URL('mysql://7BwYZV8pqsv5d1i.root:JcdhlSC3TEcYfndd@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/Event_Managment?ssl={"rejectUnauthorized":true}');
// const pool = mysql.createPool({
//     host: mysqlUrl.hostname,
//     port: mysqlUrl.port || 3306,
//     user: mysqlUrl.username,
//     password: mysqlUrl.password,
//     database: mysqlUrl.pathname.slice(1),
//     ssl: {
//         rejectUnauthorized: false
//     },
//     connectionLimit: 10,
//     waitForConnections: true,
//     queueLimit: 0,
//     enableKeepAlive: true,
//     keepAliveInitialDelay: 0,
//     connectTimeout: 60000,
//     multipleStatements: true
// });

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.message);
    } else {
        console.log('✅ Connected to LOCAL database successfully!');
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