/**
 * callie.js - Query Builder
 * Chainable, SQL-injection-safe query builder for MySQL
 * 
 * Usage:
 *   db.select('users').where({ id: 1 }).first()
 *   db.insert('users', { name: 'John', email: 'john@example.com' })
 *   db.update('users', { name: 'Jane' }).where({ id: 1 })
 *   db.delete('users').where({ id: 1 })
 *   db.raw('SELECT * FROM users WHERE email = ?', [email])
 */

import { query, execute, getPool } from './connection.js';

export class QueryBuilder {
    constructor(table = null) {
        this._table = table;
        this._type = 'SELECT';
        this._columns = ['*'];
        this._wheres = [];
        this._whereParams = [];
        this._orderBy = [];
        this._limit = null;
        this._offset = null;
        this._data = null;
        this._joins = [];
        this._groupBy = [];
        this._having = [];
        this._havingParams = [];
    }

    /**
     * Set the table
     */
    table(name) {
        this._table = name;
        return this;
    }

    /**
     * Alias for table()
     */
    from(name) {
        return this.table(name);
    }

    /**
     * Select specific columns
     */
    select(...columns) {
        this._type = 'SELECT';
        this._columns = columns.length > 0 ? columns.flat() : ['*'];
        return this;
    }

    /**
     * Add a WHERE clause
     * Supports: where({ id: 1 }), where('id', 1), where('id', '>', 1)
     */
    where(column, operator = null, value = null) {
        if (typeof column === 'object') {
            // Object syntax: where({ id: 1, name: 'John' })
            for (const [key, val] of Object.entries(column)) {
                if (val === null) {
                    this._wheres.push(`\`${key}\` IS NULL`);
                } else {
                    this._wheres.push(`\`${key}\` = ?`);
                    this._whereParams.push(val);
                }
            }
        } else if (value === null && operator !== null) {
            // Two-arg syntax: where('id', 1)
            if (operator === null) {
                this._wheres.push(`\`${column}\` IS NULL`);
            } else {
                this._wheres.push(`\`${column}\` = ?`);
                this._whereParams.push(operator);
            }
        } else {
            // Three-arg syntax: where('age', '>', 18)
            this._wheres.push(`\`${column}\` ${operator} ?`);
            this._whereParams.push(value);
        }
        return this;
    }

    /**
     * Add a WHERE IN clause
     */
    whereIn(column, values) {
        if (values.length === 0) {
            this._wheres.push('1 = 0'); // Always false
        } else {
            const placeholders = values.map(() => '?').join(', ');
            this._wheres.push(`\`${column}\` IN (${placeholders})`);
            this._whereParams.push(...values);
        }
        return this;
    }

    /**
     * Add a WHERE NOT IN clause
     */
    whereNotIn(column, values) {
        if (values.length === 0) {
            return this; // No effect
        }
        const placeholders = values.map(() => '?').join(', ');
        this._wheres.push(`\`${column}\` NOT IN (${placeholders})`);
        this._whereParams.push(...values);
        return this;
    }

    /**
     * Add a WHERE NULL clause
     */
    whereNull(column) {
        this._wheres.push(`\`${column}\` IS NULL`);
        return this;
    }

    /**
     * Add a WHERE NOT NULL clause
     */
    whereNotNull(column) {
        this._wheres.push(`\`${column}\` IS NOT NULL`);
        return this;
    }

    /**
     * Add a WHERE LIKE clause
     */
    whereLike(column, pattern) {
        this._wheres.push(`\`${column}\` LIKE ?`);
        this._whereParams.push(pattern);
        return this;
    }

    /**
     * Add a WHERE BETWEEN clause
     */
    whereBetween(column, min, max) {
        this._wheres.push(`\`${column}\` BETWEEN ? AND ?`);
        this._whereParams.push(min, max);
        return this;
    }

    /**
     * Add an OR WHERE clause
     */
    orWhere(column, operator = null, value = null) {
        const startIndex = this._wheres.length;
        this.where(column, operator, value);

        if (startIndex > 0 && this._wheres.length > startIndex) {
            // Replace AND with OR for the new clause
            this._wheres[startIndex] = 'OR ' + this._wheres[startIndex];
        }
        return this;
    }

    /**
     * Add a JOIN clause
     */
    join(table, column1, operator, column2) {
        this._joins.push(`INNER JOIN \`${table}\` ON \`${column1}\` ${operator} \`${column2}\``);
        return this;
    }

    /**
     * Add a LEFT JOIN clause
     */
    leftJoin(table, column1, operator, column2) {
        this._joins.push(`LEFT JOIN \`${table}\` ON \`${column1}\` ${operator} \`${column2}\``);
        return this;
    }

