/**
 * callie.js - MySQL Database Connection
 * Native MySQL connection pool with auto-reconnect
 */

import mysql from 'mysql2/promise';

let pool = null;
let config = null;

/**
 * Default database configuration from environment
 */
function getDefaultConfig() {
    return {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || process.env.DB_DATABASE || 'callie',

        // Pool settings
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10', 10),
        queueLimit: 0,

        // Timeouts
        connectTimeout: 10000,

        // Enable multiple statements for migrations
        multipleStatements: false,

        // Timezone
        timezone: process.env.DB_TIMEZONE || 'local',

        // Character set
        charset: 'utf8mb4'
    };
}

/**
 * Create a new connection pool
 * @param {Object} customConfig - Custom configuration options
 * @returns {Object} - MySQL pool instance
 */
export async function createConnection(customConfig = {}) {
    config = { ...getDefaultConfig(), ...customConfig };

    try {
        pool = mysql.createPool(config);

        // Test connection
        const connection = await pool.getConnection();
        console.log(`✅ MySQL connected to ${config.host}:${config.port}/${config.database}`);
        connection.release();

        return pool;
    } catch (err) {
        console.error(`❌ MySQL connection failed: ${err.message}`);
        throw err;
    }
}

/**
 * Get the current pool instance
 * @returns {Object} - MySQL pool
 */
export function getPool() {
    if (!pool) {
        throw new Error('Database not connected. Call createConnection() first.');
    }
    return pool;
}

/**
 * Execute a raw SQL query with prepared statements
 * @param {string} sql - SQL query with ? placeholders
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} - Query results
 */
export async function query(sql, params = []) {
    const [rows] = await getPool().execute(sql, params);
    return rows;
}

/**
 * Execute a raw SQL query (for INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} - Result metadata (insertId, affectedRows, etc.)
 */
export async function execute(sql, params = []) {
    const [result] = await getPool().execute(sql, params);
    return result;
}

/**
 * Get a single connection for transactions
 * @returns {Promise<Object>} - Connection object
 */
export async function getConnection() {
    return await getPool().getConnection();
}

/**
 * Run a function within a transaction
 * @param {Function} callback - Async function receiving connection
 * @returns {Promise<*>} - Result of callback
 */
export async function transaction(callback) {
    const connection = await getConnection();

    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
}

/**
 * Close the connection pool
 */
export async function closeConnection() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('MySQL connection closed');
    }
}

/**
 * Health check - verify database is accessible
 * @returns {Promise<boolean>} - True if connected
 */
export async function healthCheck() {
    try {
        await query('SELECT 1');
        return true;
    } catch {
        return false;
    }
}

// Export pool getter for advanced usage
export { pool, config };
