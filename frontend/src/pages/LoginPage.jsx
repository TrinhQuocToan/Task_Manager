import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Test toast on mount
  React.useEffect(() => {
    console.log('LoginPage mounted, toast available:', typeof toast);
    // Test toast immediately
    setTimeout(() => {
      toast.info('Toast is working! You can now test login.');
    }, 500);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(formData.username, formData.password);
      toast.success(response.message || 'Login successful!');
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error?.message || error?.toString() || 'Invalid username or password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="row w-100 mx-0">
        <div className="col-md-6 welcome-section">
          <h1 className="welcome-text">
            Welcome back!
            <span>Manage your tasks more efficiently</span>
          </h1>
        </div>

        <div className="col-md-6 form-section">
          <div className="login-form">
            <h2 className="mb-4">Login</h2>
            <p className="text-muted mb-4">Sign in to your account to continue.</p>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-user me-2"></i>Username
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  <i className="fas fa-lock me-2"></i>Password
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                {loading && (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                )}
                Login
              </button>

              <div className="mt-4 text-center">
                <span className="me-2">Don't have an account?</span>
                <Link to="/auth/register" className="text-primary">
                  Create one
                </Link>
                <span className="mx-2">·</span>
                <Link to="/auth/forgot-password" className="text-primary">
                  Forgot password?
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
