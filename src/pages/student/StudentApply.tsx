import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Stepper } from '../../components/ui';
import { VoiceInput, AutoSaveIndicator, SampleDocumentViewer } from '../../components/accessibility';
import { useAppStore } from '../../store';
import { schemes as mockSchemes, students, type Scheme, type Student, type VaultDocument } from '../../mock/data';
import * as realApi from '../../services/realApi';
import { FileText, Upload, Loader2, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLocalizedScheme } from '../../utils/localizedData';

const MAX_SIZE_MB = 5;
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export const StudentApply: React.FC<{ location?: { state?: { schemeId?: string; appId?: string } } }> = ({ location }) => {
  const { addToast } = useAppStore();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>(mockSchemes);
  const [student, setStudent] = useState<Student>(students[0]);
  const [vaultDocs, setVaultDocs] = useState<VaultDocument[]>([]);
  const [backendLive, setBackendLive] = useState(false);

  const [selectedSchemeId, setSelectedSchemeId] = useState(location?.state?.schemeId || '');
  const [step, setStep] = useState(0);
  const [selectedVaultDocs, setSelectedVaultDocs] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | undefined>();
  const [appId, setAppId] = useState<string | null>(null);
  const { t, i18n } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rawSelectedScheme = schemes.find(s => s.id === selectedSchemeId);
  const selectedScheme = rawSelectedScheme ? getLocalizedScheme(rawSelectedScheme, i18n.language) : undefined;

  // Load live data (falls back to mock when backend offline)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [liveSchemes, profile, vault] = await Promise.all([
          realApi.getSchemes(),
          realApi.getStudentProfile(),
          realApi.getVaultDocuments(),
        ]);
        if (!alive) return;
        setSchemes(liveSchemes);
        setStudent(profile);
        setVaultDocs(vault);
        setBackendLive(true);
      } catch {
        if (!alive) return;
        setVaultDocs(students[0]?.documentVault ?? []);
        setBackendLive(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Ensure a draft application exists on the backend once a scheme is chosen
  const ensureDraft = async (): Promise<string | null> => {
    if (appId) return appId;
    if (!backendLive || !selectedSchemeId) return null;
    try {
      const app = await realApi.createApplication({ schemeId: selectedSchemeId, vaultDocumentIds: selectedVaultDocs });
      setAppId(app.id || (app as any)._id);
      return app.id || (app as any)._id;
    } catch (err: any) {
      addToast('error', err?.message || 'Could not create draft on server');
      return null;
    }
  };

  // Auto-save draft every 5 seconds while in steps 1-2
  useEffect(() => {
    if (step > 0 && step < 3) {
      const timer = setTimeout(async () => {
        setSaving(true);
        const id = await ensureDraft();
        if (id) {
          try { await realApi.saveDraft(id, { vaultDocumentIds: selectedVaultDocs, draftProgress: step * 33 }); } catch { /* offline ok */ }
        }
        setSaving(false);
        setLastSaved(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, selectedVaultDocs, backendLive, appId]);

  const handleSaveDraft = async () => {
    const id = await ensureDraft();
    addToast(id ? 'success' : 'info', id ? 'Draft saved on server! Resume anytime.' : 'Draft saved locally. Start the backend to sync it.');
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    Array.from(list).forEach(f => {
      if (!OK_TYPES.includes(f.type)) addToast('error', `"${f.name}": only JPG/PNG/WEBP/PDF allowed`);
      else if (f.size > MAX_SIZE_MB * 1024 * 1024) addToast('error', `"${f.name}": exceeds ${MAX_SIZE_MB} MB limit`);
      else accepted.push(f);
    });
    if (accepted.length > 0) setNewFiles(prev => [...prev, ...accepted]);
  };

  const handleSubmit = async () => {
    if (!selectedSchemeId) return;
    setSubmitting(true);
    try {
      let id = appId;
      // 1. ensure application exists
      if (!id) {
        id = await ensureDraft();
        if (!id) throw new Error('Could not establish draft with server');
        setAppId(id!);
      } else {
        await realApi.saveDraft(id, { vaultDocumentIds: selectedVaultDocs, draftProgress: 90 });
      }
      // 2. upload any new files directly onto the application
      if (newFiles.length > 0) {
        await realApi.uploadDocuments(id!, newFiles);
      }
      // 3. submit for scrutiny
      await realApi.submitApplicationById(id!);
      addToast('success', t('apply.submitSuccess'));
      navigate('/student/tracker');
    } catch (err: any) {
      addToast('error', err?.message || 'Submission failed. Please fix the issues and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    addToast('info', `${t('voice.voiceInput')}: "${text}"`);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5">
            <Send size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t('apply.title')}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              {t('apply.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={backendLive ? 'success' : 'warning'}>
            {backendLive ? t('apply.liveServer') : t('apply.demoMode')}
          </Badge>
          <AutoSaveIndicator lastSaved={lastSaved} saving={saving} />
          <VoiceInput onTranscript={handleVoiceInput} />
        </div>
      </div>

      <Stepper steps={[t('apply.stepScheme'), t('apply.stepPersonal'), t('apply.stepDocs'), t('apply.stepReview')]} currentStep={step} />

      <Card className="border-[#DEE2E6] dark:border-slate-700 shadow-xs">
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#1D293D] dark:text-white">{t('apply.selectScheme')}</h3>
            <div className="space-y-2.5">
              {schemes.map(rawScheme => {
                const s = getLocalizedScheme(rawScheme, i18n.language);
                const isSelected = selectedSchemeId === s.id;
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#0B75A4] bg-[#E6F1F5]/40 dark:bg-[#0B75A4]/15 shadow-xs'
                        : 'border-[#DEE2E6] dark:border-slate-700 hover:border-[#CBD5E1] bg-white dark:bg-slate-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scheme"
                      value={s.id}
                      checked={isSelected}
                      onChange={() => setSelectedSchemeId(s.id)}
                      className="text-[#0B75A4] focus:ring-[#0B75A4] w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1D293D] dark:text-white">{s.fullName}</p>
                      <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                        ₹{s.amount.toLocaleString('en-IN')} | {t('schemes.deadline')}: {s.deadline}
                      </p>
                    </div>
                    {s.renewable && <Badge variant="success">{t('schemes.renewable')}</Badge>}
                  </label>
                );
              })}
            </div>
            <div className="pt-2">
              <Button onClick={() => { void ensureDraft(); setStep(1); }} disabled={!selectedSchemeId}>
                {tc('actions.next')}
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1D293D] dark:text-white">{t('apply.personalInfo')}</h3>
              <VoiceInput onTranscript={handleVoiceInput} />
            </div>
            <div className="p-3.5 rounded-xl bg-[#E6F1F5]/50 dark:bg-slate-800/60 border border-[#0B75A4]/20 dark:border-slate-700">
              <p className="text-xs text-[#0B75A4] dark:text-[#1697C5] font-medium">{t('apply.prefilledNote')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: tc('common.name'), value: student.name, type: 'text' },
                { label: 'Aadhaar Number', value: student.aadharNumber, type: 'text' },
                { label: 'ST Certificate No.', value: student.stCertificateNumber, type: 'text' },
                { label: 'Tribe Name', value: student.tribeName, type: 'text' },
                { label: tc('common.state'), value: student.state, type: 'text' },
                { label: `${t('apply.income')} (₹)`, value: String(student.familyIncome), type: 'number' },
                { label: t('apply.course'), value: student.courseName, type: 'text' },
                { label: t('apply.institution'), value: student.institution, type: 'text' },
                { label: t('apply.bankAccount'), value: student.bankAccountNumber, type: 'text' },
                { label: t('apply.ifsc'), value: student.ifscCode, type: 'text' },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] outline-none pr-16"
                    />
                    <VoiceInput onTranscript={handleVoiceInput} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>{tc('actions.back')}</Button>
              <Button variant="secondary" onClick={() => void handleSaveDraft()}>{t('apply.saveDraft')}</Button>
              <Button onClick={() => setStep(2)}>{tc('actions.next')}</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#1D293D] dark:text-white">{t('documents.upload')}</h3>
            {selectedScheme && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748B] dark:text-slate-400">{t('schemes.documents')}: {selectedScheme.requiredDocuments.join(', ')}</p>
                <SampleDocumentViewer samples={selectedScheme.sampleDocuments} />
              </div>
            )}

            {/* Vault Documents */}
            {vaultDocs.filter(d => d.status === 'verified').length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">{t('apply.fromVault')}</p>
                <div className="space-y-2">
                  {vaultDocs.filter(d => d.status === 'verified').map(doc => {
                    const isChecked = selectedVaultDocs.includes(doc.id);
                    return (
                      <label
                        key={doc.id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'border-[#0B75A4] bg-[#E6F1F5]/40 dark:bg-[#0B75A4]/15'
                            : 'border-[#DEE2E6] dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => setSelectedVaultDocs(prev => prev.includes(doc.id) ? prev.filter(x => x !== doc.id) : [...prev, doc.id])}
                          className="rounded text-[#0B75A4] focus:ring-[#0B75A4] w-4 h-4"
                        />
                        <FileText size={16} className="text-[#0B75A4]" />
                        <span className="text-sm font-medium text-[#1D293D] dark:text-slate-200 flex-1">{doc.name}</span>
                        <Badge variant="success">{tc('status.verified')} · {doc.aiScore}%</Badge>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Uploads */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-slate-400">{t('apply.uploadNew')}</p>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                className="border-2 border-dashed border-[#CBD5E1] dark:border-slate-700 hover:border-[#0B75A4] hover:bg-[#F8FAFC] dark:hover:bg-slate-800/40 rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={e => { addFiles(e.target.files); if (e.target) e.target.value = ''; }} />
                <Upload size={24} className="mx-auto text-[#0B75A4] mb-1" />
                <p className="text-xs text-[#64748B] dark:text-slate-400">{t('apply.dragDropNote')}</p>
              </div>
              {newFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {newFiles.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-[#DEE2E6] dark:border-slate-700">
                      <FileText size={16} className="text-[#0B75A4]" />
                      <span className="text-sm text-[#1D293D] dark:text-slate-300 flex-1">{f.name}</span>
                      <span className="text-xs text-[#64748B]">{(f.size / 1024).toFixed(0)} KB</span>
                      <Badge variant="info">{t('apply.staged')}</Badge>
                      <button className="text-[#EF4444] text-xs font-semibold hover:underline" onClick={() => setNewFiles(prev => prev.filter((_, j) => j !== i))}>{t('apply.remove')}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>{tc('actions.back')}</Button>
              <Button onClick={() => setStep(3)} disabled={selectedVaultDocs.length === 0 && newFiles.length === 0}>{tc('actions.next')}</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#1D293D] dark:text-white">{t('apply.review')}</h3>
            <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700 space-y-2.5">
              <div className="flex justify-between text-sm"><span className="text-[#64748B]">{t('tracker.scheme')}:</span><span className="font-semibold text-[#1D293D] dark:text-white">{selectedScheme?.fullName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#64748B]">{t('apply.applicant')}:</span><span className="font-semibold text-[#1D293D] dark:text-white">{student.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#64748B]">{t('vault.title')}:</span><span className="font-semibold text-[#1D293D] dark:text-white">{selectedVaultDocs.length} {t('apply.documents')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#64748B]">{t('apply.uploadNew')}:</span><span className="font-semibold text-[#1D293D] dark:text-white">{newFiles.length} {t('apply.documents')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#64748B]">{tc('common.amount')}:</span><span className="font-bold text-[#009B68]">₹{(selectedScheme?.amount ?? 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#64748B]">{t('apply.guardianNotified')}:</span><span className="font-semibold text-[#1D293D] dark:text-white">{student.guardianName} ({student.guardianPhone})</span></div>
              {appId && <div className="flex justify-between text-sm"><span className="text-[#64748B]">{t('apply.draftId')}:</span><span className="font-mono text-xs text-[#64748B] dark:text-slate-300">{appId}</span></div>}
            </div>
            <div className="p-3.5 rounded-xl bg-[#009B68]/10 dark:bg-emerald-950/20 border border-[#009B68]/20 dark:border-emerald-800">
              <p className="text-xs text-[#009B68] dark:text-emerald-300 font-medium">{t('apply.guardianAlertNote')}</p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>{tc('actions.back')}</Button>
              <Button onClick={() => void handleSubmit()} loading={submitting}>
                {submitting ? (<span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />{t('apply.submitting')}</span>) : t('apply.submitApplication')}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentApply;
