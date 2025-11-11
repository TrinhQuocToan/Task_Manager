import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

const VerifyOTPPage = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const otpInputRef = useRef(null);

  useEffect(() => {
    // Auto focus on OTP input
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/auth/verify-otp', { otp });

      if (response.success) {
        toast.success(response.message || 'Xác thực thành công!');
        setTimeout(() => {
          navigate(`/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`);
        }, 1500);
      } else {
        toast.error(response.message || 'Mã OTP không đúng');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Email không hợp lệ');
      return;
    }

    setResending(true);

    try {
      const response = await api.post('/api/auth/resend-otp', { email });

      if (response.success) {
        toast.success(response.message || 'Mã OTP mới đã được gửi!');
      } else {
        toast.error(response.message || 'Gửi lại mã OTP thất bại');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container py-5" style={{ marginTop: 0 }}>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="fas fa-key fa-3x text-primary mb-3"></i>
                <h3 className="mb-2">Xác thực mã OTP</h3>
                <p className="text-muted">Nhập mã OTP đã được gửi đến email</p>
                {email && <small className="text-muted d-block">{email}</small>}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Mã OTP <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="fas fa-shield-alt"></i>
                    </span>
                    <input
                      ref={otpInputRef}
                      type="text"
                      className="form-control"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Nhập mã OTP (6 chữ số)"
                      required
                      maxLength="6"
                      pattern="[0-9]{6}"
                      autoComplete="off"
                    />
                  </div>
                  <small className="form-text text-muted">Mã OTP gồm 6 chữ số</small>
                </div>

                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  )}
                  <i className="fas fa-check me-2"></i>Xác thực
                </button>

                <div className="text-center mb-3">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="btn btn-link text-decoration-none"
                    disabled={resending}
                  >
                    {resending ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-1"></i>Đang gửi...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-redo me-1"></i>Gửi lại mã OTP
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <Link to="/auth/forgot-password" className="text-decoration-none">
                    <i className="fas fa-arrow-left me-1"></i>Quay lại
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

export default VerifyOTPPage;