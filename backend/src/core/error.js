/**
 * callie.js - Global Error Handling
 * Centralized error handling with custom error types
 */

import { error } from './response.js';

/**
 * Base error class for Callie errors
 */
export class CallieError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.name = 'CallieError';
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            errors: this.errors
        };
    }
}

/**
 * 404 Not Found Error
 */
export class NotFoundError extends CallieError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * 400 Validation Error
 */
export class ValidationError extends CallieError {
    constructor(message = 'Validation failed', errors = null) {
        super(message, 400, errors);
        this.name = 'ValidationError';
    }
}

/**
 * 401 Unauthorized Error
 */
export class UnauthorizedError extends CallieError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

/**
 * 403 Forbidden Error
 */
export class ForbiddenError extends CallieError {
    constructor(message = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

/**
 * 409 Conflict Error
 */
export class ConflictError extends CallieError {
    constructor(message = 'Conflict') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}

/**
 * 429 Rate Limit Error
 */
export class RateLimitError extends CallieError {
    constructor(message = 'Too many requests') {
        super(message, 429);
        this.name = 'RateLimitError';
    }
}

/**
 * 500 Internal Server Error
 */
export class InternalError extends CallieError {
    constructor(message = 'Internal server error') {
        super(message, 500);
        this.name = 'InternalError';
    }
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Context} ctx - Request context
 */
export async function errorHandler(err, ctx) {
    // Determine status code
    const statusCode = err.statusCode || err.status || 500;

    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[ERROR] ${err.name}: ${err.message}`);
        if (err.stack) {
            console.error(err.stack);
        }
    }

    // Don't expose internal error details in production
    const message = statusCode === 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    // Send error response
    ctx.res.statusCode = statusCode;
    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.end(JSON.stringify(error(message, err.errors)));
}

/**
 * Async handler wrapper - catches errors and passes to error handler
 * @param {Function} fn - Async handler function
 * @returns {Function} - Wrapped handler
 */
export function asyncHandler(fn) {
    return async (ctx, next) => {
        try {
            await fn(ctx, next);
        } catch (err) {
            throw err; // Let the global handler catch it
        }
    };
}

/**
 * Assert condition or throw error
 * @param {boolean} condition - Condition to check
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
export function assert(condition, message, statusCode = 400) {
    if (!condition) {
        throw new CallieError(message, statusCode);
    }
}

/**
 * Assert resource exists or throw 404
 * @param {*} resource - Resource to check
 * @param {string} message - Error message
 */
export function assertFound(resource, message = 'Resource not found') {
    if (!resource) {
        throw new NotFoundError(message);
    }
}
