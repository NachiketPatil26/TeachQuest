import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ExamData {
  examName: string;
  branch: string;
  semester: number;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  allocatedTeachers?: string[];
  status?: 'scheduled' | 'in-progress' | 'completed';
  blocks?: Array<{
    number: number;
    capacity: number;
    location: string;
    status: 'pending' | 'in_progress' | 'completed';
    invigilator?: string | null;
  }>;
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

interface Block {
  number: number;
  capacity: number;
  location: string;
  invigilator?: string | null;
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
    const response = await api.post('/api/users/login', { email, password, role });
    
    // Store token in localStorage for API interceptor to use
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(err.response?.data?.toString() || 'Login failed. Please check your credentials.');
  }
};

// Exam APIs
export const getExams = async (branch: string, semester?: number, examName?: string) => {
  try {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester.toString());
    if (examName) params.append('examName', examName);
    
    const response = await api.get(`/api/exams/${encodeURIComponent(branch)}?${params.toString()}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {}) 
      ? (err.response.data as { message: string }).message 
      : 'Failed to fetch exams');
  }
};

export const getExamById = async (id: string) => {
  try {
    const response = await api.get(`/api/exams/${id}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {}) 
      ? (err.response.data as { message: string }).message 
      : 'Failed to fetch exam details. Please try again.');
  }
};

export const createExam = async (examData: ExamData) => {
  try {
    const response = await api.post(`/api/exams/${examData.branch}`, examData);
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

export const createTeacher = async (teacherData: TeacherData) => {
  try {
    const response = await api.post('/api/users/teachers', teacherData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to create teacher. Please try again.');
  }
};

export const updateTeacher = async (teacherId: string, teacherData: Partial<TeacherData>) => {
  try {
    const response = await api.put(`/api/users/teachers/${teacherId}`, teacherData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to update teacher. Please try again.');
  }
};

export const deleteTeacher = async (teacherId: string) => {
  try {
    const response = await api.delete(`/api/users/teachers/${teacherId}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to delete teacher. Please try again.');
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

// Teacher allocation APIs
export const getTeacherAllocations = async (teacherId?: string) => {
  try {
    const url = teacherId ? `/api/users/teachers/${teacherId}/allocations` : '/api/users/teachers/me/allocations';
    const response = await api.get(url);
    if (!response.data) {
      throw new Error('No allocation data received');
    }
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    const err = error as AxiosError;
    if (err.response?.status === 401) {
      throw new Error('Please log in to view your allocations');
    }
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to fetch teacher allocations. Please try again.');
  }
};

export const getTeacherStats = async (teacherId?: string) => {
  try {
    const url = teacherId ? `/api/users/teachers/${teacherId}/stats` : '/api/users/teachers/me/stats';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to fetch teacher statistics. Please try again.');
  }
};

export const getTeacherUpcomingDuties = async (teacherId?: string, limit?: number) => {
  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const url = teacherId 
      ? `/api/users/teachers/${teacherId}/duties/upcoming?${params.toString()}` 
      : `/api/users/teachers/me/duties/upcoming?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to fetch upcoming duties. Please try again.');
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

export const addBlock = async (examId: string, blockData: Block) => {
  try {
    const response = await api.post(`/api/exams/${examId}/blocks`, blockData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to add exam block. Please try again.');
  }
};

export const updateBlock = async (examId: string, blockNumber: number, blockData: Partial<Block>) => {
  try {
    const response = await api.patch(`/api/exams/${examId}/blocks/${blockNumber}`, blockData);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to update exam block. Please try again.');
  }
};

export const deleteBlock = async (examId: string, blockNumber: number) => {
  try {
    const response = await api.delete(`/api/exams/${examId}/blocks/${blockNumber}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to delete exam block. Please try again.');
  }
};

export const assignInvigilator = async (examId: string, blockNumber: number, teacherId: string) => {
  try {
    const response = await api.post(`/api/exams/${examId}/blocks/${blockNumber}/invigilator`, { invigilatorId: teacherId });
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to assign invigilator. Please try again.');
  }
};

// Auto allocate teachers to an exam
export const autoAllocateTeachers = async (examId: string) => {
  try {
    const response = await api.post(`/api/exams/${examId}/auto-allocate`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    throw new Error(typeof err.response?.data === 'object' && 'message' in (err.response?.data || {})
      ? (err.response.data as { message: string }).message
      : 'Failed to auto-allocate teachers. Please try again.');
  }
};

export default api;