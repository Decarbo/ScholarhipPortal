import React, { useState } from 'react';
import { Card, Button } from '../../components/ui';
import { useAppStore } from '../../store';
import { Send } from 'lucide-react';


export const AdminCommunication: React.FC = () => {
  const { addToast } = useAppStore();
  const [recipientGroup, setRecipientGroup] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!recipientGroup || !subject || !message) {
      addToast('error', 'Please fill all fields');
      return;
    }
    addToast('success', `Notice sent to ${recipientGroup} group successfully`);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Communication Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Send notices and updates to applicant groups</p>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Recipient Group</label>
            <select value={recipientGroup} onChange={(e) => setRecipientGroup(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select group...</option>
              <option value="all_pending">All Pending Applications</option>
              <option value="all_selected">All Selected Students</option>
              <option value="deficiency">Students with Deficiency Notices</option>
              <option value="scheme_nfst">NFST Applicants</option>
              <option value="scheme_nos">NOS Applicants</option>
              <option value="state_mp">Madhya Pradesh Students</option>
              <option value="state_rj">Rajasthan Students</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="Notice subject" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Message</label>
            <textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Type your notice message..." />
          </div>
          <Button icon={<Send size={14} />} onClick={handleSend}>Send Notice</Button>
        </div>
      </Card>
    </div>
  );
};
