import { api } from '../main.js';
import { auth } from '../utils/auth.js';

export function renderLoginPage() {
  return `
    <div class="auth-wrapper">
      <div class="row w-100 mx-0">
        <div class="col-md-6 welcome-section">
          <h1 class="welcome-text">
            Welcome back!
            <span>Manage your tasks more efficiently</span>
          </h1>
        </div>
        
        <div class="col-md-6 form-section">
          <div class="login-form">
            <h2 class="mb-4">Login</h2>
            <p class="text-muted mb-4">Sign in to your account to continue.</p>

            <div id="login-messages"></div>

            <form id="login-form">
              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-user me-2"></i>Username
                </label>
                <input type="text" class="form-control" name="username" placeholder="Username" required>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-lock me-2"></i>Password
                </label>
                <input type="password" class="form-control" name="password" placeholder="Password" required>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3" id="login-btn">
                <span class="spinner-border spinner-border-sm d-none me-2" role="status" aria-hidden="true"></span>
                Login
              </button>

              <div class="mt-4 text-center">
                <span class="me-2">Don't have an account?</span>
                <a href="/auth/register" class="text-primary" data-link="/auth/register">Create one</a>
                <span class="mx-2">·</span>
                <a href="/auth/forgot-password" class="text-primary" data-link="/auth/forgot-password">Forgot password?</a>
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
  const loginBtn = document.getElementById('login-btn');
  const spinner = loginBtn?.querySelector('.spinner-border');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Disable button and show spinner
      if (loginBtn) {
        loginBtn.disabled = true;
        if (spinner) spinner.classList.remove('d-none');
      }

      const formData = new FormData(form);
      const data = {
        username: formData.get('username'),
        password: formData.get('password')
      };

      try {
        const response = await api.post('/api/auth/login', data);
        
        if (response.success && response.data) {
          // Save token
          if (response.data.token) {
            auth.setToken(response.data.token);
          }
          
          showMessage('success', response.message || 'Login successful!');
          
          // Redirect to home after short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          showMessage('error', response.message || 'Login failed');
          
          // Re-enable button
          if (loginBtn) {
            loginBtn.disabled = false;
            if (spinner) spinner.classList.add('d-none');
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        showMessage('error', 'Login failed. Please check your credentials.');
        
        // Re-enable button
        if (loginBtn) {
          loginBtn.disabled = false;
          if (spinner) spinner.classList.add('d-none');
        }
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

