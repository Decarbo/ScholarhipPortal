import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, StatusBadge, Button, Stepper, EmptyState, Skeleton, Modal } from '../../components/ui';
import { useAppStore } from '../../store';
import { applications, students } from '../../mock/data';
import { confirmEnrolment } from '../../services/api';
import { FileText, Download, AlertTriangle, UserCheck } from 'lucide-react';
import type { Application } from '../../mock/data';
import { getLocalizedSchemeName } from '../../utils/localizedData';

export const StudentTracker: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const { addToast } = useAppStore();
  const { t, i18n } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const student = students[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMyApps(applications.filter(a => a.studentId === student.id));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [student.id]);

  const statusSteps = [
    t('tracker.steps.submitted'),
    t('tracker.steps.underScrutiny'),
    t('tracker.steps.screening'),
    t('tracker.steps.result')
  ];

  const statusIndex = (s: string) => {
    const map: Record<string, number> = { draft: 0, submitted: 0, under_scrutiny: 1, screening: 2, selected: 3, waitlisted: 3, rejected: 3 };
    return map[s] ?? 0;
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in font-sans text-[#1D293D] dark:text-slate-100 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t('tracker.title')}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              Track real-time progress and verification stages of all your submitted scholarship applications.
            </p>
          </div>
        </div>
      </div>

      {myApps.length === 0 ? (
        <EmptyState icon={<FileText size={40} className="text-[#94A3B8]" />} title={t('tracker.noApplications')} description={t('dashboard.viewSchemes')} />
      ) : (
        <div className="space-y-4">
          {myApps.map(app => {
            const localizedSchemeName = getLocalizedSchemeName(app.schemeName, i18n.language);
            return (
              <Card key={app.id} className="border-[#DEE2E6] dark:border-slate-700 hover:border-[#0B75A4] hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{localizedSchemeName}</Badge>
                      <StatusBadge status={app.status} />
                      {app.status === 'draft' && <span className="text-xs text-[#0B75A4] font-medium">({app.draftProgress}% complete)</span>}
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                      {t('tracker.applicationId')}: <span className="font-mono">{app.id}</span> | {app.submittedDate ? `${t('tracker.submittedOn')}: ${app.submittedDate}` : tc('status.draft')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>{t('tracker.viewDetails')}</Button>
                </div>
                {app.status !== 'draft' && <Stepper steps={statusSteps} currentStep={statusIndex(app.status)} />}
                {app.deficiencyNotices.some(d => !d.resolved) && (
                  <div className="mt-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="text-[#F59E0B]" />
                      <span className="text-xs font-bold text-[#F59E0B]">{t('tracker.deficiencyPending')}</span>
                    </div>
                    <p className="text-xs text-[#1D293D] dark:text-slate-300 mt-1">{app.deficiencyNotices.find(d => !d.resolved)?.plainLanguageMessage}</p>
                  </div>
                )}
                {app.status === 'rejected' && app.plainReason && (
                  <div className="mt-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60">
                    <p className="text-xs font-bold text-[#EF4444]">Reason for rejection:</p>
                    <p className="text-sm text-[#1D293D] dark:text-slate-300 mt-1">{app.plainReason}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* App Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={`${t('tracker.title')} · ${selectedApp?.id}`} size="xl">
        {selectedApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700">
                <p className="text-xs text-[#64748B] dark:text-slate-400">{t('tracker.scheme')}</p>
                <p className="font-semibold text-sm text-[#1D293D] dark:text-white mt-0.5">{getLocalizedSchemeName(selectedApp.schemeName, i18n.language)}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700">
                <p className="text-xs text-[#64748B] dark:text-slate-400">{t('tracker.currentStatus')}</p>
                <div className="mt-1"><StatusBadge status={selectedApp.status} /></div>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700">
                <p className="text-xs text-[#64748B] dark:text-slate-400">{tc('common.amount')}</p>
                <p className="font-bold text-sm text-[#009B68] mt-0.5">₹{selectedApp.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700">
                <p className="text-xs text-[#64748B] dark:text-slate-400">{tc('common.date')}</p>
                <p className="font-semibold text-sm text-[#1D293D] dark:text-white font-mono mt-0.5">{selectedApp.lastUpdated}</p>
              </div>
            </div>

            {/* Plain language reason for rejection */}
            {selectedApp.status === 'rejected' && selectedApp.plainReason && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <p className="text-sm font-bold text-[#EF4444] mb-1">Reason for rejection:</p>
                <p className="text-sm text-[#1D293D] dark:text-slate-300">{selectedApp.plainReason}</p>
              </div>
            )}

            {/* Documents */}
            <div>
              <h4 className="text-sm font-bold text-[#1D293D] dark:text-white mb-2">{t('documents.title')}</h4>
              <div className="space-y-2">
                {selectedApp.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#0B75A4]" />
                      <span className="text-sm font-medium text-[#1D293D] dark:text-slate-300">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.aiScore > 0 && <span className="text-xs text-[#64748B] font-mono">AI: {doc.aiScore}%</span>}
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrolment section for selected */}
            {selectedApp.status === 'selected' && !selectedApp.enrolmentConfirmed && (
              <div className="p-4 rounded-xl bg-[#009B68]/10 dark:bg-emerald-950/20 border border-[#009B68]/20 dark:border-emerald-800">
                <p className="text-sm font-bold text-[#009B68] dark:text-emerald-300 mb-2">🎉 {t('tracker.confirmEnrolment')}</p>
                <p className="text-xs text-[#1D293D] dark:text-slate-300 mb-3">Please confirm that you accept this scholarship and verify your bank details.</p>
                <div className="flex gap-2">
                  <Button size="sm" icon={<UserCheck size={14} />} onClick={() => { confirmEnrolment(selectedApp.id); addToast('success', 'Enrolment confirmed!'); setSelectedApp(null); }}>{t('tracker.confirmEnrolment')}</Button>
                  <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={() => addToast('info', 'Offer letter downloaded')}>{t('tracker.downloadAck')}</Button>
                </div>
              </div>
            )}

            {selectedApp.status === 'selected' && selectedApp.enrolmentConfirmed && (
              <Button icon={<Download size={14} />} className="w-full" onClick={() => addToast('info', 'Offer letter downloaded')}>{t('tracker.downloadAck')} (PDF)</Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentTracker;
