import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Modal, EmptyState } from "../../components/ui";
import { useAppStore, useAuthStore } from "../../store";
import {
  Search,
  RefreshCw,
  History,
  Filter,
  Download,
  Eye,
  RotateCcw,
  Shield,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

/* ============================================================
 *  LOCAL TYPES
 * ============================================================ */
type AuditAction =
  | "Approved"
  | "Selected"
  | "Rejected"
  | "Waitlisted"
  | "Flagged"
  | "Verified"
  | "Requested Resubmission"
  | "Status Changed"
  | "Bulk Update"
  | "Login"
  | "Logout";

interface AuditEntry {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminState?: string;
  action: AuditAction;
  applicationId: string;
  studentName: string;
  details: string;
  remark?: string;
}

/* ============================================================
 *  LOCAL MOCK DATA
 * ============================================================ */
const SEED_AUDIT: AuditEntry[] = [
  /* ---------- MAHARASHTRA officers ---------- */
  {
    id: "AUD-MH-001",
    timestamp: "2026-01-20T10:30:00",
    adminId: "adm-001",
    adminName: "Suresh Deshmukh",
    adminState: "Maharashtra",
    action: "Approved",
    applicationId: "ADM-MH-001",
    studentName: "Priya Gond",
    details: "All documents verified. Eligibility confirmed.",
    remark: "ST certificate verified at source.",
  },
  {
    id: "AUD-MH-002",
    timestamp: "2026-01-20T14:15:00",
    adminId: "adm-001",
    adminName: "Suresh Deshmukh",
    adminState: "Maharashtra",
    action: "Selected",
    applicationId: "ADM-MH-003",
    studentName: "Anjali Singh",
    details: "Merit-based selection. Score: 96/100",
  },
  {
    id: "AUD-MH-003",
    timestamp: "2026-01-19T15:30:00",
    adminId: "adm-001",
    adminName: "Suresh Deshmukh",
    adminState: "Maharashtra",
    action: "Flagged",
    applicationId: "ADM-MH-002",
    studentName: "Rahul Sharma",
    details: "Marksheet quality insufficient. Possible tampering.",
    remark: "Escalated to scrutiny officer.",
  },
  {
    id: "AUD-MH-004",
    timestamp: "2026-01-18T11:00:00",
    adminId: "adm-001",
    adminName: "Suresh Deshmukh",
    adminState: "Maharashtra",
    action: "Rejected",
    applicationId: "ADM-MH-004",
    studentName: "Vikram Patel",
    details: "Income exceeds eligibility threshold.",
    remark: "Family income > ₹2.5 lakh.",
  },
  {
    id: "AUD-MH-005",
    timestamp: "2026-01-17T09:15:00",
    adminId: "adm-001",
    adminName: "Suresh Deshmukh",
    adminState: "Maharashtra",
    action: "Requested Resubmission",
    applicationId: "ADM-MH-001",
    studentName: "Priya Gond",
    details: "Income certificate unclear. AI flagged.",
  },

  /* ---------- KARNATAKA officers ---------- */
  {
    id: "AUD-KA-001",
    timestamp: "2026-01-22T10:00:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Selected",
    applicationId: "ADM-KA-005",
    studentName: "Deepa Kurumba",
    details: "Merit-based selection. Score: 92/100",
  },
  {
    id: "AUD-KA-002",
    timestamp: "2026-01-21T16:30:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Approved",
    applicationId: "ADM-KA-001",
    studentName: "Lakshmi Santhal",
    details: "All documents verified. Research proposal strong.",
    remark: "Excellent academic record.",
  },
  {
    id: "AUD-KA-003",
    timestamp: "2026-01-21T14:20:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Requested Resubmission",
    applicationId: "ADM-KA-002",
    studentName: "Priya Verma",
    details: "Admission letter does not show university ranking.",
  },
  {
    id: "AUD-KA-004",
    timestamp: "2026-01-20T11:45:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Waitlisted",
    applicationId: "ADM-KA-003",
    studentName: "Vikram Patel",
    details: "Quota full. Placed on waitlist (position 3).",
  },
  {
    id: "AUD-KA-005",
    timestamp: "2026-01-19T09:30:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Bulk Update",
    applicationId: "ADM-KA-004, ADM-KA-006",
    studentName: "2 students",
    details: "Moved 2 applications to screening status.",
    remark: "Standard scrutiny batch.",
  },
  {
    id: "AUD-KA-006",
    timestamp: "2026-01-18T13:00:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Rejected",
    applicationId: "ADM-KA-007",
    studentName: "Rajan Rathwa",
    details: "Family income exceeds ₹2.5 lakh limit.",
  },
  {
    id: "AUD-KA-007",
    timestamp: "2026-01-17T15:00:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Verified",
    applicationId: "ADM-KA-005",
    studentName: "Deepa Kurumba",
    details: "ST certificate and research proposal verified.",
  },
  {
    id: "AUD-KA-008",
    timestamp: "2026-01-16T10:00:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Flagged",
    applicationId: "ADM-KA-004",
    studentName: "Sunita Naga",
    details: "ST certificate pending AI verification.",
  },
  {
    id: "AUD-KA-009",
    timestamp: "2026-01-15T12:00:00",
    adminId: "adm-002",
    adminName: "Lakshmi Rao",
    adminState: "Karnataka",
    action: "Login",
    applicationId: "—",
    studentName: "—",
    details: "Admin signed in from Bengaluru office.",
  },

  /* ---------- DELHI officers ---------- */
  {
    id: "AUD-DL-001",
    timestamp: "2026-01-21T14:00:00",
    adminId: "adm-003",
    adminName: "Vikram Singh",
    adminState: "Delhi",
    action: "Approved",
    applicationId: "ADM-DL-001",
    studentName: "Meena Khasi",
    details: "Passport verified. Merit strong.",
  },
  {
    id: "AUD-DL-002",
    timestamp: "2026-01-20T10:30:00",
    adminId: "adm-003",
    adminName: "Vikram Singh",
    adminState: "Delhi",
    action: "Selected",
    applicationId: "ADM-DL-002",
    studentName: "Kaviti Kondh",
    details: "Selected after screening committee review.",
  },
];

/* ============================================================
 *  STORAGE
 * ============================================================ */
const AUDIT_KEY = "admin_audit_log_v1";

const loadAudit = (): AuditEntry[] => {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [...SEED_AUDIT];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [...SEED_AUDIT];
  } catch {
    return [...SEED_AUDIT];
  }
};

