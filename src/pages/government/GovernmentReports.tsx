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
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('reports.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('reports.subtitle')}</p>
        </div>
        <Button icon={<Download size={14} />} onClick={() => addToast('success', 'Custom report generation started')}>
          {t('reports.generateCustom')}
        </Button>
      </div>

      <div className="space-y-3">
        {reports.map((report, i) => (
          <Card key={i} className="!p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${report.type === 'PDF' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                <FileText size={18} className={report.type === 'PDF' ? 'text-red-600' : 'text-green-600'} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{report.name}</p>
                <p className="text-xs text-slate-500">{report.type} • {report.size} • {report.date}</p>
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
