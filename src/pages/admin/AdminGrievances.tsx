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
import {
  Send,
  RefreshCw,
  Inbox,
  MapPin,
  History,
  RotateCcw,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Eye,
} from "lucide-react";

/* ============================================================
 *  LOCAL TYPES
 * ============================================================ */
type GrievanceStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "escalated";
type GrievancePriority = "low" | "medium" | "high";

interface GrievanceMessage {
  id: string;
  author: "student" | "admin";
  text: string;
  at: string;
}

interface LocalGrievance {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  state: string;
  district: string;
  subject: string;
  description: string;
  category?: string;
  status: GrievanceStatus;
  priority: GrievancePriority;
  createdAt: string;
  lastUpdated: string;
  response?: string;
  needsAssistance?: boolean;
  assistanceType?: string;
  messages: GrievanceMessage[];
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
const SEED_GRIEVANCES: LocalGrievance[] = [
  /* ---------- MAHARASHTRA ---------- */
  {
    id: "GRV-MH-001",
    studentId: "STU-MH-01",
    studentName: "Priya Gond",
    studentEmail: "priya.gond@student.in",
    state: "Maharashtra",
    district: "Mumbai",
    subject: "Scholarship amount not credited",
    description:
      "My NFST scholarship was approved 15 days ago but the amount has not been credited to my bank account yet.",
    category: "disbursal_delay",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-01-13T10:00:00",
    lastUpdated: "2026-01-15T14:30:00",
    response:
      "We have escalated this to the disbursement team. Please share your bank statement.",
    messages: [
      {
        id: "m1",
        author: "student",
        text: "My scholarship amount is not credited.",
        at: "2026-01-13T10:00:00",
      },
      {
        id: "m2",
        author: "admin",
        text: "We have escalated this to the disbursement team.",
        at: "2026-01-15T14:30:00",
      },
    ],
  },
  {
    id: "GRV-MH-002",
    studentId: "STU-MH-02",
    studentName: "Rahul Sharma",
    studentEmail: "rahul.sharma@student.in",
    state: "Maharashtra",
    district: "Pune",
    subject: "Unable to upload income certificate",
    description:
      "The portal shows error 500 when I try to upload my income certificate PDF.",
    category: "technical_issue",
    status: "resolved",
    priority: "medium",
    createdAt: "2026-01-10T09:15:00",
    lastUpdated: "2026-01-12T11:00:00",
    response: "The issue was due to file size. Please keep PDF under 2 MB.",
    messages: [
      {
        id: "m3",
        author: "student",
        text: "Upload fails with error 500.",
        at: "2026-01-10T09:15:00",
      },
      {
        id: "m4",
        author: "admin",
        text: "Keep your PDF under 2 MB.",
        at: "2026-01-12T11:00:00",
      },
      {
        id: "m5",
        author: "student",
        text: "It worked, thank you!",
        at: "2026-01-12T11:30:00",
      },
    ],
  },
  {
    id: "GRV-MH-003",
    studentId: "STU-MH-03",
    studentName: "Anjali Singh",
    studentEmail: "anjali.singh@student.in",
    state: "Maharashtra",
    district: "Nagpur",
    subject: "Need help filling application",
    description:
      "I am not able to fill the online form. Can someone from CSC help me?",
    category: "assistance_request",
    status: "open",
    priority: "high",
    createdAt: "2026-01-25T11:00:00",
    lastUpdated: "2026-01-25T11:00:00",
    needsAssistance: true,
    assistanceType: "CSC Center",
    messages: [
      {
        id: "m6",
        author: "student",
        text: "Need help filling the form.",
        at: "2026-01-25T11:00:00",
      },
    ],
  },

  /* ---------- KARNATAKA ---------- */
  {
    id: "GRV-KA-001",
    studentId: "STU-KA-02",
    studentName: "Priya Verma",
    studentEmail: "priya.verma@student.in",
    state: "Karnataka",
    district: "Mysuru",
    subject: "Passport name mismatch",
    description:
      "My passport has my full name with middle name but application form only has first and last name. Is this acceptable?",
    category: "document_issue",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-01-13T10:00:00",
    lastUpdated: "2026-01-15T14:30:00",
    response:
      "Please upload a self-attested affidavit confirming both names refer to the same person.",
    messages: [
      {
        id: "m7",
        author: "student",
        text: "Passport name mismatch issue.",
        at: "2026-01-13T10:00:00",
      },
      {
        id: "m8",
        author: "admin",
        text: "Upload a self-attested affidavit.",
        at: "2026-01-15T14:30:00",
      },
    ],
  },
  {
    id: "GRV-KA-002",
    studentId: "STU-KA-04",
    studentName: "Sunita Naga",
    studentEmail: "sunita.naga@student.in",
    state: "Karnataka",
    district: "Hubballi",
    subject: "Marksheet upload issue",
    description:
      "The scanned marksheet appears blurry. I have re-scanned at higher resolution but the portal shows the old file.",
    category: "technical_issue",
    status: "open",
    priority: "high",
    createdAt: "2026-01-17T09:00:00",
    lastUpdated: "2026-01-17T09:00:00",
    needsAssistance: true,
    assistanceType: "CSC Center",
    messages: [
      {
        id: "m9",
        author: "student",
        text: "Marksheet upload issue, need help.",
        at: "2026-01-17T09:00:00",
      },
    ],
  },
  {
    id: "GRV-KA-003",
    studentId: "STU-KA-05",
    studentName: "Deepa Kurumba",
    studentEmail: "deepa.kurumba@student.in",
    state: "Karnataka",
    district: "Belagavi",
    subject: "Waitlist position inquiry",
    description:
      "I was placed on waitlist position 3. When can I expect a final decision?",
    category: "status_inquiry",
    status: "resolved",
    priority: "low",
    createdAt: "2026-01-21T11:00:00",
    lastUpdated: "2026-01-23T16:00:00",
    response: "Waitlist decisions will be communicated by February 15, 2026.",
    messages: [
      {
        id: "m10",
        author: "student",
        text: "Waitlist position inquiry.",
        at: "2026-01-21T11:00:00",
      },
      {
        id: "m11",
        author: "admin",
        text: "Decisions by Feb 15, 2026.",
        at: "2026-01-23T16:00:00",
      },
    ],
  },
  {
    id: "GRV-KA-004",
    studentId: "STU-KA-07",
    studentName: "Rajan Rathwa",
    studentEmail: "rajan.rathwa@student.in",
    state: "Karnataka",
    district: "Kalaburagi",
    subject: "Bonafide certificate delay",
    description:
      "My college is taking time to issue the bonafide certificate. Can I get an extension?",
    category: "document_issue",
    status: "open",
    priority: "medium",
    createdAt: "2026-01-23T14:00:00",
    lastUpdated: "2026-01-23T14:00:00",
    needsAssistance: true,
    assistanceType: "Ashram School Teacher",
    messages: [
      {
        id: "m12",
        author: "student",
        text: "Need extension for bonafide.",
        at: "2026-01-23T14:00:00",
      },
    ],
  },
  {
    id: "GRV-KA-005",
    studentId: "STU-KA-06",
    studentName: "Mohan Garo",
    studentEmail: "mohan.garo@student.in",
    state: "Karnataka",
    district: "Shivamogga",
    subject: "Income certificate discrepancy",
    description:
      "My income certificate is correct as per the revenue department. The AI flag seems to be an error.",
    category: "data_mismatch",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-01-21T08:00:00",
    lastUpdated: "2026-01-22T11:00:00",
    response:
      "Your concern has been forwarded to the scrutiny officer for manual review.",
    messages: [
      {
        id: "m13",
        author: "student",
        text: "AI flag is an error.",
        at: "2026-01-21T08:00:00",
      },
      {
        id: "m14",
        author: "admin",
        text: "Forwarded to scrutiny officer.",
        at: "2026-01-22T11:00:00",
      },
    ],
  },

  /* ---------- DELHI ---------- */
  {
    id: "GRV-DL-001",
    studentId: "STU-DL-01",
    studentName: "Meena Khasi",
    studentEmail: "meena.khasi@student.in",
    state: "Delhi",
    district: "New Delhi",
    subject: "Application status not updating",
    description:
      'My NOS application has been in "under scrutiny" for over 3 weeks now.',
    category: "status_inquiry",
    status: "open",
    priority: "medium",
    createdAt: "2026-01-24T10:00:00",
    lastUpdated: "2026-01-24T10:00:00",
    messages: [
      {
        id: "m15",
        author: "student",
        text: "Status not updating.",
        at: "2026-01-24T10:00:00",
      },
    ],
  },
];

const STATUS_TABS: { key: "" | GrievanceStatus; label: string; icon: any }[] = [
  { key: "", label: "All", icon: Filter },
  { key: "open", label: "Open", icon: Clock },
  { key: "in_progress", label: "In Progress", icon: MessageSquare },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
  { key: "closed", label: "Closed", icon: CheckCircle2 },
];

/* ============================================================
 *  STORAGE
 * ============================================================ */
const GRIEVANCE_KEY = "admin_grievances_v1";
const AUDIT_KEY = "admin_grievances_audit_v1";

const loadGrievances = (): LocalGrievance[] => {
  try {
    const raw = localStorage.getItem(GRIEVANCE_KEY);
    if (!raw) return [...SEED_GRIEVANCES];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [...SEED_GRIEVANCES];
  } catch {
    return [...SEED_GRIEVANCES];
  }
};

const saveGrievances = (list: LocalGrievance[]) =>
  localStorage.setItem(GRIEVANCE_KEY, JSON.stringify(list));

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

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const priorityVariant = (p: GrievancePriority) =>
  p === "high" ? "danger" : p === "medium" ? "warning" : "neutral";

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const AdminGrievances: React.FC = () => {
  const { addToast } = useAppStore();
  const adminUser = useAuthStore((s) => s.user);
  const adminState = adminUser?.state;

  const [list, setList] = useState<LocalGrievance[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [tab, setTab] = useState<"" | GrievanceStatus>("");
  const [stateFilter, setStateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedGrv, setSelectedGrv] = useState<LocalGrievance | null>(null);
  const [response, setResponse] = useState("");
  const [replyStatus, setReplyStatus] =
    useState<GrievanceStatus>("in_progress");
  const [busy, setBusy] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  /* Hydrate */
  useEffect(() => {
    setList(loadGrievances());
    setAudit(loadAudit());
    setHydrated(true);
  }, []);

  /* Persist */
  useEffect(() => {
    if (hydrated) saveGrievances(list);
  }, [list, hydrated]);

  useEffect(() => {
    if (hydrated) saveAudit(audit);
  }, [audit, hydrated]);

  /* Auto-scope admin to their state */
  useEffect(() => {
    if (adminState) setStateFilter(adminState);
  }, [adminState]);

  /* Derived */
  const scoped = useMemo(() => {
    let l = [...list];
    const effState = stateFilter || adminState;
    if (effState) l = l.filter((g) => g.state === effState);
    return l;
  }, [list, stateFilter, adminState]);

  const filtered = useMemo(() => {
    let l = [...scoped];
    if (tab) l = l.filter((g) => g.status === tab);
    if (search) {
      const q = search.toLowerCase();
      l = l.filter(
        (g) =>
          g.subject.toLowerCase().includes(q) ||
          g.studentName.toLowerCase().includes(q) ||
          g.id.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q),
      );
    }
    l.sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    );
    return l;
  }, [scoped, tab, search]);

