import type { Metadata } from 'next'
import FAQ from '@/components/pages/FAQ'

export const metadata: Metadata = {
  title: 'Түгээмэл асуулт | BDSEC',
  description: 'Түгээмэл асуулт хариултууд',
}

export default function FAQPage() {
  return <FAQ />
} 