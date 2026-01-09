import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../hooks/useAuth';
import { PATH_AUTH } from '../constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireCapability?: string;
  requireRole?: string | string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requireCapability,
  requireRole,
}) => {
  const { isAuthenticated, isLoading, user, validateToken } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Validate token on mount if authenticated
    if (isAuthenticated) {
      validateToken();
    }
  }, [isAuthenticated, validateToken]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate to={PATH_AUTH.signin} state={{ from: location }} replace />
    );
  }

  // Check admin requirement
  if (requireAdmin) {
    const isAdmin =
      user?.roles?.includes('administrator') ||
      user?.capabilities?.['manage_options'];
    if (!isAdmin) {
      return <Navigate to="/" replace />;
    }
  }

  // Check capability requirement
  if (requireCapability && !user?.capabilities?.[requireCapability]) {
    return <Navigate to="/" replace />;
  }

  // Check role requirement
  if (requireRole) {
    const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
    const hasRole = roles.some((role) => user?.roles?.includes(role));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
