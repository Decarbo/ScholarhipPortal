import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, EmptyState } from '../../components/ui';
import { useAppStore } from '../../store';
import { students, type VaultDocument } from '../../mock/data';
import * as realApi from '../../services/realApi';
import { getFileUrl } from '../../services/fileUrl';
import { FileText, FolderOpen, Trash2, Upload, RefreshCw, ShieldCheck, Eye, Loader2 } from 'lucide-react';

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
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📁 {t('vault.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('vault.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={source === 'backend' ? 'success' : 'warning'}>
            {source === 'backend' ? 'Live server' : 'Demo mode (offline)'}
          </Badge>
          <button onClick={() => void load()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" aria-label="Refresh documents">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">💡 How it works:</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Upload documents here once (JPG/PNG/WEBP/PDF, max {MAX_SIZE_MB} MB each, up to {MAX_FILES} per batch).
          The server stores them in your personal vault, runs an AI quality check, and makes them reusable in every application.
        </p>
      </div>

      {/* Advanced dropzone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={e => { e.preventDefault(); setDragActive(false); void handleUpload(e.dataTransfer.files); }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-blue-400'}
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
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm font-medium">Uploading &amp; scanning documents…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload size={28} className="text-blue-500" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{tc('fileUpload.dragDrop')}</p>
            <p className="text-xs text-slate-400">JPG, PNG, WEBP, PDF · up to {MAX_SIZE_MB} MB · max {MAX_FILES} files per upload</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <Card className="!p-8 flex items-center justify-center gap-2 text-slate-500">
            <Loader2 size={18} className="animate-spin" /> {tc('common.loading')}
          </Card>
        ) : vaultDocs.length === 0 ? (
          <EmptyState icon={<FolderOpen size={40} />} title={t('documents.noDocuments')} description={t('vault.subtitle')} />
        ) : (
          vaultDocs.map(doc => (
            <Card key={doc.id} className="!p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${doc.status === 'verified' ? 'bg-emerald-100 dark:bg-emerald-900/30' : doc.status === 'flagged' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    <FileText size={18} className={doc.status === 'verified' ? 'text-emerald-600' : doc.status === 'flagged' ? 'text-red-600' : 'text-amber-600'} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={doc.status === 'verified' ? 'success' : doc.status === 'flagged' ? 'danger' : 'warning'}>{doc.status}</Badge>
                      {doc.category && <span className="text-xs capitalize text-slate-500">{doc.category}</span>}
                      <span className="text-xs text-slate-500">AI Score: {doc.aiScore}%</span>
                      {(doc.usedInApplications?.length ?? 0) > 0 && <span className="text-xs text-blue-500">Used in {doc.usedInApplications.length} application(s)</span>}
                      {doc.expiryDate && <span className="text-xs text-slate-400">Expires: {doc.expiryDate}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.sampleAvailable && <Badge variant="info">Sample available</Badge>}
                  {getFileUrl((doc as any).filePath) && (
                    <a
                      href={getFileUrl((doc as any).filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      aria-label="Preview document"
                      onClick={e => e.stopPropagation()}
                    >
                      <Eye size={16} />
                    </a>
                  )}
                  {source === 'backend' && doc.status !== 'verified' && (
                    <button onClick={() => void handleVerify(doc.id)} className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600" aria-label="Mark verified" title="Simulate verification">
                      <ShieldCheck size={16} />
                    </button>
                  )}
                  <button onClick={() => void handleDelete(doc.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500" aria-label="Delete document">
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
