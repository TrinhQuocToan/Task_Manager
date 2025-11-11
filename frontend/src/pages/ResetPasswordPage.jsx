import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const otp = searchParams.get('otp') || '';
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/reset-password', {
        email,
        otp,
        newPassword: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        toast.success(response.message || 'Đặt lại mật khẩu thành công!');
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
      } else {
        toast.error(response.message || 'Đặt lại mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ marginTop: 0 }}>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="fas fa-lock-open fa-3x text-success mb-3"></i>
                <h3 className="mb-2">Đặt lại mật khẩu</h3>
                <p className="text-muted">Nhập mật khẩu mới của bạn</p>
                {email && <small className="text-muted d-block">{email}</small>}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Mật khẩu mới <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Nhập mật khẩu mới"
                      required
                      minLength="6"
                      autoComplete="new-password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <small className="form-text text-muted">Mật khẩu phải có ít nhất 6 ký tự</small>
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Xác nhận mật khẩu <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-lock"></i>
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      minLength="6"
                      autoComplete="new-password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-success w-100 mb-3" disabled={loading}>
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  )}
                  <i className="fas fa-check me-2"></i>Đặt lại mật khẩu
                </button>

                <div className="text-center">
                  <Link to="/auth/login" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-1"></i>Quay lại đăng nhập
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
