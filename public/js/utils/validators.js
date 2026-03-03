/**
 * Validation Utilities
 * Form validation and data validation functions
 */

import { VALIDATION } from '../config/constants.js';

export const validators = {
    required: (value, fieldName = 'Field') => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return { valid: false, message: `${fieldName} is required` };
        }
        return { valid: true };
    },

    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        return { valid: true };
    },

    minLength: (value, min, fieldName = 'Field') => {
        if (value.length < min) {
            return { valid: false, message: `${fieldName} must be at least ${min} characters` };
        }
        return { valid: true };
    },

    maxLength: (value, max, fieldName = 'Field') => {
        if (value.length > max) {
            return { valid: false, message: `${fieldName} must be less than ${max} characters` };
        }
        return { valid: true };
    },

    password: (value) => {
        if (value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
            return { 
                valid: false, 
                message: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters` 
            };
        }
        return { valid: true };
    },

    passwordMatch: (password, confirmPassword) => {
        if (password !== confirmPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }
        return { valid: true };
    },

    number: (value, { min, max } = {}) => {
        const num = Number(value);
        if (isNaN(num)) {
            return { valid: false, message: 'Please enter a valid number' };
        }
        if (min !== undefined && num < min) {
            return { valid: false, message: `Value must be at least ${min}` };
        }
        if (max !== undefined && num > max) {
            return { valid: false, message: `Value must be less than ${max}` };
        }
        return { valid: true };
    },

    date: (value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return { valid: false, message: 'Please enter a valid date' };
        }
        return { valid: true };
    },

    futureDate: (value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            return { valid: false, message: 'Date must be in the future' };
        }
        return { valid: true };
    }
};

export const validateForm = (formData, rules) => {
    const errors = {};
    let isValid = true;

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = formData[field];
        
        for (const rule of fieldRules) {
            const result = rule(value);
            if (!result.valid) {
                errors[field] = result.message;
                isValid = false;
                break;
            }
        }
    }

    return { isValid, errors };
};

export const loginValidationRules = {
    email: [
        (v) => validators.required(v, 'Email'),
        (v) => validators.email(v)
    ],
    password: [
        (v) => validators.required(v, 'Password')
    ]
};

export const signupValidationRules = {
    name: [
        (v) => validators.required(v, 'Name'),
        (v) => validators.minLength(v, 2, 'Name')
    ],
    email: [
        (v) => validators.required(v, 'Email'),
        (v) => validators.email(v)
    ],
    password: [
        (v) => validators.required(v, 'Password'),
        (v) => validators.password(v)
    ]
};

export const taskValidationRules = {
    title: [
        (v) => validators.required(v, 'Title'),
        (v) => validators.minLength(v, VALIDATION.TITLE_MIN_LENGTH, 'Title'),
        (v) => validators.maxLength(v, VALIDATION.TITLE_MAX_LENGTH, 'Title')
    ],
    category: [
        (v) => validators.required(v, 'Category')
    ]
};
