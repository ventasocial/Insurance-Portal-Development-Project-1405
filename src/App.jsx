import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ClaimsProvider } from './contexts/ClaimsContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import ClaimForm from './pages/ClaimForm';
import DocumentUpload from './pages/DocumentUpload';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminClaimDetail from './pages/AdminClaimDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ClaimsProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claim/:claimId"
                element={
                  <ProtectedRoute>
                    <ClaimForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/documents/:claimId"
                element={
                  <ProtectedRoute>
                    <DocumentUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute admin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/claim/:claimId"
                element={
                  <ProtectedRoute admin>
                    <AdminClaimDetail />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </Router>
      </ClaimsProvider>
    </AuthProvider>
  );
}

export default App;