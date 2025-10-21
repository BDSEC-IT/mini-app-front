'use client'

import { useState, useEffect } from 'react'
import { Bell, Menu, LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SideMenu from './SideMenu'
import Image from 'next/image'
import { useTheme } from '@/contexts/ThemeContext'
import LanguageToggle from '../ui/LanguageToggle'
import Link from 'next/link'
import Cookies from 'js-cookie'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { t } = useTranslation()
  const { theme } = useTheme()
  
  const iconSize = 24
  
  // Check if user is logged in
  useEffect(() => {
    const token = Cookies.get('token')
    setIsLoggedIn(!!token)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const logoSrc = theme === 'dark' 
    ? '/images/Group_2085662328_reriki (1).png'
    : '/images/light_bdsec_drlars (2).png';

  return (
    <header className="sticky top-0 z-20 mx-auto max-w-[1400px] px-3 sm:px-4 md:px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between h-14 sm:h-16">
        <div className="flex items-center">
          <Link href="/">
            <div className="relative h-8 w-32 sm:h-10 sm:w-40 cursor-pointer">
              <Image
                src={logoSrc}
                alt="BDSec Logo"
                layout="fill"
                objectFit="contain"
                objectPosition="left"
                priority
              />
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>
          
          {/* {!isLoggedIn && (
            <p className="text-sm lg:text-base ">Mini-App</p>
          )} */}
          
          {/* <button
            className="text-bdsec dark:text-indigo-400 hover:text-gray-500 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={t('header.notifications')}
          >
            <Bell size={iconSize} />
          </button> */}
          
          <button
            className="text-bdsec dark:text-indigo-400 hover:text-gray-500 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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