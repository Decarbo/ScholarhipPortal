import React, { useEffect, useState } from 'react';
import { Card, Badge, StatusBadge, Button, Modal, EmptyState, TableSkeleton } from '../../components/ui';
import { useAppStore } from '../../store';
import { applications, schemes } from '../../mock/data';
import { Search, CheckCircle, XCircle, AlertTriangle, FileText, Eye } from 'lucide-react';
import type { Application } from '../../mock/data';


export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<Application[]>([]);
  const [filterScheme, setFilterScheme] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const { addToast } = useAppStore();

  useEffect(() => {
    setTimeout(() => { setApps(applications); setLoading(false); }, 400);
  }, []);

  const filteredApps = apps.filter(a => {
    if (filterScheme && a.schemeId !== filterScheme) return false;
    if (filterState && a.state !== filterState) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (searchQuery && !a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) && !a.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedApps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAction = () => {
    addToast('success', `${selectedApps.length} applications ${bulkAction} successfully`);
    setShowBulkModal(false);
    setSelectedApps([]);
  };

  const uniqueStates = [...new Set(apps.map(a => a.state))];

  if (loading) return <div className="p-6"><TableSkeleton /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="!p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Total Queue</p><p className="text-2xl font-bold text-slate-900 dark:text-white">{apps.length}</p></Card>
        <Card className="!p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Pending Review</p><p className="text-2xl font-bold text-amber-600">{apps.filter(a => ['submitted', 'under_scrutiny'].includes(a.status)).length}</p></Card>
        <Card className="!p-4"><p className="text-xs text-slate-500 dark:text-slate-400">AI Flags</p><p className="text-2xl font-bold text-red-600">{apps.reduce((acc, a) => acc + a.aiFlags.length, 0)}</p></Card>
        <Card className="!p-4"><p className="text-xs text-slate-500 dark:text-slate-400">Selected Today</p><p className="text-2xl font-bold text-emerald-600">{apps.filter(a => a.status === 'selected').length}</p></Card>
      </div>

      {/* Filters */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={filterScheme} onChange={(e) => setFilterScheme(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="">All Schemes</option>
            {schemes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="">All States</option>
            {uniqueStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 outline-none">
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_scrutiny">Under Scrutiny</option>
            <option value="screening">Screening</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedApps.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{selectedApps.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => { setBulkAction('approved'); setShowBulkModal(true); }} icon={<CheckCircle size={14} />}>Approve</Button>
          <Button size="sm" variant="outline" onClick={() => { setBulkAction('rejected'); setShowBulkModal(true); }} icon={<XCircle size={14} />}>Reject</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedApps([])}>Clear</Button>
        </div>
      )}

      {/* Applications Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3 text-left"><input type="checkbox" onChange={(e) => { if (e.target.checked) setSelectedApps(filteredApps.map(a => a.id)); else setSelectedApps([]); }} className="rounded" /></th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Applicant</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Scheme</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">State</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Status</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">AI Flags</th>
                <th className="p-3 text-left font-medium text-slate-600 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredApps.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3"><input type="checkbox" checked={selectedApps.includes(app.id)} onChange={() => toggleSelect(app.id)} className="rounded" /></td>
                  <td className="p-3">
                    <p className="font-medium text-slate-900 dark:text-white">{app.studentName}</p>
                    <p className="text-xs text-slate-500">{app.id}</p>
                  </td>
                  <td className="p-3"><Badge variant="info">{app.schemeName}</Badge></td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">{app.state}</td>
                  <td className="p-3"><StatusBadge status={app.status} /></td>
                  <td className="p-3">
                    {app.aiFlags.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                        <AlertTriangle size={12} /> {app.aiFlags.length}
                      </span>
                    ) : <span className="text-xs text-slate-400">—</span>}
                  </td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" onClick={() => setSelectedApp(app)} icon={<Eye size={14} />}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredApps.length === 0 && <EmptyState icon={<Search size={40} />} title="No applications found" description="Try adjusting your filters" />}
      </Card>

      {/* App Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={`Application: ${selectedApp?.id}`} size="xl">
        {selectedApp && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><p className="text-xs text-slate-500">Student</p><p className="font-medium text-slate-900 dark:text-white">{selectedApp.studentName}</p></div>
              <div><p className="text-xs text-slate-500">Scheme</p><p className="font-medium text-slate-900 dark:text-white">{selectedApp.schemeName}</p></div>
              <div><p className="text-xs text-slate-500">State</p><p className="font-medium text-slate-900 dark:text-white">{selectedApp.state}</p></div>
              <div><p className="text-xs text-slate-500">Amount</p><p className="font-medium text-slate-900 dark:text-white">₹{selectedApp.amount.toLocaleString('en-IN')}</p></div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Submitted Documents</h4>
              <div className="space-y-2">
                {selectedApp.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">AI Score: {doc.aiScore}%</span>
                      <StatusBadge status={doc.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Flags */}
            {selectedApp.aiFlags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">AI Verification Flags</h4>
                {selectedApp.aiFlags.map(flag => (
                  <div key={flag.id} className={`p-3 rounded-lg mb-2 border ${flag.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : flag.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={14} className={flag.severity === 'high' ? 'text-red-600' : flag.severity === 'medium' ? 'text-amber-600' : 'text-blue-600'} />
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{flag.message}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{flag.type.replace(/_/g, ' ')} | {flag.createdAt}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button size="sm" icon={<CheckCircle size={14} />} onClick={() => { addToast('success', `Application ${selectedApp.id} approved`); setSelectedApp(null); }}>Approve</Button>
              <Button size="sm" variant="danger" icon={<XCircle size={14} />} onClick={() => { addToast('error', `Application ${selectedApp.id} rejected`); setSelectedApp(null); }}>Reject</Button>
              <Button size="sm" variant="outline" icon={<AlertTriangle size={14} />} onClick={() => { addToast('warning', `Resubmission requested for ${selectedApp.id}`); setSelectedApp(null); }}>Request Resubmission</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Action Modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title={`Bulk ${bulkAction}`}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">You are about to {bulkAction} {selectedApps.length} applications. This action cannot be undone.</p>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Reason (required)</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Enter reason for this action..." />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBulkAction}>Confirm</Button>
            <Button variant="outline" onClick={() => setShowBulkModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
