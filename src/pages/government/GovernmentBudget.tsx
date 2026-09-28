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
    <div className="p-4 md:p-6 space-y-6 animate-fade-in font-sans">
      <div className="pb-2 border-b border-[#DEE2E6] dark:border-slate-800">
        <h1 className="text-2xl font-bold text-[#1D293D] dark:text-white tracking-tight">{t('budget.title')}</h1>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">{t('budget.subtitle')}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="!p-4 border-[#DEE2E6] dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">{t('budget.totalAllocated')}</p>
          <p className="text-2xl font-bold text-[#1D293D] dark:text-white mt-1">₹{(totalAllocated / 10000000).toFixed(1)} Cr</p>
        </Card>
        <Card className="!p-4 border-[#DEE2E6] dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">{t('budget.totalDisbursed')}</p>
          <p className="text-2xl font-bold text-[#009B68] dark:text-emerald-400 mt-1">₹{(totalDisbursed / 10000000).toFixed(1)} Cr</p>
        </Card>
        <Card className="!p-4 border-[#DEE2E6] dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">{t('budget.totalRemaining')}</p>
          <p className="text-2xl font-bold text-[#F59E0B] dark:text-amber-400 mt-1">₹{(totalRemaining / 10000000).toFixed(1)} Cr</p>
        </Card>
      </div>

      {/* Per Scheme */}
      <div className="space-y-4">
        {data.budgetData.map((b, i) => {
          const disbursedPct = (b.disbursed / b.allocated) * 100;
          const schemeName = getLocalizedSchemeName(b.scheme, i18n.language);
          return (
            <Card key={i} className="border-[#DEE2E6] dark:border-slate-800 shadow-xs hover:border-[#0B75A4]/40 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base text-[#1D293D] dark:text-white">{schemeName}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#009B68]/10 text-[#009B68] border border-[#009B68]/20">{disbursedPct.toFixed(1)}% {t('budget.disbursed')}</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex flex-wrap justify-between text-xs gap-2">
                  <span className="text-[#64748B] dark:text-slate-400 font-medium">{t('budget.allocated')}: <strong className="text-[#1D293D] dark:text-slate-200">₹{(b.allocated / 10000000).toFixed(2)} Cr</strong></span>
                  <span className="text-[#009B68] font-medium">{t('budget.disbursed')}: <strong>₹{(b.disbursed / 10000000).toFixed(2)} Cr</strong></span>
                  <span className="text-[#F59E0B] font-medium">{t('budget.remaining')}: <strong>₹{(b.remaining / 10000000).toFixed(2)} Cr</strong></span>
                </div>
                <div className="w-full h-3 bg-[#E2E8F0] dark:bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-[#009B68] transition-all" style={{ width: `${disbursedPct}%` }} title={`Disbursed: ${disbursedPct.toFixed(1)}%`} />
                  <div className="h-full bg-[#F59E0B] transition-all" style={{ width: `${100 - disbursedPct}%` }} title={`Remaining: ${(100 - disbursedPct).toFixed(1)}%`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