    /**
     * Add a RIGHT JOIN clause
     */
    rightJoin(table, column1, operator, column2) {
        this._joins.push(`RIGHT JOIN \`${table}\` ON \`${column1}\` ${operator} \`${column2}\``);
        return this;
    }

    /**
     * Add ORDER BY clause
     */
    orderBy(column, direction = 'ASC') {
        this._orderBy.push(`\`${column}\` ${direction.toUpperCase()}`);
        return this;
    }

    /**
     * Add GROUP BY clause
     */
    groupBy(...columns) {
        this._groupBy.push(...columns.map(c => `\`${c}\``));
        return this;
    }

    /**
     * Add HAVING clause
     */
    having(column, operator, value) {
        this._having.push(`\`${column}\` ${operator} ?`);
        this._havingParams.push(value);
        return this;
    }

    /**
     * Set LIMIT
     */
    limit(count) {
        this._limit = count;
        return this;
    }

    /**
     * Set OFFSET
     */
    offset(count) {
        this._offset = count;
        return this;
    }

    /**
     * Pagination helper
     */
    paginate(page = 1, perPage = 10) {
        this._limit = perPage;
        this._offset = (page - 1) * perPage;
        return this;
    }

    /**
     * Build and execute SELECT query, return all rows
     */
    async get() {
        const { sql, params } = this._buildSelect();
        return await query(sql, params);
    }

    /**
     * Get first result only
     */
    async first() {
        this._limit = 1;
        const rows = await this.get();
        return rows[0] || null;
    }

    /**
     * Find by ID (assumes 'id' column)
     */
    async find(id) {
        return this.where('id', id).first();
    }

