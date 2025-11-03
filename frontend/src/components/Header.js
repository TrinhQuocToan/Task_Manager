// Header Component
export function renderHeader(user = null) {
  const header = document.createElement('nav');
  header.className = 'navbar navbar-expand-lg navbar-dark';
  header.innerHTML = `
    <div class="container-fluid header-container">
      <div class="header-left d-flex align-items-center">
        <a class="navbar-brand me-4" href="/" data-link="/">
          <i class="fas fa-tasks me-2"></i>
          <span class="logo-text">Task Manager</span>
        </a>
      </div>
      
      ${user ? `
        <div class="header-center">
          <div class="search-box-wrapper position-relative">
            <div class="input-group">
              <input 
                type="text" 
                class="form-control search-input" 
                id="searchInput"
                placeholder="Search tasks..."
                autocomplete="off"
              >
              <button class="btn btn-outline-light" type="button" id="searchBtn">
                <i class="fas fa-search"></i>
              </button>
            </div>
            <div class="search-results dropdown-menu" id="searchResults" style="display: none;">
              <div class="search-loading p-3 text-center">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="header-right d-flex align-items-center">
        ${user ? `
          <a href="/tasks/create" class="btn btn-light btn-new-task me-3" data-link="/tasks/create">
            <i class="fas fa-plus me-2"></i><span>New Task</span>
          </a>
          
          <div class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
              <img src="${user.avatar || 'https://secure.gravatar.com/avatar/default?s=32&d=mp'}" 
                   alt="${user.username}" 
                   class="rounded-circle me-2"
                   width="32" 
                   height="32"
                   onerror="this.src='https://secure.gravatar.com/avatar/default?s=32&d=mp'">
              <span>${user.username}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <a class="dropdown-item" href="/me/profile" data-link="/me/profile">
                  <i class="fas fa-user me-2"></i>Profile
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="/auth/logout" data-link="/auth/logout">
                  <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
              </li>
            </ul>
          </div>
        ` : `
          <a class="nav-link" href="/auth/login" data-link="/auth/login">
            <i class="fas fa-sign-in-alt me-1"></i>Login
          </a>
          <a class="nav-link" href="/auth/register" data-link="/auth/register">
            <i class="fas fa-user-plus me-1"></i>Register
          </a>
        `}
      </div>
    </div>
  `;
  
  // Remove existing header if any
  const existingHeader = document.querySelector('.navbar');
  if (existingHeader) {
    existingHeader.remove();
  }
  
  document.body.insertBefore(header, document.body.firstChild);
  
  // Initialize search if user is logged in
  if (user) {
    initSearch();
  }
}

// Initialize search functionality
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  let searchTimeout = null;

  if (!searchInput || !searchBtn || !searchResults) return;

  // Search on input with debounce
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    
    if (query.length === 0) {
      searchResults.style.display = 'none';
      return;
    }

    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  // Search on button click
  searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      performSearch(query);
    }
  });

  // Search on Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query.length > 0) {
        performSearch(query, true);
      }
    }
  });

  // Close search results when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box-wrapper')) {
      searchResults.style.display = 'none';
    }
  });

  async function performSearch(query, navigate = false) {
    try {
      searchResults.style.display = 'block';
      searchResults.innerHTML = `
        <div class="search-loading p-3 text-center">
          <div class="spinner-border spinner-border-sm text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `;

      const { api } = await import('../main.js');
      const response = await api.get(`/api/tasks?search=${encodeURIComponent(query)}`);
      const tasks = response.data?.tasks || [];

      if (tasks.length === 0) {
        searchResults.innerHTML = `
          <div class="p-3 text-center text-muted">
            <i class="fas fa-search me-2"></i>
            Không tìm thấy kết quả nào
          </div>
        `;
        return;
      }

      searchResults.innerHTML = `
        <div class="search-results-list" style="max-height: 400px; overflow-y: auto;">
          ${tasks.slice(0, 10).map(task => renderSearchResultItem(task)).join('')}
          ${tasks.length > 10 ? `
            <div class="p-2 text-center border-top">
              <a href="/tasks?search=${encodeURIComponent(query)}" class="btn btn-sm btn-link" data-link="/tasks?search=${encodeURIComponent(query)}">
                Xem tất cả ${tasks.length} kết quả
              </a>
            </div>
          ` : ''}
        </div>
      `;

      if (navigate && tasks.length > 0) {
        window.location.href = `/tasks?search=${encodeURIComponent(query)}`;
      }
    } catch (error) {
      console.error('Search error:', error);
      searchResults.innerHTML = `
        <div class="p-3 text-center text-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Lỗi khi tìm kiếm
        </div>
      `;
    }
  }

  function renderSearchResultItem(task) {
    const statusClass = task.status === 'Completed' ? 'text-success' : 
                       task.status === 'In Progress' ? 'text-info' : 
                       task.status === 'Cancelled' ? 'text-danger' : 'text-secondary';
    
    return `
      <a href="/tasks/${task._id}" class="search-result-item dropdown-item-text" data-link="/tasks/${task._id}">
        <div class="d-flex align-items-start">
          <div class="flex-grow-1">
            <div class="fw-semibold">${highlightText(task.title, searchInput.value.trim())}</div>
            ${task.description ? `
              <small class="text-muted d-block mt-1">
                ${highlightText(task.description.substring(0, 60), searchInput.value.trim())}${task.description.length > 60 ? '...' : ''}
              </small>
            ` : ''}
            <div class="mt-1">
              ${task.categoryId ? `
                <span class="badge bg-secondary me-1" style="font-size: 0.7rem;">
                  <i class="fas ${task.categoryId.icon || 'fa-tag'} me-1"></i>${task.categoryId.name}
                </span>
              ` : ''}
              <span class="badge ${statusClass}" style="font-size: 0.7rem;">
                ${task.status}
              </span>
            </div>
          </div>
        </div>
      </a>
    `;
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
}

