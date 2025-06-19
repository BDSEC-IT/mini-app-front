'use client'

import { useEffect } from 'react'
import '../../lib/i18n'

interface I18nProviderProps {
  children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // i18n is already initialized in lib/i18n.ts
    // This component just ensures it's loaded on the client
  }, [])

  return <>{children}</>
} 