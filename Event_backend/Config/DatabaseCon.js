import mysql from 'mysql2';

// Note: dotenv is configured in Server.js before this module is loaded

// CLOUD DATABASE CONFIGURATION (TiDB) - ACTIVE
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000,
    multipleStatements: true
});

// LOCAL DATABASE CONFIGURATION (COMMENTED OUT)
// const pool = mysql.createPool({
//     host: 'localhost',
//     port: 3306,
//     user: 'root',
//     password: 'Nayan@1234',
//     database: 'goeventifydb',
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
        console.log('✅ Connected to CLOUD database (TiDB) successfully!');
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