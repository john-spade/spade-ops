/**
 * callie.js - CORS Middleware
 * Cross-Origin Resource Sharing configuration
 */

/**
 * CORS middleware factory
 * 
 * @param {Object} options - CORS configuration
 * @returns {Function} - Middleware function
 */
export function cors(options = {}) {
    const {
        origin = '*',
        methods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        allowedHeaders = 'Content-Type, Authorization, X-Requested-With',
        exposedHeaders = '',
        credentials = true,
        maxAge = 86400 // 24 hours
    } = options;

    return async (ctx, next) => {
        // Determine origin value
        let originValue = origin;

        if (typeof origin === 'function') {
            originValue = await origin(ctx.get('origin'), ctx);
        } else if (Array.isArray(origin)) {
            const requestOrigin = ctx.get('origin');
            originValue = origin.includes(requestOrigin) ? requestOrigin : origin[0];
        }

        // Set CORS headers
        ctx.set('Access-Control-Allow-Origin', originValue);
        ctx.set('Access-Control-Allow-Methods', methods);
        ctx.set('Access-Control-Allow-Headers', allowedHeaders);

        if (exposedHeaders) {
            ctx.set('Access-Control-Expose-Headers', exposedHeaders);
        }

        if (credentials && originValue !== '*') {
            ctx.set('Access-Control-Allow-Credentials', 'true');
        }

        ctx.set('Access-Control-Max-Age', String(maxAge));

        // Handle preflight requests
        if (ctx.method === 'OPTIONS') {
            ctx.status(204);
            ctx.res.end();
            return;
        }

        await next();
    };
}

/**
 * Simple CORS - allows all origins
 * Use for development or public APIs
 */
export function simpleCors() {
    return cors({
        origin: '*',
        credentials: false
    });
}

/**
 * Strict CORS - only allow specific origins
 * @param {string[]} allowedOrigins - Array of allowed origins
 */
export function strictCors(allowedOrigins) {
    return cors({
        origin: allowedOrigins,
        credentials: true
    });
}
