import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: 'fa-home', label: 'Home Page' },
    { path: '/categories', icon: 'fa-tags', label: 'Categories' },
    { path: '/tasks', icon: 'fa-check-square', label: 'Tasks' },
    { path: '/statistics', icon: 'fa-chart-line', label: 'Statistics' },
  ];

  return (
    <div className="sidebar">
      <div className="nav flex-column">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end={item.path === '/'}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
