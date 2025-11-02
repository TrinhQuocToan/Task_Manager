// Sidebar Component
export function renderSidebar(activeRoute = '') {
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="nav flex-column">
      <a href="/" class="nav-link ${activeRoute === '/' ? 'active' : ''}" data-link="/">
        <i class="fas fa-home"></i>
        <span>Trang chủ</span>
      </a>
      <a href="/transactions" class="nav-link ${activeRoute === '/transactions' ? 'active' : ''}" data-link="/transactions">
        <i class="fas fa-exchange-alt"></i>
        <span>Giao dịch</span>
      </a>
      <a href="/statistics" class="nav-link ${activeRoute === '/statistics' ? 'active' : ''}" data-link="/statistics">
        <i class="fas fa-chart-line"></i>
        <span>Thống kê</span>
      </a>
      <a href="/categories" class="nav-link ${activeRoute === '/categories' ? 'active' : ''}" data-link="/categories">
        <i class="fas fa-tags"></i>
        <span>Danh mục</span>
      </a>
    </div>
  `;
  
  // Remove existing sidebar if any
  const existingSidebar = document.querySelector('.sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }
  
  const contentWrapper = document.querySelector('.content-wrapper');
  if (contentWrapper) {
    contentWrapper.insertBefore(sidebar, contentWrapper.firstChild);
  } else {
    document.body.appendChild(sidebar);
  }
}

