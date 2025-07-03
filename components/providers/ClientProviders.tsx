'use client'

import { useState, useEffect } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import TokenProvider from './TokenProvider'

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
            {children}
          </TokenProvider>
        </LanguageProvider>
      </ThemeProvider>
    </I18nextProvider>
  )
} 