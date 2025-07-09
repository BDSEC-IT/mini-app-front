'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Get theme from localStorage or default to dark
    try {
      const savedTheme = localStorage.getItem('theme') as Theme
      const initialTheme = savedTheme || 'dark'
      setTheme(initialTheme)
    } catch (error) {
      // Fallback if localStorage is not available
      setTheme('dark')
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      try {
        // Apply theme to document
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        localStorage.setItem('theme', theme)
      } catch (error) {
        // Ignore localStorage errors
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 