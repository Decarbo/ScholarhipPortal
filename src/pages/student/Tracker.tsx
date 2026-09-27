import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  StatusBadge,
  Button,
  Stepper,
  EmptyState,
  Modal,
} from "../../components/ui";
import { useAppStore } from "../../store";
import { getLocalizedSchemeName } from "../../utils/localizedData";
import {
  FileText,
  Download,
  AlertTriangle,
  UserCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Upload,
  X,
  ChevronRight,
  RefreshCw,
  History,
  Landmark,
  Pencil,
  ClipboardList,
  Sparkles,
  Info,
} from "lucide-react";

/* ============================================================
 *  TYPES
 * ============================================================ */
type AppStatus =
  | "draft"
  | "submitted"
  | "under_scrutiny"
  | "screening"
  | "selected"
  | "waitlisted"
  | "rejected";

interface TrackerDoc {
  id: string;
  name: string;
  status: "pending" | "verified" | "flagged" | "missing";
  aiScore: number;
  aiFeedback?: string;
  required: boolean;
}

interface DeficiencyNotice {
  id: string;
  message: string;
  plainLanguageMessage: string;
  resolved: boolean;
  raisedAt: string;
}

interface AiFlag {
  id: string;
  severity: "low" | "medium" | "high";
  plainLanguageMessage: string;
  suggestion?: string;
}

interface TimelineEntry {
  id: string;
  status: AppStatus | "note";
  label: string;
  at: string;
  note?: string;
}

interface TrackerApplication {
  id: string;
  schemeName: string;
  schemeCategory: string;
  amount: number;
  status: AppStatus;
  draftProgress: number;
  submittedDate?: string;
  lastUpdated: string;
  documents: TrackerDoc[];
  deficiencyNotices: DeficiencyNotice[];
  aiFlags: AiFlag[];
  plainReason?: string;
  enrolmentConfirmed: boolean;
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    holderName: string;
  };
  timeline: TimelineEntry[];
}

/* ============================================================
 *  LOCAL STORAGE
 * ============================================================ */
const STORAGE_KEY = "student_scholarship_tracker_v1";

const loadApps = (): TrackerApplication[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : seedApps();
  } catch {
    return seedApps();
  }
};
const saveApps = (apps: TrackerApplication[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));

/* ============================================================
 *  SEED DATA
 * ============================================================ */
function seedApps(): TrackerApplication[] {
  const now = new Date();
  const ago = (d: number) =>
    new Date(now.getTime() - d * 86400000).toISOString();

  return [
    {
      id: "APP-2024-001",
      schemeName: "Post Matric Scholarship 2024",
      schemeCategory: "Education",
      amount: 25000,
      status: "under_scrutiny",
      draftProgress: 100,
      submittedDate: ago(6).slice(0, 10),
      lastUpdated: ago(1).slice(0, 10),
      documents: [
        {
          id: "d1",
          name: "Aadhaar Card",
          status: "verified",
          aiScore: 96,
          required: true,
        },
        {
          id: "d2",
          name: "Income Certificate",
          status: "flagged",
          aiScore: 62,
          aiFeedback:
            "The income certificate is blurry. Please re-upload a clearer scan.",
          required: true,
        },
        {
          id: "d3",
          name: "Bank Passbook",
          status: "pending",
          aiScore: 88,
          required: true,
        },
      ],
      deficiencyNotices: [
        {
          id: "dn1",
          message: "Income certificate unreadable",
          plainLanguageMessage:
            "We could not read your income certificate. Please upload a clear photo or PDF.",
          resolved: false,
          raisedAt: ago(2),
        },
      ],
      aiFlags: [
        {
          id: "f1",
          severity: "high",
          plainLanguageMessage: "Income certificate unreadable.",
          suggestion:
            "Take a fresh photo in good lighting or upload the original PDF.",
        },
        {
          id: "f2",
          severity: "medium",
          plainLanguageMessage: "Bank passbook shows an old account number.",
          suggestion:
            "Ensure your account number matches the one in your application.",
        },
      ],
      enrolmentConfirmed: false,
      timeline: [
        {
          id: "t1",
          status: "draft",
          label: "Application created",
          at: ago(10),
        },
        {
          id: "t2",
          status: "submitted",
          label: "Submitted successfully",
          at: ago(6),
        },
        {
          id: "t3",
          status: "under_scrutiny",
          label: "Documents under scrutiny",
          at: ago(1),
        },
      ],
    },
    {
      id: "APP-2024-002",
      schemeName: "Merit Scholarship 2024",
      schemeCategory: "Merit",
      amount: 50000,
      status: "selected",
      draftProgress: 100,
      submittedDate: ago(25).slice(0, 10),
      lastUpdated: ago(3).slice(0, 10),
      documents: [
        {
          id: "d4",
          name: "Marksheet 12th",
          status: "verified",
          aiScore: 94,
          required: true,
        },
        {
          id: "d5",
          name: "Aadhaar Card",
          status: "verified",
          aiScore: 97,
          required: true,
        },
      ],
      deficiencyNotices: [],
      aiFlags: [],
      enrolmentConfirmed: false,
      timeline: [
        { id: "t4", status: "submitted", label: "Submitted", at: ago(25) },
        {
          id: "t5",
          status: "under_scrutiny",
          label: "Under scrutiny",
          at: ago(20),
        },
        {
          id: "t6",
          status: "screening",
          label: "Screening passed",
          at: ago(10),
        },
        {
          id: "t7",
          status: "selected",
          label: "Selected — awaiting enrolment",
          at: ago(3),
        },
      ],
    },
    {
      id: "APP-2024-003",
      schemeName: "Girl Child Education Grant",
      schemeCategory: "Education",
      amount: 15000,
      status: "rejected",
      draftProgress: 100,
      submittedDate: ago(40).slice(0, 10),
      lastUpdated: ago(30).slice(0, 10),
      documents: [
        {
          id: "d6",
          name: "Aadhaar Card",
          status: "verified",
          aiScore: 95,
          required: true,
        },
      ],
      deficiencyNotices: [],
      aiFlags: [],
      plainReason:
        "Your family income crossed the ₹2.5 lakh limit for this scheme. You may still be eligible for the Post Matric Scholarship.",
      enrolmentConfirmed: false,
      timeline: [
        { id: "t8", status: "submitted", label: "Submitted", at: ago(40) },
        {
          id: "t9",
          status: "under_scrutiny",
          label: "Under scrutiny",
          at: ago(35),
        },
        {
          id: "t10",
          status: "rejected",
          label: "Rejected — income criteria not met",
          at: ago(30),
        },
      ],
    },
  ];
}

