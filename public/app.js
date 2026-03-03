// API URL
const API_URL = '/api/v2';

// State
let tasks = [];
let currentFilter = 'all';
let deleteTaskId = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginFormDiv = document.getElementById('login-form');
const signupFormDiv = document.getElementById('signup-form');
const forgotPasswordFormDiv = document.getElementById('forgot-password-form');
const resetPasswordFormDiv = document.getElementById('reset-password-form');
const tasksContainer = document.getElementById('tasks-container');
const emptyState = document.getElementById('empty-state');
const taskModal = document.getElementById('task-modal');
const deleteModal = document.getElementById('delete-modal'); 
const loadingEl = document.getElementById('loading');
const toastEl = document.getElementById('toast');

// Initialize - check auth via cookie (not localStorage)
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in via cookie
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            credentials: 'same-origin'
        });
        const data = await res.json();
        if (data.status === 'success') {
            showDashboard();
            loadTasks();
        }
    } catch (err) {
        // Not logged in, show auth
    }

    // Form submissions
    document.getElementById('login-submit').addEventListener('submit', handleLogin);
    document.getElementById('signup-submit').addEventListener('submit', handleSignup);
    document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);
    document.getElementById('forgot-password-submit').addEventListener('submit', handleForgotPassword);
    document.getElementById('reset-password-submit').addEventListener('submit', handleResetPassword);
});

// Toast
function showToast(message, type = 'success') {
    toastEl.textContent = message;
    toastEl.className = `toast ${type} show`;
    setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// Loading
function showLoading() {
    loadingEl.classList.remove('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

// Auth Views - Hide all forms helper
function hideAllAuthForms() {
    loginFormDiv.classList.add('hidden');
    signupFormDiv.classList.add('hidden');
    forgotPasswordFormDiv.classList.add('hidden');
    resetPasswordFormDiv.classList.add('hidden');
}

function showLogin() {
    hideAllAuthForms();
    loginFormDiv.classList.remove('hidden');
}

function showSignup() {
    hideAllAuthForms();
    signupFormDiv.classList.remove('hidden');
}

function showForgotPassword() {
    hideAllAuthForms();
    forgotPasswordFormDiv.classList.remove('hidden');
}

function showResetPassword() {
    hideAllAuthForms();
    resetPasswordFormDiv.classList.remove('hidden');
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
}

function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
}

// HTML escape helper - prevents XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showLoading();

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.status === 'success') {
            showToast('Welcome back!');
            showDashboard();
            loadTasks();
        } else {
            showToast(data.message || 'Login failed', 'error');
        }
    } catch (err) {
        console.error('Login error:', err);
        showToast('Connection error', 'error');
    }

    hideLoading();
}

// Signup
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmedPassword = document.getElementById('signup-confirm').value;

    if (password !== confirmedPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    showLoading();

    try {
        const res = await fetch(`${API_URL}/auth/signUp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ name, email, password, confirmedPassword })
        });

        const data = await res.json();

        if (data.status === 'success') {
            showToast('Account created!');
            showDashboard();
            loadTasks();
        } else {
            showToast(data.message || 'Signup failed', 'error');
        }
    } catch (err) {
        console.error('Signup error:', err);
        showToast('Connection error: ' + err.message, 'error');
    }

    hideLoading();
}

// Forgot Password
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = document.getElementById('forgot-email').value;

    showLoading();

    try {
        const res = await fetch(`${API_URL}/auth/forget-pass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (data.status === 'success') {
            showToast('Reset token sent to your email! Check your inbox.');
            showResetPassword();
        } else {
            showToast(data.message || 'Failed to send reset token', 'error');
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        showToast('Connection error', 'error');
    }

    hideLoading();
}

// Reset Password
async function handleResetPassword(e) {
    e.preventDefault();

    const token = document.getElementById('reset-token').value;
    const password = document.getElementById('reset-password').value;
    const passwordConfirm = document.getElementById('reset-confirm-password').value;

    if (password !== passwordConfirm) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 8) {
        showToast('Password must be at least 8 characters', 'error');
        return;
    }

    showLoading();

    try {
        const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ password, passwordConfirm })
        });

        const data = await res.json();

        if (data.status === 'success') {
            showToast('Password reset successfully! Please sign in.');
            showLogin();
        } else {
            showToast(data.message || 'Failed to reset password', 'error');
        }
    } catch (err) {
        console.error('Reset password error:', err);
        showToast('Connection error', 'error');
    }

    hideLoading();
}

// Logout - calls server to clear cookie
async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'same-origin'
        });
    } catch (err) {
        // Ignore logout errors
    }
    showAuth();
    showLogin();
    showToast('Logged out');
}

// Get Auth Headers - cookies sent automatically, just need Content-Type
function getHeaders() {
    return {
        'Content-Type': 'application/json'
    };
}

// Load Tasks
async function loadTasks() {
    const category = document.getElementById('category-filter')?.value || '';
    const sort = document.getElementById('sort-filter')?.value || '-createdAt';

    let url = `${API_URL}/task?sort=${sort}`;
    if (category) url += `&category=${category}`;

    showLoading();

    try {
        const res = await fetch(url, {
            headers: getHeaders(),
            credentials: 'same-origin'
        });
        const data = await res.json();

        if (data.status === 'success') {
            tasks = data.tasks;
            renderTasks();
            updateStats();
        } else if (res.status === 401) {
            // Token expired or invalid
            showAuth();
            showLogin();
            showToast('Session expired. Please login again.', 'error');
        }
    } catch (err) {
        console.error('Load tasks error:', err);
        showToast('Failed to load tasks', 'error');
    }

    hideLoading();
}

