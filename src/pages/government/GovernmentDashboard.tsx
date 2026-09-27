import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, StatCard, Skeleton, Button } from '../../components/ui';
import { analyticsData } from '../../mock/data';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, CheckCircle, IndianRupee, Clock, Download, FileText } from 'lucide-react';
import { useAppStore } from '../../store';

const COLORS = ['#1e40af', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];

export const GovernmentDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<typeof analyticsData | null>(null);
  const { addToast } = useAppStore();
  const { t } = useTranslation('government');
  const { t: tc } = useTranslation('common');

  useEffect(() => {
    setTimeout(() => { setData(analyticsData); setLoading(false); }, 500);
  }, []);

  if (loading) return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-72" />)}</div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('dashboard.executiveTitle')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.ministrySubtitle')}</p>
        </div>
        <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => addToast('success', 'Report exported successfully')}>
          {t('dashboard.exportReport')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard title={t('dashboard.totalApplications')} value={data.totalApplications} icon={<FileText size={20} />} color="blue" trend="12% from last month" trendUp />
        <StatCard title={t('dashboard.verified')} value={data.verified} icon={<CheckCircle size={20} />} color="green" trend="8% improvement" trendUp />
        <StatCard title={t('dashboard.selected')} value={data.selected} icon={<Users size={20} />} color="purple" />
        <StatCard title={t('dashboard.disbursed')} value={data.disbursed} icon={<IndianRupee size={20} />} color="green" />
        <StatCard title={t('dashboard.pending')} value={data.pending} icon={<Clock size={20} />} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('dashboard.monthlyTrend')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="applications" stroke="#1e40af" strokeWidth={2} dot={{ fill: '#1e40af' }} name={t('dashboard.applications')} />
              <Line type="monotone" dataKey="processed" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a' }} name={t('dashboard.processed')} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('dashboard.categoryDistribution')}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.categoryWiseData} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="category" label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {data.categoryWiseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* State-wise Breakdown */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">{t('dashboard.stateBreakdown')}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.stateWiseData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis type="category" dataKey="state" tick={{ fontSize: 11 }} stroke="#94a3b8" width={120} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="applications" fill="#1e40af" name={t('dashboard.applications')} radius={[0, 4, 4, 0]} />
            <Bar dataKey="selected" fill="#16a34a" name={t('dashboard.selected')} radius={[0, 4, 4, 0]} />
            <Bar dataKey="disbursed" fill="#f59e0b" name={t('dashboard.disbursed')} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
