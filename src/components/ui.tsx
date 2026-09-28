// Core UI Components - Redesigned with calm, official design language
import React, { type ReactNode, type ButtonHTMLAttributes, useRef, useState } from 'react';
import { X, Check, AlertCircle, Info, Clock, Moon, Sun, Globe, Upload, FileText, Menu, ChevronDown, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { useAppStore, useAuthStore } from '../store';
import { ConnectionStatus } from './ConnectionStatus';

// ============ STATUS PILL ============
type StatusType = 'done' | 'progress' | 'neutral' | 'error';

export const StatusPill: React.FC<{ status: StatusType; label: string }> = ({ status, label }) => {
  const colors = {
    done: 'bg-[#38C88B]/15 text-[#1e7a54] dark:text-[#38C88B] border-[#38C88B]/40',
    progress: 'bg-[#E25A18]/15 text-[#b0400d] dark:text-[#ff8a50] border-[#E25A18]/40',
    neutral: 'bg-slate-100 text-slate-700 border-[#DEE2E6] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold border rounded-full ${colors[status]}`}>
      {label}
    </span>
  );
};

export const getStatusType = (status: string): StatusType => {
  const map: Record<string, StatusType> = {
    submitted: 'progress', under_scrutiny: 'progress', screening: 'progress',
    selected: 'done', waitlisted: 'neutral', rejected: 'error',
    verified: 'done', pending: 'progress', flagged: 'error', missing: 'error',
    processed: 'done', failed: 'error', open: 'progress', in_progress: 'progress',
    resolved: 'done', closed: 'neutral', draft: 'neutral',
  };
  return map[status] || 'neutral';
};

export const getStatusLabel = (status: string): string => {
  const t = (key: string) => i18next.t(key, { ns: 'common' });
  const map: Record<string, string> = {
    submitted: t('status.submitted'), under_scrutiny: t('status.under_scrutiny'), screening: t('status.screening'),
    selected: t('status.selected'), waitlisted: t('status.waitlisted'), rejected: t('status.rejected'),
    verified: t('status.verified'), pending: t('status.pending'), flagged: t('status.flagged'), missing: t('status.missing'),
    processed: t('status.processed'), failed: t('status.failed'), open: t('status.open'), in_progress: t('status.in_progress'),
    resolved: t('status.resolved'), closed: t('status.closed'), draft: t('status.draft'),
  };
  return map[status] || status;
};

// Backwards-compatible Badge component
export const Badge: React.FC<{ variant?: string; children: ReactNode; className?: string }> = ({ variant, children, className = '' }) => {
  const variantMap: Record<string, StatusType> = {
    success: 'done', warning: 'progress', danger: 'error', info: 'progress', neutral: 'neutral', purple: 'progress',
  };
  return <StatusPill status={variantMap[variant || 'neutral'] || 'neutral'} label={typeof children === 'string' ? children : ''} />;
};

// Backwards-compatible StatusBadge
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation('common');
  const map: Record<string, string> = {
    submitted: t('status.submitted'), under_scrutiny: t('status.under_scrutiny'), screening: t('status.screening'),
    selected: t('status.selected'), waitlisted: t('status.waitlisted'), rejected: t('status.rejected'),
    verified: t('status.verified'), pending: t('status.pending'), flagged: t('status.flagged'), missing: t('status.missing'),
    processed: t('status.processed'), failed: t('status.failed'), open: t('status.open'), in_progress: t('status.in_progress'),
    resolved: t('status.resolved'), closed: t('status.closed'), draft: t('status.draft'),
  };
  return <StatusPill status={getStatusType(status)} label={map[status] || status} />;
};

