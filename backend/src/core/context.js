/**
 * callie.js - Request/Response Context Abstraction
 * Provides a clean API for handling HTTP requests and responses
 */

import { URL } from 'node:url';
import { success, error } from './response.js';

export class Context {
    constructor(req, res) {
        this.req = req;
        this.res = res;

        // Parse URL
        const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        this.method = req.method;
        this.path = parsedUrl.pathname;
        this.url = req.url;
        this.headers = req.headers;

        // Parse query parameters
        this.query = Object.fromEntries(parsedUrl.searchParams);

        // Route params (set by router)
        this.params = {};

        // Request body (set by parseBody)
        this.body = null;

        // State for passing data between middleware
        this.state = {};

        // Response state
        this._responded = false;
    }

    /**
     * Get a specific header (case-insensitive)
     */
    get(header) {
        return this.headers[header.toLowerCase()];
    }

    /**
     * Set a response header
     */
    set(header, value) {
        this.res.setHeader(header, value);
        return this;
    }

    /**
     * Set response status code
     */
    status(code) {
        this.res.statusCode = code;
        return this;
    }

    /**
     * Parse request body
     * Supports JSON and URL-encoded forms
     */
    async parseBody() {
        return new Promise((resolve, reject) => {
            const chunks = [];

            this.req.on('data', chunk => chunks.push(chunk));

            this.req.on('end', () => {
                const raw = Buffer.concat(chunks).toString();

                if (!raw) {
                    this.body = {};
                    return resolve(this.body);
                }

                const contentType = this.get('content-type') || '';

                try {
                    if (contentType.includes('application/json')) {
                        this.body = JSON.parse(raw);
                    } else if (contentType.includes('application/x-www-form-urlencoded')) {
                        this.body = Object.fromEntries(new URLSearchParams(raw));
                    } else {
                        // Default to trying JSON, fall back to raw
                        try {
                            this.body = JSON.parse(raw);
                        } catch {
                            this.body = { raw };
                        }
                    }
                    resolve(this.body);
                } catch (err) {
                    reject(new Error('Failed to parse request body'));
                }
            });

            this.req.on('error', reject);
        });
    }

    /**
     * Send JSON response (raw, without wrapper)
     */
    json(data, statusCode = 200) {
        if (this._responded) return;
        this._responded = true;

        this.res.statusCode = statusCode;
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify(data));
    }

    /**
     * Send success response with standard wrapper
     * { success: true, data: {}, message: "OK" }
     */
    success(data = null, message = 'OK', statusCode = 200) {
        if (this._responded) return;
        this._responded = true;

        this.res.statusCode = statusCode;
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify(success(data, message)));
    }

    /**
     * Send error response with standard wrapper
     * { success: false, error: {}, message: "Error" }
     */
    error(message = 'Error', statusCode = 400, errors = null) {
        if (this._responded) return;
        this._responded = true;

        this.res.statusCode = statusCode;
        this.res.setHeader('Content-Type', 'application/json');
        this.res.end(JSON.stringify(error(message, errors)));
    }

    /**
     * Send plain text response
     */
    text(data, statusCode = 200) {
        if (this._responded) return;
        this._responded = true;

        this.res.statusCode = statusCode;
        this.res.setHeader('Content-Type', 'text/plain');
        this.res.end(String(data));
    }

    /**
     * Send HTML response
     */
    html(data, statusCode = 200) {
        if (this._responded) return;
        this._responded = true;

        this.res.statusCode = statusCode;
        this.res.setHeader('Content-Type', 'text/html');
        this.res.end(String(data));
    }

    /**
     * Redirect to another URL
     */
    redirect(url, statusCode = 302) {
        if (this._responded) return;
        this._responded = true;

        this.res.statusCode = statusCode;
        this.res.setHeader('Location', url);
        this.res.end();
    }

    /**
     * Check if response has been sent
     */
    get responded() {
        return this._responded;
    }

    /**
     * Get bearer token from Authorization header
     */
    get bearerToken() {
        const auth = this.get('authorization');
        if (auth && auth.startsWith('Bearer ')) {
            return auth.slice(7);
        }
        return null;
    }

    /**
     * Get the client IP address
     */
    get ip() {
        return this.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            this.get('x-real-ip') ||
            this.req.socket?.remoteAddress ||
            'unknown';
    }
}
