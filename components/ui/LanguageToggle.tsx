'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const LanguageToggle = () => {
  const { i18n, t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  const changeLanguage = (langCode: string) => {
    console.log(`Changing language to: ${langCode}`)
    setLanguage(langCode as 'en' | 'mn')
    setIsOpen(false)
  }

  if (!mounted) {
    return (
      <div className="h-8 bg-gray-100 rounded-md animate-pulse px-4"></div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors duration-200 text-sm font-medium text-indigo-700 dark:text-indigo-300"
      >
        <Globe size={16} />
        <span>{currentLanguage.nativeName}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                  lang.code === language 
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{lang.nativeName}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageToggle 