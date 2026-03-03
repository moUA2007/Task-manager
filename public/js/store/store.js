/**
 * Application State Store
 * Centralized state management with observer pattern
 */

import { FILTER_STATUS } from '../config/constants.js';
import { deepClone } from '../utils/helpers.js';

class Store {
    constructor() {
        this.state = {
            user: null,
            isAuthenticated: false,
            tasks: [],
            filteredTasks: [],
            stats: {
                total: 0,
                completed: 0,
                pending: 0,
                highPriority: 0
            },
            filters: {
                status: FILTER_STATUS.ALL,
                category: '',
                sort: '-createdAt',
                search: ''
            },
            ui: {
                loading: false,
                error: null,
                currentView: 'auth',
                modalOpen: null,
                sidebarOpen: true
            }
        };

        this.listeners = new Map();
        this.middleware = [];
    }

    getState() {
        return deepClone(this.state);
    }

    getStateSlice(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    use(middlewareFn) {
        this.middleware.push(middlewareFn);
    }

    dispatch(action, payload) {
        const prevState = deepClone(this.state);

        for (const middlewareFn of this.middleware) {
            middlewareFn(action, payload, prevState);
        }

        this.reduce(action, payload);
        this.notifyListeners(action, prevState);
    }

    reduce(action, payload) {
        switch (action) {
            case 'SET_USER':
                this.state.user = payload;
                this.state.isAuthenticated = !!payload;
                break;

            case 'SET_AUTHENTICATED':
                this.state.isAuthenticated = payload;
                break;

            case 'LOGOUT':
                this.state.user = null;
                this.state.isAuthenticated = false;
                this.state.tasks = [];
                this.state.filteredTasks = [];
                break;

            case 'SET_TASKS':
                this.state.tasks = payload;
                this.applyFilters();
                this.calculateStats();
                break;

            case 'ADD_TASK':
                this.state.tasks.unshift(payload);
                this.applyFilters();
                this.calculateStats();
                break;

            case 'UPDATE_TASK':
                const updateIndex = this.state.tasks.findIndex(t => t._id === payload._id);
                if (updateIndex !== -1) {
                    this.state.tasks[updateIndex] = { ...this.state.tasks[updateIndex], ...payload };
                }
                this.applyFilters();
                this.calculateStats();
                break;

            case 'DELETE_TASK':
                this.state.tasks = this.state.tasks.filter(t => t._id !== payload);
                this.applyFilters();
                this.calculateStats();
                break;

            case 'SET_FILTER':
                this.state.filters = { ...this.state.filters, ...payload };
                this.applyFilters();
                break;

            case 'SET_LOADING':
                this.state.ui.loading = payload;
                break;

            case 'SET_ERROR':
                this.state.ui.error = payload;
                break;

            case 'CLEAR_ERROR':
                this.state.ui.error = null;
                break;

            case 'SET_VIEW':
                this.state.ui.currentView = payload;
                break;

            case 'SET_MODAL':
                this.state.ui.modalOpen = payload;
                break;

            case 'TOGGLE_SIDEBAR':
                this.state.ui.sidebarOpen = !this.state.ui.sidebarOpen;
                break;

            default:
                console.warn(`Unknown action: ${action}`);
        }
    }

    applyFilters() {
        let filtered = [...this.state.tasks];
        const { status, category, search } = this.state.filters;

        if (status === FILTER_STATUS.COMPLETED) {
            filtered = filtered.filter(t => t.completed);
        } else if (status === FILTER_STATUS.PENDING) {
            filtered = filtered.filter(t => !t.completed);
        }

        if (category) {
            filtered = filtered.filter(t => t.category === category);
        }

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(lowerSearch) ||
                (t.description && t.description.toLowerCase().includes(lowerSearch))
            );
        }

        this.state.filteredTasks = filtered;
    }

    calculateStats() {
        const tasks = this.state.tasks;
        this.state.stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            highPriority: tasks.filter(t => t.priority >= 4).length
        };
    }

    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        return () => {
            this.listeners.get(key).delete(callback);
        };
    }

    subscribeToAll(callback) {
        return this.subscribe('*', callback);
    }

    notifyListeners(action, prevState) {
        this.listeners.get('*')?.forEach(callback => {
            callback(this.state, prevState, action);
        });

        this.listeners.get(action)?.forEach(callback => {
            callback(this.state, prevState, action);
        });
    }
}

export const store = new Store();

store.use((action, payload, prevState) => {
    if (process.env?.NODE_ENV === 'development') {
        console.groupCollapsed(`Action: ${action}`);
        console.log('Payload:', payload);
        console.log('Prev State:', prevState);
        console.groupEnd();
    }
});
