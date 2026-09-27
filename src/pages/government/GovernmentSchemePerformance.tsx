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
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('performance.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('performance.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.schemePerformance.map((sp, i) => {
          const schemeName = getLocalizedSchemeName(sp.scheme, i18n.language);
          return (
            <Card key={i}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{schemeName}</h3>
                <Badge variant={sp.utilization > 70 ? 'success' : sp.utilization > 50 ? 'warning' : 'danger'}>
                  {sp.utilization}% {t('performance.utilized')}
                </Badge>
              </div>
              <div className="space-y-3">
                <ProgressBar value={sp.utilization} label={t('performance.utilizationRate')} color="bg-blue-600" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500">{t('performance.avgProcessingTime')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{sp.avgProcessingDays} {t('performance.days')}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <p className="text-xs text-slate-500">{t('performance.dropOffRate')}</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{sp.dropOffRate}%</p>
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
