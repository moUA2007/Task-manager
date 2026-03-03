/**
 * Authentication Service
 * Handles all authentication-related operations
 */

import { apiService, ApiError } from './api.service.js';
import { ENDPOINTS, STORAGE_KEYS } from '../config/constants.js';

class AuthService {
    constructor() {
        this.listeners = new Set();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    notify(event, data) {
        this.listeners.forEach(callback => callback(event, data));
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    setToken(token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    }

    removeToken() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }

    getUser() {
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);
        return userStr ? JSON.parse(userStr) : null;
    }

    setUser(user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    removeUser() {
        localStorage.removeItem(STORAGE_KEYS.USER);
    }

    async login(credentials) {
        try {
            const response = await apiService.post(
                ENDPOINTS.AUTH.LOGIN,
                credentials,
                { auth: false }
            );

            if (response.status === 'success' && response.token) {
                this.setToken(response.token);
                if (response.user) {
                    this.setUser(response.user);
                }
                this.notify('login', { success: true });
                return { success: true, data: response };
            }

            throw new ApiError(response.message || 'Login failed', 400);
        } catch (error) {
            this.notify('login', { success: false, error });
            throw error;
        }
    }

    async signup(userData) {
        try {
            const response = await apiService.post(
                ENDPOINTS.AUTH.SIGNUP,
                userData,
                { auth: false }
            );

            if (response.status === 'success' && response.token) {
                this.setToken(response.token);
                if (response.user) {
                    this.setUser(response.user);
                }
                this.notify('signup', { success: true });
                return { success: true, data: response };
            }

            throw new ApiError(response.message || 'Signup failed', 400);
        } catch (error) {
            this.notify('signup', { success: false, error });
            throw error;
        }
    }

    logout() {
        this.removeToken();
        this.removeUser();
        this.notify('logout', { success: true });
    }

    async updatePassword(passwordData) {
        try {
            const response = await apiService.post(
                ENDPOINTS.USERS.UPDATE_PASSWORD,
                passwordData
            );

            if (response.status === 'success') {
                this.notify('passwordUpdated', { success: true });
                return { success: true, data: response };
            }

            throw new ApiError(response.message || 'Password update failed', 400);
        } catch (error) {
            throw error;
        }
    }

    handleAuthError() {
        this.logout();
        this.notify('authError', { message: 'Session expired. Please login again.' });
    }
}

export const authService = new AuthService();
