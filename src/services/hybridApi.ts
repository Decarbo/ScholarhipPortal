// Hybrid API Service - Uses real backend when available, falls back to mock data
// This allows the frontend to work both with and without the backend

import * as realApi from './realApi';
import * as mockApi from './api';
import {
  applications, schemes, students, notifications, disbursals,
  grievances, analyticsData, auditLog,
  type Application, type Scheme, type Notification, type Disbursal,
  type Grievance, type Student
} from '../mock/data';

// Helper to check if backend is available
let backendAvailable: boolean | null = null;

export const checkBackend = async (): Promise<boolean> => {
  if (backendAvailable !== null) return backendAvailable;
  try {
    await realApi.getCurrentUser();
    backendAvailable = true;
    return true;
  } catch {
    backendAvailable = false;
    return false;
  }
};

// ============ AUTH ============
export const login = async (email: string, password: string) => {
  try {
    return await realApi.login(email, password);
  } catch (error) {
    throw error; // Don't fallback for auth - must use real API
  }
};

// ============ SCHEMES ============
export const getSchemes = async (): Promise<Scheme[]> => {
  try {
    return await realApi.getSchemes();
  } catch {
    return schemes;
  }
};

export const getSchemeById = async (id: string): Promise<Scheme | undefined> => {
  try {
    return await realApi.getSchemeById(id);
  } catch {
    return schemes.find(s => s.id === id);
  }
};

// ============ STUDENT ============
export const getStudentProfile = async (): Promise<Student> => {
  try {
    return await realApi.getStudentProfile();
  } catch {
    return students[0];
  }
};

export const updateStudentProfile = async (data: Partial<Student>): Promise<Student> => {
  try {
    return await realApi.updateStudentProfile(data);
  } catch {
    return { ...students[0], ...data };
  }
};

// ============ APPLICATIONS ============
export const getMyApplications = async (): Promise<Application[]> => {
  try {
    return await realApi.getMyApplications();
  } catch {
    return applications.filter(a => a.studentId === students[0].id);
  }
};

export const getApplicationById = async (id: string): Promise<Application | undefined> => {
  try {
    return await realApi.getApplicationById(id);
  } catch {
    return applications.find(a => a.id === id);
  }
};

export const createApplication = async (data: any): Promise<Application> => {
  try {
    return await realApi.createApplication(data);
  } catch {
    const newApp: Application = {
      id: `APP${String(applications.length + 1).padStart(3, '0')}`,
      studentId: students[0].id,
      studentName: students[0].name,
      schemeId: data.schemeId,
      schemeName: schemes.find(s => s.id === data.schemeId)?.name || '',
      status: 'draft',
      state: students[0].state,
      category: 'General ST',
      submittedDate: '',
      lastUpdated: new Date().toISOString().split('T')[0],
      documents: data.documents || [],
      vaultDocumentIds: data.vaultDocumentIds || [],
      aiFlags: [],
      deficiencyNotices: [],
      amount: schemes.find(s => s.id === data.schemeId)?.amount || 0,
      draftProgress: data.draftProgress || 0,
      enrolmentConfirmed: false,
    };
    applications.push(newApp);
    return newApp;
  }
};

export const saveDraft = async (id: string, data: any): Promise<Application> => {
  try {
    return await realApi.saveDraft(id, data);
  } catch {
    const app = applications.find(a => a.id === id);
    if (app) {
      Object.assign(app, data);
      app.draftLastSaved = new Date().toISOString().replace('T', ' ').substring(0, 19);
      return app;
    }
    throw new Error('Application not found');
  }
};

export const uploadDocuments = async (id: string, files: File[]): Promise<Application> => {
  try {
    return await realApi.uploadDocuments(id, files);
  } catch {
    const app = applications.find(a => a.id === id);
    if (app) {
      const newDocs = files.map((f, i) => ({
        id: `DOC${Date.now()}${i}`,
        name: f.name,
        type: f.type,
        status: 'pending' as const,
        uploadDate: new Date().toISOString().split('T')[0],
        aiScore: Math.floor(Math.random() * 30) + 70,
      }));
      app.documents.push(...newDocs);
      return app;
    }
    throw new Error('Application not found');
  }
};

