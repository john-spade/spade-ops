/**
 * callie.js - Unified JSON Response Handler
 * Provides consistent response format for frontend integration
 */

/**
 * Standard success response format
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @returns {Object} - Formatted response
 */
export function success(data = null, message = 'OK') {
    return {
        success: true,
        data,
        message
    };
}

/**
 * Standard error response format
 * @param {string} message - Error message
 * @param {*} errors - Detailed errors (validation errors, etc.)
 * @returns {Object} - Formatted response
 */
export function error(message = 'Error', errors = null) {
    const response = {
        success: false,
        message
    };

    if (errors !== null) {
        response.errors = errors;
    }

    return response;
}

/**
 * Paginated response format
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 * @returns {Object} - Formatted paginated response
 */
export function paginated(data, pagination) {
    const { page = 1, perPage = 10, total = 0 } = pagination;
    const totalPages = Math.ceil(total / perPage);

    return {
        success: true,
        data,
        pagination: {
            page,
            perPage,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        },
        message: 'OK'
    };
}

/**
 * Created response (201)
 * @param {*} data - Created resource
 * @param {string} message - Success message
 * @returns {Object} - Formatted response
 */
export function created(data = null, message = 'Created successfully') {
    return success(data, message);
}

/**
 * No content response helper
 * @param {string} message - Message
 * @returns {Object} - Formatted response
 */
export function noContent(message = 'No content') {
    return success(null, message);
}

/**
 * Response builder for chaining
 */
export class ResponseBuilder {
    constructor() {
        this._data = null;
        this._message = 'OK';
        this._success = true;
        this._meta = {};
    }

    data(data) {
        this._data = data;
        return this;
    }

    message(msg) {
        this._message = msg;
        return this;
    }

    meta(key, value) {
        this._meta[key] = value;
        return this;
    }

    fail() {
        this._success = false;
        return this;
    }

    build() {
        const response = {
            success: this._success,
            data: this._data,
            message: this._message
        };

        if (Object.keys(this._meta).length > 0) {
            response.meta = this._meta;
        }

        return response;
    }
}

/**
 * Factory for response builder
 */
export function response() {
    return new ResponseBuilder();
}
