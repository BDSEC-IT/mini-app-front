'use client'

import { Suspense } from 'react'
import HighLow from '@/components/pages/HighLow'

export default function HighLowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HighLow />
    </Suspense>
  )
} 