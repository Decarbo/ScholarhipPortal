import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  Badge,
  StatusBadge,
  Skeleton,
  Modal,
  EmptyState,
  Button,
} from "../../components/ui";
import { useAppStore } from "../../store";
import { applications, students, disbursals } from "../../mock/data";
import { verifyBankAccount } from "../../services/api";
import {
  Clock,
  CreditCard,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import type { Disbursal } from "../../mock/data";

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
      <div className="p-4 md:p-6 lg:p-8 space-y-4 max-w-5xl mx-auto">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#7EC5E2] shrink-0 mt-0.5">
            <Landmark size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t("disbursal.title")}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
              {t("disbursal.subtitle")}
            </p>
          </div>
        </div>

        {!student.bankVerified && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBankVerify(true)}
            icon={<CreditCard size={14} />}
          >
            {t("profile.bankDetails")}
          </Button>
        )}
      </div>

      {/* Bank Verification Status Banner */}
      <Card className="border border-[#DEE2E6] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`p-2.5 rounded-lg ${
                student.bankVerified
                  ? "bg-[#009B68]/12 text-[#006045] dark:text-[#38C88B]"
                  : "bg-[#FEF3C7] text-[#B45309]"
              }`}
            >
              <CreditCard size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1D293D] dark:text-white">
                {t("disbursal.dbtAccount")}: {student.bankName}
              </p>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5 font-mono">
                A/c: {student.bankAccountNumber} | IFSC: {student.ifscCode}
              </p>
            </div>
          </div>
          <div>
            <Badge
              variant={student.bankVerified ? "success" : "warning"}
              className="text-xs"
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
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-[#1D293D] dark:text-white">
            Disbursal History
          </h2>
          <span className="text-xs text-[#64748B]">DBT Direct Beneficiary Transfer records</span>
        </div>

        {myDisbursals.length === 0 ? (
          <EmptyState
            icon={<Clock size={36} className="text-[#94A3B8]" />}
            title={t("disbursal.noDisbursals")}
            description={t("disbursal.subtitle")}
          />
        ) : (
          <div className="space-y-3">
            {myDisbursals.map((d) => (
              <Card
                key={d.id}
                className="border border-[#DEE2E6] dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 p-5 shadow-xs hover:border-[#0B75A4]/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-bold text-[#009B68] dark:text-[#38C88B]">
                        ₹{d.amount.toLocaleString("en-IN")}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-slate-400 space-x-2 font-mono">
                      <span>{t("disbursal.utr")}: {d.transactionId}</span>
                      <span>•</span>
                      <span>{tc("common.date")}: {d.date}</span>
                    </div>
                    <p className="text-xs text-[#94A3B8] font-mono">
                      Ref: {d.bankReference}
                    </p>
                  </div>

                  {d.status === "processed" && (
                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-1 text-xs text-[#006045] dark:text-[#38C88B] font-semibold bg-[#009B68]/10 dark:bg-[#009B68]/15 px-3 py-2 rounded-lg border border-[#009B68]/25">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 size={15} />
                        <span>{t("disbursal.credited")}</span>
                      </div>
                    </div>
                  )}

                  {d.status === "failed" && (
                    <div className="sm:text-right flex sm:flex-col items-center sm:items-end gap-1 text-xs text-[#B91C1C] dark:text-[#F87171] font-semibold bg-[#FEE2E2] dark:bg-[#EF4444]/15 px-3 py-2 rounded-lg border border-[#EF4444]/30">
                      <div className="flex items-center gap-1">
                        <AlertTriangle size={15} />
                        <span>{tc("status.failed")}</span>
                      </div>
                      <span className="text-[11px] font-normal text-[#64748B]">
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
        <div className="space-y-4 font-sans text-[#1D293D] dark:text-slate-100">
          <p className="text-xs text-[#64748B] dark:text-slate-300 leading-relaxed">
            {t("disbursal.dbtAccount")}
          </p>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#DEE2E6] dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Bank:</span>
              <span className="font-semibold text-[#1D293D] dark:text-white">{student.bankName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">
                {t("apply.bankAccount")}:
              </span>
              <span className="font-semibold text-[#1D293D] dark:text-white font-mono">{student.bankAccountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">
                {t("apply.ifsc")}:
              </span>
              <span className="font-semibold text-[#1D293D] dark:text-white font-mono">{student.ifscCode}</span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleBankVerify}
            loading={verifying}
            className="w-full"
          >
            Verify Bank Account
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDisbursal;
