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
    <div className="p-4 md:p-8 space-y-8 mx-auto font-sans text-[#1B2434] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1B2434]/10 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <RotateCw
            size={32}
            className="text-[#1B2434] dark:text-slate-300 shrink-0 mt-1"
          />
          <div>
            <h1 className="font-serif text-[28px] md:text-[34px] text-[#1B2434] dark:text-white leading-tight">
              {t("renewal.title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("renewal.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {prevApp ? (
        <Card className="border-[#1B2434]/20 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-6">
          {/* Active Scholarship Summary */}
          <div className="p-4 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/60 border border-[#1B2434]/15 dark:border-slate-700">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <p className="text-sm font-semibold text-[#1B2434] dark:text-white">
                {t("tracker.scheme")}: {getLocalizedSchemeName(prevApp.schemeName, i18n.language)}
              </p>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2E6B4F]/10 text-[#2E6B4F] dark:bg-emerald-900/30 dark:text-emerald-300 border border-[#2E6B4F]/20 dark:border-emerald-800/50">
                {tc("status.selected")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono mt-2">
              <span>{tc("common.amount")}: ₹{prevApp.amount.toLocaleString("en-IN")}</span>
              <span>•</span>
              <span>{t("tracker.enrolmentConfirmed")}: {prevApp.enrolmentDate || "N/A"}</span>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="font-serif text-xl font-semibold text-[#1B2434] dark:text-white border-b border-[#1B2434]/10 dark:border-slate-800 pb-2">
              {t("apply.personalInfo")}
            </h3>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1B2434] dark:text-slate-300 mb-1">
                  {tc("common.name")}
                </label>
                <input
                  type="text"
                  defaultValue={student.name}
                  readOnly
                  className="w-full px-3 py-2 rounded-md border border-[#1B2434]/15 dark:border-slate-700 bg-[#1B2434]/5 dark:bg-slate-800/50 text-xs text-[#1B2434]/80 dark:text-slate-300 outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B2434] dark:text-slate-300 mb-1">
                  {t("apply.course")}
                </label>
                <input
                  type="text"
                  defaultValue={student.courseName}
                  className="w-full px-3 py-2 rounded-md border border-[#1B2434]/20 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1B2434] dark:text-white outline-none focus:ring-2 focus:ring-[#1B2434]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B2434] dark:text-slate-300 mb-1">
                  {t("apply.year")}
                </label>
                <input
                  type="number"
                  defaultValue={student.yearOfStudy + 1}
                  className="w-full px-3 py-2 rounded-md border border-[#1B2434]/20 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1B2434] dark:text-white outline-none focus:ring-2 focus:ring-[#1B2434]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1B2434] dark:text-slate-300 mb-1">
                  {t("apply.percentage")}
                </label>
                <input
                  type="number"
                  defaultValue="72"
                  className="w-full px-3 py-2 rounded-md border border-[#1B2434]/20 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-[#1B2434] dark:text-white outline-none focus:ring-2 focus:ring-[#1B2434]"
                />
              </div>
            </div>

            {/* Attendance & Progress Callout */}
            <div className="p-4 md:p-5 rounded-md bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300">
                <FileCheck size={18} className="shrink-0" />
                <h4 className="text-xs font-semibold uppercase tracking-wider">
                  {t("renewal.progressReport")}
                </h4>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-900 dark:text-amber-300 mb-1">
                    {t("renewal.attendance")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-xs text-[#1B2434] dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  {attendance < 75 && (
                    <p className="text-xs text-[#B4472A] dark:text-red-400 mt-1.5 flex items-center gap-1">
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
                    <div className="flex items-center gap-2 p-2.5 rounded-md bg-[#2E6B4F]/10 dark:bg-emerald-900/20 border border-[#2E6B4F]/20 dark:border-emerald-800">
                      <CheckCircle2
                        size={16}
                        className="text-[#2E6B4F] dark:text-emerald-400"
                      />
                      <span className="text-xs font-medium text-[#2E6B4F] dark:text-emerald-300">
                        {tc("status.verified")} ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Deadline Banner */}
            <div className="p-3.5 rounded-md bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 flex items-center gap-2.5">
              <Clock
                size={16}
                className="text-purple-700 dark:text-purple-400 shrink-0"
              />
              <p className="text-xs text-purple-800 dark:text-purple-300">
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
          icon={<RefreshCw size={40} className="text-slate-400" />}
          title={t("renewal.noRenewals")}
          description={t("renewal.subtitle")}
        />
      )}
    </div>
  );
};

export default StudentRenewal;
