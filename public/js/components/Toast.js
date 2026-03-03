/**
 * Toast Component
 * Notification system for user feedback
 */

import { Component } from './Component.js';
import { UI_CONFIG } from '../config/constants.js';
import { EVENTS } from '../store/eventBus.js';

class Toast extends Component {
    constructor() {
        super(null);
        this.queue = [];
        this.isShowing = false;
        this.createContainer();
        this.subscribeToEvent(EVENTS.TOAST_SHOW, this.show.bind(this));
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'success', duration = UI_CONFIG.TOAST_DURATION) {
        this.queue.push({ message, type, duration });
        
        if (!this.isShowing) {
            this.processQueue();
        }
    }

    processQueue() {
        if (this.queue.length === 0) {
            this.isShowing = false;
            return;
        }

        this.isShowing = true;
        const { message, type, duration } = this.queue.shift();

        const toast = this.createToast(message, type);
        this.container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        setTimeout(() => {
            this.hideToast(toast);
        }, duration);
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <span class="toast__icon">${icon}</span>
            <span class="toast__message">${message}</span>
            <button class="toast__close" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        toast.querySelector('.toast__close').addEventListener('click', () => {
            this.hideToast(toast);
        });

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };
        return icons[type] || icons.info;
    }

    hideToast(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            toast.remove();
            this.processQueue();
        }, 300);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

export const toast = new Toast();
