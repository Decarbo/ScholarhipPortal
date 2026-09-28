import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  StatusBadge,
  Button,
  EmptyState,
  Modal,
  Skeleton,
} from "../../components/ui";
import { VoiceInput, CSCFinder } from "../../components/accessibility";
import { useAppStore } from "../../store";
import {
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Search,
  Download,
  Upload,
  RefreshCw,
  Send,
  Paperclip,
  ChevronRight,
  Filter,
  ArrowUpDown,
  LifeBuoy,
  Loader2,
} from "lucide-react";

/* ============================================================
 *  TYPES
 * ============================================================ */
export type GrievanceStatus = "open" | "in_progress" | "resolved" | "closed";
export type GrievancePriority = "low" | "medium" | "high";

export interface GrievanceMessage {
  id: string;
  author: "student" | "support";
  text: string;
  at: string;
}

export interface GrievanceAttachment {
  id: string;
  name: string;
  size: number;
}

export interface LocalGrievance {
  id: string;
  subject: string;
  description: string;
  status: GrievanceStatus;
  priority: GrievancePriority;
  createdAt: string;
  updatedAt: string;
  needsAssistance: boolean;
  assistanceType?: string;
  attachments: GrievanceAttachment[];
  messages: GrievanceMessage[];
  response?: string; // final response (mirrors last support message)
}

/* ============================================================
 *  STORAGE
 * ============================================================ */
const STORAGE_KEY = "student_grievances_v1";

