const fs = require('fs');
const path = require('path');

const localesDir = path.join(process.cwd(), 'src/i18n/locales');

// Helper to deep merge
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

// Data additions for English
const enAdditions = {
  student: {
    schemes: {
      subtitle: "Review requirements and check your eligibility before submitting an application.",
      perYear: "per academic year",
      renewable: "Renewable award",
      checkEligibility: "Check eligibility",
      eligibilityCheck: "Eligibility check",
      awardValue: "Award value",
      verifyingCriteria: "Verifying records against scheme criteria...",
      eligibleToApply: "You are eligible to apply",
      eligibleDesc: "Your profile meets all specified eligibility requirements for this scheme.",
      ineligibleTitle: "Ineligible based on record review",
      ineligibleDesc: "Your current profile does not satisfy one or more conditions for this award.",
      verifiedReqs: "Verified requirements",
      unmetReqs: "Unmet requirements",
      proceedToApply: "Proceed to application"
    },
    apply: {
      subtitle: "Fill in the details to apply for a scholarship scheme",
      liveServer: "Live server",
      demoMode: "Demo mode",
      stepScheme: "Scheme",
      stepPersonal: "Personal Details",
      stepDocs: "Documents",
      stepReview: "Review",
      prefilledNote: "💡 These details are pre-filled from your profile. Edit only if needed. Changes will update your profile too.",
      saveDraft: "Save Draft",
      fromVault: "📁 Select from your Document Vault (no re-upload needed):",
      uploadNew: "📤 Upload new documents:",
      dragDropNote: "Drag & drop or click — JPG/PNG/WEBP/PDF, max 5 MB each",
      remove: "Remove",
      staged: "Staged",
      guardianNotified: "Guardian notified",
      guardianAlertNote: "📱 Your guardian will receive SMS/email alerts about this application's status.",
      submitApplication: "Submit Application",
      submitting: "Submitting…",
      applicant: "Applicant",
      draftId: "Draft ID"
    },
    tracker: {
      steps: {
        submitted: "Submitted",
        underScrutiny: "Under Scrutiny",
        screening: "Screening",
        result: "Result"
      },
      deficiencyPending: "Deficiency notice pending",
      enrolmentConfirmed: "Enrolment Confirmed",
      confirmEnrolment: "Confirm Enrolment",
      downloadAck: "Download Acknowledgement",
      aiScore: "AI Verification Score",
      viewDoc: "View Document",
      reupload: "Re-upload Document"
    },
    vault: {
      title: "Document Vault",
      subtitle: "Secure storage for all your educational and identity documents",
      uploadNew: "Upload New Document",
      verified: "Verified",
      pending: "Pending",
      flagged: "Action Needed",
      aiScore: "AI Integrity Score",
      deleteConfirm: "Are you sure you want to delete this document?"
    },
    renewal: {
      subtitle: "Renew your scholarship for the ongoing academic year",
      attendance: "Attendance Percentage",
      progressReport: "Academic Progress Report",
      uploadProgress: "Upload Marksheet / Progress Card",
      submitRenewal: "Submit Renewal Application",
      renewalNotice: "⏰ Renewal deadline approaching! Keep attendance above 75%."
    },
    disbursal: {
      subtitle: "Direct Benefit Transfer (DBT) payment logs and transaction status",
      dbtAccount: "Aadhaar Linked DBT Account",
      utr: "UTR / Transaction Ref",
      credited: "Credited",
      processing: "Processing",
      totalDisbursed: "Total Disbursed",
      nextDisbursal: "Next Scheduled Disbursal"
    },
    voice: {
      listening: "Listening... Speak now",
      voiceInput: "Voice input",
      clickToUse: "Click to use voice input"
    }
  },
  admin: {
    dashboard: {
      controlCenter: "Administrative Control Center",
      controlSubtitle: "Monitor, review, and advance scholarship applications across schemes and regions.",
      signedInAs: "Signed in as",
      scopedTo: "Scoped to",
      resetDemo: "Reset demo",
      audit: "Audit",
      totalApplications: "Total Applications",
      pendingReview: "Pending Review",
      aiFlags: "AI Flags",
      selected: "Selected",
      registeredStudents: "Registered Students",
      searchPlaceholder: "Search by student name, application ID, or scheme...",
      allStates: "All States",
      allSchemes: "All Schemes",
      allStatuses: "All Statuses",
      selectAll: "Select All",
      bulkActions: "Bulk Actions",
      advanceStatus: "Advance Status",
      sanction: "Sanction",
      disburse: "Disburse",
      reject: "Reject",
      requestInfo: "Request Info",
      demoRestored: "Demo data restored",
      actions: "Actions",
      applicationDetails: "Application Details",
      adminRemarks: "Admin Remarks",
      aiAssistance: "AI Recommendation"
    }
  },
  government: {
    dashboard: {
      executiveTitle: "Executive Dashboard",
      ministrySubtitle: "Ministry of Tribal Affairs — Scholarship Overview",
      exportReport: "Export Report",
      totalApplications: "Total Applications",
      verified: "Verified",
      selected: "Selected",
      disbursed: "Disbursed",
      pending: "Pending",
      monthlyTrend: "Monthly Application Trend",
      categoryDistribution: "Category Distribution",
      stateBreakdown: "State-wise Application Breakdown",
      applications: "Applications",
      processed: "Processed"
    },
    performance: {
      title: "Scheme Performance",
      subtitle: "Utilization, processing time, and efficiency metrics",
      utilized: "utilized",
      utilizationRate: "Utilization Rate",
      avgProcessingTime: "Avg Processing Time",
      dropOffRate: "Drop-off Rate",
      days: "days"
    },
    budget: {
      title: "Budget Tracker",
      subtitle: "Allocation vs disbursal across all schemes",
      totalAllocated: "Total Allocated",
      totalDisbursed: "Total Disbursed",
      totalRemaining: "Remaining Budget",
      disbursed: "disbursed",
      allocated: "Allocated",
      remaining: "Remaining"
    },
    reports: {
      title: "Reports & Exports",
      subtitle: "Download analytical reports and data exports",
      generateCustom: "Generate Custom Report",
      download: "Download"
    }
  },
  common: {
    months: {
      jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun",
      jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec"
    },
    days: "days",
    hours: "hours",
    minutes: "minutes"
  }
};

