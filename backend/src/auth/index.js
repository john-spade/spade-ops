/**
 * callie.js - Authentication Module
 * JWT-based authentication with password hashing and RBAC
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../core/error.js';

// JWT secret from environment
const getSecret = () => {
    const secret = process.env.JWT_SECRET || process.env.APP_SECRET;
    if (!secret) {
        console.warn('⚠️  Warning: JWT_SECRET not set. Using default (insecure for production)');
        return 'callie-default-secret-change-me';
    }
    return secret;
};

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @param {number} rounds - Salt rounds (default: 10)
 * @returns {Promise<string>} - Hashed password
 */
export async function hashPassword(password, rounds = 10) {
    return bcrypt.hash(password, rounds);
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if match
 */
export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 * @param {Object} payload - Token payload
 * @param {Object} options - JWT options
 * @returns {string} - JWT token
 */
export function generateToken(payload, options = {}) {
    const defaultOptions = {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };

    return jwt.sign(payload, getSecret(), { ...defaultOptions, ...options });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded payload
 * @throws {UnauthorizedError} - If token is invalid
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, getSecret());
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new UnauthorizedError('Token has expired');
        }
        if (err.name === 'JsonWebTokenError') {
            throw new UnauthorizedError('Invalid token');
        }
        throw new UnauthorizedError('Authentication failed');
    }
}

/**
 * Decode a token without verification (for debugging)
 * @param {string} token - JWT token
 * @returns {Object|null} - Decoded payload or null
 */
export function decodeToken(token) {
    try {
        return jwt.decode(token);
    } catch {
        return null;
    }
}

/**
 * Authentication middleware factory
 * 
 * Usage:
 *   route.get('/profile', auth(), handler)
 *   route.get('/admin', auth('admin'), handler)
 *   route.get('/manage', auth(['admin', 'manager']), handler)
 * 
 * @param {string|string[]} roles - Required roles (optional)
 * @returns {Function} - Middleware function
 */
export function auth(roles = null) {
    return async (ctx, next) => {
        // Extract token from Authorization header
        const token = ctx.bearerToken;

        if (!token) {
            throw new UnauthorizedError('No authentication token provided');
        }

        // Verify token
        const payload = verifyToken(token);

        // Attach user to context
        ctx.state.user = payload;
        ctx.state.userId = payload.id || payload.sub || payload.userId;

        // Check roles if specified
        if (roles !== null) {
            const requiredRoles = Array.isArray(roles) ? roles : [roles];
            const userRole = payload.role || payload.roles;

            // User can have single role or array of roles
            const userRoles = Array.isArray(userRole) ? userRole : [userRole];

            // Check if user has at least one required role
            const hasRole = requiredRoles.some(role => userRoles.includes(role));

            if (!hasRole) {
                throw new ForbiddenError(`Access denied. Required role: ${requiredRoles.join(' or ')}`);
            }
        }

        await next();
    };
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export function optionalAuth() {
    return async (ctx, next) => {
        const token = ctx.bearerToken;

        if (token) {
            try {
                const payload = verifyToken(token);
                ctx.state.user = payload;
                ctx.state.userId = payload.id || payload.sub || payload.userId;
            } catch {
                // Token invalid, but that's okay for optional auth
            }
        }

        await next();
    };
}

/**
 * Refresh token generator
 * Creates a longer-lived refresh token
 */
export function generateRefreshToken(payload) {
    return generateToken(payload, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
}

/**
 * Token pair generator
 * Returns both access and refresh tokens
 */
export function generateTokenPair(payload) {
    return {
        accessToken: generateToken(payload),
        refreshToken: generateRefreshToken(payload),
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
}
