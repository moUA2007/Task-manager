/**
 * TaskForm Component
 * Form for creating and editing tasks
 */

import { Component } from './Component.js';
import { Modal } from './Modal.js';
import { taskService } from '../services/index.js';
import { validateForm, taskValidationRules } from '../utils/validators.js';
import { TASK_CATEGORIES, TASK_PRIORITIES, TASK_DIFFICULTIES } from '../config/constants.js';
import { toast } from './Toast.js';
import { loading } from './Loading.js';

export class TaskForm extends Component {
    constructor() {
        super(null);
        this.modal = new Modal({
            title: 'New Task',
            size: 'medium',
            onClose: () => this.reset()
        });
        this.state = {
            mode: 'create',
            taskId: null,
            formData: this.getDefaultFormData(),
            errors: {}
        };
        this.setupModal();
    }

    getDefaultFormData() {
        return {
            title: '',
            description: '',
            category: '',
            priority: 3,
            difficulty: 3,
            estimatedHours: '',
            dueDate: ''
        };
    }

    setupModal() {
        this.modal.setBody(this.formTemplate());
        this.modal.setFooter(this.footerTemplate());
        this.bindFormEvents();
    }

    formTemplate() {
        const { formData, errors } = this.state;

        return `
            <form class="task-form" id="task-form">
                <div class="form-group ${errors.title ? 'form-group--error' : ''}">
                    <label class="form-label" for="task-title">Title *</label>
                    <input 
                        type="text" 
                        id="task-title" 
                        class="form-input" 
                        placeholder="e.g., Create user API endpoints"
                        value="${formData.title}"
                        required
                    >
                    ${errors.title ? `<span class="form-error">${errors.title}</span>` : ''}
                </div>

                <div class="form-group">
                    <label class="form-label" for="task-description">Description</label>
                    <textarea 
                        id="task-description" 
                        class="form-textarea" 
                        rows="3"
                        placeholder="Add a detailed description..."
                    >${formData.description}</textarea>
                </div>

                <div class="form-row">
                    <div class="form-group ${errors.category ? 'form-group--error' : ''}">
                        <label class="form-label" for="task-category">Category *</label>
                        <select id="task-category" class="form-select" required>
                            <option value="">Select category</option>
                            ${TASK_CATEGORIES.map(cat => `
                                <option value="${cat.value}" ${formData.category === cat.value ? 'selected' : ''}>
                                    ${cat.icon} ${cat.label}
                                </option>
                            `).join('')}
                        </select>
                        ${errors.category ? `<span class="form-error">${errors.category}</span>` : ''}
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="task-priority">Priority</label>
                        <select id="task-priority" class="form-select">
                            ${TASK_PRIORITIES.map(p => `
                                <option value="${p.value}" ${formData.priority === p.value ? 'selected' : ''}>
                                    ${p.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label" for="task-difficulty">Difficulty</label>
                        <select id="task-difficulty" class="form-select">
                            ${TASK_DIFFICULTIES.map(d => `
                                <option value="${d.value}" ${formData.difficulty === d.value ? 'selected' : ''}>
                                    ${d.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="task-hours">Estimated Hours</label>
                        <input 
                            type="number" 
                            id="task-hours" 
                            class="form-input" 
                            min="1"
                            placeholder="e.g., 4"
                            value="${formData.estimatedHours}"
                        >
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="task-due">Due Date</label>
                    <input 
                        type="date" 
                        id="task-due" 
                        class="form-input"
                        value="${formData.dueDate}"
                    >
                </div>
            </form>
        `;
    }

    footerTemplate() {
        const { mode } = this.state;
        return `
            <button type="button" class="btn btn--secondary" id="cancel-btn">Cancel</button>
            <button type="submit" form="task-form" class="btn btn--primary" id="submit-btn">
                ${mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
        `;
    }

    bindFormEvents() {
        const form = this.modal.$('#task-form');
        const cancelBtn = this.modal.$('#cancel-btn');

        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
        }
    }

    updateModal() {
        this.modal.setTitle(this.state.mode === 'create' ? 'New Task' : 'Edit Task');
        this.modal.setBody(this.formTemplate());
        this.modal.setFooter(this.footerTemplate());
        this.bindFormEvents();
    }

    open(mode = 'create', taskData = null) {
        this.state.mode = mode;
        
        if (mode === 'edit' && taskData) {
            this.state.taskId = taskData._id;
            this.state.formData = {
                title: taskData.title || '',
                description: taskData.description || '',
                category: taskData.category || '',
                priority: taskData.priority || 3,
                difficulty: taskData.difficulty || 3,
                estimatedHours: taskData.estimatedHours || '',
                dueDate: taskData.dueDate ? taskData.dueDate.split('T')[0] : ''
            };
        } else {
            this.state.taskId = null;
            this.state.formData = this.getDefaultFormData();
        }

        this.state.errors = {};
        this.updateModal();
        this.modal.open();
    }

    close() {
        this.modal.close();
        this.reset();
    }

    reset() {
        this.state = {
            mode: 'create',
            taskId: null,
            formData: this.getDefaultFormData(),
            errors: {}
        };
    }

    getFormData() {
        return {
            title: this.modal.$('#task-title')?.value.trim() || '',
            description: this.modal.$('#task-description')?.value.trim() || '',
            category: this.modal.$('#task-category')?.value || '',
            priority: parseInt(this.modal.$('#task-priority')?.value) || 3,
            difficulty: parseInt(this.modal.$('#task-difficulty')?.value) || 3,
            estimatedHours: this.modal.$('#task-hours')?.value || '',
            dueDate: this.modal.$('#task-due')?.value || ''
        };
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = this.getFormData();
        const validation = validateForm(formData, taskValidationRules);

        if (!validation.isValid) {
            this.state.errors = validation.errors;
            this.updateModal();
            return;
        }

        loading.start(this.state.mode === 'create' ? 'Creating task...' : 'Saving...');

        try {
            let task;
            
            if (this.state.mode === 'create') {
                task = await taskService.create(formData);
                this.dispatch('ADD_TASK', task);
                toast.success('Task created successfully!');
            } else {
                task = await taskService.update(this.state.taskId, formData);
                this.dispatch('UPDATE_TASK', task);
                toast.success('Task updated successfully!');
            }

            this.close();
        } catch (error) {
            toast.error(error.message || 'Failed to save task');
        } finally {
            loading.end();
        }
    }
}
