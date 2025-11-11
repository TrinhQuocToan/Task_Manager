import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import ScheduleCalendar from '../components/ScheduleCalendar.jsx';

const HomePage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes, allTasksRes] = await Promise.all([
          api.get('/api/tasks/statistics'),
          api.get('/api/tasks?limit=5&sort=-createdAt'),
          api.get('/api/tasks?sortBy=dueDate&sortOrder=asc'),
        ]);
        setStats(statsRes.data || {});
        setRecentTasks(tasksRes.data?.tasks || []);
        setAllTasks(allTasksRes.data?.tasks || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <h1 className="display-4 fw-bold mb-4">Welcome to Task Manager</h1>
            <p className="lead mb-4">
              Organize your tasks, boost your productivity, and achieve your goals with our powerful task management system.
            </p>
            <div className="d-flex gap-3">
              <Link to="/auth/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/auth/login" className="btn btn-outline-primary btn-lg">
                Sign In
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <img
              src="https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Task+Manager"
              alt="Task Manager"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const overdueTasks = allTasks.filter(task => {
    if (!task.dueDate || task.status === 'Completed' || task.status === 'Cancelled') return false;
    return new Date(task.dueDate) < new Date();
  }).length;

  return (
    <div className="homepage">
      <div className="container py-4" style={{ marginTop: 0 }}>
        {/* Main Card with Greeting and Stats */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body position-relative">
            <Link 
              to="/tasks/create" 
              className="btn btn-success rounded-circle position-absolute top-0 end-0 m-3"
              style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Create new task"
            >
              <i className="fas fa-plus"></i>
            </Link>

            <div className="row">
              <div className="col-md-8">
                <div className="d-flex align-items-center mb-3">
                  <div className="balance-icon me-3">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="rounded-circle" style={{ width: '40px', height: '40px' }} />
                    ) : (
                      <i className="fas fa-tasks fa-2x text-primary"></i>
                    )}
                  </div>
                  <div>
                    <h5 className="mb-0">Hello, {user?.username || ''}</h5>
                    <p className="text-muted mb-0">Your task overview</p>
                  </div>
                </div>

                {stats?.totalTasks === 0 && (
                  <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Welcome to Task Manager! Create your first task to get started.
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <div className="task-stats p-3 rounded bg-light h-100">
                  <h5 className="mb-3">Quick stats</h5>
                  
                  <div className="stat-item mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span><i className="fas fa-tasks text-primary me-2"></i>Total tasks</span>
                      <span className="fw-bold">{stats?.totalTasks || 0}</span>
                    </div>
                  </div>

                  <div className="stat-item mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span><i className="fas fa-check-circle text-success me-2"></i>Completed</span>
                      <span className="fw-bold text-success">{stats?.completedTasks || 0}</span>
                    </div>
                  </div>

                  <div className="stat-item mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span><i className="fas fa-spinner text-info me-2"></i>In Progress</span>
                      <span className="fw-bold text-info">{stats?.inProgressTasks || 0}</span>
                    </div>
                  </div>

                  {overdueTasks > 0 && (
                    <div className="stat-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span><i className="fas fa-exclamation-triangle text-danger me-2"></i>Overdue</span>
                        <span className="fw-bold text-danger">{overdueTasks}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-center mt-3">
                    <Link to="/tasks" className="btn btn-sm btn-outline-primary">
                      View all
                    </Link>
                    {overdueTasks > 0 && (
                      <Link to="/tasks?status=Overdue" className="btn btn-sm btn-danger ms-1">
                        View overdue
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tasks
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-clock me-2"></i>Recent Tasks
            </h5>
            <Link to="/tasks" className="btn btn-sm btn-primary">
              View All
            </Link>
          </div>
          <div className="card-body">
            {recentTasks.length === 0 ? (
              <p className="text-muted text-center py-4">No tasks yet. Create your first task!</p>
            ) : (
              <div className="list-group list-group-flush">
                {recentTasks.map((task) => (
                    <Link
                      key={task._id}
                      to={`/tasks/${task._id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">{task.title}</h6>
                          {task.description && (
                            <p className="mb-1 text-muted small">
                              {task.description.substring(0, 100)}
                              {task.description.length > 100 ? '...' : ''}
                            </p>
                          )}
                          <div className="mt-2">
                            {task.categoryId && (
                              <span className="badge bg-secondary me-2">
                                <i className={`fas ${task.categoryId.icon || 'fa-tag'} me-1`}></i>
                                {task.categoryId.name}
                              </span>
                            )}
                            <span
                              className={`badge ${
                                task.status === 'Completed'
                                  ? 'bg-success'
                                  : task.status === 'In Progress'
                                  ? 'bg-info'
                                  : 'bg-secondary'
                              }`}
                            >
                              {task.status}
                            </span>
                            <span
                              className={`badge ms-2 ${
                                task.priority === 'High'
                                  ? 'bg-danger'
                                  : task.priority === 'Medium'
                                  ? 'bg-warning'
                                  : 'bg-success'
                              }`}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                ))}
              </div>
            )}
          </div>
        </div> */}

        {/* Schedule Calendar */}
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <ScheduleCalendar tasks={allTasks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
