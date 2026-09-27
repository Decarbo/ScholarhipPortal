import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Badge, Button } from "../../components/ui";
import { LanguageSelector } from "../../components/accessibility";
import { useAppStore } from "../../store";
import { students } from "../../mock/data";
import {
  User,
  ShieldCheck,
  GraduationCap,
  CreditCard,
  Users,
  Globe,
  Mic,
  CheckCircle2,
  Mail,
  Phone,
} from "lucide-react";

export const StudentProfile: React.FC = () => {
  const student = students[0];
  const { addToast, language, setLanguage } = useAppStore();
  const [showBankVerify, setShowBankVerify] = useState(false);
  const { t } = useTranslation("student");
  const { t: tc } = useTranslation("common");

  return (
    <div className="p-4 md:p-8 space-y-8 mx-auto font-sans text-[#1B2434] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1B2434]/10 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <User className="w-8 h-8 text-[#1B2434] dark:text-slate-300 shrink-0 mt-1" />
          <div>
            <h1 className="font-serif text-[28px] md:text-[34px] text-[#1B2434] dark:text-white leading-tight">
              {t("profile.title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal identity details, academic records, bank
              account information, and system preferences.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-[#1B2434]/20 dark:border-slate-700 shadow-sm p-5 md:p-6 space-y-8">
        {/* Identity Summary Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/60 border border-[#1B2434]/15 dark:border-slate-700">
          <div className="w-16 h-16 rounded-full bg-[#1B2434] text-white flex items-center justify-center text-xl font-serif font-bold shrink-0 shadow-sm">
            {student.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="space-y-1 grow">
            <h2 className="text-xl font-serif font-semibold text-[#1B2434] dark:text-white">
              {student.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-mono">
              <span className="flex items-center gap-1">
                <Mail size={12} /> {student.email}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Phone size={12} /> {student.phone}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1.5">
              <Badge
                variant="info"
                className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
              >
                {student.tribeName} Tribe
              </Badge>
              <Badge variant={student.bankVerified ? "success" : "warning"}>
                {student.bankVerified ? `✓ ${tc("status.verified")}` : tc("status.pending")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1B2434]/10 dark:border-slate-800 pb-2">
            <ShieldCheck
              size={18}
              className="text-[#1B2434] dark:text-slate-300"
            />
            <h3 className="font-serif text-lg font-semibold text-[#1B2434] dark:text-white">
              {t("profile.personalDetails")}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Aadhaar", value: student.aadharNumber },
              { label: "ST Certificate", value: student.stCertificateNumber },
              {
                label: `${tc("common.state")} / ${tc("common.district")}`,
                value: `${student.state} / ${student.district}`,
              },
              {
                label: t("apply.income"),
                value: `₹${student.familyIncome.toLocaleString("en-IN")}`,
              },
            ].map((field, i) => (
              <div
                key={i}
                className="p-3.5 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/40 border border-[#1B2434]/10 dark:border-slate-700/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {field.label}
                </p>
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white font-mono mt-0.5">
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Academic Details */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1B2434]/10 dark:border-slate-800 pb-2">
            <GraduationCap
              size={18}
              className="text-[#1B2434] dark:text-slate-300"
            />
            <h3 className="font-serif text-lg font-semibold text-[#1B2434] dark:text-white">
              {t("profile.academicDetails")}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: t("apply.course"), value: student.courseName },
              { label: t("apply.institution"), value: student.institution },
              { label: t("apply.year"), value: `${t("apply.year")} ${student.yearOfStudy}` },
              { label: tc("common.type"), value: student.courseLevel },
            ].map((field, i) => (
              <div
                key={i}
                className="p-3.5 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/40 border border-[#1B2434]/10 dark:border-slate-700/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {field.label}
                </p>
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white mt-0.5">
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Bank Details */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#1B2434]/10 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <CreditCard
                size={18}
                className="text-[#1B2434] dark:text-slate-300"
              />
              <h3 className="font-serif text-lg font-semibold text-[#1B2434] dark:text-white">
                {t("profile.bankDetails")}
              </h3>
            </div>
            {student.bankVerified && (
              <span className="text-xs text-[#2E6B4F] dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> {tc("status.verified")}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Bank", value: student.bankName },
              { label: t("apply.bankAccount"), value: student.bankAccountNumber },
              { label: t("apply.ifsc"), value: student.ifscCode },
              {
                label: "Status",
                value: student.bankVerified ? `✓ ${tc("status.verified")}` : tc("status.pending"),
              },
            ].map((field, i) => (
              <div
                key={i}
                className="p-3.5 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/40 border border-[#1B2434]/10 dark:border-slate-700/60"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {field.label}
                </p>
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white font-mono mt-0.5">
                  {field.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Guardian / Parent Contact */}
        <section className="space-y-3">
          <div className="p-4 md:p-5 rounded-md bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <Users size={18} className="shrink-0" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">
                {t("apply.guardianNotified")}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tc("common.name")}
                </p>
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white">
                  {student.guardianName}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Relation
                </p>
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white">
                  {student.guardianRelation}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tc("common.phone")}
                </p>
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white font-mono">
                  {student.guardianPhone}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tc("common.email")}
                </p>
                <p className="text-sm font-semibold text-[#1B2434] dark:text-white font-mono">
                  {student.guardianEmail || "Not provided"}
                </p>
              </div>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 pt-2 border-t border-blue-200/60 dark:border-blue-800/40">
              {t("apply.guardianAlertNote")}
            </p>
          </div>
        </section>

        {/* Accessibility Preferences */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#1B2434]/10 dark:border-slate-800 pb-2">
            <Globe size={18} className="text-[#1B2434] dark:text-slate-300" />
            <h3 className="font-serif text-lg font-semibold text-[#1B2434] dark:text-white">
              {tc("language.toggle")}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/40 border border-[#1B2434]/10 dark:border-slate-700/60 space-y-2">
              <label className="block text-xs font-semibold text-[#1B2434] dark:text-slate-300">
                {tc("language.toggle")}
              </label>
              <LanguageSelector
                value={language}
                onChange={(code) => {
                  if (code === 'en' || code === 'hi' || code === 'sat') {
                    setLanguage(code as any);
                  }
                  addToast("success", "Language updated!");
                }}
              />
            </div>
            <div className="p-3.5 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/40 border border-[#1B2434]/10 dark:border-slate-700/60 space-y-1">
              <p className="text-xs font-semibold text-[#1B2434] dark:text-slate-300">
                {t("voice.voiceInput")}
              </p>
              <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-[#1B2434] dark:text-white">
                <Mic
                  size={16}
                  className="text-[#2E6B4F] dark:text-emerald-400"
                />
                <span>
                  {student.voiceInputEnabled ? "🎤 Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Update Action */}
        <div className="pt-2">
          <Button
            onClick={() => addToast("success", "Profile updated successfully!")}
          >
            {t("profile.updateProfile")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StudentProfile;
