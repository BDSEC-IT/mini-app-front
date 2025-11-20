import type { Metadata } from 'next'
import AboutUs from '@/components/pages/AboutUs'

export const metadata: Metadata = {
  title: 'Бидний тухай | BDSEC',
  description: 'БиДиСЕК ҮЦК компанийн тухай мэдээлэл',
}

export default function AboutPage() {
  return <AboutUs />
} 