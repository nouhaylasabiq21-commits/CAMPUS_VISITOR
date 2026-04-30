import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Visits from './pages/Visits';
import Visitors from './pages/Visitors';
import Hosts from './pages/Hosts';
import CheckIn from './pages/CheckIn';
import Logs from './pages/Logs';
import './index.css';
import './components/Layout.css';
import './pages/Dashboard.css';
import './pages/Login.css';
import './pages/CheckIn.css';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />

      <Route path="/visits" element={<ProtectedRoute><Layout><Visits /></Layout></ProtectedRoute>} />
      <Route path="/visits/new" element={<ProtectedRoute><Layout><Visits /></Layout></ProtectedRoute>} />

      <Route
        path="/visitors"
        element={
          <ProtectedRoute roles={['admin','agent','host']}>
            <Layout><Visitors /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/hosts"
        element={
          <ProtectedRoute roles={['admin','agent','host']}>
            <Layout><Hosts /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkin"
        element={
          <ProtectedRoute roles={['admin','agent']}>
            <Layout><CheckIn /></Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/logs"
        element={
          <ProtectedRoute roles={['admin','agent','host']}>
            <Layout><Logs /></Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
