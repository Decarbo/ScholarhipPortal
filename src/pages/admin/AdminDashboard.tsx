import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  StatusBadge,
  Button,
  Modal,
  EmptyState,
} from "../../components/ui";
import { useAppStore, useAuthStore } from "../../store";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
  Users,
  Send,
  ShieldAlert,
  LayoutDashboard,
  RotateCcw,
  MapPin,
  History,
} from "lucide-react";

/* ============================================================
 *  LOCAL TYPES
 * ============================================================ */
type AppStatus =
  | "draft"
  | "submitted"
  | "under_scrutiny"
  | "screening"
  | "more_info_required"
  | "selected"
  | "sanctioned"
  | "disbursal_pending"
  | "disbursed"
  | "waitlisted"
  | "rejected";

interface DashDoc {
  id: string;
  name: string;
  status: "verified" | "pending" | "flagged" | "missing";
  aiScore: number;
  aiFeedback?: string;
}

interface DashFlag {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  plainLanguageMessage: string;
  suggestion?: string;
  createdAt: string;
}

interface DashApp {
  id: string;
  studentId: string;
  studentName: string;
  schemeId: string;
  schemeName: string;
  state: string;
  district: string;
  category: string;
  status: AppStatus;
  amount: number;
  submittedDate: string;
  lastUpdated: string;
  documents: DashDoc[];
  aiFlags: DashFlag[];
  plainReason?: string;
  adminRemark?: string;
}

interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  remark?: string;
}

/* ============================================================
 *  LOCAL MOCK DATA — this page only
 * ============================================================ */
