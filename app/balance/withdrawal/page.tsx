import type { Metadata } from 'next'
import BalanceWithdrawal from '@/components/pages/BalanceWithdrawal';

export const metadata: Metadata = {
  title: 'Татах | BDSEC',
  description: 'Данснаас мөнгө татах',
}

export default function WithdrawalPage() {
  return <BalanceWithdrawal />;
}