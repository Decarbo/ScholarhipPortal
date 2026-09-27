import React, { useEffect, useState } from 'react';
import { Card, Badge, StatusBadge, Button, Modal, Skeleton } from '../../components/ui';
import { useAppStore } from '../../store';
import { Send } from 'lucide-react';
import { grievances as mockGrievances } from '../../mock/data';
import type { Grievance } from '../../mock/data';


export const AdminGrievances: React.FC = () => {
  const [grievanceList, setGrievanceList] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrv, setSelectedGrv] = useState<Grievance | null>(null);
  const [response, setResponse] = useState('');
  const { addToast } = useAppStore();

  useEffect(() => {
    setTimeout(() => { setGrievanceList(mockGrievances); setLoading(false); }, 300);
  }, []);

  const handleRespond = () => {
    if (!response.trim()) { addToast('error', 'Please enter a response'); return; }
    addToast('success', 'Response sent successfully');
    setSelectedGrv(null);
    setResponse('');
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Grievance Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Respond to student support tickets</p>
      </div>

      <div className="space-y-3">
        {grievanceList.map(grv => (
          <Card key={grv.id} className="!p-4 cursor-pointer hover:shadow-md transition-all" >
            <div className="flex items-start justify-between" onClick={() => { setSelectedGrv(grv); setResponse(grv.response || ''); }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{grv.subject}</p>
                  <StatusBadge status={grv.status} />
                  <Badge variant={grv.priority === 'high' ? 'danger' : grv.priority === 'medium' ? 'warning' : 'neutral'}>{grv.priority}</Badge>
                </div>
                <p className="text-xs text-slate-500">By: {grv.studentName} | {grv.createdAt.split(' ')[0]}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{grv.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!selectedGrv} onClose={() => setSelectedGrv(null)} title={`Ticket: ${selectedGrv?.id}`} size="lg">
        {selectedGrv && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-xs text-slate-500">Student</p><p className="font-medium text-slate-900 dark:text-white">{selectedGrv.studentName}</p></div>
              <div><p className="text-xs text-slate-500">Priority</p><Badge variant={selectedGrv.priority === 'high' ? 'danger' : selectedGrv.priority === 'medium' ? 'warning' : 'neutral'}>{selectedGrv.priority}</Badge></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Subject</p>
              <p className="font-medium text-slate-900 dark:text-white">{selectedGrv.subject}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Description</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{selectedGrv.description}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Your Response</label>
              <textarea rows={4} value={response} onChange={(e) => setResponse(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Type your response..." />
            </div>
            <Button onClick={handleRespond}>Send Response</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
