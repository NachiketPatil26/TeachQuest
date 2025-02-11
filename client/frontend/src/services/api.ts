import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ExamData {
  title?: string;
  description?: string;
  date: string;
  branch?: string;
  duration?: number;
  totalMarks?: number;
  createdBy?: string;
  block?: string;
  subject?: string;
  startTime?: string;
  endTime?: string;
  allocatedTeachers?: string[];
}

interface TeacherData {
  name: string;
  email: string;
  phone?: string;
  department: string;
  subjects: string[];
}

interface BranchData {
  name: string;
  subjects: Array<{
    name: string;
    code: string;
    semester: number;
  }>;
  active?: boolean;
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
    const response = await api.get(`/api/exams/${encodeURIComponent(branch)}`);
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
// Teacher management
export const getTeachers = async () => {
  const response = await api.get('/api/users/teachers');
  return response.data;
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

// Branch APIs
export const getBranches = async () => {
  try {
    const response = await api.get('/api/branches');
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to fetch branches. Please try again.'
    );
  }
};

export const getBranchById = async (id: string) => {
  try {
    const response = await api.get(`/api/branches/${id}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to fetch branch details. Please try again.'
    );
  }
};

export const createBranch = async (branchData: BranchData) => {
  try {
    const response = await api.post('/api/branches', branchData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to create branch. Please try again.'
    );
  }
};

export const updateBranch = async (id: string, branchData: Partial<BranchData>) => {
  try {
    const response = await api.put(`/api/branches/${id}`, branchData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to update branch. Please try again.'
    );
  }
};

export const addTeacherToBranch = async (branchId: string, teacherId: string) => {
  try {
    const response = await api.post(`/api/branches/${branchId}/teachers`, { teacherId });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to add teacher to branch. Please try again.'
    );
  }
};

export const removeTeacherFromBranch = async (branchId: string, teacherId: string) => {
  try {
    const response = await api.delete(`/api/branches/${branchId}/teachers`, {
      data: { teacherId }
    });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(
      typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
        ? (err.response.data as { message: string }).message
        : 'Failed to remove teacher from branch. Please try again.'
    );
  }
};

export default api;