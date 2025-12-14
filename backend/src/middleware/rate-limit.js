/**
 * callie.js - Rate Limiting Middleware
 * Simple in-memory rate limiting (sufficient for single-instance deployments)
 */

import { RateLimitError } from '../core/error.js';

/**
 * Rate limit storage
 * For production with multiple instances, use Redis
 */
const storage = new Map();

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of storage) {
        if (data.resetAt < now) {
            storage.delete(key);
        }
    }
}, 60000); // Clean every minute

/**
 * Rate limiting middleware factory
 * 
 * @param {Object} options - Rate limit configuration
 * @returns {Function} - Middleware function
 */
export function rateLimit(options = {}) {
    const {
        windowMs = 60000,               // 1 minute window
        max = 100,                      // Max requests per window
        message = 'Too many requests',  // Error message
        keyGenerator = null,            // Custom key generator (ctx) => string
        skip = null,                    // Skip function (ctx) => boolean
        handler = null                  // Custom handler (ctx, next, data) => void
    } = options;

    return async (ctx, next) => {
        // Skip if specified
        if (skip && await skip(ctx)) {
            return next();
        }

        // Generate key (default: IP address)
        const key = keyGenerator
            ? await keyGenerator(ctx)
            : `rate:${ctx.ip}`;

        const now = Date.now();
        let data = storage.get(key);

        // Initialize or reset if window expired
        if (!data || data.resetAt < now) {
            data = {
                count: 0,
                resetAt: now + windowMs
            };
        }

        // Increment count
        data.count++;
        storage.set(key, data);

        // Calculate remaining
        const remaining = Math.max(0, max - data.count);
        const resetAt = Math.ceil(data.resetAt / 1000);

        // Set rate limit headers
        ctx.set('X-RateLimit-Limit', String(max));
        ctx.set('X-RateLimit-Remaining', String(remaining));
        ctx.set('X-RateLimit-Reset', String(resetAt));

        // Check if limit exceeded
        if (data.count > max) {
            ctx.set('Retry-After', String(Math.ceil((data.resetAt - now) / 1000)));

            if (handler) {
                return handler(ctx, next, data);
            }

            throw new RateLimitError(message);
        }

        await next();
    };
}

/**
 * Strict rate limit for auth endpoints
 */
export function authRateLimit() {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts
        message: 'Too many login attempts. Please try again later.'
    });
}

/**
 * API rate limit (more permissive)
 */
export function apiRateLimit() {
    return rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: 100, // 100 requests per minute
        message: 'API rate limit exceeded'
    });
}

/**
 * Per-user rate limit (requires auth)
 */
export function userRateLimit(options = {}) {
    return rateLimit({
        ...options,
        keyGenerator: (ctx) => {
            const userId = ctx.state.userId || ctx.state.user?.id;
            return userId ? `rate:user:${userId}` : `rate:${ctx.ip}`;
        }
    });
}
