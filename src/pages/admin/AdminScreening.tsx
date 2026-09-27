import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  StatusBadge,
  Button,
  EmptyState,
  Modal,
} from "../../components/ui";
import { useAppStore, useAuthStore } from "../../store";
import { getLocalizedSchemeName } from "../../utils/localizedData";
import {
  CheckCircle,
  XCircle,
  Users,
  RefreshCw,
  AlertTriangle,
  Eye,
  FileText,
  MapPin,
  RotateCcw,
  Save,
  History,
  Send,
} from "lucide-react";

/* ============================================================
 *  LOCAL TYPES
 * ============================================================ */
type ScreeningStatus =
  | "under_scrutiny"
  | "screening"
  | "selected"
  | "rejected"
  | "waitlisted"
  | "more_info_required";

interface ScreeningDoc {
  id: string;
  name: string;
  status: "verified" | "pending" | "flagged" | "missing";
  aiScore: number;
  aiFeedback?: string;
}

interface ScreeningFlag {
  id: string;
  severity: "low" | "medium" | "high";
  message: string;
  suggestion?: string;
}

interface ScreeningApp {
  id: string;
  studentId: string;
  studentName: string;
  schemeId: string;
  schemeName: string;
  state: string;
  district: string;
  category: string;
  status: ScreeningStatus;
  amount: number;
  submittedDate: string;
  lastUpdated: string;
  documents: ScreeningDoc[];
  aiFlags: ScreeningFlag[];
  adminRemark?: string;
  meritScore?: number; // computed from docs if not set
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
 *  LOCAL MOCK DATA (only this page uses it)
 * ============================================================ */
const SEED_SCREENING_APPS: ScreeningApp[] = [
  /* ---------- MAHARASHTRA (admin.mh) ---------- */
  {
    id: "SCR-MH-001",
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
        severity: "medium",
        message: "Income certificate image quality is low",
        suggestion: "Re-upload at 300 DPI.",
      },
    ],
  },
  {
    id: "SCR-MH-002",
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
    id: "SCR-MH-003",
    studentId: "STU-MH-03",
    studentName: "Anjali Singh",
    schemeId: "SCH003",
    schemeName: "NSTPS",
    state: "Maharashtra",
    district: "Nagpur",
    category: "ST (Female)",
    status: "under_scrutiny",
    amount: 7500,
    submittedDate: "2026-01-18",
    lastUpdated: "2026-01-21",
    documents: [
      { id: "d5", name: "ST_Certificate.pdf", status: "verified", aiScore: 96 },
    ],
    aiFlags: [],
  },

  /* ---------- KARNATAKA (admin.ka) ---------- */
  {
    id: "SCR-KA-001",
    studentId: "STU-KA-01",
    studentName: "Lakshmi Santhal",
    schemeId: "SCH001",
    schemeName: "NFST",
    state: "Karnataka",
    district: "Bengaluru",
    category: "General ST",
    status: "screening",
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
    id: "SCR-KA-002",
    studentId: "STU-KA-02",
    studentName: "Priya Verma",
    schemeId: "SCH002",
    schemeName: "NOS",
    state: "Karnataka",
    district: "Mysuru",
    category: "General ST",
    status: "under_scrutiny",
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
        severity: "medium",
        message: "University ranking missing from admission letter",
        suggestion: "Upload QS/THE ranking proof.",
      },
    ],
  },
  {
    id: "SCR-KA-003",
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
    id: "SCR-KA-004",
    studentId: "STU-KA-04",
    studentName: "Sunita Naga",
    schemeId: "SCH003",
    schemeName: "NSTPS",
    state: "Karnataka",
    district: "Hubballi",
    category: "ST (Female)",
    status: "under_scrutiny",
    amount: 7500,
    submittedDate: "2026-01-17",
    lastUpdated: "2026-01-21",
    documents: [
      { id: "d12", name: "ST_Certificate.pdf", status: "pending", aiScore: 0 },
    ],
    aiFlags: [
      {
        id: "f3",
        severity: "high",
        message: "ST certificate not verified yet",
        suggestion: "Wait for AI verification or re-upload.",
      },
    ],
  },
  {
    id: "SCR-KA-005",
    studentId: "STU-KA-05",
    studentName: "Deepa Kurumba",
    schemeId: "SCH001",
    schemeName: "NFST",
    state: "Karnataka",
    district: "Belagavi",
    category: "General ST",
    status: "screening",
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

  /* ---------- DELHI ---------- */
  {
    id: "SCR-DL-001",
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
      { id: "d15", name: "Passport.pdf", status: "verified", aiScore: 94 },
    ],
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
 *  STORAGE
 * ============================================================ */
const APPS_KEY = "admin_screening_apps_v1";
const AUDIT_KEY = "admin_screening_audit_v1";

const loadApps = (): ScreeningApp[] => {
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) return [...SEED_SCREENING_APPS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [...SEED_SCREENING_APPS];
  } catch {
    return [...SEED_SCREENING_APPS];
  }
};

