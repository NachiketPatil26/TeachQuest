import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import TeacherLogin from './components/TeacherLogin';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TeacherDashboard from './components/dashboard/TeacherDashboard';
import RemunerationPage from './pages/teacher/RemunerationPage';
import NotificationsPage from './pages/teacher/NotificationsPage';
import SchedulePage from './pages/teacher/SchedulePage';
import ReportsPage from './pages/teacher/ReportsPage';
import SupportPage from './pages/teacher/SupportPage';
import ExamTimetable from './components/timetable/ExamTimetable';
import SemesterSelection from './components/timetable/SemesterSelection';
import ExamNameSelection from './components/timetable/ExamNameSelection';
import TeacherAllocation from './components/allocation/TeacherAllocation';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import TeacherInfoPage from './pages/admin/TeacherInfoPage';
import AiAssistant from './components/ai/AiAssistant';
import TeacherDuties from './components/teacher/TeacherDuties';
import TeacherDutyDetails from './components/teacher/TeacherDutyDetails';


function App() {
  return (
    <>
    <AiAssistant/>
    
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="timetable/:branch" element={<SemesterSelection />} />
            <Route path="timetable/:branch/:semester" element={<ExamNameSelection />} />
            <Route path="timetable/:branch/:semester/:examName" element={<ExamTimetable />} />
            <Route path="allocation/:branch/:semester/:examName" element={<TeacherAllocation />} />
            <Route path="remuneration/:branch" element={<div>Remuneration Page</div>} />
            <Route path="analytics/:branch" element={<AnalyticsPage />} />
            <Route path="teachers/:branch" element={<TeacherInfoPage />} />
          </Route>

          {/* Protected Teacher Routes */}
          <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="duties" element={<TeacherDuties />} />
            <Route path="duties/:id" element={<TeacherDutyDetails />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="remuneration" element={<RemunerationPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="support" element={<SupportPage />} />
        
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </>
   
  );
}

export default App;