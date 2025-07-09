'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { TradingViewChart } from '../ui/TradingViewChart'
import { useTheme } from '@/contexts/ThemeContext'
import { fetchOrderBook, fetchAllStocks, fetchAllStocksWithCompanyInfo, fetchStockDataWithCompanyInfo, type OrderBookEntry, type StockData } from '@/lib/api'
import { StockHeader } from './dashboard/StockHeader'
import { OrderBook } from './dashboard/OrderBook'
import { StockDetails } from './dashboard/StockDetails'
import { StockList } from './dashboard/StockList'

// Client-only wrapper component
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  return <>{children}</>
}

const DashboardContent = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BDS'); // Default to BDS
  const { theme } = useTheme()
  const [activeFilter, setActiveFilter] = useState('trending')
  const [orderBookData, setOrderBookData] = useState<OrderBookEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [allStocks, setAllStocks] = useState<StockData[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)
  const [hoveredChange, setHoveredChange] = useState<number | null>(null)
  const [hoveredChangePercent, setHoveredChangePercent] = useState<number | null>(null)
  const [selectedStockData, setSelectedStockData] = useState<StockData | null>(null)
  const [chartRefreshKey, setChartRefreshKey] = useState<number>(0)
  const [latestEntryTime, setLatestEntryTime] = useState<string>('')
  const [chartLoading, setChartLoading] = useState(true)

  // Derive selectedCard robustly
  // Use the same logic as search: match by base symbol
  const selectedCard = allStocks.find(stock => stock.Symbol.split('-')[0] === selectedSymbol.split('-')[0]) || allStocks[0];

  // Fetch all stocks data with company information
  const fetchStocksData = useCallback(async () => {
    console.log('=== Dashboard: fetchStocksData START ===');
    try {
      console.log('Calling fetchAllStocksWithCompanyInfo...');
      const response = await fetchAllStocksWithCompanyInfo()
      console.log('fetchStocksData response:', response.success, response.data ? response.data.length : 0, 'stocks');
      
      if (response.success && response.data) {
        setAllStocks(response.data)
        setFilteredStocks(response.data)
      }
    } catch (err) {
      console.error('Error fetching stocks:', err)
    }
    console.log('=== Dashboard: fetchStocksData END ===');
  }, [])

  // Fetch specific stock data for the selected symbol with company information
  const fetchSelectedStockData = useCallback(async () => {
    console.log('=== Dashboard: fetchSelectedStockData START ===');
    console.log('Selected symbol:', selectedSymbol);
    
    try {
      console.log('Calling fetchStockDataWithCompanyInfo...');
      const response = await fetchStockDataWithCompanyInfo(selectedSymbol)
      console.log('Response received:', response.success, response.data ? 'has data' : 'no data');
      
      if (response.success && response.data) {
        const stockData = Array.isArray(response.data) ? response.data[0] : response.data
        console.log('Stock data:', stockData);
        setSelectedStockData(stockData)
      }
    } catch (err) {
      console.error('Error fetching selected stock data:', err)
    }
    
    console.log('=== Dashboard: fetchSelectedStockData END ===');
  }, [selectedSymbol])

  // Fetch order book data
  const fetchOrderBookData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchOrderBook(selectedCard?.Symbol || `${selectedSymbol}-O-0000`)
      if (response.status && response.data) {
        setOrderBookData(response.data)
        setLastUpdated(new Date().toLocaleString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order book data')
      console.error('Error fetching order book:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedSymbol, selectedCard])

  // Fetch data when component mounts or selectedSymbol changes
  useEffect(() => {
    console.log('=== Dashboard: useEffect triggered ===');
    console.log('fetchStocksData function:', typeof fetchStocksData);
    console.log('fetchSelectedStockData function:', typeof fetchSelectedStockData);
    
    fetchStocksData()
    fetchSelectedStockData()
  }, [fetchStocksData, fetchSelectedStockData])

  // Ensure selectedSymbol is always set on initial load. Default to 'BDS', but if not present in allStocks, set to the first available symbol after allStocks loads. This guarantees the selected card is always shown, even after refresh.
  useEffect(() => {
    if (
      (!selectedSymbol || !allStocks.some(stock => stock.Symbol.split('-')[0] === selectedSymbol.split('-')[0])) &&
      allStocks.length > 0
    ) {
      // If default symbol is not present, select the first available base symbol
      setSelectedSymbol(allStocks[0].Symbol.split('-')[0]);
    }
  }, [allStocks, selectedSymbol]);

  // Fetch order book when selectedSymbol changes
  useEffect(() => {
    fetchOrderBookData()
  }, [fetchOrderBookData])

  // Process order book data
  const processedOrderBook = useMemo(() => {
    if (!orderBookData || orderBookData.length === 0) {
      return { buy: [], sell: [] }
    }
    
    const buyOrders = orderBookData
      .filter(entry => entry.MDEntryType === '0')
      .sort((a, b) => b.MDEntryPx - a.MDEntryPx)
      .slice(0, 5)
      
    const sellOrders = orderBookData
      .filter(entry => entry.MDEntryType === '1')
      .sort((a, b) => a.MDEntryPx - b.MDEntryPx)
      .slice(0, 5)
      
    return { buy: buyOrders, sell: sellOrders }
  }, [orderBookData])

  // Mock data for stock details
  const getStockDetails = useMemo(() => {
    const selectedStockData = allStocks.find(stock => stock.Symbol.split('-')[0] === selectedSymbol.split('-')[0])
    return {
      isin: `MN00SBM${selectedStockData?.id || '05643'}`,
      companyCode: selectedStockData?.id?.toString() || '564',
      totalShares: (Math.floor(Math.random() * 50000000) + 1000000).toString(),
      listedShares: (Math.floor(Math.random() * 30000000) + 1000000).toString(),
      marketCap: selectedStockData ? (selectedStockData.LastTradedPrice * 1000000).toFixed(2) : '234132.32',
      listingDate: '2016-07-25'
    }
  }, [selectedSymbol, allStocks])

  // Filter stocks based on activeFilter
  useEffect(() => {
    if (!allStocks.length) return
    
    let filtered = [...allStocks]
    
    switch (activeFilter) {
      case 'trending':
        filtered = filtered.sort((a, b) => (b.Volume || 0) - (a.Volume || 0))
        break
      case 'mostActive':
        filtered = filtered.sort((a, b) => (b.Turnover || 0) - (a.Turnover || 0))
        break
      case 'gainers':
        filtered = filtered
          .filter(stock => stock.Changep > 0)
          .sort((a, b) => b.Changep - a.Changep)
        break
      case 'losers':
        filtered = filtered
          .filter(stock => stock.Changep < 0)
          .sort((a, b) => a.Changep - b.Changep)
        break
    }
    
    setFilteredStocks(filtered.slice(0, 20))
  }, [allStocks, activeFilter])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm) return []
    
    const uniqueSymbols = new Set()
    const searchLower = searchTerm.toLowerCase()
    
    return allStocks
      .filter(stock => {
        const baseSymbol = stock.Symbol.split('-')[0]
        const symbolMatch = baseSymbol.toLowerCase().includes(searchLower)
        const mnNameMatch = stock.mnName && stock.mnName.toLowerCase().includes(searchLower)
        const enNameMatch = stock.enName && stock.enName.toLowerCase().includes(searchLower)
        
        const matches = symbolMatch || mnNameMatch || enNameMatch
        
        if (matches && !uniqueSymbols.has(baseSymbol)) {
          uniqueSymbols.add(baseSymbol)
          return true
        }
        return false
      })
      .sort((a, b) => {
        // Prioritize exact symbol matches
        const aBaseSymbol = a.Symbol.split('-')[0].toLowerCase()
        const bBaseSymbol = b.Symbol.split('-')[0].toLowerCase()
        
        if (aBaseSymbol === searchLower && bBaseSymbol !== searchLower) return -1
        if (bBaseSymbol === searchLower && aBaseSymbol !== searchLower) return 1
        
        // Then prioritize symbol starts with
        if (aBaseSymbol.startsWith(searchLower) && !bBaseSymbol.startsWith(searchLower)) return -1
        if (bBaseSymbol.startsWith(searchLower) && !aBaseSymbol.startsWith(searchLower)) return 1
        
        return 0
      })
      .slice(0, 10)
  }, [allStocks, searchTerm])

  const handleStockSelect = (symbol: string) => {
    // Always set the new symbol, even if it's the same
    setSelectedSymbol(symbol)
    // Clear search and close search dropdown
    setSearchTerm('')
    setIsSearchOpen(false)
    setHoveredPrice(null)
    setHoveredChange(null)
    setHoveredChangePercent(null)
    // Force chart refresh by incrementing the key
    setChartRefreshKey(prev => prev + 1)
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchClick = () => {
    setIsSearchOpen(true)
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus()
      }
    }, 100)
  }

  const handleSearchClose = () => {
    setSearchTerm('')
    setIsSearchOpen(false)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handlePriceHover = (price: number | null, change?: number, changePercent?: number) => {
    setHoveredPrice(price)
    setHoveredChange(change ?? null)
    setHoveredChangePercent(changePercent ?? null)
  }

  const handleLatestTimeUpdate = (latestTime: string) => {
    setLatestEntryTime(latestTime)
  }

  useEffect(() => {
    if (latestEntryTime) setChartLoading(false)
  }, [latestEntryTime])

  useEffect(() => {
    setChartLoading(true)
    setLatestEntryTime('')
  }, [selectedSymbol])

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="max-w-4xl mx-auto py-8">
        <StockList
          loading={loading}
          activeFilter={activeFilter}
          filteredStocks={filteredStocks}
          onFilterChange={setActiveFilter}
          onStockSelect={handleStockSelect}
          selectedCard={selectedCard}
        />
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 relative">
          <StockHeader
            selectedSymbol={selectedSymbol}
            selectedStockData={selectedStockData}
            isSearchOpen={isSearchOpen}
            searchTerm={searchTerm}
            searchResults={searchResults}
            chartLoading={chartLoading}
            latestEntryTime={latestEntryTime}
            onSearchClick={handleSearchClick}
            onSearchClose={handleSearchClose}
            onSearchChange={handleSearchChange}
            onStockSelect={handleStockSelect}
          />

          <div className="relative w-full max-w-full overflow-hidden">
            <div className="h-[350px] sm:h-[380px] md:h-[400px] lg:h-[420px] mt-4 mb-8 sm:mb-12 rounded-lg bg-transparent mx-2 sm:mx-0">
              <div className="relative w-full h-full overflow-hidden">
                {selectedCard && (
                  <TradingViewChart 
                    key={`${selectedSymbol}-${chartRefreshKey}`}
                    symbol={selectedCard.Symbol}
                    theme={theme}
                    period="ALL"
                    onPriceHover={handlePriceHover}
                    onLatestTimeUpdate={handleLatestTimeUpdate}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-4 flex flex-col gap-4 sm:gap-6 mt-10 sm:mt-12">


          <OrderBook
            selectedSymbol={selectedSymbol}
            loading={loading}
            lastUpdated={lastUpdated}
            processedOrderBook={processedOrderBook}
          />

          <StockDetails
            selectedSymbol={selectedSymbol}
            details={getStockDetails}
          />
        </div>
      </div>
    </div>
  )
}

const Dashboard = () => {
  return (
    <ClientOnly>
      <DashboardContent />
    </ClientOnly>
  )
}

export default Dashboard