/* ============================================================
 *  HELPERS & STYLES
 * ============================================================ */
const defaultStatusSteps = ["Submitted", "Under Scrutiny", "Screening", "Result"];
const statusIndex = (s: AppStatus) => {
  const map: Record<AppStatus, number> = {
    draft: 0,
    submitted: 0,
    under_scrutiny: 1,
    screening: 2,
    selected: 3,
    waitlisted: 3,
    rejected: 3,
  };
  return map[s] ?? 0;
};

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
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const validateBank = (b: {
  accountNumber: string;
  ifsc: string;
  bankName: string;
  holderName: string;
}) => {
  const errs: string[] = [];
  if (!/^\d{9,18}$/.test(b.accountNumber))
    errs.push("Account number must be 9–18 digits");
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(b.ifsc.toUpperCase()))
    errs.push("IFSC looks invalid (e.g. SBIN0001234)");
  if (!b.bankName.trim()) errs.push("Bank name required");
  if (!b.holderName.trim()) errs.push("Account holder name required");
  return errs;
};

const btnPrimary =
  "bg-[#1B2434] hover:bg-[#1B2434]/90 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-[#0F1622] transition-colors rounded-md font-medium text-xs px-3 py-2 inline-flex items-center gap-1.5";
const btnOutline =
  "bg-transparent border border-[#1B2434]/15 dark:border-slate-700 text-[#1B2434] dark:text-slate-200 hover:bg-[#1B2434]/5 dark:hover:bg-slate-800 transition-colors rounded-md font-medium text-xs px-3 py-2 inline-flex items-center gap-1.5";

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const Tracker: React.FC = () => {
  const { addToast } = useAppStore();
  const [apps, setApps] = useState<TrackerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | AppStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [enrolModalId, setEnrolModalId] = useState<string | null>(null);
  const [uploadForDocId, setUploadForDocId] = useState<{
    appId: string;
    docId: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t, i18n } = useTranslation('student');
  const { t: tc } = useTranslation('common');

  const statusSteps = [
    t('tracker.steps.submitted'),
    t('tracker.steps.underScrutiny'),
    t('tracker.steps.screening'),
    t('tracker.steps.result'),
  ];

  useEffect(() => {
    setApps(loadApps());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) saveApps(apps);
  }, [apps, loading]);

  const selectedApp = useMemo(
    () => apps.find((a) => a.id === selectedId) || null,
    [apps, selectedId],
  );
  const enrolApp = useMemo(
    () => apps.find((a) => a.id === enrolModalId) || null,
    [apps, enrolModalId],
  );

  const patchApp = (
    id: string,
    patch: Partial<TrackerApplication>,
    timelineLabel?: string,
  ) => {
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const next: TrackerApplication = {
          ...a,
          ...patch,
          lastUpdated: new Date().toISOString(),
        };
        if (timelineLabel) {
          next.timeline = [
            ...a.timeline,
            {
              id: uid("t"),
              status: patch.status ?? a.status,
              label: timelineLabel,
              at: new Date().toISOString(),
            },
          ];
        }
        return next;
      }),
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this application record from your tracker?")) return;
    setApps((prev) => prev.filter((a) => a.id !== id));
    if (selectedId === id) setSelectedId(null);
    addToast("info", "Application removed");
  };

  const handleCreateDraft = () => {
    const newApp: TrackerApplication = {
      id: `APP-${new Date().getFullYear()}-${String(apps.length + 1).padStart(
        3,
        "0",
      )}`,
      schemeName: "New Scholarship Application",
      schemeCategory: "General",
      amount: 0,
      status: "draft",
      draftProgress: 10,
      lastUpdated: new Date().toISOString(),
      documents: [],
      deficiencyNotices: [],
      aiFlags: [],
      enrolmentConfirmed: false,
      timeline: [
        {
          id: uid("t"),
          status: "draft",
          label: "Draft created",
          at: new Date().toISOString(),
        },
      ],
    };
    setApps((prev) => [newApp, ...prev]);
    setSelectedId(newApp.id);
    addToast("success", "New draft created");
  };

  const handleSubmit = (id: string) => {
    patchApp(
      id,
      {
        status: "submitted",
        draftProgress: 100,
        submittedDate: new Date().toISOString().slice(0, 10),
      },
      "Submitted successfully",
    );
    addToast("success", "Application submitted!");
  };

  const handleResolveUpload = (
    appId: string,
    docId: string,
    fileName: string,
  ) => {
    const score = Math.floor(88 + Math.random() * 11);
    setApps((prev) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        const docs = a.documents.map((d) =>
          d.id === docId
            ? {
                ...d,
                name: fileName,
                status: "verified" as const,
                aiScore: score,
                aiFeedback: undefined,
              }
            : d,
        );
        const notices = a.deficiencyNotices.map((n) =>
          n.resolved ? n : { ...n, resolved: true },
        );
        const flags = a.aiFlags.filter(
          (f) => !f.plainLanguageMessage.toLowerCase().includes("unreadable"),
        );
        return {
          ...a,
          documents: docs,
          deficiencyNotices: notices,
          aiFlags: flags,
          lastUpdated: new Date().toISOString(),
          timeline: [
            ...a.timeline,
            {
              id: uid("t"),
              status: a.status,
              label: `Re-uploaded "${fileName}" — AI score ${score}%`,
              at: new Date().toISOString(),
            },
          ],
        };
      }),
    );
    addToast("success", `Document re-uploaded & verified (AI ${score}%)`);
  };

  const handleConfirmEnrolment = (
    id: string,
    bank: TrackerApplication["bankDetails"],
  ) => {
    patchApp(
      id,
      {
        enrolmentConfirmed: true,
        bankDetails: bank,
      },
      "Enrolment confirmed — offer accepted",
    );
    addToast("success", "Enrolment confirmed");
    setEnrolModalId(null);
  };

  const handleDownloadOffer = (app: TrackerApplication) => {
    const lines = [
      "========================================",
      "       SCHOLARSHIP OFFER LETTER",
      "========================================",
      "",
      `Application ID : ${app.id}`,
      `Scheme         : ${app.schemeName}`,
      `Category       : ${app.schemeCategory}`,
      `Amount         : ₹${app.amount.toLocaleString("en-IN")}`,
      `Status         : ${app.status.replace("_", " ").toUpperCase()}`,
      "",
      "Congratulations! You have been selected.",
      "Please keep this letter for your records.",
      "",
      `Generated: ${fmtDateTime(new Date().toISOString())}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Offer_${app.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Offer letter downloaded");
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(apps, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scholarship-tracker-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target?.result));
        if (!Array.isArray(parsed)) throw new Error("bad");
        setApps(parsed);
        addToast("success", "Tracker imported");
      } catch {
        addToast("error", "Invalid file");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm("Reset all applications to demo data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setApps(seedApps());
    addToast("info", "Tracker reset");
  };

  const filtered = useMemo(
    () => (filter === "all" ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const a of apps) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [apps]);

  if (loading)
    return (
      <div className='p-6 text-slate-500 font-mono text-xs'>
        Loading tracker records...
      </div>
    );

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-5xl mx-auto font-sans text-[#1B2434] dark:text-slate-100 animate-fade-in'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1B2434]/10 dark:border-slate-800 pb-5'>
        <div className='flex items-start gap-3'>
          <ClipboardList
            size={32}
            className='text-[#1B2434] dark:text-slate-300 shrink-0 mt-1'
          />
          <div>
            <h1 className='font-serif text-[28px] md:text-[34px] text-[#1B2434] dark:text-white leading-tight'>
              {t('tracker.title')}
            </h1>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
              {t('tracker.subtitle')}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 flex-wrap'>
          <Badge
            variant='outline'
            className='border-[#1B2434]/15 text-slate-500 text-[11px] font-mono uppercase tracking-wider'
          >
            {t('tracker.frontendOnly')}
          </Badge>
          <button
            onClick={handleExport}
            className={btnOutline}
            title={t('tracker.export')}
          >
            <Download size={14} /> {t('tracker.export')}
          </button>
          <label className='cursor-pointer'>
            <input
              type='file'
              accept='.json'
              className='hidden'
              onChange={(e) =>
                e.target.files?.[0] && handleImport(e.target.files[0])
              }
            />
            <span className={btnOutline}>
              <Upload size={14} /> {t('tracker.import')}
            </span>
          </label>
          <button
            onClick={handleReset}
            className='p-2 rounded-md border border-[#1B2434]/15 text-[#1B2434] hover:bg-[#1B2434]/5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors'
            title={t('tracker.resetDemo')}
          >
            <RefreshCw size={15} />
          </button>
          <button onClick={handleCreateDraft} className={btnPrimary}>
            <Plus size={14} /> {t('tracker.newDraft')}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='flex items-center gap-2 flex-wrap border-b border-[#1B2434]/10 dark:border-slate-800 pb-3'>
        {(
          [
            "all",
            "draft",
            "submitted",
            "under_scrutiny",
            "screening",
            "selected",
            "waitlisted",
            "rejected",
          ] as const
        ).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              filter === f
                ? "bg-[#1B2434] text-white dark:bg-white dark:text-[#0F1622]"
                : "text-slate-600 dark:text-slate-400 hover:bg-[#1B2434]/5 dark:hover:bg-slate-800"
            }`}
          >
            {f === "all" ? t('tracker.filterAll') : (tc(`status.${f}`) || f.replace("_", " ").toUpperCase())} (
            {counts[f] ?? 0})
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={
            <FileText
              size={40}
              className='text-[#1B2434]/40 dark:text-slate-600'
            />
          }
          title={t('tracker.noApplications')}
          description={t('tracker.noApplicationsDesc')}
        />
      ) : (
        <div className='space-y-4'>
          {filtered.map((app) => {
            const pendingNotice = app.deficiencyNotices.find(
              (d) => !d.resolved,
            );
            return (
              <Card
                key={app.id}
                className='border border-[#1B2434]/10 dark:border-slate-800 rounded-md shadow-none bg-white dark:bg-[#0F1622] p-5'
              >
                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4'>
                  <div className='min-w-0 space-y-1'>
                    <div className='flex items-center gap-2 flex-wrap'>
                      <p className='font-serif text-xl text-[#1B2434] dark:text-white'>
                        {getLocalizedSchemeName(app.schemeName, i18n.language)}
                      </p>
                      <StatusBadge status={app.status} />
                      {app.status === "draft" && (
                        <span className='text-xs font-mono text-slate-500'>
                          ({app.draftProgress}% {t('tracker.draftComplete')})
                        </span>
                      )}
                      {app.enrolmentConfirmed && (
                        <span className='text-xs font-medium text-[#2E6B4F] dark:text-emerald-400 flex items-center gap-1'>
                          <CheckCircle2 size={13} /> {t('tracker.enrolled')}
                        </span>
                      )}
                    </div>
                    <p className='text-xs font-mono text-slate-500'>
                      {t('tracker.applicationId')}: {app.id} ·{" "}
                      {app.submittedDate
                        ? `${t('tracker.submitted')}: ${fmtDate(app.submittedDate)}`
                        : t('tracker.draftRecord')}{" "}
                      · {t('tracker.lastAudit')}: {fmtDate(app.lastUpdated)}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <button
                      onClick={() => setSelectedId(app.id)}
                      className={btnOutline}
                    >
                      {t('tracker.auditDetails')} <ChevronRight size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className='p-2 rounded-md border border-transparent hover:border-[#B4472A]/30 hover:bg-[#B4472A]/[0.04] text-[#B4472A] transition-colors'
                      title='Delete record'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {app.status !== "draft" && (
                  <div className='my-4 pt-2 border-t border-[#1B2434]/5 dark:border-slate-800/60'>
                    <Stepper
                      steps={statusSteps}
                      currentStep={statusIndex(app.status)}
                    />
                  </div>
                )}

                {pendingNotice && (
                  <div className='mt-4 p-4 rounded-md bg-[#B4472A]/[0.04] border border-[#B4472A]/30 text-[#1B2434] dark:text-slate-200'>
                    <div className='flex items-center gap-2'>
                      <AlertTriangle
                        size={15}
                        className='text-[#B4472A] dark:text-red-400'
                      />
                      <span className='text-xs font-mono font-semibold uppercase tracking-wider text-[#B4472A] dark:text-red-400'>
                        {t('tracker.actionRequired')}
                      </span>
                    </div>
                    <p className='text-xs mt-1 text-slate-700 dark:text-slate-300'>
                      {pendingNotice.plainLanguageMessage}
                    </p>
                    <button
                      onClick={() => setSelectedId(app.id)}
                      className='mt-2 text-xs font-medium text-[#B4472A] dark:text-red-400 underline hover:opacity-80'
                    >
                      {t('tracker.resolveIssueNow')}
                    </button>
                  </div>
                )}

                {app.status === "rejected" && app.plainReason && (
                  <div className='mt-4 p-4 rounded-md bg-[#B4472A]/[0.04] border border-[#B4472A]/30'>
                    <p className='text-xs font-mono uppercase tracking-wider text-[#B4472A] font-semibold'>
                      {t('tracker.reasonForRejection')}
                    </p>
                    <p className='text-xs text-slate-700 dark:text-slate-300 mt-1'>
                      {app.plainReason}
                    </p>
                  </div>
                )}

                {app.status === "selected" && !app.enrolmentConfirmed && (
                  <div className='mt-4 p-4 rounded-md bg-[#2E6B4F]/[0.04] border border-[#2E6B4F]/20 flex items-center justify-between gap-3 flex-wrap'>
                    <div>
                      <p className='text-sm font-serif text-[#2E6B4F] dark:text-emerald-400'>
                        {t('tracker.selectionConfirmed')}
                      </p>
                      <p className='text-xs text-slate-600 dark:text-slate-300 mt-0.5'>
                        {t('tracker.acceptAwardDesc', { amount: app.amount.toLocaleString("en-IN") })}
                      </p>
                    </div>
                    <button
                      className={btnPrimary}
                      onClick={() => setEnrolModalId(app.id)}
                    >
                      <UserCheck size={14} /> {t('tracker.confirmEnrolment')}
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ========== DETAIL MODAL ========== */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedId(null)}
        title={`${t('tracker.auditRecord')}: ${selectedApp?.id ?? ""}`}
        size='xl'
      >
        {selectedApp && (
          <div className='space-y-6 font-sans text-[#1B2434] dark:text-slate-100'>
            {/* Summary Grid */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-md border border-[#1B2434]/10 dark:border-slate-800 bg-[#1B2434]/[0.01]'>
              <div>
                <p className='text-[11px] font-mono uppercase tracking-wider text-slate-500'>
                  {t('tracker.scheme')}
                </p>
                <p className='font-serif text-base text-[#1B2434] dark:text-white mt-0.5'>
                  {getLocalizedSchemeName(selectedApp.schemeName, i18n.language)}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-mono uppercase tracking-wider text-slate-500'>
                  {t('tracker.currentStatus')}
                </p>
                <div className='mt-1'>
                  <StatusBadge status={selectedApp.status} />
                </div>
              </div>
              <div>
                <p className='text-[11px] font-mono uppercase tracking-wider text-slate-500'>
                  {t('tracker.disbursement')}
                </p>
                <p className='font-mono text-sm text-[#1B2434] dark:text-white mt-0.5'>
                  ₹{selectedApp.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className='text-[11px] font-mono uppercase tracking-wider text-slate-500'>
                  {t('tracker.lastAudit')}
                </p>
                <p className='font-mono text-sm text-[#1B2434] dark:text-white mt-0.5'>
                  {fmtDate(selectedApp.lastUpdated)}
                </p>
              </div>
            </div>

            {selectedApp.status === "draft" && (
              <div className='p-4 rounded-md border border-[#1B2434]/15 bg-[#1B2434]/[0.02] flex items-center justify-between gap-3 flex-wrap'>
                <p className='text-xs text-slate-600 dark:text-slate-300'>
                  {t('tracker.uncommittedDraft')}
                </p>
                <button
                  className={btnPrimary}
                  onClick={() => handleSubmit(selectedApp.id)}
                >
                  {t('tracker.submitFinal')}
                </button>
              </div>
            )}

            {selectedApp.status === "rejected" && selectedApp.plainReason && (
              <div className='p-4 rounded-md bg-[#B4472A]/[0.04] border border-[#B4472A]/30'>
                <p className='text-xs font-mono uppercase tracking-wider text-[#B4472A] font-semibold mb-1'>
                  {t('tracker.rejectionJustification')}
                </p>
                <p className='text-xs text-slate-700 dark:text-slate-300'>
                  {selectedApp.plainReason}
                </p>
              </div>
            )}

            {/* Documents */}
            <div>
              <h4 className='font-serif text-base text-[#1B2434] dark:text-white mb-2'>
                {t('tracker.attachedDocs')}
              </h4>
              <div className='space-y-2'>
                {selectedApp.documents.length === 0 && (
                  <p className='text-xs text-slate-500 font-mono'>
                    {t('tracker.noDocsAttached')}
                  </p>
                )}
                {selectedApp.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className='flex items-center justify-between p-3 rounded-md border border-[#1B2434]/10 dark:border-slate-800 bg-white dark:bg-[#0F1622] gap-3 flex-wrap'
                  >
                    <div className='flex items-center gap-2 min-w-0'>
                      <FileText size={15} className='text-slate-400 shrink-0' />
                      <span className='text-xs font-medium text-[#1B2434] dark:text-slate-200 truncate'>
                        {doc.name}
                      </span>
                      {doc.required && (
                        <span className='text-[10px] font-mono text-[#B4472A] uppercase'>
                          {t('tracker.required')}
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-3'>
                      {doc.aiScore > 0 && (
                        <span className='text-xs font-mono text-slate-500'>
                          AI: {doc.aiScore}%
                        </span>
                      )}
                      <StatusBadge status={doc.status} />
                      {(doc.status === "flagged" ||
                        doc.status === "missing") && (
                        <button
                          onClick={() =>
                            setUploadForDocId({
                              appId: selectedApp.id,
                              docId: doc.id,
                            })
                          }
                          className='px-2.5 py-1 rounded-md bg-[#B4472A] hover:bg-[#B4472A]/90 text-white text-[11px] font-medium flex items-center gap-1 transition-colors'
                        >
                          <Upload size={11} /> {t('tracker.reupload')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI feedback */}
            {selectedApp.documents.some((d) => d.aiFeedback) && (
              <div>
                <h4 className='font-serif text-base text-[#1B2434] dark:text-white mb-2 flex items-center gap-1.5'>
                  <Sparkles
                    size={16}
                    className='text-[#1B2434] dark:text-slate-300'
                  />{" "}
                  {t('tracker.autoNotes')}
                </h4>
                {selectedApp.documents
                  .filter((d) => d.aiFeedback)
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className='p-3 rounded-md bg-[#1B2434]/[0.02] border border-[#1B2434]/10 dark:border-slate-800 mb-2'
                    >
                      <p className='text-xs font-mono font-semibold text-[#1B2434] dark:text-slate-200'>
                        {doc.name}
                      </p>
                      <p className='text-xs text-slate-600 dark:text-slate-400 mt-1'>
                        {doc.aiFeedback}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {/* AI flags */}
            {selectedApp.aiFlags.length > 0 && (
              <div>
                <h4 className='font-serif text-base text-[#1B2434] dark:text-white mb-2 flex items-center gap-1.5'>
                  <AlertTriangle size={16} className='text-[#B4472A]' />{" "}
                  {t('tracker.detectedIrregularities')}
                </h4>
                {selectedApp.aiFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className='p-3.5 rounded-md mb-2 border border-[#B4472A]/30 bg-[#B4472A]/[0.04]'
                  >
                    <p className='text-xs font-medium text-[#1B2434] dark:text-slate-200'>
                      {flag.plainLanguageMessage}
                    </p>
                    {flag.suggestion && (
                      <p className='text-xs text-slate-600 dark:text-slate-400 mt-1.5 flex items-start gap-1'>
                        <Info
                          size={13}
                          className='shrink-0 mt-0.5 text-slate-500'
                        />
                        <span>
                          <strong>{t('tracker.recommendation')}:</strong> {flag.suggestion}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className='font-serif text-base text-[#1B2434] dark:text-white mb-3 flex items-center gap-2'>
                <History size={16} /> {t('tracker.auditTrail')}
              </h4>
              <ol className='relative border-l border-[#1B2434]/15 dark:border-slate-700 ml-2 space-y-4'>
                {selectedApp.timeline.map((t) => (
                  <li key={t.id} className='ml-4'>
                    <span className='absolute -left-1.5 w-3 h-3 rounded-full bg-[#1B2434] dark:bg-slate-300' />
                    <p className='text-[11px] font-mono text-slate-500'>
                      {fmtDateTime(t.at)}
                    </p>
                    <p className='text-xs text-[#1B2434] dark:text-slate-200 font-medium'>
                      {t.label}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Enrolment actions */}
            {selectedApp.status === "selected" &&
              !selectedApp.enrolmentConfirmed && (
                <div className='p-4 rounded-md bg-[#2E6B4F]/[0.04] border border-[#2E6B4F]/30'>
                  <p className='text-sm font-serif text-[#2E6B4F] dark:text-emerald-400 mb-1'>
                    {t('tracker.selectionFinalized')}
                  </p>
                  <p className='text-xs text-slate-600 dark:text-slate-300 mb-3'>
                    {t('tracker.confirmBankDesc')}
                  </p>
                  <div className='flex gap-2 flex-wrap'>
                    <button
                      className={btnPrimary}
                      onClick={() => setEnrolModalId(selectedApp.id)}
                    >
                      <UserCheck size={14} /> {t('tracker.confirmEnrolment')}
                    </button>
                    <button
                      className={btnOutline}
                      onClick={() => handleDownloadOffer(selectedApp)}
                    >
                      <Download size={14} /> {t('tracker.downloadOfferLetter')}
                    </button>
                  </div>
                </div>
              )}

            {selectedApp.status === "selected" &&
              selectedApp.enrolmentConfirmed && (
                <div className='space-y-3'>
                  <div className='p-4 rounded-md bg-[#2E6B4F]/[0.04] border border-[#2E6B4F]/30'>
                    <p className='text-xs text-[#2E6B4F] dark:text-emerald-400 font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5'>
                      <CheckCircle2 size={14} /> {t('tracker.enrolmentVerified')}
                    </p>
                    {selectedApp.bankDetails && (
                      <p className='text-xs text-slate-600 dark:text-slate-400 font-mono mt-1'>
                        {selectedApp.bankDetails.bankName} · A/C ••••
                        {selectedApp.bankDetails.accountNumber.slice(-4)}
                      </p>
                    )}
                  </div>
                  <button
                    className={`${btnOutline} w-full justify-center py-2.5`}
                    onClick={() => handleDownloadOffer(selectedApp)}
                  >
                    <Download size={14} /> {t('tracker.downloadOfferLetter')}
                  </button>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* ========== ENROLMENT MODAL ========== */}
      <EnrolmentModal
        app={enrolApp}
        onClose={() => setEnrolModalId(null)}
        onConfirm={handleConfirmEnrolment}
      />

      {/* ========== RE-UPLOAD MODAL ========== */}
      {uploadForDocId && (
        <ReuploadModal
          docName={
            apps
              .find((a) => a.id === uploadForDocId.appId)
              ?.documents.find((d) => d.id === uploadForDocId.docId)?.name ?? ""
          }
          onClose={() => setUploadForDocId(null)}
          onFile={(name) => {
            handleResolveUpload(
              uploadForDocId.appId,
              uploadForDocId.docId,
              name,
            );
            setUploadForDocId(null);
          }}
          fileRef={fileRef}
        />
      )}
    </div>
  );
};

/* ============================================================
 *  ENROLMENT MODAL
 * ============================================================ */
const EnrolmentModal: React.FC<{
  app: TrackerApplication | null;
  onClose: () => void;
  onConfirm: (id: string, bank: TrackerApplication["bankDetails"]) => void;
}> = ({ app, onClose, onConfirm }) => {
  const { t, i18n } = useTranslation('student');
  const [form, setForm] = useState({
    accountNumber: "",
    ifsc: "",
    bankName: "",
    holderName: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (app)
      setForm({ accountNumber: "", ifsc: "", bankName: "", holderName: "" });
    setErrors([]);
  }, [app]);

  if (!app) return null;

  const handle = () => {
    const errs = validateBank(form);
    setErrors(errs);
    if (errs.length === 0) onConfirm(app.id, form);
  };

  return (
    <Modal
      isOpen={!!app}
      onClose={onClose}
      title={t('tracker.bankModalTitle')}
      size='lg'
    >
      <div className='space-y-5 font-sans'>
        <div className='p-4 rounded-md bg-[#2E6B4F]/[0.04] border border-[#2E6B4F]/20'>
          <p className='text-xs text-[#2E6B4F] dark:text-emerald-400 font-mono uppercase tracking-wider font-semibold'>
            {t('tracker.awardAcceptance')}
          </p>
          <p className='text-sm text-slate-700 dark:text-slate-200 mt-1'>
            {t('tracker.acceptingScheme', {
              scheme: getLocalizedSchemeName(app.schemeName, i18n.language),
              amount: app.amount.toLocaleString("en-IN")
            })}
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <Field
            label={t('tracker.accountHolder')}
            value={form.holderName}
            onChange={(v) => setForm((f) => ({ ...f, holderName: v }))}
          />
          <Field
            label={t('tracker.bankName')}
            value={form.bankName}
            onChange={(v) => setForm((f) => ({ ...f, bankName: v }))}
          />
          <Field
            label={t('tracker.accountNumber')}
            value={form.accountNumber}
            onChange={(v) =>
              setForm((f) => ({ ...f, accountNumber: v.replace(/\D/g, "") }))
            }
            placeholder={t('tracker.digitsPlaceholder')}
          />
          <Field
            label={t('tracker.ifscCode')}
            value={form.ifsc}
            onChange={(v) => setForm((f) => ({ ...f, ifsc: v.toUpperCase() }))}
            placeholder='SBIN0001234'
          />
        </div>

        {errors.length > 0 && (
          <div className='p-3.5 rounded-md bg-[#B4472A]/[0.04] border border-[#B4472A]/30 space-y-1'>
            {errors.map((e, i) => (
              <p
                key={i}
                className='text-xs text-[#B4472A] dark:text-red-400 flex items-center gap-1.5 font-mono'
              >
                <AlertTriangle size={12} /> {e}
              </p>
            ))}
          </div>
        )}

        <div className='flex justify-end gap-3 pt-2'>
          <button className={btnOutline} onClick={onClose}>
            {t('tracker.cancel')}
          </button>
          <button className={btnPrimary} onClick={handle}>
            <Landmark size={14} /> {t('tracker.commitAccept')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <label className='block space-y-1'>
    <span className='text-[11px] font-mono uppercase tracking-wider text-slate-500'>
      {label}
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className='w-full rounded-md border border-[#1B2434]/15 dark:border-slate-700 bg-white dark:bg-[#0F1622] px-3 py-2 text-xs font-mono text-[#1B2434] dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1B2434] focus:border-[#1B2434] dark:focus:ring-slate-400'
    />
  </label>
);

/* ============================================================
 *  RE-UPLOAD MODAL
 * ============================================================ */
const ReuploadModal: React.FC<{
  docName: string;
  onClose: () => void;
  onFile: (fileName: string) => void;
  fileRef: React.RefObject<HTMLInputElement>;
}> = ({ docName, onClose, onFile }) => {
  const { t } = useTranslation('student');
  const localRef = useRef<HTMLInputElement>(null);
  return (
    <Modal isOpen onClose={onClose} title={t('tracker.reuploadTitle')} size='md'>
      <div className='space-y-4 font-sans'>
        <p className='text-xs text-slate-600 dark:text-slate-300'>
          {t('tracker.reuploadPrompt', { doc: docName })}
        </p>
        <input
          ref={localRef}
          type='file'
          accept='.jpg,.jpeg,.png,.webp,.pdf'
          className='hidden'
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f.name);
          }}
        />
        <div
          onClick={() => localRef.current?.click()}
          className='border border-dashed border-[#1B2434]/20 dark:border-slate-700 rounded-md p-8 text-center cursor-pointer hover:border-[#1B2434]/40 hover:bg-[#1B2434]/[0.02] transition-colors'
        >
          <Upload
            size={22}
            className='mx-auto text-[#1B2434] dark:text-slate-400'
          />
          <p className='text-xs font-medium mt-2 text-[#1B2434] dark:text-slate-200'>
            {t('tracker.clickToChoose')}
          </p>
          <p className='text-[11px] font-mono text-slate-500 mt-1'>
            {t('tracker.fileTypes')}
          </p>
        </div>
        <div className='flex justify-end pt-2'>
          <button className={btnOutline} onClick={onClose}>
            {t('tracker.cancel')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default Tracker;