const saveAudit = (list: AuditEntry[]) =>
  localStorage.setItem(AUDIT_KEY, JSON.stringify(list));

/* ============================================================
 *  HELPERS
 * ============================================================ */
const actionVariant = (
  action: string,
): "success" | "danger" | "warning" | "info" | "neutral" => {
  const a = action.toLowerCase();
  if (a.includes("select") || a.includes("approv") || a.includes("verif"))
    return "success";
  if (a.includes("reject") || a.includes("flag")) return "danger";
  if (a.includes("waitlist") || a.includes("resubmit") || a.includes("bulk"))
    return "warning";
  if (a.includes("login") || a.includes("logout")) return "info";
  return "neutral";
};

const fmtTs = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const AdminAuditLog: React.FC = () => {
  const { addToast } = useAppStore();
  const adminUser = useAuthStore((s) => s.user);
  const adminState = adminUser?.state;

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  /* ---------- Hydrate ---------- */
  useEffect(() => {
    setEntries(loadAudit());
    setHydrated(true);
  }, []);

  /* ---------- Auto-scope admin to their state ---------- */
  useEffect(() => {
    if (adminState) setStateFilter(adminState);
  }, [adminState]);

  /* ---------- Debounce search ---------- */
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ---------- Derived ---------- */
  const uniqueStates = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) if (e.adminState) s.add(e.adminState);
    return [...s].sort();
  }, [entries]);

  const uniqueActions = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) s.add(e.action);
    return [...s].sort();
  }, [entries]);

  const filtered = useMemo(() => {
    let list = [...entries];

    // state scoping (admin's own state unless explicitly overridden)
    const effState = stateFilter || adminState;
    if (effState) list = list.filter((e) => e.adminState === effState);

    // action filter
    if (actionFilter) list = list.filter((e) => e.action === actionFilter);

    // search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.adminName.toLowerCase().includes(q) ||
          e.studentName.toLowerCase().includes(q) ||
          e.applicationId.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          (e.remark ?? "").toLowerCase().includes(q),
      );
    }

    // sort: latest first
    list.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return list;
  }, [entries, stateFilter, adminState, actionFilter, search]);

  const stats = useMemo(() => {
    const scoped = adminState
      ? entries.filter((e) => e.adminState === adminState)
      : entries;
    const byAction: Record<string, number> = {};
    for (const e of scoped) byAction[e.action] = (byAction[e.action] ?? 0) + 1;
    return { total: scoped.length, byAction };
  }, [entries, adminState]);

  /* ---------- Actions ---------- */
  const refresh = () => {
    setEntries(loadAudit());
    addToast("info", "Audit log refreshed");
  };

  const resetDemo = () => {
    if (!confirm("Reset audit log to demo data?")) return;
    localStorage.removeItem(AUDIT_KEY);
    setEntries([...SEED_AUDIT]);
    addToast("info", "Audit log restored to demo data");
  };

  const exportCsv = () => {
    const rows = [
      [
        "Timestamp",
        "Officer",
        "State",
        "Action",
        "Application",
        "Student",
        "Details",
      ],
      ...filtered.map((e) => [
        e.timestamp,
        e.adminName,
        e.adminState ?? "",
        e.action,
        e.applicationId,
        e.studentName,
        e.details,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Audit log exported");
  };

  /* ---------- Loading skeleton ---------- */
  if (!hydrated) {
    return (
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3' />
          <div className='h-16 bg-slate-200 dark:bg-slate-800 rounded' />
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
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
            <History size={22} /> {t('auditLog.title')}
          </h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            {t('auditLog.subtitle')}
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
          <Badge variant='success'>{t('auditLog.frontendOnly')}</Badge>
          <Button
            size='sm'
            variant='outline'
            icon={<Download size={14} />}
            onClick={exportCsv}
          >
            {t('auditLog.exportCsv')}
          </Button>
          <Button
            size='sm'
            variant='outline'
            icon={<RotateCcw size={14} />}
            onClick={resetDemo}
          >
            {t('auditLog.resetDemo')}
          </Button>
          <Button
            size='sm'
            variant='outline'
            icon={<RefreshCw size={14} />}
            onClick={refresh}
          >
            {t('auditLog.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-slate-500 uppercase tracking-wider'>
            {t('auditLog.total')}
          </p>
          <p className='text-2xl font-bold text-slate-900 dark:text-white mt-0.5'>
            {stats.total}
          </p>
        </Card>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-emerald-600 uppercase tracking-wider'>
            {t('auditLog.positive')}
          </p>
          <p className='text-2xl font-bold text-emerald-600 mt-0.5'>
            {(stats.byAction["Approved"] ?? 0) +
              (stats.byAction["Selected"] ?? 0) +
              (stats.byAction["Verified"] ?? 0)}
          </p>
        </Card>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-red-600 uppercase tracking-wider'>
            {t('auditLog.negative')}
          </p>
          <p className='text-2xl font-bold text-red-600 mt-0.5'>
            {(stats.byAction["Rejected"] ?? 0) +
              (stats.byAction["Flagged"] ?? 0)}
          </p>
        </Card>
        <Card className='!p-3'>
          <p className='text-[11px] font-semibold text-amber-600 uppercase tracking-wider'>
            {t('auditLog.pending')}
          </p>
          <p className='text-2xl font-bold text-amber-600 mt-0.5'>
            {(stats.byAction["Waitlisted"] ?? 0) +
              (stats.byAction["Requested Resubmission"] ?? 0)}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className='!p-4'>
        <div className='flex flex-wrap gap-3'>
          <div className='flex-1 relative min-w-[220px]'>
            <Search
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('auditLog.searchPlaceholder')}
              className='w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className='px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none'
          >
            <option value=''>{t('auditLog.allActions')}</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {adminState ? (
            <div className='px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1'>
              <MapPin size={12} className='text-slate-500' />
              <strong>{adminState}</strong>
            </div>
          ) : (
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className='px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none'
            >
              <option value=''>{t('auditLog.allStates')}</option>
              {uniqueStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card padding={false}>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700'>
              <tr>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.tableTime')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.tableOfficer')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.tableState')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.tableAction')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.tableAppId')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.tableStudent')}
                </th>
                <th className='p-3 text-left font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.tableDetails')}
                </th>
                <th className='p-3 text-right font-medium text-slate-600 dark:text-slate-400'>
                  {t('auditLog.viewDetails')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-700'>
              {filtered.map((entry) => (
                <tr
                  key={entry.id}
                  className='hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer'
                  onClick={() => setSelected(entry)}
                >
                  <td className='p-3 text-xs text-slate-500 whitespace-nowrap'>
                    {fmtTs(entry.timestamp)}
                  </td>
                  <td className='p-3 text-slate-900 dark:text-white'>
                    {entry.adminName}
                  </td>
                  <td className='p-3 text-xs text-slate-600 dark:text-slate-400'>
                    {entry.adminState ?? "—"}
                  </td>
                  <td className='p-3'>
                    <Badge variant={actionVariant(entry.action)}>
                      {entry.action}
                    </Badge>
                  </td>
                  <td className='p-3 text-slate-600 dark:text-slate-400 font-mono text-xs'>
                    {entry.applicationId}
                  </td>
                  <td className='p-3 text-slate-900 dark:text-white'>
                    {entry.studentName}
                  </td>
                  <td className='p-3 text-xs text-slate-500 max-w-xs truncate'>
                    {entry.details}
                  </td>
                  <td className='p-3 text-right'>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected(entry);
                      }}
                      className='p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className='py-12'>
            <EmptyState
              icon={<Filter size={36} className='text-slate-400' />}
              title={t('auditLog.noLogs')}
              description={t('auditLog.noLogsDesc')}
            />
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`${t('auditLog.modalTitle')}: ${selected?.id ?? ""}`}
        size='lg'
      >
        {selected && (
          <div className='space-y-4'>
            {/* Header strip */}
            <div className='flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'>
              <div
                className={`p-2 rounded-lg ${
                  selected.action === "Selected" ||
                  selected.action === "Approved"
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : selected.action === "Rejected" ||
                        selected.action === "Flagged"
                      ? "bg-red-100 dark:bg-red-900/30"
                      : "bg-amber-100 dark:bg-amber-900/30"
                }`}
              >
                {selected.action === "Selected" ||
                selected.action === "Approved" ? (
                  <CheckCircle2 size={20} className='text-emerald-600' />
                ) : selected.action === "Rejected" ||
                  selected.action === "Flagged" ? (
                  <XCircle size={20} className='text-red-600' />
                ) : (
                  <AlertTriangle size={20} className='text-amber-600' />
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-slate-900 dark:text-white'>
                  {selected.action}
                </p>
                <p className='text-xs text-slate-500'>
                  {fmtTs(selected.timestamp)}
                </p>
              </div>
              <Badge variant={actionVariant(selected.action)}>
                {selected.action}
              </Badge>
            </div>

            {/* Meta grid */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
              <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40'>
                <p className='text-[10px] font-semibold text-slate-500 uppercase tracking-wider'>
                  {t('auditLog.tableOfficer')}
                </p>
                <p className='text-sm font-medium text-slate-900 dark:text-white mt-0.5'>
                  {selected.adminName}
                </p>
                {selected.adminState && (
                  <p className='text-[11px] text-slate-500 mt-0.5'>
                    {selected.adminState}
                  </p>
                )}
              </div>
              <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40'>
                <p className='text-[10px] font-semibold text-slate-500 uppercase tracking-wider'>
                  {t('auditLog.tableAppId')}
                </p>
                <p className='text-sm font-mono text-slate-900 dark:text-white mt-0.5'>
                  {selected.applicationId}
                </p>
              </div>
              <div className='p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40'>
                <p className='text-[10px] font-semibold text-slate-500 uppercase tracking-wider'>
                  {t('auditLog.tableStudent')}
                </p>
                <p className='text-sm font-medium text-slate-900 dark:text-white mt-0.5'>
                  {selected.studentName}
                </p>
              </div>
            </div>

            {/* Details */}
            <div>
              <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1'>
                {t('auditLog.tableDetails')}
              </p>
              <p className='text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap'>
                {selected.details}
              </p>
            </div>

            {/* Remark */}
            {selected.remark && (
              <div>
                <p className='text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1'>
                  {t('auditLog.officerRemarks')}
                </p>
                <p className='text-sm text-slate-700 dark:text-slate-300 italic p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'>
                  "{selected.remark}"
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAuditLog;
