'use client'

import { Suspense } from 'react'
import AllStocks from '@/components/pages/AllStocks'

export default function EquityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bdsec"></div>
    </div>}>
      <AllStocks />
    </Suspense>
  )
} 