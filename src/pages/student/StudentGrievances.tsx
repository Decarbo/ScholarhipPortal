import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, StatusBadge, Button, Skeleton, EmptyState } from '../../components/ui';
import { VoiceInput, CSCFinder } from '../../components/accessibility';
import { useAppStore } from '../../store';
import { students } from '../../mock/data';
import { grievances as mockGrievances } from '../../mock/data';
import { AlertCircle } from 'lucide-react';
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
    const timer = setTimeout(() => {
      setMyGrievances(mockGrievances.filter(g => g.studentId === student.id));
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [student.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Grievance submitted successfully!');
    setShowForm(false);
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in font-sans text-[#1D293D] dark:text-slate-100 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5">
            <AlertCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t('grievances.title')}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              Submit issues, check status of complaints, or locate your nearest Common Service Centre (CSC).
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <CSCFinder studentState={student.state} />
          <Button size="sm" onClick={() => setShowForm(true)}>{t('grievances.raise')}</Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-[#DEE2E6] dark:border-slate-700 shadow-xs">
          <h3 className="text-lg font-bold text-[#1D293D] dark:text-white mb-4">{t('grievances.raise')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('grievances.subject')}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] pr-16"
                  placeholder={t('grievances.subject')}
                />
                <VoiceInput onTranscript={() => {}} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">Priority</label>
              <select className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4]">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('grievances.message')}</label>
              <textarea
                rows={4}
                required
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] resize-none"
                placeholder={t('grievances.message')}
              />
            </div>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={needsAssistance}
                  onChange={(e) => setNeedsAssistance(e.target.checked)}
                  className="rounded text-[#0B75A4] focus:ring-[#0B75A4] w-4 h-4"
                />
                <span className="text-sm font-medium text-[#1D293D] dark:text-slate-300">
                  I need someone to help me fill the form (CSC / Ashram School)
                </span>
              </label>
              {needsAssistance && (
                <select className="mt-2.5 w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4]">
                  <option value="">Type of assistance needed...</option>
                  <option value="CSC Center">CSC Center</option>
                  <option value="Ashram School Teacher">Ashram School Teacher</option>
                  <option value="Phone Support">Phone Support</option>
                  <option value="In-person Visit">In-person Visit</option>
                </select>
              )}
            </div>
            <div className="flex gap-2.5 pt-2">
              <Button type="submit">{tc('actions.submit')}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>{tc('actions.cancel')}</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {myGrievances.length === 0 ? (
          <EmptyState icon={<AlertCircle size={40} className="text-[#94A3B8]" />} title={t('grievances.noGrievances')} description={t('grievances.raise')} />
        ) : (
          myGrievances.map(grv => (
            <Card key={grv.id} className="p-5 border-[#DEE2E6] dark:border-slate-700 hover:border-[#0B75A4] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-[#1D293D] dark:text-white">{grv.subject}</p>
                    <StatusBadge status={grv.status} />
                    <Badge variant={grv.priority === 'high' ? 'danger' : grv.priority === 'medium' ? 'warning' : 'neutral'}>
                      {grv.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                    Ticket: <span className="font-mono">{grv.id}</span> | {grv.createdAt.split(' ')[0]}
                  </p>
                  {grv.needsAssistance && (
                    <Badge variant="purple" className="mt-2">
                      Needs Assistance: {grv.assistanceType}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-[#64748B] dark:text-slate-300 mt-2 leading-relaxed">{grv.description}</p>
              {grv.response && (
                <div className="mt-3.5 p-3.5 rounded-xl bg-[#009B68]/10 dark:bg-emerald-950/20 border border-[#009B68]/20 dark:border-emerald-800">
                  <p className="text-xs font-bold text-[#009B68] dark:text-emerald-300">{t('grievances.response')}:</p>
                  <p className="text-sm text-[#1D293D] dark:text-emerald-200 mt-1">{grv.response}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentGrievances;
