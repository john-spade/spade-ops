/**
 * callie.js - Secure Headers Middleware
 * Adds security-related HTTP headers
 */

/**
 * Secure headers middleware factory
 * 
 * @param {Object} options - Header configuration
 * @returns {Function} - Middleware function
 */
export function secureHeaders(options = {}) {
    const {
        // Content Security Policy
        contentSecurityPolicy = null,

        // X-Content-Type-Options
        noSniff = true,

        // X-Frame-Options
        frameOptions = 'DENY', // DENY, SAMEORIGIN, or null to disable

        // X-XSS-Protection
        xssProtection = true,

        // Strict-Transport-Security
        hsts = null, // { maxAge: 31536000, includeSubDomains: true }

        // X-Download-Options
        noOpen = true,

        // Referrer-Policy
        referrerPolicy = 'strict-origin-when-cross-origin',

        // X-Permitted-Cross-Domain-Policies
        crossDomainPolicy = 'none',

        // Permissions-Policy (formerly Feature-Policy)
        permissionsPolicy = null
    } = options;

    return async (ctx, next) => {
        // X-Content-Type-Options: nosniff
        if (noSniff) {
            ctx.set('X-Content-Type-Options', 'nosniff');
        }

        // X-Frame-Options
        if (frameOptions) {
            ctx.set('X-Frame-Options', frameOptions);
        }

        // X-XSS-Protection
        if (xssProtection) {
            ctx.set('X-XSS-Protection', '1; mode=block');
        }

        // Strict-Transport-Security (HSTS)
        if (hsts) {
            let hstsValue = `max-age=${hsts.maxAge || 31536000}`;
            if (hsts.includeSubDomains) hstsValue += '; includeSubDomains';
            if (hsts.preload) hstsValue += '; preload';
            ctx.set('Strict-Transport-Security', hstsValue);
        }

        // X-Download-Options
        if (noOpen) {
            ctx.set('X-Download-Options', 'noopen');
        }

        // Referrer-Policy
        if (referrerPolicy) {
            ctx.set('Referrer-Policy', referrerPolicy);
        }

        // X-Permitted-Cross-Domain-Policies
        if (crossDomainPolicy) {
            ctx.set('X-Permitted-Cross-Domain-Policies', crossDomainPolicy);
        }

        // Content-Security-Policy
        if (contentSecurityPolicy) {
            const csp = typeof contentSecurityPolicy === 'string'
                ? contentSecurityPolicy
                : buildCSP(contentSecurityPolicy);
            ctx.set('Content-Security-Policy', csp);
        }

        // Permissions-Policy
        if (permissionsPolicy) {
            const pp = typeof permissionsPolicy === 'string'
                ? permissionsPolicy
                : buildPermissionsPolicy(permissionsPolicy);
            ctx.set('Permissions-Policy', pp);
        }

        await next();
    };
}

/**
 * Build CSP header from object
 */
function buildCSP(policy) {
    return Object.entries(policy)
        .map(([key, value]) => {
            const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            const values = Array.isArray(value) ? value.join(' ') : value;
            return `${directive} ${values}`;
        })
        .join('; ');
}

/**
 * Build Permissions-Policy header from object
 */
function buildPermissionsPolicy(policy) {
    return Object.entries(policy)
        .map(([key, value]) => {
            if (value === true) return `${key}=*`;
            if (value === false) return `${key}=()`;
            const origins = Array.isArray(value) ? value : [value];
            return `${key}=(${origins.map(o => `"${o}"`).join(' ')})`;
        })
        .join(', ');
}

/**
 * Default secure headers (recommended for APIs)
 */
export function defaultSecureHeaders() {
    return secureHeaders();
}

/**
 * Strict secure headers (for production)
 */
export function strictSecureHeaders() {
    return secureHeaders({
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true
        },
        contentSecurityPolicy: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", 'data:'],
            fontSrc: ["'self'"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"]
        }
    });
}
