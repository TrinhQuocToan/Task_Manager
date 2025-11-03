import { api } from '../main.js';
import router from '../router/index.js';

export async function renderCategoriesPage() {
  try {
    const response = await api.get('/api/categories');
    const categories = response.data?.categories || [];

    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2><i class="fas fa-tags me-2"></i>Danh mục</h2>
          <button class="btn btn-primary" onclick="showCategoryModal()">
            <i class="fas fa-plus me-2"></i>Tạo danh mục mới
          </button>
        </div>

        ${categories.length === 0 ? renderEmptyState() : renderCategoriesList(categories)}
      </div>

      <!-- Category Modal -->
      ${renderCategoryModal()}
    `;
  } catch (error) {
    console.error('Error rendering categories:', error);
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Không thể tải danh sách danh mục. Vui lòng thử lại.
        </div>
      </div>
    `;
  }
}

function renderEmptyState() {
  return `
    <div class="card border-0 shadow-sm">
      <div class="card-body text-center py-5">
        <div class="mb-4">
          <i class="fas fa-tags fa-4x text-muted"></i>
        </div>
        <h4 class="mb-3">Chưa có danh mục nào</h4>
        <p class="text-muted mb-4">Tạo danh mục đầu tiên để tổ chức công việc của bạn</p>
        <button class="btn btn-primary btn-lg" onclick="showCategoryModal()">
          <i class="fas fa-plus me-2"></i>Tạo danh mục mới
        </button>
      </div>
    </div>
  `;
}

function renderCategoriesList(categories) {
  return `
    <div class="row">
      ${categories.map(category => `
        <div class="col-md-4 mb-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span class="badge" style="background-color: ${category.color || '#198754'}; font-size: 1rem; padding: 0.5rem 1rem;">
                    <i class="fas ${category.icon || 'fa-tag'} me-2"></i>
                    ${category.name}
                  </span>
                </div>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-warning" onclick="editCategory('${category._id}', '${category.name}', '${category.color}', '${category.icon}')">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-outline-danger" onclick="deleteCategory('${category._id}')">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderCategoryModal() {
  return `
    <div class="modal fade" id="categoryModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="categoryModalTitle">Tạo danh mục mới</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="category-form">
              <input type="hidden" id="category-id" name="id">
              <div class="mb-3">
                <label class="form-label">Tên danh mục <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="category-name" name="name" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Màu sắc</label>
                <input type="color" class="form-control form-control-color" id="category-color" name="color" value="#198754">
              </div>
              <div class="mb-3">
                <label class="form-label">Icon</label>
                <select class="form-select" id="category-icon" name="icon">
                  <option value="fa-tag">Tag</option>
                  <option value="fa-briefcase">Briefcase</option>
                  <option value="fa-home">Home</option>
                  <option value="fa-graduation-cap">Education</option>
                  <option value="fa-heart">Heart</option>
                  <option value="fa-star">Star</option>
                  <option value="fa-calendar">Calendar</option>
                  <option value="fa-folder">Folder</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" onclick="saveCategory()">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Global functions for category management
window.showCategoryModal = function() {
  document.getElementById('category-id').value = '';
  document.getElementById('category-name').value = '';
  document.getElementById('category-color').value = '#198754';
  document.getElementById('category-icon').value = 'fa-tag';
  document.getElementById('categoryModalTitle').textContent = 'Tạo danh mục mới';
  
  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
};

window.editCategory = function(id, name, color, icon) {
  document.getElementById('category-id').value = id;
  document.getElementById('category-name').value = name;
  document.getElementById('category-color').value = color || '#198754';
  document.getElementById('category-icon').value = icon || 'fa-tag';
  document.getElementById('categoryModalTitle').textContent = 'Chỉnh sửa danh mục';
  
  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
};

window.saveCategory = async function() {
  const form = document.getElementById('category-form');
  const categoryId = document.getElementById('category-id').value;
  const name = document.getElementById('category-name').value;
  const color = document.getElementById('category-color').value;
  const icon = document.getElementById('category-icon').value;

  if (!name.trim()) {
    showMessage('error', 'Vui lòng nhập tên danh mục');
    return;
  }

  const data = { name, color, icon };

  try {
    let response;
    if (categoryId) {
      response = await api.put(`/api/categories/${categoryId}`, data);
    } else {
      response = await api.post('/api/categories', data);
    }

    if (response.success) {
      showMessage('success', response.message || 'Lưu thành công!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
      modal.hide();
      // Reload page
      window.location.reload();
    } else {
      showMessage('error', response.message || 'Lưu thất bại');
    }
  } catch (error) {
    console.error('Save category error:', error);
    showMessage('error', 'Có lỗi xảy ra. Vui lòng thử lại.');
  }
};

window.deleteCategory = async function(categoryId) {
  if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
    return;
  }

  try {
    const response = await api.delete(`/api/categories/${categoryId}`);
    if (response.success) {
      showMessage('success', 'Xóa danh mục thành công!');
      window.location.reload();
    } else {
      showMessage('error', response.message || 'Xóa danh mục thất bại');
    }
  } catch (error) {
    console.error('Delete category error:', error);
    showMessage('error', 'Xóa danh mục thất bại. Vui lòng thử lại.');
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

