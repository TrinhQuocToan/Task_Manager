import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';

const Layout = () => {
  return (
    <>
      <Header />
      <div className="content-wrapper with-sidebar">
        <Sidebar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