const SEED_APPS: DashApp[] = [
  /* ---------- MAHARASHTRA (admin.mh) ---------- */
  {
    id: "ADM-MH-001",
    studentId: "STU-MH-01",
    studentName: "Priya Gond",
    schemeId: "SCH001",
    schemeName: "NFST",
    state: "Maharashtra",
    district: "Mumbai",
    category: "General ST",
    status: "under_scrutiny",
    amount: 31000,
    submittedDate: "2026-01-15",
    lastUpdated: "2026-01-20",
    documents: [
      { id: "d1", name: "ST_Certificate.pdf", status: "verified", aiScore: 97 },
      {
        id: "d2",
        name: "Income_Certificate.pdf",
        status: "pending",
        aiScore: 72,
        aiFeedback: "Income certificate slightly blurry.",
      },
    ],
    aiFlags: [
      {
        id: "f1",
        type: "blurry_image",
        severity: "medium",
        message: "Income certificate image quality is low",
        plainLanguageMessage: "Income certificate is a bit blurry.",
        suggestion: "Re-upload at 300 DPI.",
        createdAt: "2026-01-18",
      },
    ],
  },
  {
    id: "ADM-MH-002",
    studentId: "STU-MH-02",
    studentName: "Rahul Sharma",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    state: "Maharashtra",
    district: "Pune",
    category: "General ST",
    status: "screening",
    amount: 12000,
    submittedDate: "2026-01-12",
    lastUpdated: "2026-01-22",
    documents: [
      { id: "d3", name: "Marksheet.pdf", status: "verified", aiScore: 94 },
      { id: "d4", name: "Bonafide.pdf", status: "verified", aiScore: 91 },
    ],
    aiFlags: [],
  },
  {
    id: "ADM-MH-003",
    studentId: "STU-MH-03",
    studentName: "Anjali Singh",
    schemeId: "SCH003",
    schemeName: "NSTPS",
    state: "Maharashtra",
    district: "Nagpur",
    category: "ST (Female)",
    status: "selected",
    amount: 7500,
    submittedDate: "2025-12-05",
    lastUpdated: "2026-01-15",
    documents: [
      { id: "d5", name: "ST_Certificate.pdf", status: "verified", aiScore: 96 },
    ],
    aiFlags: [],
  },
  {
    id: "ADM-MH-004",
    studentId: "STU-MH-04",
    studentName: "Vikram Patel",
    schemeId: "SCH002",
    schemeName: "NOS",
    state: "Maharashtra",
    district: "Thane",
    category: "General ST",
    status: "rejected",
    amount: 1500000,
    submittedDate: "2025-11-20",
    lastUpdated: "2025-12-28",
    documents: [],
    aiFlags: [],
    plainReason: "Family income exceeds ₹2.5 lakh limit.",
  },

  /* ---------- KARNATAKA (admin.ka) ---------- */
  {
    id: "ADM-KA-001",
    studentId: "STU-KA-01",
    studentName: "Lakshmi Santhal",
    schemeId: "SCH001",
    schemeName: "NFST",
    state: "Karnataka",
    district: "Bengaluru",
    category: "General ST",
    status: "under_scrutiny",
    amount: 31000,
    submittedDate: "2026-01-10",
    lastUpdated: "2026-01-19",
    documents: [
      { id: "d6", name: "ST_Certificate.pdf", status: "verified", aiScore: 98 },
      {
        id: "d7",
        name: "Research_Proposal.pdf",
        status: "verified",
        aiScore: 92,
      },
    ],
    aiFlags: [],
  },
  {
    id: "ADM-KA-002",
    studentId: "STU-KA-02",
    studentName: "Priya Verma",
    schemeId: "SCH002",
    schemeName: "NOS",
    state: "Karnataka",
    district: "Mysuru",
    category: "General ST",
    status: "screening",
    amount: 1500000,
    submittedDate: "2026-01-05",
    lastUpdated: "2026-01-18",
    documents: [
      { id: "d8", name: "Passport.pdf", status: "verified", aiScore: 92 },
      {
        id: "d9",
        name: "Admission_Letter.pdf",
        status: "flagged",
        aiScore: 55,
        aiFeedback: "University ranking missing.",
      },
    ],
    aiFlags: [
      {
        id: "f2",
        type: "missing_field",
        severity: "medium",
        message: "University ranking missing",
        plainLanguageMessage:
          "The admission letter does not show university ranking.",
        suggestion: "Upload QS/THE ranking proof.",
        createdAt: "2026-01-15",
      },
    ],
  },
  {
    id: "ADM-KA-003",
    studentId: "STU-KA-03",
    studentName: "Vikram Patel",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    state: "Karnataka",
    district: "Mangaluru",
    category: "General ST",
    status: "screening",
    amount: 12000,
    submittedDate: "2026-01-14",
    lastUpdated: "2026-01-20",
    documents: [
      { id: "d10", name: "Marksheet.pdf", status: "verified", aiScore: 95 },
      {
        id: "d11",
        name: "Income_Certificate.pdf",
        status: "verified",
        aiScore: 93,
      },
    ],
    aiFlags: [],
  },
  {
    id: "ADM-KA-004",
    studentId: "STU-KA-04",
    studentName: "Sunita Naga",
    schemeId: "SCH003",
    schemeName: "NSTPS",
    state: "Karnataka",
    district: "Hubballi",
    category: "ST (Female)",
    status: "submitted",
    amount: 7500,
    submittedDate: "2026-01-17",
    lastUpdated: "2026-01-21",
    documents: [
      { id: "d12", name: "ST_Certificate.pdf", status: "pending", aiScore: 0 },
    ],
    aiFlags: [
      {
        id: "f3",
        type: "missing_field",
        severity: "high",
        message: "ST certificate not verified",
        plainLanguageMessage: "ST certificate is pending verification.",
        suggestion: "Wait for AI verification.",
        createdAt: "2026-01-21",
      },
    ],
  },
  {
    id: "ADM-KA-005",
    studentId: "STU-KA-05",
    studentName: "Deepa Kurumba",
    schemeId: "SCH001",
    schemeName: "NFST",
    state: "Karnataka",
    district: "Belagavi",
    category: "General ST",
    status: "selected",
    amount: 31000,
    submittedDate: "2026-01-08",
    lastUpdated: "2026-01-16",
    documents: [
      {
        id: "d13",
        name: "ST_Certificate.pdf",
        status: "verified",
        aiScore: 96,
      },
      {
        id: "d14",
        name: "Research_Proposal.pdf",
        status: "verified",
        aiScore: 89,
      },
    ],
    aiFlags: [],
  },
  {
    id: "ADM-KA-006",
    studentId: "STU-KA-06",
    studentName: "Mohan Garo",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    state: "Karnataka",
    district: "Shivamogga",
    category: "General ST",
    status: "disbursed",
    amount: 12000,
    submittedDate: "2025-09-01",
    lastUpdated: "2025-12-10",
    documents: [
      {
        id: "d15",
        name: "ST_Certificate.pdf",
        status: "verified",
        aiScore: 97,
      },
    ],
    aiFlags: [],
  },
  {
    id: "ADM-KA-007",
    studentId: "STU-KA-07",
    studentName: "Rajan Rathwa",
    schemeId: "SCH002",
    schemeName: "NOS",
    state: "Karnataka",
    district: "Kalaburagi",
    category: "General ST",
    status: "rejected",
    amount: 1500000,
    submittedDate: "2025-10-10",
    lastUpdated: "2025-12-01",
    documents: [],
    aiFlags: [],
    plainReason: "Family income exceeds ₹2.5 lakh limit.",
  },

  /* ---------- DELHI ---------- */
  {
    id: "ADM-DL-001",
    studentId: "STU-DL-01",
    studentName: "Meena Khasi",
    schemeId: "SCH002",
    schemeName: "NOS",
    state: "Delhi",
    district: "New Delhi",
    category: "General ST",
    status: "under_scrutiny",
    amount: 1500000,
    submittedDate: "2026-01-11",
    lastUpdated: "2026-01-19",
    documents: [
      { id: "d16", name: "Passport.pdf", status: "verified", aiScore: 94 },
    ],
    aiFlags: [],
  },
  {
    id: "ADM-DL-002",
    studentId: "STU-DL-02",
    studentName: "Kaviti Kondh",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    state: "Delhi",
    district: "New Delhi",
    category: "General ST",
    status: "selected",
    amount: 12000,
    submittedDate: "2025-12-15",
    lastUpdated: "2026-01-12",
    documents: [],
    aiFlags: [],
  },

  /* ---------- GUJARAT ---------- */
  {
    id: "ADM-GJ-001",
    studentId: "STU-GJ-01",
    studentName: "Rajan Rathwa",
    schemeId: "SCH001",
    schemeName: "NFST",
    state: "Gujarat",
    district: "Ahmedabad",
    category: "General ST",
    status: "submitted",
    amount: 31000,
    submittedDate: "2026-01-25",
    lastUpdated: "2026-01-25",
    documents: [],
    aiFlags: [],
  },
];

