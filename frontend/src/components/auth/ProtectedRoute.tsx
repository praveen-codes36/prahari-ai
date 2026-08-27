import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService, ROLE_PRESETS } from '../../services/authService';
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

  const currentRole = authService.getCurrentRole();

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    // Redirect to the role's default dashboard if not authorized
    const targetRoute = ROLE_PRESETS[currentRole]?.targetRoute || '/login';
    return <Navigate to={targetRoute} replace />;
  }

  return <>{children}</>;
};
