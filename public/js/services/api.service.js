/**
 * API Service
 * Centralized HTTP client with interceptors and error handling
 */

import { API_CONFIG, STORAGE_KEYS } from '../config/constants.js';

class ApiService {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
        this.timeout = API_CONFIG.TIMEOUT;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }

    addRequestInterceptor(interceptor) {
        this.requestInterceptors.push(interceptor);
    }

    addResponseInterceptor(interceptor) {
        this.responseInterceptors.push(interceptor);
    }

    getAuthHeaders() {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    buildURL(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.append(key, value);
            }
        });
        return url.toString();
    }

    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            params = {},
            headers = {},
            auth = true
        } = options;

        let config = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(auth ? this.getAuthHeaders() : {}),
                ...headers
            }
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config);
        }

        const url = this.buildURL(endpoint, params);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            let result = { response, data, ok: response.ok };

            for (const interceptor of this.responseInterceptors) {
                result = await interceptor(result);
            }

            if (!response.ok) {
                throw new ApiError(
                    data.message || 'Request failed',
                    response.status,
                    data
                );
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new ApiError('Request timeout', 408);
            }
            
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(
                error.message || 'Network error',
                0,
                null
            );
        }
    }

    get(endpoint, params = {}, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET', params });
    }

    post(endpoint, body = {}, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    patch(endpoint, body = {}, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    }

    put(endpoint, body = {}, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

class ApiError extends Error {
    constructor(message, statusCode, data = null) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.data = data;
        this.isAuthError = statusCode === 401;
        this.isValidationError = statusCode === 400;
        this.isNotFoundError = statusCode === 404;
        this.isServerError = statusCode >= 500;
    }
}

export const apiService = new ApiService();
export { ApiError };
