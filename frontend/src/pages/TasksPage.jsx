import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { formatDateOnly, isTaskOverdue, getOverdueBadgeText, getCompletedLateBadgeText } from '../utils/format';

const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    categoryId: searchParams.get('categoryId') || '',
    sortBy: searchParams.get('sortBy') || 'dueDate',
    sortOrder: searchParams.get('sortOrder') || 'asc',
  });

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, tasksRes] = await Promise.all([
        api.get('/api/categories'),
        api.get(`/api/tasks?${buildQueryString()}`),
      ]);
      
      setCategories(categoriesRes.data?.categories || []);
      let fetchedTasks = tasksRes.data?.tasks || [];
      
      // Client-side filter for overdue
      if (filters.status === 'Overdue') {
        fetchedTasks = fetchedTasks.filter(task => isTaskOverdue(task));
      }
      
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.status && filters.status !== 'Overdue') params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);
    return params.toString();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.set(key, filters[key]);
    });
    setSearchParams(params);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      categoryId: '',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
    setSearchParams({});
  };

  const sortByColumn = (column) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    const newFilters = { ...filters, sortBy: column, sortOrder: newOrder };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) params.set(key, newFilters[key]);
    });
    setSearchParams(params);
  };

  const updateTaskField = async (taskId, field, value) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, { [field]: value });
      if (response.success) {
        toast.success(`Task ${field} updated successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error(`Failed to update task ${field}`);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/tasks/${taskId}`);
      if (response.success) {
        toast.success('Task deleted successfully!');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'bg-danger text-white';
      case 'Medium': return 'bg-warning text-dark';
      case 'Low': return 'bg-success text-white';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success text-white';
      case 'In Progress': return 'bg-info text-white';
      case 'Cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  const getSortIcon = (column) => {
    if (filters.sortBy !== column) return '';
    return filters.sortOrder === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  };

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

  const hasFilters = filters.search || filters.status || filters.priority || filters.categoryId;

  return (
    <div className="container-fluid py-4" style={{ marginTop: 0 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>
            <i className="fas fa-check-square me-2"></i>Tasks
          </h2>
          {hasFilters && (
            <div className="mt-2">
              <span className="badge bg-info">
                <i className="fas fa-filter me-1"></i>
                Filtering ({tasks.length} results)
                <button
                  className="btn btn-link text-white p-0 ms-2"
                  onClick={resetFilters}
                  style={{ textDecoration: 'none', fontSize: '0.9rem' }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </span>
            </div>
          )}
        </div>
        <Link to="/tasks/create" className="btn btn-primary">
          <i className="fas fa-plus me-2"></i>Create Task
        </Link>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small text-muted">
                <i className="fas fa-filter me-1"></i>Filter by status
              </label>
              <select
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Overdue">⚠️ Overdue</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">
                <i className="fas fa-flag me-1"></i>Filter by priority
              </label>
              <select
                className="form-select form-select-sm"
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">
                <i className="fas fa-tag me-1"></i>Filter by category
              </label>
              <select
                className="form-select form-select-sm"
                value={filters.categoryId}
                onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">
                <i className="fas fa-sort me-1"></i>Sort by
              </label>
              <select
                className="form-select form-select-sm"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="dueDate">Due date</option>
                <option value="createdAt">Created at</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small text-muted">
                <i className="fas fa-sort-amount-down me-1"></i>Order
              </label>
              <select
                className="form-select form-select-sm"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="col-12 d-flex gap-2 justify-content-end mt-2">
              <button className="btn btn-sm btn-primary" onClick={applyFilters}>
                <i className="fas fa-filter me-1"></i>Apply filters
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={resetFilters}>
                <i className="fas fa-undo me-1"></i>Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <i className="fas fa-tasks fa-4x text-muted"></i>
            </div>
            <h4 className="mb-3">No tasks found</h4>
            <p className="text-muted mb-4">
              {hasFilters ? 'Try adjusting your filters' : 'Start by creating your first task'}
            </p>
            {!hasFilters && (
              <Link to="/tasks/create" className="btn btn-primary btn-lg">
                <i className="fas fa-plus me-2"></i>Create new task
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => sortByColumn('title')}
                      className={filters.sortBy === 'title' ? 'text-primary' : ''}
                    >
                      Title <i className={`fas ${getSortIcon('title')}`}></i>
                    </th>
                    <th>Categories</th>
                    <th
                      style={{ cursor: 'pointer', width: '130px' }}
                      onClick={() => sortByColumn('priority')}
                      className={filters.sortBy === 'priority' ? 'text-primary' : ''}
                    >
                      Priority <i className={`fas ${getSortIcon('priority')}`}></i>
                    </th>
                    <th
                      style={{ cursor: 'pointer', width: '160px' }}
                      onClick={() => sortByColumn('status')}
                      className={filters.sortBy === 'status' ? 'text-primary' : ''}
                    >
                      Status <i className={`fas ${getSortIcon('status')}`}></i>
                    </th>
                    <th
                      style={{ cursor: 'pointer' }}
                      onClick={() => sortByColumn('dueDate')}
                      className={filters.sortBy === 'dueDate' ? 'text-primary' : ''}
                    >
                      Due date <i className={`fas ${getSortIcon('dueDate')}`}></i>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const isOverdue = isTaskOverdue(task);
                    const overdueBadge = isOverdue ? getOverdueBadgeText(task) : '';
                    const lateBadge = getCompletedLateBadgeText(task);

                    return (
                      <tr
                        key={task._id}
                        className={isOverdue ? 'table-danger' : ''}
                        style={isOverdue ? { backgroundColor: '#ffe6e6' } : {}}
                      >
                        <td>
                          <div>
                            <strong>{task.title || 'No title'}</strong>
                            {isOverdue && (
                              <span className="badge bg-danger ms-2">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                {overdueBadge}
                              </span>
                            )}
                            {task.description && (
                              <>
                                <br />
                                <small className="text-muted">{task.description}</small>
                              </>
                            )}
                          </div>
                        </td>
                        <td>
                          {task.categoryId ? (
                            <span
                              className="badge"
                              style={{ backgroundColor: task.categoryId.color || '#d86b22' }}
                            >
                              <i className={`fas ${task.categoryId.icon || 'fa-tag'} me-1`}></i>
                              {task.categoryId.name || 'N/A'}
                            </span>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <select
                            className={`form-select form-select-sm ${getPriorityClass(task.priority)}`}
                            value={task.priority}
                            onChange={(e) => updateTaskField(task._id, 'priority', e.target.value)}
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </td>
                        <td>
                          <select
                            className={`form-select form-select-sm ${getStatusClass(task.status)}`}
                            value={task.status}
                            onChange={(e) => updateTaskField(task._id, 'status', e.target.value)}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {lateBadge && (
                            <div className="mt-2">
                              <small className="badge bg-warning text-dark">
                                <i className="fas fa-clock me-1"></i>
                                {lateBadge}
                              </small>
                            </div>
                          )}
                        </td>
                        <td>{task.dueDate ? formatDateOnly(task.dueDate) : 'N/A'}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <Link to={`/tasks/${task._id}`} className="btn btn-outline-primary">
                              <i className="fas fa-eye"></i>
                            </Link>
                            <Link to={`/tasks/${task._id}/edit`} className="btn btn-outline-warning">
                              <i className="fas fa-edit"></i>
                            </Link>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => deleteTask(task._id)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
