import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Button, Skeleton, Modal } from "../../components/ui";
import { schemes, students } from "../../mock/data";
import { checkEligibility } from "../../services/api";
import { AlertTriangle, CheckCircle, ChevronRight, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Scheme } from "../../mock/data";
import { getLocalizedScheme } from "../../utils/localizedData";

export const StudentSchemes: React.FC = () => {
  const [schemesList, setSchemesList] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    failedChecks: string[];
    passedChecks: string[];
  } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("student");
  const { t: tc } = useTranslation("common");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSchemesList(schemes);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleEligibilityCheck = async (schemeId: string) => {
    setCheckingEligibility(true);
    const result = await checkEligibility(schemeId, students[0].id);
    setEligibilityResult(result);
    setCheckingEligibility(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4 font-sans">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#1D293D] dark:text-slate-100 animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#DEE2E6] dark:border-slate-800 pb-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#E6F1F5] dark:bg-[#0B75A4]/20 text-[#0B75A4] dark:text-[#1697C5] shrink-0 mt-0.5">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D293D] dark:text-white leading-tight">
              {t("schemes.title")}
            </h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
              {t("schemes.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemesList.map((rawScheme) => {
          const scheme = getLocalizedScheme(rawScheme, i18n.language);
          return (
            <Card
              key={scheme.id}
              className="border border-[#DEE2E6] dark:border-slate-800 rounded-xl shadow-xs transition-all hover:border-[#0B75A4] hover:shadow-md group p-5 md:p-6 flex flex-col justify-between bg-white dark:bg-slate-900"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-[#0B75A4] dark:text-[#1697C5] uppercase tracking-wider">
                      {scheme.name}
                    </span>
                    <h2 className="text-lg font-bold text-[#1D293D] dark:text-white mt-1">
                      {scheme.fullName}
                    </h2>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-[#1D293D] dark:text-white">
                      ₹{scheme.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                      {t("schemes.perYear")}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-[#64748B] dark:text-slate-400 leading-relaxed line-clamp-2">
                  {scheme.description}
                </p>

                <div className="text-xs text-[#64748B] dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{scheme.duration}</span>
                  <span>·</span>
                  <span>{t("schemes.deadline")}: {scheme.deadline}</span>
                  {scheme.renewable && (
                    <>
                      <span>·</span>
                      <span className="text-[#009B68] dark:text-emerald-400 font-semibold">
                        {t("schemes.renewable")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#DEE2E6] dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedScheme(scheme);
                    setEligibilityResult(null);
                    handleEligibilityCheck(scheme.id);
                  }}
                  className="hover:border-[#0B75A4] hover:text-[#0B75A4]"
                >
                  {t("schemes.checkEligibility")}
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    navigate("/student/apply", { state: { schemeId: scheme.id } })
                  }
                  className="group/btn"
                >
                  {t("schemes.apply")}
                  <ChevronRight
                    size={14}
                    className="ml-1 opacity-70 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all"
                  />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Eligibility Check Modal */}
      <Modal
        isOpen={!!selectedScheme}
        onClose={() => setSelectedScheme(null)}
        title={`${t("schemes.eligibilityCheck")} · ${selectedScheme?.name}`}
        size="lg"
      >
        {selectedScheme && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#1D293D] dark:text-white">
                {selectedScheme.fullName}
              </h2>
              <p className="text-sm text-[#64748B] dark:text-slate-400 mt-1">
                {t("schemes.awardValue")}:{" "}
                <span className="text-[#1D293D] dark:text-white font-bold">
                  ₹{selectedScheme.amount.toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            {checkingEligibility ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#0B75A4] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-[#64748B] dark:text-slate-400">
                  {t("schemes.verifyingCriteria")}
                </p>
              </div>
            ) : eligibilityResult ? (
              <div className="space-y-6">
                {/* Eligibility Status Alert */}
                {eligibilityResult.eligible ? (
                  <div className="p-4 rounded-xl border border-[#009B68]/30 bg-[#009B68]/10 dark:bg-emerald-950/20 flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="text-[#009B68] dark:text-emerald-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#009B68] dark:text-emerald-400">
                        {t("schemes.eligibleToApply")}
                      </p>
                      <p className="text-sm text-[#1D293D]/90 dark:text-slate-300 mt-1">
                        {t("schemes.eligibleDesc")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 dark:bg-red-950/20 flex items-start gap-3">
                    <AlertTriangle
                      size={20}
                      className="text-[#EF4444] dark:text-red-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#EF4444] dark:text-red-400">
                        {t("schemes.ineligibleTitle")}
                      </p>
                      <p className="text-sm text-[#1D293D]/90 dark:text-slate-300 mt-1">
                        {t("schemes.ineligibleDesc")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Verified Requirements */}
                {eligibilityResult.passedChecks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                      {t("schemes.verifiedReqs")}
                    </p>
                    <div className="border border-[#DEE2E6] dark:border-slate-800 rounded-xl divide-y divide-[#DEE2E6] dark:divide-slate-800 overflow-hidden">
                      {eligibilityResult.passedChecks.map((check, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3.5 text-sm text-[#1D293D] dark:text-slate-200 bg-white dark:bg-slate-900"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#009B68]/15 dark:bg-emerald-400/20 flex items-center justify-center shrink-0">
                            <CheckCircle
                              size={13}
                              className="text-[#009B68] dark:text-emerald-400"
                            />
                          </div>
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unmet Requirements */}
                {eligibilityResult.failedChecks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                      {t("schemes.unmetReqs")}
                    </p>
                    <div className="border border-[#DEE2E6] dark:border-slate-800 rounded-xl divide-y divide-[#DEE2E6] dark:divide-slate-800 overflow-hidden">
                      {eligibilityResult.failedChecks.map((check, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3.5 text-sm text-[#1D293D] dark:text-slate-200 bg-white dark:bg-slate-900"
                        >
                          <div className="w-5 h-5 rounded-full bg-[#EF4444]/15 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                            <AlertTriangle
                              size={13}
                              className="text-[#EF4444] dark:text-red-400"
                            />
                          </div>
                          <span>{check}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {eligibilityResult.eligible && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setSelectedScheme(null);
                      navigate("/student/apply", {
                        state: { schemeId: selectedScheme.id },
                      });
                    }}
                  >
                    {t("schemes.proceedToApply")}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentSchemes;
