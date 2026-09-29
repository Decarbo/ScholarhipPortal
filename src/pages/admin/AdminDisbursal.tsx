import React, { useEffect, useMemo, useState } from "react";
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
import { getLocalizedSchemeName } from "../../utils/localizedData";
import {
  RefreshCw,
  Search,
  RotateCcw,
  Download,
  MapPin,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Landmark,
  History,
  AlertTriangle,
} from "lucide-react";

/* ============================================================
 *  LOCAL TYPES
 * ============================================================ */
type DisbursalStatus = "pending" | "processed" | "failed" | "retry_queued";

interface LocalDisbursal {
  id: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  state: string;
  district: string;
  scheme: string;
  amount: number;
  status: DisbursalStatus;
  transactionId: string;
  date: string;
  bankReference: string;
  bankName: string;
  accountLast4: string;
  processedAt?: string;
  failureReason?: string;
  remark?: string;
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
const SEED_DISBURSALS: LocalDisbursal[] = [
  /* ---------- MAHARASHTRA (admin.mh) ---------- */
  {
    id: "DIS-MH-001",
    applicationId: "ADM-MH-001",
    studentId: "STU-MH-01",
    studentName: "Priya Gond",
    state: "Maharashtra",
    district: "Mumbai",
    scheme: "NFST",
    amount: 31000,
    status: "pending",
    transactionId: "TXN-MH-2026-0001",
    date: "2026-02-01",
    bankReference: "Scheduled",
    bankName: "State Bank of India",
    accountLast4: "9012",
  },
  {
    id: "DIS-MH-002",
    applicationId: "ADM-MH-003",
    studentId: "STU-MH-03",
    studentName: "Anjali Singh",
    state: "Maharashtra",
    district: "Nagpur",
    scheme: "NSTPS",
    amount: 7500,
    status: "processed",
    transactionId: "TXN-MH-2026-0002",
    date: "2026-01-20",
    bankReference: "SBI/NEFT/98765",
    bankName: "State Bank of India",
    accountLast4: "3456",
    processedAt: "2026-01-20T14:30:00",
  },
  {
    id: "DIS-MH-003",
    applicationId: "ADM-MH-004",
    studentId: "STU-MH-04",
    studentName: "Vikram Patel",
    state: "Maharashtra",
    district: "Thane",
    scheme: "NOS",
    amount: 1500000,
    status: "failed",
    transactionId: "TXN-MH-2026-0003",
    date: "2026-01-25",
    bankReference: "Failed - Invalid IFSC",
    bankName: "HDFC Bank",
    accountLast4: "7890",
    failureReason: "IFSC code not found",
  },

  /* ---------- KARNATAKA (admin.ka) ---------- */
  {
    id: "DIS-KA-001",
    applicationId: "ADM-KA-005",
    studentId: "STU-KA-05",
    studentName: "Deepa Kurumba",
    state: "Karnataka",
    district: "Belagavi",
    scheme: "NFST",
    amount: 31000,
    status: "processed",
    transactionId: "TXN-KA-2026-0001",
    date: "2026-01-18",
    bankReference: "KVBL/NEFT/67890",
    bankName: "Karur Vysya Bank",
    accountLast4: "5566",
    processedAt: "2026-01-18T11:20:00",
  },
  {
    id: "DIS-KA-002",
    applicationId: "ADM-KA-006",
    studentId: "STU-KA-06",
    studentName: "Mohan Garo",
    state: "Karnataka",
    district: "Shivamogga",
    scheme: "NSTMS",
    amount: 12000,
    status: "processed",
    transactionId: "TXN-KA-2026-0002",
    date: "2025-12-10",
    bankReference: "IOB/RTGS/54321",
    bankName: "Indian Overseas Bank",
    accountLast4: "2233",
    processedAt: "2025-12-10T16:00:00",
  },
  {
    id: "DIS-KA-003",
    applicationId: "ADM-KA-005",
    studentId: "STU-KA-05",
    studentName: "Deepa Kurumba",
    state: "Karnataka",
    district: "Belagavi",
    scheme: "NFST",
    amount: 31000,
    status: "pending",
    transactionId: "TXN-KA-2026-0003",
    date: "2026-02-25",
    bankReference: "Scheduled",
    bankName: "Karur Vysya Bank",
    accountLast4: "5566",
  },
  {
    id: "DIS-KA-004",
    applicationId: "ADM-KA-001",
    studentId: "STU-KA-01",
    studentName: "Lakshmi Santhal",
    state: "Karnataka",
    district: "Bengaluru",
    scheme: "NFST",
    amount: 31000,
    status: "failed",
    transactionId: "TXN-KA-2026-0004",
    date: "2026-01-28",
    bankReference: "Failed - Account frozen",
    bankName: "Canara Bank",
    accountLast4: "6677",
    failureReason: "Account holder name mismatch",
  },
  {
    id: "DIS-KA-005",
    applicationId: "ADM-KA-003",
    studentId: "STU-KA-03",
    studentName: "Vikram Patel",
    state: "Karnataka",
    district: "Mangaluru",
    scheme: "NSTMS",
    amount: 12000,
    status: "processed",
    transactionId: "TXN-KA-2026-0005",
    date: "2026-01-15",
    bankReference: "SBI/NEFT/12345",
    bankName: "State Bank of India",
    accountLast4: "8899",
    processedAt: "2026-01-15T10:00:00",
  },
  {
    id: "DIS-KA-006",
    applicationId: "ADM-KA-002",
    studentId: "STU-KA-02",
    studentName: "Priya Verma",
    state: "Karnataka",
    district: "Mysuru",
    scheme: "NOS",
    amount: 1500000,
    status: "pending",
    transactionId: "TXN-KA-2026-0006",
    date: "2026-02-10",
    bankReference: "Scheduled",
    bankName: "Bank of Baroda",
    accountLast4: "1122",
  },

  /* ---------- DELHI ---------- */
  {
    id: "DIS-DL-001",
    applicationId: "ADM-DL-002",
    studentId: "STU-DL-02",
    studentName: "Kaviti Kondh",
    state: "Delhi",
    district: "New Delhi",
    scheme: "NSTMS",
    amount: 12000,
    status: "processed",
    transactionId: "TXN-DL-2026-0001",
    date: "2026-01-12",
    bankReference: "PNB/NEFT/33445",
    bankName: "Punjab National Bank",
    accountLast4: "4455",
    processedAt: "2026-01-12T09:45:00",
  },
];

/* ============================================================
 *  STORAGE
 * ============================================================ */
const DISBURSAL_KEY = "admin_disbursal_v1";
const AUDIT_KEY = "admin_disbursal_audit_v1";

const loadDisbursals = (): LocalDisbursal[] => {
  try {
    const raw = localStorage.getItem(DISBURSAL_KEY);
    if (!raw) return [...SEED_DISBURSALS];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [...SEED_DISBURSALS];
  } catch {
    return [...SEED_DISBURSALS];
  }
};

const saveDisbursals = (list: LocalDisbursal[]) =>
  localStorage.setItem(DISBURSAL_KEY, JSON.stringify(list));

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

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (iso: string) =>
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
export const AdminDisbursal: React.FC = () => {
  const { addToast } = useAppStore();
  const adminUser = useAuthStore((s) => s.user);
  const adminState = adminUser?.state;

  const [list, setList] = useState<LocalDisbursal[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [statusFilter, setStatusFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selected, setSelected] = useState<LocalDisbursal | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const { t, i18n } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  /* ---------- Hydrate ---------- */
  useEffect(() => {
    setList(loadDisbursals());
    setAudit(loadAudit());
    setHydrated(true);
  }, []);

  /* ---------- Persist ---------- */
  useEffect(() => {
    if (hydrated) saveDisbursals(list);
  }, [list, hydrated]);

  useEffect(() => {
    if (hydrated) saveAudit(audit);
  }, [audit, hydrated]);

  /* ---------- Auto-scope admin to their state ---------- */
  useEffect(() => {
    if (adminState) setStateFilter(adminState);
  }, [adminState]);

  /* ---------- Derived ---------- */
  const scoped = useMemo(() => {
    let l = [...list];
    const effState = stateFilter || adminState;
    if (effState) l = l.filter((d) => d.state === effState);
    return l;
  }, [list, stateFilter, adminState]);

  const stats = useMemo(() => {
    const processed = scoped.filter((d) => d.status === "processed");
    const pending = scoped.filter((d) => d.status === "pending");
    const failed = scoped.filter((d) => d.status === "failed");
    const totalProcessed = processed.reduce((s, d) => s + d.amount, 0);
    const totalPending = pending.reduce((s, d) => s + d.amount, 0);
    const totalFailed = failed.reduce((s, d) => s + d.amount, 0);
    return {
      processedCount: processed.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      totalProcessed,
      totalPending,
      totalFailed,
    };
  }, [scoped]);

  const visible = useMemo(() => {
    let l = [...scoped];
    if (statusFilter) l = l.filter((d) => d.status === statusFilter);
    const q = searchInput.toLowerCase();
    if (q) {
      l = l.filter(
        (d) =>
          d.studentName.toLowerCase().includes(q) ||
          d.transactionId.toLowerCase().includes(q) ||
          d.applicationId.toLowerCase().includes(q) ||
          d.bankReference.toLowerCase().includes(q),
      );
    }
    // latest first
    l.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return l;
  }, [scoped, statusFilter, searchInput]);

  const uniqueStates = useMemo(() => {
    const s = new Set<string>();
    for (const d of list) if (d.state) s.add(d.state);
    return [...s].sort();
  }, [list]);

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
  const markProcessed = (d: LocalDisbursal) => {
    setBusyId(d.id);
    setTimeout(() => {
      setList((prev) =>
        prev.map((x) =>
          x.id === d.id
            ? {
                ...x,
                status: "processed" as DisbursalStatus,
                bankReference: `${x.bankName.split(" ")[0]}/NEFT/${Math.floor(
                  10000 + Math.random() * 89999,
                )}`,
                processedAt: new Date().toISOString(),
              }
            : x,
        ),
      );
      pushAudit(
        "PROCESSED",
        `${d.transactionId} (${d.studentName})`,
        `₹${d.amount.toLocaleString("en-IN")}`,
      );
      addToast(
        "success",
        `Payment ${d.transactionId} processed — student notified`,
      );
      setBusyId(null);
      setSelected(null);
    }, 400);
  };

  const retry = (d: LocalDisbursal) => {
    setBusyId(d.id);
    setTimeout(() => {
      setList((prev) =>
        prev.map((x) =>
          x.id === d.id
            ? {
                ...x,
                status: "pending" as DisbursalStatus,
                bankReference: "Retry queued",
                failureReason: undefined,
              }
            : x,
        ),
      );
      pushAudit(
        "RETRY QUEUED",
        `${d.transactionId} (${d.studentName})`,
        "Retry after failure",
      );
      addToast("info", `Retry queued for ${d.transactionId}`);
      setBusyId(null);
      setSelected(null);
    }, 400);
  };

  const failManually = (d: LocalDisbursal, reason: string) => {
    setBusyId(d.id);
    setTimeout(() => {
      setList((prev) =>
        prev.map((x) =>
          x.id === d.id
            ? {
                ...x,
                status: "failed" as DisbursalStatus,
                bankReference: `Failed - ${reason}`,
                failureReason: reason,
              }
            : x,
        ),
      );
      pushAudit("FAILED", `${d.transactionId} (${d.studentName})`, reason);
      addToast("warning", `Marked failed: ${reason}`);
      setBusyId(null);
      setSelected(null);
    }, 400);
  };

  const refresh = () => {
    setList(loadDisbursals());
    setAudit(loadAudit());
    addToast("info", "Disbursals refreshed");
  };

  const resetDemo = () => {
    if (!confirm("Reset disbursals to demo data?")) return;
    localStorage.removeItem(DISBURSAL_KEY);
    localStorage.removeItem(AUDIT_KEY);
    setList([...SEED_DISBURSALS]);
    setAudit([]);
    addToast("info", "Demo data restored");
  };

  const exportCsv = () => {
    const rows = [
      [
        "TXN ID",
        "Student",
        "State",
        "Scheme",
        "Amount",
        "Status",
        "Date",
        "Reference",
      ],
      ...visible.map((d) => [
        d.transactionId,
        d.studentName,
        d.state,
        d.scheme,
        String(d.amount),
        d.status,
        d.date,
        d.bankReference,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disbursals-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Disbursals exported");
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
    <div className='p-4 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto font-sans text-[#1D293D] dark:text-slate-100'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5'>
        <div className='flex items-start gap-3'>
          <div className='p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5'>
            <IndianRupee size={24} />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight'>
              {t('disbursal.title')}
            </h1>
            <p className='text-sm text-[#64748B] dark:text-slate-400 mt-1'>
              {t('disbursal.subtitle')}
            </p>
            {adminUser?.name && (
              <p className='text-xs text-[#64748B] dark:text-slate-400 mt-1 flex items-center gap-1 font-mono'>
                <MapPin size={11} className='text-[#0B75A4]' />
                {t('disbursal.signedInAs')} <strong className='font-sans text-[#1D293D] dark:text-slate-200'>{adminUser.name}</strong>
                {adminState ? ` · ${t('disbursal.scopedTo')} ${adminState}` : ""}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge variant='success'>{t('communication.frontendOnly')}</Badge>
          <Button
            size='sm'
            variant='outline'
            icon={<History size={14} />}
            onClick={() => setShowAudit(true)}
          >
            {t('auditLog.title')} ({audit.length})
          </Button>
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
            {t('disbursal.resetDemo')}
          </Button>
          <Button
            size='sm'
            variant='outline'
            icon={<RefreshCw size={14} />}
            onClick={refresh}
          >
            {t('screening.refresh')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3.5'>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#009B68] dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1'>
            <CheckCircle2 size={13} /> {t('disbursal.processedCount')}
          </p>
          <p className='text-2xl font-bold text-[#009B68] dark:text-emerald-400 mt-1'>
            {stats.processedCount}
          </p>
          <p className='text-[11px] text-[#64748B] font-mono mt-0.5'>
            ₹{stats.totalProcessed.toLocaleString("en-IN")}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#F59E0B] uppercase tracking-wider flex items-center gap-1'>
            <Clock size={13} /> {t('disbursal.pendingCount')}
          </p>
          <p className='text-2xl font-bold text-[#F59E0B] mt-1'>
            {stats.pendingCount}
          </p>
          <p className='text-[11px] text-[#64748B] font-mono mt-0.5'>
            ₹{stats.totalPending.toLocaleString("en-IN")}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#EF4444] uppercase tracking-wider flex items-center gap-1'>
            <XCircle size={13} /> {t('disbursal.failedCount')}
          </p>
          <p className='text-2xl font-bold text-[#EF4444] mt-1'>
            {stats.failedCount}
          </p>
          <p className='text-[11px] text-[#64748B] font-mono mt-0.5'>
            ₹{stats.totalFailed.toLocaleString("en-IN")}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#0B75A4] dark:text-[#1697C5] uppercase tracking-wider'>
            {t('disbursal.totalDisbursed')}
          </p>
          <p className='text-2xl font-bold text-[#0B75A4] dark:text-[#1697C5] mt-1 font-mono'>
            ₹{stats.totalProcessed.toLocaleString("en-IN")}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
        <div className='flex flex-wrap gap-3'>
          <div className='flex-1 relative min-w-[200px]'>
            <Search
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]'
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('disbursal.searchPlaceholder')}
              className='w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]'
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0B75A4]'
          >
            <option value=''>{t('disbursal.allStatuses')}</option>
            <option value='pending'>{t('disbursal.statusPending')}</option>
            <option value='processed'>{t('disbursal.statusProcessed')}</option>
            <option value='failed'>{t('disbursal.statusFailed')}</option>
          </select>

          {adminState ? (
            <div className='px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-[#F8FAFC] dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 flex items-center gap-1.5'>
              <MapPin size={12} className='text-[#0B75A4]' />
              <strong className='font-semibold'>{adminState}</strong>
            </div>
          ) : (
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className='px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0B75A4]'
            >
              <option value=''>{t('screening.allStates')}</option>
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
      <Card padding={false} className='border-[#DEE2E6] dark:border-slate-700 shadow-xs rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-xs'>
            <thead className='bg-[#F8FAFC] dark:bg-slate-800/50 border-b border-[#DEE2E6] dark:border-slate-700 uppercase tracking-wider text-[#475569] dark:text-slate-400 font-semibold'>
              <tr>
                <th className='p-3.5 text-left'>
                  {t('disbursal.tableTxn')}
                </th>
                <th className='p-3.5 text-left'>
                  {t('disbursal.tableStudent')}
                </th>
                <th className='p-3.5 text-left'>
                  {t('screening.location')}
                </th>
                <th className='p-3.5 text-left'>
                  {t('disbursal.tableAmount')}
                </th>
                <th className='p-3.5 text-left'>
                  {t('disbursal.processingDate')}
                </th>
                <th className='p-3.5 text-left'>
                  {t('disbursal.tableStatus')}
                </th>
                <th className='p-3.5 text-left'>
                  {t('disbursal.tableBank')}
                </th>
                <th className='p-3.5 text-right'>
                  {t('disbursal.tableAction')}
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[#DEE2E6] dark:divide-slate-800'>
              {visible.map((d) => (
                <tr
                  key={d.id}
                  className='hover:bg-[#F8FAFC] dark:hover:bg-slate-800/30 cursor-pointer transition-colors'
                  onClick={() => setSelected(d)}
                >
                  <td className='p-3.5 text-xs font-mono text-[#64748B] dark:text-slate-400'>
                    {d.transactionId}
                  </td>
                  <td className='p-3.5'>
                    <p className='font-bold text-[#1D293D] dark:text-white'>
                      {d.studentName}
                    </p>
                    <p className='text-[11px] font-mono text-[#64748B]'>
                      {d.applicationId}
                    </p>
                  </td>
                  <td className='p-3.5 text-xs text-[#64748B] dark:text-slate-400 font-medium'>
                    {d.state}
                  </td>
                  <td className='p-3.5 font-bold font-mono text-[#009B68]'>
                    ₹{Number(d.amount).toLocaleString("en-IN")}
                  </td>
                  <td className='p-3.5 text-[#64748B] dark:text-slate-400 font-mono'>
                    {fmtDate(d.date)}
                  </td>
                  <td className='p-3.5'>
                    <StatusBadge status={d.status} />
                  </td>
                  <td className='p-3.5 text-xs text-[#64748B] max-w-[180px] truncate font-mono'>
                    {d.bankReference}
                  </td>
                  <td className='p-3.5 text-right' onClick={(e) => e.stopPropagation()}>
                    {d.status === "pending" && (
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={busyId === d.id}
                        onClick={() => markProcessed(d)}
                      >
                        {t('disbursal.markProcessed')}
                      </Button>
                    )}
                    {d.status === "failed" && (
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={busyId === d.id}
                        onClick={() => retry(d)}
                      >
                        {t('disbursal.retryPayment')}
                      </Button>
                    )}
                    {d.status === "processed" && (
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => setSelected(d)}
                        icon={<Eye size={14} />}
                      >
                        {t('disbursal.viewReceipt')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 && (
          <div className='py-12'>
            <EmptyState
              icon={<Search size={36} className='text-[#94A3B8]' />}
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
        title={`${t('disbursal.modalTitle')}: ${selected?.transactionId ?? ""}`}
        size='lg'
      >
        {selected && (
          <div className='space-y-4 font-sans text-[#1D293D] dark:text-slate-100'>
            {/* Amount highlight */}
            <div className='p-5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700 text-center'>
              <p className='text-xs text-[#64748B] uppercase tracking-wider font-semibold'>
                {t('disbursal.tableAmount')}
              </p>
              <p className='text-3xl font-bold text-[#009B68] mt-1 font-mono'>
                ₹{selected.amount.toLocaleString("en-IN")}
              </p>
              <div className='mt-2.5 flex justify-center'>
                <StatusBadge status={selected.status} />
              </div>
            </div>

            {/* Meta grid */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
              <div className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DEE2E6] dark:border-slate-700'>
                <p className='text-[10px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  {t('disbursal.tableStudent')}
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selected.studentName}
                </p>
                <p className='text-[11px] text-[#64748B] font-mono mt-0.5'>
                  {selected.applicationId}
                </p>
              </div>
              <div className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DEE2E6] dark:border-slate-700'>
                <p className='text-[10px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  {t('disbursal.tableScheme')}
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {getLocalizedSchemeName(selected.scheme, i18n.language)}
                </p>
              </div>
              <div className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DEE2E6] dark:border-slate-700'>
                <p className='text-[10px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  {t('screening.location')}
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selected.district}, {selected.state}
                </p>
              </div>
            </div>

            {/* Bank details */}
            <div className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DEE2E6] dark:border-slate-700'>
              <p className='text-xs font-bold text-[#1D293D] dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5'>
                <Landmark size={15} className='text-[#0B75A4]' /> {t('disbursal.tableBank')}
              </p>
              <div className='grid grid-cols-2 gap-2 text-xs'>
                <div>
                  <span className='text-[#64748B]'>Bank:</span>{" "}
                  <span className='font-bold text-[#1D293D] dark:text-white'>
                    {selected.bankName}
                  </span>
                </div>
                <div>
                  <span className='text-[#64748B]'>A/C:</span>{" "}
                  <span className='font-bold font-mono text-[#1D293D] dark:text-white'>
                    ••••{selected.accountLast4}
                  </span>
                </div>
                <div className='col-span-2'>
                  <span className='text-[#64748B]'>Reference:</span>{" "}
                  <span className='font-mono font-medium text-[#1D293D] dark:text-white'>
                    {selected.bankReference}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className='grid grid-cols-2 gap-3 text-xs'>
              <div className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DEE2E6] dark:border-slate-700'>
                <p className='text-[10px] font-semibold text-[#64748B] uppercase tracking-wider'>
                  {t('disbursal.processingDate')}
                </p>
                <p className='text-[#1D293D] dark:text-white font-mono mt-0.5'>
                  {fmtDate(selected.date)}
                </p>
              </div>
              {selected.processedAt && (
                <div className='p-3.5 rounded-xl bg-[#009B68]/10 dark:bg-emerald-950/20 border border-[#009B68]/20 dark:border-emerald-800'>
                  <p className='text-[10px] font-bold text-[#009B68] dark:text-emerald-400 uppercase tracking-wider'>
                    {t('disbursal.processedCount')}
                  </p>
                  <p className='text-[#009B68] dark:text-emerald-300 font-mono mt-0.5'>
                    {fmtDateTime(selected.processedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Failure reason */}
            {selected.failureReason && (
              <div className='p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60'>
                <p className='text-xs font-bold text-[#EF4444] flex items-center gap-1.5'>
                  <AlertTriangle size={14} /> {t('disbursal.statusFailed')}
                </p>
                <p className='text-sm text-[#1D293D] dark:text-red-200 mt-1'>
                  {selected.failureReason}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className='flex flex-wrap gap-2.5 pt-3 border-t border-[#DEE2E6] dark:border-slate-700 justify-end'>
              {selected.status === "pending" && (
                <>
                  <Button
                    variant='outline'
                    disabled={busyId === selected.id}
                    icon={<XCircle size={14} />}
                    onClick={() => {
                      const reason = prompt(
                        "Reason for failure?",
                        "Bank declined",
                      );
                      if (reason) failManually(selected, reason);
                    }}
                  >
                    {t('disbursal.statusFailed')}
                  </Button>
                  <Button
                    disabled={busyId === selected.id}
                    icon={<CheckCircle2 size={14} />}
                    onClick={() => markProcessed(selected)}
                  >
                    {t('disbursal.markProcessed')}
                  </Button>
                </>
              )}
              {selected.status === "failed" && (
                <Button
                  disabled={busyId === selected.id}
                  icon={<RefreshCw size={14} />}
                  onClick={() => retry(selected)}
                >
                  {t('disbursal.retryPayment')}
                </Button>
              )}
              {selected.status === "processed" && (
                <p className='text-xs text-[#009B68] font-bold flex items-center gap-1.5'>
                  <CheckCircle2 size={15} /> {t('disbursal.disbursalCleared')}
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Audit Modal */}
      <Modal
        isOpen={showAudit}
        onClose={() => setShowAudit(false)}
        title='Disbursal Audit Log'
        size='lg'
      >
        {audit.length === 0 ? (
          <p className='text-sm text-[#94A3B8] italic'>No actions yet.</p>
        ) : (
          <div className='space-y-2 max-h-[60vh] overflow-y-auto font-sans text-[#1D293D] dark:text-slate-100'>
            {audit.map((e) => (
              <div
                key={e.id}
                className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span className='text-xs font-bold text-[#1D293D] dark:text-slate-200'>
                    {e.action}
                  </span>
                  <span className='text-[10px] text-[#64748B] font-mono'>
                    {fmtDateTime(e.at)}
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

export default AdminDisbursal;
