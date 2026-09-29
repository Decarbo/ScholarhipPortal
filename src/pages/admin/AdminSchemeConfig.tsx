import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, Button, Modal, Skeleton } from '../../components/ui';
import { useAppStore } from '../../store';
import * as api from '../../services/hybridApi';
import { Edit, BookOpen } from 'lucide-react';
import type { Scheme } from '../../mock/data';
import { getLocalizedScheme } from '../../utils/localizedData';

export const AdminSchemeConfig: React.FC = () => {
  const [schemesList, setSchemesList] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const { addToast } = useAppStore();

  const [form, setForm] = useState<any>({});
  const [busy, setBusy] = useState(false);
  const { t, i18n } = useTranslation('admin');
  const { t: tc } = useTranslation('common');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSchemesList(await api.getAdminSchemes());
    } catch (e: any) {
      addToast('error', e.message || 'Failed to load schemes');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (s: Scheme) => {
    setEditingScheme(s);
    setForm({
      amount: s.amount, quota: s.quota, deadline: s.deadline, duration: s.duration,
      eligibility: (s.eligibility || []).join('\n'),
      requiredDocuments: (s.requiredDocuments || []).join('\n'),
    });
  };

  const saveChanges = async () => {
    if (!editingScheme) return;
    setBusy(true);
    try {
      await api.updateScheme(editingScheme.id, {
        amount: Number(form.amount),
        quota: Number(form.quota),
        deadline: form.deadline,
        duration: form.duration,
        eligibility: String(form.eligibility || '').split('\n').map((x: string) => x.trim()).filter(Boolean),
        requiredDocuments: String(form.requiredDocuments || '').split('\n').map((x: string) => x.trim()).filter(Boolean),
      } as any);
      addToast('success', 'Scheme updated successfully');
      setEditingScheme(null);
      load();
    } catch (e: any) {
      addToast('error', e.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64 rounded-xl" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto font-sans text-[#1D293D] dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t('schemeConfig.title')}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              {t('schemeConfig.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {schemesList.map(scheme => {
          const loc = getLocalizedScheme(scheme, i18n.language);
          return (
            <Card key={scheme.id} className="p-5 border-[#DEE2E6] dark:border-slate-700 shadow-xs hover:border-[#0B75A4] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="info" className="bg-[#E6F1F5] text-[#0B75A4] dark:bg-[#0B75A4]/20 dark:text-[#1697C5]">
                      {loc.name}
                    </Badge>
                    <h3 className="text-lg font-bold text-[#1D293D] dark:text-white">{loc.fullName}</h3>
                  </div>
                  <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1.5">{loc.description}</p>
                </div>
                <Button size="sm" variant="outline" icon={<Edit size={14} />} onClick={() => openEdit(scheme)}>
                  {tc('actions.edit')}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700">
                  <p className="text-xs text-[#64748B] dark:text-slate-400">{t('schemeConfig.amount')}</p>
                  <p className="font-bold text-sm text-[#009B68] mt-0.5">₹{scheme.amount.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700">
                  <p className="text-xs text-[#64748B] dark:text-slate-400">{t('schemeConfig.quota')}</p>
                  <p className="font-bold text-sm text-[#1D293D] dark:text-white font-mono mt-0.5">{scheme.quota}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700">
                  <p className="text-xs text-[#64748B] dark:text-slate-400">{t('schemeConfig.applications')}</p>
                  <p className="font-bold text-sm text-[#0B75A4] dark:text-[#1697C5] font-mono mt-0.5">{scheme.activeApplications}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/50 border border-[#DEE2E6] dark:border-slate-700">
                  <p className="text-xs text-[#64748B] dark:text-slate-400">{t('schemeConfig.deadline')}</p>
                  <p className="font-bold text-sm text-[#1D293D] dark:text-white font-mono mt-0.5">{scheme.deadline}</p>
                </div>
              </div>
              <div className="mt-3.5 pt-3 border-t border-[#DEE2E6] dark:border-slate-800">
                <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 mb-2">
                  {t('schemeConfig.requiredDocuments')} ({scheme.requiredDocuments.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.requiredDocuments.map((d, i) => (
                    <Badge key={i} variant="neutral" className="bg-[#F8FAFC] border border-[#DEE2E6] text-[#475569]">
                      {d}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal isOpen={!!editingScheme} onClose={() => setEditingScheme(null)} title={`${t('schemeConfig.editPrefix')}${editingScheme ? getLocalizedScheme(editingScheme, i18n.language).fullName : ''}`} size="lg">
        {editingScheme && (
          <div className="space-y-4 font-sans text-[#1D293D] dark:text-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('schemeConfig.schemeAmount')}</label>
                <input
                  type="number"
                  value={form.amount ?? ''}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('schemeConfig.quota')}</label>
                <input
                  type="number"
                  value={form.quota ?? ''}
                  onChange={e => setForm({ ...form, quota: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('schemeConfig.deadline')}</label>
                <input
                  type="date"
                  value={form.deadline ?? ''}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('schemeConfig.duration')}</label>
                <input
                  type="text"
                  value={form.duration ?? ''}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('schemeConfig.eligibilityCriteria')}</label>
              <textarea
                rows={5}
                value={form.eligibility ?? ''}
                onChange={e => setForm({ ...form, eligibility: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">{t('schemeConfig.requiredDocsCriteria')}</label>
              <textarea
                rows={4}
                value={form.requiredDocuments ?? ''}
                onChange={e => setForm({ ...form, requiredDocuments: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4] resize-none"
              />
            </div>
            <div className="pt-2">
              <Button onClick={saveChanges} disabled={busy}>
                {busy ? t('schemeConfig.saving') : t('schemeConfig.saveChanges')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSchemeConfig;
