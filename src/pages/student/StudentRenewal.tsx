import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Button, FileUpload, EmptyState } from "../../components/ui";
import { useAppStore } from "../../store";
import { applications, schemes, students } from "../../mock/data";
import { uploadAttendance } from "../../services/api";
import {
  CheckCircle2,
  RefreshCw,
  Clock,
  AlertTriangle,
  FileCheck,
  RotateCw,
} from "lucide-react";
import { getLocalizedSchemeName } from "../../utils/localizedData";

export const StudentRenewal: React.FC = () => {
  const { addToast } = useAppStore();
  const student = students[0];
  const prevApp = applications.find(
    (a) => a.studentId === student.id && a.status === "selected",
  );
  const [attendance, setAttendance] = useState(
    prevApp?.attendancePercentage || 0,
  );
  const [progressUploaded, setProgressUploaded] = useState(
    prevApp?.progressReportUploaded || false,
  );
  const { t, i18n } = useTranslation("student");
  const { t: tc } = useTranslation("common");

  const handleRenewal = () => {
    if (prevApp) {
      uploadAttendance(prevApp.id, attendance);
    }
    addToast("success", "Renewal application submitted!");
  };

  const currentScheme = schemes.find((s) => s.id === prevApp?.schemeId);

  return (
    <div className="p-4 md:p-8 space-y-6 mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5">
            <RotateCw size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t("renewal.title")}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              {t("renewal.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {prevApp ? (
        <Card className="border-[#DEE2E6] dark:border-slate-700 shadow-xs p-5 md:p-6 space-y-6">
          {/* Active Scholarship Summary */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-800/60 border border-[#DEE2E6] dark:border-slate-700">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <p className="text-sm font-bold text-[#1D293D] dark:text-white">
                {t("tracker.scheme")}: {getLocalizedSchemeName(prevApp.schemeName, i18n.language)}
              </p>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#009B68]/10 text-[#009B68] dark:bg-emerald-950/40 dark:text-emerald-300 border border-[#009B68]/20">
                {tc("status.selected")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B] dark:text-slate-300 font-mono mt-2">
              <span>{tc("common.amount")}: ₹{prevApp.amount.toLocaleString("en-IN")}</span>
              <span>•</span>
              <span>{t("tracker.enrolmentConfirmed")}: {prevApp.enrolmentDate || "N/A"}</span>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg font-bold text-[#1D293D] dark:text-white border-b border-[#DEE2E6] dark:border-slate-800 pb-2">
              {t("apply.personalInfo")}
            </h3>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">
                  {tc("common.name")}
                </label>
                <input
                  type="text"
                  defaultValue={student.name}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border border-[#DEE2E6] dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs text-[#64748B] dark:text-slate-300 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">
                  {t("apply.course")}
                </label>
                <input
                  type="text"
                  defaultValue={student.courseName}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">
                  {t("apply.year")}
                </label>
                <input
                  type="number"
                  defaultValue={student.yearOfStudy + 1}
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1">
                  {t("apply.percentage")}
                </label>
                <input
                  type="number"
                  defaultValue="72"
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4] focus:border-[#0B75A4]"
                />
              </div>
            </div>

            {/* Attendance & Progress Callout */}
            <div className="p-4 md:p-5 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                <FileCheck size={18} className="shrink-0 text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {t("renewal.progressReport")}
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    {t("renewal.attendance")} (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  {attendance < 75 && (
                    <p className="text-xs text-[#EF4444] dark:text-red-400 mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={13} /> Minimum 75% attendance required for renewal eligibility.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1.5">
                    {t("renewal.uploadProgress")}
                  </label>
                  {!progressUploaded ? (
                    <FileUpload
                      label={t("renewal.uploadProgress")}
                      onUpload={() => {
                        setProgressUploaded(true);
                        addToast("success", "Progress report uploaded");
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#009B68]/10 dark:bg-emerald-950/20 border border-[#009B68]/20 dark:border-emerald-800">
                      <CheckCircle2
                        size={16}
                        className="text-[#009B68] dark:text-emerald-400"
                      />
                      <span className="text-xs font-semibold text-[#009B68] dark:text-emerald-300">
                        {tc("status.verified")} ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deadline Banner */}
            <div className="p-3.5 rounded-xl bg-[#E6F1F5]/60 dark:bg-slate-800/60 border border-[#0B75A4]/20 dark:border-slate-700 flex items-center gap-2.5">
              <Clock
                size={16}
                className="text-[#0B75A4] dark:text-[#1697C5] shrink-0"
              />
              <p className="text-xs text-[#0B75A4] dark:text-slate-300">
                <strong>{t("renewal.deadline")}:</strong>{" "}
                <span className="font-mono">
                  {currentScheme?.renewalDeadline || "2026-06-30"}
                </span>
                . {t("renewal.renewalNotice")}
              </p>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                onClick={handleRenewal}
                disabled={attendance < 75 || !progressUploaded}
                icon={<RefreshCw size={14} />}
              >
                {t("renewal.submitRenewal")}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={<RefreshCw size={40} className="text-[#94A3B8]" />}
          title={t("renewal.noRenewals")}
          description={t("renewal.subtitle")}
        />
      )}
    </div>
  );
};

export default StudentRenewal;
