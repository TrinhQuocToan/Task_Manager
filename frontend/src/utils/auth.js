// Auth utility functions
const TOKEN_KEY = 'task_manager_token';

export const auth = {
  // Save token to localStorage
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  // Get token from localStorage
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Remove token from localStorage
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get authorization header
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

