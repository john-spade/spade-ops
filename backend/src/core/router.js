/**
 * callie.js - Fast Router Engine
 * Supports dynamic params, middleware per route, and route groups
 */

export class Router {
    constructor(prefix = '', middleware = []) {
        this.prefix = prefix;
        this.middleware = middleware;
        this.routes = new Map(); // method -> [{ pattern, regex, paramNames, handlers }]
    }

    /**
     * Add a route
     * @param {string} method - HTTP method
     * @param {string} path - Route path (supports :param syntax)
     * @param {Function[]} handlers - Array of handler functions
     */
    add(method, path, handlers) {
        const fullPath = this.normalizePath(this.prefix + path);
        const { regex, paramNames } = this.compilePath(fullPath);

        if (!this.routes.has(method)) {
            this.routes.set(method, []);
        }

        this.routes.get(method).push({
            pattern: fullPath,
            regex,
            paramNames,
            handlers: [...this.middleware, ...handlers]
        });

        return this;
    }

    /**
     * HTTP method shortcuts
     */
    get(path, ...handlers) {
        return this.add('GET', path, handlers);
    }

    post(path, ...handlers) {
        return this.add('POST', path, handlers);
    }

    put(path, ...handlers) {
        return this.add('PUT', path, handlers);
    }

    patch(path, ...handlers) {
        return this.add('PATCH', path, handlers);
    }

    delete(path, ...handlers) {
        return this.add('DELETE', path, handlers);
    }

    options(path, ...handlers) {
        return this.add('OPTIONS', path, handlers);
    }

    /**
     * Create a route group with prefix and optional middleware
     */
    group(prefix, middleware, callback) {
        if (typeof middleware === 'function' && callback === undefined) {
            callback = middleware;
            middleware = [];
        }

        const groupRouter = new Router(
            this.prefix + prefix,
            [...this.middleware, ...(Array.isArray(middleware) ? middleware : [middleware])]
        );

        callback(groupRouter);
        this.merge(groupRouter);

        return this;
    }

    /**
     * Merge another router's routes into this one
     */
    merge(router) {
        for (const [method, routes] of router.routes) {
            if (!this.routes.has(method)) {
                this.routes.set(method, []);
            }
            this.routes.get(method).push(...routes);
        }
        return this;
    }

    /**
     * Match a request to a route
     * @param {string} method - HTTP method
     * @param {string} path - Request path
     * @returns {Object|null} - Matched route with params or null
     */
    match(method, path) {
        const normalizedPath = this.normalizePath(path);
        const routes = this.routes.get(method);

        if (!routes) return null;

        for (const route of routes) {
            const match = normalizedPath.match(route.regex);

            if (match) {
                const params = {};
                route.paramNames.forEach((name, i) => {
                    params[name] = decodeURIComponent(match[i + 1]);
                });

                return {
                    pattern: route.pattern,
                    params,
                    handlers: route.handlers
                };
            }
        }

        return null;
    }

    /**
     * Compile a path pattern to regex
     * Supports :param and *wildcard syntax
     */
    compilePath(path) {
        const paramNames = [];

        // Escape special regex chars except : and *
        let regexStr = path
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
            // Named parameters :param
            .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
                paramNames.push(name);
                return '([^/]+)';
            })
            // Wildcard *
            .replace(/\*/g, '(.*)');

        return {
            regex: new RegExp(`^${regexStr}$`),
            paramNames
        };
    }

    /**
     * Normalize path - ensure leading slash, remove trailing slash
     */
    normalizePath(path) {
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        return path;
    }

    /**
     * Get all registered routes (for debugging)
     */
    getRoutes() {
        const routes = [];
        for (const [method, methodRoutes] of this.routes) {
            for (const route of methodRoutes) {
                routes.push({
                    method,
                    pattern: route.pattern,
                    handlersCount: route.handlers.length
                });
            }
        }
        return routes;
    }
}
