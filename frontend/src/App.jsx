import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/Layout.jsx';
import PublicLayout from './components/PublicLayout.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import VerifyOTPPage from './pages/VerifyOTPPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import TaskFormPage from './pages/TaskFormPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import StatisticsPage from './pages/StatisticsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/create" element={<TaskFormPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/me/profile" element={<ProfilePage />} />
            <Route path="/projects" element={<div className="container py-4"><h1><i className="fas fa-project-diagram me-2"></i>Dự án</h1><p>Trang này đang được phát triển...</p></div>} />
          </Route>

          {/* Logout Route */}
          <Route path="/auth/logout" element={<Navigate to="/" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 9999 }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