  const stats = useMemo(
    () => ({
      open: scoped.filter((g) => g.status === "open").length,
      inProgress: scoped.filter((g) => g.status === "in_progress").length,
      resolved: scoped.filter((g) => g.status === "resolved").length,
      high: scoped.filter((g) => g.priority === "high").length,
    }),
    [scoped],
  );

  const uniqueStates = useMemo(() => {
    const s = new Set<string>();
    for (const g of list) if (g.state) s.add(g.state);
    return [...s].sort();
  }, [list]);

  /* Audit */
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

  /* Actions */
  const handleRespond = () => {
    if (!selectedGrv) return;
    if (!response.trim()) {
      addToast("error", "Please enter a response");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      setList((prev) =>
        prev.map((g) =>
          g.id === selectedGrv.id
            ? {
                ...g,
                status: replyStatus,
                response: response.trim(),
                lastUpdated: now,
                messages: [
                  ...g.messages,
                  {
                    id: uid("m"),
                    author: "admin",
                    text: response.trim(),
                    at: now,
                  },
                ],
              }
            : g,
        ),
      );
      pushAudit(
        `REPLY → ${replyStatus}`,
        `${selectedGrv.id} (${selectedGrv.studentName})`,
        response.trim(),
      );
      addToast("success", "Response sent and ticket updated");
      setSelectedGrv(null);
      setResponse("");
      setReplyStatus("in_progress");
      setBusy(false);
    }, 400);
  };

  const quickStatusChange = (g: LocalGrievance, status: GrievanceStatus) => {
    const now = new Date().toISOString();
    setList((prev) =>
      prev.map((x) => (x.id === g.id ? { ...x, status, lastUpdated: now } : x)),
    );
    pushAudit(`STATUS → ${status}`, `${g.id} (${g.studentName})`);
    addToast("info", `Ticket marked ${status.replace("_", " ")}`);
  };

  const refresh = () => {
    setList(loadGrievances());
    setAudit(loadAudit());
    addToast("info", "Grievances refreshed");
  };

  const resetDemo = () => {
    if (!confirm("Reset grievances to demo data?")) return;
    localStorage.removeItem(GRIEVANCE_KEY);
    localStorage.removeItem(AUDIT_KEY);
    setList([...SEED_GRIEVANCES]);
    setAudit([]);
    addToast("info", "Demo data restored");
  };

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
            <Inbox size={24} />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight'>
              {t('grievances.title')}
            </h1>
            <p className='text-sm text-[#64748B] dark:text-slate-400 mt-1'>
              {t('grievances.subtitle')}
            </p>
            {adminUser?.name && (
              <p className='text-xs text-[#64748B] dark:text-slate-400 mt-1 flex items-center gap-1 font-mono'>
                <MapPin size={11} className='text-[#0B75A4]' />
                {t('grievances.signedInAs')} <strong className='font-sans text-[#1D293D] dark:text-slate-200'>{adminUser.name}</strong>
                {adminState ? ` · ${t('grievances.scopedTo')} ${adminState}` : ""}
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
            icon={<RotateCcw size={14} />}
            onClick={resetDemo}
          >
            {t('grievances.resetDemo')}
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
          <p className='text-xs font-semibold text-[#0B75A4] dark:text-[#1697C5] uppercase tracking-wider'>
            {t('grievances.statusOpen')}
          </p>
          <p className='text-2xl font-bold text-[#0B75A4] dark:text-[#1697C5] mt-1'>
            {stats.open}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#F59E0B] uppercase tracking-wider'>
            {t('grievances.statusInProgress')}
          </p>
          <p className='text-2xl font-bold text-[#F59E0B] mt-1'>
            {stats.inProgress}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#009B68] dark:text-emerald-400 uppercase tracking-wider'>
            {t('grievances.statusResolved')}
          </p>
          <p className='text-2xl font-bold text-[#009B68] dark:text-emerald-400 mt-1'>
            {stats.resolved}
          </p>
        </Card>
        <Card className='p-4 border-[#DEE2E6] dark:border-slate-700 shadow-xs'>
          <p className='text-xs font-semibold text-[#EF4444] uppercase tracking-wider'>
            {t('grievances.priority')}
          </p>
          <p className='text-2xl font-bold text-[#EF4444] mt-1'>{stats.high}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-2.5 items-center'>
        {STATUS_TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = tab === tabItem.key;
          const count =
            tabItem.key === ""
              ? scoped.length
              : scoped.filter((g) => g.status === tabItem.key).length;
          const label =
            tabItem.key === ""
              ? t('grievances.allStatuses')
              : tabItem.key === "open"
                ? t('grievances.statusOpen')
                : tabItem.key === "in_progress"
                  ? t('grievances.statusInProgress')
                  : tabItem.key === "resolved"
                    ? t('grievances.statusResolved')
                    : t('grievances.statusClosed');
          return (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#0B75A4] text-white border-[#0B75A4] shadow-xs"
                  : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border-[#DEE2E6] dark:border-slate-700 hover:border-[#0B75A4]"
              }`}
            >
              <Icon size={13} />
              {label} ({count})
            </button>
          );
        })}

        <div className='flex-1' />

        <div className='relative'>
          <Search
            size={14}
            className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]'
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('grievances.searchPlaceholder')}
            className='pl-8 pr-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] w-56'
          />
        </div>

        {adminState ? (
          <div className='px-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-[#F8FAFC] dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 flex items-center gap-1.5'>
            <MapPin size={11} className='text-[#0B75A4]' />
            <strong className='font-semibold'>{adminState}</strong>
          </div>
        ) : (
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className='px-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0B75A4]'
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

      {/* List */}
      <div className='space-y-3'>
        {filtered.map((grv) => (
          <Card
            key={grv.id}
            className='p-5 border-[#DEE2E6] dark:border-slate-700 cursor-pointer hover:border-[#0B75A4] hover:shadow-xs transition-all'
            onClick={() => {
              setSelectedGrv(grv);
              setResponse(grv.response || "");
              setReplyStatus(
                grv.status === "open" ? "in_progress" : grv.status,
              );
            }}
          >
            <div className='flex items-start justify-between gap-3 flex-wrap'>
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 mb-1.5 flex-wrap'>
                  <p className='text-base font-bold text-[#1D293D] dark:text-white'>
                    {grv.subject}
                  </p>
                  <StatusBadge status={grv.status} />
                  <Badge variant={priorityVariant(grv.priority)}>
                    {grv.priority}
                  </Badge>
                  {grv.category && (
                    <Badge variant='info' className='bg-[#E6F1F5] text-[#0B75A4]'>
                      {grv.category.replace(/_/g, " ")}
                    </Badge>
                  )}
                  {grv.needsAssistance && (
                    <Badge variant='purple'>
                      {t('grievances.assistanceBadge')}: {grv.assistanceType}
                    </Badge>
                  )}
                </div>
                <p className='text-xs text-[#64748B] dark:text-slate-400'>
                  {t('auditLog.user')}: <strong className='text-[#1D293D] dark:text-slate-200'>{grv.studentName}</strong> · {grv.district}, {grv.state} ·{" "}
                  {fmtDateTime(grv.createdAt)} · <span className='font-mono'>{grv.id}</span>
                </p>
                <p className='text-sm text-[#64748B] dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed'>
                  {grv.description}
                </p>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                <span className='text-xs text-[#64748B] flex items-center gap-1 font-mono'>
                  <MessageSquare size={13} className='text-[#0B75A4]' /> {grv.messages.length}
                </span>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGrv(grv);
                    setResponse(grv.response || "");
                    setReplyStatus(
                      grv.status === "open" ? "in_progress" : grv.status,
                    );
                  }}
                  icon={<Eye size={14} />}
                >
                  {t('grievances.viewTicket')}
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <EmptyState
            icon={<Inbox size={40} className='text-[#94A3B8]' />}
            title={t('auditLog.noLogs')}
            description={t('auditLog.noLogsDesc')}
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedGrv}
        onClose={() => setSelectedGrv(null)}
        title={`${t('grievances.modalTitle')}: ${selectedGrv?.id ?? ""}`}
        size='lg'
      >
        {selectedGrv && (
          <div className='space-y-4 font-sans text-[#1D293D] dark:text-slate-100'>
            {/* Summary */}
            <div className='grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700'>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('grievances.student')}
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selectedGrv.studentName}
                </p>
                <p className='text-xs text-[#64748B]'>
                  {selectedGrv.studentEmail}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('screening.location')}
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selectedGrv.district}, {selectedGrv.state}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('grievances.priority')}
                </p>
                <div className='mt-1'>
                  <Badge variant={priorityVariant(selectedGrv.priority)}>
                    {selectedGrv.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('grievances.status')}
                </p>
                <div className='mt-1'>
                  <StatusBadge status={selectedGrv.status} />
                </div>
              </div>
            </div>

            {/* Assistance */}
            {selectedGrv.needsAssistance && (
              <div className='p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'>
                <p className='text-xs text-purple-700 dark:text-purple-300'>
                  <strong>{t('grievances.assistanceBadge')}:</strong>{" "}
                  {selectedGrv.assistanceType}
                </p>
              </div>
            )}

            {/* Description */}
            <div className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/40 border border-[#DEE2E6] dark:border-slate-700'>
              <p className='text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1'>
                {t('grievances.subject')}
              </p>
              <p className='font-bold text-sm text-[#1D293D] dark:text-white'>
                {selectedGrv.subject}
              </p>
              <p className='text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-3 mb-1'>
                {t('auditLog.details')}
              </p>
              <p className='text-sm text-[#1D293D] dark:text-slate-300 leading-relaxed whitespace-pre-wrap'>
                {selectedGrv.description}
              </p>
            </div>

            {/* Thread */}
            <div>
              <p className='text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2'>
                {t('grievances.ticketThread')} ({selectedGrv.messages.length})
              </p>
              <div className='max-h-56 overflow-y-auto space-y-2 pr-1'>
                {selectedGrv.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${
                      m.author === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs ${
                        m.author === "admin"
                          ? "bg-[#0B75A4] text-white rounded-br-xs shadow-xs"
                          : "bg-[#F8FAFC] dark:bg-slate-800 text-[#1D293D] dark:text-slate-200 border border-[#DEE2E6] dark:border-slate-700 rounded-bl-xs"
                      }`}
                    >
                      <p className='whitespace-pre-wrap leading-relaxed'>{m.text}</p>
                      <p
                        className={`text-[10px] mt-1.5 font-mono ${
                          m.author === "admin"
                            ? "text-blue-100"
                            : "text-[#64748B]"
                        }`}
                      >
                        {fmtDateTime(m.at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Response */}
            <div>
              <label className='block text-xs font-semibold text-[#1D293D] dark:text-slate-200 mb-1'>
                {t('grievances.reply')}
              </label>
              <textarea
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] resize-none'
                placeholder={t('grievances.searchPlaceholder')}
              />
            </div>

            <div>
              <label className='block text-xs font-semibold text-[#1D293D] dark:text-slate-200 mb-1'>
                {t('grievances.status')}
              </label>
              <select
                value={replyStatus}
                onChange={(e) =>
                  setReplyStatus(e.target.value as GrievanceStatus)
                }
                className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4]'
              >
                <option value='in_progress'>{t('grievances.statusInProgress')}</option>
                <option value='resolved'>{t('grievances.statusResolved')}</option>
                <option value='escalated'>{t('grievances.statusEscalated')}</option>
                <option value='open'>{t('grievances.statusOpen')}</option>
                <option value='closed'>{t('grievances.statusClosed')}</option>
              </select>
            </div>

            {/* Actions */}
            <div className='flex flex-wrap gap-2.5 pt-3 border-t border-[#DEE2E6] dark:border-slate-700 justify-end'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  quickStatusChange(selectedGrv, "resolved");
                  setSelectedGrv(null);
                }}
              >
                {t('grievances.resolveTicket')}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  quickStatusChange(selectedGrv, "escalated");
                  setSelectedGrv(null);
                }}
              >
                {t('grievances.escalateToMinistry')}
              </Button>
              <Button
                onClick={handleRespond}
                disabled={busy}
                icon={<Send size={14} />}
              >
                {busy ? t('communication.sending') : t('grievances.sendReply')}
              </Button>
            </div>
          </div>
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
          <p className='text-sm text-[#94A3B8] italic'>{t('auditLog.noLogs')}</p>
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

export default AdminGrievances;
