/**
 * Role-based access control middleware
 */

import { UnauthorizedError, ForbiddenError } from '../../src/core/error.js';

/**
 * Require authentication - checks for valid JWT token
 */
export function requireAuth() {
    return async (ctx, next) => {
        if (!ctx.state.user) {
            throw new UnauthorizedError('Authentication required');
        }
        await next();
    };
}

/**
 * Require specific role(s)
 * @param {string|string[]} roles - Required role(s)
 */
export function requireRole(...roles) {
    return async (ctx, next) => {
        if (!ctx.state.user) {
            throw new UnauthorizedError('Authentication required');
        }

        const userRole = ctx.state.user.role;
        if (!roles.includes(userRole)) {
            throw new ForbiddenError(`Access denied. Required role: ${roles.join(' or ')}`);
        }

        await next();
    };
}

/**
 * Admin only access
 */
export function requireAdmin() {
    return requireRole('admin');
}

/**
 * Employee or higher access
 */
export function requireEmployee() {
    return requireRole('admin', 'supervisor', 'employee');
}

/**
 * Client access
 */
export function requireClient() {
    return requireRole('admin', 'client');
}
