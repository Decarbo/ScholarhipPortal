import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, EmptyState, Button } from '../../components/ui';
import { useAppStore } from '../../store';
import { students, type VaultDocument } from '../../mock/data';
import * as realApi from '../../services/realApi';
import { getFileUrl } from '../../services/fileUrl';
import { FileText, FolderOpen, Trash2, Upload, RefreshCw, ShieldCheck, Eye, Loader2, CheckCircle2 } from 'lucide-react';

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.pdf';
const MAX_SIZE_MB = 5;
const MAX_FILES = 10;

type Source = 'backend' | 'mock';

export const StudentVault: React.FC = () => {
  const { addToast } = useAppStore();
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [source, setSource] = useState<Source>('mock');
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await realApi.getVaultDocuments();
      setVaultDocs(docs);
      setSource('backend');
    } catch {
      // Backend unavailable — fall back to seeded mock vault so the UI still works
      setVaultDocs(students[0]?.documentVault ?? []);
      setSource('mock');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const validateFiles = (files: File[]): File[] => {
    const okTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const valid: File[] = [];
    for (const f of files) {
      if (!okTypes.includes(f.type)) {
        addToast('error', `"${f.name}": only JPG, PNG, WEBP or PDF allowed`);
      } else if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        addToast('error', `"${f.name}" exceeds ${MAX_SIZE_MB} MB limit`);
      } else {
        valid.push(f);
      }
    }
    return valid.slice(0, MAX_FILES);
  };

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = validateFiles(Array.from(fileList));
    if (files.length === 0) return;

    setUploading(true);
    try {
      const docs = await realApi.uploadVaultDocuments(files);
      setVaultDocs(prev => [...prev, ...docs]);
      setSource('backend');
      addToast('success', `${docs.length} document(s) uploaded & AI-checked`);
    } catch (err: any) {
      addToast('error', err?.message || 'Upload failed. Is the backend running?');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    if (source === 'backend') {
      try {
        await realApi.deleteVaultDocument(docId);
        setVaultDocs(prev => prev.filter(d => d.id !== docId));
        addToast('info', 'Document removed from vault');
        return;
      } catch (err: any) {
        addToast('error', err?.message || 'Could not delete document');
        return;
      }
    }
    setVaultDocs(prev => prev.filter(d => d.id !== docId));
    addToast('info', 'Document removed (demo mode — backend offline)');
  };

  const handleVerify = async (docId: string) => {
    try {
      const updated = await realApi.verifyVaultDocument(docId);
      setVaultDocs(prev => prev.map(d => (d.id === docId ? { ...d, ...updated } : d)));
      addToast('success', 'Document marked as verified');
    } catch (err: any) {
      addToast('error', err?.message || 'Verification failed');
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#7EC5E2] shrink-0 mt-0.5">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1D293D] dark:text-white leading-tight">{t('vault.title')}</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">{t('vault.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={source === 'backend' ? 'success' : 'warning'}>
            {source === 'backend' ? 'Live server' : 'Demo mode (offline)'}
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void load()}
            icon={<RefreshCw size={14} className={loading ? 'animate-spin' : ''} />}
            aria-label="Refresh documents"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-[#E6F1F5] dark:bg-[#0B75A4]/15 border border-[#0B75A4]/25 dark:border-[#0B75A4]/30 rounded-xl p-4">
        <p className="text-sm text-[#0B75A4] dark:text-[#7EC5E2] font-semibold">How it works:</p>
        <p className="text-xs text-[#475569] dark:text-slate-300 mt-1 leading-relaxed">
          Upload documents here once (JPG/PNG/WEBP/PDF, max {MAX_SIZE_MB} MB each, up to {MAX_FILES} per batch).
          The server stores them in your personal vault, runs an AI quality check, and makes them reusable across all applications.
        </p>
      </div>

      {/* Advanced dropzone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={e => { e.preventDefault(); setDragActive(false); void handleUpload(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${dragActive ? 'border-[#0B75A4] bg-[#E6F1F5] dark:bg-[#0B75A4]/20' : 'border-[#CBD5E1] bg-white dark:bg-slate-800 hover:border-[#0B75A4] hover:bg-[#F8FAFC] dark:hover:bg-slate-800/80'}
          ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
        role="button"
        aria-label="Upload documents"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={e => void handleUpload(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-[#0B75A4]">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm font-semibold">Uploading &amp; scanning documents…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#E6F1F5] dark:bg-[#0B75A4]/20 flex items-center justify-center text-[#0B75A4] dark:text-[#7EC5E2]">
              <Upload size={22} />
            </div>
            <p className="text-sm font-semibold text-[#1D293D] dark:text-slate-200 mt-1">{tc('fileUpload.dragDrop')}</p>
            <p className="text-xs text-[#94A3B8]">JPG, PNG, WEBP, PDF · up to {MAX_SIZE_MB} MB · max {MAX_FILES} files per upload</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card className="!p-8 flex items-center justify-center gap-2 text-[#64748B]">
            <Loader2 size={18} className="animate-spin text-[#0B75A4]" /> {tc('common.loading')}
          </Card>
        ) : vaultDocs.length === 0 ? (
          <EmptyState icon={<FolderOpen size={40} className="text-[#94A3B8]" />} title={t('documents.noDocuments')} description={t('vault.subtitle')} />
        ) : (
          vaultDocs.map(doc => (
            <Card key={doc.id} className="!p-4 border border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${
                    doc.status === 'verified' 
                      ? 'bg-[#009B68]/12 text-[#006045] dark:text-[#38C88B]' 
                      : doc.status === 'flagged' 
                      ? 'bg-[#FEE2E2] text-[#B91C1C]' 
                      : 'bg-[#FEF3C7] text-[#B45309]'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1D293D] dark:text-white">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={doc.status === 'verified' ? 'success' : doc.status === 'flagged' ? 'danger' : 'warning'}>{doc.status}</Badge>
                      {doc.category && <span className="text-xs capitalize text-[#64748B] dark:text-slate-400">{doc.category}</span>}
                      <span className="text-xs text-[#009B68] font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> AI Score: {doc.aiScore}%
                      </span>
                      {(doc.usedInApplications?.length ?? 0) > 0 && <span className="text-xs text-[#0B75A4] dark:text-[#7EC5E2]">Used in {doc.usedInApplications.length} application(s)</span>}
                      {doc.expiryDate && <span className="text-xs text-[#94A3B8]">Expires: {doc.expiryDate}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {doc.sampleAvailable && <Badge variant="info">Sample available</Badge>}
                  {getFileUrl((doc as any).filePath) && (
                    <a
                      href={getFileUrl((doc as any).filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-slate-800 text-[#64748B] hover:text-[#0B75A4] transition-colors"
                      aria-label="Preview document"
                      onClick={e => e.stopPropagation()}
                    >
                      <Eye size={16} />
                    </a>
                  )}
                  {source === 'backend' && doc.status !== 'verified' && (
                    <button 
                      onClick={() => void handleVerify(doc.id)} 
                      className="p-2 rounded-lg hover:bg-[#009B68]/10 text-[#009B68] transition-colors cursor-pointer" 
                      aria-label="Mark verified" 
                      title="Simulate verification"
                    >
                      <ShieldCheck size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => void handleDelete(doc.id)} 
                    className="p-2 rounded-lg hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#EF4444] transition-colors cursor-pointer" 
                    aria-label="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentVault;
