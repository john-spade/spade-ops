/**
 * callie.js - Database Layer Entry Point
 * Main export for MySQL database functionality
 */

import {
    createConnection,
    closeConnection,
    query as rawQuery,
    execute,
    transaction,
    healthCheck,
    getConnection,
    getPool
} from './connection.js';

import { QueryBuilder, table } from './query-builder.js';

/**
 * Database interface object
 * Provides a fluent API for database operations
 */
export const db = {
    /**
     * Initialize database connection
     */
    connect: createConnection,

    /**
     * Close database connection
     */
    close: closeConnection,

    /**
     * Health check
     */
    healthCheck,

    /**
     * Get raw pool
     */
    getPool,

    /**
     * Get a connection for manual transaction handling
     */
    getConnection,

    /**
     * Run a function in a transaction
     */
    transaction,

    /**
     * Execute raw SQL query with prepared statements
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Array>} - Query results
     */
    raw: rawQuery,

    /**
     * Execute raw SQL (for INSERT/UPDATE/DELETE)
     */
    execute,

    /**
     * Start a query builder for a table
     * @param {string} tableName - Table name
     * @returns {QueryBuilder}
     */
    table,

    /**
     * Select from a table
     * @param {string} tableName - Table name
     * @returns {QueryBuilder}
     */
    select(tableName) {
        return new QueryBuilder(tableName).select('*');
    },

    /**
     * Insert into a table
     * @param {string} tableName - Table name
     * @param {Object} data - Data to insert
     * @returns {Promise<number>} - Insert ID
     */
    async insert(tableName, data) {
        return new QueryBuilder(tableName).insert(data);
    },

    /**
     * Update a table
     * @param {string} tableName - Table name
     * @param {Object} data - Data to update
     * @returns {QueryBuilder} - Call .where() then execute
     */
    update(tableName, data) {
        const builder = new QueryBuilder(tableName);
        builder._type = 'UPDATE';
        builder._data = data;
        return builder;
    },

    /**
     * Delete from a table
     * @param {string} tableName - Table name
     * @returns {QueryBuilder} - Call .where() then .delete()
     */
    delete(tableName) {
        const builder = new QueryBuilder(tableName);
        builder._type = 'DELETE';
        return builder;
    },

    /**
     * Find a record by ID
     * @param {string} tableName - Table name
     * @param {number|string} id - Record ID
     * @returns {Promise<Object|null>}
     */
    async find(tableName, id) {
        return new QueryBuilder(tableName).find(id);
    },

    /**
     * Get all records from a table
     * @param {string} tableName - Table name
     * @returns {Promise<Array>}
     */
    async all(tableName) {
        return new QueryBuilder(tableName).get();
    },

    /**
     * Count records in a table
     * @param {string} tableName - Table name
     * @returns {Promise<number>}
     */
    async count(tableName) {
        return new QueryBuilder(tableName).count();
    },

    /**
     * Truncate a table (use with caution!)
     * @param {string} tableName - Table name
     */
    async truncate(tableName) {
        await execute(`TRUNCATE TABLE \`${tableName}\``);
    }
};

// Also export individual utilities
export { createConnection, QueryBuilder };
