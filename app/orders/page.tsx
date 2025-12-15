import type { Metadata } from 'next'
import Orders from '@/components/pages/Orders';

export const metadata: Metadata = {
  title: 'Захиалга | BDSEC',
  description: 'Таны захиалгууд',
}

export default function OrdersPage() {
  return <Orders />;
}