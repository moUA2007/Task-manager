/**
 * Modal Component
 * Reusable modal dialog system
 */

import { Component } from './Component.js';
import { EVENTS } from '../store/eventBus.js';

export class Modal extends Component {
    constructor(options = {}) {
        super(null, options);
        this.isOpen = false;
        this.onClose = options.onClose || (() => {});
        this.onConfirm = options.onConfirm || (() => {});
        this.createModal();
    }

    createModal() {
        this.container = document.createElement('div');
        this.container.className = 'modal hidden';
        this.container.innerHTML = this.template();
        document.body.appendChild(this.container);
        this.bindModalEvents();
    }

    template() {
        const { title = '', size = 'medium', closable = true } = this.options;
        
        return `
            <div class="modal__overlay"></div>
            <div class="modal__content modal__content--${size}">
                <div class="modal__header">
                    <h2 class="modal__title">${title}</h2>
                    ${closable ? `
                        <button class="modal__close" aria-label="Close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    ` : ''}
                </div>
                <div class="modal__body"></div>
                <div class="modal__footer"></div>
            </div>
        `;
    }

    bindModalEvents() {
        const overlay = this.$('.modal__overlay');
        const closeBtn = this.$('.modal__close');

        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    setTitle(title) {
        const titleEl = this.$('.modal__title');
        if (titleEl) titleEl.textContent = title;
    }

    setBody(content) {
        const body = this.$('.modal__body');
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
    }

    setFooter(content) {
        const footer = this.$('.modal__footer');
        if (footer) {
            if (typeof content === 'string') {
                footer.innerHTML = content;
            } else {
                footer.innerHTML = '';
                footer.appendChild(content);
            }
        }
    }

    open() {
        this.isOpen = true;
        this.container.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.dispatch('SET_MODAL', this.options.id || true);
        
        requestAnimationFrame(() => {
            this.container.classList.add('modal--visible');
        });
    }

    close() {
        this.isOpen = false;
        this.container.classList.remove('modal--visible');
        
        setTimeout(() => {
            this.container.classList.add('hidden');
            document.body.style.overflow = '';
            this.dispatch('SET_MODAL', null);
            this.onClose();
        }, 300);
    }

    destroy() {
        super.destroy();
        this.container.remove();
    }
}

export class ConfirmModal extends Modal {
    constructor(options = {}) {
        super({
            ...options,
            size: 'small'
        });
    }

    confirm(message, onConfirm, onCancel = () => {}) {
        this.setTitle(this.options.title || 'Confirm');
        this.setBody(`<p class="modal__message">${message}</p>`);
        this.setFooter(`
            <button class="btn btn--secondary" data-action="cancel">Cancel</button>
            <button class="btn btn--danger" data-action="confirm">Confirm</button>
        `);

        this.$('[data-action="cancel"]').addEventListener('click', () => {
            onCancel();
            this.close();
        });

        this.$('[data-action="confirm"]').addEventListener('click', () => {
            onConfirm();
            this.close();
        });

        this.open();
    }
}
