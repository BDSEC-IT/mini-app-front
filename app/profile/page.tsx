import type { Metadata } from 'next'
import { Suspense } from 'react'
import Profile from '@/components/pages/Profile'

export const metadata: Metadata = {
  title: 'Профайл | BDSEC',
  description: 'Хэрэглэгчийн профайл',
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Profile />
    </Suspense>
  )
} 