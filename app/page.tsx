import Dashboard from '@/components/pages/Dashboard'
import { fetchAllStocksWithCompanyInfo } from '@/lib/api'

// Enable ISR with 60 second revalidation
export const revalidate = 60

// Pre-fetch stock data at build time and cache it
export async function generateMetadata() {
  return {
    title: 'Нүүр | BDSEC',
    description: 'МХБ арилжааны платформ'
  }
}

// Server Component - fetches data once and caches
async function getInitialStocks() {
  try {
    const response = await fetchAllStocksWithCompanyInfo()
    return response.data || []
  } catch (error) {
    console.error('Error pre-fetching stocks:', error)
    return []
  }
}

export default async function Home() {
  // Pre-fetch initial data server-side
  const initialStocks = await getInitialStocks()
  
  return <Dashboard initialStocks={initialStocks} />
} 