import type { Metadata } from 'next'
import Ipo from '@/components/pages/Ipo'

export const metadata: Metadata = {
  title: 'IPO | BDSEC',
  description: 'Анхдагч зах зээл',
}

export default function IpoPage() {
  return <Ipo />
} 