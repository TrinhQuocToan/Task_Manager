import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { api } from '../utils/api';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const StatisticsPage = () => {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/api/tasks/statistics'),
          api.get('/api/tasks'),
        ]);
        setStats(statsRes.data || {});
        setTasks(tasksRes.data?.tasks || []);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const totalTasks = stats?.totalTasks || 0;
  const completedTasks = stats?.completedTasks || 0;
  const inProgressTasks = stats?.inProgressTasks || 0;
  const notStartedTasks = stats?.notStartedTasks || 0;
  const cancelledTasks = stats?.cancelledTasks || 0;
  const highPriorityTasks = stats?.highPriorityTasks || 0;

  // Priority counts
  const priorityCounts = {
    Low: tasks.filter((t) => t.priority === 'Low').length,
    Medium: tasks.filter((t) => t.priority === 'Medium').length,
    High: tasks.filter((t) => t.priority === 'High').length,
  };

  // Pie Chart Data
  const pieChartData = {
    labels: ['Not Started', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [notStartedTasks, inProgressTasks, completedTasks, cancelledTasks],
        backgroundColor: ['#6c757d', '#0dcaf0', '#28a745', '#dc3545'],
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                return {
                  text: `${label}: ${value}`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                  fontColor: '#333',
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Bar Chart Data
  const barChartData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks',
        data: [priorityCounts.Low, priorityCounts.Medium, priorityCounts.High],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
          },
        },
      },
    },
  };

  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  return (
    <div className="container-fluid py-4" style={{ marginTop: 0 }}>
      <h2 className="mb-4">
        <i className="fas fa-chart-line me-2"></i>Statistics
      </h2>

      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Total tasks</h6>
                  <h3 className="mb-0">{totalTasks}</h3>
                </div>
                <div className="text-primary">
                  <i className="fas fa-tasks fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Completed</h6>
                  <h3 className="mb-0 text-success">{completedTasks}</h3>
                </div>
                <div className="text-success">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">In Progress</h6>
                  <h3 className="mb-0 text-info">{inProgressTasks}</h3>
                </div>
                <div className="text-info">
                  <i className="fas fa-spinner fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">High priority</h6>
                  <h3 className="mb-0 text-danger">{highPriorityTasks}</h3>
                </div>
                <div className="text-danger">
                  <i className="fas fa-flag fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-pie me-2"></i>Status - Pie chart
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '350px', position: 'relative' }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>Priority - Bar chart
              </h5>
            </div>
            <div className="card-body">
              <div style={{ height: '300px', position: 'relative' }}>
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Completion rate</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Completed</span>
                  <span>{calculatePercentage(completedTasks, totalTasks)}%</span>
                </div>
                <div className="progress" style={{ height: '25px' }}>
                  <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${calculatePercentage(completedTasks, totalTasks)}%` }}
                  >
                    {completedTasks} / {totalTasks}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Task status</h5>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>
                    <i className="fas fa-circle text-secondary me-2"></i>Not Started
                  </span>
                  <strong>{notStartedTasks}</strong>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>
                    <i className="fas fa-spinner text-info me-2"></i>In Progress
                  </span>
                  <strong>{inProgressTasks}</strong>
                </div>
              </div>
              <div className="mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <span>
                    <i className="fas fa-check-circle text-success me-2"></i>Completed
                  </span>
                  <strong>{completedTasks}</strong>
                </div>
              </div>
              {cancelledTasks > 0 && (
                <div className="mb-2">
                  <div className="d-flex justify-content-between mb-1">
                    <span>
                      <i className="fas fa-times-circle text-danger me-2"></i>Cancelled
                    </span>
                    <strong>{cancelledTasks}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
