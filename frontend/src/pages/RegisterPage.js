import { api } from '../main.js';
import { auth } from '../utils/auth.js';

export function renderRegisterPage() {
  return `
    <div class="auth-wrapper">
      <div class="row w-100 mx-0">
        <div class="col-md-6 welcome-section">
          <h1 class="welcome-text">
            Start managing tasks today!
            <span>Join us now</span>
          </h1>
        </div>
        
        <div class="col-md-6 form-section">
          <div class="login-form">
            <h2 class="mb-4">Register</h2>
            <p class="text-muted mb-4">Create a new account to start managing your tasks.</p>

            <div id="register-messages"></div>

            <form id="register-form">
              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-user me-2"></i>Username
                </label>
                <input type="text" class="form-control" name="username" placeholder="Username" required>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  <i class="far fa-envelope me-2"></i>Email
                </label>
                <input type="email" class="form-control" name="email" placeholder="Email" required>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-lock me-2"></i>Password
                </label>
                <input type="password" class="form-control" name="password" placeholder="Password" required>
              </div>

              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-lock me-2"></i>Confirm password
                </label>
                <input type="password" class="form-control" name="confirmPassword" placeholder="Confirm password" required>
              </div>

              <button type="submit" class="btn btn-primary w-100 mb-3" id="register-btn">
                <span class="spinner-border spinner-border-sm d-none me-2" role="status" aria-hidden="true"></span>
                Register
              </button>

              <div class="mt-4 text-center">
                <span class="me-2">Already have an account?</span>
                <a href="/auth/login" class="text-primary" data-link="/auth/login">Login now</a>
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
  const registerBtn = document.getElementById('register-btn');
  const spinner = registerBtn?.querySelector('.spinner-border');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Disable button and show spinner
      if (registerBtn) {
        registerBtn.disabled = true;
        if (spinner) spinner.classList.remove('d-none');
      }

      const formData = new FormData(form);
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      // Client-side validation
      if (password !== confirmPassword) {
        showMessage('error', 'Passwords do not match');
        if (registerBtn) {
          registerBtn.disabled = false;
          if (spinner) spinner.classList.add('d-none');
        }
        return;
      }

      if (password.length < 6) {
        showMessage('error', 'Password must be at least 6 characters');
        if (registerBtn) {
          registerBtn.disabled = false;
          if (spinner) spinner.classList.add('d-none');
        }
        return;
      }

      const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: password,
        confirmPassword: confirmPassword
      };

      try {
        const response = await api.post('/api/auth/register', data);
        
        if (response.success && response.data) {
          // Save token if provided
          if (response.data.token) {
            auth.setToken(response.data.token);
          }
          
          showMessage('success', response.message || 'Registration successful! Redirecting...');
          
          setTimeout(() => {
            // If token exists, go to home, otherwise go to login
            if (response.data.token) {
              window.location.href = '/';
            } else {
              window.location.href = '/auth/login';
            }
          }, 1500);
        } else {
          showMessage('error', response.message || 'Registration failed');
          
          // Re-enable button
          if (registerBtn) {
            registerBtn.disabled = false;
            if (spinner) spinner.classList.add('d-none');
          }
        }
      } catch (error) {
        console.error('Register error:', error);
        showMessage('error', 'Registration failed. Please try again.');
        
        // Re-enable button
        if (registerBtn) {
          registerBtn.disabled = false;
          if (spinner) spinner.classList.add('d-none');
        }
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

