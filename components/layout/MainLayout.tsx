'use client'

import { useState } from 'react'
import Header from './header'
import BottomNavigation from './BottomNavigation'
import { ClientProviders } from '../providers/ClientProviders'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <ClientProviders>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header />
        <main className="pb-16">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </ClientProviders>
  )
}

export default MainLayout 