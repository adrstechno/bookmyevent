import mysql from 'mysql2';

// All connection params come from .env (loaded by Server.js before this module runs)
const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';

const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'goeventifydb',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 60000,
    multipleStatements: true,
};

// TiDB / cloud MySQL requires SSL; local XAMPP does not
if (!isLocal) {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('   Host:', process.env.DB_HOST, '| DB:', process.env.DB_NAME);
    } else {
        console.log('✅ Database connected:', process.env.DB_HOST, '/', process.env.DB_NAME);
        connection.release();
    }
});

pool.on('error', err => {
    console.error('Database pool error:', err.code, err.message);
});

export default pool;
