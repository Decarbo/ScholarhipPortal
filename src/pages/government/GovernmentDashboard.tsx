import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, StatCard, Skeleton, Button } from '../../components/ui';
import { analyticsData } from '../../mock/data';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, CheckCircle, IndianRupee, Clock, Download, FileText } from 'lucide-react';
import { useAppStore } from '../../store';

const COLORS = ['#0B75A4', '#009B68', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#6366F1'];

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
    <div className="p-4 md:p-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-24" />)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2].map(i => <Skeleton key={i} className="h-72" />)}</div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DEE2E6] dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1D293D] dark:text-white tracking-tight">{t('dashboard.executiveTitle')}</h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">{t('dashboard.ministrySubtitle')}</p>
        </div>
        <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => addToast('success', 'Report exported successfully')}>
          {t('dashboard.exportReport')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <StatCard title={t('dashboard.totalApplications')} value={data.totalApplications} icon={<FileText size={20} />} color="blue" trend="12% from last month" trendUp />
        <StatCard title={t('dashboard.verified')} value={data.verified} icon={<CheckCircle size={20} />} color="green" trend="8% improvement" trendUp />
        <StatCard title={t('dashboard.selected')} value={data.selected} icon={<Users size={20} />} color="purple" />
        <StatCard title={t('dashboard.disbursed')} value={data.disbursed} icon={<IndianRupee size={20} />} color="green" />
        <StatCard title={t('dashboard.pending')} value={data.pending} icon={<Clock size={20} />} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card className="border-[#DEE2E6] dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1D293D] dark:text-white">{t('dashboard.monthlyTrend')}</h3>
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">FY 2025-26</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.monthlyTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" strokeOpacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DEE2E6" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DEE2E6" />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DEE2E6', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="applications" stroke="#0B75A4" strokeWidth={2.5} dot={{ fill: '#0B75A4', r: 3 }} activeDot={{ r: 5 }} name={t('dashboard.applications')} />
              <Line type="monotone" dataKey="processed" stroke="#009B68" strokeWidth={2.5} dot={{ fill: '#009B68', r: 3 }} activeDot={{ r: 5 }} name={t('dashboard.processed')} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="border-[#DEE2E6] dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1D293D] dark:text-white">{t('dashboard.categoryDistribution')}</h3>
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Beneficiary Breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.categoryWiseData} cx="50%" cy="50%" outerRadius={90} dataKey="count" nameKey="category" label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {data.categoryWiseData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DEE2E6', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* State-wise Breakdown */}
      <Card className="border-[#DEE2E6] dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#1D293D] dark:text-white">{t('dashboard.stateBreakdown')}</h3>
          <span className="text-xs text-[#64748B] dark:text-slate-400 font-medium">Pan-India Tracking</span>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data.stateWiseData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DEE2E6" strokeOpacity={0.6} />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DEE2E6" />
            <YAxis type="category" dataKey="state" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#DEE2E6" width={120} />
            <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DEE2E6', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="applications" fill="#0B75A4" name={t('dashboard.applications')} radius={[0, 4, 4, 0]} />
            <Bar dataKey="selected" fill="#009B68" name={t('dashboard.selected')} radius={[0, 4, 4, 0]} />
            <Bar dataKey="disbursed" fill="#F59E0B" name={t('dashboard.disbursed')} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
