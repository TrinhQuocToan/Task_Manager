import { api } from '../main.js';

export function renderRegisterPage() {
  return `
    <div class="auth-wrapper">
      <div class="row w-100 mx-0">
        <div class="col-md-6 welcome-section">
          <h1 class="welcome-text">
            Bắt đầu hành trình quản lý tài chính!
            <span>Tham gia cùng chúng tôi ngay hôm nay</span>
          </h1>
        </div>
        
        <div class="col-md-6 form-section">
          <div class="login-form">
            <h2 class="mb-4">Đăng ký</h2>
            <p class="text-muted mb-4">Tạo tài khoản mới để bắt đầu quản lý tài chính của bạn.</p>

            <div id="register-messages"></div>

            <form id="register-form">
              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-user me-2"></i>Tên đăng nhập
                </label>
                <input type="text" class="form-control" name="username" placeholder="Tên đăng nhập" required>
              </div>

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

              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-lock me-2"></i>Xác nhận mật khẩu
                </label>
                <input type="password" class="form-control" name="confirmPassword" placeholder="Xác nhận mật khẩu" required>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3">Đăng ký</button>

              <div class="mt-4 text-center">
                <span class="me-2">Đã có tài khoản?</span>
                <a href="/auth/login" class="text-primary" data-link="/auth/login">Đăng nhập ngay</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initRegisterPage() {
  const form = document.getElementById('register-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      if (password !== confirmPassword) {
        showMessage('error', 'Mật khẩu xác nhận không khớp');
        return;
      }

      const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: password
      };

      try {
        const response = await api.post('/auth/register', data);
        if (response.success || response.user) {
          showMessage('success', 'Đăng ký thành công! Đang chuyển hướng...');
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 1500);
        } else {
          showMessage('error', response.message || 'Đăng ký thất bại');
        }
      } catch (error) {
        showMessage('error', 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    });
  }
}

function showMessage(type, message) {
  const messagesDiv = document.getElementById('register-messages');
  const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
  const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
  
  messagesDiv.innerHTML = `
    <div class="alert ${alertClass} alert-dismissible fade show">
      <i class="fas ${icon} me-2"></i>${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

