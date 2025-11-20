import type { Metadata } from 'next'
import AllStocks from '@/components/pages/AllStocks'

export const metadata: Metadata = {
  title: 'Хувьцаа | BDSEC',
  description: 'МХБ дээр арилжаалагдаж буй хувьцааны жагсаалт',
}

export default function StocksPage() {
  return <AllStocks />
} 