import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { api } from '../utils/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: 'fa-tag', color: '#d86b22' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingCategory) {
        response = await api.put(`/api/categories/${editingCategory._id}`, formData);
      } else {
        response = await api.post('/api/categories', formData);
      }

      if (response.success) {
        toast.success(editingCategory ? 'Category updated!' : 'Category created!');
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', icon: 'fa-tag', color: '#d86b22' });
        fetchCategories();
      }
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await api.delete(`/api/categories/${id}`);
      if (response.success) {
        toast.success('Category deleted!');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon || 'fa-tag', color: category.color || '#d86b22' });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', icon: 'fa-tag', color: '#d86b22' });
    setShowModal(true);
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

  return (
    <div className="container-fluid py-4" style={{ marginTop: 0 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="fas fa-tags me-2"></i>Categories
        </h2>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="fas fa-plus me-2"></i>Create new category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <div className="mb-4">
              <i className="fas fa-tags fa-4x text-muted"></i>
            </div>
            <h4 className="mb-3">No categories found</h4>
            <p className="text-muted mb-4">Create your first category to organize your tasks</p>
            <button className="btn btn-primary btn-lg" onClick={openCreateModal}>
              <i className="fas fa-plus me-2"></i>Create new category
            </button>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>#</th>
                    <th>Category Name</th>
                    <th style={{ width: '150px' }} className="text-end">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                    <tr key={category._id}>
                      <td className="text-muted">{index + 1}</td>
                      <td>
                        <span
                          className="badge me-2"
                          style={{ backgroundColor: category.color || '#d86b22' }}
                        >
                          <i className={`fas ${category.icon || 'fa-tag'} me-1`}></i>
                          {category.name}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-warning"
                            onClick={() => openEditModal(category)}
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => deleteCategory(category._id)}
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Category Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Icon (FontAwesome class)</label>
                    <select
                      className="form-select"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    >
                      <option value="fa-tag">🏷️ Tag (fa-tag)</option>
                      <option value="fa-briefcase">💼 Briefcase (fa-briefcase)</option>
                      <option value="fa-home">🏠 Home (fa-home)</option>
                      <option value="fa-shopping-cart">🛒 Shopping (fa-shopping-cart)</option>
                      <option value="fa-heart">❤️ Heart (fa-heart)</option>
                      <option value="fa-star">⭐ Star (fa-star)</option>
                      <option value="fa-book">📚 Book (fa-book)</option>
                      <option value="fa-graduation-cap">🎓 Education (fa-graduation-cap)</option>
                      <option value="fa-laptop">💻 Laptop (fa-laptop)</option>
                      <option value="fa-mobile">📱 Mobile (fa-mobile)</option>
                      <option value="fa-envelope">✉️ Envelope (fa-envelope)</option>
                      <option value="fa-calendar">📅 Calendar (fa-calendar)</option>
                      <option value="fa-clock">🕐 Clock (fa-clock)</option>
                      <option value="fa-coffee">☕ Coffee (fa-coffee)</option>
                      <option value="fa-utensils">🍴 Food (fa-utensils)</option>
                      <option value="fa-plane">✈️ Travel (fa-plane)</option>
                      <option value="fa-car">🚗 Car (fa-car)</option>
                      <option value="fa-dumbbell">🏋️ Fitness (fa-dumbbell)</option>
                      <option value="fa-music">🎵 Music (fa-music)</option>
                      <option value="fa-camera">📷 Camera (fa-camera)</option>
                      <option value="fa-gamepad">🎮 Gaming (fa-gamepad)</option>
                      <option value="fa-film">🎬 Film (fa-film)</option>
                      <option value="fa-paint-brush">🎨 Art (fa-paint-brush)</option>
                      <option value="fa-code">💻 Code (fa-code)</option>
                      <option value="fa-dollar-sign">💰 Money (fa-dollar-sign)</option>
                      <option value="fa-chart-line">📈 Chart (fa-chart-line)</option>
                      <option value="fa-users">👥 Users (fa-users)</option>
                      <option value="fa-cog">⚙️ Settings (fa-cog)</option>
                      <option value="fa-lightbulb">💡 Idea (fa-lightbulb)</option>
                      <option value="fa-rocket">🚀 Rocket (fa-rocket)</option>
                    </select>
                    <small className="form-text text-muted d-flex align-items-center mt-2">
                      <i className={`fas ${formData.icon} me-2`} style={{ fontSize: '1.5rem' }}></i>
                      Preview: {formData.icon}
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Color</label>
                    <input
                      type="color"
                      className="form-control"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
