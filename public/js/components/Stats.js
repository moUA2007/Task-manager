/**
 * Stats Component
 * Dashboard statistics cards
 */

import { Component } from './Component.js';

export class Stats extends Component {
    constructor(container) {
        super(container);
        this.subscribeToStore('SET_TASKS', () => this.update());
        this.subscribeToStore('ADD_TASK', () => this.update());
        this.subscribeToStore('UPDATE_TASK', () => this.update());
        this.subscribeToStore('DELETE_TASK', () => this.update());
    }

    template() {
        const { stats } = this.getStoreState();

        return `
            <div class="stats">
                <div class="stats__card">
                    <div class="stats__icon stats__icon--total">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                    </div>
                    <div class="stats__info">
                        <span class="stats__number">${stats.total}</span>
                        <span class="stats__label">Total Tasks</span>
                    </div>
                </div>

                <div class="stats__card">
                    <div class="stats__icon stats__icon--pending">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div class="stats__info">
                        <span class="stats__number">${stats.pending}</span>
                        <span class="stats__label">In Progress</span>
                    </div>
                </div>

                <div class="stats__card">
                    <div class="stats__icon stats__icon--completed">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div class="stats__info">
                        <span class="stats__number">${stats.completed}</span>
                        <span class="stats__label">Completed</span>
                    </div>
                </div>

                <div class="stats__card">
                    <div class="stats__icon stats__icon--high">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                            <line x1="12" y1="9" x2="12" y2="13"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                    </div>
                    <div class="stats__info">
                        <span class="stats__number">${stats.highPriority}</span>
                        <span class="stats__label">High Priority</span>
                    </div>
                </div>
            </div>
        `;
    }
}
