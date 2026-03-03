/**
 * Task Service
 * Handles all task-related API operations
 */

import { apiService } from './api.service.js';
import { ENDPOINTS } from '../config/constants.js';

class TaskService {
    async getAll(filters = {}) {
        const params = this.buildQueryParams(filters);
        const response = await apiService.get(ENDPOINTS.TASKS.BASE, params);
        return response.tasks || [];
    }

    async getById(id) {
        const response = await apiService.get(ENDPOINTS.TASKS.BY_ID(id));
        return response.task;
    }

    async create(taskData) {
        const sanitizedData = this.sanitizeTaskData(taskData);
        const response = await apiService.post(ENDPOINTS.TASKS.BASE, sanitizedData);
        return response.task;
    }

    async update(id, taskData) {
        const sanitizedData = this.sanitizeTaskData(taskData);
        const response = await apiService.patch(ENDPOINTS.TASKS.BY_ID(id), sanitizedData);
        return response.task;
    }

    async delete(id) {
        await apiService.delete(ENDPOINTS.TASKS.BY_ID(id));
        return true;
    }

    async toggleComplete(id, completed) {
        return this.update(id, { completed });
    }

    buildQueryParams(filters) {
        const params = {};

        if (filters.sort) {
            params.sort = filters.sort;
        }

        if (filters.category) {
            params.category = filters.category;
        }

        if (filters.priority) {
            params.priority = filters.priority;
        }

        if (filters.completed !== undefined) {
            params.completed = filters.completed;
        }

        if (filters.search) {
            params.title = { $regex: filters.search, $options: 'i' };
        }

        if (filters.page) {
            params.page = filters.page;
        }

        if (filters.limit) {
            params.limit = filters.limit;
        }

        if (filters.fields) {
            params.fields = filters.fields;
        }

        return params;
    }

    sanitizeTaskData(data) {
        const sanitized = {};
        const allowedFields = [
            'title',
            'description',
            'category',
            'priority',
            'difficulty',
            'estimatedHours',
            'dueDate',
            'completed'
        ];

        allowedFields.forEach(field => {
            if (data[field] !== undefined && data[field] !== '') {
                if (field === 'priority' || field === 'difficulty' || field === 'estimatedHours') {
                    sanitized[field] = parseInt(data[field], 10);
                } else {
                    sanitized[field] = data[field];
                }
            }
        });

        return sanitized;
    }

    calculateStats(tasks) {
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            highPriority: tasks.filter(t => t.priority >= 4).length,
            overdue: tasks.filter(t => {
                if (!t.dueDate || t.completed) return false;
                return new Date(t.dueDate) < new Date();
            }).length,
            byCategory: this.groupByCategory(tasks),
            byPriority: this.groupByPriority(tasks)
        };
    }

    groupByCategory(tasks) {
        return tasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});
    }

    groupByPriority(tasks) {
        return tasks.reduce((acc, task) => {
            acc[task.priority] = (acc[task.priority] || 0) + 1;
            return acc;
        }, {});
    }

    filterTasks(tasks, status) {
        switch (status) {
            case 'completed':
                return tasks.filter(t => t.completed);
            case 'pending':
                return tasks.filter(t => !t.completed);
            default:
                return tasks;
        }
    }

    searchTasks(tasks, query) {
        if (!query) return tasks;
        const lowerQuery = query.toLowerCase();
        return tasks.filter(task => 
            task.title.toLowerCase().includes(lowerQuery) ||
            (task.description && task.description.toLowerCase().includes(lowerQuery))
        );
    }
}

export const taskService = new TaskService();
