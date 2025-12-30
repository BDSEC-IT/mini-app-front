'use client'

import React from 'react'
import Header from './header'
import BottomNavigation from './BottomNavigation'
import { useTheme } from '@/contexts/ThemeContext'


interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme } = useTheme();

  return (
    <div className="relative pt-14 sm:pt-16 bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-hidden">
      <Header />
      <main className="pb-26 sm:pb-30 px-0 overflow-x-hidden">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}

export default MainLayout 