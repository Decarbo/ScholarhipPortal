import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, StatusBadge, Button, EmptyState, Skeleton, ProgressBar } from '../../components/ui';
import { applications, schemes, students, notifications, grievances as mockGrievances } from '../../mock/data';
import { FileText, Bell, AlertTriangle, BookOpen, Send, RefreshCw, ChevronRight, FolderOpen, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Application, Notification } from '../../mock/data';


export const StudentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [myApps, setMyApps] = useState<Application[]>([]);
  const [myNotifs, setMyNotifs] = useState<Notification[]>([]);
  const navigate = useNavigate();
  const { t } = useTranslation('student');
  const { t: tc } = useTranslation('common');
  const student = students[0];

  useEffect(() => {
    setTimeout(() => {
      setMyApps(applications.filter(a => a.studentId === student.id));
      setMyNotifs(notifications.filter(n => n.userId === student.id));
      setLoading(false);
    }, 500);
  }, []);

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}</div></div>;

  const unreadNotifs = myNotifs.filter(n => !n.read).length;
  const drafts = myApps.filter(a => a.status === 'draft');
  const renewalReminders = myNotifs.filter(n => n.type === 'renewal_reminder' && !n.read);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.welcome', { name: student.name.split(' ')[0] })}!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.overview')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/student/schemes')} icon={<BookOpen size={14} />}>{t('schemes.title')}</Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/vault')} icon={<FolderOpen size={14} />}>{t('documents.title')}</Button>
          <Button size="sm" onClick={() => navigate('/student/apply')} icon={<Send size={14} />}>{t('dashboard.applyNew')}</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="!p-4"><p className="text-xs text-slate-500 dark:text-slate-400">{t('dashboard.pendingApplications')}</p><p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{myApps.length}</p></Card>
        <Card className="!p-4"><p className="text-xs text-slate-500 dark:text-slate-400">{tc('status.selected')}</p><p className="text-xl font-bold text-emerald-600 mt-1">{myApps.filter(a => a.status === 'selected').length}</p></Card>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/student/tracker')}><p className="text-xs text-slate-500 dark:text-slate-400">{tc('status.draft')}</p><p className="text-xl font-bold text-blue-600 mt-1">{drafts.length}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow relative" onClick={() => navigate('/student/notifications')}>
          <div className="flex items-center gap-2"><Bell size={16} className="text-slate-400" /><p className="text-xs text-slate-500 dark:text-slate-400">{t('notifications.title')}</p></div>
          <p className="text-xl font-bold text-blue-600 mt-1">{unreadNotifs} <span className="text-xs font-normal text-slate-400">{t('notifications.unread')}</span></p>
        </div>
      </div>

      {/* Renewal Reminders */}
      {renewalReminders.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-start gap-3">
          <Calendar size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">⏰ {t('renewal.deadline')}!</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{renewalReminders[0].message}</p>
          </div>
          <Button size="sm" onClick={() => navigate('/student/renewal')}>{t('renewal.renewNow')}</Button>
        </div>
      )}

      {/* Deficiency Banner */}
      {myApps.some(a => a.deficiencyNotices.some(d => !d.resolved)) && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('documents.pending')}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t('documents.upload')}</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/student/tracker')}>{t('tracker.viewDetails')}</Button>
        </div>
      )}

      {/* Draft Applications */}
      {drafts.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">📝 {tc('status.draft')}</h2>
          <div className="space-y-2">
            {drafts.map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{app.schemeName}</p>
                  <p className="text-xs text-slate-500">{app.draftProgress}% {app.draftLastSaved && `| ${app.draftLastSaved}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar value={app.draftProgress} />
                  <Button size="sm" variant="outline" onClick={() => navigate('/student/apply', { state: { appId: app.id } })}>{tc('actions.next')}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Applications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t('tracker.title')}</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/student/tracker')}>{tc('actions.view')} <ChevronRight size={14} /></Button>
        </div>
        {myApps.filter(a => a.status !== 'draft').length === 0 ? (
          <EmptyState icon={<FileText size={40} />} title={t('tracker.noApplications')} description={t('dashboard.viewSchemes')} action={<Button size="sm" onClick={() => navigate('/student/schemes')}>{t('schemes.title')}</Button>} />
        ) : (
          <div className="space-y-3">
            {myApps.filter(a => a.status !== 'draft').slice(0, 3).map(app => (
              <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate('/student/tracker')}>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{app.schemeName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('tracker.submittedOn')}: {app.submittedDate || tc('status.draft')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} />
                  <ChevronRight size={16} className="text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t('dashboard.quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button onClick={() => navigate('/student/vault')} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition-colors">
            <FolderOpen size={24} className="mx-auto text-blue-500 mb-1" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('documents.title')}</p>
          </button>
          <button onClick={() => navigate('/student/notifications')} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition-colors">
            <Bell size={24} className="mx-auto text-amber-500 mb-1" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('notifications.title')}</p>
          </button>
          <button onClick={() => navigate('/student/grievances')} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition-colors">
            <Send size={24} className="mx-auto text-purple-500 mb-1" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('grievances.raise')}</p>
          </button>
          <button onClick={() => navigate('/student/renewal')} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-center transition-colors">
            <RefreshCw size={24} className="mx-auto text-emerald-500 mb-1" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{t('renewal.title')}</p>
          </button>
        </div>
      </Card>
    </div>
  );
};
