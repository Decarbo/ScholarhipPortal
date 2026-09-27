// Localized scholarship schemes and domain content for English, Hindi, and Santhali (Ol Chiki)
import type { Scheme } from '../mock/data';

interface SchemeTranslation {
  name: string;
  fullName: string;
  description: string;
  duration?: string;
  eligibility?: string[];
}

export const SCHEME_TRANSLATIONS: Record<string, Record<string, SchemeTranslation>> = {
  SCH001: {
    en: {
      name: "NFST",
      fullName: "National Fellowship for ST Students",
      description: "Provides fellowships to ST students for pursuing M.Phil and Ph.D. courses in sciences, social sciences, and humanities. Aims to build research capacity among tribal communities.",
      duration: "2 years (JRF) + 3 years (SRF)",
      eligibility: [
        "Must belong to Scheduled Tribe",
        "Admitted to M.Phil/Ph.D program",
        "Annual family income below ₹2.5 lakh",
        "Minimum 55% in qualifying examination",
        "Age below 35 years"
      ]
    },
    hi: {
      name: "एनएफएसटी",
      fullName: "एसटी छात्रों के लिए राष्ट्रीय फैलोशिप",
      description: "विज्ञान, सामाजिक विज्ञान और मानविकी में एम.फिल और पीएच.डी. पाठ्यक्रमों के लिए एसटी छात्रों को फैलोशिप प्रदान करता है। जनजातीय समुदायों में अनुसंधान क्षमता का निर्माण करना इसका उद्देश्य है।",
      duration: "2 वर्ष (JRF) + 3 वर्ष (SRF)",
      eligibility: [
        "अनुसूचित जनजाति (ST) से संबंधित होना चाहिए",
        "एम.फिल/पीएच.डी कार्यक्रम में प्रवेश प्राप्त",
        "वार्षिक पारिवारिक आय ₹2.5 लाख से कम",
        "योग्यता परीक्षा में न्यूनतम 55% अंक",
        "आयु 35 वर्ष से कम"
      ]
    },
    sat: {
      name: "NFST",
      fullName: "ST ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ᱯᱷᱮᱞᱳᱥᱤᱯ",
      description: "ᱥᱟᱬᱮᱥ, ᱥᱟᱶᱛᱟ ᱥᱟᱬᱮᱥ ᱟᱨ ᱢᱟᱱᱣᱟ ᱥᱟᱬᱮᱥ ᱨᱮ M.Phil ᱟᱨ Ph.D. ᱯᱟᱲᱦᱟᱣ ᱞᱟᱹᱜᱤᱫ ST ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱯᱷᱮᱞᱳᱥᱤᱯ ᱮᱢᱚᱜᱼᱟ᱾ ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱜᱟᱫᱮᱞ ᱨᱮ ᱠᱷᱚᱸᱫᱽᱨᱚᱸᱫᱽ ᱫᱟᱲᱮ ᱵᱮᱱᱟᱣ ᱨᱮᱭᱟᱜ ᱡᱚᱥ ᱢᱮᱱᱟᱜᱼᱟ᱾",
      duration: "᱒ ᱥᱮᱨᱢᱟ (JRF) + ᱓ ᱥᱮᱨᱢᱟ (SRF)",
      eligibility: [
        "ᱟᱹᱫᱤᱵᱟᱹᱥᱤ (ST) ᱜᱟᱫᱮᱞ ᱨᱤᱱᱤᱡ ᱦᱩᱭ ᱞᱟᱹᱠᱛᱤ",
        "M.Phil/Ph.D ᱯᱨᱚᱜᱨᱟᱢ ᱨᱮ ᱵᱷᱩᱨᱛᱤ ᱟᱠᱟᱱ",
        "ᱵᱚᱪᱷᱚᱨ ᱨᱮ ᱚᱲᱟᱜ ᱟᱭ ₹᱒.᱕ ᱞᱟᱠᱷ ᱠᱷᱚᱱ ᱠᱚᱢ",
        "ᱯᱟᱥ ᱯᱟᱨᱤᱠᱷᱭᱟ ᱨᱮ ᱠᱚᱢ ᱠᱷᱚᱱ ᱠᱚᱢ ᱕᱕%",
        "ᱩᱢᱮᱨ ᱓᱕ ᱥᱮᱨᱢᱟ ᱠᱷᱚᱱ ᱠᱚᱢ"
      ]
    }
  },
  SCH002: {
    en: {
      name: "NOS",
      fullName: "National Overseas Scholarship",
      description: "Financial support for meritorious ST students for pursuing Master's, Ph.D, and Post-Doctoral programs at reputed overseas universities.",
      duration: "As per course duration (max 4 years)",
      eligibility: [
        "Must belong to Scheduled Tribe",
        "Age between 20-35 years",
        "Graduation with minimum 55% marks",
        "Annual family income below ₹2.5 lakh",
        "Valid passport",
        "Admission/offer letter from foreign university"
      ]
    },
    hi: {
      name: "एनओएस",
      fullName: "राष्ट्रीय प्रवासी छात्रवृत्ति",
      description: "प्रतिष्ठित विदेशी विश्वविद्यालयों में मास्टर, पीएच.डी और पोस्ट-डॉक्टरल कार्यक्रमों के लिए मेधावी एसटी छात्रों को वित्तीय सहायता।",
      duration: "पाठ्यक्रम अवधि के अनुसार (अधिकतम 4 वर्ष)",
      eligibility: [
        "अनुसूचित जनजाति (ST) से संबंधित होना चाहिए",
        "आयु 20 से 35 वर्ष के बीच",
        "स्नातक में न्यूनतम 55% अंक",
        "वार्षिक पारिवारिक आय ₹2.5 लाख से कम",
        "वैध पासपोर्ट होना आवश्यक",
        "विदेशी विश्वविद्यालय से प्रवेश पत्र"
      ]
    },
    sat: {
      name: "NOS",
      fullName: "ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ᱵᱤᱫᱮᱥ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ",
      description: "ᱵᱤᱫᱮᱥ ᱨᱮᱱᱟᱜ ᱧᱩᱛᱩᱢᱟᱱ ᱡᱮᱜᱮᱛ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱨᱮ Master's, Ph.D. ᱟᱨ Post-Doc ᱞᱟᱹᱜᱤᱫ ST ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱠᱟᱹᱣᱰᱤ ᱜᱚᱲᱚ᱾",
      duration: "ᱠᱚᱨᱥ ᱞᱮᱠᱟᱛᱮ (ᱡᱟᱹᱥᱛᱤ ᱔ ᱥᱮᱨᱢᱟ)",
      eligibility: [
        "ᱟᱹᱫᱤᱵᱟᱹᱥᱤ (ST) ᱜᱟᱫᱮᱞ ᱨᱤᱱᱤᱡ ᱦᱩᱭ ᱞᱟᱹᱠᱛᱤ",
        "ᱩᱢᱮᱨ ᱒᱐-᱓᱕ ᱥᱮᱨᱢᱟ ᱛᱟᱞᱟ ᱨᱮ",
        "ᱜᱨᱮᱡᱩᱣᱮᱥᱚᱱ ᱨᱮ ᱠᱚᱢ ᱠᱷᱚᱱ ᱠᱚᱢ ᱕᱕%",
        "ᱵᱚᱪᱷᱚᱨ ᱨᱮ ᱚᱲᱟᱜ ᱟᱭ ₹᱒.᱕ ᱞᱟᱠᱷ ᱠᱷᱚᱱ ᱠᱚᱢ",
        "ᱞᱟᱹᱠᱛᱤᱭᱟᱱ ᱯᱟᱥᱯᱳᱨᱴ ᱛᱟᱦᱮᱸᱱ ᱞᱟᱹᱠᱛᱤ",
        "ᱵᱤᱫᱮᱥ ᱵᱤᱨᱫᱟᱹᱜᱟᱲ ᱠᱷᱚᱱ ᱵᱷᱩᱨᱛᱤ ᱪᱤᱴᱷᱤ"
      ]
    }
  },
  SCH003: {
    en: {
      name: "NSTPS",
      fullName: "National ST Pre-Matric Scholarship",
      description: "Scholarship for ST students studying in classes IX and X to support their education and reduce dropout rates at the secondary level.",
      duration: "1 year (renewable)",
      eligibility: [
        "Must belong to Scheduled Tribe",
        "Studying in class IX or X",
        "Parents annual income below ₹2.5 lakh",
        "Minimum 55% marks in previous examination",
        "Attending government/recognized school"
      ]
    },
    hi: {
      name: "एनएसटीपीएस",
      fullName: "राष्ट्रीय एसटी प्री-मैट्रिक छात्रवृत्ति",
      description: "कक्षा IX और X में अध्ययनरत एसटी छात्रों की शिक्षा का समर्थन करने और माध्यमिक स्तर पर ड्रॉपआउट दर को कम करने हेतु छात्रवृत्ति।",
      duration: "1 वर्ष (नवीकरणीय)",
      eligibility: [
        "अनुसूचित जनजाति (ST) से संबंधित होना चाहिए",
        "कक्षा IX या X में अध्ययनरत",
        "अभिभावकों की वार्षिक आय ₹2.5 लाख से कम",
        "पिछली परीक्षा में न्यूनतम 55% अंक",
        "सरकारी या मान्यता प्राप्त विद्यालय में अध्ययनरत"
      ]
    },
    sat: {
      name: "NSTPS",
      fullName: "ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ST ᱯᱨᱤ-ᱢᱮᱴᱨᱤᱠ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ",
      description: "IX ᱟᱨ X ᱪᱟᱱᱟᱪ ᱨᱮ ᱯᱟᱲᱦᱟᱣᱜ ᱠᱟᱱ ST ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ, ᱡᱟᱦᱟᱸ ᱛᱮ ᱯᱟᱲᱦᱟᱣ ᱵᱟᱹᱜᱤ ᱠᱚᱢᱚᱜ-ᱟ᱾",
      duration: "᱑ ᱥᱮᱨᱢᱟ (ᱱᱟᱣᱟ ᱛᱮᱭᱟᱨ ᱡᱚᱜᱽ)",
      eligibility: [
        "ᱟᱹᱫᱤᱵᱟᱹᱥᱤ (ST) ᱜᱟᱫᱮᱞ ᱨᱤᱱᱤᱡ ᱦᱩᱭ ᱞᱟᱹᱠᱛᱤ",
        "IX ᱥᱮ X ᱪᱟᱱᱟᱪ ᱨᱮ ᱯᱟᱲᱦᱟᱣᱜ ᱠᱟᱱ",
        "ᱟᱭᱳ-ᱵᱟᱵᱟ ᱟᱜ ᱥᱮᱨᱢᱟ ᱟᱭ ₹᱒.᱕ ᱞᱟᱠᱷ ᱠᱷᱚᱱ ᱠᱚᱢ",
        "ᱢᱟᱲᱟᱝ ᱵᱤᱱᱤᱰ ᱨᱮ ᱠᱚᱢ ᱠᱷᱚᱱ ᱠᱚᱢ ᱕᱕%",
        "ᱥᱚᱨᱠᱟᱨᱤ ᱥᱮ ᱢᱟᱱᱟᱣ ᱟᱥᱲᱟ ᱨᱮ ᱯᱟᱲᱦᱟᱣ"
      ]
    }
  },
  SCH004: {
    en: {
      name: "NSTMS",
      fullName: "National ST Merit Scholarship",
      description: "Merit-based scholarship for ST students pursuing higher education (class XI onwards) to encourage academic excellence.",
      duration: "1 year (renewable)",
      eligibility: [
        "Must belong to Scheduled Tribe",
        "Studying in class XI or above",
        "Annual family income below ₹6 lakh",
        "Minimum 75% marks in previous examination",
        "Not availing any other scholarship"
      ]
    },
    hi: {
      name: "एनएसटीएमएस",
      fullName: "राष्ट्रीय एसटी मेरिट छात्रवृत्ति",
      description: "शैक्षणिक उत्कृष्टता को प्रोत्साहित करने के लिए उच्च शिक्षा (कक्षा XI से आगे) प्राप्त करने वाले एसटी छात्रों के लिए योग्यता आधारित छात्रवृत्ति।",
      duration: "1 वर्ष (नवीकरणीय)",
      eligibility: [
        "अनुसूचित जनजाति (ST) से संबंधित होना चाहिए",
        "कक्षा XI या उससे ऊपर अध्ययनरत",
        "वार्षिक पारिवारिक आय ₹6 लाख से कम",
        "पिछली परीक्षा में न्यूनतम 75% अंक",
        "अन्य किसी छात्रवृत्ति का लाभ न ले रहा हो"
      ]
    },
    sat: {
      name: "NSTMS",
      fullName: "ᱡᱟᱹᱛᱤᱭᱟᱹᱨᱤ ST ᱢᱮᱨᱤᱴ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ",
      description: "ᱪᱮᱛᱟᱱ ᱥᱮᱪᱮᱫ (XI ᱪᱟᱱᱟᱪ ᱠᱷᱚᱱ ᱪᱮᱛᱟᱱ) ᱯᱟᱲᱦᱟᱣᱜ ᱠᱟᱱ ST ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱠᱚ ᱞᱟᱹᱜᱤᱫ ᱢᱮᱨᱤᱴ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ᱾",
      duration: "᱑ ᱥᱮᱨᱢᱟ (ᱱᱟᱣᱟ ᱛᱮᱭᱟᱨ ᱡᱚᱜᱽ)",
      eligibility: [
        "ᱟᱹᱫᱤᱵᱟᱹᱥᱤ (ST) ᱜᱟᱫᱮᱞ ᱨᱤᱱᱤᱡ ᱦᱩᱭ ᱞᱟᱹᱠᱛᱤ",
        "XI ᱪᱟᱱᱟᱪ ᱥᱮ ᱪᱮᱛᱟᱱ ᱨᱮ ᱯᱟᱲᱦᱟᱣᱜ ᱠᱟᱱ",
        "ᱵᱚᱪᱷᱚᱨ ᱨᱮ ᱚᱲᱟᱜ ᱟᱭ ₹᱖ ᱞᱟᱠᱷ ᱠᱷᱚᱱ ᱠᱚᱢ",
        "ᱢᱟᱲᱟᱝ ᱵᱤᱱᱤᱰ ᱨᱮ ᱠᱚᱢ ᱠᱷᱚᱱ ᱠᱚᱢ ᱗᱕%",
        "ᱮᱴᱟᱜ ᱡᱟᱦᱟᱸᱱ ᱥᱠᱚᱞᱟᱨᱥᱤᱯ ᱵᱟᱝ ᱦᱟᱛᱟᱣ"
      ]
    }
  }
};

