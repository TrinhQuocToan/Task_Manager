import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';

const PublicLayout = () => {
  return (
    <>
      <Header />
      <div className="content-wrapper">
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default PublicLayout;
