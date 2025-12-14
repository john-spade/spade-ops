/**
 * callie.js - Input Validation Middleware
 * Simple validation hooks for request data
 */

import { ValidationError } from '../core/error.js';

/**
 * Validation rules
 */
const rules = {
    required: (value) => value !== undefined && value !== null && value !== '',
    string: (value) => typeof value === 'string',
    number: (value) => typeof value === 'number' && !isNaN(value),
    integer: (value) => Number.isInteger(value),
    boolean: (value) => typeof value === 'boolean',
    array: (value) => Array.isArray(value),
    object: (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    url: (value) => {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },
    min: (value, min) => {
        if (typeof value === 'string' || Array.isArray(value)) return value.length >= min;
        if (typeof value === 'number') return value >= min;
        return false;
    },
    max: (value, max) => {
        if (typeof value === 'string' || Array.isArray(value)) return value.length <= max;
        if (typeof value === 'number') return value <= max;
        return false;
    },
    between: (value, min, max) => rules.min(value, min) && rules.max(value, max),
    in: (value, options) => options.includes(value),
    notIn: (value, options) => !options.includes(value),
    regex: (value, pattern) => new RegExp(pattern).test(value),
    date: (value) => !isNaN(Date.parse(value)),
    uuid: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value),
    alphanumeric: (value) => /^[a-zA-Z0-9]+$/.test(value),
    alpha: (value) => /^[a-zA-Z]+$/.test(value),
    numeric: (value) => /^[0-9]+$/.test(value)
};

/**
 * Parse a rule string into rule name and arguments
 * e.g., "min:3" -> { name: "min", args: [3] }
 */
function parseRule(rule) {
    const [name, ...args] = rule.split(':');
    return {
        name,
        args: args.length > 0
            ? args.join(':').split(',').map(a => {
                const num = Number(a);
                return isNaN(num) ? a : num;
            })
            : []
    };
}

/**
 * Validate a value against rules
 */
function validateValue(value, ruleString, field) {
    const errors = [];
    const ruleList = ruleString.split('|');

    for (const ruleItem of ruleList) {
        const { name, args } = parseRule(ruleItem);

        // Skip validation if value is empty and not required
        if (!rules.required(value) && name !== 'required') {
            continue;
        }

        const validator = rules[name];
        if (!validator) {
            console.warn(`Unknown validation rule: ${name}`);
            continue;
        }

        const isValid = validator(value, ...args);

        if (!isValid) {
            errors.push(formatError(name, field, args));
        }
    }

    return errors;
}

/**
 * Format error message
 */
function formatError(rule, field, args) {
    const messages = {
        required: `${field} is required`,
        string: `${field} must be a string`,
        number: `${field} must be a number`,
        integer: `${field} must be an integer`,
        boolean: `${field} must be a boolean`,
        array: `${field} must be an array`,
        object: `${field} must be an object`,
        email: `${field} must be a valid email`,
        url: `${field} must be a valid URL`,
        min: `${field} must be at least ${args[0]}`,
        max: `${field} must be at most ${args[0]}`,
        between: `${field} must be between ${args[0]} and ${args[1]}`,
        in: `${field} must be one of: ${args.join(', ')}`,
        notIn: `${field} must not be one of: ${args.join(', ')}`,
        regex: `${field} format is invalid`,
        date: `${field} must be a valid date`,
        uuid: `${field} must be a valid UUID`,
        alphanumeric: `${field} must be alphanumeric`,
        alpha: `${field} must contain only letters`,
        numeric: `${field} must contain only numbers`
    };

    return messages[rule] || `${field} is invalid`;
}

/**
 * Validate an object against a schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Validation schema { field: 'required|string|min:3' }
 * @returns {Object} - { valid: boolean, errors: { field: string[] } }
 */
export function validateData(data, schema) {
    const errors = {};
    let valid = true;

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];
        const fieldErrors = validateValue(value, rules, field);

        if (fieldErrors.length > 0) {
            valid = false;
            errors[field] = fieldErrors;
        }
    }

    return { valid, errors };
}

/**
 * Validation middleware factory
 * 
 * @param {Object} schema - Validation schema
 * @param {string} source - Data source: 'body', 'query', 'params'
 * @returns {Function} - Middleware function
 */
export function validate(schema, source = 'body') {
    return async (ctx, next) => {
        const data = ctx[source] || {};
        const { valid, errors } = validateData(data, schema);

        if (!valid) {
            throw new ValidationError('Validation failed', errors);
        }

        await next();
    };
}

/**
 * Validate body
 */
export function validateBody(schema) {
    return validate(schema, 'body');
}

/**
 * Validate query params
 */
export function validateQuery(schema) {
    return validate(schema, 'query');
}

/**
 * Validate route params
 */
export function validateParams(schema) {
    return validate(schema, 'params');
}

/**
 * Add custom validation rule
 */
export function addRule(name, validator) {
    rules[name] = validator;
}
