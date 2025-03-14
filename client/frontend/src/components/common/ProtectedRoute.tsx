import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  role: 'admin' | 'teacher';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
<<<<<<< HEAD
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9FC0AE]"></div>
    </div>;
=======
    return <div>Loading...</div>;
>>>>>>> a5d9b927743499379847008cef184e48bd465b17
  }

  if (!user) {
    return <Navigate to={`/${role}/login`} replace />;
  }

  if (user.role !== role) {
<<<<<<< HEAD
    return <Navigate to={`/${user.role}/login`} replace />;
=======
    // Redirect to the appropriate dashboard based on user's role
    return <Navigate to={`/${user.role}/dashboard`} replace />;
>>>>>>> a5d9b927743499379847008cef184e48bd465b17
  }

  return <Outlet />;
};