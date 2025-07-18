import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, loading, hasAnyRole } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    // Redirect to dashboard if user doesn't have required roles
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;