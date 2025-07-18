import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ClaimsProvider } from './contexts/ClaimsContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClaimForm from './pages/ClaimForm';
import DocumentUpload from './pages/DocumentUpload';
import AdminClaimDetail from './pages/AdminClaimDetail';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ClaimsProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/admin" element={<AdminLogin />} />
              
              {/* Client Routes */}
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
              
              {/* Admin/Operator Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRoles={['admin', 'operator']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/claim/:claimId" 
                element={
                  <ProtectedRoute requiredRoles={['admin', 'operator']}>
                    <AdminClaimDetail />
                  </ProtectedRoute>
                } 
              />
            </Routes>
            
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ClaimsProvider>
    </AuthProvider>
  );
}

export default App;