const saveApps = (apps: ScreeningApp[]) =>
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

/* ============================================================
 *  HELPERS
 * ============================================================ */
const computeMerit = (app: ScreeningApp): number => {
  if (app.meritScore != null) return app.meritScore;
  if (!app.documents?.length) return 0;
  const sum = app.documents.reduce((s, d) => s + (d.aiScore || 0), 0);
  return sum / app.documents.length;
};

const uid = (p = "id") =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const AdminScreening: React.FC = () => {
  const { addToast } = useAppStore();
  const adminUser = useAuthStore((s) => s.user);
  const adminState = adminUser?.state;

  const [apps, setApps] = useState<ScreeningApp[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [filterScheme, setFilterScheme] = useState("");
  const [filterState, setFilterState] = useState("");
  const [sortBy, setSortBy] = useState<"merit" | "name" | "date" | "amount">(
    "merit",
  );
  const [search, setSearch] = useState("");

  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const { t, i18n } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  /* ---------- Hydrate once ---------- */
  useEffect(() => {
    setApps(loadApps());
    setAudit(loadAudit());
    setHydrated(true);
  }, []);

  /* ---------- Persist ---------- */
  useEffect(() => {
    if (hydrated) saveApps(apps);
  }, [apps, hydrated]);

  useEffect(() => {
    if (hydrated) saveAudit(audit);
  }, [audit, hydrated]);

  /* ---------- Auto-lock state for admins ---------- */
  useEffect(() => {
    if (adminState) setFilterState(adminState);
  }, [adminState]);

  /* ---------- Derived ---------- */
  const queue = useMemo(() => {
    return apps
      .filter((a) =>
        ["under_scrutiny", "screening", "more_info_required"].includes(
          a.status,
        ),
      )
      .filter((a) => {
        if (filterScheme && a.schemeId !== filterScheme) return false;
        if (filterState && a.state !== filterState) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !a.studentName.toLowerCase().includes(q) &&
            !a.id.toLowerCase().includes(q) &&
            !a.schemeName.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      })
      .map((a) => ({ ...a, merit: computeMerit(a) }));
  }, [apps, filterScheme, filterState, search]);

  const sorted = useMemo(() => {
    const list = [...queue];
    list.sort((a, b) => {
      if (sortBy === "merit") return b.merit - a.merit;
      if (sortBy === "name") return a.studentName.localeCompare(b.studentName);
      if (sortBy === "amount") return b.amount - a.amount;
      return String(b.submittedDate).localeCompare(String(a.submittedDate));
    });
    return list;
  }, [queue, sortBy]);

  const selectedApp = useMemo(
    () => apps.find((a) => a.id === selectedAppId) ?? null,
    [apps, selectedAppId],
  );

  const stats = useMemo(() => {
    const total = queue.length;
    const high = queue.filter((a) => a.merit >= 85).length;
    const mid = queue.filter((a) => a.merit >= 60 && a.merit < 85).length;
    const low = queue.filter((a) => a.merit > 0 && a.merit < 60).length;
    return { total, high, mid, low };
  }, [queue]);

  const uniqueStates = useMemo(() => {
    const s = new Set<string>();
    for (const a of apps) if (a.state) s.add(a.state);
    return [...s].sort();
  }, [apps]);

  /* ---------- Actions ---------- */
  const addAudit = (action: string, target: string, remark?: string) => {
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

  const changeStatus = (
    app: ScreeningApp,
    status: ScreeningStatus,
    remark?: string,
  ) => {
    setBusyId(app.id);
    setTimeout(() => {
      setApps((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status,
                lastUpdated: new Date().toISOString().slice(0, 10),
                adminRemark: remark ?? a.adminRemark,
              }
            : a,
        ),
      );
      addAudit(`STATUS → ${status}`, `${app.id} (${app.studentName})`, remark);
      addToast("success", `${app.studentName} → ${status.replace(/_/g, " ")}`);
      setBusyId(null);
    }, 250);
  };

  const resetDemo = () => {
    if (!confirm("Reset screening queue to demo data?")) return;
    localStorage.removeItem(APPS_KEY);
    localStorage.removeItem(AUDIT_KEY);
    setApps([...SEED_SCREENING_APPS]);
    setAudit([]);
    addToast("info", "Demo data restored");
  };

  const refresh = () => {
    setApps(loadApps());
    setAudit(loadAudit());
    addToast("info", "Screening queue refreshed");
  };

  /* ---------- Loading skeleton ---------- */
  if (!hydrated) {
    return (
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3' />
          <div className='h-24 bg-slate-200 dark:bg-slate-800 rounded' />
          <div className='h-64 bg-slate-200 dark:bg-slate-800 rounded' />
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 space-y-6 animate-fade-in max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>
            {t('screening.title')}
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {t('screening.subtitle', { count: sorted.length })}
          </p>
          {adminUser?.name && (
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1'>
              <MapPin size={11} />
              {t('screening.signedInAs')} <strong>{adminUser.name}</strong>
              {adminState ? ` · ${t('screening.scopedTo')} ${adminState}` : ""}
            </p>
          )}
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='success'>{t('communication.frontendOnly', 'Frontend-only')}</Badge>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setShowAudit(true)}
            icon={<History size={14} />}
          >
            {t('auditLog.title', 'Audit')} ({audit.length})
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={resetDemo}
            icon={<RotateCcw size={14} />}
          >
            {t('screening.resetDemo')}
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={refresh}
            icon={<RefreshCw size={14} />}
          >
            {t('screening.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
            {t('screening.inQueue')}
          </p>
          <p className='text-2xl font-bold text-slate-900 dark:text-white mt-0.5'>
            {stats.total}
          </p>
        </Card>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-emerald-600 uppercase tracking-wider'>
            {t('screening.highMerit')}
          </p>
          <p className='text-2xl font-bold text-emerald-600 mt-0.5'>
            {stats.high}
          </p>
        </Card>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-amber-600 uppercase tracking-wider'>
            {t('screening.midMerit')}
          </p>
          <p className='text-2xl font-bold text-amber-600 mt-0.5'>
            {stats.mid}
          </p>
        </Card>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-red-600 uppercase tracking-wider'>
            {t('screening.lowMerit')}
          </p>
          <p className='text-2xl font-bold text-red-600 mt-0.5'>{stats.low}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3'>
        <div className='relative'>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('screening.searchPlaceholder')}
            className='pl-3 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none w-56'
          />
        </div>

        <select
          value={filterScheme}
          onChange={(e) => setFilterScheme(e.target.value)}
          className='px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none'
        >
          <option value=''>{t('screening.allSchemes')}</option>
          {SEED_SCHEMES.map((s) => (
            <option key={s.id} value={s.id}>
              {getLocalizedSchemeName(s.name, i18n.language)}
            </option>
          ))}
        </select>

        {adminState ? (
          <div className='px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1'>
            <MapPin size={12} className='text-slate-500' />
            <span className='text-slate-500'>{t('screening.location')}:</span>
            <strong>{adminState}</strong>
          </div>
        ) : (
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className='px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none'
          >
            <option value=''>{t('screening.allStates')}</option>
            {uniqueStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className='px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none'
        >
          <option value='merit'>{t('screening.sortByMerit')}</option>
          <option value='date'>{t('screening.sortByDate')}</option>
          <option value='name'>{t('screening.sortByName')}</option>
          <option value='amount'>{t('screening.sortByAmount')}</option>
        </select>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700'>
              <tr>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  #
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('screening.studentName')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('screening.scheme')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('screening.location')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('screening.merit')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('screening.amount')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('screening.status')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('screening.action')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-700'>
              {sorted.map((app, i) => (
                <tr
                  key={app.id}
                  className='hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer'
                  onClick={() => setSelectedAppId(app.id)}
                >
                  <td className='p-3 text-slate-500'>{i + 1}</td>
                  <td className='p-3'>
                    <p className='font-medium text-slate-900 dark:text-white'>
                      {app.studentName}
                    </p>
                    <p className='text-[11px] font-mono text-slate-500'>
                      {app.id}
                    </p>
                  </td>
                  <td className='p-3'>
                    <Badge variant='info'>{getLocalizedSchemeName(app.schemeName, i18n.language)}</Badge>
                  </td>
                  <td className='p-3 text-slate-600 dark:text-slate-400'>
                    {app.state}
                  </td>
                  <td className='p-3'>
                    <span
                      className={`font-semibold ${
                        app.merit >= 85
                          ? "text-emerald-600"
                          : app.merit >= 60
                            ? "text-amber-600"
                            : app.merit > 0
                              ? "text-red-600"
                              : "text-slate-400"
                      }`}
                    >
                      {app.merit ? `${app.merit.toFixed(0)}%` : "—"}
                    </span>
                  </td>
                  <td className='p-3 text-slate-900 dark:text-white'>
                    ₹{Number(app.amount).toLocaleString("en-IN")}
                  </td>
                  <td className='p-3'>
                    <StatusBadge status={app.status} />
                  </td>
                  <td className='p-3'>
                    <div
                      className='flex gap-1'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled={busyId === app.id}
                        onClick={() =>
                          changeStatus(
                            app,
                            "selected",
                            "Selected via merit screening",
                          )
                        }
                        title={t('screening.selectCandidate')}
                      >
                        <CheckCircle size={16} className='text-emerald-500' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled={busyId === app.id}
                        onClick={() =>
                          changeStatus(app, "waitlisted", "Placed on waitlist")
                        }
                        title={t('screening.waitlistCandidate')}
                      >
                        <History size={16} className='text-amber-500' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        disabled={busyId === app.id}
                        onClick={() =>
                          changeStatus(
                            app,
                            "rejected",
                            "Rejected after screening",
                          )
                        }
                        title={t('screening.rejectCandidate')}
                      >
                        <XCircle size={16} className='text-red-500' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => setSelectedAppId(app.id)}
                        title={t('screening.details')}
                      >
                        <Eye size={16} className='text-slate-500' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className='py-12'>
            <EmptyState
              icon={<Users size={40} />}
              title={t('screening.queueEmpty')}
              description={t('screening.queueEmptyDesc')}
            />
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedAppId(null)}
        title={`${t('screening.modalTitle')}: ${selectedApp?.id ?? ""}`}
        size='xl'
      >
        {selectedApp && (
          <ScreeningDetail
            app={selectedApp}
            busy={busyId === selectedApp.id}
            onAction={(status, remark) => {
              changeStatus(selectedApp, status, remark);
              setSelectedAppId(null);
            }}
          />
        )}
      </Modal>

      {/* Audit Modal */}
      <Modal
        isOpen={showAudit}
        onClose={() => setShowAudit(false)}
        title={t('auditLog.title')}
        size='lg'
      >
        {audit.length === 0 ? (
          <p className='text-sm text-slate-500 italic'>{t('auditLog.noLogs')}</p>
        ) : (
          <div className='space-y-2 max-h-[60vh] overflow-y-auto'>
            {audit.map((e) => (
              <div
                key={e.id}
                className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-semibold text-slate-800 dark:text-slate-200'>
                    {e.action}
                  </span>
                  <span className='text-[10px] text-slate-500'>
                    {new Date(e.at).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className='text-xs text-slate-600 dark:text-slate-400 mt-1'>
                  {e.target} · by <strong>{e.actor}</strong>
                </p>
                {e.remark && (
                  <p className='text-[11px] text-slate-500 mt-1 italic'>
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

/* ============================================================
 *  DETAIL SUBCOMPONENT
 * ============================================================ */
const ScreeningDetail: React.FC<{
  app: ScreeningApp;
  busy: boolean;
  onAction: (status: ScreeningStatus, remark: string) => void;
}> = ({ app, busy, onAction }) => {
  const { t, i18n } = useTranslation('admin');
  const [remark, setRemark] = useState("");
  const merit = computeMerit(app);

  return (
    <div className='space-y-5'>
      {/* Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60'>
        <div>
          <p className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
            {t('screening.studentName')}
          </p>
          <p className='text-sm font-semibold text-slate-900 dark:text-white mt-0.5'>
            {app.studentName}
          </p>
          <p className='text-[10px] text-slate-500 font-mono'>{app.id}</p>
        </div>
        <div>
          <p className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
            {t('screening.scheme')}
          </p>
          <p className='text-sm font-semibold text-slate-900 dark:text-white mt-0.5'>
            {getLocalizedSchemeName(app.schemeName, i18n.language)}
          </p>
        </div>
        <div>
          <p className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
            {t('screening.location')}
          </p>
          <p className='text-sm font-semibold text-slate-900 dark:text-white mt-0.5'>
            {app.district}, {app.state}
          </p>
        </div>
        <div>
          <p className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
            {t('screening.amount')}
          </p>
          <p className='text-sm font-semibold font-mono text-slate-900 dark:text-white mt-0.5'>
            ₹{Number(app.amount).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Merit bar */}
      <div>
        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2'>
          {t('screening.meritScore')}
        </p>
        <div className='w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden'>
          <div
            className={`h-full ${
              merit >= 85
                ? "bg-emerald-500"
                : merit >= 60
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${Math.min(100, merit)}%` }}
          />
        </div>
        <p className='text-xs text-slate-500 mt-1'>
          {merit.toFixed(1)}% —{" "}
          {merit >= 85 ? t('screening.highMerit') : merit >= 60 ? t('screening.midMerit') : t('screening.lowMerit')}
        </p>
      </div>

      {/* Documents */}
      <div>
        <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2'>
          {t('screening.documents')}
        </p>
        <div className='space-y-2'>
          {app.documents.length === 0 && (
            <p className='text-xs text-slate-500 italic'>
              {t('screening.queueEmptyDesc')}
            </p>
          )}
          {app.documents.map((doc) => (
            <div
              key={doc.id}
              className='flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40'
            >
              <div className='flex items-center gap-2'>
                <FileText size={14} className='text-slate-400' />
                <div>
                  <p className='text-xs font-medium text-slate-800 dark:text-slate-200'>
                    {doc.name}
                  </p>
                  {doc.aiFeedback && (
                    <p className='text-[11px] text-slate-500 mt-0.5'>
                      {doc.aiFeedback}
                    </p>
                  )}
                </div>
              </div>
              <div className='flex items-center gap-3'>
                <span className='text-xs font-mono text-slate-500'>
                  AI: {doc.aiScore}%
                </span>
                <StatusBadge status={doc.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI flags */}
      {app.aiFlags.length > 0 && (
        <div>
          <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1'>
            <AlertTriangle size={14} className='text-amber-600' /> {t('screening.aiFlags')}
          </p>
          <div className='space-y-2'>
            {app.aiFlags.map((flag) => (
              <div
                key={flag.id}
                className={`p-3 rounded-lg border ${
                  flag.severity === "high"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : flag.severity === "medium"
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <p className='text-xs font-medium text-slate-800 dark:text-slate-200'>
                  {flag.message}
                </p>
                {flag.suggestion && (
                  <p className='text-[11px] text-slate-600 dark:text-slate-400 mt-1'>
                    💡 {flag.suggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin remark */}
      <div>
        <label className='text-xs font-semibold text-slate-500 uppercase tracking-wider'>
          {t('screening.remarks')}
        </label>
        <textarea
          rows={3}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder={t('screening.remarksPlaceholder')}
          className='mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none'
        />
      </div>

      {/* Actions */}
      <div className='flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700'>
        <p className='text-xs text-slate-500 mr-auto'>{t('screening.actions')}:</p>
        <Button
          variant='outline'
          disabled={busy}
          icon={<Save size={14} />}
          onClick={() =>
            onAction("more_info_required", remark || "More info requested")
          }
        >
          {t('screening.requestMoreInfo')}
        </Button>
        <Button
          variant='outline'
          disabled={busy}
          icon={<History size={14} />}
          onClick={() => onAction("waitlisted", remark || "Placed on waitlist")}
        >
          {t('screening.waitlistCandidate')}
        </Button>
        <Button
          variant='danger'
          disabled={busy}
          icon={<XCircle size={14} />}
          onClick={() =>
            onAction("rejected", remark || "Rejected after screening")
          }
        >
          {t('screening.rejectCandidate')}
        </Button>
        <Button
          disabled={busy}
          icon={<CheckCircle size={14} />}
          onClick={() =>
            onAction("selected", remark || "Selected via merit screening")
          }
        >
          {t('screening.selectCandidate')}
        </Button>
      </div>
    </div>
  );
};

export default AdminScreening;
