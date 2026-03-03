/**
 * TaskList Component
 * Task list with filtering and actions
 */

import { Component } from './Component.js';
import { taskService } from '../services/index.js';
import { createTaskCard, createTaskCardSkeleton } from './TaskCard.js';
import { TASK_CATEGORIES, SORT_OPTIONS } from '../config/constants.js';
import { toast } from './Toast.js';
import { loading } from './Loading.js';
import { ConfirmModal } from './Modal.js';
import { EVENTS } from '../store/eventBus.js';
import { delegate } from '../utils/dom.js';

export class TaskList extends Component {
    constructor(container, options = {}) {
        super(container, options);
        this.confirmModal = new ConfirmModal({ title: 'Delete Task' });
        this.onEditTask = options.onEditTask || (() => {});
        
        this.subscribeToStore('SET_TASKS', () => this.update());
        this.subscribeToStore('ADD_TASK', () => this.update());
        this.subscribeToStore('UPDATE_TASK', () => this.update());
        this.subscribeToStore('DELETE_TASK', () => this.update());
        this.subscribeToStore('SET_FILTER', () => this.update());
    }

    template() {
        const { filteredTasks, filters } = this.getStoreState();

        return `
            <section class="task-list">
                <div class="task-list__header">
                    <h2 class="task-list__title">Tasks</h2>
                    <div class="task-list__filters">
                        <select class="form-select" id="category-filter" aria-label="Filter by category">
                            <option value="">All Categories</option>
                            ${TASK_CATEGORIES.map(cat => `
                                <option value="${cat.value}" ${filters.category === cat.value ? 'selected' : ''}>
                                    ${cat.icon} ${cat.label}
                                </option>
                            `).join('')}
                        </select>
                        <select class="form-select" id="sort-filter" aria-label="Sort tasks">
                            ${SORT_OPTIONS.map(opt => `
                                <option value="${opt.value}" ${filters.sort === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="task-list__content" id="tasks-container">
                    ${this.renderTasks(filteredTasks)}
                </div>
            </section>
        `;
    }

    renderTasks(tasks) {
        if (tasks.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="task-list__grid">
                ${tasks.map(task => createTaskCard(task)).join('')}
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <h3>No Tasks Found</h3>
                <p>Create your first task to get started</p>
            </div>
        `;
    }

    renderLoading() {
        return `
            <div class="task-list__grid">
                ${Array(3).fill(createTaskCardSkeleton()).join('')}
            </div>
        `;
    }

    bindEvents() {
        const categoryFilter = this.$('#category-filter');
        const sortFilter = this.$('#sort-filter');
        const tasksContainer = this.$('#tasks-container');

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.dispatch('SET_FILTER', { category: e.target.value });
                this.loadTasks();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.dispatch('SET_FILTER', { sort: e.target.value });
                this.loadTasks();
            });
        }

        if (tasksContainer) {
            delegate(tasksContainer, '[data-action]', 'click', (e, target) => {
                const action = target.dataset.action;
                const taskId = target.dataset.id;

                switch (action) {
                    case 'toggle':
                        this.toggleTask(taskId, target.dataset.completed === 'true');
                        break;
                    case 'edit':
                        this.onEditTask(taskId);
                        break;
                    case 'delete':
                        this.deleteTask(taskId);
                        break;
                }
            });
        }
    }

    async loadTasks() {
        const { filters } = this.getStoreState();
        
        loading.start('Loading tasks...');
        
        try {
            const tasks = await taskService.getAll({
                sort: filters.sort,
                category: filters.category
            });
            this.dispatch('SET_TASKS', tasks);
        } catch (error) {
            toast.error('Failed to load tasks');
        } finally {
            loading.end();
        }
    }

    async toggleTask(taskId, completed) {
        try {
            const task = await taskService.toggleComplete(taskId, completed);
            this.dispatch('UPDATE_TASK', task);
            toast.success(completed ? 'Task completed!' : 'Task marked as pending');
        } catch (error) {
            toast.error('Failed to update task');
        }
    }

    deleteTask(taskId) {
        this.confirmModal.confirm(
            'Are you sure you want to delete this task? This action cannot be undone.',
            async () => {
                loading.start('Deleting...');
                try {
                    await taskService.delete(taskId);
                    this.dispatch('DELETE_TASK', taskId);
                    toast.success('Task deleted successfully');
                } catch (error) {
                    toast.error('Failed to delete task');
                } finally {
                    loading.end();
                }
            }
        );
    }
}
