import api from './api';
import { AxiosError } from 'axios';

// Analytics data interfaces
export interface AnalyticsData {
  teacherWorkload: TeacherWorkloadData[];
  subjectDistribution: SubjectDistributionData[];
  statusDistribution: StatusDistributionData[];
  summaryStats: SummaryStats;
}

export interface TeacherWorkloadData {
  teacherId: string;
  teacherName: string;
  totalDuties: number;
  completedDuties: number;
  upcomingDuties: number;
}

export interface SubjectDistributionData {
  subject: string;
  count: number;
}

export interface StatusDistributionData {
  status: string;
  count: number;
}

export interface SummaryStats {
  totalExams: number;
  totalTeachers: number;
  averageDutiesPerTeacher: number;
  completionRate: number;
}

// Fetch analytics data for admin dashboard
export const getAnalyticsData = async (branch?: string, semester?: number) => {
  try {
    const params = new URLSearchParams();
    if (branch) params.append('branch', branch);
    if (semester) params.append('semester', semester.toString());
    
    const response = await api.get(`/api/analytics?${params.toString()}`);
    return response.data as AnalyticsData;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to fetch analytics data. Please try again.'
    );
  }
};

// Fetch teacher-specific analytics data
export const getTeacherAnalytics = async (teacherId?: string) => {
  try {
    const url = teacherId 
      ? `/api/analytics/teachers/${teacherId}` 
      : '/api/analytics/teachers/me';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to fetch teacher analytics data. Please try again.'
    );
  }
};