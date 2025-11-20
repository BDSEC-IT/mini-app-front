import type { Metadata } from 'next'
import Exchange from '@/components/pages/Exchange'

export const metadata: Metadata = {
  title: 'Арилжаа | BDSEC',
  description: 'Хувьцаа худалдан авах, зарах',
}

export default function ExchangePage() {
  return <Exchange />
} 