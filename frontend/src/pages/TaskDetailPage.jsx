import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { formatDateOnly, isTaskOverdue, getOverdueBadgeText } from '../utils/format';

const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      const response = await api.get(`/api/tasks/${id}`);
      setTask(response.data?.task);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/tasks/${id}`);
      if (response.success) {
        toast.success('Task deleted successfully!');
        navigate('/tasks');
      }
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'In Progress': return 'bg-info';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High': return 'bg-danger';
      case 'Medium': return 'bg-warning text-dark';
      case 'Low': return 'bg-success';
      default: return 'bg-secondary';
    }
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

  if (!task) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Task not found
        </div>
        <Link to="/tasks" className="btn btn-secondary">
          <i className="fas fa-arrow-left me-2"></i>Back to tasks
        </Link>
      </div>
    );
  }

  const isOverdue = isTaskOverdue(task);
  const overdueBadge = isOverdue ? getOverdueBadgeText(task) : '';

  return (
    <div className="container-fluid py-4" style={{ marginTop: 0 }}>
      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>Task Details
              </h4>
              <div className="btn-group">
                <Link to={`/tasks/${id}/edit`} className="btn btn-warning btn-sm">
                  <i className="fas fa-edit me-1"></i>Edit
                </Link>
                <button onClick={deleteTask} className="btn btn-danger btn-sm">
                  <i className="fas fa-trash me-1"></i>Delete
                </button>
              </div>
            </div>
            <div className="card-body">
              {isOverdue && (
                <div className="alert alert-danger mb-4">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This task is <strong>{overdueBadge}</strong>
                </div>
              )}

              <div className="mb-4">
                <h2 className="mb-3">{task.title}</h2>
                <div className="d-flex gap-2 flex-wrap">
                  <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                    <i className="fas fa-circle me-1"></i>{task.status}
                  </span>
                  <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                    <i className="fas fa-flag me-1"></i>{task.priority} Priority
                  </span>
                  {task.categoryId && (
                    <span
                      className="badge"
                      style={{ backgroundColor: task.categoryId.color || '#d86b22' }}
                    >
                      <i className={`fas ${task.categoryId.icon || 'fa-tag'} me-1`}></i>
                      {task.categoryId.name}
                    </span>
                  )}
                </div>
              </div>

              {task.description && (
                <div className="mb-4">
                  <h5 className="mb-2">
                    <i className="fas fa-align-left me-2"></i>Description
                  </h5>
                  <p className="text-muted">{task.description}</p>
                </div>
              )}

              <div className="row">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted mb-2">
                    <i className="fas fa-calendar me-2"></i>Due Date
                  </h6>
                  <p className="mb-0">
                    {task.dueDate ? formatDateOnly(task.dueDate) : 'Not set'}
                  </p>
                </div>
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted mb-2">
                    <i className="fas fa-clock me-2"></i>Created At
                  </h6>
                  <p className="mb-0">
                    {task.createdAt ? formatDateOnly(task.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>

              {task.updatedAt && (
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="fas fa-history me-1"></i>
                    Last updated: {formatDateOnly(task.updatedAt)}
                  </small>
                </div>
              )}
            </div>
          </div>

          <Link to="/tasks" className="btn btn-secondary">
            <i className="fas fa-arrow-left me-2"></i>Back to tasks
          </Link>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>Information
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Status</small>
                <span className={`badge ${getStatusBadgeClass(task.status)}`}>
                  {task.status}
                </span>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Priority</small>
                <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              {task.categoryId && (
                <div className="mb-3">
                  <small className="text-muted d-block mb-1">Category</small>
                  <span
                    className="badge"
                    style={{ backgroundColor: task.categoryId.color || '#d86b22' }}
                  >
                    <i className={`fas ${task.categoryId.icon || 'fa-tag'} me-1`}></i>
                    {task.categoryId.name}
                  </span>
                </div>
              )}
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Task ID</small>
                <code className="small">{task._id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
