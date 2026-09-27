import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Button, Skeleton, Modal } from "../../components/ui";
import { schemes, students } from "../../mock/data";
import { checkEligibility } from "../../services/api";
import { AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
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
          <Skeleton key={i} className="h-48 rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto font-sans text-[#1B2434] dark:text-slate-100">
      {/* Header section */}
      <div className="pb-4 border-b border-[#1B2434]/10 dark:border-slate-800">
        <h1 className="font-serif text-[28px] md:text-[34px] text-[#1B2434] dark:text-white leading-tight">
          {t("schemes.title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("schemes.subtitle")}
        </p>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schemesList.map((rawScheme) => {
          const scheme = getLocalizedScheme(rawScheme, i18n.language);
          return (
            <Card
              key={scheme.id}
              className="border border-[#1B2434]/10 dark:border-slate-800 rounded-md shadow-none transition-colors hover:border-[#9A7B2F] dark:hover:border-amber-400 group p-5 md:p-6 flex flex-col justify-between bg-white dark:bg-[#0F1622]"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[13px] text-[#9A7B2F] dark:text-amber-400 font-medium">
                      {scheme.name}
                    </span>
                    <h2 className="font-serif text-lg text-[#1B2434] dark:text-white mt-0.5">
                      {scheme.fullName}
                    </h2>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-2xl text-[#1B2434] dark:text-white">
                      ₹{scheme.amount.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t("schemes.perYear")}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {scheme.description}
                </p>

                <div className="text-[13px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>{scheme.duration}</span>
                  <span>·</span>
                  <span>{t("schemes.deadline")}: {scheme.deadline}</span>
                  {scheme.renewable && (
                    <>
                      <span>·</span>
                      <span className="text-[#2E6B4F] dark:text-emerald-400">
                        {t("schemes.renewable")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#1B2434]/5 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedScheme(scheme);
                    setEligibilityResult(null);
                    handleEligibilityCheck(scheme.id);
                  }}
                  className="bg-transparent border-[#1B2434]/10 dark:border-slate-700 text-[#1B2434] dark:text-white group-hover:border-[#9A7B2F] dark:group-hover:border-amber-400 transition-colors"
                >
                  {t("schemes.checkEligibility")}
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    navigate("/student/apply", { state: { schemeId: scheme.id } })
                  }
                  className="bg-[#1B2434] hover:bg-[#1B2434]/90 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-[#0F1622] group/btn"
                >
                  {t("schemes.apply")}
                  <ChevronRight
                    size={14}
                    className="ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity"
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
              <h2 className="font-serif text-xl text-[#1B2434] dark:text-white">
                {selectedScheme.fullName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("schemes.awardValue")}:{" "}
                <span className="font-serif text-[#1B2434] dark:text-white font-medium">
                  ₹{selectedScheme.amount.toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            {checkingEligibility ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-6 h-6 border-2 border-[#1B2434] dark:border-slate-300 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("schemes.verifyingCriteria")}
                </p>
              </div>
            ) : eligibilityResult ? (
              <div className="space-y-6">
                {/* Eligibility Status Alert */}
                {eligibilityResult.eligible ? (
                  <div className="p-4 rounded-r-md border-l-[3px] border-l-[#2E6B4F] bg-[#2E6B4F]/[0.04] dark:border-l-emerald-400 dark:bg-emerald-400/10 flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-[#2E6B4F] dark:text-emerald-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#2E6B4F] dark:text-emerald-400">
                        {t("schemes.eligibleToApply")}
                      </p>
                      <p className="text-sm text-[#1B2434]/80 dark:text-slate-300 mt-1">
                        {t("schemes.eligibleDesc")}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-r-md border-l-[3px] border-l-[#B4472A] bg-[#B4472A]/[0.04] dark:border-l-red-500 dark:bg-red-500/10 flex items-start gap-3">
                    <AlertTriangle
                      size={18}
                      className="text-[#B4472A] dark:text-red-400 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#B4472A] dark:text-red-400">
                        {t("schemes.ineligibleTitle")}
                      </p>
                      <p className="text-sm text-[#1B2434]/80 dark:text-slate-300 mt-1">
                        {t("schemes.ineligibleDesc")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Verified Requirements */}
                {eligibilityResult.passedChecks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      {t("schemes.verifiedReqs")}
                    </p>
                    <div className="border border-[#1B2434]/10 dark:border-slate-800 rounded-md divide-y divide-[#1B2434]/10 dark:divide-slate-800 overflow-hidden">
                      {eligibilityResult.passedChecks.map((check, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 text-sm text-[#1B2434] dark:text-slate-200 bg-white dark:bg-[#0F1622]"
                        >
                          <div className="w-5 h-5 rounded-md bg-[#2E6B4F]/[0.10] dark:bg-emerald-400/20 flex items-center justify-center shrink-0">
                            <CheckCircle
                              size={12}
                              className="text-[#2E6B4F] dark:text-emerald-400"
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
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      {t("schemes.unmetReqs")}
                    </p>
                    <div className="border border-[#1B2434]/10 dark:border-slate-800 rounded-md divide-y divide-[#1B2434]/10 dark:divide-slate-800 overflow-hidden">
                      {eligibilityResult.failedChecks.map((check, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 text-sm text-[#1B2434] dark:text-slate-200 bg-white dark:bg-[#0F1622]"
                        >
                          <div className="w-5 h-5 rounded-md bg-[#B4472A]/[0.10] dark:bg-red-500/20 flex items-center justify-center shrink-0">
                            <AlertTriangle
                              size={12}
                              className="text-[#B4472A] dark:text-red-400"
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
                    className="w-full bg-[#1B2434] hover:bg-[#1B2434]/90 text-white dark:bg-white dark:hover:bg-slate-200 dark:text-[#0F1622]"
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
