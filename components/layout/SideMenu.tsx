'use client'

import { useEffect } from 'react'
import { X, Home, Info, HelpCircle, FileText, Wallet, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageToggle from '../ui/LanguageToggle'
import { usePathname } from 'next/navigation'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

const SideMenu = ({ isOpen, onClose }: SideMenuProps) => {
  const { t } = useTranslation()
  const pathname = usePathname()
  
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

  // Menu items with icons
  const menuItems = [
    { href: '/', icon: <Home size={20} />, label: t('nav.home') },
    { href: '/about', icon: <Info size={20} />, label: t('menu.about') },
    { href: '/faq', icon: <HelpCircle size={20} />, label: t('menu.faq') },
    { href: '/news', icon: <FileText size={20} />, label: t('menu.news') },
    { href: '/withdraw', icon: <Wallet size={20} />, label: t('menu.withdraw') }
  ]

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
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white dark:bg-gray-900 shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >  <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-bold">{t('header.menu')}</h2>
      <button 
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <X size={24} />
      </button>
    </div>

           <div className="p-5 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">{t('common.settings')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <Settings size={18} className="text-gray-500 mr-3" />
                  <span className="font-medium">{t('common.theme')}</span>
                </div>
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-3">🌐</span>
                  <span className="font-medium">{t('common.language')}</span>
                </div>
                <LanguageToggle />
              </div>
            </div>
          </div>
        <div className="flex flex-col h-full">
          {/* Header */}
        
          
          {/* Menu items */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-2 px-5">
              {menuItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center py-3 px-4 rounded-lg transition-colors ${
                    pathname === item.href 
                      ? 'bg-bdsec/5 text-bdsec dark:bg-bdsec-dark/20 dark:text-bdsec-dark/90' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={onClose}
                >
                  <span className="mr-3 text-gray-500">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* Settings */}
       
        </div>
      </div>
    </>
  )
}

export default SideMenu