// Hindi additions
const hiAdditions = {
  student: {
    schemes: {
      subtitle: "आवेदन जमा करने से पहले आवश्यकताओं की समीक्षा करें और अपनी पात्रता जांचें।",
      perYear: "प्रति शैक्षणिक वर्ष",
      renewable: "नवीकरणीय पुरस्कार",
      checkEligibility: "पात्रता जांचें",
      eligibilityCheck: "पात्रता जांच",
      awardValue: "पुरस्कार राशि",
      verifyingCriteria: "योजना मापदंडों के अनुसार रिकॉर्ड सत्यापित किए जा रहे हैं...",
      eligibleToApply: "आप आवेदन करने के पात्र हैं",
      eligibleDesc: "आपकी प्रोफ़ाइल इस योजना की सभी निर्दिष्ट पात्रता शर्तों को पूरा करती है।",
      ineligibleTitle: "रिकॉर्ड समीक्षा के आधार पर अपात्र",
      ineligibleDesc: "आपकी वर्तमान प्रोफ़ाइल इस योजना की एक या अधिक शर्तों को पूरा नहीं करती है।",
      verifiedReqs: "सत्यापित आवश्यकताएँ",
      unmetReqs: "अपूर्ण आवश्यकताएँ",
      proceedToApply: "आवेदन की ओर आगे बढ़ें"
    },
    apply: {
      subtitle: "छात्रवृत्ति योजना के लिए आवेदन करने हेतु विवरण भरें",
      liveServer: "लाइव सर्वर",
      demoMode: "डेमो मोड",
      stepScheme: "योजना",
      stepPersonal: "व्यक्तिगत विवरण",
      stepDocs: "दस्तावेज़",
      stepReview: "समीक्षा",
      prefilledNote: "💡 ये विवरण आपकी प्रोफ़ाइल से स्वतः भरे गए हैं। आवश्यकता होने पर ही संपादित करें।",
      saveDraft: "ड्राफ्ट सहेजें",
      fromVault: "📁 अपने दस्तावेज़ वॉल्ट से चुनें (पुनः अपलोड की आवश्यकता नहीं):",
      uploadNew: "📤 नए दस्तावेज़ अपलोड करें:",
      dragDropNote: "खींचें और छोड़ें या क्लिक करें — JPG/PNG/WEBP/PDF, अधिकतम 5 MB",
      remove: "हटाएं",
      staged: "तैयार",
      guardianNotified: "अभिभावक को सूचित किया गया",
      guardianAlertNote: "📱 आपके अभिभावक को इस आवेदन की स्थिति के बारे में SMS/ईमेल सूचनाएं प्राप्त होंगी।",
      submitApplication: "आवेदन जमा करें",
      submitting: "जमा हो रहा है…",
      applicant: "आवेदक",
      draftId: "ड्राफ्ट ID"
    },
    tracker: {
      steps: {
        submitted: "जमा किया गया",
        underScrutiny: "जांच के अधीन",
        screening: "स्क्रीनिंग",
        result: "परिणाम"
      },
      deficiencyPending: "दस्तावेज़ कमी की सूचना लंबित",
      enrolmentConfirmed: "नामांकन की पुष्टि हो गई",
      confirmEnrolment: "नामांकन की पुष्टि करें",
      downloadAck: "पावती डाउनलोड करें",
      aiScore: "एआई सत्यापन स्कोर",
      viewDoc: "दस्तावेज़ देखें",
      reupload: "दस्तावेज़ पुनः अपलोड करें"
    },
    vault: {
      title: "दस्तावेज़ वॉल्ट",
      subtitle: "आपके सभी शैक्षिक और पहचान दस्तावेज़ों के लिए सुरक्षित भंडारण",
      uploadNew: "नया दस्तावेज़ अपलोड करें",
      verified: "सत्यापित",
      pending: "लंबित",
      flagged: "कार्रवाई आवश्यक",
      aiScore: "एआई सत्यनिष्ठा स्कोर",
      deleteConfirm: "क्या आप वाकई इस दस्तावेज़ को हटाना चाहते हैं?"
    },
    renewal: {
      subtitle: "वर्तमान शैक्षणिक वर्ष के लिए अपनी छात्रवृत्ति का नवीनीकरण करें",
      attendance: "उपस्थिति प्रतिशत",
      progressReport: "शैक्षणिक प्रगति रिपोर्ट",
      uploadProgress: "अंकसूची / प्रगति पत्र अपलोड करें",
      submitRenewal: "नवीनीकरण आवेदन जमा करें",
      renewalNotice: "⏰ नवीनीकरण की अंतिम तिथि निकट है! उपस्थिति 75% से ऊपर रखें।"
    },
    disbursal: {
      subtitle: "प्रत्यक्ष लाभ अंतरण (DBT) भुगतान लॉग और लेनदेन की स्थिति",
      dbtAccount: "आधार से जुड़ा डीबीटी बैंक खाता",
      utr: "यूटीआर / लेनदेन संदर्भ",
      credited: "जमा हो गया",
      processing: "प्रक्रिया जारी",
      totalDisbursed: "कुल संवितरित",
      nextDisbursal: "अगला निर्धारित संवितरण"
    },
    voice: {
      listening: "सुन रहे हैं... अब बोलें",
      voiceInput: "आवाज़ इनपुट",
      clickToUse: "आवाज़ इनपुट का उपयोग करने के लिए क्लिक करें"
    }
  },
  admin: {
    dashboard: {
      controlCenter: "प्रशासनिक नियंत्रण केंद्र",
      controlSubtitle: "सभी योजनाओं और राज्यों में छात्रवृत्ति आवेदनों की निगरानी, समीक्षा और अनुमोदन करें।",
      signedInAs: "साइन इन:",
      scopedTo: "क्षेत्र:",
      resetDemo: "डेमो रीसेट",
      audit: "ऑडिट",
      totalApplications: "कुल आवेदन",
      pendingReview: "समीक्षा लंबित",
      aiFlags: "एआई फ़्लैग",
      selected: "चयनित",
      registeredStudents: "पंजीकृत छात्र",
      searchPlaceholder: "छात्र का नाम, आवेदन संख्या या योजना खोजें...",
      allStates: "सभी राज्य",
      allSchemes: "सभी योजनाएँ",
      allStatuses: "सभी स्थितियाँ",
      selectAll: "सभी चुनें",
      bulkActions: "सामूहिक कार्रवाई",
      advanceStatus: "स्थिति आगे बढ़ाएं",
      sanction: "स्वीकृत करें",
      disburse: "संवितरित करें",
      reject: "अस्वीकार करें",
      requestInfo: "जानकारी मांगें",
      demoRestored: "डेमो डेटा पुनर्स्थापित किया गया",
      actions: "कार्रवाइयां",
      applicationDetails: "आवेदन विवरण",
      adminRemarks: "प्रशासक टिप्पणी",
      aiAssistance: "एआई सिफ़ारिश"
    }
  },
  government: {
    dashboard: {
      executiveTitle: "कार्यकारी डैशबोर्ड",
      ministrySubtitle: "जनजातीय कार्य मंत्रालय — छात्रवृत्ति अवलोकन",
      exportReport: "रिपोर्ट निर्यात करें",
      totalApplications: "कुल आवेदन",
      verified: "सत्यापित",
      selected: "चयनित",
      disbursed: "संवितरित",
      pending: "लंबित",
      monthlyTrend: "मासिक आवेदन रुझान",
      categoryDistribution: "श्रेणीवार वितरण",
      stateBreakdown: "राज्यवार आवेदन विवरण",
      applications: "आवेदन",
      processed: "संसाधित"
    },
    performance: {
      title: "योजना प्रदर्शन",
      subtitle: "उपयोगिता, प्रसंस्करण समय और दक्षता मेट्रिक्स",
      utilized: "उपयोग किया गया",
      utilizationRate: "उपयोगिता दर",
      avgProcessingTime: "औसत प्रसंस्करण समय",
      dropOffRate: "ड्रॉप-ऑफ दर",
      days: "दिन"
    },
    budget: {
      title: "बजट ट्रैकर",
      subtitle: "सभी योजनाओं में आवंटन बनाम संवितरण",
      totalAllocated: "कुल आवंटित",
      totalDisbursed: "कुल संवितरित",
      totalRemaining: "शेष बजट",
      disbursed: "संवितरित",
      allocated: "आवंटित",
      remaining: "शेष"
    },
    reports: {
      title: "रिपोर्ट और निर्यात",
      subtitle: "विश्लेषणात्मक रिपोर्ट और डेटा निर्यात डाउनलोड करें",
      generateCustom: "कस्टम रिपोर्ट तैयार करें",
      download: "डाउनलोड"
    }
  },
  common: {
    months: {
      jan: "जन", feb: "फर", mar: "मार्च", apr: "अप्रै", may: "मई", jun: "जून",
      jul: "जुला", aug: "अग", sep: "सित", oct: "अक्टू", nov: "नव", dec: "दिस"
    },
    days: "दिन",
    hours: "घंटे",
    minutes: "मिनट"
  }
};

