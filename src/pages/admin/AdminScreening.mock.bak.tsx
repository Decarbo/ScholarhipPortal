import React, { useEffect, useState } from 'react';
import { Card, Badge, StatusBadge, Button, EmptyState, TableSkeleton } from '../../components/ui';
import { useAppStore } from '../../store';
import { applications, schemes } from '../../mock/data';
import { CheckCircle, XCircle, Users } from 'lucide-react';
import type { Application } from '../../mock/data';


export const AdminScreening: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);
  const [filterScheme, setFilterScheme] = useState('');
  const [filterState, setFilterState] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'amount'>('date');
  const { addToast } = useAppStore();

  useEffect(() => {
    setTimeout(() => { setApps(applications.filter(a => a.status === 'screening' || a.status === 'under_scrutiny')); setLoading(false); }, 400);
  }, []);

  const filtered = apps.filter(a => {
    if (filterScheme && a.schemeId !== filterScheme) return false;
    if (filterState && a.state !== filterState) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.studentName.localeCompare(b.studentName);
    if (sortBy === 'amount') return b.amount - a.amount;
    return b.submittedDate.localeCompare(a.submittedDate);
  });

  if (loading) return <div className="p-6"><TableSkeleton /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Screening & Selection</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Merit-based sorting and manual selection</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={filterScheme} onChange={(e) => setFilterScheme(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none">
          <option value="">All Schemes</option>
          {schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none">
          <option value="">All States</option>
          {[...new Set(apps.map(a => a.state))].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none">
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">#</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Student</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Scheme</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">State</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Amount</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.map((app, i) => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 text-slate-500">{i + 1}</td>
                  <td className="p-3 font-medium text-slate-900 dark:text-white">{app.studentName}</td>
                  <td className="p-3"><Badge variant="info">{app.schemeName}</Badge></td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{app.state}</td>
                  <td className="p-3 text-slate-900 dark:text-white">₹{app.amount.toLocaleString('en-IN')}</td>
                  <td className="p-3"><StatusBadge status={app.status} /></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => addToast('success', `${app.studentName} selected`)}><CheckCircle size={14} className="text-emerald-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => addToast('error', `${app.studentName} rejected`)}><XCircle size={14} className="text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <EmptyState icon={<Users size={40} />} title="No applications for screening" />}
      </Card>
    </div>
  );
};
