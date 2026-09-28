import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Skeleton, ProgressBar } from '../../components/ui';
import { analyticsData } from '../../mock/data';
import { getLocalizedSchemeName } from '../../utils/localizedData';

export const GovernmentSchemePerformance: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<typeof analyticsData | null>(null);
  const { t, i18n } = useTranslation('government');
  const { t: tc } = useTranslation('common');

  useEffect(() => {
    setTimeout(() => { setData(analyticsData); setLoading(false); }, 400);
  }, []);

  if (loading) return <div className="p-6"><Skeleton className="h-64" /></div>;
  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in font-sans">
      <div className="pb-2 border-b border-[#DEE2E6] dark:border-slate-800">
        <h1 className="text-2xl font-bold text-[#1D293D] dark:text-white tracking-tight">{t('performance.title')}</h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">{t('performance.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.schemePerformance.map((sp, i) => {
          const schemeName = getLocalizedSchemeName(sp.scheme, i18n.language);
          return (
            <Card key={i} className="border-[#DEE2E6] dark:border-slate-800 shadow-xs hover:border-[#0B75A4]/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#1D293D] dark:text-white leading-snug">{schemeName}</h3>
                <Badge variant={sp.utilization > 70 ? 'success' : sp.utilization > 50 ? 'warning' : 'danger'}>
                  {sp.utilization}% {t('performance.utilized')}
                </Badge>
              </div>
              <div className="space-y-4">
                <ProgressBar value={sp.utilization} label={t('performance.utilizationRate')} color={sp.utilization > 70 ? "bg-[#009B68]" : sp.utilization > 50 ? "bg-[#0B75A4]" : "bg-[#F59E0B]"} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700/60">
                    <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">{t('performance.avgProcessingTime')}</p>
                    <p className="text-xl font-bold text-[#1D293D] dark:text-white mt-1">{sp.avgProcessingDays} <span className="text-xs font-normal text-[#64748B] dark:text-slate-400">{t('performance.days')}</span></p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700/60">
                    <p className="text-xs font-medium text-[#64748B] dark:text-slate-400">{t('performance.dropOffRate')}</p>
                    <p className="text-xl font-bold text-[#1D293D] dark:text-white mt-1">{sp.dropOffRate}%</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
