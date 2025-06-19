'use client'

import { useState } from 'react'
import Header from './header'
import BottomNavigation from './BottomNavigation'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen  bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Header />
      <main className="pb-16 container mx-auto">
        {children}
      </main>
      <BottomNavigation />
    </div>
  )
}

export default MainLayout 