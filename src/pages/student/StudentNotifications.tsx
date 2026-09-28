import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState, Skeleton } from "../../components/ui";
import { SMSStatusCheck } from "../../components/accessibility";
import { students, notifications } from "../../mock/data";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Calendar,
  MessageSquare,
  Mail,
  Smartphone,
} from "lucide-react";
import type { Notification } from "../../mock/data";

export const StudentNotifications: React.FC = () => {
  const [myNotifs, setMyNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("student");
  const { t: tc } = useTranslation("common");
  const student = students[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      setMyNotifs(notifications.filter((n) => n.userId === student.id));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [student.id]);

  if (loading)
    return (
      <div className="p-4 md:p-8 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );

  const typeIcons: Record<string, React.ReactNode> = {
    status_change: (
      <RefreshCw size={16} className="text-[#0B75A4] dark:text-[#1697C5]" />
    ),
    deadline: (
      <Clock size={16} className="text-[#F59E0B] dark:text-amber-400" />
    ),
    deficiency: (
      <AlertTriangle size={16} className="text-[#EF4444] dark:text-red-400" />
    ),
    disbursal: (
      <CheckCircle2
        size={16}
        className="text-[#009B68] dark:text-emerald-400"
      />
    ),
    renewal_reminder: (
      <Calendar size={16} className="text-[#0B75A4] dark:text-cyan-400" />
    ),
    general: <Bell size={16} className="text-[#64748B] dark:text-slate-400" />,
    sms_alert: (
      <MessageSquare
        size={16}
        className="text-[#009B68] dark:text-emerald-400"
      />
    ),
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5">
            <Bell size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t("notifications.title")}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              Stay updated on application status changes, disbursal alerts, and
              upcoming deadline reminders.
            </p>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <SMSStatusCheck />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {myNotifs.length === 0 ? (
          <EmptyState
            icon={<Bell size={40} className="text-[#94A3B8]" />}
            title={t("notifications.noNotifications")}
            description={t("dashboard.overview")}
          />
        ) : (
          myNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3.5 p-4 md:p-5 rounded-xl border transition-all ${
                !notif.read
                  ? "bg-[#E6F1F5]/40 dark:bg-slate-800/60 border-[#0B75A4]/30 dark:border-slate-700 shadow-xs"
                  : "bg-white dark:bg-slate-900 border-[#DEE2E6] dark:border-slate-800 hover:border-[#CBD5E1]"
              }`}
            >
              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-[#DEE2E6] dark:border-slate-700 shrink-0 mt-0.5 shadow-2xs">
                {typeIcons[notif.type] || typeIcons.general}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1D293D] dark:text-white">
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#0B75A4] shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[#64748B] dark:text-slate-300 mt-1.5 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-3 font-mono text-[11px] text-[#94A3B8] dark:text-slate-500">
                  <span>{notif.createdAt}</span>
                  {notif.smsSent && (
                    <span className="flex items-center gap-1 text-[#009B68] dark:text-emerald-400 font-sans font-medium">
                      <Smartphone size={12} /> SMS sent
                    </span>
                  )}
                  {notif.emailSent && (
                    <span className="flex items-center gap-1 text-[#0B75A4] dark:text-[#1697C5] font-sans font-medium">
                      <Mail size={12} /> Email sent
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
