import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Skeleton } from '../../components/ui';
import { analyticsData } from '../../mock/data';
import { getLocalizedSchemeName } from '../../utils/localizedData';

export const GovernmentBudget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<typeof analyticsData | null>(null);
  const { t, i18n } = useTranslation('government');
  const { t: tc } = useTranslation('common');

  useEffect(() => {
    setTimeout(() => { setData(analyticsData); setLoading(false); }, 400);
  }, []);

  if (loading) return <div className="p-6"><Skeleton className="h-64" /></div>;
  if (!data) return null;

  const totalAllocated = data.budgetData.reduce((sum, b) => sum + b.allocated, 0);
  const totalDisbursed = data.budgetData.reduce((sum, b) => sum + b.disbursed, 0);
  const totalRemaining = data.budgetData.reduce((sum, b) => sum + b.remaining, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('budget.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t('budget.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!p-4">
          <p className="text-xs text-slate-500">{t('budget.totalAllocated')}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{(totalAllocated / 10000000).toFixed(1)} Cr</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">{t('budget.totalDisbursed')}</p>
          <p className="text-2xl font-bold text-emerald-600">₹{(totalDisbursed / 10000000).toFixed(1)} Cr</p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs text-slate-500">{t('budget.totalRemaining')}</p>
          <p className="text-2xl font-bold text-amber-600">₹{(totalRemaining / 10000000).toFixed(1)} Cr</p>
        </Card>
      </div>

      {/* Per Scheme */}
      <div className="space-y-4">
        {data.budgetData.map((b, i) => {
          const disbursedPct = (b.disbursed / b.allocated) * 100;
          const schemeName = getLocalizedSchemeName(b.scheme, i18n.language);
          return (
            <Card key={i}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">{schemeName}</h3>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{disbursedPct.toFixed(1)}% {t('budget.disbursed')}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{t('budget.allocated')}: ₹{(b.allocated / 10000000).toFixed(2)} Cr</span>
                  <span className="text-emerald-600">{t('budget.disbursed')}: ₹{(b.disbursed / 10000000).toFixed(2)} Cr</span>
                  <span className="text-amber-600">{t('budget.remaining')}: ₹{(b.remaining / 10000000).toFixed(2)} Cr</span>
                </div>
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 transition-all" style={{ width: `${disbursedPct}%` }} />
                  <div className="h-full bg-amber-400 transition-all" style={{ width: `${100 - disbursedPct}%` }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
