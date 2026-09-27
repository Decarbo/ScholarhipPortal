import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, StatusBadge, Button, Skeleton, EmptyState } from '../../components/ui';
import { VoiceInput, CSCFinder } from '../../components/accessibility';
import { useAppStore } from '../../store';
import { students } from '../../mock/data';
import { grievances as mockGrievances } from '../../mock/data';
import type { Grievance } from '../../mock/data';

export const StudentGrievances: React.FC = () => {
  const [myGrievances, setMyGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [needsAssistance, setNeedsAssistance] = useState(false);
  const { addToast } = useAppStore();
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const student = students[0];

  useEffect(() => {
    setTimeout(() => { setMyGrievances(mockGrievances.filter(g => g.studentId === student.id)); setLoading(false); }, 400);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Grievance submitted successfully!');
    setShowForm(false);
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('grievances.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('grievances.raise')}</p>
        </div>
        <div className="flex gap-2">
          <CSCFinder studentState={student.state} />
          <Button size="sm" onClick={() => setShowForm(true)}>{t('grievances.raise')}</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">{t('grievances.raise')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('grievances.subject')}</label>
              <div className="relative">
                <input type="text" required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 pr-16" placeholder={t('grievances.subject')} />
                <VoiceInput onTranscript={() => {}} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Priority</label>
              <select className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">{t('grievances.message')}</label>
              <textarea rows={4} required className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder={t('grievances.message')} />
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={needsAssistance} onChange={(e) => setNeedsAssistance(e.target.checked)} className="rounded text-blue-600" />
                <span className="text-sm text-slate-700 dark:text-slate-300">I need someone to help me fill the form (CSC/Ashram School)</span>
              </label>
              {needsAssistance && (
                <select className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none">
                  <option value="">Type of assistance needed...</option>
                  <option value="CSC Center">CSC Center</option>
                  <option value="Ashram School Teacher">Ashram School Teacher</option>
                  <option value="Phone Support">Phone Support</option>
                  <option value="In-person Visit">In-person Visit</option>
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit">{tc('actions.submit')}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{tc('actions.cancel')}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {myGrievances.length === 0 ? (
          <EmptyState title={t('grievances.noGrievances')} description={t('grievances.raise')} />
        ) : (
          myGrievances.map(grv => (
            <Card key={grv.id} className="!p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{grv.subject}</p>
                    <StatusBadge status={grv.status} />
                    <Badge variant={grv.priority === 'high' ? 'danger' : grv.priority === 'medium' ? 'warning' : 'neutral'}>{grv.priority}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Ticket: {grv.id} | {grv.createdAt.split(' ')[0]}</p>
                  {grv.needsAssistance && <Badge variant="purple" className="mt-1">Needs Assistance: {grv.assistanceType}</Badge>}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{grv.description}</p>
              {grv.response && (
                <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{t('grievances.response')}:</p>
                  <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">{grv.response}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
