import { api } from '../main.js';
import { formatDate, formatDateOnly, getStatusBadgeClass, getPriorityBadgeClass, getStatusIcon } from '../utils/format.js';

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
    if (statusFilter) queryParams.append('status', statusFilter);
    if (priorityFilter) queryParams.append('priority', priorityFilter);
    if (categoryFilter) queryParams.append('categoryId', categoryFilter);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    
    const url = `/api/tasks?${queryParams.toString()}`;
    const response = await api.get(url);
    const tasks = response.data?.tasks || [];
    
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2><i class="fas fa-check-square me-2"></i>Công việc</h2>
            ${searchQuery || statusFilter || priorityFilter || categoryFilter ? `
              <div class="mt-2">
                <span class="badge bg-info">
                  <i class="fas fa-filter me-1"></i>
                  Đang lọc (${tasks.length} kết quả)
                  <a href="/tasks" class="text-white ms-2" data-link="/tasks" style="text-decoration: none;">
                    <i class="fas fa-times"></i>
                  </a>
                </span>
              </div>
            ` : ''}
          </div>
          <a href="/tasks/create" class="btn btn-primary" data-link="/tasks/create">
            <i class="fas fa-plus me-2"></i>Tạo công việc mới
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
          Không thể tải danh sách công việc. Vui lòng thử lại.
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
          <h4 class="mb-3">Không tìm thấy kết quả</h4>
          <p class="text-muted mb-4">Không có công việc nào phù hợp với từ khóa "${searchQuery}"</p>
          <a href="/tasks" class="btn btn-secondary" data-link="/tasks">
            <i class="fas fa-arrow-left me-2"></i>Quay lại danh sách
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
        <h4 class="mb-3">Chưa có công việc nào</h4>
        <p class="text-muted mb-4">Bắt đầu bằng cách tạo công việc đầu tiên của bạn</p>
        <a href="/tasks/create" class="btn btn-primary btn-lg" data-link="/tasks/create">
          <i class="fas fa-plus me-2"></i>Tạo công việc mới
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
            <label class="form-label small text-muted"><i class="fas fa-filter me-1"></i>Lọc theo trạng thái</label>
            <select class="form-select form-select-sm" id="statusFilter" onchange="applyFilters()">
              <option value="">Tất cả</option>
              <option value="Not Started" ${statusFilter === 'Not Started' ? 'selected' : ''}>Chưa bắt đầu</option>
              <option value="In Progress" ${statusFilter === 'In Progress' ? 'selected' : ''}>Đang làm</option>
              <option value="Completed" ${statusFilter === 'Completed' ? 'selected' : ''}>Hoàn thành</option>
              <option value="Cancelled" ${statusFilter === 'Cancelled' ? 'selected' : ''}>Đã hủy</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-flag me-1"></i>Lọc theo mức độ ưu tiên</label>
            <select class="form-select form-select-sm" id="priorityFilter" onchange="applyFilters()">
              <option value="">Tất cả</option>
              <option value="Low" ${priorityFilter === 'Low' ? 'selected' : ''}>Thấp</option>
              <option value="Medium" ${priorityFilter === 'Medium' ? 'selected' : ''}>Trung bình</option>
              <option value="High" ${priorityFilter === 'High' ? 'selected' : ''}>Cao</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-tag me-1"></i>Lọc theo danh mục</label>
            <select class="form-select form-select-sm" id="categoryFilter" onchange="applyFilters()">
              <option value="">Tất cả</option>
              ${categories.map(cat => `
                <option value="${cat._id}" ${categoryFilter === cat._id ? 'selected' : ''}>${cat.name}</option>
              `).join('')}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-sort me-1"></i>Sắp xếp</label>
            <select class="form-select form-select-sm" id="sortBy" onchange="applyFilters()">
              <option value="dueDate" ${sortBy === 'dueDate' ? 'selected' : ''}>Hạn chót</option>
              <option value="createdAt" ${sortBy === 'createdAt' ? 'selected' : ''}>Ngày tạo</option>
              <option value="priority" ${sortBy === 'priority' ? 'selected' : ''}>Mức ưu tiên</option>
              <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Tiêu đề</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small text-muted"><i class="fas fa-sort-amount-down me-1"></i>Thứ tự</label>
            <select class="form-select form-select-sm" id="sortOrder" onchange="applyFilters()">
              <option value="asc" ${sortOrder === 'asc' ? 'selected' : ''}>Tăng dần</option>
              <option value="desc" ${sortOrder === 'desc' ? 'selected' : ''}>Giảm dần</option>
            </select>
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
                      Tiêu đề <i class="fas ${getSortIcon('title')}"></i>
                    </th>
                    <th>Danh mục</th>
                    <th class="${getSortClass('priority')}" style="cursor: pointer;" onclick="sortByColumn('priority')">
                      Mức độ ưu tiên <i class="fas ${getSortIcon('priority')}"></i>
                    </th>
                    <th class="${getSortClass('status')}" style="cursor: pointer;" onclick="sortByColumn('status')">
                      Trạng thái <i class="fas ${getSortIcon('status')}"></i>
                    </th>
                    <th class="${getSortClass('dueDate')}" style="cursor: pointer;" onclick="sortByColumn('dueDate')">
                      Hạn chót <i class="fas ${getSortIcon('dueDate')}"></i>
                    </th>
                    <th>Thao tác</th>
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
  const statusClass = getStatusBadgeClass(task.status);
  const priorityClass = getPriorityBadgeClass(task.priority);
  const statusIcon = getStatusIcon(task.status);
  
  return `
    <tr>
      <td>
        <div>
          <strong>${task.title || 'Không có tiêu đề'}</strong>
          ${task.description ? `<br><small class="text-muted">${task.description}</small>` : ''}
        </div>
      </td>
      <td>
        ${task.categoryId ? `
          <span class="badge" style="background-color: ${task.categoryId.color || '#198754'};">
            <i class="fas ${task.categoryId.icon || 'fa-tag'} me-1"></i>
            ${task.categoryId.name || 'N/A'}
          </span>
        ` : '<span class="text-muted">N/A</span>'}
      </td>
      <td>
        <span class="badge ${priorityClass}">${task.priority || 'Medium'}</span>
      </td>
      <td>
        <span class="badge ${statusClass}">
          <i class="fas ${statusIcon} me-1"></i>
          ${task.status || 'Not Started'}
        </span>
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
  if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
    return;
  }

  try {
    const response = await api.delete(`/api/tasks/${taskId}`);
    if (response.success) {
      showMessage('success', 'Xóa công việc thành công!');
      // Reload page
      window.location.reload();
    } else {
      showMessage('error', response.message || 'Xóa công việc thất bại');
    }
  } catch (error) {
    console.error('Delete task error:', error);
    showMessage('error', 'Xóa công việc thất bại. Vui lòng thử lại.');
  }
};

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

