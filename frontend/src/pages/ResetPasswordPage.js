import { api } from '../main.js';
import router from '../router/index.js';

export function renderResetPasswordPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';
  const otp = urlParams.get('otp') || '';

  return `
    <div class="container py-5" style="margin-top: 0;">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="fas fa-lock-open fa-3x text-success mb-3"></i>
                <h3 class="mb-2">Đặt lại mật khẩu</h3>
                <p class="text-muted">Nhập mật khẩu mới của bạn</p>
                ${email ? `<small class="text-muted d-block">${email}</small>` : ''}
              </div>

              <form id="reset-password-form">
                <input type="hidden" name="email" value="${email}">
                <input type="hidden" name="otp" value="${otp}">
                
                <div class="mb-3">
                  <label class="form-label">Mật khẩu mới <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input 
                      type="password" 
                      class="form-control" 
                      name="password" 
                      id="password"
                      placeholder="Nhập mật khẩu mới"
                      required
                      minlength="6"
                      autocomplete="new-password"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      onclick="togglePassword('password')"
                    >
                      <i class="fas fa-eye" id="password-eye"></i>
                    </button>
                  </div>
                  <small class="form-text text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
                </div>

                <div class="mb-3">
                  <label class="form-label">Xác nhận mật khẩu <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-lock"></i></span>
                    <input 
                      type="password" 
                      class="form-control" 
                      name="confirmPassword" 
                      id="confirmPassword"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minlength="6"
                      autocomplete="new-password"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      onclick="togglePassword('confirmPassword')"
                    >
                      <i class="fas fa-eye" id="confirmPassword-eye"></i>
                    </button>
                  </div>
                </div>

                <button type="submit" class="btn btn-success w-100 mb-3" id="submit-btn">
                  <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
                  <i class="fas fa-check me-2"></i>Đặt lại mật khẩu
                </button>

                <div class="text-center">
                  <a href="/auth/login" class="text-decoration-none" data-link="/auth/login">
                    <i class="fas fa-arrow-left me-1"></i>Quay lại đăng nhập
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initResetPasswordPage() {
  const form = document.getElementById('reset-password-form');
  const submitBtn = document.getElementById('submit-btn');
  const spinner = submitBtn?.querySelector('.spinner-border');

  if (!form) return;

  // Toggle password visibility
  window.togglePassword = function(inputId) {
    const input = document.getElementById(inputId);
    const eye = document.getElementById(`${inputId}-eye`);
    
    if (input.type === 'password') {
      input.type = 'text';
      eye.classList.remove('fa-eye');
      eye.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      eye.classList.remove('fa-eye-slash');
      eye.classList.add('fa-eye');
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const email = formData.get('email');
    const otp = formData.get('otp');

    // Client-side validation
    if (password !== confirmPassword) {
      showMessage('error', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      showMessage('error', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    try {
      const response = await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword: password,  // Backend expects 'newPassword' not 'password'
        confirmPassword
      });

      if (response.success) {
        showMessage('success', response.message || 'Đặt lại mật khẩu thành công!');
        // Redirect to login page
        setTimeout(() => {
          router.navigate('/auth/login');
        }, 2000);
      } else {
        showMessage('error', response.message || 'Đặt lại mật khẩu thất bại');
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showMessage('error', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
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

