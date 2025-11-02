import { api } from '../main.js';

export function renderLoginPage() {
  return `
    <div class="auth-wrapper">
      <div class="row w-100 mx-0">
        <div class="col-md-6 welcome-section">
          <h1 class="welcome-text">
            Chào mừng quay trở lại!
            <span>Hãy quản lý tài chính của bạn một cách thông minh</span>
          </h1>
        </div>
        
        <div class="col-md-6 form-section">
          <div class="login-form">
            <h2 class="mb-4">Đăng nhập</h2>
            <p class="text-muted mb-4">Đăng nhập vào tài khoản của bạn để tiếp tục sử dụng các tính năng mới.</p>

            <div id="login-messages"></div>

            <form id="login-form">
              <div class="mb-3">
                <label class="form-label">
                  <i class="far fa-envelope me-2"></i>Email
                </label>
                <input type="email" class="form-control" name="email" placeholder="Email" required>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-lock me-2"></i>Mật khẩu
                </label>
                <input type="password" class="form-control" name="password" placeholder="Mật khẩu" required>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3">Đăng nhập</button>

              <a href="/auth/google" class="btn btn-google w-100" data-link="/auth/google">
                <i class="fab fa-google me-2"></i>Đăng nhập với Google
              </a>

              <div class="mt-4 text-center">
                <span class="me-2">Bạn chưa có tài khoản?</span>
                <a href="/auth/register" class="text-primary" data-link="/auth/register">Tạo Tài Khoản Ngay</a>
                <span class="mx-2">·</span>
                <a href="/auth/forgot-password" class="text-primary" data-link="/auth/forgot-password">Quên mật khẩu?</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initLoginPage() {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        email: formData.get('email'),
        password: formData.get('password')
      };

      try {
        const response = await api.post('/auth/login', data);
        if (response.success || response.user) {
          window.location.href = '/';
        } else {
          showMessage('error', response.message || 'Đăng nhập thất bại');
        }
      } catch (error) {
        showMessage('error', 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    });
  }
}

function showMessage(type, message) {
  const messagesDiv = document.getElementById('login-messages');
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
  const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
  
  messagesDiv.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show">
      <i class="fas ${icon} me-2"></i>${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

