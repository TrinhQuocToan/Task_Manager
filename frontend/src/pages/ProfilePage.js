import { api, getCurrentUser } from '../main.js';
import router from '../router/index.js';

export async function renderProfilePage() {
  try {
    // Get current user data
    const user = await getCurrentUser();
    
    if (!user) {
      window.location.href = '/auth/login';
      return '';
    }

    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h4 class="mb-0">
                  <i class="fas fa-user me-2"></i>Hồ sơ cá nhân
                </h4>
              </div>
              <div class="card-body">
                ${renderProfileForm(user)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering profile:', error);
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Không thể tải thông tin hồ sơ. Vui lòng thử lại.
        </div>
      </div>
    `;
  }
}

function renderProfileForm(user) {
  return `
    <form id="profile-form">
      <div class="text-center mb-4">
        <div class="position-relative d-inline-block">
          <img 
            src="${user.avatar || 'https://secure.gravatar.com/avatar/default?s=120&d=mp'}" 
            alt="Avatar" 
            class="rounded-circle" 
            id="avatar-preview"
            style="width: 120px; height: 120px; object-fit: cover; border: 4px solid #198754;"
            onerror="this.src='https://secure.gravatar.com/avatar/default?s=120&d=mp'"
          >
          <label for="avatar-input" class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle" style="width: 36px; height: 36px; cursor: pointer;">
            <i class="fas fa-camera"></i>
          </label>
          <input type="file" id="avatar-input" accept="image/*" style="display: none;">
          <input type="hidden" id="avatar-url" name="avatar" value="${user.avatar || ''}">
        </div>
        <p class="text-muted mt-2">Click vào icon camera để thay đổi avatar</p>
      </div>

      <div class="mb-3">
        <label class="form-label">
          <i class="fas fa-user me-2"></i>Tên đăng nhập <span class="text-danger">*</span>
        </label>
        <input 
          type="text" 
          class="form-control" 
          name="username" 
          value="${user.username || ''}"
          placeholder="Tên đăng nhập"
          required
          minlength="3"
          maxlength="20"
        >
        <small class="form-text text-muted">Tên đăng nhập phải có từ 3-20 ký tự</small>
      </div>

      <div class="mb-3">
        <label class="form-label">
          <i class="fas fa-envelope me-2"></i>Email <span class="text-danger">*</span>
        </label>
        <input 
          type="email" 
          class="form-control" 
          name="email" 
          value="${user.email || ''}"
          placeholder="Email"
          required
        >
        <small class="form-text text-muted">Email sẽ được dùng để đăng nhập</small>
      </div>

      <div class="mb-3">
        <label class="form-label">
          <i class="fas fa-calendar me-2"></i>Ngày tham gia
        </label>
        <input 
          type="text" 
          class="form-control" 
          value="${user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}"
          disabled
          style="background-color: #f8f9fa;"
        >
      </div>

      <hr class="my-4">

      <div class="mb-3">
        <button type="button" class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#changePasswordModal">
          <i class="fas fa-key me-2"></i>Đổi mật khẩu
        </button>
      </div>

      <div class="d-flex justify-content-between">
        <a href="/" class="btn btn-secondary" data-link="/">
          <i class="fas fa-times me-2"></i>Hủy
        </a>
        <button type="submit" class="btn btn-primary" id="submit-btn">
          <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
          <i class="fas fa-save me-2"></i>Cập nhật hồ sơ
        </button>
      </div>
    </form>

    <!-- Change Password Modal -->
    <div class="modal fade" id="changePasswordModal" tabindex="-1" aria-labelledby="changePasswordModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="changePasswordModalLabel">
              <i class="fas fa-lock me-2"></i>Đổi mật khẩu
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="change-password-form">
              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-key me-2"></i>Mật khẩu hiện tại <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input 
                    type="password" 
                    class="form-control" 
                    name="currentPassword" 
                    id="modalCurrentPassword"
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                    autocomplete="current-password"
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    onclick="togglePasswordVisibility('modalCurrentPassword')"
                  >
                    <i class="fas fa-eye" id="modalCurrentPassword-eye"></i>
                  </button>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-lock me-2"></i>Mật khẩu mới <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input 
                    type="password" 
                    class="form-control" 
                    name="newPassword" 
                    id="modalNewPassword"
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    required
                    minlength="6"
                    autocomplete="new-password"
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    onclick="togglePasswordVisibility('modalNewPassword')"
                  >
                    <i class="fas fa-eye" id="modalNewPassword-eye"></i>
                  </button>
                </div>
                <small class="form-text text-muted">Mật khẩu mới phải có ít nhất 6 ký tự</small>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-lock me-2"></i>Xác nhận mật khẩu mới <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <input 
                    type="password" 
                    class="form-control" 
                    name="confirmNewPassword" 
                    id="modalConfirmNewPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    required
                    minlength="6"
                    autocomplete="new-password"
                  >
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button" 
                    onclick="togglePasswordVisibility('modalConfirmNewPassword')"
                  >
                    <i class="fas fa-eye" id="modalConfirmNewPassword-eye"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-warning" id="modal-change-password-btn">
              <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
              <i class="fas fa-key me-2"></i>Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initProfilePage() {
  const form = document.getElementById('profile-form');
  const submitBtn = document.getElementById('submit-btn');
  const spinner = submitBtn?.querySelector('.spinner-border');
  const avatarInput = document.getElementById('avatar-input');
  const avatarPreview = document.getElementById('avatar-preview');
  const avatarUrlInput = document.getElementById('avatar-url');

  if (!form) return;

  // Handle avatar upload (using URL for now, can be enhanced with file upload later)
  if (avatarInput && avatarPreview) {
    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        // For now, we'll use a placeholder or convert to base64
        // In production, you should upload to cloud storage (S3, Cloudinary, etc.)
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          avatarPreview.src = base64;
          if (avatarUrlInput) {
            avatarUrlInput.value = base64; // Store base64 for now
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Toggle password visibility
  window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(`${inputId}-eye`);
    
    if (input && eye) {
      if (input.type === 'password') {
        input.type = 'text';
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
      }
    }
  };

  // Handle profile form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      if (spinner) spinner.classList.remove('d-none');
    }

    const formData = new FormData(form);
    
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      avatar: avatarUrlInput?.value || formData.get('avatar')
    };

    try {
      const response = await api.put('/api/auth/profile', data);

      if (response.success) {
        showMessage('success', response.message || 'Cập nhật hồ sơ thành công!');
        // Reload user data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        showMessage('error', response.message || 'Cập nhật hồ sơ thất bại');
        if (submitBtn) {
          submitBtn.disabled = false;
          if (spinner) spinner.classList.add('d-none');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showMessage('error', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      if (submitBtn) {
        submitBtn.disabled = false;
        if (spinner) spinner.classList.add('d-none');
      }
    }
  });

  // Handle change password modal form
  const changePasswordForm = document.getElementById('change-password-form');
  const modalChangePasswordBtn = document.getElementById('modal-change-password-btn');
  const changePasswordModal = document.getElementById('changePasswordModal');

  if (modalChangePasswordBtn) {
    modalChangePasswordBtn.addEventListener('click', async () => {
      const currentPassword = document.getElementById('modalCurrentPassword')?.value;
      const newPassword = document.getElementById('modalNewPassword')?.value;
      const confirmNewPassword = document.getElementById('modalConfirmNewPassword')?.value;

      // Validation
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        showMessage('error', 'Vui lòng điền đầy đủ các trường mật khẩu');
        return;
      }

      if (newPassword.length < 6) {
        showMessage('error', 'Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        showMessage('error', 'Mật khẩu mới và xác nhận không khớp');
        return;
      }

      if (currentPassword === newPassword) {
        showMessage('error', 'Mật khẩu mới phải khác mật khẩu hiện tại');
        return;
      }

      // Disable button and show spinner
      modalChangePasswordBtn.disabled = true;
      const changePasswordSpinner = modalChangePasswordBtn.querySelector('.spinner-border');
      if (changePasswordSpinner) changePasswordSpinner.classList.remove('d-none');

      try {
        const response = await api.put('/api/auth/change-password', {
          currentPassword,
          newPassword,
          confirmPassword: confirmNewPassword
        });

        if (response.success) {
          showMessage('success', response.message || 'Đổi mật khẩu thành công!');
          
          // Clear password fields
          if (changePasswordForm) {
            changePasswordForm.reset();
          }
          
          // Close modal
          if (changePasswordModal) {
            // Try to get Bootstrap modal instance
            let modalInstance = null;
            if (window.bootstrap) {
              modalInstance = window.bootstrap.Modal.getInstance(changePasswordModal);
            }
            if (!modalInstance && typeof bootstrap !== 'undefined' && bootstrap.Modal) {
              modalInstance = bootstrap.Modal.getInstance(changePasswordModal);
            }
            
            if (modalInstance) {
              modalInstance.hide();
            } else {
              // Fallback: trigger close button click
              const closeBtn = changePasswordModal.querySelector('[data-bs-dismiss="modal"]');
              if (closeBtn) {
                closeBtn.click();
              }
            }
          }
        } else {
          showMessage('error', response.message || 'Đổi mật khẩu thất bại');
        }
      } catch (error) {
        console.error('Change password error:', error);
        showMessage('error', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      } finally {
        modalChangePasswordBtn.disabled = false;
        if (changePasswordSpinner) changePasswordSpinner.classList.add('d-none');
      }
    });
  }

  // Clear form when modal is closed
  if (changePasswordModal && changePasswordForm) {
    changePasswordModal.addEventListener('hidden.bs.modal', () => {
      changePasswordForm.reset();
    });
  }
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