// ============ NOTIFICATIONS ============
export const getMyNotifications = async (): Promise<Notification[]> => {
  try {
    return await realApi.getMyNotifications();
  } catch {
    return notifications.filter(n => n.userId === students[0].id);
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await realApi.markNotificationRead(id);
  } catch {
    const notif = notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }
};

// ============ DISBURSALS ============
export const getMyDisbursals = async (): Promise<Disbursal[]> => {
  try {
    // Backend doesn't have a specific endpoint for student's disbursals
    // So we use mock data
    return disbursals.filter(d =>
      applications.some(a => a.studentId === students[0].id && a.id === d.applicationId)
    );
  } catch {
    return disbursals.filter(d =>
      applications.some(a => a.studentId === students[0].id && a.id === d.applicationId)
    );
  }
};

// ============ GRIEVANCES ============
export const getMyGrievances = async (): Promise<Grievance[]> => {
  try {
    return await realApi.getMyGrievances();
  } catch {
    return grievances.filter(g => g.studentId === students[0].id);
  }
};

export const createGrievance = async (data: any): Promise<Grievance> => {
  try {
    return await realApi.createGrievance(data);
  } catch {
    const newGrv: Grievance = {
      id: `GRV${String(grievances.length + 1).padStart(3, '0')}`,
      studentId: students[0].id,
      studentName: students[0].name,
      subject: data.subject,
      description: data.description,
      status: 'open',
      priority: data.priority || 'medium',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      needsAssistance: data.needsAssistance,
      assistanceType: data.assistanceType,
    };
    grievances.push(newGrv);
    return newGrv;
  }
};



export const getMyDisbursalsReal = async (): Promise<Disbursal[]> => {
  return await realApi.getMyDisbursals();
};

export const confirmEnrolmentLive = async (id: string): Promise<Application> => {
  return await realApi.confirmEnrolmentById(id);
};

export const uploadAttendanceLive = async (id: string, percentage: number): Promise<Application> => {
  return await realApi.uploadAttendanceForApplication(id, percentage);
};

// ============ DOCUMENT VAULT (real backend only) ============
export const getVaultDocuments = async (): Promise<any[]> => {
  return await realApi.getVaultDocuments();
};

export const uploadVaultDocuments = async (files: File[]): Promise<any[]> => {
  return await realApi.uploadVaultDocuments(files);
};

export const verifyVaultDocument = async (docId: string): Promise<any> => {
  return await realApi.verifyVaultDocument(docId);
};

export const deleteVaultDocument = async (docId: string): Promise<void> => {
  return await realApi.deleteVaultDocument(docId);
};

export const submitApplicationById = async (id: string): Promise<Application> => {
  return await realApi.submitApplicationById(id);
};

// ============ ADMIN ============
export const getAdminDashboardStats = async () => {
  return await realApi.getAdminDashboardStats(); // throws if backend offline; callers handle
};

export const getAdminStudents = async (filters?: { state?: string; search?: string }): Promise<Student[]> => {
  try {
    return await realApi.getAdminStudents(filters);
  } catch {
    let result = [...students];
    if (filters?.state) result = result.filter(s => s.state === filters.state);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.district || '').toLowerCase().includes(q)
      );
    }
    return result;
  }
};

export const getMeritList = async (schemeId: string, state?: string): Promise<any[]> => {
  try {
    return await realApi.getMeritList(schemeId, state);
  } catch {
    return applications
      .filter(a => a.schemeId === schemeId && ['screening', 'under_scrutiny'].includes(a.status))
      .filter(a => !state || a.state === state)
      .map(a => ({
        ...a,
        averageAiScore: a.documents.length
          ? a.documents.reduce((s, d) => s + ((d as any).aiScore || 0), 0) / a.documents.length
          : 0,
      }))
      .sort((x: any, y: any) => y.averageAiScore - x.averageAiScore);
  }
};

