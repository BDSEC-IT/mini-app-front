import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

const runsOnServerSide = typeof window === 'undefined'

// Import translation files directly
import enCommon from '../public/locales/en/common.json'
import mnCommon from '../public/locales/mn/common.json'

i18n
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Detect user language
  .use(LanguageDetector)
  // Initialize i18next
  .init({
    debug: false,
    fallbackLng: 'mn',
    lng: 'mn', // Default language is Mongolian
    
    interpolation: {
      escapeValue: false, // Not needed for react as it escapes by default
    },
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Namespace and key separator
    ns: ['common'],
    defaultNS: 'common',
    
    // React options
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },

    // Resources with preloaded translations
    resources: {
      en: {
        common: enCommon
      },
      mn: {
        common: mnCommon
      }
    }
  })

export default i18n 