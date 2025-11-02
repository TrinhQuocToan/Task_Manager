import { api } from '../main.js';
import { formatCurrency, formatDate, calculatePercentage } from '../utils/format.js';

// Get current user (mock for now, will be replaced with real auth)
let currentUser = null;

export async function renderHomePage() {
  try {
    // Try to get user data
    try {
      const response = await fetch('http://localhost:3000/api/me');
      if (response.ok) {
        currentUser = await response.json();
      }
    } catch (e) {
      // Not logged in
    }

    if (!currentUser) {
      return renderHomeGuest();
    }

    return renderHomeUser();
  } catch (error) {
    console.error('Error rendering home:', error);
    return renderHomeGuest();
  }
}

function renderHomeGuest() {
  return `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <h1 class="display-4 mb-4">Quản Lý Chi Tiêu</h1>
          <p class="lead mb-4">
            Chào mừng bạn đến với ứng dụng Quản Lý Chi Tiêu. 
            Đăng nhập hoặc đăng ký để bắt đầu quản lý tài chính của bạn.
          </p>
          <div class="d-grid gap-3 d-sm-flex justify-content-sm-center">
            <a href="/auth/login" class="btn btn-primary btn-lg px-4" data-link="/auth/login">
              <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
            </a>
            <a href="/auth/register" class="btn btn-outline-secondary btn-lg px-4" data-link="/auth/register">
              <i class="fas fa-user-plus me-2"></i>Đăng ký
            </a>
          </div>
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="fas fa-chart-line fa-3x mb-3 text-primary"></i>
              <h5 class="card-title">Theo dõi chi tiêu</h5>
              <p class="card-text">Ghi chép và theo dõi mọi khoản thu chi của bạn một cách dễ dàng</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="fas fa-chart-pie fa-3x mb-3 text-success"></i>
              <h5 class="card-title">Phân tích chi tiêu</h5>
              <p class="card-text">Xem báo cáo và thống kê chi tiết về tình hình tài chính của bạn</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <i class="fas fa-piggy-bank fa-3x mb-3 text-warning"></i>
              <h5 class="card-title">Quản lý ngân sách</h5>
              <p class="card-text">Lập kế hoạch và kiểm soát chi tiêu theo mục tiêu tài chính</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderHomeUser() {
  try {
    // Fetch user data
    const homeData = await api.get('/api/home');
    
    return `
      <div class="homepage">
        <div class="container py-4">
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body position-relative">
              <a href="/transactions/create" class="btn btn-success rounded-circle position-absolute top-0 end-0 m-3 add-transaction-btn" 
                 data-link="/transactions/create">
                <i class="fas fa-plus"></i>
              </a>

              <div class="row">
                <div class="col-md-8">
                  <div class="d-flex align-items-center mb-3">
                    <div class="balance-icon me-3">
                      ${homeData.user?.avatar ? 
                        `<img src="${homeData.user.avatar}" alt="Avatar" class="rounded-circle" style="width: 40px; height: 40px;">` :
                        `<i class="fas fa-wallet fa-2x text-primary"></i>`
                      }
                    </div>
                    <div>
                      <h5 class="mb-0">Xin chào, ${homeData.user?.username || '!'}</h5>
                      <p class="text-muted mb-0">Đây là tổng quan tài chính của bạn</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="income-expense-comparison p-3 rounded bg-light h-100">
                    <h5 class="mb-3">Thu chi tháng này</h5>
                    <div class="comparison-item mb-3">
                      <div class="d-flex justify-content-between mb-1">
                        <span>Thu nhập</span>
                        <span class="text-success">${formatCurrency(homeData.monthlyIncome || 0)}</span>
                      </div>
                      <div class="progress" style="height: 8px;">
                        <div class="progress-bar bg-success" style="width: 100%"></div>
                      </div>
                    </div>
                    <div class="comparison-item mb-3">
                      <div class="d-flex justify-content-between mb-1">
                        <span>Chi tiêu</span>
                        <span class="text-danger">${formatCurrency(homeData.monthlyExpense || 0)}</span>
                      </div>
                      <div class="progress" style="height: 8px;">
                        <div class="progress-bar bg-danger" 
                             style="width: ${calculatePercentage(homeData.monthlyExpense || 0, homeData.monthlyIncome || 1)}%">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="card-title mb-0">Giao dịch gần đây</h5>
                <a href="/transactions" class="btn btn-link" data-link="/transactions">Xem tất cả</a>
              </div>
              <div class="recent-transactions">
                ${renderRecentTransactions(homeData.recentTransactions || [])}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching home data:', error);
    return renderHomeGuest();
  }
}

function renderRecentTransactions(transactions) {
  if (transactions.length === 0) {
    return `
      <div class="text-center py-4">
        <div class="mb-3">
          <i class="fas fa-receipt fa-3x text-muted"></i>
        </div>
        <p class="text-muted">Chưa có giao dịch nào</p>
        <a href="/transactions/create" class="btn btn-primary" data-link="/transactions/create">Thêm giao dịch đầu tiên</a>
      </div>
    `;
  }

  return transactions.map(transaction => `
    <div class="transaction-item p-3 mb-2 rounded ${transaction.type === 'expense' ? 'bg-danger-subtle' : 'bg-success-subtle'}">
      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <div class="transaction-icon me-3">
            <i class="fas fa-tag fa-fw"></i>
          </div>
          <div>
            <h6 class="mb-0">${transaction.categoryId?.name || 'Khác'}</h6>
            <small class="text-muted">${formatDate(transaction.date)}</small>
          </div>
        </div>
        <div class="text-${transaction.type === 'expense' ? 'danger' : 'success'}">
          ${transaction.type === 'expense' ? '-' : ''}${formatCurrency(transaction.amount)}
        </div>
      </div>
    </div>
  `).join('');
}

