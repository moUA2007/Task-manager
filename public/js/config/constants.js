/**
 * Application Constants
 * Centralized configuration for the entire application
 */

export const API_CONFIG = {
    BASE_URL: '/api/v2',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
};

export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        SIGNUP: '/auth/signUp',
        LOGOUT: '/auth/logout',
        FORGOT_PASSWORD: '/auth/forget-pass',
        RESET_PASSWORD: (token) => `/auth/reset-password/${token}`
    },
    TASKS: {
        BASE: '/task',
        BY_ID: (id) => `/task/${id}`
    },
    USERS: {
        BASE: '/user',
        UPDATE_PASSWORD: '/user/updatePassword'
    }
};

export const STORAGE_KEYS = {
    TOKEN: 'taskflow_token',
    USER: 'taskflow_user',
    THEME: 'taskflow_theme'
};

export const TASK_CATEGORIES = [
    { value: 'Backend', label: 'Backend', icon: '⚙️' },
    { value: 'Frontend', label: 'Frontend', icon: '🎨' },
    { value: 'Database', label: 'Database', icon: '🗄️' },
    { value: 'Security', label: 'Security', icon: '🔒' },
    { value: 'DevOps', label: 'DevOps', icon: '🚀' }
];

export const TASK_PRIORITIES = [
    { value: 1, label: 'Very Low', color: '#64748b' },
    { value: 2, label: 'Low', color: '#8b5cf6' },
    { value: 3, label: 'Medium', color: '#14b8a6' },
    { value: 4, label: 'High', color: '#f59e0b' },
    { value: 5, label: 'Urgent', color: '#ef4444' }
];

export const TASK_DIFFICULTIES = [
    { value: 1, label: 'Very Easy' },
    { value: 2, label: 'Easy' },
    { value: 3, label: 'Medium' },
    { value: 4, label: 'Hard' },
    { value: 5, label: 'Complex' }
];

export const SORT_OPTIONS = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-priority', label: 'Priority (High to Low)' },
    { value: 'priority', label: 'Priority (Low to High)' },
    { value: 'dueDate', label: 'Due Date' }
];

export const FILTER_STATUS = {
    ALL: 'all',
    PENDING: 'pending',
    COMPLETED: 'completed'
};

export const UI_CONFIG = {
    TOAST_DURATION: 3000,
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 300
};

export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    TITLE_MIN_LENGTH: 3,
    TITLE_MAX_LENGTH: 100
};
