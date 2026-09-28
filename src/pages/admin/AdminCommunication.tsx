import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, Button, Badge, Modal } from "../../components/ui";
import { useAppStore, useAuthStore } from "../../store";
import {
  Send,
  Users,
  Search,
  MapPin,
  History,
  Eye,
  Mail,
  MessageSquare,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

/* ============================================================
 *  LOCAL TYPES
 * ============================================================ */
interface StudentLite {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state: string;
  district: string;
}

type NoticeType = "general" | "deadline" | "document_required" | "disbursal";

interface NoticeLog {
  id: string;
  at: string;
  actor: string;
  type: NoticeType;
  subject: string;
  message: string;
  recipientCount: number;
  recipients: { id: string; name: string }[];
  group: string;
}

/* ============================================================
 *  LOCAL MOCK DATA — this page only
 * ============================================================ */
const SEED_STUDENTS: StudentLite[] = [
  /* ---------- MAHARASHTRA ---------- */
  {
    id: "STU-MH-01",
    name: "Priya Gond",
    email: "priya.gond@student.in",
    phone: "9876543210",
    state: "Maharashtra",
    district: "Mumbai",
  },
  {
    id: "STU-MH-02",
    name: "Rahul Sharma",
    email: "rahul.sharma@student.in",
    phone: "9876543211",
    state: "Maharashtra",
    district: "Pune",
  },
  {
    id: "STU-MH-03",
    name: "Anjali Singh",
    email: "anjali.singh@student.in",
    phone: "9876543212",
    state: "Maharashtra",
    district: "Nagpur",
  },
  {
    id: "STU-MH-04",
    name: "Vikram Patel",
    email: "vikram.patel@student.in",
    phone: "9876543213",
    state: "Maharashtra",
    district: "Thane",
  },

  /* ---------- KARNATAKA ---------- */
  {
    id: "STU-KA-01",
    name: "Lakshmi Santhal",
    email: "lakshmi.santhal@student.in",
    phone: "9876543214",
    state: "Karnataka",
    district: "Bengaluru",
  },
  {
    id: "STU-KA-02",
    name: "Priya Verma",
    email: "priya.verma@student.in",
    phone: "9876543215",
    state: "Karnataka",
    district: "Mysuru",
  },
  {
    id: "STU-KA-03",
    name: "Vikram Patel",
    email: "vikram.p@student.in",
    phone: "9876543216",
    state: "Karnataka",
    district: "Mangaluru",
  },
  {
    id: "STU-KA-04",
    name: "Sunita Naga",
    email: "sunita.naga@student.in",
    phone: "9876543217",
    state: "Karnataka",
    district: "Hubballi",
  },
  {
    id: "STU-KA-05",
    name: "Deepa Kurumba",
    email: "deepa.kurumba@student.in",
    phone: "9876543218",
    state: "Karnataka",
    district: "Belagavi",
  },
  {
    id: "STU-KA-06",
    name: "Mohan Garo",
    email: "mohan.garo@student.in",
    phone: "9876543219",
    state: "Karnataka",
    district: "Shivamogga",
  },
  {
    id: "STU-KA-07",
    name: "Rajan Rathwa",
    email: "rajan.rathwa@student.in",
    phone: "9876543220",
    state: "Karnataka",
    district: "Kalaburagi",
  },

  /* ---------- DELHI ---------- */
  {
    id: "STU-DL-01",
    name: "Meena Khasi",
    email: "meena.khasi@student.in",
    phone: "9876543221",
    state: "Delhi",
    district: "New Delhi",
  },
  {
    id: "STU-DL-02",
    name: "Kaviti Kondh",
    email: "kaviti.kondh@student.in",
    phone: "9876543222",
    state: "Delhi",
    district: "New Delhi",
  },

  /* ---------- GUJARAT ---------- */
  {
    id: "STU-GJ-01",
    name: "Rajan Rathwa",
    email: "rajan.r@student.in",
    phone: "9876543223",
    state: "Gujarat",
    district: "Ahmedabad",
  },
  {
    id: "STU-GJ-02",
    name: "Bhim Sahariya",
    email: "bhim.sahariya@student.in",
    phone: "9876543224",
    state: "Gujarat",
    district: "Surat",
  },
];

const NOTICE_TYPE_LABELS: Record<NoticeType, string> = {
  general: "General Notice",
  deadline: "Deadline Reminder",
  document_required: "Document Required",
  disbursal: "Disbursal Update",
};

/* ============================================================
 *  STORAGE
 * ============================================================ */
const LOG_KEY = "admin_communication_log_v1";

const loadLog = (): NoticeLog[] => {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLog = (list: NoticeLog[]) =>
  localStorage.setItem(LOG_KEY, JSON.stringify(list));

const uid = (p = "id") =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const AdminCommunication: React.FC = () => {
  const { addToast } = useAppStore();
  const adminUser = useAuthStore((s) => s.user);
  const adminState = adminUser?.state;

  const [students, setStudents] = useState<StudentLite[]>([]);
  const [log, setLog] = useState<NoticeLog[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* Pickers */
  const [group, setGroup] = useState<"all" | "state_wise">("all");
  const [stateFilter, setStateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [recipientIds, setRecipientIds] = useState<string[]>([]);

  /* Compose */
  const [type, setType] = useState<NoticeType>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  /* Log modal */
  const [showLog, setShowLog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<NoticeLog | null>(null);
  const { t } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  /* ---------- Hydrate ---------- */
  useEffect(() => {
    setStudents(SEED_STUDENTS);
    setLog(loadLog());
    setHydrated(true);
  }, []);

  /* ---------- Persist log ---------- */
  useEffect(() => {
    if (hydrated) saveLog(log);
  }, [log, hydrated]);

  /* ---------- Auto-scope admin to their state ---------- */
  useEffect(() => {
    if (adminState) setStateFilter(adminState);
  }, [adminState]);

  /* ---------- Derived ---------- */
  const uniqueStates = useMemo(() => {
    const s = new Set<string>();
    for (const st of SEED_STUDENTS) s.add(st.state);
    return [...s].sort();
  }, []);

  /* Students after group/state filter */
  const inScope = useMemo(() => {
    let list = [...students];

    // group filter
    if (group === "state_wise") {
      if (stateFilter) list = list.filter((s) => s.state === stateFilter);
    } else {
      // 'all' — still scope to admin's state by default
      if (adminState && !stateFilter) {
        list = list.filter((s) => s.state === adminState);
      } else if (stateFilter) {
        list = list.filter((s) => s.state === stateFilter);
      }
    }

    // search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [students, group, stateFilter, search, adminState]);

  const selectedStudents = useMemo(
    () => students.filter((s) => recipientIds.includes(s.id)),
    [students, recipientIds],
  );

  /* ---------- Actions ---------- */
  const toggle = (id: string) =>
    setRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const selectAllShown = () => setRecipientIds(inScope.map((s) => s.id));
  const clearAll = () => setRecipientIds([]);

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) {
      addToast("error", "Subject and message are required");
      return;
    }
    if (recipientIds.length === 0) {
      addToast("error", "Select at least one recipient");
      return;
    }
    setSending(true);

    setTimeout(() => {
      const entry: NoticeLog = {
        id: uid("notice"),
        at: new Date().toISOString(),
        actor: adminUser?.name ?? "Admin",
        type,
        subject: subject.trim(),
        message: message.trim(),
        recipientCount: recipientIds.length,
        recipients: selectedStudents.map((s) => ({ id: s.id, name: s.name })),
        group,
      };

      setLog((prev) => [entry, ...prev].slice(0, 200));
      addToast(
        "success",
        `Notice delivered to ${recipientIds.length} student${
          recipientIds.length === 1 ? "" : "s"
        }`,
      );

      setSubject("");
      setMessage("");
      setRecipientIds([]);
      setSending(false);
    }, 400);
  };

  const resetDemo = () => {
    if (!confirm("Clear communication log?")) return;
    localStorage.removeItem(LOG_KEY);
    setLog([]);
    addToast("info", "Communication log cleared");
  };

  /* ---------- Loading skeleton ---------- */
  if (!hydrated) {
    return (
      <div className='p-6 max-w-7xl mx-auto'>
        <div className='animate-pulse space-y-4'>
          <div className='h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/3' />
          <div className='h-64 bg-slate-200 dark:bg-slate-800 rounded' />
        </div>
      </div>
    );
  }

  const getNoticeTypeLabel = (noticeType: NoticeType) => {
    switch (noticeType) {
      case "general":
        return t("communication.typeGeneral");
      case "deadline":
        return t("communication.typeDeadline");
      case "document_required":
        return t("communication.typeDoc");
      case "disbursal":
        return t("communication.typeDisbursal");
      default:
        return noticeType;
    }
  };

  return (
    <div className='p-4 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto font-sans text-[#1D293D] dark:text-slate-100'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5'>
        <div className='flex items-start gap-3'>
          <div className='p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5'>
            <Mail size={24} />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight'>
              {t('communication.title')}
            </h1>
            <p className='text-sm text-[#64748B] dark:text-slate-400 mt-1'>
              {t('communication.subtitle')}
            </p>
            {adminUser?.name && (
              <p className='text-xs text-[#64748B] dark:text-slate-400 mt-1 flex items-center gap-1 font-mono'>
                <MapPin size={11} className='text-[#0B75A4]' />
                {t('communication.signedInAs')} <strong className='font-sans text-[#1D293D] dark:text-slate-200'>{adminUser.name}</strong>
                {adminState ? ` · ${t('communication.scopedTo')} ${adminState}` : ""}
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
            onClick={() => setShowLog(true)}
          >
            {t('communication.noticeHistory')} ({log.length})
          </Button>
          <Button
            size='sm'
            variant='outline'
            icon={<RotateCcw size={14} />}
            onClick={resetDemo}
          >
            {t('communication.clearAll')}
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Recipient picker */}
        <Card className='p-5 border-[#DEE2E6] dark:border-slate-700 shadow-xs space-y-3.5'>
          <div className='flex items-center justify-between'>
            <h3 className='text-base font-bold text-[#1D293D] dark:text-white flex items-center gap-2'>
              <Users size={16} className='text-[#0B75A4]' /> {t('communication.recipients')}
            </h3>
            <Badge variant='info' className='bg-[#E6F1F5] text-[#0B75A4] dark:bg-[#0B75A4]/20 dark:text-[#1697C5]'>
              {t('communication.selectedRecipients', { count: recipientIds.length })}
            </Badge>
          </div>

          <div className='flex gap-2.5'>
            <select
              value={group}
              onChange={(e) => setGroup(e.target.value as any)}
              className='flex-1 px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0B75A4]'
            >
              <option value='all'>{t('communication.groupAll')}</option>
              <option value='state_wise'>{t('communication.groupState')}</option>
            </select>

            {adminState && group === "all" ? (
              <div className='flex-1 px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-[#F8FAFC] dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 flex items-center gap-1.5'>
                <MapPin size={12} className='text-[#0B75A4]' />
                <strong className='font-semibold'>{adminState}</strong>
              </div>
            ) : (
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className='flex-1 px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-300 outline-none focus:ring-2 focus:ring-[#0B75A4]'
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

          <div className='relative'>
            <Search
              size={15}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]'
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('communication.searchStudents')}
              className='w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]'
            />
          </div>

          <div className='flex gap-2 flex-wrap'>
            <Button size='sm' variant='outline' onClick={selectAllShown}>
              {t('communication.selectAll')} ({inScope.length})
            </Button>
            <Button size='sm' variant='ghost' onClick={clearAll}>
              {t('communication.clearAll')}
            </Button>
          </div>

          <div className='max-h-72 overflow-y-auto divide-y divide-[#DEE2E6] dark:divide-slate-700 border border-[#DEE2E6] dark:border-slate-700 rounded-xl'>
            {inScope.length === 0 && (
              <p className='p-3 text-sm text-[#64748B] italic'>{t('communication.noMessages')}</p>
            )}
            {inScope.map((s) => (
              <label
                key={s.id}
                className='flex items-center gap-3 p-3 hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 cursor-pointer transition-colors'
              >
                <input
                  type='checkbox'
                  checked={recipientIds.includes(s.id)}
                  onChange={() => toggle(s.id)}
                  className='rounded border-[#CBD5E1] text-[#0B75A4] focus:ring-[#0B75A4] w-4 h-4'
                />
                <span className='flex-1 min-w-0'>
                  <span className='block text-xs font-bold text-[#1D293D] dark:text-white truncate'>
                    {s.name}
                  </span>
                  <span className='block text-[11px] text-[#64748B] truncate mt-0.5'>
                    {s.email} · {s.district}, {s.state}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {selectedStudents.length > 0 && (
            <div className='p-3 rounded-xl bg-[#E6F1F5]/60 dark:bg-slate-800/60 border border-[#0B75A4]/20 dark:border-slate-700'>
              <p className='text-xs text-[#0B75A4] dark:text-[#1697C5] font-medium'>
                <strong>{selectedStudents.length}</strong> {t('communication.recipients')} ·{" "}
                {[...new Set(selectedStudents.map((s) => s.state))].join(", ")}
              </p>
            </div>
          )}
        </Card>

        {/* Compose */}
        <Card className='p-5 border-[#DEE2E6] dark:border-slate-700 shadow-xs space-y-4'>
          <h3 className='text-base font-bold text-[#1D293D] dark:text-white flex items-center gap-2'>
            <Mail size={16} className='text-[#0B75A4]' /> {t('communication.compose')}
          </h3>

          <div>
            <label className='block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1'>
              {t('communication.noticeType')}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as NoticeType)}
              className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4]'
            >
              {(["general", "deadline", "document_required", "disbursal"] as NoticeType[]).map((k) => (
                <option key={k} value={k}>
                  {getNoticeTypeLabel(k)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1'>
              {t('communication.messageSubject')}
            </label>
            <input
              type='text'
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]'
              placeholder={t('communication.subjectPlaceholder')}
            />
          </div>

          <div>
            <label className='block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1'>
              {t('communication.messageBody')}
            </label>
            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] resize-none'
              placeholder={t('communication.messagePlaceholder')}
            />
            <p className='text-[11px] text-[#94A3B8] font-mono mt-1'>
              {message.length} characters
            </p>
          </div>

          {/* Quick templates */}
          <div className='flex flex-wrap gap-1.5'>
            <p className='text-[11px] font-semibold text-[#64748B] w-full'>
              {t('communication.template')}:
            </p>
            {[
              {
                label: t('communication.typeDeadline'),
                t: "deadline",
                s: "Renewal deadline approaching",
                m: "Dear Student,\n\nYour scholarship renewal deadline is approaching. Please submit your renewal application with the required documents before the deadline to avoid lapse.\n\nRegards,\nMoTA",
              },
              {
                label: t('communication.typeDoc'),
                t: "document_required",
                s: "Document re-upload required",
                m: "Dear Student,\n\nWe could not read one of your uploaded documents clearly. Please re-upload a fresh copy through your document vault.\n\nRegards,\nMoTA",
              },
              {
                label: t('communication.typeDisbursal'),
                t: "disbursal",
                s: "Scholarship amount disbursed",
                m: "Dear Student,\n\nThe scholarship amount has been disbursed to your registered bank account. Please check your passbook and confirm.\n\nRegards,\nMoTA",
              },
            ].map((tpl) => (
              <button
                key={tpl.t}
                type='button'
                onClick={() => {
                  setType(tpl.t as NoticeType);
                  setSubject(tpl.s);
                  setMessage(tpl.m);
                }}
                className='px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#DEE2E6] dark:border-slate-600 hover:border-[#0B75A4] hover:bg-[#E6F1F5]/40 text-[#1D293D] dark:text-slate-300 transition-colors'
              >
                {tpl.label}
              </button>
            ))}
          </div>

          <Button
            icon={<Send size={14} />}
            onClick={handleSend}
            disabled={sending || recipientIds.length === 0}
            className='w-full'
          >
            {sending
              ? t('communication.sending')
              : `${t('communication.sendNotice')} (${recipientIds.length})`}
          </Button>

          {recipientIds.length === 0 && (
            <p className='text-[11px] text-[#F59E0B] flex items-center gap-1 font-medium'>
              <AlertCircle size={12} /> {t('communication.recipients')}
            </p>
          )}
        </Card>
      </div>

      {/* Log Modal */}
      <Modal
        isOpen={showLog}
        onClose={() => setShowLog(false)}
        title={t('communication.noticeHistory')}
        size='lg'
      >
        {log.length === 0 ? (
          <p className='text-sm text-[#94A3B8] italic'>{t('communication.noHistory')}</p>
        ) : (
          <div className='space-y-2 max-h-[60vh] overflow-y-auto font-sans text-[#1D293D] dark:text-slate-100'>
            {log.map((e) => (
              <div
                key={e.id}
                className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700 cursor-pointer hover:border-[#0B75A4] transition-all'
                onClick={() => setSelectedLog(e)}
              >
                <div className='flex items-center justify-between gap-2 flex-wrap'>
                  <span className='text-xs font-bold text-[#1D293D] dark:text-white'>
                    {e.subject}
                  </span>
                  <span className='text-[10px] text-[#94A3B8] font-mono'>
                    {new Date(e.at).toLocaleString("en-IN")}
                  </span>
                </div>
                <p className='text-xs text-[#64748B] dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap'>
                  <Badge variant='info' className='bg-[#E6F1F5] text-[#0B75A4]'>{getNoticeTypeLabel(e.type)}</Badge>
                  <span>
                    → <strong className='text-[#1D293D] dark:text-slate-200'>{e.recipientCount}</strong> {t('communication.recipients')} · by{" "}
                    <strong className='text-[#1D293D] dark:text-slate-200'>{e.actor}</strong>
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Log Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={selectedLog?.subject ?? ""}
        size='lg'
      >
        {selectedLog && (
          <div className='space-y-4 font-sans text-[#1D293D] dark:text-slate-100'>
            <div className='grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700'>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('communication.noticeType')}
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {getNoticeTypeLabel(selectedLog.type)}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('auditLog.timestamp', 'Sent At')}
                </p>
                <p className='text-sm font-bold font-mono text-[#1D293D] dark:text-white mt-0.5'>
                  {new Date(selectedLog.at).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('auditLog.user', 'By')}
                </p>
                <p className='text-sm font-bold text-[#1D293D] dark:text-white mt-0.5'>
                  {selectedLog.actor}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-semibold text-[#64748B] uppercase'>
                  {t('communication.recipients')}
                </p>
                <p className='text-sm font-bold text-[#0B75A4] mt-0.5'>
                  {selectedLog.recipientCount}
                </p>
              </div>
            </div>

            <div>
              <p className='text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1'>
                {t('communication.message')}
              </p>
              <pre className='p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700 text-xs whitespace-pre-wrap font-sans text-[#1D293D] dark:text-slate-300 max-h-48 overflow-auto leading-relaxed'>
                {selectedLog.message}
              </pre>
            </div>

            <div>
              <p className='text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1'>
                {t('communication.recipients')} ({selectedLog.recipients.length})
              </p>
              <ul className='max-h-48 overflow-y-auto border border-[#DEE2E6] dark:border-slate-700 rounded-xl divide-y divide-[#DEE2E6] dark:divide-slate-700'>
                {selectedLog.recipients.map((r) => (
                  <li
                    key={r.id}
                    className='p-2.5 text-xs text-[#1D293D] dark:text-slate-300 flex items-center justify-between'
                  >
                    <span className='font-medium'>{r.name}</span>
                    <span className='font-mono text-[#64748B]'>{r.id}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminCommunication;
