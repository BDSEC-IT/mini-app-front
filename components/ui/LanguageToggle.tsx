'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage()
  const { i18n } = useTranslation()

  const handleLanguageChange = () => {
    const newLang = language === 'en' ? 'mn' : 'en'
    setLanguage(newLang)
    i18n.changeLanguage(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang)
    }
  }

  return (
    <button
      onClick={handleLanguageChange}
      className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-bdsec dark:hover:text-indigo-400 transition-colors"
    >
      <Globe size={18} />
      <span>{language.toUpperCase()}</span>
    </button>
  )
}

export default LanguageToggle 