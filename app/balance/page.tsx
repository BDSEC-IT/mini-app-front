import type { Metadata } from 'next'
import Balance from '@/components/pages/Balance'

export const metadata: Metadata = {
  title: 'Үлдэгдэл | BDSEC',
  description: 'Дансны үлдэгдэл болон гүйлгээний түүх',
}

export default function BalancePage() {
  return <Balance />
} 