// ============ PROGRESS TIMELINE ============
export const ProgressTimeline: React.FC<{ 
  steps: string[]; 
  currentStep: number;
  labels?: string[];
}> = ({ steps, currentStep, labels }) => {
  const progressPercent = (currentStep / (steps.length - 1)) * 100;
  return (
    <div className="w-full">
      <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="absolute left-0 top-0 h-full bg-[#0B75A4] animate-progress" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="relative flex justify-between mt-2">
        {steps.map((step, i) => {
          const isCompleted = i <= currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={i} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              <div className={`w-3.5 h-3.5 rounded-full border-2 -mt-2.5 transition-all ${
                isCompleted ? 'bg-[#0B75A4] border-[#0B75A4]' : 'bg-white border-[#DEE2E6] dark:bg-slate-800 dark:border-slate-600'
              } ${isCurrent ? 'ring-4 ring-[#0B75A4]/25' : ''}`}>
                {isCompleted && i < currentStep && <Check size={8} className="text-white mx-auto mt-0.5" />}
              </div>
              <span className={`text-[10px] mt-1 text-center leading-tight ${isCompleted ? 'text-[#0B75A4] dark:text-[#1697C5] font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                {labels ? labels[i] : step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Backwards-compatible Stepper
export const Stepper: React.FC<{ steps: string[]; currentStep: number }> = ({ steps, currentStep }) => (
  <ProgressTimeline steps={steps} currentStep={currentStep} />
);

// ============ DOCUMENT ROW ============
export const DocumentRow: React.FC<{
  name: string;
  status: 'verified' | 'pending' | 'flagged' | 'missing';
  explanation?: string;
  onAction?: () => void;
  actionLabel?: string;
}> = ({ name, status, explanation, onAction, actionLabel }) => {
  const icons = {
    verified: <Check size={16} className="text-teal-600 dark:text-teal-400" />,
    pending: <Clock size={16} className="text-amber-600 dark:text-amber-400" />,
    flagged: <AlertCircle size={16} className="text-red-600 dark:text-red-400" />,
    missing: <AlertCircle size={16} className="text-slate-400" />,
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
      <div className="mt-0.5 flex-shrink-0">{icons[status]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 dark:text-slate-100">{name}</p>
        {explanation && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{explanation}</p>}
      </div>
      {onAction && actionLabel && (
        <button onClick={onAction} className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 font-medium flex-shrink-0">{actionLabel}</button>
      )}
    </div>
  );
};

// ============ METRIC DISPLAY ============
export const MetricDisplay: React.FC<{
  hero: { label: string; value: string | number; subtitle?: string };
  supporting?: Array<{ label: string; value: string | number }>;
}> = ({ hero, supporting }) => (
  <div>
    <div className="mb-6">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{hero.label}</p>
      <p className="text-4xl font-semibold text-slate-900 dark:text-slate-100">
        {typeof hero.value === 'number' ? hero.value.toLocaleString('en-IN') : hero.value}
      </p>
      {hero.subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{hero.subtitle}</p>}
    </div>
    {supporting && supporting.length > 0 && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
        {supporting.map((m, i) => (
          <div key={i}>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{m.label}</p>
            <p className="text-xl font-medium text-slate-900 dark:text-slate-100">
              {typeof m.value === 'number' ? m.value.toLocaleString('en-IN') : m.value}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ============ DATA TABLE ============
export const DataTable: React.FC<{
  columns: Array<{ key: string; label: string; width?: string }>;
  data: Array<Record<string, ReactNode>>;
  onRowClick?: (row: Record<string, ReactNode>) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
}> = ({ columns, data, onRowClick, selectable, selectedRows = [], onSelectionChange }) => {
  const handleSelect = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedRows.includes(id) ? selectedRows.filter(x => x !== id) : [...selectedRows, id]);
  };
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedRows.length === data.length ? [] : data.map(row => row.id as string));
  };
  return (
    <div className="overflow-x-auto rounded-xl border border-[#DEE2E6] dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-xs">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#DEE2E6] dark:border-slate-700 bg-slate-50/80 dark:bg-slate-850">
            {selectable && (
              <th className="text-left py-2.5 px-3 w-10">
                <input type="checkbox" checked={selectedRows.length === data.length && data.length > 0} onChange={handleSelectAll} className="rounded border-[#DEE2E6] text-[#0B75A4] focus:ring-[#0B75A4]" />
              </th>
            )}
            {columns.map(col => (
              <th key={col.key} className="text-left py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider" style={col.width ? { width: col.width } : undefined}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DEE2E6]/60 dark:divide-slate-700/60">
          {data.map((row, i) => (
            <tr key={i} className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[#0B75A4]/5 dark:hover:bg-[#0B75A4]/15' : 'hover:bg-slate-50/60'}`} onClick={() => onRowClick?.(row)}>
              {selectable && (
                <td className="py-2.5 px-3">
                  <input type="checkbox" checked={selectedRows.includes(row.id as string)} onChange={(e) => { e.stopPropagation(); handleSelect(row.id as string); }} className="rounded border-[#DEE2E6] text-[#0B75A4] focus:ring-[#0B75A4]" />
                </td>
              )}
              {columns.map(col => <td key={col.key} className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{row[col.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============ CARD (minimal - only for bounded objects) ============
export const Card: React.FC<{ children: ReactNode; className?: string; padding?: boolean }> = ({ children, className = '', padding = true }) => (
  <div className={`bg-white dark:bg-slate-800 border border-[#DEE2E6] dark:border-slate-700/80 rounded-xl shadow-xs hover:shadow-md transition-all duration-300 ${padding ? 'p-4 md:p-5' : ''} ${className}`}>
    {children}
  </div>
);

// ============ BUTTON ============
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-xs';
  const variants: Record<string, string> = {
    primary: 'bg-[#0B75A4] text-white hover:bg-[#056C9A] active:bg-[#024969] focus:ring-[#0B75A4]/40 shadow-xs hover:shadow',
    secondary: 'bg-white text-slate-700 border border-[#DEE2E6] hover:bg-slate-50 hover:border-[#0B75A4]/40 focus:ring-[#0B75A4]/30 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700',
    outline: 'bg-white text-[#0B75A4] border border-[#DEE2E6] hover:bg-[#0B75A4]/5 hover:border-[#0B75A4] focus:ring-[#0B75A4]/30 dark:bg-slate-800 dark:text-[#1697C5] dark:border-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-xs',
    ghost: 'text-slate-600 hover:bg-[#0B75A4]/10 hover:text-[#0B75A4] focus:ring-[#0B75A4]/30 dark:text-slate-300 dark:hover:bg-slate-800',
  };
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-xs gap-1.5', md: 'px-4 py-2 text-sm gap-2', lg: 'px-6 py-2.5 text-sm gap-2' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />}
      {icon && !loading && icon}
      {children}
    </button>
  );
};

// ============ MODAL ============
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white dark:bg-slate-900 w-full ${sizes[size]} max-h-[90vh] overflow-y-auto animate-fade-in`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded" aria-label="Close"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// ============ TOAST ============
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2" aria-live="polite">
      {toasts.map(toast => (
        <div key={toast.id} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in">
          {toast.type === 'success' && <Check size={16} className="text-teal-600" />}
          {toast.type === 'error' && <AlertCircle size={16} className="text-red-600" />}
          {toast.type === 'info' && <Info size={16} className="text-slate-600" />}
          {toast.type === 'warning' && <AlertCircle size={16} className="text-amber-600" />}
          <span className="text-sm text-slate-900 dark:text-slate-100">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-slate-400 hover:text-slate-600"><X size={14} /></button>
        </div>
      ))}
    </div>
  );
};

// ============ EMPTY STATE ============
export const EmptyState: React.FC<{ icon?: ReactNode; title: string; description?: string; action?: ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    {icon && <div className="mb-4 text-slate-400">{icon}</div>}
    <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">{title}</h3>
    {description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ============ SKELETON ============
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded ${className}`} />
);

// ============ INPUT ============
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2 rounded-lg border ${
          error ? 'border-red-400 dark:border-red-700 ring-1 ring-red-400' : 'border-[#DEE2E6] dark:border-slate-750'
        } bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-[#0B75A4] focus:ring-2 focus:ring-[#0B75A4]/20 transition-all ${className}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => <Skeleton key={j} className="h-4 flex-1" />)}
      </div>
    ))}
  </div>
);

// ============ PROGRESS BAR ============
export const ProgressBar: React.FC<{ value: number; max?: number; label?: string; color?: string }> = ({ value, max = 100, label, color = 'bg-[#0B75A4]' }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs mb-1"><span className="text-slate-600 dark:text-slate-400">{label}</span><span className="font-medium text-slate-700 dark:text-slate-300">{Math.round(pct)}%</span></div>}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ============ STAT CARD (backwards compat) ============
export const StatCard: React.FC<{ title: string; value: string | number; icon?: ReactNode; trend?: string; trendUp?: boolean; color?: string }> = ({ title, value }) => (
  <div className="py-3">
    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">{title}</p>
    <p className="text-xl font-medium text-slate-900 dark:text-slate-100">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
  </div>
);

// ============ FILE UPLOAD ============
export const FileUpload: React.FC<{ onUpload: (files: File[]) => void; accept?: string; multiple?: boolean; label?: string }> = ({ onUpload, accept = '.pdf,.jpg,.jpeg,.png', multiple = true, label = 'Upload documents' }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${dragging ? 'border-[#0B75A4] bg-[#0B75A4]/10 dark:bg-[#0B75A4]/20' : 'border-[#DEE2E6] dark:border-slate-700 hover:border-[#0B75A4] hover:bg-[#0B75A4]/5'}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) onUpload(Array.from(e.dataTransfer.files)); }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
    >
      <Upload size={24} className="mx-auto text-[#0B75A4] dark:text-[#1697C5] mb-2" />
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{i18next.t('fileUpload.dragDrop', { ns: 'common' })}</p>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => { if (e.target.files) onUpload(Array.from(e.target.files)); }} />
    </div>
  );
};

