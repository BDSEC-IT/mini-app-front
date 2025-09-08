'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import TokenProvider from './TokenProvider'
import RegistrationGuard from './RegistrationGuard'
import { Toaster } from 'react-hot-toast'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <LanguageProvider>
          <TokenProvider>
            <RegistrationGuard>
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              {children}
            </RegistrationGuard>
          </TokenProvider>
        </LanguageProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
} 