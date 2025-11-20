import type { Metadata } from 'next'
import News from '@/components/pages/News'

export const metadata: Metadata = {
  title: 'Мэдээ | BDSEC',
  description: 'Зах зээлийн мэдээ мэдээлэл',
}

export default function NewsPage() {
  return <News />
}
