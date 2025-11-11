import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/auth/send-otp', { email });

      if (response.success) {
        toast.success(response.message || 'Mã OTP đã được gửi đến email của bạn!');
        setTimeout(() => {
          navigate(`/auth/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        toast.error(response.message || 'Gửi mã OTP thất bại');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
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
                <i className="fas fa-lock fa-3x text-primary mb-3"></i>
                <h3 className="mb-2">Khôi phục mật khẩu</h3>
                <p className="text-muted">Nhập email của bạn để nhận mã OTP</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Nhập email của bạn"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  )}
                  <i className="fas fa-paper-plane me-2"></i>Gửi mã OTP
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

export default ForgotPasswordPage;
