import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface ExamData {
  title: string;
  description: string;
  date: string;
  branch: string;
  duration: number;
  totalMarks: number;
}

interface TeacherData {
  name: string;
  email: string;
  phone?: string;
  department: string;
  subjects: string[];
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = async (email: string, password: string, role: 'admin' | 'teacher') => {
  try {
    const response = await api.post('/api/auth/login', { email, password, role });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(err.response?.data?.toString() || 'Login failed. Please check your credentials.');
  }
};

// Exam APIs
export const getExams = async (branch: string) => {
  try {
    const response = await api.get(`/api/exams/${branch}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response.data || {}) 
      ? (err.response.data as { message: string }).message 
      : 'Failed to fetch exam data. Please check your connection and try again.');
  }
};

export const createExam = async (examData: ExamData) => {
  try {
    const response = await api.post('/api/exams', examData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {}) 
      ? (err.response.data as { message: string }).message 
      : 'Failed to create exam. Please try again.');
  }
};

export const updateExam = async (id: string, examData: Partial<ExamData>) => {
  try {
    const response = await api.put(`/api/exams/${id}`, examData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to update exam. Please try again.');
  }
};

export const allocateTeachers = async (examId: string, teacherIds: string[]) => {
  try {
    const response = await api.post(`/api/exams/${examId}/allocate`, { teacherIds });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to allocate teachers. Please try again.');
  }
};

// Teacher APIs
export const getTeachers = async () => {
  try {
    const response = await api.get('/api/users/teachers');
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to fetch teachers. Please try again.'
    );
  }
};

export const updateTeacherProfile = async (userData: Partial<TeacherData>) => {
  try {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to update profile. Please try again.');
  }
};

export default api;