import React, { useEffect, useState } from 'react';
import { Card, Badge, TableSkeleton } from '../../components/ui';
import { auditLog } from '../../mock/data';
import type { AuditEntry } from '../../mock/data';


export const AdminAuditLog: React.FC = () => {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setEntries(auditLog); setLoading(false); }, 300);
  }, []);

  if (loading) return <div className="p-6"><TableSkeleton /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Audit Log</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track all administrative actions</p>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Timestamp</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Officer</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Action</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Application</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Student</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {entries.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-3 text-xs text-slate-500 whitespace-nowrap">{entry.timestamp}</td>
                  <td className="p-3 text-slate-900 dark:text-white">{entry.adminName}</td>
                  <td className="p-3">
                    <Badge variant={entry.action === 'Approved' || entry.action === 'Selected' ? 'success' : entry.action === 'Rejected' ? 'danger' : 'warning'}>{entry.action}</Badge>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{entry.applicationId}</td>
                  <td className="p-3 text-slate-900 dark:text-white">{entry.studentName}</td>
                  <td className="p-3 text-xs text-slate-500 max-w-xs truncate">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
