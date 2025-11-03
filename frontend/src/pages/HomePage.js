import { api, getCurrentUser } from '../main.js';
import { formatCurrency, formatDate, calculatePercentage } from '../utils/format.js';
import { renderScheduleCalendar } from '../components/ScheduleCalendar.js';

export async function renderHomePage() {
  try {
    // Get current user using the auth API
    const user = await getCurrentUser();

    // If no user, show guest page
    if (!user) {
      return renderHomeGuest();
    }

    // User is logged in, show user dashboard
    return await renderHomeUser(user);
  } catch (error) {
    console.error('Error rendering home:', error);
    return renderHomeGuest();
  }
}

function renderHomeGuest() {
  return `
    <div class="container py-5" style="margin-top: 0;">
      <div class="row justify-content-center">
        <div class="col-md-8 text-center">
          <h1 class="display-4 mb-4">
            <i class="fas fa-tasks text-primary me-3"></i>
            Task Manager
          </h1>
          <p class="lead mb-4">
            Quản lý công việc hiệu quả và dễ dàng. 
            Đăng nhập hoặc đăng ký để bắt đầu quản lý các nhiệm vụ của bạn.
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
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <i class="fas fa-check-square fa-3x mb-3 text-primary"></i>
              <h5 class="card-title">Quản lý công việc</h5>
              <p class="card-text">Tạo, theo dõi và hoàn thành các nhiệm vụ của bạn một cách dễ dàng và hiệu quả</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <i class="fas fa-project-diagram fa-3x mb-3 text-success"></i>
              <h5 class="card-title">Quản lý dự án</h5>
              <p class="card-text">Tổ chức công việc theo dự án, theo dõi tiến độ và cộng tác với đội nhóm</p>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <i class="fas fa-chart-bar fa-3x mb-3 text-warning"></i>
              <h5 class="card-title">Thống kê & Báo cáo</h5>
              <p class="card-text">Xem báo cáo chi tiết về hiệu suất công việc và tiến độ hoàn thành</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderHomeUser(user) {
  try {
    // Fetch statistics and all tasks for calendar
    const [statsResponse, allTasksResponse] = await Promise.all([
      api.get('/api/tasks/statistics').catch(() => ({ data: {} })),
      api.get('/api/tasks?sortBy=dueDate&sortOrder=asc').catch(() => ({ data: { tasks: [] } }))
    ]);

    const stats = statsResponse.data || {};
    const allTasks = allTasksResponse.data?.tasks || [];

    return `
      <div class="homepage">
        <div class="container py-4" style="margin-top: 0;">
          <div class="card mb-4 border-0 shadow-sm">
            <div class="card-body position-relative">
              <a href="/tasks/create" class="btn btn-success rounded-circle position-absolute top-0 end-0 m-3 add-task-btn" 
                 data-link="/tasks/create"
                 data-bs-toggle="tooltip" 
                 data-bs-placement="left" 
                 title="Tạo công việc mới">
                <i class="fas fa-plus"></i>
              </a>

              <div class="row">
                <div class="col-md-8">
                  <div class="d-flex align-items-center mb-3">
                    <div class="balance-icon me-3">
                      ${user?.avatar ? 
                        `<img src="${user.avatar}" alt="Avatar" class="rounded-circle" style="width: 40px; height: 40px;">` :
                        `<i class="fas fa-tasks fa-2x text-primary"></i>`
                      }
                    </div>
                    <div>
                      <h5 class="mb-0">Xin chào, ${user?.username || '!'}</h5>
                      <p class="text-muted mb-0">Tổng quan công việc của bạn</p>
                    </div>
                  </div>
                  
                  ${stats.totalTasks === 0 ? `
                    <div class="alert alert-info">
                      <i class="fas fa-info-circle me-2"></i>
                      Chào mừng đến với Task Manager! Bắt đầu tạo công việc đầu tiên của bạn.
                    </div>
                  ` : ''}
                </div>
                <div class="col-md-4">
                  <div class="task-stats p-3 rounded bg-light h-100">
                    <h5 class="mb-3">Thống kê nhanh</h5>
                    <div class="stat-item mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-tasks text-primary me-2"></i>Tổng công việc</span>
                        <span class="fw-bold">${stats.totalTasks || 0}</span>
                      </div>
                    </div>
                    <div class="stat-item mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-check-circle text-success me-2"></i>Hoàn thành</span>
                        <span class="fw-bold text-success">${stats.completedTasks || 0}</span>
                      </div>
                    </div>
                    <div class="stat-item mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="fas fa-spinner text-info me-2"></i>Đang làm</span>
                        <span class="fw-bold text-info">${stats.inProgressTasks || 0}</span>
                      </div>
                    </div>
                    <div class="text-center mt-3">
                      <a href="/tasks" class="btn btn-sm btn-outline-primary" data-link="/tasks">Xem tất cả</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-body">
              ${renderScheduleCalendar(allTasks)}
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering user home:', error);
    return renderHomeGuest();
  }
}

function renderRecentTasks(tasks) {
  if (tasks.length === 0) {
    return `
      <div class="text-center py-4">
        <div class="mb-3">
          <i class="fas fa-tasks fa-3x text-muted"></i>
        </div>
        <p class="text-muted">Chưa có công việc nào</p>
        <a href="/tasks/create" class="btn btn-primary" data-link="/tasks/create">
          <i class="fas fa-plus me-2"></i>Tạo công việc đầu tiên
        </a>
      </div>
    `;
  }

  return tasks.map(task => {
    const statusClass = {
      'Not Started': 'bg-secondary-subtle',
      'In Progress': 'bg-info-subtle',
      'Completed': 'bg-success-subtle',
      'Cancelled': 'bg-danger-subtle'
    }[task.status] || 'bg-secondary-subtle';
    
    const statusIcon = {
      'Not Started': 'fa-circle',
      'In Progress': 'fa-spinner',
      'Completed': 'fa-check-circle',
      'Cancelled': 'fa-times-circle'
    }[task.status] || 'fa-circle';
    
    const statusColor = {
      'Not Started': 'text-secondary',
      'In Progress': 'text-info',
      'Completed': 'text-success',
      'Cancelled': 'text-danger'
    }[task.status] || 'text-secondary';

    return `
      <div class="task-item p-3 mb-2 rounded ${statusClass}" style="cursor: pointer;" onclick="window.location.href='/tasks/${task._id}'">
        <div class="d-flex justify-content-between align-items-start">
          <div class="d-flex align-items-center flex-grow-1">
            <div class="task-icon me-3">
              <i class="fas ${statusIcon} ${statusColor} fa-fw"></i>
            </div>
            <div class="flex-grow-1">
              <h6 class="mb-1">${task.title || 'Công việc không có tiêu đề'}</h6>
              <small class="text-muted">
                ${task.categoryId ? `<i class="fas ${task.categoryId.icon || 'fa-tag'} me-1"></i>${task.categoryId.name || 'N/A'}` : ''}
                ${task.dueDate ? ` • <i class="fas fa-calendar me-1"></i>${formatDate(task.dueDate)}` : ''}
                ${task.priority ? ` • <i class="fas fa-flag me-1"></i>${task.priority}` : ''}
              </small>
            </div>
          </div>
          <div class="d-flex align-items-center">
            ${task.status === 'Completed' ? '<span class="badge bg-success me-2">Hoàn thành</span>' : ''}
            <i class="fas fa-chevron-right text-muted"></i>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

