/**
 * Application Entry Point
 * Initializes and orchestrates all components
 */

import { store } from './store/store.js';
import { eventBus, EVENTS } from './store/eventBus.js';
import { authService, taskService, apiService, ApiError } from './services/index.js';
import { Auth, Sidebar, TaskList, TaskForm, Stats, toast, loading } from './components/index.js';
import { onReady, $, show, hide } from './utils/dom.js';
import { STORAGE_KEYS } from './config/constants.js';

class App {
    constructor() {
        this.components = {};
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        this.setupApiInterceptors();
        this.setupEventListeners();
        this.checkInitialAuth();

        this.isInitialized = true;
    }

    setupApiInterceptors() {
        apiService.addResponseInterceptor(async (result) => {
            if (result.response.status === 401) {
                authService.handleAuthError();
            }
            return result;
        });
    }

    setupEventListeners() {
        eventBus.on(EVENTS.AUTH_LOGIN, () => this.handleLogin());
        eventBus.on(EVENTS.AUTH_LOGOUT, () => this.handleLogout());
        
        const newTaskBtn = $('#new-task-btn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => this.openTaskForm());
        }
    }

    checkInitialAuth() {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (token) {
            store.dispatch('SET_AUTHENTICATED', true);
            this.showDashboard();
        } else {
            this.showAuth();
        }
    }

    showAuth() {
        hide($('#dashboard-root'));
        show($('#auth-root'));

        this.destroyDashboardComponents();

        if (!this.components.auth) {
            this.components.auth = new Auth('#auth-root');
        }
        this.components.auth.render();
    }

    async showDashboard() {
        hide($('#auth-root'));
        show($('#dashboard-root'));

        if (this.components.auth) {
            this.components.auth.destroy();
            this.components.auth = null;
        }

        this.initDashboardComponents();
        await this.loadInitialData();
    }

    initDashboardComponents() {
        if (!this.components.sidebar) {
            this.components.sidebar = new Sidebar('#sidebar-root');
            this.components.sidebar.render();
        }

        if (!this.components.stats) {
            this.components.stats = new Stats('#stats-root');
            this.components.stats.render();
        }

        if (!this.components.taskList) {
            this.components.taskList = new TaskList('#task-list-root', {
                onEditTask: (taskId) => this.editTask(taskId)
            });
            this.components.taskList.render();
        }

        if (!this.components.taskForm) {
            this.components.taskForm = new TaskForm();
        }
    }

    destroyDashboardComponents() {
        ['sidebar', 'stats', 'taskList', 'taskForm'].forEach(key => {
            if (this.components[key]) {
                this.components[key].destroy();
                this.components[key] = null;
            }
        });
    }

    async loadInitialData() {
        loading.start('Loading tasks...');
        
        try {
            const tasks = await taskService.getAll({ sort: '-createdAt' });
            store.dispatch('SET_TASKS', tasks);
        } catch (error) {
            if (error instanceof ApiError && error.isAuthError) {
                return;
            }
            toast.error('Failed to load tasks');
        } finally {
            loading.end();
        }
    }

    handleLogin() {
        this.showDashboard();
    }

    handleLogout() {
        store.dispatch('LOGOUT');
        this.showAuth();
    }

    openTaskForm() {
        if (this.components.taskForm) {
            this.components.taskForm.open('create');
        }
    }

    async editTask(taskId) {
        const { tasks } = store.getState();
        const task = tasks.find(t => t._id === taskId);
        
        if (task && this.components.taskForm) {
            this.components.taskForm.open('edit', task);
        }
    }
}

const app = new App();

onReady(() => {
    app.init();
});

export default app;
