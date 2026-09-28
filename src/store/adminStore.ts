// store/adminStore.ts — frontend-only admin data layer with state scoping
import { create } from "zustand";
import type { Application, Scheme, Student } from "../mock/data";
import {
  applications as seedApplications,
  students as seedStudents,
  schemes as seedSchemes,
} from "../mock/data";

const APPS_KEY = "admin_applications_v1";
const SCHEMES_KEY = "admin_schemes_v1";
const AUDIT_KEY = "admin_audit_log_v1";

/* ============================================================
 *  STATE NORMALIZER
 *  Ensures every application has a `state` field. If missing,
 *  pulls from the matching student record. Falls back to a
 *  deterministic value so scoping still works in demo.
 * ============================================================ */
const STATE_POOL = [
  "Maharashtra",
  "Karnataka",
  "Delhi",
  "Gujarat",
  "Tamil Nadu",
];

const enrichWithState = (apps: Application[]): Application[] => {
  return apps.map((a, i) => {
    const anyA = a as any;
    if (anyA.state) return a;

    // try to find state from student record
    const student = seedStudents.find((s) => s.id === (a as any).studentId);
    const stateFromStudent = (student as any)?.state;
    if (stateFromStudent)
      return { ...a, state: stateFromStudent } as Application;

    // deterministic fallback so demo scoping still works
    return { ...a, state: STATE_POOL[i % STATE_POOL.length] } as Application;
  });
};

/* ============================================================
 *  PERSISTENCE
 * ============================================================ */
const loadApps = (): Application[] => {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return enrichWithState([...seedApplications]);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return enrichWithState([...seedApplications]);
    }
    // ensure state present even in stored data
    return enrichWithState(parsed);
  } catch {
    return enrichWithState([...seedApplications]);
  }
};

const saveApps = (apps: Application[]) =>
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));

const loadSchemes = (): Scheme[] => {
  try {
    const raw = localStorage.getItem(SCHEMES_KEY);
    if (!raw) return [...seedSchemes];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [...seedSchemes];
  } catch {
    return [...seedSchemes];
  }
};

const saveSchemes = (schemes: Scheme[]) =>
  localStorage.setItem(SCHEMES_KEY, JSON.stringify(schemes));

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  remark?: string;
}

