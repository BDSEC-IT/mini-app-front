'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { TradingViewChart } from '../ui/TradingViewChart'
import { useTheme } from '@/contexts/ThemeContext'
import { fetchOrderBook, fetchAllStocks, fetchAllStocksWithCompanyInfo, fetchStockDataWithCompanyInfo, type OrderBookEntry, type StockData, BASE_URL } from '@/lib/api'
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

import { useTranslation } from 'react-i18next';

const DashboardContent = () => {
  const { t } = useTranslation();
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
  const [chartLoading, setChartLoading] = useState(true)
  const [companyDetails, setCompanyDetails] = useState<any>(null)



  // Derive selectedCard robustly
  // Use the same logic as search: match by base symbol
  const selectedCard = allStocks.find(stock => stock.Symbol.split('-')[0] === selectedSymbol.split('-')[0]) || allStocks[0];

  // Detect if the selected symbol is a bond
  const isBond = selectedCard?.Symbol?.toUpperCase().includes('-BD');

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

  const fetchCompanyDetails = useCallback(async () => {
    if (!selectedCard) return;
    try {
      const response = await fetch(`${BASE_URL}/securities/companies?page=1&limit=1&sortField&symbol=${selectedCard.Symbol}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setCompanyDetails(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  }, [selectedCard]);

  // Fetch order book data
  const fetchOrderBookData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchOrderBook(selectedCard?.Symbol || `${selectedSymbol}-O-0000`)
      if (response.status && response.data) {
        setOrderBookData(response.data)
        
        // Use MDEntryTime from the selected stock data if available
        if (selectedStockData?.MDEntryTime) {
          // Extract date and time parts directly from the ISO string
          const isoString = selectedStockData.MDEntryTime;
          const [datePart, timePartWithZ] = isoString.split('T');
          const timePart = timePartWithZ.split('.')[0]; // Removes .000Z
          setLastUpdated(`${datePart} ${timePart}`);
        } else {
          // Fallback to current time, formatted similarly without timezone conversion
          const now = new Date();
          const year = now.getFullYear();
          const month = (now.getMonth() + 1).toString().padStart(2, '0');
          const day = now.getDate().toString().padStart(2, '0');
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          setLastUpdated(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order book data')
      console.error('Error fetching order book:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedSymbol, selectedCard, selectedStockData])



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
    fetchCompanyDetails()
  }, [fetchOrderBookData, fetchCompanyDetails])

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

  

  // Filter stocks based on activeFilter
  useEffect(() => {
    if (!allStocks.length) return
    
    let filtered = [...allStocks]
    
    switch (activeFilter) {
      case 'trending':
        filtered = filtered.sort((a, b) => (b.Volume || 0) - (a.Volume || 0))
        break
      case 'mostActive':
        filtered = filtered.sort((a, b) => {
          const dateA = a.MDEntryTime ? new Date(a.MDEntryTime).getTime() : 0;
          const dateB = b.MDEntryTime ? new Date(b.MDEntryTime).getTime() : 0;
          return dateB - dateA;
        });
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
      case 'bonds':
        filtered = filtered.filter(stock => stock.Symbol.toUpperCase().includes('-BD') && (stock.LastTradedPrice || 0) > 0)
        break
    }
    
    setFilteredStocks(filtered.slice(0, 20));
  }, [allStocks, activeFilter]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm) return []
    const searchLower = searchTerm.toLowerCase()
    return allStocks
      .filter(stock => {
        const symbolMatch = stock.Symbol.toLowerCase().includes(searchLower)
        const mnNameMatch = stock.mnName && stock.mnName.toLowerCase().includes(searchLower)
        const enNameMatch = stock.enName && stock.enName.toLowerCase().includes(searchLower)
        return symbolMatch || mnNameMatch || enNameMatch
      })
      .sort((a, b) => {
        // Prioritize exact symbol matches
        const aSymbol = a.Symbol.toLowerCase()
        const bSymbol = b.Symbol.toLowerCase()
        if (aSymbol === searchLower && bSymbol !== searchLower) return -1
        if (bSymbol === searchLower && aSymbol !== searchLower) return 1
        // Then prioritize symbol starts with
        if (aSymbol.startsWith(searchLower) && !bSymbol.startsWith(searchLower)) return -1
        if (bSymbol.startsWith(searchLower) && !aSymbol.startsWith(searchLower)) return 1
        return 0
      })
      .slice(0, 50)
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

  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);

    let filtered = [...allStocks];

    switch (filter) {
      case 'trending':
        filtered = filtered.sort((a, b) => (b.Volume || 0) - (a.Volume || 0));
        break;
      case 'mostActive':
        filtered = filtered.sort((a, b) => {
          const dateA = a.MDEntryTime ? new Date(a.MDEntryTime).getTime() : 0;
          const dateB = b.MDEntryTime ? new Date(b.MDEntryTime).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'gainers':
        filtered = filtered
          .filter(stock => stock.Changep > 0)
          .sort((a, b) => b.Changep - a.Changep);
        break;
      case 'losers':
        filtered = filtered
          .filter(stock => stock.Changep < 0)
          .sort((a, b) => a.Changep - b.Changep);
        break;
      case 'bonds':
        filtered = filtered.filter(stock => stock.Symbol.toUpperCase().includes('-BD') && (stock.LastTradedPrice || 0) > 0);
        break;
    }

    if (filtered.length > 0) {
      setSelectedSymbol(filtered[0].Symbol.split('-')[0]);
    }
  }, [allStocks]);

  // Update orderbook lastUpdated time when selectedStockData changes
  useEffect(() => {
    if (selectedStockData?.MDEntryTime) {
      setLastUpdated(selectedStockData.MDEntryTime)
    }
  }, [selectedStockData])

  useEffect(() => {
    if (selectedStockData?.MDEntryTime) {
      setChartLoading(false)
    }
  }, [selectedStockData])

  // Set chart loading when selectedSymbol changes
  useEffect(() => {
    setChartLoading(true)
  }, [selectedSymbol])

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="max-w-4xl mx-auto py-4 px-2">
        <StockList
          loading={loading}
          activeFilter={activeFilter}
          filteredStocks={filteredStocks}
          onFilterChange={handleFilterChange}
          onStockSelect={handleStockSelect}
          selectedCard={selectedCard}
        />
        <div className="px-2 sm:px-4 md:px-6 lg:px-8  sm:py-3 relative">
          <StockHeader
            selectedSymbol={selectedSymbol}
            selectedStockData={selectedStockData}
            isSearchOpen={isSearchOpen}
            searchTerm={searchTerm}
            searchResults={searchResults}
            chartLoading={chartLoading}
            onSearchClick={handleSearchClick}
            onSearchClose={handleSearchClose}
            onSearchChange={handleSearchChange}
            onStockSelect={handleStockSelect}
          />
        </div>
      </div>
      {/* Chart section: full-bleed, outside the padded container */}
      {!isBond && (
        <div className="relative w-full max-w-full overflow-hidden">
          <div className="h-[370px] sm:h-[400px] md:h-[420px] lg:h-[440px] rounded-lg bg-transparent">
            <div className="relative w-full h-full overflow-hidden">
              {selectedCard && (
                <TradingViewChart 
                  key={`${selectedSymbol}-${chartRefreshKey}`}
                  symbol={selectedCard.Symbol}
                  theme={theme}
                  period="ALL"
                  onPriceHover={handlePriceHover}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {/* Bond info section */}
      {isBond && selectedStockData && (
        <div className="relative w-full max-w-full overflow-hidden mt-1">
          <div className="rounded-lg bg-orange-50 dark:bg-orange-900/30 p-2">
            <h2 className="text-base font-bold text-orange-800 dark:text-orange-200 mb-1">Бондын дэлгэрэнгүй</h2>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div><span className="font-semibold">{t('dashboard.symbol')}:</span> {selectedStockData.Symbol}</div>
              <div><span className="font-semibold">{t('dashboard.company')}:</span> {selectedStockData.mnName || selectedStockData.enName}</div>
              <div><span className="font-semibold">{t('dashboard.lastPrice')}:</span> {selectedStockData.LastTradedPrice ? (selectedStockData.LastTradedPrice * 1000).toLocaleString() : '-'} ₮</div>
              <div><span className="font-semibold">{t('dashboard.previousClose')}:</span> {selectedStockData.PreviousClose ? (selectedStockData.PreviousClose * 1000).toLocaleString() : '-'} ₮</div>
              <div><span className="font-semibold">{t('dashboard.turnover')}:</span> {selectedStockData.Turnover ? selectedStockData.Turnover.toLocaleString() : '-'}</div>
              <div><span className="font-semibold">{t('dashboard.volume')}:</span> {selectedStockData.Volume ? selectedStockData.Volume.toLocaleString() : '-'}</div>
              <div><span className="font-semibold">MarketSegmentID:</span> {selectedStockData.MarketSegmentID}</div>
              <div><span className="font-semibold">ISIN:</span> {companyDetails?.ISIN}</div>
              <div><span className="font-semibold">Company Code:</span> {companyDetails?.companycode}</div>
              <div><span className="font-semibold">Listing Date:</span> {companyDetails?.changedate}</div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 flex flex-col gap-2 sm:gap-3 ">
        <OrderBook
          selectedSymbol={selectedSymbol}
          loading={loading}
          lastUpdated={lastUpdated}
          processedOrderBook={processedOrderBook}
          onRefresh={fetchOrderBookData}
        />
        <StockDetails
          selectedSymbol={selectedSymbol}
          details={companyDetails}
          infoLabel={isBond ? 'Bond Info' : 'Stock Info'}
        />
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