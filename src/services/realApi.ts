// Real API Service - Connects to the backend server
// All functions use axios to make HTTP requests to the Express backend

import api, { getErrorMessage } from './axios';
import type {
  Application, Scheme, Student, Notification, Disbursal,
  Grievance, VaultDocument, AttendanceRecord, CSCCenter
} from '../mock/data';

// ============ AUTH ============
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'student' | 'admin' | 'government';
    name?: string;
    adminRole?: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  aadharNumber: string;
  stCertificateNumber: string;
  tribeName: string;
  state: string;
  district: string;
  familyIncome: number;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  courseName: string;
  courseLevel: string;
  institution: string;
  yearOfStudy: number;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail?: string;
}

// TODO: POST /api/auth/login
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: POST /api/auth/register
export const register = async (data: RegisterData): Promise<LoginResponse> => {
  try {
    const response = await api.post('/auth/register', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/auth/me
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};


// Normalize backend document records (_id -> id) into frontend VaultDocument shape
const normalizeVaultDoc = (d: any): VaultDocument => ({
  ...(d || {}),
  id: d?.id || d?._id,
});

// ============ STUDENT ============

// TODO: GET /api/student/schemes
export const getSchemes = async (): Promise<Scheme[]> => {
  try {
    const response = await api.get('/student/schemes');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/student/schemes/:id
export const getSchemeById = async (id: string): Promise<Scheme> => {
  try {
    const response = await api.get(`/student/schemes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/student/me
export const getStudentProfile = async (): Promise<Student> => {
  try {
    const response = await api.get('/student/me');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/student/me
export const updateStudentProfile = async (data: Partial<Student>): Promise<Student> => {
  try {
    const response = await api.put('/student/me', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: POST /api/student/applications
export const createApplication = async (data: {
  schemeId: string;
  documents?: any[];
  vaultDocumentIds?: string[];
}): Promise<Application> => {
  try {
    const response = await api.post('/student/applications', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/student/applications/:id/draft
export const saveDraft = async (id: string, data: {
  documents?: any[];
  vaultDocumentIds?: string[];
  draftProgress?: number;
}): Promise<Application> => {
  try {
    const response = await api.put(`/student/applications/${id}/draft`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/student/applications/my
export const getMyApplications = async (): Promise<Application[]> => {
  try {
    const response = await api.get('/student/applications/my');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/student/applications/:id
export const getApplicationById = async (id: string): Promise<Application> => {
  try {
    const response = await api.get(`/student/applications/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/student/applications/:id/documents (multipart)
export const uploadDocuments = async (id: string, files: File[]): Promise<Application> => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });
    const response = await api.put(`/student/applications/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: POST /api/student/grievances
export const createGrievance = async (data: {
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  needsAssistance?: boolean;
  assistanceType?: string;
}): Promise<Grievance> => {
  try {
    const response = await api.post('/student/grievances', data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/student/grievances/my
export const getMyGrievances = async (): Promise<Grievance[]> => {
  try {
    const response = await api.get('/student/grievances/my');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/student/notifications/my
export const getMyNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get('/student/notifications/my');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/student/notifications/:id/read
export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await api.put(`/student/notifications/${id}/read`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};



// GET /api/student/disbursals/my
export const getMyDisbursals = async (): Promise<Disbursal[]> => {
  try {
    const response = await api.get('/student/disbursals/my');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// PUT /api/student/applications/:id/enrolment
export const confirmEnrolmentById = async (id: string): Promise<Application> => {
  try {
    const response = await api.put(`/student/applications/${id}/enrolment`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// PUT /api/student/applications/:id/attendance
export const uploadAttendanceForApplication = async (id: string, percentage: number): Promise<Application> => {
  try {
    const response = await api.put(`/student/applications/${id}/attendance`, { percentage });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ============ DOCUMENT VAULT ============

// POST /api/student/vault/upload (multipart, field "files")
export const uploadVaultDocuments = async (files: File[]): Promise<VaultDocument[]> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    const response = await api.post('/student/vault/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (response.data.documents || []).map(normalizeVaultDoc);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// GET /api/student/vault
export const getVaultDocuments = async (): Promise<VaultDocument[]> => {
  try {
    const response = await api.get('/student/vault');
    return (response.data || []).map(normalizeVaultDoc);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// PUT /api/student/vault/:docId/verify
export const verifyVaultDocument = async (docId: string): Promise<VaultDocument> => {
  try {
    const response = await api.put(`/student/vault/${docId}/verify`);
    return normalizeVaultDoc(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// DELETE /api/student/vault/:docId
export const deleteVaultDocument = async (docId: string): Promise<void> => {
  try {
    await api.delete(`/student/vault/${docId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// PUT /api/student/applications/:id/submit
export const submitApplicationById = async (id: string): Promise<Application> => {
  try {
    const response = await api.put(`/student/applications/${id}/submit`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ============ ADMIN ============

// Normalize backend application records (_id -> id) into frontend shape
const normalizeApplication = (a: any): Application => ({
  ...(a || {}),
  id: a?.id || a?._id,
});

// GET /api/admin/dashboard-stats
export interface AdminDashboardStats {
  totalStudents: number;
  totalApplications: number;
  pendingReview: number;
  selected: number;
  rejected: number;
  flagged: number;
  openGrievances: number;
  disbursedAmount: number;
  disbursedCount: number;
  byStatus: Record<string, number>;
}

export const getAdminDashboardStats = async (): Promise<AdminDashboardStats> => {
  try {
    const response = await api.get('/admin/dashboard-stats');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// GET /api/admin/students
export const getAdminStudents = async (filters?: {
  state?: string;
  search?: string;
}): Promise<Student[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.state) params.append('state', filters.state);
    if (filters?.search) params.append('search', filters.search);
    const response = await api.get(`/admin/students?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// GET /api/admin/applications
export const getAdminApplications = async (filters?: {
  scheme?: string;
  state?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<Application[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.scheme) params.append('scheme', filters.scheme);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    const response = await api.get(`/admin/applications?${params.toString()}`);
    // Backend returns { applications, total, page, pages }; support both shapes
    const data = response.data;
    const list = Array.isArray(data) ? data : (data.applications || []);
    return list.map(normalizeApplication);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/admin/applications/:id
export const getAdminApplicationById = async (id: string): Promise<Application> => {
  try {
    const response = await api.get(`/admin/applications/${id}`);
    return normalizeApplication(response.data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/admin/applications/:id/status
export const updateApplicationStatus = async (
  id: string,
  status: string,
  remark?: string
): Promise<Application> => {
  try {
    const response = await api.put(`/admin/applications/${id}/status`, { status, remark });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/admin/applications/bulk-status
export const bulkUpdateStatus = async (
  applicationIds: string[],
  status: string,
  remark?: string
): Promise<{ message: string; applications: Application[] }> => {
  try {
    const response = await api.put('/admin/applications/bulk-status', {
      applicationIds,
      status,
      remark,
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/admin/merit-list/:schemeId
export const getMeritList = async (schemeId: string, state?: string): Promise<any[]> => {
  try {
    const params = state ? `?state=${state}` : '';
    const response = await api.get(`/admin/merit-list/${schemeId}${params}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: POST /api/admin/communications
export const sendCommunication = async (data: {
  studentIds: string[];
  title: string;
  message: string;
  type?: string;
}): Promise<void> => {
  try {
    await api.post('/admin/communications', data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/admin/audit-log
export const getAuditLog = async (filters?: {
  action?: string;
  search?: string;
}): Promise<any[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.search) params.append('search', filters.search);
    const response = await api.get(`/admin/audit-log?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/admin/disbursals
export const getAdminDisbursals = async (filters?: {
  status?: string;
  search?: string;
}): Promise<Disbursal[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const response = await api.get(`/admin/disbursals?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/admin/disbursals/:id
export const updateDisbursal = async (id: string, status: string): Promise<Disbursal> => {
  try {
    const response = await api.put(`/admin/disbursals/${id}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/admin/grievances
export const getAdminGrievances = async (filters?: {
  status?: string;
  category?: string;
  priority?: string;
}): Promise<Grievance[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority) params.append('priority', filters.priority);
    const response = await api.get(`/admin/grievances?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/admin/grievances/:id
export const respondToGrievance = async (
  id: string,
  response: string,
  status?: string
): Promise<Grievance> => {
  try {
    const res = await api.put(`/admin/grievances/${id}`, { response, status });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/admin/schemes
export const getAdminSchemes = async (): Promise<Scheme[]> => {
  try {
    const response = await api.get('/admin/schemes');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: PUT /api/admin/schemes/:id
export const updateScheme = async (id: string, data: Partial<Scheme>): Promise<Scheme> => {
  try {
    const response = await api.put(`/admin/schemes/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ============ GOVERNMENT ============

// TODO: GET /api/gov/dashboard-summary
export const getDashboardSummary = async () => {
  try {
    const response = await api.get('/gov/dashboard-summary');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/gov/scheme-performance
export const getSchemePerformance = async () => {
  try {
    const response = await api.get('/gov/scheme-performance');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/gov/budget-overview
export const getBudgetOverview = async () => {
  try {
    const response = await api.get('/gov/budget-overview');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// TODO: GET /api/gov/export?type=applications|disbursals
export const exportData = async (type: 'applications' | 'disbursals'): Promise<Blob> => {
  try {
    const response = await api.get(`/gov/export?type=${type}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
