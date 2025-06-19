'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageToggle from '../ui/LanguageToggle'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

const SideMenu = ({ isOpen, onClose }: SideMenuProps) => {
  const { t } = useTranslation()
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (isOpen && !target.closest('#side-menu') && !target.closest('#menu-button')) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen, onClose])
  
  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      {/* Menu panel */}
      <div 
        id="side-menu"
        className={`fixed top-0 right-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold">{t('header.menu')}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Menu items */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              <Link 
                href="/about" 
                className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                {t('menu.about')}
              </Link>
              <Link 
                href="/faq" 
                className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                {t('menu.faq')}
              </Link>
              <Link 
                href="/news" 
                className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                {t('menu.news')}
              </Link>
              <Link 
                href="/withdraw" 
                className="block py-2 px-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={onClose}
              >
                {t('menu.withdraw')}
              </Link>
            </nav>
          </div>
          
          {/* Settings */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">{t('common.theme')}</span>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{t('common.language')}</span>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SideMenu 