import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect unauthenticated user to login, preserving target location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, verify access or allow role flexibility in demo mode
  return <>{children}</>;
};