export const sendCommunication = async (data: { studentIds: string[]; title: string; message: string; type?: string }): Promise<void> => {
  try {
    await realApi.sendCommunication(data);
  } catch {
    // mock fallback: notifications appear for demo student only
  }
};

export const updateDisbursal = async (id: string, status: string): Promise<Disbursal | undefined> => {
  try {
    return await realApi.updateDisbursal(id, status);
  } catch {
    const d = disbursals.find(x => x.id === id);
    if (d) d.status = status as any;
    return d;
  }
};

export const getAdminSchemes = async (): Promise<Scheme[]> => {
  try {
    return await realApi.getAdminSchemes();
  } catch {
    return schemes;
  }
};

export const updateScheme = async (id: string, data: Partial<Scheme>): Promise<Scheme | undefined> => {
  try {
    return await realApi.updateScheme(id, data);
  } catch {
    const s = schemes.find(x => x.id === id);
    if (s) Object.assign(s, data);
    return s;
  }
};

export const getAdminApplications = async (filters?: any): Promise<Application[]> => {
  try {
    return await realApi.getAdminApplications(filters);
  } catch {
    let result = [...applications];
    if (filters?.scheme) result = result.filter(a => a.schemeId === filters.scheme);
    if (filters?.state) result = result.filter(a => a.state === filters.state);
    if (filters?.status) result = result.filter(a => a.status === filters.status);
    if (filters?.search) {
      result = result.filter(a =>
        a.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
        a.id.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    return result;
  }
};

export const updateApplicationStatus = async (id: string, status: string, remark?: string): Promise<Application | undefined> => {
  try {
    return await realApi.updateApplicationStatus(id, status, remark);
  } catch {
    const app = applications.find(a => a.id === id);
    if (app) {
      app.status = status as any;
      app.lastUpdated = new Date().toISOString().split('T')[0];
      if (remark) app.plainReason = remark;
    }
    return app;
  }
};

export const bulkUpdateStatus = async (ids: string[], status: string, remark?: string) => {
  try {
    return await realApi.bulkUpdateStatus(ids, status, remark);
  } catch {
    ids.forEach(id => {
      const app = applications.find(a => a.id === id);
      if (app) {
        app.status = status as any;
        app.lastUpdated = new Date().toISOString().split('T')[0];
      }
    });
    return { message: `${ids.length} updated`, applications: [] };
  }
};

export const getAuditLog = async (filters?: { action?: string; search?: string }) => {
  try {
    return await realApi.getAuditLog(filters);
  } catch {
    return auditLog;
  }
};

export const getAdminDisbursals = async (filters?: { status?: string; search?: string }): Promise<Disbursal[]> => {
  try {
    return await realApi.getAdminDisbursals(filters);
  } catch {
    return disbursals;
  }
};

export const getAdminGrievances = async (filters?: { status?: string; category?: string; priority?: string }): Promise<Grievance[]> => {
  try {
    return await realApi.getAdminGrievances(filters);
  } catch {
    return grievances;
  }
};

export const respondToGrievance = async (id: string, response: string, status?: string): Promise<void> => {
  try {
    await realApi.respondToGrievance(id, response, status);
  } catch {
    const grv = grievances.find(g => g.id === id);
    if (grv) {
      grv.response = response;
      grv.status = (status as any) || 'resolved';
      grv.lastUpdated = new Date().toISOString();
    }
  }
};

// ============ GOVERNMENT ============
export const getDashboardSummary = async () => {
  try {
    return await realApi.getDashboardSummary();
  } catch {
    return analyticsData;
  }
};

export const getSchemePerformance = async () => {
  try {
    return await realApi.getSchemePerformance();
  } catch {
    return analyticsData.schemePerformance;
  }
};

export const getBudgetOverview = async () => {
  try {
    return await realApi.getBudgetOverview();
  } catch {
    return analyticsData.budgetData;
  }
};
