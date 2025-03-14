import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  role: 'admin' | 'teacher';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  if (user.role !== role) {
    // Redirect to the appropriate dashboard based on user's role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
};