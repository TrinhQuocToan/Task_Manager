import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Set token to localStorage
  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };

  // Get auth header
  const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch current user
  const fetchUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/api/auth/me');
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    if (response.success && response.data?.token) {
      setToken(response.data.token);
      setUser(response.data.user);
      return response;
    }
    throw new Error(response.message || 'Login failed');
  };

  // Register
  const register = async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    if (response.success && response.data?.token) {
      setToken(response.data.token);
      setUser(response.data.user);
      return response;
    }
    throw new Error(response.message || 'Registration failed');
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => !!user;

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    getToken,
    setToken,
    getAuthHeader,
    fetchUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
