import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, Badge, EmptyState } from "../../components/ui";
import { useAppStore } from "../../store";
import {
  FileText,
  FolderOpen,
  Trash2,
  Upload,
  RefreshCw,
  Loader2,
  ScanLine,
  CheckCircle,
  Pencil,
  Save,
  X,
  AlertTriangle,
  FolderDot
} from "lucide-react";

const ACCEPTED = ".jpg,.jpeg,.png,.webp,.pdf";
const MAX_SIZE_MB = 5;
const MAX_FILES = 10;
const STORAGE_KEY = "ocr_vault_documents_v3";

export interface OcrVaultDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  previewUrl?: string;
  extractedText: string;
  originalText: string;
  fields: { label: string; value: string }[];
  uploadedAt: string;
  status: "processing" | "review" | "saved";
  aiScore: number;
  edited: boolean;
}

const OCR_TEMPLATES = [
  {
    text: `GOVERNMENT OF INDIA\nINCOME TAX DEPARTMENT\n\nPermanent Account Number Card\n\nName: RAHUL SHARMA\nFather's Name: MOHAN SHARMA\nDate of Birth: 15/08/1995\nPAN: ABCDE1234F`,
    fields: [
      { label: "Document Type", value: "PAN Card" },
      { label: "Name", value: "RAHUL SHARMA" },
      { label: "Father's Name", value: "MOHAN SHARMA" },
      { label: "Date of Birth", value: "15/08/1995" },
      { label: "PAN Number", value: "ABCDE1234F" },
    ],
  },
  {
    text: `UNIQUE IDENTIFICATION AUTHORITY OF INDIA\n\nAadhaar Card\n\nName: PRIYA VERMA\nGender: Female\nDOB: 22/03/1998\nAadhaar No: [Aadhaar Redacted]`,
    fields: [
      { label: "Document Type", value: "Aadhaar Card" },
      { label: "Name", value: "PRIYA VERMA" },
      { label: "Gender", value: "Female" },
      { label: "Date of Birth", value: "22/03/1998" },
      { label: "Aadhaar Number", value: "[Aadhaar Redacted]" },
    ],
  },
  {
    text: `BOARD OF SECONDARY EDUCATION\n\nINDIAN CERTIFICATE OF SECONDARY EDUCATION\n\nCertificate No: ICSE/2020/458921\nCandidate Name: ANJALI SINGH\nRoll No: 7845123\nDate of Issue: 10/06/2020\nResult: PASSED with 92.4%`,
    fields: [
      { label: "Document Type", value: "ICSE Certificate" },
      { label: "Certificate Number", value: "ICSE/2020/458921" },
      { label: "Candidate Name", value: "ANJALI SINGH" },
      { label: "Roll Number", value: "7845123" },
      { label: "Date of Issue", value: "10/06/2020" },
      { label: "Result", value: "PASSED with 92.4%" },
    ],
  },
  {
    text: `NATIONAL SKILL DEVELOPMENT CORPORATION\n\nSKILL CERTIFICATE\n\nCertificate No: NSDC/2023/IT/77845\nCandidate: VIKRAM PATEL\nCourse: Full Stack Web Development\nGrade: A+\nIssued On: 18/11/2023`,
    fields: [
      { label: "Document Type", value: "Skill Certificate" },
      { label: "Certificate Number", value: "NSDC/2023/IT/77845" },
      { label: "Candidate Name", value: "VIKRAM PATEL" },
      { label: "Course", value: "Full Stack Web Development" },
      { label: "Grade", value: "A+" },
      { label: "Issued On", value: "18/11/2023" },
    ],
  },
];