/**
 * Returns localized fields for a scheme according to the active language.
 */
export function getLocalizedScheme(scheme: Scheme, lang: string): Scheme {
  const trans = SCHEME_TRANSLATIONS[scheme.id]?.[lang] || SCHEME_TRANSLATIONS[scheme.id]?.['en'];
  if (!trans) return scheme;
  return {
    ...scheme,
    name: trans.name || scheme.name,
    fullName: trans.fullName || scheme.fullName,
    description: trans.description || scheme.description,
    duration: trans.duration || scheme.duration,
    eligibility: trans.eligibility || scheme.eligibility,
  };
}

/**
 * Returns localized full name for a scheme ID or scheme name.
 */
export function getLocalizedSchemeName(schemeIdOrName: string, lang: string): string {
  // If it's a known ID
  if (SCHEME_TRANSLATIONS[schemeIdOrName]) {
    return SCHEME_TRANSLATIONS[schemeIdOrName][lang]?.fullName || SCHEME_TRANSLATIONS[schemeIdOrName]['en'].fullName;
  }
  // If it's a known name like 'NFST', 'NOS', etc.
  for (const [id, langs] of Object.entries(SCHEME_TRANSLATIONS)) {
    if (langs.en.name.toLowerCase() === schemeIdOrName.toLowerCase() ||
        langs.en.fullName.toLowerCase() === schemeIdOrName.toLowerCase()) {
      return langs[lang]?.fullName || langs.en.fullName;
    }
  }
  return schemeIdOrName;
}
