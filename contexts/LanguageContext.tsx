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
  const [language, setLanguage] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)
  const { i18n } = useTranslation()

  useEffect(() => {
    setMounted(true)
    // Get language from localStorage
    try {
      const savedLanguage = localStorage.getItem('language') as Language
      if (savedLanguage) {
        setLanguage(savedLanguage)
        i18n.changeLanguage(savedLanguage)
      }
    } catch (error) {
      // Fallback if localStorage is not available
      setLanguage('en')
      i18n.changeLanguage('en')
    }
  }, [i18n])

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('language', language)
        i18n.changeLanguage(language)
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [language, mounted, i18n])

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'mn' ? 'en' : 'mn')
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