const StudentVaultOCR: React.FC = () => {
  const { addToast } = useAppStore();
  const [docs, setDocs] = useState<OcrVaultDoc[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Modal state */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState<"scanning" | "review">("scanning");
  const [modalDocId, setModalDocId] = useState<string | null>(null);
  const [editableText, setEditableText] = useState("");
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const processingRef = useRef<Set<string>>(new Set());

  // Shared classes
  const btnPrimary = "bg-[#1B2434] hover:bg-[#1B2434]/90 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-[#0F1622] transition-colors rounded-md";
  const btnOutline = "bg-transparent border border-[#1B2434]/15 dark:border-slate-700 text-[#1B2434] dark:text-slate-200 hover:bg-[#1B2434]/5 dark:hover:bg-slate-800 transition-colors rounded-md";

  /* ---------- Load ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: OcrVaultDoc[] = JSON.parse(raw);
        setDocs(
          parsed.map((d) => ({ ...d, previewUrl: undefined, status: "saved" }))
        );
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /* ---------- Persist ---------- */
  useEffect(() => {
    const serializable = docs.map(({ previewUrl, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, [docs]);

  /* ---------- Validate ---------- */
  const validateFiles = (files: File[]): File[] => {
    const ok = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    const valid: File[] = [];
    for (const f of files) {
      if (!ok.includes(f.type)) {
        addToast("error", `"${f.name}": only JPG, PNG, WEBP or PDF allowed`);
      } else if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        addToast("error", `"${f.name}" exceeds ${MAX_SIZE_MB} MB limit`);
      } else {
        valid.push(f);
      }
    }
    return valid.slice(0, MAX_FILES);
  };

  /* ---------- Open modal for a doc & run OCR ---------- */
  const startOcr = (docId: string) => {
    if (processingRef.current.has(docId)) return;
    processingRef.current.add(docId);

    setModalDocId(docId);
    setModalPhase("scanning");
    setEditableText("");
    setModalOpen(true);

    const template = OCR_TEMPLATES[Math.floor(Math.random() * OCR_TEMPLATES.length)];
    const score = Math.floor(85 + Math.random() * 14);

    setTimeout(() => {
      setDocs((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: "review",
                extractedText: template.text,
                originalText: template.text,
                fields: template.fields,
                aiScore: score,
              }
            : d
        )
      );
      setEditableText(template.text);
      setModalPhase("review");
      processingRef.current.delete(docId);
    }, 2500);
  };

  /* ---------- Upload ---------- */
  const handleUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = validateFiles(Array.from(fileList));
    if (files.length === 0) return;

    const newDocs: OcrVaultDoc[] = files.map((f) => ({
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
      extractedText: "",
      originalText: "",
      fields: [],
      uploadedAt: new Date().toISOString(),
      status: "processing",
      aiScore: 0,
      edited: false,
    }));

    setDocs((prev) => [...newDocs, ...prev]);
    addToast("info", `${newDocs.length} document(s) uploaded — running OCR…`);

    if (newDocs[0]) startOcr(newDocs[0].id);

    newDocs.slice(1).forEach((d) => {
      if (processingRef.current.has(d.id)) return;
      processingRef.current.add(d.id);
      const template = OCR_TEMPLATES[Math.floor(Math.random() * OCR_TEMPLATES.length)];
      const score = Math.floor(85 + Math.random() * 14);
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((x) =>
            x.id === d.id
              ? {
                  ...x,
                  status: "review",
                  extractedText: template.text,
                  originalText: template.text,
                  fields: template.fields,
                  aiScore: score,
                }
              : x
          )
        );
        processingRef.current.delete(d.id);
      }, 2500);
    });

    if (inputRef.current) inputRef.current.value = "";
  };

  /* ---------- Save corrected text ---------- */
  const handleSaveText = () => {
    if (!modalDocId) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === modalDocId
          ? {
              ...d,
              extractedText: editableText,
              status: "saved",
              edited: editableText.trim() !== d.originalText.trim(),
            }
          : d
      )
    );
    addToast("success", "OCR text saved for this document");
    setModalOpen(false);
    setModalDocId(null);
  };

  /* ---------- Reopen editor for an already-saved doc ---------- */
  const handleEditAgain = (docId: string) => {
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return;
    setModalDocId(docId);
    setEditableText(doc.extractedText);
    setModalPhase("review");
    setModalOpen(true);
  };

  /* ---------- Delete ---------- */
  const handleDelete = (docId: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    processingRef.current.delete(docId);
    addToast("info", "Document removed from vault");
  };

  /* ---------- Reset ---------- */
  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    processingRef.current.clear();
    setDocs([]);
    addToast("info", "Vault cleared");
  };

  const modalDoc = docs.find((d) => d.id === modalDocId) || null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto font-sans text-[#1B2434] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1B2434]/10 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <FolderOpen size={32} className="text-[#1B2434] dark:text-slate-300 shrink-0 mt-1" />
          <div>
            <h1 className="font-serif text-[28px] md:text-[34px] text-[#1B2434] dark:text-white leading-tight">
              {t('documents.ocrTitle')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('documents.ocrSubtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#1B2434]/15 text-slate-500 text-[11px] font-mono uppercase tracking-wider">
            {t('tracker.frontendOnly')}
          </Badge>
          <button
            onClick={handleReset}
            className="p-2 rounded-md border border-[#1B2434]/15 text-[#1B2434] hover:bg-[#1B2434]/5 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            aria-label="Clear vault"
            title="Clear vault"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleUpload(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`border border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${
          dragActive
            ? "border-[#1B2434] bg-[#1B2434]/[0.03] dark:border-slate-400 dark:bg-slate-800/40"
            : "border-[#1B2434]/20 dark:border-slate-700 hover:border-[#1B2434]/40 hover:bg-[#1B2434]/[0.02]"
        }`}
        role="button"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <Upload size={24} className="text-[#1B2434] dark:text-slate-400" />
          <p className="text-sm font-medium text-[#1B2434] dark:text-slate-200 mt-2">
            {t('documents.dragDropBrowse')}
          </p>
          <p className="text-[13px] text-slate-500">
            {t('documents.fileSpecs')}
          </p>
        </div>
      </div>

      {/* List */}
      {docs.length === 0 ? (
        <EmptyState
          icon={<FolderDot size={40} className="text-[#1B2434]/40 dark:text-slate-600" />}
          title={t('documents.emptyVault')}
          description={t('documents.emptyVaultDesc')}
        />
      ) : (
        <div className="space-y-4">
          <h2 className="font-serif text-lg text-[#1B2434] dark:text-white px-1">
            {t('documents.processedRecords', { count: docs.length })}
          </h2>
          {docs.map((doc) => (
            <Card key={doc.id} className="border border-[#1B2434]/10 dark:border-slate-800 rounded-md shadow-none bg-white dark:bg-[#0F1622] p-5">
              <div className="flex items-start gap-5">
                {/* Preview thumb */}
                <div className="w-24 h-32 shrink-0 rounded-md overflow-hidden border border-[#1B2434]/15 dark:border-slate-700 bg-slate-50 dark:bg-[#0F1622] flex items-center justify-center">
                  {doc.previewUrl ? (
                    <img src={doc.previewUrl} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={28} className="text-slate-300" />
                  )}
                </div>

                {/* Info + text below */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0 space-y-1.5">
                      <p className="font-serif text-lg text-[#1B2434] dark:text-white truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {doc.status === "processing" && (
                          <Badge variant="outline" className="border-[#1B2434]/20 bg-[#1B2434]/[0.04] text-[#1B2434] dark:border-slate-500/30 dark:bg-slate-800/40 dark:text-slate-300 text-[11px] font-mono uppercase tracking-wider">
                            {t('documents.scanning')}
                          </Badge>
                        )}
                        {doc.status === "review" && (
                          <Badge variant="outline" className="border-[#B4472A]/30 bg-[#B4472A]/[0.04] text-[#B4472A] dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 text-[11px] font-mono uppercase tracking-wider">
                            {t('documents.reviewPending')}
                          </Badge>
                        )}
                        {doc.status === "saved" && (
                          <Badge variant="outline" className="border-[#2E6B4F]/20 bg-[#2E6B4F]/[0.04] text-[#2E6B4F] dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400 text-[11px] font-mono uppercase tracking-wider">
                            {doc.edited ? t('documents.savedEdited') : t('documents.savedRecord')}
                          </Badge>
                        )}
                        {doc.aiScore > 0 && (
                          <span className="text-[13px] text-slate-500 flex items-center gap-1">
                            · {t('documents.aiConfidence', { score: doc.aiScore })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.status === "review" && (
                        <button
                          onClick={() => handleEditAgain(doc.id)}
                          className={`px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5 ${btnPrimary}`}
                        >
                          <Pencil size={14} /> {t('documents.reviewOcr')}
                        </button>
                      )}
                      {doc.status === "saved" && (
                        <button
                          onClick={() => handleEditAgain(doc.id)}
                          className={`p-1.5 ${btnOutline}`}
                          title="Edit text"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-md border border-transparent hover:border-[#B4472A]/30 hover:bg-[#B4472A]/[0.04] text-[#B4472A] transition-colors"
                        title={t('documents.deleteRecord')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* OCR text below the doc */}
                  {doc.status === "processing" ? (
                    <div className="mt-4 rounded-md border border-[#1B2434]/10 bg-[#1B2434]/[0.02] dark:border-slate-800 p-4 flex items-center gap-3 text-sm text-slate-500">
                      <Loader2 size={16} className="animate-spin text-[#1B2434] dark:text-slate-400" />
                      {t('documents.parsing')}
                    </div>
                  ) : doc.extractedText ? (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                          {t('documents.extractedRecord')}
                        </span>
                        {doc.edited && (
                          <span className="text-[11px] font-medium text-[#B4472A] dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle size={12} /> {t('documents.manuallyCorrected')}
                          </span>
                        )}
                      </div>
                      <pre className="rounded-md border border-[#1B2434]/10 dark:border-slate-800 bg-[#1B2434]/[0.01] dark:bg-slate-900/50 p-4 text-[13px] leading-relaxed text-[#1B2434] dark:text-slate-300 whitespace-pre-wrap font-mono max-h-48 overflow-auto">
                        {doc.extractedText}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- OCR MODAL ---------- */}
      {modalOpen && modalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2434]/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0F1622] rounded-md border border-[#1B2434]/15 shadow-sm w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1B2434]/10 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <ScanLine size={20} className="text-[#1B2434] dark:text-white" />
                <h2 className="font-serif text-lg text-[#1B2434] dark:text-white">
                  {modalPhase === "scanning" ? "Processing Document" : "Review Extracted Record"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setModalDocId(null);
                }}
                className="p-1.5 rounded-md hover:bg-[#1B2434]/5 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-auto p-6 bg-[#1B2434]/[0.01] dark:bg-transparent">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preview */}
                <div className="flex flex-col">
                  <p className="text-[11px] font-mono font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Source Document
                  </p>
                  <div className="relative flex-1 rounded-md overflow-hidden border border-[#1B2434]/15 dark:border-slate-700 bg-white dark:bg-[#0F1622] min-h-[300px]">
                    {modalDoc.previewUrl ? (
                      <img src={modalDoc.previewUrl} alt={modalDoc.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3 p-4">
                        <FileText size={48} className="opacity-50" />
                        <p className="text-sm font-mono text-center break-all">
                          {modalDoc.name}
                        </p>
                      </div>
                    )}
                    {modalPhase === "scanning" && (
                      <>
                        <div className="absolute inset-0 bg-[#1B2434]/[0.03]" />
                        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#1B2434] to-transparent shadow-[0_0_15px_3px_rgba(27,36,52,0.3)] dark:via-slate-300 dark:shadow-[0_0_15px_3px_rgba(203,213,225,0.3)] animate-ocr-scan" />
                      </>
                    )}
                  </div>
                </div>

                {/* OCR text area */}
                <div className="flex flex-col">
                  <p className="text-[11px] font-mono font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    {modalPhase === "scanning" ? "Extraction Progress" : "Editable Output"}
                  </p>

                  {modalPhase === "scanning" ? (
                    <div className="flex-1 rounded-md border border-[#1B2434]/15 dark:border-slate-700 bg-white dark:bg-[#0F1622] p-6 flex flex-col items-center justify-center gap-4">
                      <ScanLine size={32} className="animate-pulse text-[#1B2434] dark:text-slate-400" />
                      <p className="text-sm font-medium text-[#1B2434] dark:text-slate-300">
                        Analyzing fields...
                      </p>
                      <div className="w-full max-w-[200px] space-y-2 mt-4">
                        {[80, 60, 90, 50, 70, 65].map((w, i) => (
                          <div
                            key={i}
                            className="h-1.5 rounded-full bg-[#1B2434]/20 dark:bg-slate-700 animate-pulse"
                            style={{
                              width: `${w}%`,
                              animationDelay: `${i * 120}ms`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={editableText}
                      onChange={(e) => setEditableText(e.target.value)}
                      spellCheck={false}
                      className="flex-1 min-h-[300px] rounded-md border border-[#1B2434]/15 dark:border-slate-700 bg-white dark:bg-[#0F1622] p-4 text-[13px] font-mono leading-relaxed text-[#1B2434] dark:text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-[#1B2434] focus:border-[#1B2434] dark:focus:ring-slate-400"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            {modalPhase === "review" && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#1B2434]/10 dark:border-slate-800 bg-white dark:bg-[#0F1622]">
                <p className="text-[13px] text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle size={14} className="text-[#B4472A]" />
                  Amend any incorrect values before committing to vault.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditableText(modalDoc.originalText)}
                    className="px-4 py-2 rounded-md text-[13px] font-medium text-slate-600 dark:text-slate-300 hover:bg-[#1B2434]/5 dark:hover:bg-slate-800 transition-colors"
                  >
                    Reset to original
                  </button>
                  <button
                    onClick={handleSaveText}
                    className={`px-5 py-2 text-[13px] font-medium flex items-center gap-2 ${btnPrimary}`}
                  >
                    <Save size={14} /> Commit Record
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentVaultOCR;