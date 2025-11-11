import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../utils/api';
import { isTaskOverdue, getOverdueBadgeText } from '../utils/format';

const TaskFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'Medium',
    status: 'Not Started',
    dueDate: '',
    reminderAt: '',
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const categoriesRes = await api.get('/api/categories');
      setCategories(categoriesRes.data?.categories || []);

      if (isEdit) {
        const taskRes = await api.get(`/api/tasks/${id}`);
        const task = taskRes.data?.task;
        if (task) {
          setFormData({
            title: task.title || '',
            description: task.description || '',
            categoryId: task.categoryId?._id || '',
            priority: task.priority || 'Medium',
            status: task.status || 'Not Started',
            dueDate: task.dueDate ? formatDateForInput(task.dueDate) : '',
            reminderAt: task.reminderAt ? formatDateForInput(task.reminderAt) : '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSend = { ...formData };
      if (!dataToSend.categoryId) delete dataToSend.categoryId;
      if (!dataToSend.dueDate) delete dataToSend.dueDate;
      if (!dataToSend.reminderAt) delete dataToSend.reminderAt;

      let response;
      if (isEdit) {
        response = await api.put(`/api/tasks/${id}`, dataToSend);
      } else {
        response = await api.post('/api/tasks', dataToSend);
      }

      if (response.success) {
        toast.success(isEdit ? 'Task updated successfully!' : 'Task created successfully!');
        navigate('/tasks');
      } else {
        toast.error(response.message || 'Failed to save task');
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(error.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
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

  const isOverdue = isEdit && formData.dueDate && isTaskOverdue({ dueDate: formData.dueDate, status: formData.status });
  const overdueBadge = isOverdue ? getOverdueBadgeText({ dueDate: formData.dueDate }) : '';

  return (
    <div className="container-fluid py-4" style={{ marginTop: 0 }}>
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h4 className="mb-0">
                <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                {isEdit ? 'Edit task' : 'Create new task'}
              </h4>
            </div>
            <div className="card-body">
              {isOverdue && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> This task is <strong>{overdueBadge}</strong>. Please update the status or extend the deadline.
                  <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-heading me-2"></i>Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    <i className="fas fa-align-left me-2"></i>Description
                  </label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter task description"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-tag me-2"></i>Category
                    </label>
                    <select
                      className="form-select"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">Select category (optional)</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-calendar me-2"></i>Due date
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-bell me-2"></i>Reminder
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      name="reminderAt"
                      value={formData.reminderAt}
                      onChange={handleChange}
                    />
                    <small className="form-text text-muted">
                      Set a reminder before the due date (optional)
                    </small>
                  </div>

                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-flag me-2"></i>Priority <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">
                      <i className="fas fa-tasks me-2"></i>Status <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="d-flex gap-2 justify-content-end mt-4">
                  <Link to="/tasks" className="btn btn-secondary">
                    <i className="fas fa-times me-2"></i>Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting && (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    )}
                    <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} me-2`}></i>
                    {isEdit ? 'Update task' : 'Create task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormPage;
