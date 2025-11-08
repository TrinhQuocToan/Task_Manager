import { api } from '../main.js';
import router from '../router/index.js';

export async function renderCategoriesPage() {
  try {
    const response = await api.get('/api/categories');
    const categories = response.data?.categories || [];

    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2><i class="fas fa-tags me-2"></i>Categories</h2>
          <button class="btn btn-primary" onclick="showCategoryModal()">
            <i class="fas fa-plus me-2"></i>Create new category
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
          Failed to load categories list. Please try again.
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
        <h4 class="mb-3">No categories found</h4>
        <p class="text-muted mb-4">Create your first category to organize your tasks</p>
        <button class="btn btn-primary btn-lg" onclick="showCategoryModal()">
          <i class="fas fa-plus me-2"></i>Create new category
        </button>
      </div>
    </div>
  `;
}

function renderCategoriesList(categories) {
  return `
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover align-middle">
            <thead>
              <tr>
                <th style="width: 60px;">#</th>
                <th>Category Name</th>
                <th style="width: 150px;" class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${categories.map((category, index) => `
                <tr>
                  <td class="text-muted">${index + 1}</td>
                  <td>
                    <span class="fw-semibold">${category.name}</span>
                  </td>
                  <td class="text-end">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-warning" onclick="editCategory('${category._id}', '${category.name}')" title="Edit">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-outline-danger" onclick="deleteCategory('${category._id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderCategoryModal() {
  return `
    <div class="modal fade" id="categoryModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="categoryModalTitle">Create new category</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form id="category-form">
              <input type="hidden" id="category-id" name="id">
              <div class="mb-3">
                <label class="form-label">Category name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="category-name" name="name" required>
              </div>
            </form>
          </div>
          <div class="modal-footer align-items-center">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="saveCategory()">Save</button>
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
  document.getElementById('categoryModalTitle').textContent = 'Create new category';
  
  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
};

window.editCategory = function(id, name) {
  document.getElementById('category-id').value = id;
  document.getElementById('category-name').value = name;
  document.getElementById('categoryModalTitle').textContent = 'Edit category';
  
  const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
  modal.show();
};

window.saveCategory = async function() {
  const form = document.getElementById('category-form');
  const categoryId = document.getElementById('category-id').value;
  const name = document.getElementById('category-name').value;

  if (!name.trim()) {
    showMessage('error', 'Please enter a category name');
    return;
  }

  const data = { name };

  try {
    let response;
    if (categoryId) {
      response = await api.put(`/api/categories/${categoryId}`, data);
    } else {
      response = await api.post('/api/categories', data);
    }

    if (response.success) {
      showMessage('success', response.message || 'Save successful!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
      modal.hide();
      // Reload page
      window.location.reload();
    } else {
      showMessage('error', response.message || 'Save failed');
    }
  } catch (error) {
    console.error('Save category error:', error);
    showMessage('error', 'An error occurred. Please try again.');
  }
};

window.deleteCategory = async function(categoryId) {
  if (!confirm('Are you sure you want to delete this category?')) {
    return;
  }

  try {
    const response = await api.delete(`/api/categories/${categoryId}`);
    if (response.success) {
      showMessage('success', 'Category deleted successfully!');
      window.location.reload();
    } else {
      showMessage('error', response.message || 'Category deletion failed');
    }
  } catch (error) {
    console.error('Delete category error:', error);
      showMessage('error', 'Category deletion failed. Please try again.');
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

