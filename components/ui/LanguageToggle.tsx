'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { useLanguage } from '@/contexts/LanguageContext'

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage()
  const { i18n: i18nInstance } = useTranslation()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const handleLanguageChange = (lang: 'en' | 'mn') => {
    setLanguage(lang)
    i18nInstance.changeLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }
  
  if (!mounted) {
    return <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
  }

  return (
    <div className="flex items-center p-1 space-x-1 bg-gray-200 dark:bg-gray-700 rounded-full">
      <button
        onClick={() => handleLanguageChange('mn')}
        className={`w-8 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
          language === 'mn'
            ? 'bg-white dark:bg-gray-900 text-bdsec dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        MN
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`w-8 h-6 flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
          language === 'en'
            ? 'bg-white dark:bg-gray-900 text-bdsec dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        EN
      </button>
    </div>
  )
}

export default LanguageToggle 