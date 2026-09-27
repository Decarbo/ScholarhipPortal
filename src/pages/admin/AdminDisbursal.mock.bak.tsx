import React, { useEffect, useState } from 'react';
import { Card, StatusBadge, Button, TableSkeleton } from '../../components/ui';
import { useAppStore } from '../../store';
import { disbursals } from '../../mock/data';
import type { Disbursal } from '../../mock/data';


export const AdminDisbursal: React.FC = () => {
  const [disbursalList, setDisbursalList] = useState<Disbursal[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useAppStore();

  useEffect(() => {
    setTimeout(() => { setDisbursalList(disbursals); setLoading(false); }, 300);
  }, []);

  if (loading) return <div className="p-6"><TableSkeleton /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Disbursal Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Process payments and manage transactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="!p-4"><p className="text-xs text-slate-500">Processed</p><p className="text-2xl font-bold text-emerald-600">{disbursalList.filter(d => d.status === 'processed').length}</p></Card>
        <Card className="!p-4"><p className="text-xs text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600">{disbursalList.filter(d => d.status === 'pending').length}</p></Card>
        <Card className="!p-4"><p className="text-xs text-slate-500">Failed</p><p className="text-2xl font-bold text-red-600">{disbursalList.filter(d => d.status === 'failed').length}</p></Card>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">TXN ID</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Student</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Amount</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Date</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Reference</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {disbursalList.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 text-xs font-mono text-slate-600 dark:text-slate-400">{d.transactionId}</td>
                  <td className="p-3 text-slate-900 dark:text-white">{d.studentName}</td>
                  <td className="p-3 font-medium text-slate-900 dark:text-white">₹{d.amount.toLocaleString('en-IN')}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{d.date}</td>
                  <td className="p-3"><StatusBadge status={d.status} /></td>
                  <td className="p-3 text-xs text-slate-500">{d.bankReference}</td>
                  <td className="p-3">
                    {d.status === 'pending' && <Button size="sm" variant="outline" onClick={() => addToast('success', `Payment ${d.id} marked as processed`)}>Mark Processed</Button>}
                    {d.status === 'failed' && <Button size="sm" variant="outline" onClick={() => addToast('info', `Retry initiated for ${d.id}`)}>Retry</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
