<<<<<<< HEAD
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
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import TeacherLogin from './components/TeacherLogin';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import DutiesPage from './pages/teacher/DutiesPage';
import RemunerationPage from './pages/teacher/RemunerationPage';
import NotificationsPage from './pages/teacher/NotificationsPage';
import SchedulePage from './pages/teacher/SchedulePage';
import ReportsPage from './pages/teacher/ReportsPage';
import ExamTimetable from './components/timetable/ExamTimetable';
import SemesterSelection from './components/timetable/SemesterSelection';
import ExamNameSelection from './components/timetable/ExamNameSelection';
import TeacherAllocation from './components/allocation/TeacherAllocation';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AnalyticsPage from './pages/admin/AnalyticsPage';

function App() {
  return (
    
      <Router>
>>>>>>> a5d9b927743499379847008cef184e48bd465b17
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* Protected Admin Routes */}
<<<<<<< HEAD
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
=======
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="timetable/:branch" element={<SemesterSelection />} />
            <Route path="timetable/:branch/:semester" element={<ExamNameSelection />} />
            <Route path="timetable/:branch/:semester/:examName" element={<ExamTimetable />} />
            <Route path="allocation/:branch/:semester/:examName" element={<TeacherAllocation />} />
            <Route path="duties/:branch" element={<div>Duties Page</div>} />
            <Route path="remuneration/:branch" element={<div>Remuneration Page</div>} />
            <Route path="analytics/:branch" element={<AnalyticsPage />} />
          </Route>

          {/* Protected Teacher Routes */}
          <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="duties" element={<DutiesPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="remuneration" element={<RemunerationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
   
  );
}

export default App;
>>>>>>> a5d9b927743499379847008cef184e48bd465b17
