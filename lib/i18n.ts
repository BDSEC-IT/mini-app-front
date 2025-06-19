import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'

const runsOnServerSide = typeof window === 'undefined'

i18n
  // Load translation using http -> see /public/locales
  .use(resourcesToBackend((language: string, namespace: string) => 
    import(`../public/locales/${language}/${namespace}.json`)
  ))
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Initialize i18next
  .init({
    debug: false,
    fallbackLng: 'en',
    lng: 'en', // Default language
    
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

    // Resources (fallback if file loading fails)
    resources: {
      en: {
        common: {
          'nav.home': 'Home',
          'nav.assets': 'Assets',
          'nav.orders': 'Orders',
          'nav.ipo': 'IPO',
        }
      },
      mn: {
        common: {
          'nav.home': 'Нүүр',
          'nav.assets': 'Хөрөнгө',
          'nav.orders': 'Захиалга',
          'nav.ipo': 'IPO',
        }
      }
    }
  })

export default i18n 