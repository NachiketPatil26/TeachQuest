import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AdminLogin from './components/AdminLogin';
import TeacherLogin from './components/TeacherLogin';
import AdminDashboard from './components/dashboard/AdminDashboard';
import { adminRoutes } from './routes/adminRoutes';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import LandingPage from './components/LandingPage';

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            {adminRoutes.map((route) => (
              <Route key={route.path} path={`/${route.path}`} element={route.element}>
                {route.children?.map((child) => (
                  <Route key={child.path} path={child.path} element={child.element} />
                ))}
              </Route>
            ))}
          </Route>

          {/* Protected Teacher Routes */}
          <Route element={<ProtectedRoute role="teacher" />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}