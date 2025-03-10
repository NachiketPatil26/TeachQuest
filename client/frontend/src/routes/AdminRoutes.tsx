import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import ExamTimetable from '../components/timetable/ExamTimetable';
import TeacherAllocation from '../components/allocation/TeacherAllocation';
import AnalyticsPage from '../pages/admin/AnalyticsPage';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/timetable/:branch" element={<ExamTimetable />} />
      <Route path="/timetable/:branch/:semester" element={<ExamTimetable />} />
      <Route path="/allocation/:branch" element={<TeacherAllocation />} />
      <Route path="/allocation/:branch/:semester" element={<TeacherAllocation />} />
      <Route path="/analytics/:branch" element={<AnalyticsPage />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}