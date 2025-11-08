import { api } from '../main.js';
import { formatDate, formatDateOnly, getStatusBadgeClass, getPriorityBadgeClass, getStatusIcon, isTaskOverdue, getOverdueBadgeText, wasCompletedLate, getCompletedLateBadgeText } from '../utils/format.js';

export async function renderTaskDetailPage(taskId) {
  try {
    // Fetch task details
    const response = await api.get(`/api/tasks/${taskId}`);
    
    if (!response.success || !response.data) {
      return `
        <div class="container-fluid py-4" style="margin-top: 0;">
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Task not found or failed to load.
          </div>
          <a href="/tasks" class="btn btn-secondary" data-link="/tasks">
            <i class="fas fa-arrow-left me-2"></i>Back to tasks list
          </a>
        </div>
      `;
    }
    
    const task = response.data.task;
    const statusClass = getStatusBadgeClass(task.status);
    const priorityClass = getPriorityBadgeClass(task.priority);
    const statusIcon = getStatusIcon(task.status);
    const isOverdue = isTaskOverdue(task);
    const overdueBadge = isOverdue ? getOverdueBadgeText(task) : '';
    
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        ${isOverdue ? `
          <div class="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>Overdue Alert:</strong> This task is <strong>${overdueBadge}</strong>!
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        ` : ''}
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <a href="/tasks" class="btn btn-link text-decoration-none ps-0" data-link="/tasks">
              <i class="fas fa-arrow-left me-2"></i>Back to tasks
            </a>
            <h2 class="mt-2"><i class="fas fa-tasks me-2"></i>Task Details</h2>
          </div>
          <div class="btn-group">
            <a href="/tasks/${task._id}/edit" class="btn btn-warning" data-link="/tasks/${task._id}/edit">
              <i class="fas fa-edit me-2"></i>Edit
            </a>
            <button class="btn btn-danger" onclick="deleteTaskAndRedirect('${task._id}')">
              <i class="fas fa-trash me-2"></i>Delete
            </button>
          </div>
        </div>

        <!-- Task Details Card -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body">
                <h3 class="card-title mb-3">${task.title || 'No title'}</h3>
                
                <div class="row mb-3">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="text-muted small d-block mb-1">
                        <i class="fas fa-info-circle me-1"></i>Status
                      </label>
                      <div>
                        <span class="badge ${statusClass} fs-6">
                          <i class="${statusIcon} me-1"></i>${task.status}
                        </span>
                        ${(() => {
                          const lateBadge = getCompletedLateBadgeText(task);
                          return lateBadge ? `
                            <span class="badge bg-warning text-dark fs-6 ms-2">
                              <i class="fas fa-clock me-1"></i>${lateBadge}
                            </span>
                          ` : '';
                        })()}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="text-muted small d-block mb-1">
                        <i class="fas fa-flag me-1"></i>Priority
                      </label>
                      <span class="badge ${priorityClass} fs-6">${task.priority}</span>
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="text-muted small d-block mb-1">
                    <i class="fas fa-align-left me-1"></i>Description
                  </label>
                  <div class="p-3 bg-light rounded">
                    ${task.description ? `<p class="mb-0">${task.description}</p>` : '<p class="mb-0 text-muted">No description</p>'}
                  </div>
                </div>

                ${task.categoryId ? `
                  <div class="mb-3">
                    <label class="text-muted small d-block mb-1">
                      <i class="fas fa-tag me-1"></i>Category
                    </label>
                    <span class="badge fs-6" style="background-color: ${task.categoryId.color || '#d86b22'};">
                      <i class="fas ${task.categoryId.icon || 'fa-tag'} me-1"></i>
                      ${task.categoryId.name || 'N/A'}
                    </span>
                  </div>
                ` : ''}

                <div class="row">
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="text-muted small d-block mb-1">
                        <i class="fas fa-calendar-alt me-1"></i>Due Date
                      </label>
                      <p class="mb-0">${task.dueDate ? formatDateOnly(task.dueDate) : 'N/A'}</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="text-muted small d-block mb-1">
                        <i class="fas fa-bell me-1"></i>Reminder Date
                      </label>
                      <p class="mb-0">${task.reminderAt ? formatDate(task.reminderAt) : 'N/A'}</p>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="mb-3">
                      <label class="text-muted small d-block mb-1">
                        <i class="fas fa-clock me-1"></i>Created At
                      </label>
                      <p class="mb-0">${formatDate(task.createdAt)}</p>
                    </div>
                  </div>
                </div>

                ${task.updatedAt ? `
                  <div class="mb-0">
                    <label class="text-muted small d-block mb-1">
                      <i class="fas fa-history me-1"></i>Last Updated
                    </label>
                    <p class="mb-0">${formatDate(task.updatedAt)}</p>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering task detail:', error);
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Failed to load task details. Please try again.
        </div>
        <a href="/tasks" class="btn btn-secondary" data-link="/tasks">
          <i class="fas fa-arrow-left me-2"></i>Back to tasks list
        </a>
      </div>
    `;
  }
}

// Delete task and redirect to tasks list
window.deleteTaskAndRedirect = async function(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  try {
    const response = await api.delete(`/api/tasks/${taskId}`);
    if (response.success) {
      showMessage('success', 'Task deleted successfully!');
      // Redirect to tasks list
      setTimeout(() => {
        if (window.router) {
          window.router.navigate('/tasks');
        } else {
          window.location.href = '/tasks';
        }
      }, 1000);
    } else {
      showMessage('error', response.message || 'Task deletion failed');
    }
  } catch (error) {
    console.error('Delete task error:', error);
    showMessage('error', 'Task deletion failed. Please try again.');
  }
};

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