const SEED_SCHEMES = [
  { id: "SCH001", name: "NFST" },
  { id: "SCH002", name: "NOS" },
  { id: "SCH003", name: "NSTPS" },
  { id: "SCH004", name: "NSTMS" },
];

/* ============================================================
 *  WORKFLOW (local copy)
 * ============================================================ */
const NEXT_STATUS: Record<string, string[]> = {
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

const LABELS: Record<string, string> = {
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

/* ============================================================
 *  STORAGE
 * ============================================================ */
const APPS_KEY = "admin_dashboard_apps_v1";
const AUDIT_KEY = "admin_dashboard_audit_v1";

const loadApps = (): DashApp[] => {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return [...SEED_APPS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEED_APPS];
  } catch {
    return [...SEED_APPS];
  }
};
const saveApps = (apps: DashApp[]) =>
  localStorage.setItem(APPS_KEY, JSON.stringify(apps));

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

const uid = (p = "id") =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const AdminDashboard: React.FC = () => {
  const { addToast } = useAppStore();
  const adminUser = useAuthStore((s) => s.user);
  const adminState = adminUser?.state;

  const [apps, setApps] = useState<DashApp[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* UI state */
  const [filterScheme, setFilterScheme] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<DashApp | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [bulkRemark, setBulkRemark] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  /* Hydrate once */
  useEffect(() => {
    setApps(loadApps());
    setAudit(loadAudit());
    setHydrated(true);
  }, []);

  /* Persist */
  useEffect(() => {
    if (hydrated) saveApps(apps);
  }, [apps, hydrated]);

  useEffect(() => {
    if (hydrated) saveAudit(audit);
  }, [audit, hydrated]);

  /* Auto-lock state for admins with fixed state */
  useEffect(() => {
    if (adminState) setFilterState(adminState);
  }, [adminState]);

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* Clear selection when filters change */
  useEffect(() => {
    setSelectedApps([]);
  }, [filterScheme, filterState, filterStatus, search]);

  /* ---------- Derived ---------- */
  const appsFiltered = useMemo(() => {
    let list = [...apps];
    // scoping: explicit filterState overrides adminState
    const effectiveState = filterState || adminState;
    if (effectiveState) list = list.filter((a) => a.state === effectiveState);
    if (filterScheme) list = list.filter((a) => a.schemeId === filterScheme);
    if (filterStatus) list = list.filter((a) => a.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.studentName.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q) ||
          a.schemeName.toLowerCase().includes(q) ||
          a.state.toLowerCase().includes(q),
      );
    }
    return list;
  }, [apps, filterState, adminState, filterScheme, filterStatus, search]);

  const stats = useMemo(() => {
    const scoped = adminState
      ? apps.filter((a) => a.state === adminState)
      : apps;
    const byStatus: Record<string, number> = {};
    let flagged = 0;
    let disbursedAmount = 0;
    for (const a of scoped) {
      byStatus[a.status] = (byStatus[a.status] ?? 0) + 1;
      flagged += a.aiFlags?.length ?? 0;
      if (a.status === "disbursed") disbursedAmount += Number(a.amount) || 0;
    }
    return {
      totalStudents: new Set(scoped.map((a) => a.studentId)).size,
      totalApplications: scoped.length,
      pendingReview: scoped.filter((a) =>
        [
          "submitted",
          "under_scrutiny",
          "screening",
          "more_info_required",
        ].includes(a.status),
      ).length,
      selected: scoped.filter((a) =>
        ["selected", "sanctioned", "disbursed"].includes(a.status),
      ).length,
      rejected: scoped.filter((a) => a.status === "rejected").length,
      flagged,
      disbursedAmount,
    };
  }, [apps, adminState]);

  const uniqueStates = useMemo(() => {
    const s = new Set<string>();
    for (const a of apps) if (a.state) s.add(a.state);
    return [...s].sort();
  }, [apps]);

  /* ---------- Audit ---------- */
  const pushAudit = (action: string, target: string, remark?: string) => {
    const entry: AuditEntry = {
      id: uid("audit"),
      at: new Date().toISOString(),
      actor: adminUser?.name ?? "Admin",
      action,
      target,
      remark,
    };
    setAudit((prev) => [entry, ...prev].slice(0, 200));
  };

  /* ---------- Actions ---------- */
  const changeStatus = (app: DashApp, status: string, remark?: string) => {
    setBusy(true);
    setTimeout(() => {
      setApps((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status: status as AppStatus,
                lastUpdated: new Date().toISOString().slice(0, 10),
                adminRemark: remark ?? a.adminRemark,
              }
            : a,
        ),
      );
      pushAudit(`STATUS → ${status}`, `${app.id} (${app.studentName})`, remark);
      addToast(
        "success",
        `${app.studentName}'s application → ${status.replace(/_/g, " ")}`,
      );
      setSelectedApp(null);
      setBusy(false);
    }, 300);
  };

  const handleBulkAction = () => {
    if (!bulkRemark.trim()) {
      addToast("warning", "A reason is required for bulk actions");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      let updated = 0;
      let skipped = 0;
      const allowed = new Set(selectedApps);

      setApps((prev) =>
        prev.map((a) => {
          if (!allowed.has(a.id)) return a;
          const valid = NEXT_STATUS[a.status] ?? [];
          if (!valid.includes(bulkAction)) {
            skipped++;
            return a;
          }
          updated++;
          return {
            ...a,
            status: bulkAction as AppStatus,
            lastUpdated: new Date().toISOString().slice(0, 10),
            adminRemark: bulkRemark,
          };
        }),
      );

      pushAudit(
        `BULK → ${bulkAction} (${updated} updated, ${skipped} skipped)`,
        selectedApps.join(", "),
        bulkRemark,
      );

      const msg =
        skipped > 0
          ? `${updated} updated, ${skipped} skipped (invalid transition)`
          : `${updated} applications updated`;
      addToast(updated > 0 ? "success" : "warning", msg);

      setShowBulkModal(false);
      setSelectedApps([]);
      setBulkRemark("");
      setBusy(false);
    }, 300);
  };

  const handleReset = () => {
    if (!confirm("Reset all applications and audit log to demo data?")) return;
    localStorage.removeItem(APPS_KEY);
    localStorage.removeItem(AUDIT_KEY);
    setApps([...SEED_APPS]);
    setAudit([]);
    addToast("info", "Demo data restored");
  };

  const refresh = () => {
    setApps(loadApps());
    setAudit(loadAudit());
    addToast("info", "Refreshed from local storage");
  };

  if (!hydrated) {
    return (
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3' />
          <div className='h-32 bg-slate-200 dark:bg-slate-800 rounded' />
          <div className='h-64 bg-slate-200 dark:bg-slate-800 rounded' />
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5'>
        <div className='flex items-start gap-3'>
          <div className='p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5'>
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight'>
              {t('dashboard.controlCenter')}
            </h1>
            <p className='text-sm text-[#64748B] dark:text-slate-400 mt-1'>
              {t('dashboard.controlSubtitle')}
            </p>
            {adminUser?.name && (
              <p className='text-xs text-[#64748B] dark:text-slate-400 mt-1 flex items-center gap-1 font-mono'>
                <MapPin size={11} className='text-[#0B75A4]' />
                {t('dashboard.signedInAs')} <strong className='font-sans text-[#1D293D] dark:text-slate-200'>{adminUser.name}</strong>
                {adminState ? ` · ${t('dashboard.scopedTo')} ${adminState}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='success'>Frontend-only</Badge>
          <Button
            size='sm'
            variant='outline'
            icon={<History size={14} />}
            onClick={() => setShowAudit(true)}
          >
            {t('dashboard.audit')} ({audit.length})
          </Button>
          <Button
            size='sm'
            variant='outline'
            icon={<RotateCcw size={14} />}
            onClick={handleReset}
          >
            {t('dashboard.resetDemo')}
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3.5'>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider'>
            {t('dashboard.totalApplications')}
          </p>
          <p className='text-2xl font-bold text-[#1D293D] dark:text-white mt-1'>
            {stats.totalApplications}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#F59E0B] uppercase tracking-wider'>
            {t('dashboard.pendingReview')}
          </p>
          <p className='text-2xl font-bold text-[#F59E0B] mt-1'>
            {stats.pendingReview}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#EF4444] uppercase tracking-wider flex items-center gap-1'>
            <ShieldAlert size={12} /> {t('dashboard.aiFlags')}
          </p>
          <p className='text-2xl font-bold text-[#EF4444] mt-1'>
            {stats.flagged}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#009B68] dark:text-emerald-400 uppercase tracking-wider'>
            {tc('status.selected')}
          </p>
          <p className='text-2xl font-bold text-[#009B68] dark:text-emerald-400 mt-1'>
            {stats.selected}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#0B75A4] dark:text-[#1697C5] uppercase tracking-wider'>
            {t('dashboard.registeredStudents')}
          </p>
          <p className='text-2xl font-bold text-[#0B75A4] dark:text-[#1697C5] mt-1'>
            {stats.totalStudents}
          </p>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
        <div className='flex flex-col md:flex-row gap-3'>
          <div className='flex-1 relative'>
            <Search
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]'
            />
            <input
              type='text'
              placeholder={t('dashboard.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className='w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]'
            />
          </div>

          <div className='flex items-center gap-2 flex-wrap sm:flex-nowrap'>
            <select
              value={filterScheme}
              onChange={(e) => setFilterScheme(e.target.value)}
              className='px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0B75A4]'
            >
              <option value=''>{t('dashboard.allSchemes')}</option>
              {SEED_SCHEMES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {adminState ? (
              <div className='px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-200 flex items-center gap-1.5'>
                <MapPin size={12} className='text-[#0B75A4]' />
                <span className='text-[#64748B]'>{tc('common.state')}:</span>
                <strong className='font-semibold'>{adminState}</strong>
              </div>
            ) : (
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className='px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0B75A4]'
              >
                <option value=''>{t('dashboard.allStates')}</option>
                {uniqueStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            )}

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className='px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-200 outline-none focus:ring-2 focus:ring-[#0B75A4]'
            >
              <option value=''>{t('dashboard.allStatuses')}</option>
              {[
                "draft",
                "submitted",
                "under_scrutiny",
                "screening",
                "more_info_required",
                "waitlisted",
                "selected",
                "sanctioned",
                "disbursal_pending",
                "disbursed",
                "rejected",
              ].map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            <Button
              size='sm'
              variant='outline'
              onClick={refresh}
              icon={<RefreshCw size={14} />}
            >
              {tc('actions.refresh')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Action Toolbar */}
      {selectedApps.length > 0 && (
        <div className='flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-[#E6F1F5]/50 dark:bg-slate-800 border border-[#0B75A4]/20 dark:border-slate-700'>
          <span className='text-xs font-bold text-[#0B75A4] dark:text-[#1697C5]'>
            {selectedApps.length} application(s) selected
          </span>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setBulkAction("screening");
                setShowBulkModal(true);
              }}
              icon={<CheckCircle2 size={14} />}
            >
              Move to Screening
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setBulkAction("selected");
                setShowBulkModal(true);
              }}
              icon={<CheckCircle2 size={14} />}
            >
              Select
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                setBulkAction("rejected");
                setShowBulkModal(true);
              }}
              icon={<XCircle size={14} />}
            >
              Reject
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => setSelectedApps([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <Card
        padding={false}
        className='border-[#DEE2E6] dark:border-slate-700 overflow-hidden shadow-xs rounded-xl'
      >
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs'>
            <thead className='bg-[#F8FAFC] dark:bg-slate-800/80 border-b border-[#DEE2E6] dark:border-slate-700 uppercase tracking-wider text-[#475569] dark:text-slate-300 font-semibold'>
              <tr>
                <th className='p-3.5 w-10 text-center'>
                  <input
                    type='checkbox'
                    checked={
                      appsFiltered.length > 0 &&
                      selectedApps.length === appsFiltered.length
                    }
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedApps(appsFiltered.map((a) => a.id));
                      else setSelectedApps([]);
                    }}
                    className='rounded border-[#CBD5E1] text-[#0B75A4] focus:ring-[#0B75A4]'
                  />
                </th>
                <th className='p-3.5'>Applicant</th>
                <th className='p-3.5'>Scheme</th>
                <th className='p-3.5'>State</th>
                <th className='p-3.5'>Status</th>
                <th className='p-3.5'>AI Flags</th>
                <th className='p-3.5 text-right'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[#DEE2E6] dark:divide-slate-800'>
              {appsFiltered.map((app) => (
                <tr
                  key={app.id}
                  className='hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 transition-colors'
                >
                  <td className='p-3.5 text-center'>
                    <input
                      type='checkbox'
                      checked={selectedApps.includes(app.id)}
                      onChange={() =>
                        setSelectedApps((prev) =>
                          prev.includes(app.id)
                            ? prev.filter((x) => x !== app.id)
                            : [...prev, app.id],
                        )
                      }
                      className='rounded border-[#CBD5E1] text-[#0B75A4] focus:ring-[#0B75A4]'
                    />
                  </td>
                  <td className='p-3.5'>
                    <p className='font-bold text-[#1D293D] dark:text-white'>
                      {app.studentName}
                    </p>
                    <p className='text-[11px] font-mono text-[#64748B]'>
                      {app.id}
                    </p>
                  </td>
                  <td className='p-3.5'>
                    <Badge
                      variant='info'
                      className='bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5]'
                    >
                      {app.schemeName}
                    </Badge>
                  </td>
                  <td className='p-3.5 text-[#64748B] dark:text-slate-300 font-medium'>
                    {app.state}
                  </td>
                  <td className='p-3.5'>
                    <StatusBadge status={app.status} />
                  </td>
                  <td className='p-3.5'>
                    {(app.aiFlags?.length || 0) > 0 ? (
                      <span className='inline-flex items-center gap-1 font-semibold text-[#EF4444] dark:text-red-400'>
                        <AlertTriangle size={13} /> {app.aiFlags.length}
                      </span>
                    ) : (
                      <span className='text-[#94A3B8]'>—</span>
                    )}
                  </td>
                  <td className='p-3.5 text-right'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => setSelectedApp(app)}
                      icon={<Eye size={14} />}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {appsFiltered.length === 0 && (
          <div className='py-12'>
            <EmptyState
              icon={<Search size={36} className='text-[#94A3B8]' />}
              title='No applications found'
              description={
                adminState
                  ? `No applications available for ${adminState}. Try resetting demo data.`
                  : "Try adjusting your search criteria or filters."
              }
            />
          </div>
        )}
      </Card>

      {/* Application Detail Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={`Application Overview: ${selectedApp?.id}`}
        size='xl'
      >
        {selectedApp && (
          <div className='space-y-6 font-sans text-[#1D293D] dark:text-slate-100'>
            {/* Metadata */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700'>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  Student Name
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selectedApp.studentName}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  Scheme
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selectedApp.schemeName}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  Location
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selectedApp.district}, {selectedApp.state}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  Grant Amount
                </p>
                <p className='text-sm font-bold font-mono text-[#009B68] mt-0.5'>
                  ₹{Number(selectedApp.amount).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Rejection reason */}
            {selectedApp.status === "rejected" && selectedApp.plainReason && (
              <div className='p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60'>
                <p className='text-xs font-bold text-[#EF4444] mb-1'>
                  Reason for rejection
                </p>
                <p className='text-sm text-[#1D293D] dark:text-slate-300'>
                  {selectedApp.plainReason}
                </p>
              </div>
            )}

            {/* Documents */}
            <div className='space-y-2'>
              <h4 className='text-base font-bold text-[#1D293D] dark:text-white border-b border-[#DEE2E6] dark:border-slate-800 pb-1.5'>
                Submitted Documents
              </h4>
              <div className='space-y-2 pt-1'>
                {(selectedApp.documents || []).length === 0 && (
                  <p className='text-xs text-[#64748B] italic'>
                    No documents attached.
                  </p>
                )}
                {(selectedApp.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DEE2E6] dark:border-slate-700/60'
                  >
                    <div className='flex items-center gap-2.5'>
                      <FileText size={16} className='text-[#0B75A4]' />
                      <div>
                        <span className='text-xs font-bold text-[#1D293D] dark:text-slate-200'>
                          {doc.name}
                        </span>
                        {doc.aiFeedback && (
                          <p className='text-[11px] text-[#64748B] mt-0.5'>
                            {doc.aiFeedback}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='text-xs font-mono text-[#64748B]'>
                        AI: {doc.aiScore ?? 0}%
                      </span>
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Flags */}
            {(selectedApp.aiFlags?.length || 0) > 0 && (
              <div className='space-y-2'>
                <h4 className='text-base font-bold text-[#1D293D] dark:text-white border-b border-[#DEE2E6] dark:border-slate-800 pb-1.5 flex items-center gap-2'>
                  <AlertTriangle size={16} className='text-[#EF4444]' /> AI
                  Verification Flags
                </h4>
                <div className='space-y-2 pt-1'>
                  {selectedApp.aiFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className={`p-3.5 rounded-xl border ${
                        flag.severity === "high"
                          ? "bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800/60"
                          : flag.severity === "medium"
                            ? "bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60"
                            : "bg-[#E6F1F5]/60 dark:bg-blue-950/20 border-[#0B75A4]/20 dark:border-blue-800/60"
                      }`}
                    >
                      <div className='flex items-center gap-2'>
                        <AlertTriangle
                          size={14}
                          className={
                            flag.severity === "high"
                              ? "text-[#EF4444]"
                              : flag.severity === "medium"
                                ? "text-[#F59E0B]"
                                : "text-[#0B75A4]"
                          }
                        />
                        <span className='text-xs font-bold text-[#1D293D] dark:text-slate-200'>
                          {flag.message || flag.plainLanguageMessage}
                        </span>
                      </div>
                      {flag.suggestion && (
                        <p className='text-[11px] text-[#64748B] dark:text-slate-400 mt-1'>
                          💡 {flag.suggestion}
                        </p>
                      )}
                      {flag.createdAt && (
                        <p className='text-[11px] text-[#94A3B8] mt-1 font-mono'>
                          {(flag.type || "").replace(/_/g, " ")} |{" "}
                          {flag.createdAt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workflow transitions */}
            <div className='pt-4 border-t border-[#DEE2E6] dark:border-slate-800 space-y-3'>
              <p className='text-xs font-semibold text-[#64748B] uppercase tracking-wider'>
                Advance Workflow — Current Status:{" "}
                <span className='text-[#0B75A4] dark:text-white font-mono font-bold'>
                  {selectedApp.status.replace(/_/g, " ")}
                </span>
              </p>
              <div className='flex flex-wrap gap-2'>
                {(NEXT_STATUS[selectedApp.status] || []).length === 0 && (
                  <span className='text-xs text-[#94A3B8] italic'>
                    No further workflow transitions available for this status.
                  </span>
                )}
                {(NEXT_STATUS[selectedApp.status] || []).map((next) => (
                  <Button
                    key={next}
                    size='sm'
                    variant={
                      next === "rejected"
                        ? "danger"
                        : ["selected", "sanctioned", "disbursed"].includes(next)
                          ? "primary"
                          : "outline"
                    }
                    disabled={busy}
                    onClick={() =>
                      changeStatus(
                        selectedApp,
                        next,
                        next === "rejected"
                          ? "Rejected after administrative review"
                          : undefined,
                      )
                    }
                  >
                    {LABELS[next] || next}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Action Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title={`Bulk Status Update → ${bulkAction.replace(/_/g, " ")}`}
      >
        <div className='space-y-4 font-sans text-[#1D293D] dark:text-slate-100'>
          <p className='text-xs text-[#64748B] dark:text-slate-300 flex items-center gap-2'>
            <Users size={16} className='text-[#0B75A4]' /> You are updating{" "}
            <strong className='text-[#1D293D] dark:text-white'>{selectedApps.length}</strong> selected application(s) to{" "}
            <strong className='uppercase text-[#0B75A4]'>
              {bulkAction.replace(/_/g, " ")}
            </strong>
            . Invalid workflow transitions will be automatically skipped.
          </p>

          <div className='space-y-1.5'>
            <label className='block text-xs font-semibold text-[#1D293D] dark:text-slate-200'>
              Administrative Reason / Remark (Required)
            </label>
            <textarea
              rows={3}
              value={bulkRemark}
              onChange={(e) => setBulkRemark(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] resize-none'
              placeholder='Provide standard justification for this bulk action...'
            />
          </div>

          <div className='flex gap-2.5 pt-2 justify-end'>
            <Button variant='outline' onClick={() => setShowBulkModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={busy}
              icon={<Send size={14} />}
            >
              {busy ? "Processing..." : "Confirm & Apply"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Audit Modal */}
      <Modal
        isOpen={showAudit}
        onClose={() => setShowAudit(false)}
        title='Admin Audit Log'
        size='lg'
      >
        {audit.length === 0 ? (
          <p className='text-sm text-[#94A3B8] italic'>No actions yet.</p>
        ) : (
          <div className='space-y-2 max-h-[60vh] overflow-y-auto'>
            {audit.map((e) => (
              <div
                key={e.id}
                className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-bold text-[#1D293D] dark:text-slate-200'>
                    {e.action}
                  </span>
                  <span className='text-[10px] text-[#94A3B8] font-mono'>
                    {new Date(e.at).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className='text-xs text-[#64748B] dark:text-slate-400 mt-1'>
                  {e.target} · by <strong className='text-[#1D293D] dark:text-slate-200'>{e.actor}</strong>
                </p>
                {e.remark && (
                  <p className='text-[11px] text-[#64748B] mt-1 italic'>
                    "{e.remark}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
