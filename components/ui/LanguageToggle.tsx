'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { useLanguage } from '@/contexts/LanguageContext'

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage()
  const { t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  
  // After mounting, we have access to the window object
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Handle language toggle
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'mn' : 'en'
    setLanguage(newLang)
    i18n.changeLanguage(newLang)
    
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang)
    }
  }
  
  // If not mounted yet, render a placeholder to avoid layout shift
  if (!mounted) return <div className="h-8 w-16"></div>
  
  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={toggleLanguage}
        className="relative inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors duration-200 text-sm font-medium text-bdsec dark:text-indigo-400"
        aria-label={t('languageToggle.toggleLanguage')}
      >
        {language === 'en' ? 'EN' : 'MN'}
      </button>
      
      <div className="relative">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-md transition-colors duration-200 text-xs ${
              language === 'en' 
              ? 'bg-bdsec/5 dark:bg-indigo-500/40 text-bdsec dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            EN
          </button>
          
          <button
            onClick={() => setLanguage('mn')}
            className={`px-2 py-1 rounded-md transition-colors duration-200 text-xs ${
              language === 'mn' 
              ? 'bg-bdsec/5 dark:bg-indigo-500/40 text-bdsec dark:text-indigo-400'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            MN
          </button>
        </div>
      </div>
    </div>
  )
}

export default LanguageToggle 