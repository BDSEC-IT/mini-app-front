import type { Metadata } from 'next'
import { Suspense } from 'react'
import HighLow from '@/components/pages/HighLow'

export const metadata: Metadata = {
  title: '52 долоо хоногийн дээд/доод | BDSEC',
  description: '52 долоо хоногийн дээд болон доод үнэ',
}

export default function HighLowPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HighLow />
    </Suspense>
  )
} 