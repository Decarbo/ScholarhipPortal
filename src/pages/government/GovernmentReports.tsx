import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button } from '../../components/ui';
import { Download, FileText } from 'lucide-react';
import { useAppStore } from '../../store';

export const GovernmentReports: React.FC = () => {
  const { addToast } = useAppStore();
  const { t } = useTranslation('government');
  const { t: tc } = useTranslation('common');

  const reports = [
    { name: 'Annual Scholarship Report 2025-26', type: 'PDF', date: '2026-01-15', size: '2.4 MB' },
    { name: 'State-wise Disbursal Summary', type: 'CSV', date: '2026-01-20', size: '856 KB' },
    { name: 'Scheme Utilization Analysis', type: 'PDF', date: '2026-01-10', size: '1.8 MB' },
    { name: 'AI Verification Audit Report', type: 'PDF', date: '2026-01-22', size: '3.1 MB' },
    { name: 'Beneficiary Database (All Schemes)', type: 'CSV', date: '2026-01-25', size: '5.2 MB' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DEE2E6] dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-[#1D293D] dark:text-white tracking-tight">{t('reports.title')}</h1>
          <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">{t('reports.subtitle')}</p>
        </div>
        <Button icon={<Download size={14} />} onClick={() => addToast('success', 'Custom report generation started')}>
          {t('reports.generateCustom')}
        </Button>
      </div>

      <div className="space-y-3">
        {reports.map((report, i) => (
          <Card key={i} className="!p-4 flex items-center justify-between border-[#DEE2E6] dark:border-slate-800 shadow-xs hover:border-[#0B75A4]/40 hover:bg-[#F8FAFC]/50 dark:hover:bg-slate-800/50 transition-all">
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl border ${report.type === 'PDF' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : 'bg-[#009B68]/10 text-[#009B68] border-[#009B68]/20'}`}>
                <FileText size={20} className={report.type === 'PDF' ? 'text-[#EF4444]' : 'text-[#009B68]'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1D293D] dark:text-white">{report.name}</p>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 font-medium">{report.type} • {report.size} • {report.date}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={() => addToast('success', `${report.name} downloaded`)}>
              {t('reports.download')}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
