'use client'

import { useState } from 'react'
import { Bell, Menu } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SideMenu from './SideMenu'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import LanguageToggle from '../ui/LanguageToggle'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useTranslation()
  const { theme } = useTheme()
  
  const iconSize = 26

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const logoSrc = theme === 'dark' 
    ? '/images/Group_2085662328_reriki (1).png'
    : '/images/light_bdsec_drlars (2).png';

  return (
    <header className="sticky top-0 z-20 mx-auto max-w-[1400px] px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <div className="relative h-10 w-40">
            <Image
              src={logoSrc}
              alt="BDSec Logo"
              width={100}
              height={40}
              style={{
                objectFit: 'contain',
                objectPosition: 'left'
              }}
              priority
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <LanguageToggle />
          
          <button
            className="text-bdsec dark:text-indigo-400 hover:text-gray-500 dark:hover:text-white"
            aria-label={t('header.notifications')}
          >
            <Bell size={iconSize} />
          </button>
          
          <button
            className="text-bdsec dark:text-indigo-400 hover:text-gray-500 dark:hover:text-white"
            onClick={toggleMenu}
            aria-label={t('header.menu')}
          >
            <Menu size={iconSize} />
          </button>
        </div>
      </div>
      
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  )
}

export default Header