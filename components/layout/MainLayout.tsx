'use client'

import React from 'react'
import Header from './header'
import BottomNavigation from './BottomNavigation'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      <main className="pb-24 mx-auto max-w-[1400px]">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}

export default MainLayout 