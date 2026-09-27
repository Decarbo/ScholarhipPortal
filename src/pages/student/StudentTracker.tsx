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
    setTimeout(() => { setMyApps(applications.filter(a => a.studentId === student.id)); setLoading(false); }, 400);
  }, []);

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

  if (loading) return <div className="p-6"><Skeleton className="h-64" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('tracker.title')}</h1>

      {myApps.length === 0 ? (
        <EmptyState icon={<FileText size={40} />} title={t('tracker.noApplications')} description={t('dashboard.viewSchemes')} />
      ) : (
        <div className="space-y-4">
          {myApps.map(app => {
            const localizedSchemeName = getLocalizedSchemeName(app.schemeName, i18n.language);
            return (
              <Card key={app.id} className="cursor-pointer hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{localizedSchemeName}</Badge>
                      <StatusBadge status={app.status} />
                      {app.status === 'draft' && <span className="text-xs text-blue-500">({app.draftProgress}% complete)</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('tracker.applicationId')}: {app.id} | {app.submittedDate ? `${t('tracker.submittedOn')}: ${app.submittedDate}` : tc('status.draft')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedApp(app)}>{t('tracker.viewDetails')}</Button>
                </div>
                {app.status !== 'draft' && <Stepper steps={statusSteps} currentStep={statusIndex(app.status)} />}
                {app.deficiencyNotices.some(d => !d.resolved) && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className="text-amber-600" />
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{t('tracker.deficiencyPending')}</span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{app.deficiencyNotices.find(d => !d.resolved)?.plainLanguageMessage}</p>
                  </div>
                )}
                {app.status === 'rejected' && app.plainReason && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">Reason for rejection:</p>
                    <p className="text-sm text-red-800 dark:text-red-200 mt-1">{app.plainReason}</p>
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
              <div>
                <p className="text-xs text-slate-500">{t('tracker.scheme')}</p>
                <p className="font-medium text-slate-900 dark:text-white">{getLocalizedSchemeName(selectedApp.schemeName, i18n.language)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('tracker.currentStatus')}</p>
                <StatusBadge status={selectedApp.status} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{tc('common.amount')}</p>
                <p className="font-medium text-slate-900 dark:text-white">₹{selectedApp.amount.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{tc('common.date')}</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedApp.lastUpdated}</p>
              </div>
            </div>

            {/* Plain language reason for rejection */}
            {selectedApp.status === 'rejected' && selectedApp.plainReason && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Reason for rejection:</p>
                <p className="text-sm text-red-800 dark:text-red-200">{selectedApp.plainReason}</p>
              </div>
            )}

            {/* Documents */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{t('documents.title')}</h4>
              <div className="space-y-2">
                {selectedApp.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.aiScore > 0 && <span className="text-xs text-slate-500">AI: {doc.aiScore}%</span>}
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enrolment section for selected */}
            {selectedApp.status === 'selected' && !selectedApp.enrolmentConfirmed && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">🎉 {t('tracker.confirmEnrolment')}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-3">Please confirm that you accept this scholarship and verify your bank details.</p>
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
