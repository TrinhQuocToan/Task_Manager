import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const Header = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query) => {
    try {
      setLoading(true);
      setShowResults(true);
      const response = await api.get(`/api/tasks?search=${encodeURIComponent(query)}`);
      setSearchResults(response.data?.tasks || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'text-success';
      case 'In Progress': return 'text-info';
      case 'Cancelled': return 'text-danger';
      default: return 'text-secondary';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container-fluid header-container">
        <div className="header-left d-flex align-items-center">
          <Link className="navbar-brand me-4" to="/" style={{ color: 'white', textDecoration: 'none' }}>
            <i className="fas fa-tasks me-2"></i>
            <span className="logo-text" style={{ color: 'white' }}>Task Manager</span>
          </Link>
        </div>

        {user && (
          <div className="header-center">
            <div className="search-box-wrapper position-relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control search-input"
                    placeholder="Search tasks..."
                    autoComplete="off"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary" 
                    type="submit"
                    style={{ backgroundColor: '#d86b22', borderColor: '#d86b22' }}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>

              {showResults && (
                <div className="search-results dropdown-menu show" style={{ display: 'block' }}>
                  {loading ? (
                    <div className="search-loading p-3 text-center">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-3 text-center text-muted">
                      <i className="fas fa-search me-2"></i>
                      Không tìm thấy kết quả nào
                    </div>
                  ) : (
                    <div className="search-results-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {searchResults.slice(0, 10).map((task) => (
                        <Link
                          key={task._id}
                          to={`/tasks/${task._id}`}
                          className="search-result-item dropdown-item-text"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="d-flex align-items-start">
                            <div className="flex-grow-1">
                              <div className="fw-semibold">
                                {highlightText(task.title, searchQuery)}
                              </div>
                              {task.description && (
                                <small className="text-muted d-block mt-1">
                                  {highlightText(
                                    task.description.substring(0, 60),
                                    searchQuery
                                  )}
                                  {task.description.length > 60 ? '...' : ''}
                                </small>
                              )}
                              <div className="mt-1">
                                {task.categoryId && (
                                  <span className="badge bg-secondary me-1" style={{ fontSize: '0.7rem' }}>
                                    <i className={`fas ${task.categoryId.icon || 'fa-tag'} me-1`}></i>
                                    {task.categoryId.name}
                                  </span>
                                )}
                                <span className={`badge ${getStatusClass(task.status)}`} style={{ fontSize: '0.7rem' }}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                      {searchResults.length > 10 && (
                        <div className="p-2 text-center border-top">
                          <Link
                            to={`/tasks?search=${encodeURIComponent(searchQuery)}`}
                            className="btn btn-sm btn-link"
                            onClick={() => setShowResults(false)}
                          >
                            Xem tất cả {searchResults.length} kết quả
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="header-right d-flex align-items-center">
          {user ? (
            <div className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                <img
                  src={user.avatar || 'https://secure.gravatar.com/avatar/default?s=32&d=mp'}
                  alt={user.username}
                  className="rounded-circle me-2"
                  width="32"
                  height="32"
                  onError={(e) => {
                    e.target.src = 'https://secure.gravatar.com/avatar/default?s=32&d=mp';
                  }}
                />
                <span>{user.username}</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/me/profile">
                    <i className="fas fa-user me-2"></i>Profile
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <>
              <Link className="nav-link" to="/auth/login">
                <i className="fas fa-sign-in-alt me-1"></i>Login
              </Link>
              <Link className="nav-link" to="/auth/register">
                <i className="fas fa-user-plus me-1"></i>Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
