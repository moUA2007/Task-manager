/**
 * Auth Component
 * Login and Signup forms with validation
 */

import { Component } from './Component.js';
import { authService } from '../services/index.js';
import { validateForm, loginValidationRules, signupValidationRules, validators } from '../utils/validators.js';
import { toast } from './Toast.js';
import { loading } from './Loading.js';
import { EVENTS } from '../store/eventBus.js';

export class Auth extends Component {
    constructor(container) {
        super(container);
        this.state = {
            view: 'login',
            errors: {}
        };
    }

    template() {
        return `
            <div class="auth">
                <div class="auth__bg">
                    <div class="auth__shape auth__shape--1"></div>
                    <div class="auth__shape auth__shape--2"></div>
                    <div class="auth__shape auth__shape--3"></div>
                </div>
                
                <div class="auth__container">
                    <div class="auth__header">
                        <div class="logo">
                            <span class="logo__icon">✓</span>
                            <span class="logo__text">TaskFlow</span>
                        </div>
                        <p class="auth__subtitle">Smart Task Management System</p>
                    </div>

                    <div class="auth__card">
                        ${this.state.view === 'login' ? this.loginTemplate() : this.signupTemplate()}
                    </div>
                </div>
            </div>
        `;
    }

    loginTemplate() {
        return `
            <h2 class="auth__title">Welcome Back</h2>
            <form class="auth__form" id="login-form">
                <div class="form-group ${this.state.errors.email ? 'form-group--error' : ''}">
                    <label class="form-label" for="login-email">Email</label>
                    <input 
                        type="email" 
                        id="login-email" 
                        class="form-input" 
                        placeholder="you@example.com"
                        autocomplete="email"
                        required
                    >
                    ${this.state.errors.email ? `<span class="form-error">${this.state.errors.email}</span>` : ''}
                </div>
                <div class="form-group ${this.state.errors.password ? 'form-group--error' : ''}">
                    <label class="form-label" for="login-password">Password</label>
                    <input 
                        type="password" 
                        id="login-password" 
                        class="form-input" 
                        placeholder="••••••••"
                        autocomplete="current-password"
                        required
                    >
                    ${this.state.errors.password ? `<span class="form-error">${this.state.errors.password}</span>` : ''}
                </div>
                <button type="submit" class="btn btn--primary btn--full">
                    <span>Sign In</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
            </form>
            <p class="auth__switch">
                Don't have an account? 
                <a href="#" class="auth__link" data-action="show-signup">Create one</a>
            </p>
        `;
    }

    signupTemplate() {
        return `
            <h2 class="auth__title">Create Account</h2>
            <form class="auth__form" id="signup-form">
                <div class="form-group ${this.state.errors.name ? 'form-group--error' : ''}">
                    <label class="form-label" for="signup-name">Full Name</label>
                    <input 
                        type="text" 
                        id="signup-name" 
                        class="form-input" 
                        placeholder="John Doe"
                        autocomplete="name"
                        required
                    >
                    ${this.state.errors.name ? `<span class="form-error">${this.state.errors.name}</span>` : ''}
                </div>
                <div class="form-group ${this.state.errors.email ? 'form-group--error' : ''}">
                    <label class="form-label" for="signup-email">Email</label>
                    <input 
                        type="email" 
                        id="signup-email" 
                        class="form-input" 
                        placeholder="you@example.com"
                        autocomplete="email"
                        required
                    >
                    ${this.state.errors.email ? `<span class="form-error">${this.state.errors.email}</span>` : ''}
                </div>
                <div class="form-group ${this.state.errors.password ? 'form-group--error' : ''}">
                    <label class="form-label" for="signup-password">Password</label>
                    <input 
                        type="password" 
                        id="signup-password" 
                        class="form-input" 
                        placeholder="••••••••"
                        autocomplete="new-password"
                        minlength="8"
                        required
                    >
                    ${this.state.errors.password ? `<span class="form-error">${this.state.errors.password}</span>` : ''}
                </div>
                <div class="form-group ${this.state.errors.confirmPassword ? 'form-group--error' : ''}">
                    <label class="form-label" for="signup-confirm">Confirm Password</label>
                    <input 
                        type="password" 
                        id="signup-confirm" 
                        class="form-input" 
                        placeholder="••••••••"
                        autocomplete="new-password"
                        required
                    >
                    ${this.state.errors.confirmPassword ? `<span class="form-error">${this.state.errors.confirmPassword}</span>` : ''}
                </div>
                <button type="submit" class="btn btn--primary btn--full">
                    <span>Create Account</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                </button>
            </form>
            <p class="auth__switch">
                Already have an account? 
                <a href="#" class="auth__link" data-action="show-login">Sign in</a>
            </p>
        `;
    }

    bindEvents() {
        const loginForm = this.$('#login-form');
        const signupForm = this.$('#signup-form');
        const showSignup = this.$('[data-action="show-signup"]');
        const showLogin = this.$('[data-action="show-login"]');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }

        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                this.setState({ view: 'signup', errors: {} });
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.setState({ view: 'login', errors: {} });
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = this.$('#login-email').value.trim();
        const password = this.$('#login-password').value;

        const validation = validateForm({ email, password }, loginValidationRules);
        
        if (!validation.isValid) {
            this.setState({ errors: validation.errors });
            return;
        }

        loading.start('Signing in...');

        try {
            await authService.login({ email, password });
            toast.success('Welcome back!');
            this.emit(EVENTS.AUTH_LOGIN);
        } catch (error) {
            toast.error(error.message || 'Invalid email or password');
            this.setState({ errors: { password: 'Invalid credentials' } });
        } finally {
            loading.end();
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = this.$('#signup-name').value.trim();
        const email = this.$('#signup-email').value.trim();
        const password = this.$('#signup-password').value;
        const confirmPassword = this.$('#signup-confirm').value;

        const validation = validateForm({ name, email, password }, signupValidationRules);
        
        if (!validation.isValid) {
            this.setState({ errors: validation.errors });
            return;
        }

        const passwordMatch = validators.passwordMatch(password, confirmPassword);
        if (!passwordMatch.valid) {
            this.setState({ errors: { confirmPassword: passwordMatch.message } });
            return;
        }

        loading.start('Creating account...');

        try {
            await authService.signup({ 
                name, 
                email, 
                password, 
                confirmedPassword: confirmPassword 
            });
            toast.success('Account created successfully!');
            this.emit(EVENTS.AUTH_LOGIN);
        } catch (error) {
            toast.error(error.message || 'Failed to create account');
        } finally {
            loading.end();
        }
    }
}
