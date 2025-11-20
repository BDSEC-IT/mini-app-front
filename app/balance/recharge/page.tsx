import type { Metadata } from 'next'
import RechargeBalance from '@/components/pages/RechargeBalance'

export const metadata: Metadata = {
  title: 'Цэнэглэх | BDSEC',
  description: 'Дансаа цэнэглэх',
}

export default function RechargeBalancePage() {
  return <RechargeBalance />
} 