import type { Metadata } from 'next'
import AllOrdersPage from '@/components/pages/AllOrdersPage';

export const metadata: Metadata = {
  title: 'Захиалгын түүх | BDSEC',
  description: 'Таны бүх захиалгын түүх',
}

export default function AllOrders() {
  return <AllOrdersPage />;
}
