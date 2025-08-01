'use client'

import React from 'react'
import Header from './header'
import BottomNavigation from './BottomNavigation'
import { useTheme } from '@/contexts/ThemeContext'

import AnimatedBlobBackground from '../ui/AnimatedBlobBackground'
import FloatingParticles from '../ui/FloatingParticles'
import { BackgroundBeams } from '../ui/background-beams'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <FloatingParticles />
      <AnimatedBlobBackground />
      {theme === 'dark' && <BackgroundBeams />}
      {/* Wrap content in a relative container to ensure it's on top of the beams */}
      <div className="relative z-10">
        <Header />
        <main className="pb-26 sm:pb-30 mx-auto max-w-[1400px] px-0">
          {children}
        </main>
        <BottomNavigation />
      </div>
    </div>
  )
}

export default MainLayout 