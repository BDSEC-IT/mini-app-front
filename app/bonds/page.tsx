'use client'

import { Suspense } from 'react'
import Bonds from '@/components/pages/Bonds'

export default function BondsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Bonds />
    </Suspense>
  )
} 