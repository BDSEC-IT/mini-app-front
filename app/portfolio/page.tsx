import type { Metadata } from 'next'
import Portfolio from '../../components/pages/Portfolio';

export const metadata: Metadata = {
  title: 'Багц | BDSEC',
  description: 'Таны үнэт цаасны багц',
}

export default function PortfolioPage() {
  return <Portfolio />;
}