    /**
     * Get count of matching rows
     */
    async count(column = '*') {
        const originalColumns = this._columns;
        this._columns = [`COUNT(${column === '*' ? '*' : `\`${column}\``}) as count`];
        const result = await this.first();
        this._columns = originalColumns;
        return result ? result.count : 0;
    }

    /**
     * Check if any rows exist
     */
    async exists() {
        const count = await this.count();
        return count > 0;
    }

    /**
     * Get sum of a column
     */
    async sum(column) {
        const originalColumns = this._columns;
        this._columns = [`SUM(\`${column}\`) as sum`];
        const result = await this.first();
        this._columns = originalColumns;
        return result ? Number(result.sum) || 0 : 0;
    }

    /**
     * Get average of a column
     */
    async avg(column) {
        const originalColumns = this._columns;
        this._columns = [`AVG(\`${column}\`) as avg`];
        const result = await this.first();
        this._columns = originalColumns;
        return result ? Number(result.avg) || 0 : 0;
    }

    /**
     * Get min value of a column
     */
    async min(column) {
        const originalColumns = this._columns;
        this._columns = [`MIN(\`${column}\`) as min`];
        const result = await this.first();
        this._columns = originalColumns;
        return result ? result.min : null;
    }

    /**
     * Get max value of a column
     */
    async max(column) {
        const originalColumns = this._columns;
        this._columns = [`MAX(\`${column}\`) as max`];
        const result = await this.first();
        this._columns = originalColumns;
        return result ? result.max : null;
    }

    /**
     * Get distinct values of a column
     */
    async distinct(column) {
        this._columns = [`DISTINCT \`${column}\``];
        return await this.get();
    }

    /**
     * Pluck a single column from results
     */
    async pluck(column) {
        this._columns = [`\`${column}\``];
        const rows = await this.get();
        return rows.map(row => row[column]);
    }

    /**
     * Insert a new row
     */
    async insert(data) {
        this._type = 'INSERT';
        this._data = data;
        const { sql, params } = this._buildInsert();
        const result = await execute(sql, params);
        return result.insertId;
    }

    /**
     * Insert multiple rows
     */
    async insertMany(dataArray) {
        if (dataArray.length === 0) return [];

        const { sql, params } = this._buildInsertMany(dataArray);
        const result = await execute(sql, params);

        // Return array of inserted IDs
        const ids = [];
        for (let i = 0; i < dataArray.length; i++) {
            ids.push(result.insertId + i);
        }
        return ids;
    }

    /**
     * Update rows matching WHERE clause
     */
    async update(data) {
        this._type = 'UPDATE';
        this._data = data;
        const { sql, params } = this._buildUpdate();
        const result = await execute(sql, params);
        return result.affectedRows;
    }

    /**
     * Delete rows matching WHERE clause
     */
    async delete() {
        this._type = 'DELETE';
        const { sql, params } = this._buildDelete();
        const result = await execute(sql, params);
        return result.affectedRows;
    }

    /**
     * Increment a column value
     */
    async increment(column, amount = 1) {
        const sql = `UPDATE \`${this._table}\` SET \`${column}\` = \`${column}\` + ? ${this._buildWhere()}`;
        const params = [amount, ...this._whereParams];
        const result = await execute(sql, params);
        return result.affectedRows;
    }

    /**
     * Decrement a column value
     */
    async decrement(column, amount = 1) {
        return this.increment(column, -amount);
    }

    /**
     * Insert or update (upsert)
     */
    async upsert(data, updateColumns = null) {
        const columns = Object.keys(data);
        const values = Object.values(data);
        const placeholders = columns.map(() => '?').join(', ');
        const columnList = columns.map(c => `\`${c}\``).join(', ');

        const updateCols = updateColumns || columns.filter(c => c !== 'id');
        const updateClause = updateCols.map(c => `\`${c}\` = VALUES(\`${c}\`)`).join(', ');

        const sql = `INSERT INTO \`${this._table}\` (${columnList}) VALUES (${placeholders}) 
                 ON DUPLICATE KEY UPDATE ${updateClause}`;

        const result = await execute(sql, values);
        return result.insertId || result.affectedRows;
    }

    /**
     * Build SELECT SQL
     */
    _buildSelect() {
        const columns = this._columns.join(', ');
        let sql = `SELECT ${columns} FROM \`${this._table}\``;

        if (this._joins.length > 0) {
            sql += ' ' + this._joins.join(' ');
        }

        sql += this._buildWhere();

        if (this._groupBy.length > 0) {
            sql += ` GROUP BY ${this._groupBy.join(', ')}`;
        }

        if (this._having.length > 0) {
            sql += ` HAVING ${this._having.join(' AND ')}`;
        }

        if (this._orderBy.length > 0) {
            sql += ` ORDER BY ${this._orderBy.join(', ')}`;
        }

        if (this._limit !== null) {
            sql += ` LIMIT ${this._limit}`;
        }

        if (this._offset !== null) {
            sql += ` OFFSET ${this._offset}`;
        }

        return { sql, params: [...this._whereParams, ...this._havingParams] };
    }

    /**
     * Build INSERT SQL
     */
    _buildInsert() {
        const columns = Object.keys(this._data);
        const values = Object.values(this._data);
        const placeholders = columns.map(() => '?').join(', ');
        const columnList = columns.map(c => `\`${c}\``).join(', ');

        const sql = `INSERT INTO \`${this._table}\` (${columnList}) VALUES (${placeholders})`;
        return { sql, params: values };
    }

    /**
     * Build bulk INSERT SQL
     */
    _buildInsertMany(dataArray) {
        const columns = Object.keys(dataArray[0]);
        const columnList = columns.map(c => `\`${c}\``).join(', ');

        const valueSets = [];
        const params = [];

        for (const data of dataArray) {
            const placeholders = columns.map(() => '?').join(', ');
            valueSets.push(`(${placeholders})`);
            params.push(...columns.map(c => data[c]));
        }

        const sql = `INSERT INTO \`${this._table}\` (${columnList}) VALUES ${valueSets.join(', ')}`;
        return { sql, params };
    }

    /**
     * Build UPDATE SQL
     */
    _buildUpdate() {
        const setClauses = Object.keys(this._data).map(c => `\`${c}\` = ?`);
        const values = Object.values(this._data);

        const sql = `UPDATE \`${this._table}\` SET ${setClauses.join(', ')}${this._buildWhere()}`;
        return { sql, params: [...values, ...this._whereParams] };
    }

    /**
     * Build DELETE SQL
     */
    _buildDelete() {
        const sql = `DELETE FROM \`${this._table}\`${this._buildWhere()}`;
        return { sql, params: this._whereParams };
    }

    /**
     * Build WHERE clause
     */
    _buildWhere() {
        if (this._wheres.length === 0) return '';

        // Handle OR clauses
        const clauses = this._wheres.map((w, i) => {
            if (i === 0) return w.replace(/^OR /, '');
            return w.startsWith('OR ') ? w : `AND ${w}`;
        });

        return ` WHERE ${clauses.join(' ')}`;
    }

    /**
     * Get the raw SQL and params (for debugging)
     */
    toSQL() {
        switch (this._type) {
            case 'SELECT': return this._buildSelect();
            case 'INSERT': return this._buildInsert();
            case 'UPDATE': return this._buildUpdate();
            case 'DELETE': return this._buildDelete();
            default: return { sql: '', params: [] };
        }
    }
}

/**
 * Create a new QueryBuilder for a table
 */
export function table(name) {
    return new QueryBuilder(name);
}
