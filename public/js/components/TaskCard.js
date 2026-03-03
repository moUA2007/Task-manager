/**
 * TaskCard Component
 * Individual task card renderer
 */

import { sanitizeHTML, formatDate, formatRelativeTime } from '../utils/helpers.js';
import { TASK_PRIORITIES, TASK_CATEGORIES } from '../config/constants.js';

export function createTaskCard(task) {
    const priority = TASK_PRIORITIES.find(p => p.value === task.priority) || TASK_PRIORITIES[2];
    const category = TASK_CATEGORIES.find(c => c.value === task.category);
    const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

    return `
        <article class="task-card task-card--priority-${task.priority} ${task.completed ? 'task-card--completed' : ''} ${isOverdue ? 'task-card--overdue' : ''}"
                 data-task-id="${task._id}">
            <div class="task-card__header">
                <div class="task-card__checkbox" data-action="toggle" data-id="${task._id}" data-completed="${!task.completed}">
                    ${task.completed ? `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    ` : ''}
                </div>
                <h3 class="task-card__title">${sanitizeHTML(task.title)}</h3>
                <div class="task-card__actions">
                    <button class="task-card__btn task-card__btn--edit" data-action="edit" data-id="${task._id}" title="Edit">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="task-card__btn task-card__btn--delete" data-action="delete" data-id="${task._id}" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            ${task.description ? `
                <p class="task-card__description">${sanitizeHTML(task.description)}</p>
            ` : ''}
            
            <div class="task-card__meta">
                <span class="task-card__badge task-card__badge--category">
                    ${category?.icon || '📋'} ${task.category}
                </span>
                <span class="task-card__badge task-card__badge--priority" style="--priority-color: ${priority.color}">
                    Priority ${task.priority}
                </span>
                ${task.dueDate ? `
                    <span class="task-card__badge task-card__badge--due ${isOverdue ? 'task-card__badge--overdue' : ''}">
                        📅 ${formatRelativeTime(task.dueDate)}
                    </span>
                ` : ''}
                ${task.estimatedHours ? `
                    <span class="task-card__badge">⏱️ ${task.estimatedHours}h</span>
                ` : ''}
            </div>
        </article>
    `;
}

export function createTaskCardSkeleton() {
    return `
        <article class="task-card task-card--skeleton">
            <div class="task-card__header">
                <div class="skeleton skeleton--checkbox"></div>
                <div class="skeleton skeleton--title"></div>
            </div>
            <div class="skeleton skeleton--description"></div>
            <div class="task-card__meta">
                <span class="skeleton skeleton--badge"></span>
                <span class="skeleton skeleton--badge"></span>
            </div>
        </article>
    `;
}
