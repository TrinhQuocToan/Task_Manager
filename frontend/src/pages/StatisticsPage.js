import { api } from '../main.js';
import { calculatePercentage } from '../utils/format.js';

export async function renderStatisticsPage() {
  try {
    // Fetch statistics
    const statsResponse = await api.get('/api/tasks/statistics');
    const stats = statsResponse.data || {};

    const totalTasks = stats.totalTasks || 0;
    const completedTasks = stats.completedTasks || 0;
    const inProgressTasks = stats.inProgressTasks || 0;
    const notStartedTasks = stats.notStartedTasks || 0;
    const cancelledTasks = stats.cancelledTasks || 0;

    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <h2 class="mb-4"><i class="fas fa-chart-line me-2"></i>Statistics</h2>
        
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 class="text-muted mb-2">Total tasks</h6>
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
                    <h6 class="text-muted mb-2">Completed</h6>
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
                    <h6 class="text-muted mb-2">In Progress</h6>
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
                    <h6 class="text-muted mb-2">High priority</h6>
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
                <h5 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Status - Pie chart</h5>
              </div>
              <div class="card-body">
                <canvas id="statusPieChart" style="max-height: 300px;"></canvas>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Priority - Bar chart</h5>
              </div>
              <div class="card-body">
                <canvas id="priorityBarChart" style="max-height: 300px;"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white">
                <h5 class="mb-0">Completion rate</h5>
              </div>
              <div class="card-body">
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span>Completed</span>
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
                <h5 class="mb-0">Task status</h5>
              </div>
              <div class="card-body">
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><i class="fas fa-circle text-secondary me-2"></i>Not Started</span>
                    <strong>${notStartedTasks}</strong>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><i class="fas fa-spinner text-info me-2"></i>In Progress</span>
                    <strong>${inProgressTasks}</strong>
                  </div>
                </div>
                <div class="mb-2">
                  <div class="d-flex justify-content-between mb-1">
                    <span><i class="fas fa-check-circle text-success me-2"></i>Completed</span>
                    <strong>${completedTasks}</strong>
                  </div>
                </div>
                ${cancelledTasks > 0 ? `
                  <div class="mb-2">
                    <div class="d-flex justify-content-between mb-1">
                      <span><i class="fas fa-times-circle text-danger me-2"></i>Cancelled</span>
                      <strong>${cancelledTasks}</strong>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  } catch (error) {
    console.error('Error rendering statistics:', error);
    return `
      <div class="container-fluid py-4" style="margin-top: 0;">
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Failed to load statistics. Please try again.
        </div>
      </div>
    `;
  }
}

// Initialize charts after the statistics page has been injected into the DOM
export async function initStatisticsPage() {
  try {
    const [statsResponse, tasksResponse] = await Promise.all([
      api.get('/api/tasks/statistics'),
      api.get('/api/tasks')
    ]);

    const stats = statsResponse.data || {};
    const tasks = tasksResponse.data?.tasks || [];

    const notStartedTasks = stats.notStartedTasks || 0;
    const inProgressTasks = stats.inProgressTasks || 0;
    const completedTasks = stats.completedTasks || 0;
    const cancelledTasks = stats.cancelledTasks || 0;

    // Prepare or cleanup chart holders
    window._tmCharts = window._tmCharts || {};
    if (window._tmCharts.statusPie) {
      try { 
        window._tmCharts.statusPie.destroy(); 
      } catch (err) {
        // Chart already destroyed or not initialized
        console.debug('Status pie chart cleanup:', err.message);
      }
    }
    if (window._tmCharts.priorityBar) {
      try { 
        window._tmCharts.priorityBar.destroy(); 
      } catch (err) {
        // Chart already destroyed or not initialized
        console.debug('Priority bar chart cleanup:', err.message);
      }
    }

    // Build counts for priorities
    const priorityCounts = {
      Low: tasks.filter(t => t.priority === 'Low').length,
      Medium: tasks.filter(t => t.priority === 'Medium').length,
      High: tasks.filter(t => t.priority === 'High').length
    };

    // Status Pie Chart
    const statusCtx = document.getElementById('statusPieChart');
    if (statusCtx && window.Chart) {
      // eslint-disable-next-line no-undef
      window._tmCharts.statusPie = new Chart(statusCtx, {
        type: 'pie',
        data: {
          labels: ['Not Started', 'In Progress', 'Completed', 'Cancelled'],
          datasets: [{
            data: [
              notStartedTasks,
              inProgressTasks,
              completedTasks,
              cancelledTasks
            ],
            backgroundColor: ['#6c757d', '#0dcaf0', '#28a745', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // Priority Bar Chart
    const priorityCtx = document.getElementById('priorityBarChart');
    if (priorityCtx && window.Chart) {
      // eslint-disable-next-line no-undef
      window._tmCharts.priorityBar = new Chart(priorityCtx, {
        type: 'bar',
        data: {
          labels: ['Low', 'Medium', 'High'],
          datasets: [{
            label: 'Tasks',
            data: [priorityCounts.Low, priorityCounts.Medium, priorityCounts.High],
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
      });
    }
  } catch (error) {
    console.error('Init statistics page error:', error);
  }
}

