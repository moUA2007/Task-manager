/**
 * Sidebar Component
 * Navigation sidebar with filters
 */

import { Component } from './Component.js';
import { authService } from '../services/index.js';
import { FILTER_STATUS } from '../config/constants.js';
import { EVENTS } from '../store/eventBus.js';
import { toast } from './Toast.js';

export class Sidebar extends Component {
    constructor(container) {
        super(container);
        this.state = {
            activeFilter: FILTER_STATUS.ALL
        };
        this.subscribeToStore('SET_FILTER', this.onFilterChange.bind(this));
    }

    onFilterChange(state) {
        this.setState({ activeFilter: state.filters.status });
    }

    template() {
        const { activeFilter } = this.state;
        const { stats } = this.getStoreState();

        return `
            <aside class="sidebar">
                <div class="sidebar__header">
                    <div class="logo">
                        <span class="logo__icon">✓</span>
                        <span class="logo__text">TaskFlow</span>
                    </div>
                </div>
                
                <nav class="sidebar__nav">
                    <a href="#" class="nav-item ${activeFilter === FILTER_STATUS.ALL ? 'nav-item--active' : ''}" 
                       data-filter="${FILTER_STATUS.ALL}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <span>All Tasks</span>
                        <span class="nav-item__badge">${stats.total}</span>
                    </a>
                    <a href="#" class="nav-item ${activeFilter === FILTER_STATUS.PENDING ? 'nav-item--active' : ''}" 
                       data-filter="${FILTER_STATUS.PENDING}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>In Progress</span>
                        <span class="nav-item__badge nav-item__badge--warning">${stats.pending}</span>
                    </a>
                    <a href="#" class="nav-item ${activeFilter === FILTER_STATUS.COMPLETED ? 'nav-item--active' : ''}" 
                       data-filter="${FILTER_STATUS.COMPLETED}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 11 12 14 22 4"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                        </svg>
                        <span>Completed</span>
                        <span class="nav-item__badge nav-item__badge--success">${stats.completed}</span>
                    </a>
                </nav>

                <div class="sidebar__footer">
                    <button class="btn btn--logout" id="logout-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                            <polyline points="16 17 21 12 16 7"/>
                            <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        `;
    }

    bindEvents() {
        this.$$('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = item.dataset.filter;
                this.dispatch('SET_FILTER', { status: filter });
            });
        });

        this.$('#logout-btn')?.addEventListener('click', () => {
            authService.logout();
            toast.success('Logged out successfully');
            this.emit(EVENTS.AUTH_LOGOUT);
        });
    }
}