// ============ LANGUAGE SELECTOR ============
export const LanguageSelector: React.FC<{ className?: string; showLabel?: boolean }> = ({ className = '', showLabel = true }) => {
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation('common');
  const [langOpen, setLangOpen] = useState(false);

  const languages = [
    { code: 'en' as const, label: 'English', native: 'English' },
    { code: 'hi' as const, label: 'Hindi', native: 'हिंदी' },
    { code: 'sat' as const, label: 'Santhali', native: 'ᱥᱟᱱᱛᱟᱞᱤ' },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setLangOpen(!langOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 hover:border-[#0B75A4]/50 dark:hover:bg-slate-700 border border-[#DEE2E6] dark:border-slate-700 rounded-lg shadow-xs transition-all cursor-pointer"
        aria-label={t('language.toggle')}
      >
        <Globe size={14} className="text-[#0B75A4] dark:text-[#1697C5] flex-shrink-0" />
        {showLabel && <span>{languages.find((l) => l.code === language)?.native || 'English'}</span>}
        <ChevronDown size={12} className="text-slate-400" />
      </button>

      {langOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 border border-[#DEE2E6] dark:border-slate-700 rounded-xl shadow-lg min-w-[130px] py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setLangOpen(false);
                }}
                className={`w-full text-left flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer ${
                  language === lang.code
                    ? 'text-[#0B75A4] dark:text-[#1697C5] font-semibold bg-[#0B75A4]/10 dark:bg-[#0B75A4]/25'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span>{lang.native}</span>
                {language === lang.code && <Check size={12} className="text-[#0B75A4] dark:text-[#1697C5]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ============ HEADER ============
export const Header: React.FC<{ title?: string }> = ({ title }) => {
  const { theme, toggleTheme } = useAppStore();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation('common');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#DEE2E6] dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#024969] via-[#056C9A] to-[#0B75A4] flex items-center justify-center shadow-sm shadow-[#0B75A4]/20 text-white flex-shrink-0">
              <GraduationCap size={18} className="stroke-[2.3]" />
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-[#024969] dark:text-white">UDAAN</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#E0F0F7] dark:bg-[#0B75A4]/20 text-[#056C9A] dark:text-[#1697C5] rounded tracking-wider border border-[#B8DEEE]/60 dark:border-[#0B75A4]/40">MoTA</span>
              </div>
              <span className="text-[8px] font-bold tracking-widest text-[#0B75A4] dark:text-[#1697C5] uppercase mt-0.5">SCHOLAR PORTAL</span>
            </div>
          </div>
          {title && (
            <div className="hidden sm:flex items-center pl-3 border-l border-[#DEE2E6] dark:border-slate-700">
              <h1 className="text-xs font-semibold text-slate-700 dark:text-slate-300">{title}</h1>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <ConnectionStatus />
          {/* Reusable Language selector */}
          <LanguageSelector />
          <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-amber-400 transition-colors" aria-label={t('theme.toggle')}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          {user && (
            <div className="flex items-center gap-2 ml-1">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{user.name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <button onClick={logout} className="px-2 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">{t('actions.logout')}</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// ============ SIDEBAR ============
interface SidebarItem { label: string; icon: ReactNode; path: string; badge?: number; }
export const Sidebar: React.FC<{ items: SidebarItem[]; currentPath: string; onNavigate: (path: string) => void }> = ({ items, currentPath, onNavigate }) => {
  const { sidebarOpen } = useAppStore();
  return (
    <aside className={`fixed left-0 top-14 bottom-0 z-30 bg-white dark:bg-slate-900 border-r border-[#DEE2E6] dark:border-slate-800 transition-all duration-300 shadow-xs ${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden lg:w-14'}`}>
      <nav className="p-2 space-y-1">
        {items.map(item => {
          const active = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-150 cursor-pointer ${
                active
                  ? 'bg-[#0B75A4]/10 text-[#0B75A4] dark:bg-[#0B75A4]/20 dark:text-[#1697C5] font-semibold border-l-4 border-[#0B75A4]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B75A4] dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
              }`}
              aria-label={item.label}
            >
              <span className={active ? 'text-[#0B75A4] dark:text-[#1697C5]' : 'text-slate-500'}>{item.icon}</span>
              {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
              {sidebarOpen && item.badge && item.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#E25A18]/15 text-[#E25A18] rounded-full border border-[#E25A18]/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
