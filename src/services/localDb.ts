// ============================================================
//  localDb — single LocalStorage source of truth for the portal
//  All collections (users, applications, disbursals, grievances,
//  notifications, audit log) persist here and are shared across
//  Student / Admin / Government pages.
// ============================================================
import { useEffect, useState } from "react";
import {
  students as seedStudents,
  schemes as seedSchemes,
  applications as seedApplications,
  notifications as seedNotifications,
  disbursals as seedDisbursals,
  grievances as seedGrievances,
  auditLog as seedAuditLog,
  analyticsData as seedAnalytics,
} from "../mock/data";
import type {
  Student,
  Scheme,
  Notification,
  Disbursal,
  AuditEntry,
} from "../mock/data";

/* ---------------- Types ---------------- */
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface DbUser {
  id: string;
  role: "student" | "admin" | "government";
  name: string;
  email: string;
  password: string;
  state?: string;
  district?: string;
  designation?: string;
  approvalStatus: ApprovalStatus; // student→admin, admin→government
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface DbDocument {
  id: string;
  name: string;
  status: "verified" | "pending" | "flagged" | "missing";
  aiScore: number;
  category?: string;
  uploadedAt?: string;
}

export type AppStatus =
  | "draft"
  | "submitted"
  | "under_scrutiny"
  | "screening"
  | "more_info_required"
  | "selected"
  | "waitlisted"
  | "sanctioned"
  | "disbursal_pending"
  | "disbursed"
  | "rejected";

export interface DbApplication {
  id: string;
  studentId: string;
  studentName: string;
  schemeId: string;
  schemeName: string;
  state: string;
  district: string;
  category: string;
  amount: number;
  status: AppStatus;
  submittedDate: string;
  lastUpdated: string;
  documents: DbDocument[];
  aiFlags: { id: string; severity: string; message: string; suggestion?: string }[];
  deficiencyNotices: {
    id: string;
    message: string;
    plainLanguageMessage: string;
    resolved: boolean;
    issuedDate: string;
  }[];
  plainReason?: string;
  adminRemark?: string;
  meritScore?: number;
  draftProgress: number;
  draftLastSaved?: string;
  enrolmentConfirmed: boolean;
  attendancePercentage?: number;
  progressReportUploaded?: boolean;
  renewalSubmitted?: boolean;
  timeline: { id: string; status: string; label: string; at: string; note?: string }[];
}

export interface DbDisbursal {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  state: string;
  district: string;
  scheme: string;
  amount: number;
  status: "pending" | "processed" | "failed" | "retry_queued";
  transactionId: string;
  date: string;
  bankReference: string;
  bankName: string;
  accountLast4: string;
  processedAt?: string;
  failureReason?: string;
  remark?: string;
}

export interface GrievanceMessage {
  id: string;
  author: "student" | "admin" | "support";
  text: string;
  at: string;
}

export interface DbGrievance {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  state: string;
  district: string;
  subject: string;
  description: string;
  category?: string;
  status: "open" | "in_progress" | "resolved" | "closed" | "escalated";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdated: string;
  response?: string;
  needsAssistance?: boolean;
  assistanceType?: string;
  attachments?: { id: string; name: string; size: number }[];
  messages: GrievanceMessage[];
  adminRemark?: string;
}

export interface OcrField {
  label: string;
  value: string;
}

export interface DbVaultDoc {
  id: string;
  studentId: string;
  name: string;
  size: number;
  type: string;
  extractedText: string;
  originalText: string;
  fields: OcrField[];
  uploadedAt: string;
  status: "processing" | "review" | "saved";
  aiScore: number;
  edited: boolean;
}

export interface DbAdminNote {
  id: string;
  studentId: string;
  kind: "note" | "email" | "sms" | "whatsapp";
  subject?: string;
  text: string;
  at: string;
  by: string;
}

export interface DbApprovalEvent {
  id: string;
  userId: string;
  userName: string;
  action: "approved" | "rejected";
  reason?: string;
  by: string;
  at: string;
}

export interface DbAnalytics {
  baseline: typeof seedAnalytics;
  deltas: {
    applications: number;
    verified: number;
    selected: number;
    disbursed: number;
    pending: number;
    rejected: number;
    disbursedAmount: number;
  };
}

export interface DbState {
  version: number;
  users: DbUser[];
  students: Student[];
  schemes: Scheme[];
  applications: DbApplication[];
  disbursals: DbDisbursal[];
  grievances: DbGrievance[];
  notifications: Notification[];
  auditLog: AuditEntry[];
  vaultDocs: DbVaultDoc[];
  adminNotes: DbAdminNote[];
  approvalEvents: DbApprovalEvent[];
  analytics: DbAnalytics;
}

/* ---------------- Constants ---------------- */
const DB_KEY = "udaan_db_v1";
const SCHEMA_VERSION = 1;
/** Tracks which legacy LocalStorage keys have already been migrated (declared early so resetDb can use it). */
const MIGRATED_KEY = "udaan_db_migrated_v1";

export const today = () => new Date().toISOString().slice(0, 10);
export const nowIso = () => new Date().toISOString();
export const uid = (p = "id") =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/* ---------------- Seed ---------------- */
const mapAppStatus = (s: string): AppStatus =>
  s === "approved" ? "selected" : (s as AppStatus);

function seedState(): DbState {
  const applications: DbApplication[] = seedApplications.map((a) => ({
    id: a.id,
    studentId: a.studentId,
    studentName: a.studentName,
    schemeId: a.schemeId,
    schemeName: a.schemeName,
    state: a.state,
    district: (a as any).district ?? "",
    category: a.category,
    amount: a.amount,
    status: mapAppStatus(a.status),
    submittedDate: a.submittedDate,
    lastUpdated: a.lastUpdated,
    documents: a.documents.map((d) => ({
      id: d.id,
      name: d.name,
      status: d.status === "missing" ? "missing" : d.status,
      aiScore: d.aiScore,
    })),
    aiFlags: a.aiFlags.map((f) => ({
      id: f.id,
      severity: f.severity,
      message: f.plainLanguageMessage || f.message,
      suggestion: f.suggestion,
    })),
    deficiencyNotices: a.deficiencyNotices.map((n) => ({
      id: n.id,
      message: n.message,
      plainLanguageMessage: n.plainLanguageMessage,
      resolved: n.resolved,
      issuedDate: n.issuedDate,
    })),
    plainReason: a.plainReason,
    draftProgress: a.draftProgress ?? 0,
    draftLastSaved: a.draftLastSaved,
    enrolmentConfirmed: a.enrolmentConfirmed ?? false,
    attendancePercentage: a.attendancePercentage,
    progressReportUploaded: a.progressReportUploaded,
    timeline: [
      {
        id: uid("tl"),
        status: a.status,
        label: String(a.status).replace(/_/g, " "),
        at: a.submittedDate || a.lastUpdated,
      },
    ],
  }));

  const disbursals: DbDisbursal[] = seedDisbursals.map((d) => ({
    id: d.id,
    applicationId: d.applicationId,
    studentId: applications.find((a) => a.id === d.applicationId)?.studentId ?? "",
    studentName: d.studentName,
    state: applications.find((a) => a.id === d.applicationId)?.state ?? "",
    district: "",
    scheme: applications.find((a) => a.id === d.applicationId)?.schemeName ?? "",
    amount: d.amount,
    status: d.status === "processed" ? "processed" : d.status === "failed" ? "failed" : "pending",
    transactionId: d.transactionId,
    date: d.date,
    bankReference: d.bankReference,
    bankName: "Bank of India",
    accountLast4: "XXXX",
  }));

  const grievances: DbGrievance[] = seedGrievances.map((g) => ({
    id: g.id,
    studentId: g.studentId,
    studentName: g.studentName,
    studentEmail: `${String(g.studentName).toLowerCase().replace(/\s+/g, ".")}@student.in`,
    state: applications.find((a) => a.studentId === g.studentId)?.state ?? "",
    district: "",
    subject: g.subject,
    description: g.description,
    status: g.status,
    priority: g.priority,
    createdAt: g.createdAt,
    lastUpdated: g.lastUpdated,
    response: g.response,
    needsAssistance: g.needsAssistance,
    assistanceType: g.assistanceType,
    messages: [
      { id: uid("m"), author: "student", text: g.description, at: g.createdAt },
      ...(g.response
        ? [{ id: uid("m"), author: "admin" as const, text: g.response, at: g.lastUpdated }]
        : []),
    ],
  }));

  return {
    version: SCHEMA_VERSION,
    users: [],
    students: JSON.parse(JSON.stringify(seedStudents)),
    schemes: JSON.parse(JSON.stringify(seedSchemes)),
    applications,
    disbursals,
    grievances,
    notifications: JSON.parse(JSON.stringify(seedNotifications)),
    auditLog: JSON.parse(JSON.stringify(seedAuditLog)),
    vaultDocs: [],
    adminNotes: [],
    approvalEvents: [],
    analytics: { baseline: JSON.parse(JSON.stringify(seedAnalytics)), deltas: { applications: 0, verified: 0, selected: 0, disbursed: 0, pending: 0, rejected: 0, disbursedAmount: 0 } },
  };
}

/* ---------------- Core read/write + pub-sub ---------------- */
let cache: DbState | null = null;
const listeners = new Set<() => void>();

export function getDb(): DbState {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DbState;
      if (parsed && parsed.version === SCHEMA_VERSION && Array.isArray(parsed.applications)) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    /* corrupted → reseed */
  }
  cache = seedState();
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
  } catch {
    /* storage full — keep in memory */
  }
  return cache;
}

