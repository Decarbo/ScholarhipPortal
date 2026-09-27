// API Service Layer
// TODO: Replace mock returns with actual axios calls to backend API
// Example: return axios.get('/api/applications').then(res => res.data);

import {
  applications, schemes, students, adminUsers, auditLog,
  notifications, disbursals, grievances, analyticsData,
  attendanceRecords, cscCenters,
  type Application, type Scheme, type Notification, type Disbursal,
  type Grievance, type AuditEntry, type Student, type VaultDocument,
  type AttendanceRecord, type CSCCenter
} from '../mock/data';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============ APPLICATIONS ============
// TODO: replace with GET /api/applications
export const getApplications = async (filters?: { schemeId?: string; state?: string; status?: string; studentId?: string }): Promise<Application[]> => {
  await delay(300);
  let result = [...applications];
  if (filters?.schemeId) result = result.filter(a => a.schemeId === filters.schemeId);
  if (filters?.state) result = result.filter(a => a.state === filters.state);
  if (filters?.status) result = result.filter(a => a.status === filters.status);
  if (filters?.studentId) result = result.filter(a => a.studentId === filters.studentId);
  return result;
};

// TODO: replace with GET /api/applications/:id
export const getApplicationById = async (id: string): Promise<Application | undefined> => {
  await delay(200);
  return applications.find(a => a.id === id);
};

// TODO: replace with POST /api/applications
export const submitApplication = async (data: Partial<Application>): Promise<Application> => {
  await delay(500);
  const newApp: Application = {
    id: `APP${String(applications.length + 1).padStart(3, '0')}`,
    studentId: data.studentId || 'STU001',
    studentName: data.studentName || 'New Student',
    schemeId: data.schemeId || 'SCH001',
    schemeName: data.schemeName || 'NFST',
    status: 'submitted',
    state: data.state || 'Unknown',
    category: 'General ST',
    submittedDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    documents: data.documents || [],
    vaultDocumentIds: data.vaultDocumentIds || [],
    aiFlags: [],
    deficiencyNotices: [],
    amount: data.amount || 0,
    draftProgress: 100,
    enrolmentConfirmed: false,
  };
  applications.push(newApp);
  return newApp;
};

// TODO: replace with PATCH /api/applications/:id/status
export const updateApplicationStatus = async (id: string, status: Application['status'], reason?: string): Promise<Application | undefined> => {
  await delay(400);
  const app = applications.find(a => a.id === id);
  if (app) {
    app.status = status;
    app.lastUpdated = new Date().toISOString().split('T')[0];
    if (reason) app.plainReason = reason;
  }
  return app;
};

// TODO: replace with PATCH /api/applications/:id/draft
export const saveDraft = async (id: string, progress: number): Promise<void> => {
  await delay(200);
  const app = applications.find(a => a.id === id);
  if (app) {
    app.draftProgress = progress;
    app.draftLastSaved = new Date().toISOString().replace('T', ' ').substring(0, 19);
    app.status = 'draft';
  }
};

// TODO: replace with PATCH /api/applications/:id/enrolment
export const confirmEnrolment = async (id: string): Promise<void> => {
  await delay(300);
  const app = applications.find(a => a.id === id);
  if (app) {
    app.enrolmentConfirmed = true;
    app.enrolmentDate = new Date().toISOString().split('T')[0];
  }
};

// TODO: replace with PATCH /api/applications/:id/attendance
export const uploadAttendance = async (id: string, percentage: number): Promise<void> => {
  await delay(300);
  const app = applications.find(a => a.id === id);
  if (app) {
    app.attendancePercentage = percentage;
    app.progressReportUploaded = true;
  }
};

// ============ SCHEMES ============
// TODO: replace with GET /api/schemes
export const getSchemes = async (): Promise<Scheme[]> => {
  await delay(200);
  return [...schemes];
};

// TODO: replace with GET /api/schemes/:id
export const getSchemeById = async (id: string): Promise<Scheme | undefined> => {
  await delay(150);
  return schemes.find(s => s.id === id);
};

// TODO: replace with POST /api/schemes/:id/eligibility-check
export const checkEligibility = async (schemeId: string, studentId: string): Promise<{ eligible: boolean; failedChecks: string[]; passedChecks: string[] }> => {
  await delay(400);
  const scheme = schemes.find(s => s.id === schemeId);
  const student = students.find(s => s.id === studentId);
  if (!scheme || !student) return { eligible: false, failedChecks: ['Data not found'], passedChecks: [] };

  const passedChecks: string[] = [];
  const failedChecks: string[] = [];

  scheme.eligibilityCheck.forEach(check => {
    let passes = false;
    const fieldValue = (student as any)[check.field];

    switch (check.operator) {
      case 'less_than': passes = fieldValue < check.value; break;
      case 'greater_than': passes = fieldValue > check.value; break;
      case 'equals': passes = fieldValue === check.value; break;
      case 'contains': passes = String(fieldValue).includes(check.value); break;
      case 'in': passes = check.value.includes(fieldValue); break;
    }

    if (passes) passedChecks.push(check.label);
    else failedChecks.push(check.label);
  });

  return { eligible: failedChecks.length === 0, failedChecks, passedChecks };
};

// ============ STUDENTS ============
// TODO: replace with GET /api/students/:id
export const getStudentById = async (id: string): Promise<Student | undefined> => {
  await delay(200);
  return students.find(s => s.id === id);
};

// TODO: replace with GET /api/students/me
export const getCurrentStudent = async (): Promise<Student> => {
  await delay(200);
  return students[0]; // Mock: return first student as "logged in" student
};

