/**
 * callie.js - HTTP Server Bootstrap
 * Wraps Node.js native HTTP server with middleware support
 */

import http from 'node:http';
import { Router } from './router.js';
import { Context } from './context.js';
import { errorHandler, NotFoundError } from './error.js';

export class Callie {
    constructor(options = {}) {
        this.port = options.port || process.env.PORT || 3000;
        this.host = options.host || process.env.HOST || '0.0.0.0';
        this.router = new Router();
        this.globalMiddleware = [];
        this.server = null;
        this.errorHandler = options.errorHandler || errorHandler;
    }

    /**
     * Register global middleware
     * @param {Function} middleware - Middleware function (ctx, next) => {}
     */
    use(middleware) {
        if (typeof middleware === 'function') {
            this.globalMiddleware.push(middleware);
        } else if (middleware instanceof Router) {
            // Mount a sub-router
            this.router.merge(middleware);
        }
        return this;
    }

    /**
     * HTTP method shortcuts
     */
    get(path, ...handlers) {
        this.router.add('GET', path, handlers);
        return this;
    }

    post(path, ...handlers) {
        this.router.add('POST', path, handlers);
        return this;
    }

    put(path, ...handlers) {
        this.router.add('PUT', path, handlers);
        return this;
    }

    patch(path, ...handlers) {
        this.router.add('PATCH', path, handlers);
        return this;
    }

    delete(path, ...handlers) {
        this.router.add('DELETE', path, handlers);
        return this;
    }

    options(path, ...handlers) {
        this.router.add('OPTIONS', path, handlers);
        return this;
    }

    /**
     * Group routes with a common prefix and middleware
     * @param {string} prefix - Route prefix
     * @param {Function|Function[]} middleware - Middleware to apply
     * @param {Function} callback - Callback that receives a router instance
     */
    group(prefix, middleware, callback) {
        if (typeof middleware === 'function' && callback === undefined) {
            callback = middleware;
            middleware = [];
        }
        const groupRouter = new Router(prefix, Array.isArray(middleware) ? middleware : [middleware]);
        callback(groupRouter);
        this.router.merge(groupRouter);
        return this;
    }

    /**
     * Main request handler
     */
    async handleRequest(req, res) {
        const ctx = new Context(req, res);

        try {
            // Run global middleware first (includes CORS)
            // This ensures preflight requests get CORS headers
            let middlewareIndex = 0;
            let middlewareComplete = false;

            const runNextMiddleware = async () => {
                if (middlewareIndex >= this.globalMiddleware.length) {
                    middlewareComplete = true;
                    return;
                }
                const middleware = this.globalMiddleware[middlewareIndex++];
                await middleware(ctx, runNextMiddleware);
            };

            await runNextMiddleware();

            // If response was ended by middleware (e.g., CORS preflight), stop here
            if (ctx.res.writableEnded) {
                return;
            }

            // Parse body for POST/PUT/PATCH
            if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
                await ctx.parseBody();
            }

            // Match route
            const route = this.router.match(req.method, ctx.path);

            if (!route) {
                throw new NotFoundError(`Route ${req.method} ${ctx.path} not found`);
            }

            // Set route params
            ctx.params = route.params;

            // Execute route handlers
            await this.executeChain(ctx, route.handlers);

        } catch (err) {
            await this.errorHandler(err, ctx);
        }
    }

    /**
     * Execute middleware chain with next() support
     */
    async executeChain(ctx, handlers) {
        let index = 0;

        const next = async () => {
            if (index >= handlers.length) return;

            const handler = handlers[index++];
            await handler(ctx, next);
        };

        await next();
    }

    /**
     * Start the HTTP server
     */
    listen(port, callback) {
        if (typeof port === 'function') {
            callback = port;
            port = this.port;
        }

        this.port = port || this.port;

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });

        this.server.listen(this.port, this.host, () => {
            console.log(`🚀 Callie server running at http://${this.host}:${this.port}`);
            if (callback) callback();
        });

        return this.server;
    }

    /**
     * Stop the server
     */
    close() {
        if (this.server) {
            this.server.close();
        }
    }
}

// Factory function for express-like usage
export function createApp(options) {
    return new Callie(options);
}
