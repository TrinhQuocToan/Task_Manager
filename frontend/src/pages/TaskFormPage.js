import { api } from '../main.js';
import router from '../router/index.js';

export async function renderTaskFormPage(taskId = null) {
  try {
    // Fetch categories for dropdown
    const categoriesResponse = await api.get('/api/categories');
    const categories = categoriesResponse.data?.categories || [];

    // If editing, fetch task data
    let task = null;
    if (taskId) {
      const taskResponse = await api.get(`/api/tasks/${taskId}`);
      task = taskResponse.data?.task;
    }

    const isEdit = !!taskId;
    
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h4 class="mb-0">
                  <i class="fas ${isEdit ? 'fa-edit' : 'fa-plus'} me-2"></i>
                  ${isEdit ? 'Edit task' : 'Create new task'}
                </h4>
              </div>
              <div class="card-body">
                ${renderTaskForm(task, categories, isEdit)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering task form:', error);
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          ${error.message || 'Failed to load form. Please try again.'}
        </div>
      </div>
    `;
  }
}

function renderTaskForm(task, categories, isEdit) {
  const priorityOptions = ['Low', 'Medium', 'High'];
  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'Cancelled'];

  // Format date for input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return `
    <form id="task-form">
      <div class="mb-3">
        <label class="form-label">
          <i class="fas fa-heading me-2"></i>Title <span class="text-danger">*</span>
        </label>
        <input 
          type="text" 
          class="form-control" 
          name="title" 
          value="${task?.title || ''}"
          placeholder="Enter task title"
          required
        >
      </div>

      <div class="mb-3">
        <label class="form-label">
          <i class="fas fa-align-left me-2"></i>Description
        </label>
        <textarea 
          class="form-control" 
          name="description" 
          rows="3"
          placeholder="Enter detailed description of the task"
        >${task?.description || ''}</textarea>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">
            <i class="fas fa-tags me-2"></i>Category <span class="text-danger">*</span>
          </label>
          <select class="form-select" name="categoryId" required>
            <option value="">Select category</option>
            ${categories.map(cat => `
              <option value="${cat._id}" ${task?.categoryId?._id === cat._id || task?.categoryId === cat._id ? 'selected' : ''}>
                ${cat.name}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">
            <i class="fas fa-flag me-2"></i>Priority
          </label>
          <select class="form-select" name="priority">
            ${priorityOptions.map(priority => `
              <option value="${priority}" ${task?.priority === priority ? 'selected' : ''}>
                ${priority}
              </option>
            `).join('')}
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">
            <i class="fas fa-info-circle me-2"></i>Status
          </label>
          <select class="form-select" name="status">
            ${statusOptions.map(status => `
              <option value="${status}" ${task?.status === status ? 'selected' : ''}>
                ${status}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">
            <i class="fas fa-calendar-alt me-2"></i>Deadline <span class="text-danger">*</span>
          </label>
          <input 
            type="datetime-local" 
            class="form-control" 
            name="dueDate" 
            value="${formatDateForInput(task?.dueDate)}"
            required
          >
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">
          <i class="fas fa-bell me-2"></i>Reminder
        </label>
        <input 
          type="datetime-local" 
          class="form-control" 
          name="reminderAt" 
          value="${formatDateForInput(task?.reminderAt)}"
        >
      </div>

      <div class="d-flex justify-content-between">
        <a href="/tasks" class="btn btn-secondary" data-link="/tasks">
          <i class="fas fa-times me-2"></i>Cancel
        </a>
        <button type="submit" class="btn btn-primary" id="submit-btn">
          <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
          <i class="fas fa-save me-2"></i>${isEdit ? 'Update' : 'Create new'}
        </button>
      </div>
    </form>
  `;
}

export function initTaskFormPage(taskId = null) {
  const form = document.getElementById('task-form');
  const submitBtn = document.getElementById('submit-btn');
  const spinner = submitBtn?.querySelector('.spinner-border');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      if (spinner) spinner.classList.remove('d-none');
    }

    const formData = new FormData(form);
    
    // Convert datetime-local to ISO string
    const dueDate = formData.get('dueDate');
    const reminderAt = formData.get('reminderAt');
    
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId'),
      priority: formData.get('priority'),
      status: formData.get('status'),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null
    };

    try {
      let response;
      if (taskId) {
        // Update task
        response = await api.put(`/api/tasks/${taskId}`, data);
      } else {
        // Create task
        response = await api.post('/api/tasks', data);
      }

      if (response.success) {
        showMessage('success', response.message || (taskId ? 'Update successful!' : 'Task created successfully!'));
        setTimeout(() => {
          router.navigate('/tasks');
        }, 1000);
      } else {
        showMessage('error', response.message || 'Operation failed');
        if (submitBtn) {
          submitBtn.disabled = false;
          if (spinner) spinner.classList.add('d-none');
        }
      }
    } catch (error) {
      console.error('Task form error:', error);
        showMessage('error', error.message || 'An error occurred. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        if (spinner) spinner.classList.add('d-none');
      }
    }
  });
}

function showMessage(type, message) {
  if (window.Toastify) {
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

