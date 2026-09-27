import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Badge,
  StatusBadge,
  Skeleton,
  Modal,
  EmptyState,
} from "../../components/ui";
import { useAppStore } from "../../store";
import { applications, students, disbursals } from "../../mock/data";
import { verifyBankAccount } from "../../services/api";
import {
  Clock,
  Shield,
  CreditCard,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import type { Disbursal } from "../../mock/data";

/* ============================================================
 *  STYLES
 * ============================================================ */
const btnPrimary =
  "bg-[#1B2434] hover:bg-[#1B2434]/90 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-[#0F1622] transition-colors rounded-md font-medium text-xs px-3.5 py-2 inline-flex items-center justify-center gap-1.5 disabled:opacity-50";
const btnOutline =
  "bg-transparent border border-[#1B2434]/15 dark:border-slate-700 text-[#1B2434] dark:text-slate-200 hover:bg-[#1B2434]/5 dark:hover:bg-slate-800 transition-colors rounded-md font-medium text-xs px-3.5 py-2 inline-flex items-center justify-center gap-1.5";

/* ============================================================
 *  MAIN COMPONENT
 * ============================================================ */
export const StudentDisbursal: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [myDisbursals, setMyDisbursals] = useState<Disbursal[]>([]);
  const [showBankVerify, setShowBankVerify] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { addToast } = useAppStore();
  const { t } = useTranslation("student");
  const { t: tc } = useTranslation("common");
  const student = students[0];
  const myAppIds = applications
    .filter((a) => a.studentId === student.id)
    .map((a) => a.id);

  useEffect(() => {
    setTimeout(() => {
      setMyDisbursals(
        disbursals.filter((d) => myAppIds.includes(d.applicationId)),
      );
      setLoading(false);
    }, 400);
  }, []);

  const handleBankVerify = async () => {
    setVerifying(true);
    await verifyBankAccount();
    setVerifying(false);
    setShowBankVerify(false);
    addToast("success", "Bank account verified successfully!");
  };

  if (loading)
    return (
      <div className="p-4 md:p-8 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-64 rounded-md bg-[#1B2434]/5 dark:bg-slate-800" />
      </div>
    );

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto font-sans text-[#1B2434] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1B2434]/10 dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <Landmark
            size={32}
            className="text-[#1B2434] dark:text-slate-300 shrink-0 mt-1"
          />
          <div>
            <h1 className="font-serif text-[28px] md:text-[34px] text-[#1B2434] dark:text-white leading-tight">
              {t("disbursal.title")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t("disbursal.subtitle")}
            </p>
          </div>
        </div>

        {!student.bankVerified && (
          <button
            className={btnOutline}
            onClick={() => setShowBankVerify(true)}
          >
            <CreditCard size={14} /> {t("profile.bankDetails")}
          </button>
        )}
      </div>

      {/* Bank Verification Status Banner */}
      <Card className="border border-[#1B2434]/10 dark:border-slate-800 rounded-md shadow-none bg-white dark:bg-[#0F1622] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`p-2.5 rounded-md ${
                student.bankVerified
                  ? "bg-[#2E6B4F]/10 text-[#2E6B4F] dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1B2434] dark:text-white">
                {t("disbursal.dbtAccount")}: {student.bankName}
              </p>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                A/c: {student.bankAccountNumber} | IFSC: {student.ifscCode}
              </p>
            </div>
          </div>
          <div>
            <Badge
              variant={student.bankVerified ? "success" : "warning"}
              className={`font-mono text-xs ${
                student.bankVerified
                  ? "bg-[#2E6B4F]/10 text-[#2E6B4F] border-[#2E6B4F]/30 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {student.bankVerified
                ? `✓ ${tc("status.verified")}`
                : tc("status.pending")}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Disbursal List */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-[#1B2434] dark:text-white">
          {t("disbursal.title")}
        </h2>

        {myDisbursals.length === 0 ? (
          <EmptyState
            icon={<Clock size={40} className="text-slate-400" />}
            title={t("disbursal.noDisbursals")}
            description={t("disbursal.subtitle")}
          />
        ) : (
          <div className="space-y-3">
            {myDisbursals.map((d) => (
              <Card
                key={d.id}
                className="border border-[#1B2434]/10 dark:border-slate-800 rounded-md shadow-none bg-white dark:bg-[#0F1622] p-5 hover:border-[#1B2434]/25 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-bold text-[#2E6B4F] dark:text-emerald-400">
                        ₹{d.amount.toLocaleString("en-IN")}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 space-x-2">
                      <span>{t("disbursal.utr")}: {d.transactionId}</span>
                      <span>•</span>
                      <span>{tc("common.date")}: {d.date}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 dark:text-slate-500">
                      Ref: {d.bankReference}
                    </p>
                  </div>

                  {d.status === "processed" && (
                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-1.5 text-xs text-[#2E6B4F] dark:text-emerald-400 font-medium bg-[#2E6B4F]/5 dark:bg-emerald-950/20 p-2.5 rounded-md border border-[#2E6B4F]/15">
                      <CheckCircle2 size={16} />
                      <span>{t("disbursal.credited")}</span>
                    </div>
                  )}

                  {d.status === "failed" && (
                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-1 text-xs text-[#B4472A] dark:text-red-400 font-medium bg-[#B4472A]/5 dark:bg-red-950/20 p-2.5 rounded-md border border-[#B4472A]/15">
                      <div className="flex items-center gap-1">
                        <AlertTriangle size={14} />
                        <span>{tc("status.failed")}</span>
                      </div>
                      <span className="text-[11px] text-[#B4472A]/80 dark:text-red-400/80">
                        {t("profile.bankDetails")}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bank Verification Modal */}
      <Modal
        isOpen={showBankVerify}
        onClose={() => setShowBankVerify(false)}
        title={t("profile.bankDetails")}
        size="sm"
      >
        <div className="space-y-5 font-sans text-[#1B2434] dark:text-slate-100">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("disbursal.dbtAccount")}
          </p>

          <div className="p-3.5 rounded-md bg-[#1B2434]/5 dark:bg-slate-800/60 border border-[#1B2434]/10 dark:border-slate-700/60 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Bank:</span>
              <span className="font-semibold">{student.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t("apply.bankAccount")}:
              </span>
              <span className="font-semibold">{student.bankAccountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">
                {t("apply.ifsc")}:
              </span>
              <span className="font-semibold">{student.ifscCode}</span>
            </div>
          </div>

          <button
            onClick={handleBankVerify}
            disabled={verifying}
            className={`${btnPrimary} w-full py-2.5 justify-center`}
          >
            {verifying ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> {tc("common.loading")}
              </>
            ) : (
              <>
                <Shield size={14} /> {tc("actions.confirm")} <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDisbursal;
