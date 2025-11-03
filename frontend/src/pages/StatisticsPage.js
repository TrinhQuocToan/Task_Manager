import { api } from '../main.js';
import { calculatePercentage } from '../utils/format.js';

export async function renderStatisticsPage() {
  try {
    // Fetch statistics
    const statsResponse = await api.get('/api/tasks/statistics');
    const stats = statsResponse.data || {};

    // Fetch all tasks for charts
    const tasksResponse = await api.get('/api/tasks');
    const tasks = tasksResponse.data?.tasks || [];

    const totalTasks = stats.totalTasks || 0;
    const completedTasks = stats.completedTasks || 0;
    const inProgressTasks = stats.inProgressTasks || 0;
    const notStartedTasks = stats.notStartedTasks || 0;
    const cancelledTasks = stats.cancelledTasks || 0;

    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <h2 class="mb-4"><i class="fas fa-chart-line me-2"></i>Thống kê</h2>
        
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Tổng công việc</h6>
                    <h3 class="mb-0">${totalTasks}</h3>
                  </div>
                  <div class="text-primary">
                    <i class="fas fa-tasks fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Hoàn thành</h6>
                    <h3 class="mb-0 text-success">${completedTasks}</h3>
                  </div>
                  <div class="text-success">
                    <i class="fas fa-check-circle fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Đang làm</h6>
                    <h3 class="mb-0 text-info">${inProgressTasks}</h3>
                  </div>
                  <div class="text-info">
                    <i class="fas fa-spinner fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Ưu tiên cao</h6>
                    <h3 class="mb-0 text-danger">${stats.highPriorityTasks || 0}</h3>
                  </div>
                  <div class="text-danger">
                    <i class="fas fa-flag fa-2x"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Biểu đồ tròn - Trạng thái</h5>
              </div>
              <div class="card-body">
                <div id="statusPieChartContainer"></div>
                <canvas id="statusPieChart" style="max-height: 300px; display: none;"></canvas>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Biểu đồ cột - Mức độ ưu tiên</h5>
              </div>
              <div class="card-body">
                <div id="priorityBarChartContainer"></div>
                <canvas id="priorityBarChart" style="max-height: 300px; display: none;"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">Tỷ lệ hoàn thành</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Hoàn thành</span>
                    <span>${totalTasks > 0 ? calculatePercentage(completedTasks, totalTasks) : 0}%</span>
                  </div>
                  <div class="progress" style="height: 25px;">
                    <div class="progress-bar bg-success" role="progressbar" 
                         style="width: ${totalTasks > 0 ? calculatePercentage(completedTasks, totalTasks) : 0}%">
                      ${completedTasks} / ${totalTasks}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">Trạng thái công việc</h5>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><i class="fas fa-circle text-secondary me-2"></i>Chưa bắt đầu</span>
                    <strong>${notStartedTasks}</strong>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><i class="fas fa-spinner text-info me-2"></i>Đang làm</span>
                    <strong>${inProgressTasks}</strong>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><i class="fas fa-check-circle text-success me-2"></i>Hoàn thành</span>
                    <strong>${completedTasks}</strong>
                  </div>
                </div>
                ${cancelledTasks > 0 ? `
                  <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                      <span><i class="fas fa-times-circle text-danger me-2"></i>Đã hủy</span>
                      <strong>${cancelledTasks}</strong>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <script>
        // Initialize charts after page render
        (function() {
          const stats = ${JSON.stringify(stats)};
          const tasks = ${JSON.stringify(tasks)};
          
          // Count priorities
          const priorityCounts = {
            Low: tasks.filter(t => t.priority === 'Low').length,
            Medium: tasks.filter(t => t.priority === 'Medium').length,
            High: tasks.filter(t => t.priority === 'High').length
          };
          
          // Status Pie Chart
          const notStarted = ${notStartedTasks};
          const inProgress = ${inProgressTasks};
          const completed = ${completedTasks};
          const cancelled = ${cancelledTasks};
          const totalStatus = notStarted + inProgress + completed + cancelled;

          // Pie Chart: trạng thái
          const statusContainer = document.getElementById('statusPieChartContainer');
          const statusCtx = document.getElementById('statusPieChart');
          if (statusContainer && statusCtx) {
            if (totalStatus === 0) {
              statusCtx.style.display = 'none';
              statusContainer.innerHTML = '<div class="text-center text-muted py-5">Không có dữ liệu</div>';
            } else {
              statusCtx.style.display = 'block';
              statusContainer.innerHTML = '';
              new Chart(statusCtx, {
                type: 'pie',
                data: {
                  labels: ['Chưa bắt đầu', 'Đang làm', 'Hoàn thành', 'Đã hủy'],
                  datasets: [{
                    data: [
                      notStarted,
                      inProgress,
                      completed,
                      cancelled
                    ],
                    backgroundColor: [
                      '#6c757d',
                      '#0dcaf0',
                      '#198754',
                      '#dc3545'
                    ]
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }
              });
            }
          }
          
          // Priority Bar Chart
          const priLow = priorityCounts.Low;
          const priMed = priorityCounts.Medium;
          const priHigh = priorityCounts.High;
          const totalPrio = priLow + priMed + priHigh;
          const priorityContainer = document.getElementById('priorityBarChartContainer');
          const priorityCtx = document.getElementById('priorityBarChart');
          if (priorityContainer && priorityCtx) {
            if (totalPrio === 0) {
              priorityCtx.style.display = 'none';
              priorityContainer.innerHTML = '<div class="text-center text-muted py-5">Không có dữ liệu</div>';
            } else {
              priorityCtx.style.display = 'block';
              priorityContainer.innerHTML = '';
              new Chart(priorityCtx, {
                type: 'bar',
                data: {
                  labels: ['Thấp', 'Trung bình', 'Cao'],
                  datasets: [{
                    label: 'Số lượng công việc',
                    data: [
                      priLow,
                      priMed,
                      priHigh
                    ],
                    backgroundColor: [
                      '#198754',
                      '#ffc107',
                      '#dc3545'
                    ]
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }
              });
            }
          }
        })();
      </script>
    `;
  } catch (error) {
    console.error('Error rendering statistics:', error);
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Không thể tải thống kê. Vui lòng thử lại.
        </div>
      </div>
    `;
  }
}

