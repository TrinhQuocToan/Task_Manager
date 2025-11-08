import { api } from '../main.js';
import router from '../router/index.js';
import { Toastify } from '../utils/toastify.js';

export function renderVerifyOTPPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get('email') || '';

  return `
    <div class="container py-5" style="margin-top: 0;">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="fas fa-key fa-3x text-primary mb-3"></i>
                <h3 class="mb-2">Xác thực mã OTP</h3>
                <p class="text-muted">Nhập mã OTP đã được gửi đến email</p>
                ${email ? `<small class="text-muted d-block">${email}</small>` : ''}
              </div>

              <form id="verify-otp-form">
                <input type="hidden" name="email" value="${email}">
                
                <div class="mb-3">
                  <label class="form-label">Mã OTP <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-shield-alt"></i></span>
                    <input 
                      type="text" 
                      class="form-control" 
                      name="otp" 
                      placeholder="Nhập mã OTP (6 chữ số)"
                      required
                      maxlength="6"
                      pattern="[0-9]{6}"
                      autocomplete="off"
                    >
                  </div>
                  <small class="form-text text-muted">Mã OTP gồm 6 chữ số</small>
                </div>

                <button type="submit" class="btn btn-primary w-100 mb-3" id="submit-btn">
                  <span class="spinner-border spinner-border-sm d-none me-2" role="status"></span>
                  <i class="fas fa-check me-2"></i>Xác thực
                </button>

                <div class="text-center mb-3">
                  <a href="#" onclick="resendOTP(); return false;" class="text-decoration-none" id="resend-link">
                    <i class="fas fa-redo me-1"></i>Gửi lại mã OTP
                  </a>
                </div>

                <div class="text-center">
                  <a href="/auth/forgot-password" class="text-decoration-none" data-link="/auth/forgot-password">
                    <i class="fas fa-arrow-left me-1"></i>Quay lại
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

export function initVerifyOTPPage() {
  const form = document.getElementById('verify-otp-form');
  const submitBtn = document.getElementById('submit-btn');
  const spinner = submitBtn?.querySelector('.spinner-border');

  if (!form) return;

  // Auto focus on OTP input
  const otpInput = form.querySelector('input[name="otp"]');
  if (otpInput) {
    otpInput.focus();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    spinner.classList.remove('d-none');

    const formData = new FormData(form);
    const email = formData.get('email');
    const otp = formData.get('otp');

    try {
      // Backend only needs OTP, but we send email for potential future use
      const response = await api.post('/api/auth/verify-otp', { otp });

      if (response.success) {
        showMessage('success', response.message || 'Xác thực thành công!');
        // Redirect to reset password page
        setTimeout(() => {
          router.navigate(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
        }, 1500);
      } else {
        showMessage('error', response.message || 'Mã OTP không đúng');
        submitBtn.disabled = false;
        spinner.classList.add('d-none');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      showMessage('error', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      submitBtn.disabled = false;
      spinner.classList.add('d-none');
    }
  });

  // Resend OTP function
  window.resendOTP = async function() {
    const email = form.querySelector('input[name="email"]').value;
    const resendLink = document.getElementById('resend-link');
    
    if (!email) {
      showMessage('error', 'Email không hợp lệ');
      return;
    }

    resendLink.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Đang gửi...';
    resendLink.style.pointerEvents = 'none';

    try {
      const response = await api.post('/api/auth/resend-otp', { email });
      
      if (response.success) {
        showMessage('success', response.message || 'Mã OTP mới đã được gửi!');
      } else {
        showMessage('error', response.message || 'Gửi lại mã OTP thất bại');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      showMessage('error', error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      resendLink.innerHTML = '<i class="fas fa-redo me-1"></i>Gửi lại mã OTP';
      resendLink.style.pointerEvents = 'auto';
    }
  };
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

