import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  role: 'admin' | 'teacher';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE]"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={`/${user.role}/login`} replace />;
  }

  return <Outlet />;
};