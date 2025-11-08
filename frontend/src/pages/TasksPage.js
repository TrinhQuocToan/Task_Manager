import { api } from '../main.js';
import { formatDateOnly, isTaskOverdue, getOverdueBadgeText, getCompletionDelayMessage, getCompletedLateBadgeText } from '../utils/format.js';

export async function renderTasksPage() {
  try {
    // Get query params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search') || '';
    const statusFilter = urlParams.get('status') || '';
    const priorityFilter = urlParams.get('priority') || '';
    const categoryFilter = urlParams.get('categoryId') || '';
    const sortBy = urlParams.get('sortBy') || 'dueDate';
    const sortOrder = urlParams.get('sortOrder') || 'asc';
    
    // Fetch categories for filter
    const categoriesResponse = await api.get('/api/categories');
    const categories = categoriesResponse.data?.categories || [];
    
    // Build API URL with filters
    const queryParams = new URLSearchParams();
    if (searchQuery) queryParams.append('search', searchQuery);
    // Don't send "Overdue" to backend, we'll filter client-side
    if (statusFilter && statusFilter !== 'Overdue') queryParams.append('status', statusFilter);
    if (priorityFilter) queryParams.append('priority', priorityFilter);
    if (categoryFilter) queryParams.append('categoryId', categoryFilter);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    
    const url = `/api/tasks?${queryParams.toString()}`;
    const response = await api.get(url);
    let tasks = response.data?.tasks || [];
    
    // Client-side filter for overdue tasks
    if (statusFilter === 'Overdue') {
      tasks = tasks.filter(task => isTaskOverdue(task));
    }
    
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2><i class="fas fa-check-square me-2"></i>Tasks</h2>
            ${searchQuery || statusFilter || priorityFilter || categoryFilter ? `
              <div class="mt-2">
                <span class="badge bg-info">
                  <i class="fas fa-filter me-1"></i>
                  Filtering (${tasks.length} results)
                  <a href="/tasks" class="text-white ms-2" data-link="/tasks" style="text-decoration: none;">
                    <i class="fas fa-times"></i>
                  </a>
                </span>
              </div>
            ` : ''}
          </div>
          <a href="/tasks/create" class="btn btn-primary" data-link="/tasks/create">
            <i class="fas fa-plus me-2"></i>Create Task
          </a>
        </div>

        ${renderFiltersAndSort(categories, { statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder })}

        ${tasks.length === 0 ? renderEmptyState(searchQuery) : renderTasksList(tasks, sortBy, sortOrder)}
      </div>
    `;
  } catch (error) {
    console.error('Error rendering tasks:', error);
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Failed to load tasks list. Please try again.
        </div>
      </div>
    `;
  }
}

