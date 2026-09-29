import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, Badge, EmptyState, Button } from "../../components/ui";
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
  FolderDot,
  CheckCircle2,
  Sparkles
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
    const score = Math.floor(88 + Math.random() * 11);

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
      const score = Math.floor(88 + Math.random() * 11);
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
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#7EC5E2] shrink-0 mt-0.5">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t('documents.ocrTitle')}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
              {t('documents.ocrSubtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-[#DEE2E6] text-[#64748B] text-xs">
            {t('tracker.frontendOnly')}
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            icon={<RefreshCw size={14} />}
            title="Clear vault"
          >
            Clear Vault
          </Button>
        </div>
      </div>

      {/* Standardized Upload Area */}
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
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragActive
            ? "border-[#0B75A4] bg-[#E6F1F5] dark:bg-[#0B75A4]/20"
            : "border-[#CBD5E1] bg-white dark:bg-slate-800 hover:border-[#0B75A4] hover:bg-[#F8FAFC] dark:hover:bg-slate-800/80"
        }`}
        role="button"
        tabIndex={0}
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
          <div className="w-12 h-12 rounded-full bg-[#E6F1F5] dark:bg-[#0B75A4]/20 flex items-center justify-center text-[#0B75A4] dark:text-[#7EC5E2]">
            <Upload size={22} />
          </div>
          <p className="text-sm font-semibold text-[#1D293D] dark:text-slate-200 mt-1">
            {t('documents.dragDropBrowse')}
          </p>
          <p className="text-xs text-[#94A3B8]">
            {t('documents.fileSpecs')}
          </p>
        </div>
      </div>

      {/* Documents List */}
      {docs.length === 0 ? (
        <EmptyState
          icon={<FolderDot size={36} className="text-[#94A3B8]" />}
          title={t('documents.emptyVault')}
          description={t('documents.emptyVaultDesc')}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-semibold text-[#1D293D] dark:text-white">
              {t('documents.processedRecords', { count: docs.length })}
            </h2>
            <span className="text-xs text-[#64748B]">Showing verified and pending OCR scans</span>
          </div>

          {docs.map((doc) => (
            <Card key={doc.id} className="border border-[#DEE2E6] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xs">
              <div className="flex items-start gap-4 sm:gap-5 flex-col sm:flex-row">
                {/* Preview thumb */}
                <div className="w-24 h-28 shrink-0 rounded-lg overflow-hidden border border-[#DEE2E6] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
                  {doc.previewUrl ? (
                    <img src={doc.previewUrl} alt={doc.name} className="w-full h-full object-cover" />
                  ) : (
                    <FileText size={28} className="text-[#94A3B8]" />
                  )}
                </div>

                {/* Info + text below */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0 space-y-1">
                      <p className="text-base font-semibold text-[#1D293D] dark:text-white truncate">
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {doc.status === "processing" && (
                          <Badge variant="warning" className="text-xs">
                            {t('documents.scanning')}
                          </Badge>
                        )}
                        {doc.status === "review" && (
                          <Badge variant="warning" className="text-xs">
                            {t('documents.reviewPending')}
                          </Badge>
                        )}
                        {doc.status === "saved" && (
                          <Badge variant="success" className="text-xs">
                            {doc.edited ? t('documents.savedEdited') : t('documents.savedRecord')}
                          </Badge>
                        )}
                        {doc.aiScore > 0 && (
                          <span className="text-xs text-[#009B68] font-semibold flex items-center gap-1">
                            <CheckCircle2 size={13} />
                            OCR Confidence: {doc.aiScore}% · Match: 100%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.status === "review" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleEditAgain(doc.id)}
                          icon={<Pencil size={13} />}
                        >
                          {t('documents.reviewOcr')}
                        </Button>
                      )}
                      {doc.status === "saved" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEditAgain(doc.id)}
                          icon={<Pencil size={13} />}
                        >
                          Edit
                        </Button>
                      )}
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title={t('documents.deleteRecord')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Document information cells - Standard #F8FAFC background */}
                  {doc.fields && doc.fields.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#F8FAFC] dark:bg-slate-900/60 p-3 rounded-lg border border-[#F1F5F9] dark:border-slate-800">
                      {doc.fields.slice(0, 4).map((f, idx) => (
                        <div key={idx} className="min-w-0">
                          <p className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider truncate">{f.label}</p>
                          <p className="text-xs font-medium text-[#1D293D] dark:text-slate-200 truncate mt-0.5">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* OCR text below the doc */}
                  {doc.status === "processing" ? (
                    <div className="mt-3 rounded-lg border border-[#DEE2E6] bg-[#F8FAFC] dark:bg-slate-900/60 dark:border-slate-800 p-3.5 flex items-center gap-2.5 text-xs text-[#64748B]">
                      <Loader2 size={15} className="animate-spin text-[#0B75A4]" />
                      {t('documents.parsing')}
                    </div>
                  ) : doc.extractedText ? (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                          {t('documents.extractedRecord')}
                        </span>
                        {doc.edited && (
                          <span className="text-xs font-medium text-[#F59E0B] flex items-center gap-1">
                            <AlertTriangle size={12} /> {t('documents.manuallyCorrected')}
                          </span>
                        )}
                      </div>
                      <pre className="rounded-lg border border-[#DEE2E6] dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/60 p-3 text-xs leading-relaxed text-[#1D293D] dark:text-slate-300 whitespace-pre-wrap font-mono max-h-36 overflow-auto">
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

      {/* Standardized OCR Modal */}
      {modalOpen && modalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-[#DEE2E6] dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEE2E6] dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#7EC5E2]">
                  <ScanLine size={18} />
                </div>
                <h2 className="text-base font-semibold text-[#1D293D] dark:text-white">
                  {modalPhase === "scanning" ? "Analyzing Document OCR" : "Review Extracted Record"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setModalDocId(null);
                }}
                className="p-1.5 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] hover:text-[#1D293D] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-auto p-5 sm:p-6 bg-[#F8F8F8] dark:bg-slate-900/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Preview */}
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-[#475569] dark:text-slate-400 mb-2 uppercase tracking-wider">
                    Source Document
                  </p>
                  <div className="relative flex-1 rounded-xl overflow-hidden border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 min-h-[280px]">
                    {modalDoc.previewUrl ? (
                      <img src={modalDoc.previewUrl} alt={modalDoc.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-[#94A3B8] gap-2.5 p-4">
                        <FileText size={44} className="opacity-40" />
                        <p className="text-xs font-mono text-center break-all">
                          {modalDoc.name}
                        </p>
                      </div>
                    )}
                    {modalPhase === "scanning" && (
                      <>
                        <div className="absolute inset-0 bg-[#0B75A4]/5" />
                        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#0B75A4] to-transparent shadow-[0_0_15px_3px_rgba(11,117,164,0.4)] animate-progress" />
                      </>
                    )}
                  </div>
                </div>

                {/* OCR text area */}
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-[#475569] dark:text-slate-400 mb-2 uppercase tracking-wider">
                    {modalPhase === "scanning" ? "Extraction Progress" : "Editable Output"}
                  </p>

                  {modalPhase === "scanning" ? (
                    <div className="flex-1 rounded-xl border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex flex-col items-center justify-center gap-3">
                      <ScanLine size={32} className="animate-pulse text-[#0B75A4]" />
                      <p className="text-sm font-semibold text-[#1D293D] dark:text-slate-200">
                        Extracting structured data fields...
                      </p>
                      <p className="text-xs text-[#64748B]">Matching PAN / Aadhaar / Academic records</p>
                      <div className="w-full max-w-[200px] space-y-2 mt-3">
                        {[80, 60, 90, 50, 70].map((w, i) => (
                          <div
                            key={i}
                            className="h-1.5 rounded-full bg-[#E6F1F5] dark:bg-slate-700 overflow-hidden"
                          >
                            <div className="h-full bg-[#0B75A4] rounded-full animate-progress" style={{ width: `${w}%` }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      value={editableText}
                      onChange={(e) => setEditableText(e.target.value)}
                      spellCheck={false}
                      className="flex-1 min-h-[280px] rounded-xl border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-xs font-mono leading-relaxed text-[#1D293D] dark:text-slate-200 resize-none focus:outline-none focus:border-[#0B75A4] focus:ring-2 focus:ring-[#0B75A4]/20"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            {modalPhase === "review" && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-[#DEE2E6] dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-[#009B68]" />
                  Verify extracted text and amend any details before saving.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditableText(modalDoc.originalText)}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveText}
                    icon={<Save size={14} />}
                  >
                    Commit Record
                  </Button>
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