// Main Application Entry Point
import router from './router/index.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderHomePage } from './pages/HomePage.js';
import { renderLoginPage, initLoginPage } from './pages/LoginPage.js';
import { renderRegisterPage, initRegisterPage } from './pages/RegisterPage.js';
import { renderTasksPage } from './pages/TasksPage.js';
import { renderTaskFormPage, initTaskFormPage } from './pages/TaskFormPage.js';
import { renderCategoriesPage } from './pages/CategoriesPage.js';
import { renderProfilePage, initProfilePage } from './pages/ProfilePage.js';

import { auth } from './utils/auth.js';

// API base URL - Backend runs on port 5000
export const API_BASE_URL = 'http://localhost:5000';

// Utility functions for API calls
export const api = {
  async get(url) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...auth.getAuthHeader()
        },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      // If unauthorized, clear token
      if (response.status === 401) {
        auth.removeToken();
      }
      
      return data;
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },
  
  async post(url, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...auth.getAuthHeader()
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      // If unauthorized, clear token
      if (response.status === 401) {
        auth.removeToken();
      }
      
      return result;
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },
  
  async put(url, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...auth.getAuthHeader()
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        auth.removeToken();
      }
      
      return result;
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },
  
  async delete(url) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...auth.getAuthHeader()
        },
        credentials: 'include',
      });
      
      const result = await response.json();
      
      if (response.status === 401) {
        auth.removeToken();
      }
      
      return result;
    } catch (error) {
      console.error('API DELETE error:', error);
      throw error;
    }
  }
};

// Get current user
let currentUser = null;

async function getCurrentUser() {
  try {
    const response = await api.get('/api/auth/me');
    if (response.success && response.data && response.data.user) {
      currentUser = response.data.user;
      return currentUser;
    }
  } catch (error) {
    // Not logged in
    currentUser = null;
  }
  return null;
}

// Export getCurrentUser for use in other modules
export { getCurrentUser };

// Render page wrapper
async function renderPage(content, showSidebar = false) {
  const root = document.getElementById('root');
  
  // Get current user
  const user = await getCurrentUser();
  
  // Render header
  renderHeader(user);
  
  // Render sidebar if needed
  if (showSidebar && user) {
    renderSidebar(window.location.pathname);
    document.body.classList.add('with-sidebar');
  } else {
    const existingSidebar = document.querySelector('.sidebar');
    if (existingSidebar) existingSidebar.remove();
    document.body.classList.remove('with-sidebar');
  }
  
  // Render content
  root.innerHTML = content;
  
  // Initialize page-specific scripts
  const path = window.location.pathname;
  if (path === '/auth/login') {
    initLoginPage();
  } else if (path === '/auth/register') {
    initRegisterPage();
  } else if (path.startsWith('/tasks/create')) {
    initTaskFormPage();
  } else if (path.match(/^\/tasks\/[^/]+\/edit$/)) {
    const taskId = path.split('/')[2];
    initTaskFormPage(taskId);
  } else if (path === '/me/profile') {
    initProfilePage();
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('Frontend initialized');
  
  // Define routes FIRST, before initializing router
  router.route('/', async () => {
    const content = await renderHomePage();
    const user = await getCurrentUser();
    await renderPage(content, user ? true : false);
  });

  router.route('/auth/login', async () => {
    await renderPage(renderLoginPage(), false);
  });

  router.route('/auth/register', async () => {
    await renderPage(renderRegisterPage(), false);
  });

  router.route('/auth/forgot-password', async () => {
    const { renderForgotPasswordPage, initForgotPasswordPage } = await import('./pages/ForgotPasswordPage.js');
    const content = renderForgotPasswordPage();
    await renderPage(content, false);
    initForgotPasswordPage();
  });

  router.route('/auth/verify-otp', async () => {
    const { renderVerifyOTPPage, initVerifyOTPPage } = await import('./pages/VerifyOTPPage.js');
    const content = renderVerifyOTPPage();
    await renderPage(content, false);
    initVerifyOTPPage();
  });

  router.route('/auth/reset-password', async () => {
    const { renderResetPasswordPage, initResetPasswordPage } = await import('./pages/ResetPasswordPage.js');
    const content = renderResetPasswordPage();
    await renderPage(content, false);
    initResetPasswordPage();
  });

  router.route('/auth/logout', async () => {
    try {
      // Clear token from localStorage
      const { auth } = await import('./utils/auth.js');
      auth.removeToken();
    } catch (e) {
      // Ignore errors
    }
    currentUser = null;
    window.location.href = '/';
  });

  // Tasks routes
  router.route('/tasks', async () => {
    const content = await renderTasksPage();
    await renderPage(content, true);
  });

  router.route('/tasks/create', async () => {
    const content = await renderTaskFormPage();
    await renderPage(content, true);
  });

  router.route('/tasks/:id/edit', async (params) => {
    const content = await renderTaskFormPage(params.id);
    await renderPage(content, true);
  });

  // Categories route
  router.route('/categories', async () => {
    const content = await renderCategoriesPage();
    await renderPage(content, true);
  });

  // Projects route (placeholder)
  router.route('/projects', async () => {
    await renderPage('<div class="container py-4" style="margin-top: 0;"><h1><i class="fas fa-project-diagram me-2"></i>Dự án</h1><p>Trang này đang được phát triển...</p></div>', true);
  });

  // Statistics route
  router.route('/statistics', async () => {
    const { renderStatisticsPage } = await import('./pages/StatisticsPage.js');
    const content = await renderStatisticsPage();
    await renderPage(content, true);
  });

  router.route('/me/profile', async () => {
    const content = await renderProfilePage();
    await renderPage(content, true);
  });

  // Initialize router AFTER routes are defined
  router.init();
});
