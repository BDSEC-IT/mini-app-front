'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BarChart3, FileText, PieChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const BottomNavigation = () => {
  const pathname = usePathname()
  const { t } = useTranslation()
  
  // Increased icon size by 20%
  const iconSize = 26

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 z-10">
      {/* Center button with curved background */}
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white dark:bg-gray-950 h-12 w-24 rounded-t-full border-t border-l border-r border-gray-200 dark:border-gray-800"></div>
        <Link 
          href="/orders" 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex items-center justify-center w-16 h-16 rounded-full bg-indigo-900 text-white shadow-lg hover:bg-indigo-800 transition-colors"
        >
          {/* Exchange icon - similar to the one in the screenshot */}
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10L3 14L7 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M17 14L21 10L17 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 14H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
      
      <div className="flex justify-around items-center h-full px-6">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center ${
            isActive('/') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Home size={iconSize} />
          <span className="text-xs mt-1">{t('nav.home')}</span>
        </Link>
        
        <Link 
          href="/assets" 
          className={`flex flex-col items-center justify-center ${
            isActive('/assets') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <BarChart3 size={iconSize} />
          <span className="text-xs mt-1">{t('nav.assets')}</span>
        </Link>
        
        {/* Empty space for center button */}
        <div className="w-16"></div>
        
        <Link 
          href="/orders" 
          className={`flex flex-col items-center justify-center ${
            isActive('/orders') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <FileText size={iconSize} />
          <span className="text-xs mt-1">{t('nav.orders')}</span>
        </Link>
        
        <Link 
          href="/ipo" 
          className={`flex flex-col items-center justify-center ${
            isActive('/ipo') ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <PieChart size={iconSize} />
          <span className="text-xs mt-1">{t('nav.ipo')}</span>
        </Link>
      </div>
    </div>
  )
}

export default BottomNavigation 