const loadAudit = (): AuditEntry[] => {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAudit = (list: AuditEntry[]) =>
  localStorage.setItem(AUDIT_KEY, JSON.stringify(list));

/* ============================================================
 *  WORKFLOW
 * ============================================================ */
export const NEXT_STATUS: Record<string, string[]> = {
  submitted: ["under_scrutiny", "screening", "rejected"],
  under_scrutiny: ["screening", "more_info_required", "selected", "rejected"],
  screening: ["selected", "rejected", "more_info_required"],
  more_info_required: ["under_scrutiny", "screening", "rejected"],
  selected: ["sanctioned"],
  sanctioned: ["disbursal_pending", "disbursed"],
  disbursal_pending: ["disbursed"],
  disbursed: [],
  rejected: [],
};

export const LABELS: Record<string, string> = {
  under_scrutiny: "Start Scrutiny",
  screening: "Move to Screening",
  selected: "Select",
  rejected: "Reject",
  more_info_required: "Request Info",
  sanctioned: "Sanction",
  disbursal_pending: "Queue Disbursal",
  disbursed: "Mark Disbursed",
};

/* ============================================================
 *  STORE
 * ============================================================ */
interface GetApplicationsFilters {
  scheme?: string;
  state?: string; // explicit user-selected filter
  status?: string;
  search?: string;
  /** adminState: if set, restrict results to this state
   *  unless the user has explicitly chosen another state filter. */
  adminState?: string;
}

interface AdminState {
  applications: Application[];
  schemes: Scheme[];
  students: Student[];
  auditLog: AuditEntry[];
  hydrated: boolean;

  hydrate: () => void;
  reload: () => void;

  getApplications: (filters?: GetApplicationsFilters) => Application[];

  getStats: (adminState?: string) => {
    totalStudents: number;
    totalApplications: number;
    pendingReview: number;
    selected: number;
    rejected: number;
    flagged: number;
    openGrievances: number;
    disbursedAmount: number;
    byStatus: Record<string, number>;
  };

  updateStatus: (
    appId: string,
    status: string,
    remark?: string,
    actor?: string,
  ) => void;

  bulkUpdateStatus: (
    ids: string[],
    status: string,
    remark: string,
    actor?: string,
  ) => { updated: number; skipped: number };

  resetToSeed: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  applications: [],
  schemes: [],
  students: [],
  auditLog: [],
  hydrated: false,

  hydrate: () => {
    set({
      applications: loadApps(),
      schemes: loadSchemes(),
      students: seedStudents,
      auditLog: loadAudit(),
      hydrated: true,
    });
  },

  reload: () => {
    set({ applications: loadApps(), schemes: loadSchemes() });
  },

  getApplications: (filters = {}) => {
    let list = [...get().applications];
    const { scheme, state, status, search, adminState } = filters;

    /* ---- Location scoping ----
     *  Priority order:
     *  1. If the user explicitly picked a state → use it
     *  2. Otherwise, if adminState is set → restrict to admin's state
     *  3. Otherwise → no scoping (show all)
     */
    const effectiveState = state || adminState;
    if (effectiveState) {
      list = list.filter((a) => (a as any).state === effectiveState);
    }

    if (scheme)
      list = list.filter(
        (a) => (a as any).schemeId === scheme || a.schemeName === scheme,
      );
    if (status) {
      const wanted = status
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (wanted.length) list = list.filter((a) => wanted.includes(a.status));
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.studentName?.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.schemeName?.toLowerCase().includes(q) ||
          String((a as any).state ?? "")
            .toLowerCase()
            .includes(q),
      );
    }
    return list;
  },

  getStats: (adminState) => {
    const apps = adminState
      ? get().applications.filter((a) => (a as any).state === adminState)
      : get().applications;

    const byStatus: Record<string, number> = {};
    let flagged = 0;
    let disbursedAmount = 0;

    for (const a of apps) {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
      flagged += a.aiFlags?.length ?? 0;
      if ((a.status as string) === "disbursed") disbursedAmount += Number(a.amount) || 0;
    }

    return {
      totalStudents: get().students.length,
      totalApplications: apps.length,
      pendingReview: apps.filter((a) =>
        [
          "submitted",
          "under_scrutiny",
          "screening",
          "more_info_required",
        ].includes(a.status),
      ).length,
      selected: apps.filter((a) =>
        ["selected", "sanctioned", "disbursed"].includes(a.status),
      ).length,
      rejected: apps.filter((a) => a.status === "rejected").length,
      flagged,
      openGrievances: 0,
      disbursedAmount,
      byStatus,
    };
  },

  updateStatus: (appId, status, remark, actor = "Admin") => {
    const apps = get().applications.map((a) =>
      a.id === appId
        ? {
            ...a,
            status: status as Application["status"],
            lastUpdated: new Date().toISOString().slice(0, 10),
            adminRemark: remark ?? (a as any).adminRemark,
          }
        : a,
    );
    saveApps(apps);

    const target = apps.find((a) => a.id === appId);
    const entry: AuditEntry = {
      id: `audit_${Date.now()}`,
      at: new Date().toISOString(),
      actor,
      action: `STATUS → ${status}`,
      target: `${appId} (${target?.studentName ?? "unknown"})`,
      remark,
    };
    const auditLog = [entry, ...get().auditLog];
    saveAudit(auditLog);

    set({ applications: apps, auditLog });
  },

  bulkUpdateStatus: (ids, status, remark, actor = "Admin") => {
    const allowed = new Set(ids);
    let updated = 0;
    let skipped = 0;
    const now = new Date().toISOString().slice(0, 10);

    const apps = get().applications.map((a) => {
      if (!allowed.has(a.id)) return a;
      const valid = NEXT_STATUS[a.status] ?? [];
      if (!valid.includes(status)) {
        skipped++;
        return a;
      }
      updated++;
      return {
        ...a,
        status: status as Application["status"],
        lastUpdated: now,
        adminRemark: remark,
      };
    });

    saveApps(apps);

    const entry: AuditEntry = {
      id: `audit_${Date.now()}`,
      at: new Date().toISOString(),
      actor,
      action: `BULK → ${status} (${updated} updated, ${skipped} skipped)`,
      target: ids.join(", "),
      remark,
    };
    const auditLog = [entry, ...get().auditLog];
    saveAudit(auditLog);

    set({ applications: apps, auditLog });
    return { updated, skipped };
  },

  resetToSeed: () => {
    const enriched = enrichWithState([...seedApplications]);
    saveApps(enriched);
    saveSchemes([...seedSchemes]);
    saveAudit([]);
    set({
      applications: enriched,
      schemes: [...seedSchemes],
      auditLog: [],
    });
  },
}));
