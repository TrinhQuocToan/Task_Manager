// Header Component
export function renderHeader(user = null) {
  const header = document.createElement('nav');
  header.className = 'navbar navbar-expand-lg navbar-dark';
  header.innerHTML = `
    <div class="container-fluid">
      <div class="d-flex align-items-center">
        <a class="navbar-brand me-4" href="/" data-link="/">
          <span class="logo-text"><span class="logo-q">Q</span>uanLyChiTieu</span>
        </a>
        ${user ? `
          <div class="main-nav d-flex">
            <a class="nav-link" href="/transactions" data-link="/transactions">
              <i class="fas fa-exchange-alt me-1"></i>Giao dịch
            </a>
            <a class="nav-link" href="/statistics" data-link="/statistics">
              <i class="fas fa-chart-line me-1"></i>Thống kê
            </a>
          </div>
        ` : ''}
      </div>
      <div class="d-flex align-items-center">
        ${user ? `
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
                  <i class="fas fa-user me-2"></i>Hồ sơ
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="/auth/logout" data-link="/auth/logout">
                  <i class="fas fa-sign-out-alt me-2"></i>Đăng xuất
                </a>
              </li>
            </ul>
          </div>
        ` : `
          <a class="nav-link" href="/auth/login" data-link="/auth/login">
            <i class="fas fa-sign-in-alt me-1"></i>Đăng nhập
          </a>
          <a class="nav-link" href="/auth/register" data-link="/auth/register">
            <i class="fas fa-user-plus me-1"></i>Đăng ký
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
}