// Santhali (Ol Chiki) additions
const satAdditions = {
  student: {
    schemes: {
      subtitle: "ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱡᱚᱢᱟ ᱢᱟᱲᱟᱝ ᱨᱮ ᱱᱤᱭᱚᱢ ᱠᱚ ᱧᱮᱞ ᱢᱮ ᱟᱨ ᱟᱢᱟᱜ ᱭᱚᱜᱭᱚᱛᱟ ᱯᱚᱨᱚᱠᱷ ᱢᱮ᱾",
      perYear: "ᱥᱮᱪᱮᱫ ᱵᱚᱪᱷᱚᱨ ᱯᱤᱪᱷᱤ",
      renewable: "ᱱᱟᱣᱟ ᱛᱮᱭᱟᱨ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ",
      checkEligibility: "ᱭᱚᱜᱭᱚᱛᱟ ᱯᱚᱨᱚᱠᱷ",
      eligibilityCheck: "ᱭᱚᱜᱭᱚᱛᱟ ᱯᱚᱨᱚᱠᱷ",
      awardValue: "ᱴᱟᱠᱟ ᱨᱮᱭᱟᱜ ᱢᱟᱱ",
      verifyingCriteria: "ᱥᱠᱤᱢ ᱱᱤᱭᱚᱢ ᱞᱮᱠᱟᱛᱮ ᱨᱮᱠᱚᱨᱰ ᱡᱟᱸᱪ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ...",
      eligibleToApply: "ᱟᱢ ᱫᱚ ᱟᱯᱞᱟᱭ ᱞᱟᱹᱜᱤᱫ ᱭᱚᱜᱭᱚ ᱜᱮᱭᱟᱢ",
      eligibleDesc: "ᱟᱢᱟᱜ ᱯᱨᱚᱯᱷᱟᱭᱤᱞ ᱱᱚᱶᱟ ᱥᱠᱤᱢ ᱨᱮᱭᱟᱜ ᱡᱚᱛᱚ ᱱᱤᱭᱚᱢ ᱯᱩᱨᱟᱹᱣᱮᱫᱟ᱾",
      ineligibleTitle: "ᱨᱮᱠᱚᱨᱰ ᱧᱮᱞ ᱠᱟᱛᱮ ᱵᱟᱝ ᱭᱚᱜᱭᱚ",
      ineligibleDesc: "ᱟᱢᱟᱜ ᱱᱤᱛᱚᱜᱟᱜ ᱯᱨᱚᱯᱷᱟᱭᱤᱞ ᱱᱚᱶᱟ ᱥᱠᱤᱢ ᱨᱮᱭᱟᱜ ᱡᱟᱦᱟᱸᱱ ᱱᱤᱭᱚᱢ ᱵᱟᱝ ᱯᱩᱨᱟᱹᱣᱮᱫᱟ᱾",
      verifiedReqs: "ᱥᱚᱛᱭᱟᱯᱤᱛ ᱱᱤᱭᱚᱢ ᱠᱚ",
      unmetReqs: "ᱵᱟᱝ ᱯᱩᱨᱟᱹᱣ ᱱᱤᱭᱚᱢ ᱠᱚ",
      proceedToApply: "ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱥᱮᱫ ᱞᱟᱦᱟᱜ ᱢᱮ"
    },
    apply: {
      subtitle: "ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱥᱠᱤᱢ ᱞᱟᱹᱜᱤᱫ ᱟᱯᱞᱟᱭ ᱞᱟᱹᱜᱤᱫ ᱵᱤᱵᱚᱨᱚᱱ ᱯᱮᱨᱮᱡ ᱢᱮ",
      liveServer: "ᱞᱟᱭᱤᱵᱷ ᱥᱟᱨᱵᱷᱟᱨ",
      demoMode: "ᱰᱮᱢᱚ ᱢᱚᱰ",
      stepScheme: "ᱥᱠᱤᱢ",
      stepPersonal: "ᱟᱯᱱᱟᱨ ᱵᱤᱵᱚᱨᱚᱱ",
      stepDocs: "ᱫᱚᱞᱤᱞ ᱠᱚ",
      stepReview: "ᱧᱮᱞ ᱨᱩᱣᱟᱹᱲ",
      prefilledNote: "💡 ᱱᱚᱶᱟ ᱵᱤᱵᱚᱨᱚᱱ ᱟᱢᱟᱜ ᱯᱨᱚᱯᱷᱟᱭᱤᱞ ᱠᱷᱚᱱ ᱟᱯᱱᱟᱨ ᱛᱮ ᱯᱮᱨᱮᱡ ᱟᱠᱟᱱᱟ᱾ ᱫᱚᱨᱠᱟᱨ ᱨᱮᱜᱮ ᱵᱚᱫᱚᱞ ᱢᱮ᱾",
      saveDraft: "ᱰᱨᱟᱯᱷᱴ ᱥᱟᱸᱪᱟᱣ",
      fromVault: "📁 ᱟᱢᱟᱜ ᱫᱚᱞᱤᱞ ᱵᱷᱳᱞᱴ ᱠᱷᱚᱱ ᱵᱟᱪᱷᱟᱣ ᱢᱮ (ᱟᱨᱦᱚᱸ ᱟᱯᱞᱚᱰ ᱵᱟᱝ ᱞᱟᱹᱠᱛᱤ):",
      uploadNew: "📤 ᱱᱟᱣᱟ ᱫᱚᱞᱤᱞ ᱟᱯᱞᱚᱰ ᱢᱮ:",
      dragDropNote: "ᱚᱨ ᱟᱹᱜᱩ ᱟᱨ ᱜᱤᱰᱤ ᱥᱮ ᱚᱛᱟᱭ ᱢᱮ — JPG/PNG/WEBP/PDF, ᱡᱟᱹᱥᱛᱤ ᱕ MB",
      remove: "ᱚᱪᱚᱜ",
      staged: "ᱥᱟᱯᱲᱟᱣ",
      guardianNotified: "ᱟᱵᱷᱤᱵᱷᱟᱵᱚᱠ ᱵᱟᱰᱟᱭ ᱦᱩᱭᱱᱟ",
      guardianAlertNote: "📱 ᱟᱢᱤᱡ ᱟᱵᱷᱤᱵᱷᱟᱵᱚᱠ ᱱᱚᱶᱟ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱥᱴᱮᱴᱟᱥ ᱨᱮᱭᱟᱜ SMS/ᱤᱢᱮᱞ ᱧᱟᱢᱟᱭ᱾",
      submitApplication: "ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱡᱚᱢᱟ ᱢᱮ",
      submitting: "ᱡᱚᱢᱟᱜ ᱠᱟᱱᱟ…",
      applicant: "ᱟᱯᱞᱟᱭᱤᱡ",
      draftId: "ᱰᱨᱟᱯᱷᱴ ID"
    },
    tracker: {
      steps: {
        submitted: "ᱡᱚᱢᱟ ᱦᱩᱭᱱᱟ",
        underScrutiny: "ᱡᱟᱸᱪ ᱨᱮ ᱢᱮᱱᱟᱜ",
        screening: "ᱥᱠᱨᱤᱱᱤᱝ",
        result: "ᱚᱨᱡᱚ"
      },
      deficiencyPending: "ᱫᱚᱞᱤᱞ ᱠᱚᱢ ᱨᱮᱭᱟᱜ ᱵᱟᱰᱟᱭ ᱛᱤᱝᱜᱩ ᱢᱮᱱᱟᱜ",
      enrolmentConfirmed: "ᱧᱩᱛᱩᱢ ᱚᱞ ᱯᱟᱹᱠᱟᱹ ᱦᱩᱭᱱᱟ",
      confirmEnrolment: "ᱧᱩᱛᱩᱢ ᱚᱞ ᱯᱟᱹᱠᱟᱹᱭ ᱢᱮ",
      downloadAck: "ᱯᱟᱣᱛᱤ ᱰᱟᱩᱱᱞᱚᱰ ᱢᱮ",
      aiScore: "AI ᱡᱟᱸᱪ ᱥᱠᱳᱨ",
      viewDoc: "ᱫᱚᱞᱤᱞ ᱧᱮᱞ",
      reupload: "ᱫᱚᱞᱤᱞ ᱟᱨᱦᱚᱸ ᱟᱯᱞᱚᱰ"
    },
    vault: {
      title: "ᱫᱚᱞᱤᱞ ᱵᱷᱳᱞᱴ",
      subtitle: "ᱟᱢᱟᱜ ᱥᱮᱪᱮᱫ ᱟᱨ ᱩᱯᱨᱩᱢ ᱫᱚᱞᱤᱞ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱡᱚᱛᱚᱱ ᱫᱚᱦᱚ ᱴᱷᱟᱶ",
      uploadNew: "ᱱᱟᱣᱟ ᱫᱚᱞᱤᱞ ᱟᱯᱞᱚᱰ",
      verified: "ᱥᱚᱛᱭᱟᱯᱤᱛ",
      pending: "ᱛᱤᱝᱜᱩ",
      flagged: "ᱠᱟᱹᱢᱤ ᱞᱟᱹᱠᱛᱤ",
      aiScore: "AI ᱥᱚᱛᱭᱚᱛᱟ ᱥᱠᱳᱨ",
      deleteConfirm: "ᱟᱢ ᱪᱮᱫ ᱱᱚᱶᱟ ᱫᱚᱞᱤᱞ ᱜᱮᱫ ᱜᱤᱰᱤ ᱥᱟᱱᱟᱢ ᱠᱟᱱᱟ?"
    },
    renewal: {
      subtitle: "ᱪᱟᱞᱩ ᱥᱮᱪᱮᱫ ᱵᱚᱪᱷᱚᱨ ᱞᱟᱹᱜᱤᱫ ᱟᱢᱟᱜ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱱᱟᱣᱟ ᱛᱮᱭᱟᱨ ᱢᱮ",
      attendance: "ᱦᱟᱡᱤᱨᱤ ᱥᱟᱭᱠᱚᱲᱟ",
      progressReport: "ᱥᱮᱪᱮᱫ ᱞᱟᱦᱟᱱᱛᱤ ᱨᱤᱯᱚᱨᱴ",
      uploadProgress: "ᱢᱟᱨᱠᱥᱤᱴ / ᱯᱨᱚᱜᱨᱮᱥ ᱠᱟᱨᱰ ᱟᱯᱞᱚᱰ ᱢᱮ",
      submitRenewal: "ᱱᱟᱣᱟ ᱛᱮᱭᱟᱨ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱡᱚᱢᱟ ᱢᱮ",
      renewalNotice: "⏰ ᱱᱟᱣᱟ ᱛᱮᱭᱟᱨ ᱟᱠᱷᱤᱨ ᱛᱟᱹᱨᱤᱠᱷ ᱥᱮᱴᱮᱨᱚᱜ ᱠᱟᱱᱟ! ᱦᱟᱡᱤᱨᱤ ᱗᱕% ᱠᱷᱚᱱ ᱪᱮᱛᱟᱱ ᱫᱚᱦᱚᱭ ᱢᱮ᱾"
    },
    disbursal: {
      subtitle: "ᱥᱚᱡᱷᱮ ᱞᱟᱵᱷ ᱵᱷᱮᱡᱟ (DBT) ᱴᱟᱠᱟ ᱵᱷᱮᱡᱟ ᱞᱚᱜᱽ ᱟᱨ ᱞᱮᱱ-ᱫᱮᱱ ᱥᱴᱮᱴᱟᱥ",
      dbtAccount: "ᱟᱫᱷᱟᱨ ᱡᱚᱲᱟᱣ DBT ᱵᱮᱝᱠ ᱮᱠᱟᱩᱱᱴ",
      utr: "UTR / ᱞᱮᱱ-ᱫᱮᱱ ᱱᱚᱢᱵᱚᱨ",
      credited: "ᱴᱟᱠᱟ ᱡᱚᱢᱟᱭᱮᱱᱟ",
      processing: "ᱠᱟᱹᱢᱤ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ",
      totalDisbursed: "ᱡᱚᱛᱚ ᱴᱟᱠᱟ ᱮᱢ ᱦᱩᱭᱱᱟ",
      nextDisbursal: "ᱫᱟᱨᱟᱭ ᱴᱟᱠᱟ ᱮᱢ ᱚᱠᱛᱚ"
    },
    voice: {
      listening: "ᱟᱸᱡᱚᱢᱮᱫᱟ... ᱱᱤᱛ ᱨᱚᱲ ᱢᱮ",
      voiceInput: "ᱟᱲᱟᱝ ᱤᱱᱯᱩᱴ",
      clickToUse: "ᱟᱲᱟᱝ ᱤᱱᱯᱩᱴ ᱵᱮᱵᱷᱟᱨ ᱞᱟᱹᱜᱤᱫ ᱚᱛᱟᱭ ᱢᱮ"
    }
  },
  admin: {
    dashboard: {
      controlCenter: "ᱥᱟᱥᱚᱱᱤᱭᱟᱹ ᱥᱟᱢᱵᱽᱲᱟᱣ ᱛᱟᱞᱢᱟ",
      controlSubtitle: "ᱡᱚᱛᱚ ᱥᱠᱤᱢ ᱟᱨ ᱯᱚᱱᱚᱛ ᱨᱮ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱠᱚ ᱧᱮᱞ, ᱯᱚᱨᱚᱠᱷ ᱟᱨ ᱢᱟᱱᱟᱣ ᱢᱮ᱾",
      signedInAs: "ᱥᱟᱭᱤᱱ ᱤᱱ:",
      scopedTo: "ᱴᱷᱟᱶ:",
      resetDemo: "ᱰᱮᱢᱚ ᱨᱤᱥᱮᱴ",
      audit: "ᱚᱰᱤᱴ",
      totalApplications: "ᱡᱚᱛᱚ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ",
      pendingReview: "ᱧᱮᱞ ᱛᱤᱝᱜᱩ",
      aiFlags: "AI ᱪᱤᱱᱦᱟᱹ",
      selected: "ᱵᱟᱪᱷᱟᱣ ᱟᱠᱟᱱ",
      registeredStudents: "ᱚᱞ ᱟᱠᱟᱱ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ",
      searchPlaceholder: "ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱧᱩᱛᱩᱢ, ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱱᱚᱢᱵᱚᱨ ᱥᱮ ᱥᱠᱤᱢ ᱥᱮᱸᱫᱽᱨᱟ...",
      allStates: "ᱡᱚᱛᱚ ᱯᱚᱱᱚᱛ",
      allSchemes: "ᱡᱚᱛᱚ ᱥᱠᱤᱢ",
      allStatuses: "ᱡᱚᱛᱚ ᱥᱴᱮᱴᱟᱥ",
      selectAll: "ᱡᱚᱛᱚ ᱵᱟᱪᱷᱟᱣ",
      bulkActions: "ᱢᱤᱫᱴᱮᱱ ᱠᱟᱹᱢᱤ",
      advanceStatus: "ᱥᱴᱮᱴᱟᱥ ᱞᱟᱦᱟᱭ ᱢᱮ",
      sanction: "ᱢᱟᱱᱟᱣ",
      disburse: "ᱴᱟᱠᱟ ᱵᱷᱮᱡᱟ",
      reject: "ᱵᱟᱝ ᱢᱟᱱᱟᱣ",
      requestInfo: "ᱠᱷᱚᱵᱚᱨ ᱠᱚᱭ",
      demoRestored: "ᱰᱮᱢᱚ ᱰᱮᱴᱟ ᱨᱩᱣᱟᱹᱲ ᱦᱩᱭᱱᱟ",
      actions: "ᱠᱟᱹᱢᱤ ᱠᱚ",
      applicationDetails: "ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱵᱤᱵᱚᱨᱚᱱ",
      adminRemarks: "ᱥᱟᱥᱚᱱᱤᱭᱟᱹ ᱨᱚᱲ",
      aiAssistance: "AI ᱥᱚᱞᱦᱟ"
    }
  },
  government: {
    dashboard: {
      executiveTitle: "ᱢᱩᱬᱩᱛ ᱰᱮᱥᱵᱚᱨᱰ",
      ministrySubtitle: "ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱵᱮᱯᱟᱨ ᱢᱚᱱᱛᱨᱟᱞᱚᱭ — ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱧᱮᱞ",
      exportReport: "ᱨᱤᱯᱚᱨᱴ ᱵᱟᱦᱨᱮ ᱵᱷᱮᱡᱟ",
      totalApplications: "ᱡᱚᱛᱚ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ",
      verified: "ᱥᱚᱛᱭᱟᱯᱤᱛ",
      selected: "ᱵᱟᱪᱷᱟᱣ",
      disbursed: "ᱴᱟᱠᱟ ᱮᱢ",
      pending: "ᱛᱤᱝᱜᱩ",
      monthlyTrend: "ᱪᱟᱸᱫᱚᱠᱤᱭᱟᱹ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱪᱟᱞ",
      categoryDistribution: "ᱛᱷᱚᱠ ᱞᱮᱠᱟᱛᱮ ᱦᱟᱹᱴᱤᱧ",
      stateBreakdown: "ᱯᱚᱱᱚᱛ ᱞᱮᱠᱟᱛᱮ ᱟᱯᱞᱤᱠᱮᱥᱚᱱ",
      applications: "ᱟᱯᱞᱤᱠᱮᱥᱚᱱ ᱠᱚ",
      processed: "ᱠᱟᱹᱢᱤ ᱦᱩᱭᱱᱟ"
    },
    performance: {
      title: "ᱥᱠᱤᱢ ᱠᱟᱹᱢᱤᱦᱚᱨᱟ",
      subtitle: "ᱵᱮᱵᱷᱟᱨ, ᱠᱟᱹᱢᱤ ᱚᱠᱛᱚ ᱟᱨ ᱫᱟᱲᱮ ᱦᱤᱥᱟᱹᱵᱽ",
      utilized: "ᱵᱮᱵᱷᱟᱨ ᱟᱠᱟᱱ",
      utilizationRate: "ᱵᱮᱵᱷᱟᱨ ᱫᱚᱨ",
      avgProcessingTime: "ᱮᱵᱷᱨᱮᱡᱽ ᱠᱟᱹᱢᱤ ᱚᱠᱛᱚ",
      dropOffRate: "ᱰᱨᱚᱯ-ᱚᱯᱷ ᱫᱚᱨ",
      days: "ᱢᱟᱦᱟᱸ"
    },
    budget: {
      title: "ᱵᱟᱡᱮᱴ ᱴᱨᱮᱠᱚᱨ",
      subtitle: "ᱡᱚᱛᱚ ᱥᱠᱤᱢ ᱨᱮ ᱵᱟᱨᱟᱵᱟᱨ ᱟᱨ ᱴᱟᱠᱟ ᱮᱢ",
      totalAllocated: "ᱡᱚᱛᱚ ᱵᱟᱨᱟᱵᱟᱨ",
      totalDisbursed: "ᱡᱚᱛᱚ ᱮᱢ ᱟᱠᱟᱱ",
      totalRemaining: "ᱥᱟᱨᱮᱡ ᱵᱟᱡᱮᱴ",
      disbursed: "ᱮᱢ ᱟᱠᱟᱱ",
      allocated: "ᱵᱟᱨᱟᱵᱟᱨ",
      remaining: "ᱥᱟᱨᱮᱡ"
    },
    reports: {
      title: "ᱨᱤᱯᱚᱨᱴ ᱟᱨ ᱵᱟᱦᱨᱮ ᱵᱷᱮᱡᱟ",
      subtitle: "ᱮᱱᱟᱞᱤᱴᱤᱠᱟᱞ ᱨᱤᱯᱚᱨᱴ ᱟᱨ ᱰᱮᱴᱟ ᱰᱟᱩᱱᱞᱚᱰ ᱢᱮ",
      generateCustom: "ᱠᱟᱥᱴᱚᱢ ᱨᱤᱯᱚᱨᱴ ᱛᱮᱭᱟᱨ",
      download: "ᱰᱟᱩᱱᱞᱚᱰ"
    }
  },
  common: {
    months: {
      jan: "ᱡᱟᱱ", feb: "ᱯᱷᱮᱵᱽ", mar: "ᱢᱟᱨᱪ", apr: "ᱮᱯᱨᱤᱞ", may: "ᱢᱮ", jun: "ᱡᱩᱱ",
      jul: "ᱡᱩᱞᱟᱭ", aug: "ᱟᱜᱚᱥᱴ", sep: "ᱥᱮᱯ", oct: "ᱚᱠᱴᱚ", nov: "ᱱᱚᱵᱷᱮ", dec: "ᱰᱤᱥᱮ"
    },
    days: "ᱢᱟᱦᱟᱸ",
    hours: "ᱴᱟᱲᱟᱝ",
    minutes: "ᱴᱤᱯᱤᱲ"
  }
};

function updateLocaleFile(lang, ns, additions) {
  const filePath = path.join(localesDir, lang, ns + '.json');
  if (!fs.existsSync(filePath)) {
    console.log('Not found: ' + filePath);
    return;
  }
  const current = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const updated = deepMerge(current, additions);
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
  console.log('Updated: ' + filePath);
}

// Update en
for (const [ns, add] of Object.entries(enAdditions)) updateLocaleFile('en', ns, add);
// Update hi
for (const [ns, add] of Object.entries(hiAdditions)) updateLocaleFile('hi', ns, add);
// Update sat
for (const [ns, add] of Object.entries(satAdditions)) updateLocaleFile('sat', ns, add);

console.log('All locale files enriched successfully!');
