/**
 * callie.js - Main Entry Point
 * The Lightweight JS Framework That Replaces Laravel for SMBs
 */

// Core exports
export { Callie } from './core/server.js';
export { Router } from './core/router.js';
export { Context } from './core/context.js';
export { response, success, error as errorResponse } from './core/response.js';
export { errorHandler, CallieError, NotFoundError, ValidationError, UnauthorizedError } from './core/error.js';

// Database exports
export { db, createConnection } from './database/index.js';
export { QueryBuilder } from './database/query-builder.js';

// Auth exports
export { auth, hashPassword, verifyPassword, generateToken, verifyToken, optionalAuth } from './auth/index.js';

// Middleware exports
export { cors } from './middleware/cors.js';
export { rateLimit } from './middleware/rate-limit.js';
export { secureHeaders } from './middleware/secure-headers.js';
export { validate } from './middleware/validate.js';
