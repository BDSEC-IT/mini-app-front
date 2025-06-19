'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Language = 'mn' | 'en'

interface LanguageContextType {
  language: Language
  toggleLanguage: () => void
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('mn') // Default to Mongolian
  const [mounted, setMounted] = useState(false)
  const { i18n } = useTranslation()

  useEffect(() => {
    setMounted(true)
    // Get language from localStorage
    try {
      const savedLanguage = localStorage.getItem('language') as Language || 'mn'
      if (savedLanguage) {
        setLanguage(savedLanguage)
        i18n.changeLanguage(savedLanguage)
      } else {
        // Default to Mongolian if no saved preference
        setLanguage('mn')
        i18n.changeLanguage('mn')
        localStorage.setItem('language', 'mn')
      }
    } catch (error) {
      // Fallback if localStorage is not available
      setLanguage('mn')
      i18n.changeLanguage('mn')
    }
  }, [i18n])

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('language', language)
        i18n.changeLanguage(language)
        console.log(`Language changed to: ${language}`)
        
        // Force refresh translations
        document.dispatchEvent(new Event('languageChanged'))
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [language, mounted, i18n])

  const toggleLanguage = () => {
    const newLanguage = language === 'mn' ? 'en' : 'mn'
    console.log(`Toggling language from ${language} to ${newLanguage}`)
    setLanguage(newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {mounted ? children : null}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 