function renderEmptyState(searchQuery = '') {
  if (searchQuery) {
    return `
      <div class="card border-0 shadow-sm">
        <div class="card-body text-center py-5">
          <div class="mb-4">
            <i class="fas fa-search fa-4x text-muted"></i>
          </div>
          <h4 class="mb-3">No results found</h4>
          <p class="text-muted mb-4">No tasks found for keyword "${searchQuery}"</p>
          <a href="/tasks" class="btn btn-secondary" data-link="/tasks">
            <i class="fas fa-arrow-left me-2"></i>Go back to tasks list
          </a>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="fas fa-tasks fa-4x text-muted"></i>
        </div>
        <h4 class="mb-3">No tasks found</h4>
        <p class="text-muted mb-4">Start by creating your first task</p>
        <a href="/tasks/create" class="btn btn-primary btn-lg" data-link="/tasks/create">
          <i class="fas fa-plus me-2"></i>Create new task
        </a>
      </div>
    </div>
  `;
}

function renderFiltersAndSort(categories, filters) {
  const { statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder } = filters;
  
  return `
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-filter me-1"></i>Filter by status</label>
            <select class="form-select form-select-sm" id="statusFilter">
              <option value="">All</option>
              <option value="Not Started" ${statusFilter === 'Not Started' ? 'selected' : ''}>Not Started</option>
              <option value="In Progress" ${statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Completed" ${statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="Cancelled" ${statusFilter === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              <option value="Overdue" ${statusFilter === 'Overdue' ? 'selected' : ''}>⚠️ Overdue</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-flag me-1"></i>Filter by priority</label>
            <select class="form-select form-select-sm" id="priorityFilter">
              <option value="">All</option>
              <option value="Low" ${priorityFilter === 'Low' ? 'selected' : ''}>Low</option>
              <option value="Medium" ${priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="High" ${priorityFilter === 'High' ? 'selected' : ''}>High</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-tag me-1"></i>Filter by category</label>
            <select class="form-select form-select-sm" id="categoryFilter">
              <option value="">All</option>
              ${categories.map(cat => `
                <option value="${cat._id}" ${categoryFilter === cat._id ? 'selected' : ''}>${cat.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-sort me-1"></i>Sort by</label>
            <select class="form-select form-select-sm" id="sortBy">
              <option value="dueDate" ${sortBy === 'dueDate' ? 'selected' : ''}>Due date</option>
              <option value="createdAt" ${sortBy === 'createdAt' ? 'selected' : ''}>Created at</option>
              <option value="priority" ${sortBy === 'priority' ? 'selected' : ''}>Priority</option>
              <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Title</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-sort-amount-down me-1"></i>Order</label>
            <select class="form-select form-select-sm" id="sortOrder">
              <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''}>Ascending</option>
              <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''}>Descending</option>
            </select>
          </div>
          <div class="col-12 d-flex gap-2 justify-content-end mt-2">
            <button class="btn btn-sm btn-primary" onclick="applyFilters()">
              <i class="fas fa-filter me-1"></i>Apply filters
            </button>
            <button class="btn btn-sm btn-outline-secondary" onclick="resetFilters()">
              <i class="fas fa-undo me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTasksList(tasks, sortBy, sortOrder) {
  const getSortIcon = (column) => {
    if (sortBy !== column) return '';
    return sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };
  
  const getSortClass = (column) => {
    if (sortBy !== column) return '';
    return 'text-primary';
  };
  
  return `
    <div class="row">
      <div class="col-12">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead>
                  <tr>
                    <th class="${getSortClass('title')}" style="cursor: pointer;" onclick="sortByColumn('title')">
                      Title <i class="fas ${getSortIcon('title')}"></i>
                    </th>
                    <th>Categories</th>
                    <th class="${getSortClass('priority')}" style="cursor: pointer; width: 130px; padding-right: 20px;" onclick="sortByColumn('priority')">
                      Priority <i class="fas ${getSortIcon('priority')}"></i>
                    </th>
                    <th class="${getSortClass('status')}" style="cursor: pointer; width: 160px; padding-left: 20px;" onclick="sortByColumn('status')">
                      Status <i class="fas ${getSortIcon('status')}"></i>
                    </th>
                    <th class="${getSortClass('dueDate')}" style="cursor: pointer;" onclick="sortByColumn('dueDate')">
                      Due date <i class="fas ${getSortIcon('dueDate')}"></i>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${tasks.map(task => renderTaskRow(task)).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderTaskRow(task) {
  const isOverdue = isTaskOverdue(task);
  const overdueBadge = isOverdue ? getOverdueBadgeText(task) : '';
  
  return `
    <tr class="${isOverdue ? 'table-danger' : ''}" style="${isOverdue ? 'background-color: #ffe6e6;' : ''}">
      <td>
        <div>
          <strong>${task.title || 'Không có tiêu đề'}</strong>
          ${isOverdue ? `<span class="badge bg-danger ms-2"><i class="fas fa-exclamation-triangle me-1"></i>${overdueBadge}</span>` : ''}
          ${task.description ? `<br><small class="text-muted">${task.description}</small>` : ''}
        </div>
      </td>
      <td>
        ${task.categoryId ? `
          <span class="badge" style="background-color: ${task.categoryId.color || '#d86b22'};">
            <i class="fas ${task.categoryId.icon || 'fa-tag'} me-1"></i>
            ${task.categoryId.name || 'N/A'}
          </span>
        ` : '<span class="text-muted">N/A</span>'}
      </td>
      <td style="padding-right: 20px;">
        <select class="form-select form-select-sm select-priority ${getPrioritySelectClass(task.priority)}" 
                onchange="updateTaskField('${task._id}','priority', this.value, this, '${task.dueDate || ''}')">
          <option value="Low" ${task.priority === 'Low' ? 'selected' : ''}>Low</option>
          <option value="Medium" ${task.priority === 'Medium' ? 'selected' : ''}>Medium</option>
          <option value="High" ${task.priority === 'High' ? 'selected' : ''}>High</option>
        </select>
      </td>
      <td style="padding-left: 20px;">
        <select class="form-select form-select-sm select-status ${getStatusSelectClass(task.status)}" 
                onchange="updateTaskField('${task._id}','status', this.value, this, '${task.dueDate || ''}')">
          <option value="Not Started" ${task.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
          <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          <option value="Cancelled" ${task.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
        ${(() => {
          const lateBadge = getCompletedLateBadgeText(task);
          return lateBadge ? `<div class="mt-2"><small class="badge bg-warning text-dark"><i class="fas fa-clock me-1"></i>${lateBadge}</small></div>` : '';
        })()}
      </td>
      <td>
        ${task.dueDate ? formatDateOnly(task.dueDate) : 'N/A'}
      </td>
      <td>
        <div class="btn-group btn-group-sm">
          <a href="/tasks/${task._id}" class="btn btn-outline-primary" data-link="/tasks/${task._id}">
            <i class="fas fa-eye"></i>
          </a>
          <a href="/tasks/${task._id}/edit" class="btn btn-outline-warning" data-link="/tasks/${task._id}/edit">
            <i class="fas fa-edit"></i>
          </a>
          <button class="btn btn-outline-danger" onclick="deleteTask('${task._id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `;
}

// Delete task function (will be called from onclick)
window.deleteTask = async function(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  try {
    const response = await api.delete(`/api/tasks/${taskId}`);
    if (response.success) {
      showMessage('success', 'Task deleted successfully!');
      // Reload page
      window.location.reload();
    } else {
      showMessage('error', response.message || 'Task deletion failed');
    }
  } catch (error) {
    console.error('Delete task error:', error);
    showMessage('error', 'Task deletion failed. Please try again.');
  }
};

// Helpers to colorize selects
function getStatusSelectClass(status) {
  switch (status) {
    case 'In Progress': return 'status-in-progress';
    case 'Completed': return 'status-completed';
    case 'Cancelled': return 'status-cancelled';
    case 'Not Started':
    default: return 'status-not-started';
  }
}

function getPrioritySelectClass(priority) {
  switch (priority) {
    case 'High': return 'priority-high';
    case 'Medium': return 'priority-medium';
    case 'Low':
    default: return 'priority-low';
  }
}

function showMessage(type, message) {
  // eslint-disable-next-line no-undef
  if (typeof Toastify !== 'undefined') {
    // eslint-disable-next-line no-undef
    Toastify({
      text: message,
      duration: 3000,
      gravity: 'top',
      position: 'right',
      backgroundColor: type === 'success' ? '#28a745' : '#dc3545'
    }).showToast();
  } else {
    alert(message);
  }
}

// Filter and sort functions
window.applyFilters = function() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search') || '';
  
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const priorityFilter = document.getElementById('priorityFilter')?.value || '';
  const categoryFilter = document.getElementById('categoryFilter')?.value || '';
  const sortBy = document.getElementById('sortBy')?.value || 'dueDate';
  const sortOrder = document.getElementById('sortOrder')?.value || 'asc';
  
  const newParams = new URLSearchParams();
  if (searchQuery) newParams.append('search', searchQuery);
  if (statusFilter) newParams.append('status', statusFilter);
  if (priorityFilter) newParams.append('priority', priorityFilter);
  if (categoryFilter) newParams.append('categoryId', categoryFilter);
  newParams.append('sortBy', sortBy);
  newParams.append('sortOrder', sortOrder);
  
  const newUrl = `/tasks?${newParams.toString()}`;
  if (window.router) {
    window.router.navigate(newUrl);
  } else {
    window.location.href = newUrl;
  }
};

// Reset filters to defaults
window.resetFilters = function() {
  if (window.router) {
    window.router.navigate('/tasks');
  } else {
    window.location.href = '/tasks';
  }
};

// Inline update for single field (status/priority)
window.updateTaskField = async function(taskId, field, value, el, dueDate) {
  try {
    const payload = { [field]: value };
    const response = await api.put(`/api/tasks/${taskId}`, payload);
    if (response.success) {
      // Special message for completed tasks
      let message = 'Update successful';
      if (field === 'status' && value === 'Completed' && dueDate) {
        const delayMessage = getCompletionDelayMessage(dueDate);
        message = delayMessage;
      }
      
      showMessage('success', message);
      
      // Reload page to show updated badge for completed late tasks
      if (field === 'status' && value === 'Completed') {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // Update color class
        if (el) {
          if (field === 'status') {
            el.className = `form-select form-select-sm select-status ${getStatusSelectClass(value)}`;
          } else if (field === 'priority') {
            el.className = `form-select form-select-sm select-priority ${getPrioritySelectClass(value)}`;
          }
        }
      }
    } else {
      showMessage('error', response.message || 'Update failed');
    }
  } catch (error) {
    console.error('Update task field error:', error);
    showMessage('error', 'Update failed. Please try again.');
  }
};

window.sortByColumn = function(column) {
  const urlParams = new URLSearchParams(window.location.search);
  const currentSortBy = urlParams.get('sortBy') || 'dueDate';
  const currentSortOrder = urlParams.get('sortOrder') || 'asc';
  
  let newSortOrder = 'asc';
  if (currentSortBy === column && currentSortOrder === 'asc') {
    newSortOrder = 'desc';
  }
  
  const newParams = new URLSearchParams(window.location.search);
  newParams.set('sortBy', column);
  newParams.set('sortOrder', newSortOrder);
  
  const newUrl = `/tasks?${newParams.toString()}`;
  if (window.router) {
    window.router.navigate(newUrl);
  } else {
    window.location.href = newUrl;
  }
};

