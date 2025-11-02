// Main Application Entry Point
import router from './router/index.js';
import { renderHeader } from './components/Header.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderHomePage } from './pages/HomePage.js';
import { renderLoginPage, initLoginPage } from './pages/LoginPage.js';
import { renderRegisterPage, initRegisterPage } from './pages/RegisterPage.js';

// API base URL
export const API_BASE_URL = 'http://localhost:3000';

// Utility functions for API calls
export const api = {
  async get(url) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        credentials: 'include'
      });
      return await response.json();
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
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return await response.json();
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
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('API PUT error:', error);
      throw error;
    }
  },
  
  async delete(url) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      return await response.json();
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
    const response = await fetch(`${API_BASE_URL}/api/me`, {
      credentials: 'include'
    });
    if (response.ok) {
      currentUser = await response.json();
      return currentUser;
    }
  } catch (error) {
    // Not logged in
  }
  return null;
}

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
  } else {
    const existingSidebar = document.querySelector('.sidebar');
    if (existingSidebar) existingSidebar.remove();
  }
  
  // Render content
  root.innerHTML = content;
  
  // Initialize page-specific scripts
  const path = window.location.pathname;
  if (path === '/auth/login') {
    initLoginPage();
  } else if (path === '/auth/register') {
    initRegisterPage();
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

  router.route('/auth/logout', async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore errors
    }
    currentUser = null;
    window.location.href = '/';
  });

  // Placeholder pages
  router.route('/transactions', async () => {
    await renderPage('<div class="container py-4"><h1>Giao dịch</h1><p>Trang này đang được phát triển...</p></div>', true);
  });

  router.route('/statistics', async () => {
    await renderPage('<div class="container py-4"><h1>Thống kê</h1><p>Trang này đang được phát triển...</p></div>', true);
  });

  router.route('/categories', async () => {
    await renderPage('<div class="container py-4"><h1>Danh mục</h1><p>Trang này đang được phát triển...</p></div>', true);
  });

  router.route('/me/profile', async () => {
    await renderPage('<div class="container py-4"><h1>Hồ sơ</h1><p>Trang này đang được phát triển...</p></div>', true);
  });

  // Initialize router AFTER routes are defined
  router.init();
});
