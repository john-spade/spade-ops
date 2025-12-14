/**
 * callie.js - Middleware Pipeline
 * Utilities for composing and managing middleware
 */

/**
 * Compose multiple middleware into a single function
 * Executes in order, each can call next() to proceed
 * 
 * @param {Function[]} middleware - Array of middleware functions
 * @returns {Function} - Composed middleware function
 */
export function compose(middleware) {
    if (!Array.isArray(middleware)) {
        throw new TypeError('Middleware must be an array');
    }

    for (const fn of middleware) {
        if (typeof fn !== 'function') {
            throw new TypeError('Each middleware must be a function');
        }
    }

    return function composedMiddleware(ctx, next) {
        let index = -1;

        function dispatch(i) {
            if (i <= index) {
                return Promise.reject(new Error('next() called multiple times'));
            }

            index = i;
            let fn = middleware[i];

            if (i === middleware.length) {
                fn = next;
            }

            if (!fn) {
                return Promise.resolve();
            }

            try {
                return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1)));
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return dispatch(0);
    };
}

/**
 * Create a conditional middleware that only runs if condition is true
 * 
 * @param {Function} condition - Function that returns boolean (ctx) => boolean
 * @param {Function} middleware - Middleware to run if condition is true
 * @returns {Function} - Conditional middleware
 */
export function when(condition, middleware) {
    return async (ctx, next) => {
        if (condition(ctx)) {
            await middleware(ctx, next);
        } else {
            await next();
        }
    };
}

/**
 * Create middleware that runs only for specific HTTP methods
 * 
 * @param {string|string[]} methods - HTTP method(s) to match
 * @param {Function} middleware - Middleware to run
 * @returns {Function} - Method-filtered middleware
 */
export function forMethods(methods, middleware) {
    const methodSet = new Set(
        (Array.isArray(methods) ? methods : [methods]).map(m => m.toUpperCase())
    );

    return when(ctx => methodSet.has(ctx.method), middleware);
}

/**
 * Create middleware that runs only for specific paths
 * 
 * @param {string|RegExp} pattern - Path pattern to match
 * @param {Function} middleware - Middleware to run
 * @returns {Function} - Path-filtered middleware
 */
export function forPaths(pattern, middleware) {
    const regex = typeof pattern === 'string'
        ? new RegExp(`^${pattern.replace(/:[^/]+/g, '[^/]+')}$`)
        : pattern;

    return when(ctx => regex.test(ctx.path), middleware);
}

/**
 * Logging middleware factory
 * 
 * @param {Object} options - Logging options
 * @returns {Function} - Logger middleware
 */
export function logger(options = {}) {
    const {
        format = 'simple', // 'simple' | 'detailed' | 'json'
        skip = () => false
    } = options;

    return async (ctx, next) => {
        if (skip(ctx)) {
            return next();
        }

        const start = Date.now();

        await next();

        const duration = Date.now() - start;
        const status = ctx.res.statusCode;

        if (format === 'json') {
            console.log(JSON.stringify({
                method: ctx.method,
                path: ctx.path,
                status,
                duration,
                ip: ctx.ip
            }));
        } else if (format === 'detailed') {
            console.log(`[${new Date().toISOString()}] ${ctx.method} ${ctx.path} ${status} ${duration}ms - ${ctx.ip}`);
        } else {
            console.log(`${ctx.method} ${ctx.path} ${status} ${duration}ms`);
        }
    };
}

/**
 * Request timing middleware
 * Adds X-Response-Time header
 */
export function timing() {
    return async (ctx, next) => {
        const start = Date.now();
        await next();
        const duration = Date.now() - start;
        ctx.set('X-Response-Time', `${duration}ms`);
    };
}
