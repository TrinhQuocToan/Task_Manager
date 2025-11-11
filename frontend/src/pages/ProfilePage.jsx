import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const ProfilePage = () => {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/api/auth/profile', {
        username: formData.username,
        email: formData.email,
      });

      if (response.success) {
        toast.success('Profile updated successfully!');
        fetchUser();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put('/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        toast.success('Password changed successfully!');
        setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ marginTop: 0 }}>
      <h2 className="mb-4">
        <i className="fas fa-user me-2"></i>Profile
      </h2>

      <div className="row">
        <div className="col-lg-8">
          {/* Profile Information */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-user-circle me-2"></i>Profile Information
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleProfileUpdate}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  )}
                  <i className="fas fa-save me-2"></i>Update Profile
                </button>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-lock me-2"></i>Change Password
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-warning" disabled={loading}>
                  {loading && (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  )}
                  <i className="fas fa-key me-2"></i>Change Password
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>Account Info
              </h5>
            </div>
            <div className="card-body">
              <div className="text-center mb-3">
                <img
                  src={user?.avatar || 'https://secure.gravatar.com/avatar/default?s=128&d=mp'}
                  alt={user?.username}
                  className="rounded-circle"
                  width="128"
                  height="128"
                  onError={(e) => {
                    e.target.src = 'https://secure.gravatar.com/avatar/default?s=128&d=mp';
                  }}
                />
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Username</small>
                <strong>{user?.username}</strong>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Email</small>
                <strong>{user?.email}</strong>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">User ID</small>
                <code className="small">{user?._id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
