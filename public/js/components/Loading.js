/**
 * Loading Component
 * Global loading overlay with spinner
 */

import { Component } from './Component.js';
import { EVENTS } from '../store/eventBus.js';

class Loading extends Component {
    constructor() {
        super(null);
        this.loadingCount = 0;
        this.createContainer();
        this.subscribeToEvent(EVENTS.LOADING_START, this.start.bind(this));
        this.subscribeToEvent(EVENTS.LOADING_END, this.end.bind(this));
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'loading-overlay';
        this.container.className = 'loading-overlay hidden';
        this.container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p class="loading-text">Loading...</p>
            </div>
        `;
        document.body.appendChild(this.container);
    }

    start(text = 'Loading...') {
        this.loadingCount++;
        this.container.querySelector('.loading-text').textContent = text;
        this.container.classList.remove('hidden');
        this.dispatch('SET_LOADING', true);
    }

    end() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (this.loadingCount === 0) {
            this.container.classList.add('hidden');
            this.dispatch('SET_LOADING', false);
        }
    }

    forceEnd() {
        this.loadingCount = 0;
        this.container.classList.add('hidden');
        this.dispatch('SET_LOADING', false);
    }
}

export const loading = new Loading();
