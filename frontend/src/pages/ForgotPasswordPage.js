import { api } from '../main.js';
import router from '../router/index.js';

export function renderForgotPasswordPage() {
  return `
    <div class="container py-5" style="margin-top: 0;">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="fas fa-lock fa-3x text-primary mb-3"></i>
                <h3 class="mb-2">Khôi phục mật khẩu</h3>
                <p class="text-muted">Nhập email của bạn để nhận mã OTP</p>
              </div>

              <form id="forgot-password-form">
                <div class="mb-3">
                  <label class="form-label">Email <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-envelope"></i></span>
                    <input 
                      type="email" 
                      class="form-control" 
                      name="email" 
                      placeholder="Nhập email của bạn"
                      required
                      autocomplete="email"
                    >
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 mb-3" id="submit-btn">
                  <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
                  <i class="fas fa-paper-plane me-2"></i>Gửi mã OTP
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

export function initForgotPasswordPage() {
  const form = document.getElementById('forgot-password-form');
  const submitBtn = document.getElementById('submit-btn');
  const spinner = submitBtn?.querySelector('.spinner-border');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    const formData = new FormData(form);
    const email = formData.get('email');

    try {
      const response = await api.post('/api/auth/send-otp', { email });

      if (response.success) {
        showMessage('success', response.message || 'Mã OTP đã được gửi đến email của bạn!');
        // Redirect to verify OTP page
        setTimeout(() => {
          router.navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        showMessage('error', response.message || 'Gửi mã OTP thất bại');
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
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