// Render Tasks
function renderTasks() {
    let filtered = tasks;

    if (currentFilter === 'pending') {
        filtered = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filtered = tasks.filter(t => t.completed);
    }

    if (filtered.length === 0) {
        tasksContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    tasksContainer.innerHTML = filtered.map(task => createTaskCard(task)).join('');
}

// Create Task Card - uses escapeHtml to prevent XSS
function createTaskCard(task) {
    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '';
    const safeTitle = escapeHtml(task.title);
    const safeDescription = escapeHtml(task.description);
    const safeCategory = escapeHtml(task.category);

    return `
        <div class="task-card priority-${Number(task.priority) || 3} ${task.completed ? 'completed' : ''}">
            <div class="task-header">
                <h3 class="task-title">${safeTitle}</h3>
                <div class="task-actions">
                    <button class="task-btn complete" onclick="toggleComplete('${task._id}', ${!task.completed})" title="Toggle">✓</button>
                    <button class="task-btn edit" onclick="editTask('${task._id}')" title="Edit">✎</button>
                    <button class="task-btn delete" onclick="openDeleteModal('${task._id}')" title="Delete">🗑</button>
                </div>
            </div>
            ${safeDescription ? `<p class="task-description">${safeDescription}</p>` : ''}
            <div class="task-meta">
                <span class="task-badge category">${safeCategory}</span>
                <span class="task-badge priority-badge">P${Number(task.priority) || 3}</span>
                ${dueDate ? `<span class="task-badge due">📅 ${dueDate}</span>` : ''}
            </div>
        </div>
    `;
}

// Update Stats
function updateStats() {
    document.getElementById('total-tasks').textContent = tasks.length;
    document.getElementById('pending-tasks').textContent = tasks.filter(t => !t.completed).length;
    document.getElementById('completed-tasks').textContent = tasks.filter(t => t.completed).length;
    document.getElementById('high-priority-tasks').textContent = tasks.filter(t => t.priority >= 4).length;
}

// Filter Tasks
function filterTasks(filter) {
    currentFilter = filter;
    renderTasks();
}

// Set Active Nav
function setActiveNav(el) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');
}

// Task Modal
function openTaskModal(taskId = null) {
    document.getElementById('task-id').value = taskId || '';
    document.getElementById('modal-title').textContent = taskId ? 'Edit Task' : 'New Task';
    document.getElementById('submit-btn').textContent = taskId ? 'Update' : 'Create';

    if (!taskId) {
        document.getElementById('task-form').reset();
    }

    taskModal.classList.remove('hidden');
}

function closeTaskModal() {
    taskModal.classList.add('hidden');
    document.getElementById('task-form').reset();
}

// Edit Task
function editTask(taskId) {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    document.getElementById('task-id').value = task._id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-category').value = task.category;
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-difficulty').value = task.difficulty || 3;
    document.getElementById('task-hours').value = task.estimatedHours || '';
    document.getElementById('task-due').value = task.dueDate ? task.dueDate.split('T')[0] : '';

    openTaskModal(taskId);
}

// Handle Task Submit
async function handleTaskSubmit(e) {
    e.preventDefault();

    const taskId = document.getElementById('task-id').value;
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        category: document.getElementById('task-category').value,
        priority: parseInt(document.getElementById('task-priority').value),
        difficulty: parseInt(document.getElementById('task-difficulty').value)
    };

    const hours = document.getElementById('task-hours').value;
    if (hours) taskData.estimatedHours = parseInt(hours);

    const due = document.getElementById('task-due').value;
    if (due) taskData.dueDate = due;

    showLoading();

    try {
        const url = taskId ? `${API_URL}/task/${taskId}` : `${API_URL}/task`;
        const method = taskId ? 'PATCH' : 'POST';

        const res = await fetch(url, {
            method,
            headers: getHeaders(),
            credentials: 'same-origin',
            body: JSON.stringify(taskData)
        });

        const data = await res.json();

        if (data.status === 'success') {
            showToast(taskId ? 'Task updated!' : 'Task created!');
            closeTaskModal();
            loadTasks();
        } else {
            showToast(data.message || 'Failed', 'error');
        }
    } catch (err) {
        console.error('Task error:', err);
        showToast('Error saving task', 'error');
    }

    hideLoading();
}

// Toggle Complete
async function toggleComplete(taskId, completed) {
    showLoading();

    try {
        const res = await fetch(`${API_URL}/task/${taskId}`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'same-origin',
            body: JSON.stringify({ completed })
        });

        const data = await res.json();

        if (data.status === 'success') {
            showToast(completed ? 'Task completed!' : 'Task uncompleted');
            loadTasks();
        }
    } catch (err) {
        showToast('Error', 'error');
    }

    hideLoading();
}

// Delete Modal
function openDeleteModal(taskId) {
    deleteTaskId = taskId;
    deleteModal.classList.remove('hidden');
}

function closeDeleteModal() {
    deleteTaskId = null;
    deleteModal.classList.add('hidden');
}

async function confirmDelete() {
    if (!deleteTaskId) return;

    showLoading();

    try {
        const res = await fetch(`${API_URL}/task/${deleteTaskId}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'same-origin'
        });

        if (res.ok) {
            showToast('Task deleted');
            closeDeleteModal();
            loadTasks();
        }
    } catch (err) {
        showToast('Error deleting', 'error');
    }

    hideLoading();
}

// ESC to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTaskModal();
        closeDeleteModal();
    }
});
