import type { Metadata } from 'next'
import { Suspense } from 'react'
import Bonds from '@/components/pages/Bonds'

export const metadata: Metadata = {
  title: 'Бонд | BDSEC',
  description: 'МХБ дээр арилжаалагдаж буй бондууд',
}

export default function BondsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Bonds />
    </Suspense>
  )
} 