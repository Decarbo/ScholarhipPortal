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
    setTimeout(() => {
      setMyNotifs(notifications.filter((n) => n.userId === student.id));
      setLoading(false);
    }, 300);
  }, []);

  if (loading)
    return (
      <div className="p-4 md:p-8 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-64 rounded-md bg-[#1B2434]/5 dark:bg-slate-800" />
      </div>
    );

  const typeIcons: Record<string, React.ReactNode> = {
    status_change: (
      <RefreshCw size={16} className="text-blue-600 dark:text-blue-400" />
    ),
    deadline: (
      <Clock size={16} className="text-amber-600 dark:text-amber-400" />
    ),
    deficiency: (
      <AlertTriangle size={16} className="text-[#B4472A] dark:text-red-400" />
    ),
    disbursal: (
      <CheckCircle2
        size={16}
        className="text-[#2E6B4F] dark:text-emerald-400"
      />
    ),
    renewal_reminder: (
      <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
    ),
    general: <Bell size={16} className="text-slate-500 dark:text-slate-400" />,
    sms_alert: (
      <MessageSquare
        size={16}
        className="text-[#2E6B4F] dark:text-emerald-400"
      />
    ),
  };

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto font-sans text-[#1B2434] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1B2434]/10 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <Bell
            size={32}
            className="text-[#1B2434] dark:text-slate-300 shrink-0 mt-1"
          />
          <div>
            <h1 className="font-serif text-[28px] md:text-[34px] text-[#1B2434] dark:text-white leading-tight">
              {t("notifications.title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
            icon={<Bell size={40} className="text-slate-400" />}
            title={t("notifications.noNotifications")}
            description={t("dashboard.overview")}
          />
        ) : (
          myNotifs.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3.5 p-4 md:p-5 rounded-md border transition-all ${
                !notif.read
                  ? "bg-[#1B2434]/[0.03] dark:bg-slate-800/50 border-[#1B2434]/20 dark:border-slate-700 shadow-sm"
                  : "bg-white dark:bg-[#0F1622] border-[#1B2434]/10 dark:border-slate-800"
              }`}
            >
              <div className="p-2 rounded-md bg-[#1B2434]/5 dark:bg-slate-800 shrink-0 mt-0.5">
                {typeIcons[notif.type] || typeIcons.general}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white">
                  {notif.title}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-3 font-mono text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{notif.createdAt}</span>
                  {notif.smsSent && (
                    <span className="flex items-center gap-1 text-[#2E6B4F] dark:text-emerald-400 font-sans">
                      <Smartphone size={12} /> SMS sent
                    </span>
                  )}
                  {notif.emailSent && (
                    <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-sans">
                      <Mail size={12} /> Email sent
                    </span>
                  )}
                </div>
              </div>

              {!notif.read && (
                <div className="w-2 h-2 rounded-full bg-[#1B2434] dark:bg-slate-200 mt-2 shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
