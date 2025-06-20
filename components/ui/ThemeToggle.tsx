'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-12 h-6 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md' 
          : 'bg-gradient-to-r from-gray-200 to-gray-300 shadow-sm'
      }`}
      aria-label="Toggle theme"
    >
      {/* Toggle circle with icon */}
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-lg flex items-center justify-center ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      >
        {theme === 'dark' ? (
          <Moon size={12} className="text-blue-600" />
        ) : (
          <Sun size={12} className="text-yellow-500" />
        )}
      </span>
    
    </button>
  )
}

export default ThemeToggle 