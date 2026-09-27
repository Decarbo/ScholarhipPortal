import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enStudent from './locales/en/student.json';
import enAdmin from './locales/en/admin.json';
import enGovernment from './locales/en/government.json';

// Hindi
import hiCommon from './locales/hi/common.json';
import hiAuth from './locales/hi/auth.json';
import hiStudent from './locales/hi/student.json';
import hiAdmin from './locales/hi/admin.json';
import hiGovernment from './locales/hi/government.json';

// Santhali (Ol Chiki)
import satCommon from './locales/sat/common.json';
import satAuth from './locales/sat/auth.json';
import satStudent from './locales/sat/student.json';
import satAdmin from './locales/sat/admin.json';
import satGovernment from './locales/sat/government.json';

const LANGUAGE_KEY = 'app_language';

const savedLanguage = localStorage.getItem(LANGUAGE_KEY) || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      student: enStudent,
      admin: enAdmin,
      government: enGovernment,
    },
    hi: {
      common: hiCommon,
      auth: hiAuth,
      student: hiStudent,
      admin: hiAdmin,
      government: hiGovernment,
    },
    sat: {
      common: satCommon,
      auth: satAuth,
      student: satStudent,
      admin: satAdmin,
      government: satGovernment,
    },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'auth', 'student', 'admin', 'government'],
  interpolation: {
    escapeValue: false, // React already escapes
  },
});

// Update HTML lang attribute
document.documentElement.lang = savedLanguage;

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANGUAGE_KEY, lng);
  document.documentElement.lang = lng;
});

export default i18n;
