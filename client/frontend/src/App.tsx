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
import TeacherAllocation from './components/allocation/TeacherAllocation';
import { ProtectedRoute } from './components/common/ProtectedRoute';


function App() {
  return (
    
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="timetable/:branch" element={<ExamTimetable />} />
            <Route path="allocation/:branch" element={<TeacherAllocation />} />
            <Route path="duties/:branch" element={<div>Duties Page</div>} />
            <Route path="remuneration/:branch" element={<div>Remuneration Page</div>} />
            <Route path="analytics/:branch" element={<div>Analytics Page</div>} />
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