// TODO: replace with PATCH /api/students/me
export const updateStudentProfile = async (data: Partial<Student>): Promise<Student> => {
  await delay(400);
  const student = students[0];
  Object.assign(student, data);
  return student;
};

// TODO: replace with PATCH /api/students/me/verify-bank
export const verifyBankAccount = async (): Promise<{ verified: boolean }> => {
  await delay(1000);
  students[0].bankVerified = true;
  return { verified: true };
};

// ============ DOCUMENT VAULT ============
// TODO: replace with GET /api/students/me/documents
export const getDocumentVault = async (studentId: string): Promise<VaultDocument[]> => {
  await delay(200);
  const student = students.find(s => s.id === studentId);
  return student?.documentVault || [];
};

// TODO: replace with POST /api/students/me/documents
export const uploadToVault = async (doc: Partial<VaultDocument>): Promise<VaultDocument> => {
  await delay(500);
  const newDoc: VaultDocument = {
    id: `VDOC${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    name: doc.name || 'document.pdf',
    type: doc.type || 'application/pdf',
    category: doc.category || 'other',
    status: 'pending',
    uploadDate: new Date().toISOString().split('T')[0],
    aiScore: 0,
    usedInApplications: [],
    sampleAvailable: false,
  };
  students[0].documentVault.push(newDoc);
  return newDoc;
};

// TODO: replace with DELETE /api/students/me/documents/:id
export const deleteFromVault = async (docId: string): Promise<void> => {
  await delay(200);
  const student = students[0];
  student.documentVault = student.documentVault.filter(d => d.id !== docId);
};

// ============ NOTIFICATIONS ============
// TODO: replace with GET /api/notifications?userId=:id
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  await delay(200);
  return notifications.filter(n => n.userId === userId);
};

// TODO: replace with PATCH /api/notifications/:id/read
export const markNotificationRead = async (id: string): Promise<void> => {
  await delay(100);
  const notif = notifications.find(n => n.id === id);
  if (notif) notif.read = true;
};

// ============ DISBURSALS ============
// TODO: replace with GET /api/disbursals?applicationId=:id
export const getDisbursals = async (applicationId?: string): Promise<Disbursal[]> => {
  await delay(250);
  if (applicationId) return disbursals.filter(d => d.applicationId === applicationId);
  return [...disbursals];
};

// TODO: replace with PATCH /api/disbursals/:id/status
export const updateDisbursalStatus = async (id: string, status: Disbursal['status']): Promise<void> => {
  await delay(300);
  const d = disbursals.find(x => x.id === id);
  if (d) d.status = status;
};

// ============ GRIEVANCES ============
// TODO: replace with GET /api/grievances?studentId=:id
export const getGrievances = async (studentId?: string): Promise<Grievance[]> => {
  await delay(200);
  if (studentId) return grievances.filter(g => g.studentId === studentId);
  return [...grievances];
};

// TODO: replace with POST /api/grievances
export const submitGrievance = async (data: Partial<Grievance>): Promise<Grievance> => {
  await delay(400);
  const newGrv: Grievance = {
    id: `GRV${String(grievances.length + 1).padStart(3, '0')}`,
    studentId: data.studentId || 'STU001',
    studentName: data.studentName || 'Student',
    subject: data.subject || '',
    description: data.description || '',
    status: 'open',
    priority: data.priority || 'medium',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    needsAssistance: data.needsAssistance,
    assistanceType: data.assistanceType,
  };
  grievances.push(newGrv);
  return newGrv;
};

// TODO: replace with PATCH /api/grievances/:id/respond
export const respondToGrievance = async (id: string, response: string): Promise<void> => {
  await delay(300);
  const grv = grievances.find(g => g.id === id);
  if (grv) {
    grv.response = response;
    grv.status = 'resolved';
    grv.lastUpdated = new Date().toISOString();
  }
};

// ============ ATTENDANCE ============
// TODO: replace with GET /api/attendance?applicationId=:id
export const getAttendanceRecords = async (applicationId?: string): Promise<AttendanceRecord[]> => {
  await delay(200);
  if (applicationId) return attendanceRecords.filter(a => a.applicationId === applicationId);
  return [...attendanceRecords];
};

// ============ CSC CENTERS ============
// TODO: replace with GET /api/csc-centers?state=:state
export const getCSCCenters = async (state?: string): Promise<CSCCenter[]> => {
  await delay(200);
  if (state) return cscCenters.filter(c => c.state === state);
  return [...cscCenters];
};

// ============ AUDIT LOG ============
// TODO: replace with GET /api/audit-log
export const getAuditLog = async (): Promise<AuditEntry[]> => {
  await delay(200);
  return [...auditLog];
};

// ============ ANALYTICS (Government) ============
// TODO: replace with GET /api/analytics/dashboard
export const getAnalyticsData = async () => {
  await delay(300);
  return { ...analyticsData };
};

// ============ ADMIN USERS ============
// TODO: replace with GET /api/admin/users
export const getAdminUsers = async () => {
  await delay(150);
  return [...adminUsers];
};

// ============ SMS STATUS CHECK ============
// TODO: replace with GET /api/sms/status?phone=:phone
export const checkSMSStatus = async (phone: string): Promise<{ applications: { id: string; status: string; scheme: string }[] }> => {
  await delay(300);
  // Mock: return applications for the phone number
  const student = students.find(s => s.phone === phone);
  if (!student) return { applications: [] };
  const apps = applications.filter(a => a.studentId === student.id);
  return {
    applications: apps.map(a => ({ id: a.id, status: a.status, scheme: a.schemeName }))
  };
};