const loadGrievances = (): LocalGrievance[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedGrievances();
  } catch {
    return seedGrievances();
  }
};
const saveGrievances = (g: LocalGrievance[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(g));

/* ============================================================
 *  SEED (first run only)
 * ============================================================ */
function seedGrievances(): LocalGrievance[] {
  const now = Date.now();
  const ago = (h: number) => new Date(now - h * 3600_000).toISOString();
  return [
    {
      id: "GRV-2024-1001",
      subject: "Scholarship amount not credited",
      description:
        "My Post Matric Scholarship was approved 15 days ago but the amount has not been credited to my bank account yet.",
      status: "in_progress",
      priority: "high",
      createdAt: ago(72),
      updatedAt: ago(4),
      needsAssistance: false,
      attachments: [{ id: "a1", name: "bank_statement.pdf", size: 182_400 }],
      messages: [
        {
          id: "m1",
          author: "student",
          text: "My scholarship amount is not credited.",
          at: ago(72),
        },
        {
          id: "m2",
          author: "support",
          text: "We have escalated this to the disbursement team. Please share your bank passbook copy.",
          at: ago(48),
        },
        {
          id: "m3",
          author: "student",
          text: "Attached my bank statement.",
          at: ago(24),
        },
        {
          id: "m4",
          author: "support",
          text: "Thanks. We are verifying with the bank. Expected resolution within 5 working days.",
          at: ago(4),
        },
      ],
      response:
        "We are verifying with the bank. Expected resolution within 5 working days.",
    },
    {
      id: "GRV-2024-1002",
      subject: "Unable to upload income certificate",
      description:
        "The portal shows an error whenever I try to upload my income certificate PDF.",
      status: "resolved",
      priority: "medium",
      createdAt: ago(200),
      updatedAt: ago(120),
      needsAssistance: true,
      assistanceType: "CSC Center",
      attachments: [],
      messages: [
        {
          id: "m5",
          author: "student",
          text: "Upload fails with error 500.",
          at: ago(200),
        },
        {
          id: "m6",
          author: "support",
          text: "The issue was due to file size. Please keep the PDF under 2 MB.",
          at: ago(150),
        },
        {
          id: "m7",
          author: "student",
          text: "It worked, thank you!",
          at: ago(120),
        },
      ],
      response:
        "The issue was due to file size. Please keep the PDF under 2 MB.",
    },
  ];
}

/* ============================================================
 *  HELPERS
 * ============================================================ */
const uid = (p = "id") =>
  `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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
    hour: "2-digit",
    minute: "2-digit",
  });

const priorityVariant = (p: GrievancePriority) =>
  p === "high" ? "danger" : p === "medium" ? "warning" : "neutral";

const statusColor = (s: GrievanceStatus) =>
  s === "open"
    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50"
    : s === "in_progress"
      ? "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50"
      : s === "resolved"
        ? "bg-[#2E6B4F]/10 text-[#2E6B4F] dark:bg-emerald-900/30 dark:text-emerald-300 border border-[#2E6B4F]/20 dark:border-emerald-800/50"
        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700";

/** SLA in hours based on priority */
const slaHours = (p: GrievancePriority) =>
  p === "high" ? 24 : p === "medium" ? 72 : 168;

const timeSince = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3600_000);
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const Issues: React.FC = () => {
  const { addToast } = useAppStore();
  const [grievances, setGrievances] = useState<LocalGrievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [needsAssistance, setNeedsAssistance] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /* filters */
  const [filter, setFilter] = useState<"all" | GrievanceStatus>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "priority">("recent");

  /* form state */
  const [form, setForm] = useState({
    subject: "",
    description: "",
    priority: "medium" as GrievancePriority,
    assistanceType: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<GrievanceAttachment[]>([]);
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const fileRef = useRef<HTMLInputElement>(null);

  /* load once */
  useEffect(() => {
    setGrievances(loadGrievances());
    setLoading(false);
  }, []);

  /* persist */
  useEffect(() => {
    if (!loading) saveGrievances(grievances);
  }, [grievances, loading]);

  const selected = useMemo(
    () => grievances.find((g) => g.id === selectedId) || null,
    [grievances, selectedId],
  );

  /* ---------- filtering + sorting ---------- */
  const visible = useMemo(() => {
    let list = grievances;
    if (filter !== "all") list = list.filter((g) => g.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (g) =>
          g.subject.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.id.toLowerCase().includes(q),
      );
    }
    if (sort === "priority") {
      const rank: Record<GrievancePriority, number> = {
        high: 0,
        medium: 1,
        low: 2,
      };
      list = [...list].sort((a, b) => rank[a.priority] - rank[b.priority]);
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return list;
  }, [grievances, filter, query, sort]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: grievances.length };
    for (const g of grievances) c[g.status] = (c[g.status] ?? 0) + 1;
    return c;
  }, [grievances]);

  /* ---------- form ---------- */
  const resetForm = () => {
    setForm({
      subject: "",
      description: "",
      priority: "medium",
      assistanceType: "",
    });
    setAttachments([]);
    setNeedsAssistance(false);
    setFormErrors([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAttach = (files: FileList | null) => {
    if (!files) return;
    const next: GrievanceAttachment[] = Array.from(files)
      .slice(0, 5)
      .map((f) => ({
        id: uid("a"),
        name: f.name,
        size: f.size,
      }));
    setAttachments((prev) => [...prev, ...next].slice(0, 5));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (form.subject.trim().length < 4)
      errs.push("Subject must be at least 4 characters");
    if (form.description.trim().length < 10)
      errs.push("Description must be at least 10 characters");
    if (needsAssistance && !form.assistanceType)
      errs.push("Please choose the type of assistance");
    setFormErrors(errs);
    if (errs.length > 0) return;

    const now = new Date().toISOString();
    const id = `GRV-${new Date().getFullYear()}-${String(grievances.length + 1001).padStart(4, "0")}`;
    const newGrv: LocalGrievance = {
      id,
      subject: form.subject.trim(),
      description: form.description.trim(),
      status: "open",
      priority: form.priority,
      createdAt: now,
      updatedAt: now,
      needsAssistance,
      assistanceType: needsAssistance ? form.assistanceType : undefined,
      attachments,
      messages: [
        {
          id: uid("m"),
          author: "student",
          text: form.description.trim(),
          at: now,
        },
      ],
    };
    setGrievances((prev) => [newGrv, ...prev]);
    addToast("success", `Ticket ${id} created`);
    resetForm();
    setShowForm(false);

    // Simulate backend: auto-progress to in_progress after ~3s
    setTimeout(() => {
      setGrievances((prev) =>
        prev.map((g) =>
          g.id === id && g.status === "open"
            ? {
                ...g,
                status: "in_progress",
                updatedAt: new Date().toISOString(),
                messages: [
                  ...g.messages,
                  {
                    id: uid("m"),
                    author: "support",
                    text: "Thank you for reaching out. Our team is reviewing your ticket and will respond shortly.",
                    at: new Date().toISOString(),
                  },
                ],
              }
            : g,
        ),
      );
    }, 3000);

    // Simulate resolution after ~12s
    setTimeout(() => {
      setGrievances((prev) =>
        prev.map((g) => {
          if (g.id !== id || g.status === "resolved" || g.status === "closed")
            return g;
          const reply =
            g.priority === "high"
              ? "We have escalated your case to the senior officer. You should receive an update within 24 hours."
              : "Your issue has been reviewed and resolved. Please reply if you need further help.";
          return {
            ...g,
            status: "resolved",
            updatedAt: new Date().toISOString(),
            response: reply,
            messages: [
              ...g.messages,
              {
                id: uid("m"),
                author: "support",
                text: reply,
                at: new Date().toISOString(),
              },
            ],
          };
        }),
      );
    }, 12000);
  };

  /* ---------- actions ---------- */
  const handleReply = (id: string, text: string) => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: g.status === "resolved" ? "in_progress" : g.status,
              updatedAt: now,
              messages: [
                ...g.messages,
                { id: uid("m"), author: "student", text: text.trim(), at: now },
              ],
            }
          : g,
      ),
    );
    addToast("success", "Reply sent");

    // fake auto-response
    setTimeout(() => {
      setGrievances((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                updatedAt: new Date().toISOString(),
                messages: [
                  ...g.messages,
                  {
                    id: uid("m"),
                    author: "support",
                    text: "Thanks for the update. We will get back to you soon.",
                    at: new Date().toISOString(),
                  },
                ],
              }
            : g,
        ),
      );
    }, 2500);
  };

  const handleStatusChange = (id: string, status: GrievanceStatus) => {
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status, updatedAt: new Date().toISOString() } : g,
      ),
    );
    addToast("info", `Ticket marked as ${status.replace("_", " ")}`);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this ticket?")) return;
    setGrievances((prev) => prev.filter((g) => g.id !== id));
    if (selectedId === id) setSelectedId(null);
    addToast("info", "Ticket removed");
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(grievances, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grievances-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const r = new FileReader();
    r.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result));
        if (!Array.isArray(parsed)) throw new Error("bad");
        setGrievances(parsed);
        addToast("success", "Tickets imported");
      } catch {
        addToast("error", "Invalid file");
      }
    };
    r.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm("Reset all tickets to demo data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setGrievances(seedGrievances());
    addToast("info", "Grievances reset");
  };

  if (loading)
    return (
      <div className='p-4 md:p-8 space-y-4 max-w-5xl mx-auto'>
        <Skeleton className='h-64 rounded-md bg-[#1B2434]/5 dark:bg-slate-800' />
      </div>
    );

  return (
    <div className='p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5'>
        <div className='flex items-start gap-3'>
          <div className="p-2 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#7EC5E2] shrink-0 mt-0.5">
            <LifeBuoy size={24} />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-[#1D293D] dark:text-white leading-tight'>
              {t('issues.title')}
            </h1>
            <p className='text-sm text-[#64748B] dark:text-slate-400 mt-0.5'>
              {t('issues.subtitle')}
            </p>
          </div>
        </div>

        <div className='flex gap-2 flex-wrap items-center shrink-0'>
          <Badge variant='success'>{t('issues.frontendOnly')}</Badge>
          <CSCFinder studentState='Maharashtra' />
          <Button
            size='sm'
            variant='secondary'
            icon={<Download size={14} />}
            onClick={handleExport}
          >
            {tc('actions.export') || 'Export'}
          </Button>
          <label className='cursor-pointer'>
            <input
              type='file'
              accept='.json'
              className='hidden'
              onChange={(e) =>
                e.target.files?.[0] && handleImport(e.target.files[0])
              }
            />
            <span className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-200 hover:bg-[#F8FAFC] hover:text-[#0B75A4] hover:border-[#0B75A4]/40 transition-all shadow-xs'>
              <Upload size={14} /> {tc('actions.import') || 'Import'}
            </span>
          </label>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleReset}
            icon={<RefreshCw size={14} />}
            title='Reset demo data'
          >
            Reset
          </Button>
          <Button
            size='sm'
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setShowForm((v) => !v)}
          >
            {t('issues.raiseTicket')}
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className='border border-[#DEE2E6] dark:border-slate-700 rounded-xl shadow-xs p-5 md:p-6 bg-white dark:bg-slate-800'>
          <h3 className='text-base font-semibold text-[#1D293D] dark:text-white mb-4 flex items-center gap-2'>
            <LifeBuoy
              size={18}
              className='text-[#0B75A4]'
            />{" "}
            {t('issues.newTicket')}
          </h3>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-xs font-semibold text-[#475569] dark:text-slate-300 mb-1'>
                {t('issues.subject')} *
              </label>
              <div className='relative'>
                <input
                  type='text'
                  value={form.subject}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, subject: e.target.value }))
                  }
                  className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:border-[#0B75A4] focus:ring-2 focus:ring-[#0B75A4]/20 transition-all placeholder:text-[#94A3B8] pr-16'
                  placeholder={t('issues.subjectPlaceholder')}
                />
                <VoiceInput
                  onTranscript={(t) =>
                    setForm((f) => ({
                      ...f,
                      subject: (f.subject + " " + t).trim(),
                    }))
                  }
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div>
                <label className='block text-xs font-semibold text-[#475569] dark:text-slate-300 mb-1'>
                  {t('issues.priority')}
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as GrievancePriority,
                    }))
                  }
                  className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:border-[#0B75A4] focus:ring-2 focus:ring-[#0B75A4]/20 transition-all'
                >
                  <option value='low'>{t('issues.priorityLow')}</option>
                  <option value='medium'>{t('issues.priorityMed')}</option>
                  <option value='high'>{t('issues.priorityHigh')}</option>
                </select>
              </div>
            </div>

            <div>
              <label className='block text-xs font-semibold text-[#475569] dark:text-slate-300 mb-1'>
                {t('issues.description')} *
              </label>
              <div className='relative'>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:border-[#0B75A4] focus:ring-2 focus:ring-[#0B75A4]/20 transition-all placeholder:text-[#94A3B8] resize-none pr-16 leading-relaxed'
                  placeholder={t('issues.descriptionPlaceholder')}
                />
                <VoiceInput
                  onTranscript={(t) =>
                    setForm((f) => ({
                      ...f,
                      description: (f.description + " " + t).trim(),
                    }))
                  }
                />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className='block text-xs font-semibold text-[#1B2434] dark:text-slate-300 mb-1'>
                Attachments (optional, up to 5)
              </label>
              <input
                ref={fileRef}
                type='file'
                multiple
                className='hidden'
                onChange={(e) => handleAttach(e.target.files)}
              />
              <button
                type='button'
                onClick={() => fileRef.current?.click()}
                className='inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline'
              >
                <Paperclip size={13} /> Add files
              </button>
              {attachments.length > 0 && (
                <ul className='mt-2 space-y-1.5'>
                  {attachments.map((a) => (
                    <li
                      key={a.id}
                      className='flex items-center justify-between text-xs text-[#1B2434] dark:text-slate-300 bg-[#1B2434]/5 dark:bg-slate-800/60 rounded-md px-3 py-1.5'
                    >
                      <span className='truncate'>
                        {a.name}{" "}
                        <span className='text-slate-400 font-mono text-[11px]'>
                          ({(a.size / 1024).toFixed(1)} KB)
                        </span>
                      </span>
                      <button
                        type='button'
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((x) => x.id !== a.id),
                          )
                        }
                        className='text-[#B4472A] hover:bg-red-50 dark:hover:bg-red-900/20 rounded p-0.5 transition-all'
                      >
                        <XCircle size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Assistance */}
            <div className='p-3.5 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/50 border border-[#1B2434]/10 dark:border-slate-700'>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={needsAssistance}
                  onChange={(e) => setNeedsAssistance(e.target.checked)}
                  className='rounded text-[#1B2434] focus:ring-[#1B2434]'
                />
                <span className='text-xs font-medium text-[#1B2434] dark:text-slate-300'>
                  I need assistance filling out this form (CSC Center / Ashram
                  School)
                </span>
              </label>
              {needsAssistance && (
                <select
                  value={form.assistanceType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assistanceType: e.target.value }))
                  }
                  className='mt-2.5 w-full px-3 py-2 rounded-md border border-[#1B2434]/20 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1B2434] dark:text-white outline-none'
                >
                  <option value=''>Type of assistance needed...</option>
                  <option value='CSC Center'>CSC Center</option>
                  <option value='Ashram School Teacher'>
                    Ashram School Teacher
                  </option>
                  <option value='Phone Support'>Phone Support</option>
                  <option value='In-person Visit'>In-person Visit</option>
                </select>
              )}
            </div>

            {formErrors.length > 0 && (
              <div className='p-3 rounded-md bg-[#B4472A]/10 border border-[#B4472A]/30 dark:border-red-800'>
                {formErrors.map((e, i) => (
                  <p
                    key={i}
                    className='text-xs text-[#B4472A] dark:text-red-400 flex items-center gap-1.5'
                  >
                    <AlertTriangle size={13} /> {e}
                  </p>
                ))}
              </div>
            )}

            <div className='flex gap-2 pt-2'>
              <Button type='submit' icon={<Send size={14} />}>
                {t('issues.submitTicket')}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                {tc('actions.cancel') || 'Cancel'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filters & Controls */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap'>
        <div className='flex items-center gap-2 flex-wrap'>
          <Filter size={14} className='text-[#64748B]' />
          {(["all", "open", "in_progress", "resolved", "closed"] as const).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  filter === f
                    ? "bg-[#0B75A4] text-white border-[#0B75A4] shadow-xs font-semibold"
                    : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 border-[#DEE2E6] dark:border-slate-700 hover:border-[#0B75A4] hover:text-[#0B75A4]"
                }`}
              >
                {f === "all" ? t('issues.all') : (tc(`status.${f}`) || f.replace("_", " "))} ({counts[f] ?? 0})
              </button>
            ),
          )}
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Search
              size={14}
              className='absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]'
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('issues.searchPlaceholder')}
              className='pl-8 pr-3 py-1.5 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-slate-200 outline-none focus:border-[#0B75A4] focus:ring-2 focus:ring-[#0B75A4]/20 transition-all placeholder:text-[#94A3B8] w-48'
            />
          </div>
          <button
            onClick={() =>
              setSort((s) => (s === "recent" ? "priority" : "recent"))
            }
            className='px-3 py-1.5 rounded-lg border border-[#DEE2E6] dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 hover:bg-[#F8FAFC] hover:text-[#0B75A4] hover:border-[#0B75A4]/40 dark:hover:bg-slate-800 transition-all text-[#475569] dark:text-slate-200 cursor-pointer'
            title='Toggle sort order'
          >
            <ArrowUpDown size={12} />
            {sort === "recent" ? t('issues.all') : t('issues.priority')}
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {visible.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={36} className='text-[#94A3B8]' />}
          title={t('issues.noIssues')}
          description={t('issues.noIssuesDesc')}
        />
      ) : (
        <div className='space-y-3'>
          {visible.map((grv) => {
            const sla = slaHours(grv.priority);
            const elapsed =
              (Date.now() - new Date(grv.createdAt).getTime()) / 3600_000;
            const breached =
              grv.status !== "resolved" &&
              grv.status !== "closed" &&
              elapsed > sla;
            const nearBreach =
              grv.status !== "resolved" &&
              grv.status !== "closed" &&
              elapsed > sla * 0.75;

            return (
              <div
                key={grv.id}
                className='p-4 md:p-5 rounded-xl border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 transition-all hover:border-[#0B75A4]/40 shadow-xs'
              >
                <div className='flex items-start justify-between gap-3 flex-wrap'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <p className='text-sm font-semibold text-[#1D293D] dark:text-white'>
                        {grv.subject}
                      </p>
                      <StatusBadge status={grv.status} />
                      <Badge variant={priorityVariant(grv.priority) as any}>
                        {grv.priority}
                      </Badge>
                      {grv.needsAssistance && (
                        <Badge variant='purple'>
                          Assistance: {grv.assistanceType}
                        </Badge>
                      )}
                    </div>

                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono'>
                      Ticket: {grv.id} · Created: {fmtDate(grv.createdAt)} ·
                      Updated: {timeSince(grv.updatedAt)}
                    </p>

                    <p className='text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed'>
                      {grv.description}
                    </p>

                    <div className='flex items-center gap-3.5 mt-3 text-xs flex-wrap'>
                      <span className='flex items-center gap-1 text-slate-500 dark:text-slate-400'>
                        <MessageSquare size={12} /> {grv.messages.length}{" "}
                        message(s)
                      </span>
                      {grv.attachments.length > 0 && (
                        <span className='flex items-center gap-1 text-slate-500 dark:text-slate-400'>
                          <Paperclip size={12} /> {grv.attachments.length}{" "}
                          file(s)
                        </span>
                      )}
                      {grv.status !== "resolved" && grv.status !== "closed" && (
                        <span
                          className={`flex items-center gap-1 font-mono text-[11px] ${
                            breached
                              ? "text-[#B4472A] dark:text-red-400 font-semibold"
                              : nearBreach
                                ? "text-amber-600 dark:text-amber-400 font-medium"
                                : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <Clock size={12} /> SLA {sla}h ·{" "}
                          {breached
                            ? "breached"
                            : nearBreach
                              ? "near breach"
                              : "on track"}
                        </span>
                      )}
                      {grv.status === "resolved" && (
                        <span className='flex items-center gap-1 text-[#2E6B4F] dark:text-emerald-400 font-medium'>
                          <CheckCircle2 size={12} /> Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => setSelectedId(grv.id)}
                    >
                      Open <ChevronRight size={14} />
                    </Button>
                    <button
                      onClick={() => handleDelete(grv.id)}
                      className='p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-[#B4472A] transition-all'
                      title='Delete ticket'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {grv.response && grv.status !== "open" && (
                  <div className='mt-3.5 p-3 rounded-md bg-[#2E6B4F]/10 dark:bg-emerald-900/20 border border-[#2E6B4F]/20 dark:border-emerald-800'>
                    <p className='text-xs font-medium text-[#2E6B4F] dark:text-emerald-300'>
                      Latest official response:
                    </p>
                    <p className='text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed'>
                      {grv.response}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected}
        onClose={() => setSelectedId(null)}
        title={`Ticket ${selected?.id ?? ""}`}
        size='xl'
      >
        {selected && (
          <TicketDetail
            ticket={selected}
            onReply={(text) => handleReply(selected.id, text)}
            onStatusChange={(s) => handleStatusChange(selected.id, s)}
          />
        )}
      </Modal>
    </div>
  );
};

/* ============================================================
 *  TICKET DETAIL COMPONENT
 * ============================================================ */
const TicketDetail: React.FC<{
  ticket: LocalGrievance;
  onReply: (text: string) => void;
  onStatusChange: (s: GrievanceStatus) => void;
}> = ({ ticket, onReply, onStatusChange }) => {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [ticket.messages.length]);

  const send = () => {
    if (!reply.trim()) return;
    setSending(true);
    onReply(reply);
    setReply("");
    setTimeout(() => setSending(false), 800);
  };

  return (
    <div className='space-y-5 font-sans'>
      {/* Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-900/60 border border-[#DEE2E6] dark:border-slate-700'>
        <div>
          <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider'>
            Status
          </p>
          <div className="mt-1">
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <div>
          <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider'>
            Priority
          </p>
          <div className='mt-1'>
            <Badge variant={priorityVariant(ticket.priority) as any}>
              {ticket.priority}
            </Badge>
          </div>
        </div>
        <div>
          <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider'>
            Created
          </p>
          <p className='text-xs font-semibold text-[#1D293D] dark:text-white mt-1'>
            {fmtDate(ticket.createdAt)}
          </p>
        </div>
        <div>
          <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider'>
            Updated
          </p>
          <p className='text-xs font-semibold text-[#1D293D] dark:text-white mt-1'>
            {timeSince(ticket.updatedAt)}
          </p>
        </div>
      </div>

      {ticket.needsAssistance && (
        <div className='p-3.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 border border-[#0B75A4]/30'>
          <p className='text-xs text-[#0B75A4] dark:text-[#7EC5E2] font-semibold'>
            <strong>Assistance requested:</strong> {ticket.assistanceType}
          </p>
        </div>
      )}

      {/* Description */}
      <div>
        <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1'>
          Description
        </p>
        <p className='text-xs text-[#1D293D] dark:text-slate-200 whitespace-pre-wrap leading-relaxed'>
          {ticket.description}
        </p>
      </div>

      {/* Attachments */}
      {ticket.attachments.length > 0 && (
        <div>
          <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-1.5'>
            Attachments
          </p>
          <ul className='space-y-1.5'>
            {ticket.attachments.map((a) => (
              <li
                key={a.id}
                className='flex items-center gap-2 text-xs text-[#1D293D] dark:text-slate-300 bg-[#F8FAFC] dark:bg-slate-800/80 rounded-lg px-3 py-2 border border-[#DEE2E6] dark:border-slate-700'
              >
                <Paperclip size={13} className='text-[#64748B]' />
                <span className='truncate font-medium'>{a.name}</span>
                <span className='text-[#94A3B8] font-mono text-[11px]'>
                  ({(a.size / 1024).toFixed(1)} KB)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Thread */}
      <div>
        <p className='text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider mb-2'>
          Conversation ({ticket.messages.length})
        </p>
        <div
          ref={listRef}
          className='max-h-72 overflow-y-auto space-y-2.5 pr-1'
        >
          {ticket.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.author === "student" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 text-xs ${
                  m.author === "student"
                    ? "bg-[#0B75A4] text-white shadow-xs"
                    : "bg-[#F8FAFC] dark:bg-slate-800 text-[#1D293D] dark:text-slate-200 border border-[#DEE2E6] dark:border-slate-700"
                }`}
              >
                <p className='whitespace-pre-wrap leading-relaxed'>{m.text}</p>
                <p
                  className={`text-[10px] mt-1.5 font-medium ${
                    m.author === "student" ? "text-white/80" : "text-[#94A3B8]"
                  }`}
                >
                  {fmtDateTime(m.at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Box */}
      {ticket.status !== "closed" && (
        <div className='flex items-center gap-2 pt-2'>
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder='Type a reply…'
            className='flex-1 px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:border-[#0B75A4] focus:ring-2 focus:ring-[#0B75A4]/20 transition-all placeholder:text-[#94A3B8]'
          />
          <Button
            size='sm'
            variant="primary"
            icon={
              sending ? (
                <Loader2 size={14} className='animate-spin' />
              ) : (
                <Send size={14} />
              )
            }
            onClick={send}
          >
            Send
          </Button>
        </div>
      )}

      {/* Status Transition Actions */}
      <div className='flex items-center gap-2 flex-wrap pt-3 border-t border-[#DEE2E6] dark:border-slate-800'>
        <p className='text-xs text-[#64748B] dark:text-slate-400 mr-auto'>
          Change status:
        </p>
        {(["open", "in_progress", "resolved", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            disabled={ticket.status === s}
            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              ticket.status === s
                ? "bg-[#F1F5F9] dark:bg-slate-800 text-[#94A3B8] border-[#DEE2E6] dark:border-slate-800 cursor-not-allowed"
                : "bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-200 border-[#DEE2E6] dark:border-slate-700 hover:border-[#0B75A4] hover:text-[#0B75A4]"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Issues;