function notify() {
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      /* ignore */
    }
  });
}

/** Mutate the DB inside `fn`; result is persisted to LocalStorage and all subscribers re-render. */
export function mutateDb(fn: (db: DbState) => void): DbState {
  const db = getDb();
  fn(db);
  cache = { ...db };
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
  } catch {
    /* quota exceeded — data stays in memory this session */
  }
  notify();
  return cache;
}

export function resetDb() {
  // Also drop the legacy keys so a reset truly starts from seed data.
  for (const k of [
    "auth_registered_users_v1",
    "ocr_vault_documents_v3",
    "student_scholarship_tracker_v1",
    "student_grievances_v1",
    "admin_dashboard_apps_v1",
    "admin_screening_apps_v1",
    "admin_disbursal_v1",
    "admin_grievances_v1",
    "admin_audit_log_v1",
    "admin_dashboard_audit_v1",
    "admin_screening_audit_v1",
    "admin_disbursal_audit_v1",
    "admin_grievances_audit_v1",
    "admin_communication_log_v1",
    MIGRATED_KEY,
  ]) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  consumed.clear();
  localStorage.removeItem(DB_KEY);
  cache = null;
  getDb();
  notify();
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** React hook — re-renders the component whenever the DB changes. */
export function useDb(): DbState {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return getDb();
}

/* ---------------- Helpers ---------------- */
export const APP_NEXT_STATUS: Record<string, AppStatus[]> = {
  draft: ["submitted"],
  submitted: ["under_scrutiny", "screening", "rejected"],
  under_scrutiny: ["screening", "more_info_required", "selected", "rejected"],
  screening: ["selected", "rejected", "more_info_required", "waitlisted"],
  more_info_required: ["under_scrutiny", "screening", "rejected"],
  waitlisted: ["selected", "rejected"],
  selected: ["sanctioned"],
  sanctioned: ["disbursal_pending", "disbursed"],
  disbursal_pending: ["disbursed"],
  disbursed: [],
  rejected: [],
};

export const APP_LABELS: Record<string, string> = {
  submitted: "Submit",
  under_scrutiny: "Start Scrutiny",
  screening: "Move to Screening",
  selected: "Select",
  rejected: "Reject",
  more_info_required: "Request Info",
  waitlisted: "Waitlist",
  sanctioned: "Sanction",
  disbursal_pending: "Queue Disbursal",
  disbursed: "Mark Disbursed",
};

export function pushAudit(
  entry: { adminId: string; adminName: string; action: string; applicationId: string; studentName: string; details: string },
) {
  mutateDb((db) => {
    db.auditLog.unshift({
      id: uid("AUD"),
      timestamp: nowIso(),
      ...entry,
    });
    db.auditLog = db.auditLog.slice(0, 500);
  });
}

export function pushNotification(n: {
  userId: string;
  type: Notification["type"];
  title: string;
  message: string;
}) {
  mutateDb((db) => {
    db.notifications.unshift({
      id: uid("NOTIF"),
      read: false,
      createdAt: nowIso(),
      smsSent: true,
      emailSent: true,
      ...n,
    } as Notification);
  });
}

/** Update an application's workflow status + sync student-facing views. */
export function setApplicationStatus(
  appId: string,
  status: AppStatus,
  opts: { actor: string; remark?: string; plainReason?: string } = {},
) {
  mutateDb((db) => {
    const app = db.applications.find((a) => a.id === appId);
    if (!app) return;
    const prev = app.status;
    app.status = status;
    app.lastUpdated = today();
    if (opts.remark) app.adminRemark = opts.remark;
    if (opts.plainReason) app.plainReason = opts.plainReason;
    app.timeline.push({
      id: uid("tl"),
      status,
      label: status.replace(/_/g, " "),
      at: nowIso(),
      note: opts.remark,
    });

    const d = db.analytics.deltas;
    const isVerifiedish = (s: AppStatus) =>
      ["screening", "selected", "sanctioned", "disbursal_pending", "disbursed"].includes(s);
    const wasVerifiedish = isVerifiedish(prev);
    const isVerifiedNow = isVerifiedish(status);
    if (!wasVerifiedish && isVerifiedNow) d.verified += 1;
    if (prev !== "selected" && status === "selected") d.selected += 1;
    if (prev !== "rejected" && status === "rejected") {
      d.rejected += 1;
      d.pending -= 1;
    }
    if (["submitted", "under_scrutiny", "screening", "more_info_required"].includes(status)) {
      if (!["submitted", "under_scrutiny", "screening", "more_info_required"].includes(prev)) d.pending += 1;
    } else if (["submitted", "under_scrutiny", "screening", "more_info_required"].includes(prev)) {
      d.pending -= 1;
    }

    db.auditLog.unshift({
      id: uid("AUD"),
      adminId: opts.actor,
      adminName: opts.actor,
      action: `STATUS ${prev.replace(/_/g, " ")} → ${status.replace(/_/g, " ")}`,
      applicationId: app.id,
      studentName: app.studentName,
      details: opts.remark ?? `Updated by ${opts.actor}`,
      timestamp: nowIso(),
    } as AuditEntry);

    db.notifications.unshift({
      id: uid("NOTIF"),
      userId: app.studentId,
      type: status === "disbursed" ? "disbursal" : "status_change",
      title: `Application ${appId}: ${status.replace(/_/g, " ")}`,
      message:
        opts.plainReason ??
        opts.remark ??
        `Your application for ${app.schemeName} is now "${status.replace(/_/g, " ")}".`,
      read: false,
      createdAt: nowIso(),
      smsSent: true,
      emailSent: true,
    } as Notification);
  });
}

/** Queue (or update) a disbursal when an application is sanctioned/queued. */
export function ensureDisbursalFor(appId: string) {
  mutateDb((db) => {
    const app = db.applications.find((a) => a.id === appId);
    if (!app) return;
    if (db.disbursals.some((d) => d.applicationId === appId)) return;
    db.disbursals.unshift({
      id: uid("DIS"),
      applicationId: app.id,
      studentId: app.studentId,
      studentName: app.studentName,
      state: app.state,
      district: app.district,
      scheme: app.schemeName,
      amount: app.amount,
      status: "pending",
      transactionId: `TXN-${new Date().getFullYear()}-${String(db.disbursals.length + 1).padStart(4, "0")}`,
      date: today(),
      bankReference: "Scheduled via DBT",
      bankName: "Bank of India",
      accountLast4: "XXXX",
    });
  });
}

/** Mark the disbursal + application as paid once payment is processed. */
export function markDisbursalProcessed(disbursalId: string, actor: string) {
  mutateDb((db) => {
    const d = db.disbursals.find((x) => x.id === disbursalId);
    if (!d) return;
    d.status = "processed";
    d.processedAt = nowIso();
    d.bankReference = `${d.bankName.split(" ")[0]}/NEFT/${Math.floor(10000 + Math.random() * 89999)}`;

    const app = db.applications.find((a) => a.id === d.applicationId);
    if (app && app.status !== "disbursed") {
      app.status = "disbursed";
      app.lastUpdated = today();
      app.timeline.push({ id: uid("tl"), status: "disbursed", label: "disbursed", at: nowIso() });
      db.analytics.deltas.disbursed += 1;
      db.analytics.deltas.disbursedAmount += d.amount;
    }
    db.notifications.unshift({
      id: uid("NOTIF"),
      userId: d.studentId,
      type: "disbursal",
      title: `Scholarship amount credited`,
      message: `₹${d.amount.toLocaleString("en-IN")} for ${d.scheme} has been credited to your bank account (Ref: ${d.bankReference}).`,
      read: false,
      createdAt: nowIso(),
      smsSent: true,
      emailSent: true,
    } as Notification);
    db.auditLog.unshift({
      id: uid("AUD"),
      adminId: actor,
      adminName: actor,
      action: "PAYMENT PROCESSED",
      applicationId: d.applicationId,
      studentName: d.studentName,
      details: `Transaction ${d.transactionId} — ₹${d.amount.toLocaleString("en-IN")}`,
      timestamp: nowIso(),
    } as AuditEntry);
  });
}

/* ---------------- Users ---------------- */
export function upsertUsers(users: DbUser[]) {
  mutateDb((db) => {
    for (const u of users) {
      const i = db.users.findIndex((x) => x.email.toLowerCase() === u.email.toLowerCase());
      if (i >= 0) {
        // never downgrade an approval that already happened locally
        const existing = db.users[i];
        if (existing.approvalStatus === "approved" && u.approvalStatus !== "approved") continue;
        db.users[i] = { ...existing, ...u };
      } else db.users.push(u);
    }
  });
}

export function registerStudent(data: Partial<Student> & { name: string; email: string; password: string }): DbUser {
  const id = `stu_${Date.now().toString(36)}`;
  const user: DbUser = {
    id,
    role: "student",
    name: data.name,
    email: data.email.toLowerCase(),
    password: data.password,
    state: data.state,
    district: data.district,
    approvalStatus: "pending",
    createdAt: nowIso(),
  };
  mutateDb((db) => {
    db.users.push(user);
    const studentRecord: Student = {
      ...(JSON.parse(JSON.stringify(db.students[0])) as Student),
      id,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone ?? "",
      aadharNumber: data.aadharNumber ?? "",
      stCertificateNumber: data.stCertificateNumber ?? "",
      tribeName: data.tribeName ?? "",
      state: data.state ?? "",
      district: data.district ?? "",
      familyIncome: Number(data.familyIncome ?? 0),
      bankAccountNumber: data.bankAccountNumber ?? "",
      bankName: data.bankName ?? "",
      ifscCode: data.ifscCode ?? "",
      courseName: data.courseName ?? "",
      courseLevel: data.courseLevel ?? "",
      institution: data.institution ?? "",
      yearOfStudy: Number(data.yearOfStudy ?? 1),
      guardianName: data.guardianName ?? "",
      guardianRelation: data.guardianRelation ?? "",
      guardianPhone: data.guardianPhone ?? "",
      guardianEmail: data.guardianEmail ?? "",
      documentVault: [],
      bankVerified: false,
      enrolmentConfirmed: false,
    };
    db.students.push(studentRecord);
  });
  return user;
}

export function approveUser(userId: string, actor: string, reason?: string, action: "approved" | "rejected" = "approved") {
  mutateDb((db) => {
    const u = db.users.find((x) => x.id === userId);
    if (!u) return;
    u.approvalStatus = action;
    u.approvedBy = actor;
    u.approvedAt = nowIso();
    if (reason) u.rejectionReason = reason;
    db.approvalEvents.unshift({
      id: uid("APPR"),
      userId: u.id,
      userName: u.name,
      action,
      reason,
      by: actor,
      at: nowIso(),
    });
    db.notifications.unshift({
      id: uid("NOTIF"),
      userId: u.id,
      type: "general",
      title: action === "approved" ? "Account approved" : "Account rejected",
      message:
        action === "approved"
          ? u.role === "student"
            ? "Your student account has been approved by the admin. You can now sign in and apply for scholarships."
            : "Your admin account has been approved by the Government. You can now sign in."
          : `Your account was rejected. Reason: ${reason ?? "Not specified"}`,
      read: false,
      createdAt: nowIso(),
    } as Notification);
    db.auditLog.unshift({
      id: uid("AUD"),
      adminId: actor,
      adminName: actor,
      action: `ACCOUNT ${action.toUpperCase()}`,
      applicationId: "-",
      studentName: u.name,
      details: `${u.role} account <${u.email}> ${action} by ${actor}`,
      timestamp: nowIso(),
    } as AuditEntry);
  });
}

/* ---------------- Applications ---------------- */
export function createApplication(studentId: string, schemeId: string): DbApplication | null {
  const db = getDb();
  const student = db.students.find((s) => s.id === studentId);
  const scheme = db.schemes.find((s) => s.id === schemeId);
  if (!student || !scheme) return null;
  const app: DbApplication = {
    id: `APP-${new Date().getFullYear()}-${String(db.applications.length + 1).padStart(4, "0")}`,
    studentId,
    studentName: student.name,
    schemeId: scheme.id,
    schemeName: scheme.name,
    state: student.state,
    district: student.district,
    category: student.tribeName ? "General ST" : "General ST",
    amount: scheme.amount,
    status: "draft",
    submittedDate: today(),
    lastUpdated: today(),
    documents: [],
    aiFlags: [],
    deficiencyNotices: [],
    draftProgress: 10,
    draftLastSaved: nowIso(),
    enrolmentConfirmed: false,
    timeline: [{ id: uid("tl"), status: "draft", label: "draft created", at: nowIso() }],
  };
  mutateDb((d) => d.applications.unshift(app));
  return app;
}

export function updateApplication(appId: string, patch: Partial<DbApplication>) {
  mutateDb((db) => {
    const app = db.applications.find((a) => a.id === appId);
    if (!app) return;
    Object.assign(app, patch);
    app.lastUpdated = today();
    app.draftLastSaved = nowIso();
  });
}

export function submitApplication(appId: string) {
  const db = getDb();
  const app = db.applications.find((a) => a.id === appId);
  if (!app) return;
  mutateDb((d) => {
    const a = d.applications.find((x) => x.id === appId)!;
    a.status = "submitted";
    a.submittedDate = today();
    a.lastUpdated = today();
    a.draftProgress = 100;
    a.timeline.push({ id: uid("tl"), status: "submitted", label: "submitted", at: nowIso() });
    d.analytics.deltas.applications += 1;
    d.analytics.deltas.pending += 1;
    d.notifications.unshift({
      id: uid("NOTIF"),
      userId: a.studentId,
      type: "status_change",
      title: "Application submitted",
      message: `Your application (${a.id}) for ${a.schemeName} has been submitted for scrutiny.`,
      read: false,
      createdAt: nowIso(),
    } as Notification);
  });
}

/* ---------------- Vault docs ---------------- */
export function addVaultDoc(studentId: string, doc: Omit<DbVaultDoc, "studentId">) {
  mutateDb((db) => db.vaultDocs.unshift({ ...doc, studentId }));
}
export function updateVaultDoc(id: string, patch: Partial<DbVaultDoc>) {
  mutateDb((db) => {
    const d = db.vaultDocs.find((x) => x.id === id);
    if (d) Object.assign(d, patch);
  });
}
export function deleteVaultDoc(id: string) {
  mutateDb((db) => {
    db.vaultDocs = db.vaultDocs.filter((x) => x.id !== id);
  });
}

/* ---------------- Grievances ---------------- */
export function addGrievance(g: DbGrievance) {
  mutateDb((db) => db.grievances.unshift(g));
}
export function updateGrievance(id: string, patch: Partial<DbGrievance>, addMsg?: GrievanceMessage) {
  mutateDb((db) => {
    const g = db.grievances.find((x) => x.id === id);
    if (!g) return;
    Object.assign(g, patch);
    g.lastUpdated = nowIso();
    if (addMsg) g.messages.push(addMsg);
    if (patch.status && patch.status !== "open") {
      db.notifications.unshift({
        id: uid("NOTIF"),
        userId: g.studentId,
        type: "general",
        title: `Grievance ${g.id} → ${patch.status.replace("_", " ")}`,
        message: g.response ?? `Your ticket "${g.subject}" status is now "${patch.status.replace("_", " ")}".`,
        read: false,
        createdAt: nowIso(),
      } as Notification);
    }
  });
}

/* ---------------- Notifications ---------------- */
export function markNotificationRead(id: string) {
  mutateDb((db) => {
    const n = db.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  });
}
export function markAllNotificationsRead(userId: string) {
  mutateDb((db) => {
    db.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  });
}

/* ---------------- Profile ---------------- */
export function updateStudentProfile(studentId: string, patch: Partial<Student>) {
  mutateDb((db) => {
    const s = db.students.find((x) => x.id === studentId);
    if (s) Object.assign(s, patch);
    const u = db.users.find((x) => x.id === studentId);
    if (u && patch.name) u.name = patch.name;
  });
}

/* ---------------- Analytics ---------------- */
export function computeAnalytics(db: DbState): typeof seedAnalytics {
  const b = db.analytics.baseline;
  const d = db.analytics.deltas;
  const liveApps = db.applications.filter((a) => a.status !== "draft");

  const stateMap = new Map<string, { applications: number; selected: number; disbursed: number }>();
  for (const row of b.stateWiseData) {
    stateMap.set(row.state, { ...row });
  }
  for (const a of liveApps) {
    const key = a.state && stateMap.has(a.state) ? a.state : "Others";
    const row = stateMap.get(key)!;
    row.applications += 1;
    if (["selected", "sanctioned", "disbursal_pending", "disbursed"].includes(a.status)) row.selected += 1;
    if (a.status === "disbursed") row.disbursed += 1;
  }

  const catMap = new Map<string, number>();
  for (const row of b.categoryWiseData) catMap.set(row.category, row.count);
  for (const a of liveApps) {
    const key = a.category && catMap.has(a.category) ? a.category : "General ST";
    catMap.set(key, (catMap.get(key) ?? 0) + 1);
  }

  const budget = b.budgetData.map((row) => {
    const extra = liveApps
      .filter((a) => a.status === "disbursed" && a.schemeName === row.scheme)
      .reduce((s, a) => s + a.amount, 0);
    return {
      ...row,
      disbursed: row.disbursed + extra,
      remaining: Math.max(0, row.allocated - row.disbursed - extra),
    };
  });

  const monthly = b.monthlyTrend.map((m) => ({ ...m }));
  const last = monthly[monthly.length - 1];
  const newSubs = liveApps.filter((a) => a.submittedDate >= "2026-01-01").length;
  const newProc = liveApps.filter((a) =>
    ["selected", "sanctioned", "disbursal_pending", "disbursed", "rejected"].includes(a.status),
  ).length;
  if (last) {
    monthly[monthly.length - 1] = {
      ...last,
      applications: last.applications + newSubs,
      processed: last.processed + newProc,
    };
  }

  return {
    totalApplications: b.totalApplications + d.applications,
    verified: b.verified + d.verified,
    selected: b.selected + d.selected,
    disbursed: b.disbursed + d.disbursed,
    pending: b.pending + d.pending,
    rejected: b.rejected + d.rejected,
    stateWiseData: [...stateMap.values()],
    categoryWiseData: [...catMap.entries()].map(([category, count]) => ({ category, count })),
    schemePerformance: b.schemePerformance,
    budgetData: budget,
    monthlyTrend: monthly,
  };
}

/* ---------------- Legacy-key migration ---------------- */
/**
 * One-time (per key) migration of the old scattered LocalStorage keys into
 * the unified DB. Each legacy key is consumed exactly once — after that the
 * pages read/write only `udaan_db_v1`, so there is no risk of overwriting
 * newer unified data with stale copies.
 */
const MIGRATED_KEY = "udaan_db_migrated_v1";

function safeParse<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const consumed = new Set<string>(safeParse<string[]>(MIGRATED_KEY) ?? []);
function markConsumed(key: string) {
  consumed.add(key);
  try {
    localStorage.setItem(MIGRATED_KEY, JSON.stringify([...consumed]));
  } catch {
    /* ignore */
  }
}
function takeLegacy<T>(key: string): T | null {
  if (consumed.has(key)) return null;
  const data = safeParse<T>(key);
  markConsumed(key);
  return data;
}

export function migrateLegacyKeys() {
  getDb(); // ensure DB exists first

  // 1. Registered auth users → db.users
  const reg = takeLegacy<any[]>("auth_registered_users_v1");
  if (reg?.length) {
    upsertUsers(
      reg.map((r) => ({
        id: r.id,
        role: "student" as const,
        name: r.name,
        email: String(r.email).toLowerCase(),
        password: r.password,
        state: r.state,
        approvalStatus: "pending" as ApprovalStatus,
        createdAt: nowIso(),
      })),
    );
  }

  // 2. OCR vault docs → db.vaultDocs (assigned to first demo student)
  const ocr = takeLegacy<any[]>("ocr_vault_documents_v3");
  if (ocr?.length) {
    mutateDb((d) => {
      for (const o of ocr) {
        if (d.vaultDocs.some((v) => v.id === o.id)) continue;
        d.vaultDocs.push({
          id: o.id,
          studentId: d.students[0]?.id ?? "stu-001",
          name: o.name,
          size: o.size ?? 0,
          type: o.type ?? "application/pdf",
          extractedText: o.extractedText ?? "",
          originalText: o.originalText ?? o.extractedText ?? "",
          fields: o.fields ?? [],
          uploadedAt: o.uploadedAt ?? nowIso(),
          status: "saved",
          aiScore: o.aiScore ?? 0,
          edited: !!o.edited,
        });
      }
    });
  }

  // 3. Student tracker apps (legacy) → merge edits into matching applications
  const legacyTracker = takeLegacy<any[]>("student_scholarship_tracker_v1");
  if (legacyTracker?.length) {
    mutateDb((d) => {
      for (const t of legacyTracker) {
        const app = d.applications.find((a) => a.id === t.id);
        if (!app) continue;
        if (Array.isArray(t.documents)) {
          app.documents = t.documents.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            status: doc.status,
            aiScore: doc.aiScore ?? 0,
          }));
        }
        if (t.enrolmentConfirmed) app.enrolmentConfirmed = true;
        if (typeof t.draftProgress === "number" && t.draftProgress > app.draftProgress)
          app.draftProgress = t.draftProgress;
      }
    });
  }

  // 4. Student grievances → db.grievances
  const stuGrv = takeLegacy<any[]>("student_grievances_v1");
  if (stuGrv?.length) {
    mutateDb((d) => {
      for (const g of stuGrv) {
        if (d.grievances.some((x) => x.id === g.id)) continue;
        const student = d.students[0];
        d.grievances.unshift({
          id: g.id,
          studentId: student?.id ?? "stu-001",
          studentName: student?.name ?? "Student",
          studentEmail: student?.email ?? "",
          state: student?.state ?? "",
          district: student?.district ?? "",
          subject: g.subject,
          description: g.description,
          status: g.status,
          priority: g.priority,
          createdAt: g.createdAt,
          lastUpdated: g.updatedAt ?? g.createdAt,
          response: g.response,
          needsAssistance: g.needsAssistance,
          assistanceType: g.assistanceType,
          attachments: g.attachments ?? [],
          messages: (g.messages ?? []).map((m: any) => ({
            ...m,
            author: m.author === "support" ? ("admin" as const) : (m.author as any),
          })),
        });
      }
    });
  }

  // 5. Admin dashboard / screening app mutations → newest wins per application
  const dashApps = takeLegacy<any[]>("admin_dashboard_apps_v1");
  const scrApps = takeLegacy<any[]>("admin_screening_apps_v1");
  const adminAppMaps: Record<string, any>[] = [];
  if (dashApps?.length) adminAppMaps.push(...dashApps);
  if (scrApps?.length) adminAppMaps.push(...scrApps);
  if (adminAppMaps.length) {
    mutateDb((d) => {
      for (const t of adminAppMaps) {
        const app = d.applications.find((a) => a.id === t.id);
        if (!app) continue;
        const newer = (t.lastUpdated ?? "") >= (app.lastUpdated ?? "");
        if (newer && t.status && t.status !== app.status) {
          app.status = t.status as AppStatus;
          app.lastUpdated = t.lastUpdated;
          if (t.adminRemark) app.adminRemark = t.adminRemark;
          app.timeline.push({
            id: uid("tl"),
            status: app.status,
            label: String(app.status).replace(/_/g, " "),
            at: nowIso(),
            note: "migrated from legacy admin queue",
          });
        }
      }
    });
  }

  // 6. Admin disbursals → db.disbursals
  const adminDisb = takeLegacy<any[]>("admin_disbursal_v1");
  if (adminDisb?.length) {
    mutateDb((d) => {
      for (const x of adminDisb) {
        const existing = d.disbursals.find((y) => y.id === x.id);
        if (!existing) d.disbursals.unshift(x);
        else if (x.status === "processed" && existing.status !== "processed") {
          Object.assign(existing, x);
        }
      }
    });
  }

  // 7. Admin grievances → db.grievances
  const adminGrv = takeLegacy<any[]>("admin_grievances_v1");
  if (adminGrv?.length) {
    mutateDb((d) => {
      for (const x of adminGrv) {
        const existing = d.grievances.find((y) => y.id === x.id);
        if (!existing) d.grievances.unshift(x);
        else if ((x.lastUpdated ?? "") > (existing.lastUpdated ?? "")) {
          Object.assign(existing, x);
        }
      }
    });
  }

  // 8. Per-page audit logs → db.auditLog
  const perPageAudit = [
    "admin_audit_log_v1",
    "admin_dashboard_audit_v1",
    "admin_screening_audit_v1",
    "admin_disbursal_audit_v1",
    "admin_grievances_audit_v1",
    "admin_communication_log_v1",
  ];
  const collected: AuditEntry[] = [];
  for (const k of perPageAudit) {
    const arr = takeLegacy<any[]>(k);
    if (!arr?.length) continue;
    for (const e of arr) {
      collected.push({
        id: e.id ?? uid("AUD"),
        adminId: e.actor ?? "Admin",
        adminName: e.actor ?? "Admin",
        action: e.action ?? "",
        applicationId: e.target ?? "-",
        studentName: e.studentName ?? "",
        details: e.remark ?? e.message ?? e.subject ?? "",
        timestamp: e.at ?? e.timestamp ?? nowIso(),
      });
    }
  }
  if (collected.length) {
    mutateDb((d) => {
      d.auditLog = [...collected, ...d.auditLog].slice(0, 500);
    });
  }
}

/* ---------------- Public store object ---------------- */
export const localDb = {
  getDb,
  mutateDb,
  subscribe,
  useDb,
  resetDb,
  migrateLegacyKeys,
  registerStudent,
  approveUser,
  upsertUsers,
  createApplication,
  updateApplication,
  submitApplication,
  setApplicationStatus,
  ensureDisbursalFor,
  markDisbursalProcessed,
  addVaultDoc,
  updateVaultDoc,
  deleteVaultDoc,
  addGrievance,
  updateGrievance,
  markNotificationRead,
  markAllNotificationsRead,
  updateStudentProfile,
  pushAudit,
  pushNotification,
  computeAnalytics,
};

export default localDb;
