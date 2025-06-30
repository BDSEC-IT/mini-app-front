'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { TradingViewChart } from '../ui/TradingViewChart'
import StockInfo from '../ui/StockInfo'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown, ArrowDown, ArrowUp, X, TrendingUp, Activity, ChevronRight, BarChart3 } from 'lucide-react'
import { fetchOrderBook, fetchAllStocks, fetchStockData, type OrderBookEntry, type StockData } from '@/lib/api'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useAutoAnimate } from '@formkit/auto-animate/react'
import Autoplay from 'embla-carousel-autoplay'
import Link from 'next/link'

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
  const [selectedSymbol, setSelectedSymbol] = useState('BDS')
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('ALL')
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
  const [animationParent] = useAutoAnimate()
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)
  const [hoveredChange, setHoveredChange] = useState<number | null>(null)
  const [hoveredChangePercent, setHoveredChangePercent] = useState<number | null>(null)
  const [selectedStockData, setSelectedStockData] = useState<StockData | null>(null)
  
  // Autoplay plugin configuration
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )
  
  // Fetch all stocks data
  const fetchStocksData = useCallback(async () => {
    try {
      const response = await fetchAllStocks();
      if (response.success && response.data) {
        setAllStocks(response.data);
        setFilteredStocks(response.data);
      } else {
        console.log('Received unsuccessful response:', response);
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
      // Don't throw the error again, just log it
    }
  }, []);
  
  // Fetch specific stock data for the selected symbol
  const fetchSelectedStockData = useCallback(async () => {
    try {
      const response = await fetchStockData(`${selectedSymbol}-O-0000`);
      if (response.success && response.data) {
        // The API returns a single StockData object when fetching by symbol
        const stockData = Array.isArray(response.data) ? response.data[0] : response.data;
        setSelectedStockData(stockData);
      }
    } catch (err) {
      console.error('Error fetching selected stock data:', err);
    }
  }, [selectedSymbol]);
  
  // Fetch order book data
  const fetchOrderBookData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchOrderBook(`${selectedSymbol}-O-0000`);
      if (response.status && response.data) {
        setOrderBookData(response.data);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order book data');
      console.error('Error fetching order book:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol]);

  // Fetch data when component mounts or selectedSymbol changes
  useEffect(() => {
    fetchStocksData();
    fetchSelectedStockData();
  }, [fetchStocksData, fetchSelectedStockData]);

  // Fetch order book when selectedSymbol changes
  useEffect(() => {
    fetchOrderBookData();
  }, [fetchOrderBookData]);

  // Process order book data
  const processedOrderBook = useMemo(() => {
    if (!orderBookData || orderBookData.length === 0) {
      return { buy: [], sell: [] };
    }
    
    const buyOrders = orderBookData
      .filter(entry => entry.MDEntryType === '0')
      .sort((a, b) => b.MDEntryPx - a.MDEntryPx) // Sort by price descending
      .slice(0, 5); // Take top 5
      
    const sellOrders = orderBookData
      .filter(entry => entry.MDEntryType === '1')
      .sort((a, b) => a.MDEntryPx - b.MDEntryPx) // Sort by price ascending
      .slice(0, 5); // Take top 5
      
    return { buy: buyOrders, sell: sellOrders };
  }, [orderBookData]);
  
  // Mock data for stock details - updated to be dynamic based on selected stock
  const getStockDetails = useMemo(() => {
    const selectedStockData = allStocks.find(stock => stock.Symbol.split('-')[0] === selectedSymbol);
    
    return {
      isin: `MN00SBM${selectedStockData?.id || '05643'}`,
      companyCode: selectedStockData?.id?.toString() || '564',
      totalShares: (Math.floor(Math.random() * 50000000) + 1000000).toString(),
      listedShares: (Math.floor(Math.random() * 30000000) + 1000000).toString(),
      marketCap: selectedStockData ? (selectedStockData.LastTradedPrice * 1000000).toFixed(2) : '234132.32',
      listingDate: '2016-07-25',
      email: `info@${selectedSymbol.toLowerCase()}.mn`
    };
  }, [selectedSymbol, allStocks]);
  
  // Filter stocks based on activeFilter
  useEffect(() => {
    if (!allStocks.length) return;
    
    let filtered = [...allStocks];
    
    // Apply category filter
    switch (activeFilter) {
      case 'trending':
        // Sort by volume
        filtered = filtered.sort((a, b) => (b.Volume || 0) - (a.Volume || 0));
        break;
      case 'mostActive':
        // Sort by turnover
        filtered = filtered.sort((a, b) => (b.Turnover || 0) - (a.Turnover || 0));
        break;
      case 'gainers':
        // Sort by positive change percentage
        filtered = filtered
          .filter(stock => stock.Changep > 0)
          .sort((a, b) => b.Changep - a.Changep);
        break;
      case 'losers':
        // Sort by negative change percentage
        filtered = filtered
          .filter(stock => stock.Changep < 0)
          .sort((a, b) => a.Changep - b.Changep);
        break;
    }
    
    setFilteredStocks(filtered.slice(0, 20)); // Limit to 20 stocks for performance
  }, [allStocks, activeFilter]);
  
  // Handle search input
  const handleSearchClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };
  
  const handleSearchClose = () => {
    setSearchTerm('');
    setIsSearchOpen(false);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter search results separately from category filters
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    
    // Filter and ensure unique symbols
    const uniqueSymbols = new Set();
    return allStocks
      .filter(stock => {
        // Check if symbol matches search term
        const matches = stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (stock.mnName && stock.mnName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (stock.enName && stock.enName.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Only include if it matches and we haven't seen this symbol yet
        if (matches) {
          // Extract the base symbol without the -O-0000 suffix
          const baseSymbol = stock.Symbol.split('-')[0];
          if (!uniqueSymbols.has(baseSymbol)) {
            uniqueSymbols.add(baseSymbol);
            return true;
          }
        }
        return false;
      })
      .slice(0, 10);
  }, [allStocks, searchTerm]);
  
  const handleStockSelect = (symbol: string) => {
    // Extract the base symbol without any suffix
    const baseSymbol = symbol.split('-')[0];
    setSelectedSymbol(baseSymbol);
    setSearchTerm('');
    setIsSearchOpen(false);
    
    // Immediately fetch order book data for the selected symbol
    setLoading(true);
    setError(null);
    fetchOrderBook(`${baseSymbol}-O-0000`)
      .then(response => {
        if (response.status && response.data) {
          setOrderBookData(response.data);
          setLastUpdated(new Date().toLocaleString());
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch order book data');
        console.error('Error fetching order book:', err);
      })
      .finally(() => {
        setLoading(false);
      });
    
    // Also fetch the specific stock data
    fetchStockData(`${baseSymbol}-O-0000`)
      .then(response => {
        if (response.success && response.data) {
          const stockData = Array.isArray(response.data) ? response.data[0] : response.data;
          setSelectedStockData(stockData);
        }
      })
      .catch(err => {
        console.error('Error fetching selected stock data:', err);
      });
  };
  
  // Generate chart data points for mini charts
  const generateChartData = (isPositive: boolean) => {
    // Generate random data points
    const points = [];
    let prev = 50 + Math.random() * 10;
    for (let i = 0; i < 10; i++) {
      const change = (Math.random() - (isPositive ? 0.3 : 0.7)) * 10;
      prev = Math.max(0, Math.min(100, prev + change));
      points.push(prev);
    }
    return points;
  };
  
  // Format price with thousand separators
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) return '-';
    return price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  
  const handlePriceHover = (price: number | null, change?: number, changePercent?: number) => {
    setHoveredPrice(price);
    setHoveredChange(change ?? null);
    setHoveredChangePercent(changePercent ?? null);
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      {/* Stock Index Section */}
      <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold">{selectedSymbol}</h2>
              {selectedStockData && (
                <span className="text-xs bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 px-2 py-1 rounded-full">
                  {selectedStockData.mnName || selectedStockData.enName || t('dashboard.stock')}
                </span>
              )}
            </div>
            
            <div className="mt-2">
              <div className="">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                  {selectedStockData ? formatPrice(selectedStockData.PreviousClose) : '-'} ₮
                </h1>
              </div>
            </div>
          </div>
          
          {/* Search bar - optimized for mobile */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center border rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-800 w-44 sm:w-52">
                <Search size={12} className="text-gray-500 mr-1.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-transparent outline-none flex-1 text-xs sm:text-sm"
                  placeholder={t('common.search')}
                />
                <button onClick={handleSearchClose} className="ml-1">
                  <X size={12} className="text-gray-500" />
                </button>
              </div>
            ) : selectedStockData ? (
              <div className="flex items-center border rounded-md px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 max-w-44 sm:max-w-52">
                <Search size={12} className="text-blue-500 mr-1" />
                <div className="flex items-center text-xs min-w-0 overflow-hidden">
                  <span className="font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">{selectedSymbol}</span>
                  <span className="mx-1 text-blue-400 text-xs flex-shrink-0">•</span>
                  <span className="text-blue-600 dark:text-blue-400 truncate text-xs">
                    {(selectedStockData.mnName || selectedStockData.enName || '').substring(0, 8)}
                  </span>
                </div>
                <button onClick={handleSearchClick} className="ml-1 flex-shrink-0">
                  <ChevronDown size={12} className="text-blue-500" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSearchClick}
                className="flex items-center border rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Search size={12} className="text-gray-500 mr-1" />
                <span className="text-xs text-gray-500">{t('common.search')}</span>
              </button>
            )}
            
            {/* Search Results Dropdown - more compact */}
            {isSearchOpen && searchTerm && (
              <div className="absolute top-full right-0 mt-1 w-64 sm:w-72 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border rounded-md shadow-lg z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((stock, index) => {
                    // Get clean symbol without suffix
                    const cleanSymbol = stock.Symbol.split('-')[0];
                    const companyName = stock.mnName || stock.enName || '';
                    return (
                      <button
                        key={`search-${cleanSymbol}-${index}`}
                        className="w-full text-left px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm transition-colors"
                        onClick={() => handleStockSelect(stock.Symbol)}
                      >
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white">{cleanSymbol}</span>
                          <span className="mx-1.5 text-gray-400 text-xs">•</span>
                          <span className="text-gray-600 dark:text-gray-300 truncate text-xs">{companyName}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-2.5 py-2 text-xs text-gray-500">{t('common.noResults')}</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Chart section with full width on mobile */}
        <div className="relative -mx-2 sm:mx-0">
          <div className="h-[350px] sm:h-[380px] md:h-[400px] lg:h-[420px] mt-4 mb-8 sm:mb-12 rounded-none sm:rounded-lg overflow-visible bg-transparent">
            <div className="flex justify-between items-center mb-2 px-2 sm:px-4">
              <div className="text-sm text-gray-500">
                {hoveredPrice ? (
                  <span className="font-medium text-bdsec dark:text-indigo-400">
                    {hoveredPrice.toLocaleString()} ₮
                  </span>
                ) : selectedStockData?.PreviousClose ? (
                  <span className="font-medium text-bdsec dark:text-indigo-400">
                    {selectedStockData.PreviousClose.toLocaleString()} ₮
                  </span>
                ) : null}
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
            <div className="relative z-10">
              <TradingViewChart 
                symbol={`${selectedSymbol}-O-0000`}
                theme={theme}
                period={activeTab}
                onPriceHover={handlePriceHover}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Stock List and Order Book Sections with reduced margins */}
      <div className="px-2 sm:px-4 flex flex-col gap-4 sm:gap-6 mt-10 sm:mt-12">
        {/* Stock Info Card */}
        <div className="w-full">
          <StockInfo 
            symbol={selectedSymbol}
            onSymbolSelect={handleStockSelect}
          />
        </div>
        
        {/* Stock List Section */}
        <div className="w-full">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">{t('dashboard.popularStocks')}</h2>
            <Link 
              href="/stocks" 
              className="flex items-center px-3 py-1.5 bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 rounded-md hover:bg-bdsec/20 dark:hover:bg-indigo-500/30 transition-colors"
            >
              {t('dashboard.viewAll')} <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-2 mt-2 flex-wrap pb-2">
            {[
              { id: 'trending', label: t('dashboard.trending'), icon: TrendingUp },
              { id: 'mostActive', label: t('dashboard.mostActive'), icon: Activity },
              { id: 'gainers', label: t('dashboard.gainers'), icon: ArrowUp },
              { id: 'losers', label: t('dashboard.losers'), icon: ArrowDown }
            ].map((filter) => (
              <button
                key={filter.id}
                className={`px-4 py-2 text-sm rounded-full whitespace-nowrap flex items-center ${
                  activeFilter === filter.id
                    ? 'bg-bdsec dark:bg-bdsec-dark  text-white'
                    : 'border text-gray-500'
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <filter.icon size={14} className="mr-1" />
                {filter.label}
              </button>
            ))}
            
           
          </div>
          
          {/* Stock Cards Carousel */}
          <div className="mt-4" ref={animationParent}>
            <Carousel
              opts={{
                align: "start",
                loop: true,
                skipSnaps: false,
                containScroll: "trimSnaps",
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock, index) => {
                    // Generate random chart points for each stock
                    const isPositive = stock.Changep >= 0;
                    const chartPoints = generateChartData(isPositive);
                    const pointsString = chartPoints.join(',');
                    
                    return (
                      <CarouselItem key={`${stock.Symbol}-${index}`} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <div 
                          className="bg-bdsec dark:bg-indigo-600 text-white p-4 rounded-lg cursor-pointer relative overflow-hidden
                                     shadow-[0_4px_14px_rgba(33,33,79,0.3)] dark:shadow-[0_4px_14px_rgba(99,102,241,0.3)]
                                     transition-all duration-300"
                          onClick={() => handleStockSelect(stock.Symbol)}
                        >
                          {/* Always visible glow overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-bdsec/40 to-transparent dark:from-indigo-500/40 dark:to-transparent opacity-70"></div>
                          
                          <div className="flex justify-between items-start mb-3 relative z-10">
                            <div>
                              <h3 className="font-bold text-lg">{stock.Symbol.split('-')[0]}</h3>
                              <p className="text-xs text-gray-300 truncate max-w-[100px]">{stock.mnName || stock.enName}</p>
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {isPositive ? '+' : ''}{stock.Changep?.toFixed(2)}%
                            </div>
                          </div>
                          
                          <div className="relative h-16 mb-2 z-10">
                            <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                              {/* Area fill */}
                              <defs>
                                <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity="0.4" />
                                  <stop offset="100%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity="0.05" />
                                </linearGradient>
                              </defs>
                              
                              {/* Chart line */}
                              <polyline
                                points={chartPoints.map((point, i) => `${i * (100 / (chartPoints.length - 1))},${30 - (point / 100) * 30}`).join(' ')}
                                fill="none"
                                stroke={isPositive ? "#4ade80" : "#f87171"}
                                strokeWidth="1.5"
                              />
                              
                              {/* Area fill */}
                              <path
                                d={`M0,${30 - (chartPoints[0] / 100) * 30} ${chartPoints.map((point, i) => `L${i * (100 / (chartPoints.length - 1))},${30 - (point / 100) * 30}`).join(' ')} L100,30 L0,30 Z`}
                                fill={`url(#gradient-${index})`}
                              />
                            </svg>
                          </div>
                          
                          <div className="flex justify-between items-center relative z-10">
                            <div className="text-lg font-bold">{formatPrice(stock.PreviousClose)} ₮</div>
                            {/* <div className="text-xs text-gray-300">Vol: {(stock.Volume || 0).toLocaleString()}</div> */}
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })
                ) : (
                  <CarouselItem className="pl-2 md:pl-4 basis-full">
                    <div className="h-24 flex items-center justify-center">
                      <p className="text-gray-500">{loading ? t('dashboard.loadingStocks') : t('common.noResults')}</p>
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="left-0 bg-bdsec dark:bg-indigo-500 text-white border-none shadow-lg hover:bg-bdsec/90 dark:hover:bg-indigo-600 transition-colors" />
              <CarouselNext className="right-0 bg-bdsec dark:bg-indigo-500 text-white border-none shadow-lg hover:bg-bdsec/90 dark:hover:bg-indigo-600 transition-colors" />
            </Carousel>
          </div>
        </div>
        
        {/* Order Book Section */}
        <div className="w-full">
          <div className="mt-8 p-4 ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-medium flex items-center">
                <Activity size={16} className="mr-2 text-bdsec dark:text-indigo-400" />
                {t('dashboard.orderBook')} - {selectedSymbol}
              </h2>
              <div className="text-xs text-right text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
                <div className="hidden sm:block">{t('dashboard.lastUpdated')}</div>
                <div className="text-xs">{lastUpdated}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-3 min-h-[200px]">
              {/* Sell Orders */}
              <div className="overflow-hidden">
                <div className="px-2 sm:px-4 py-2 bg-red-50 dark:bg-red-900/10">
                  <h3 className="text-xs sm:text-sm text-red-500 font-medium flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowDown size={12} className="mr-1" /> {t('dashboard.sell')}
                    </span>
                    <span className="text-xs text-gray-500">{t('dashboard.quantity')}</span>
                  </h3>
                </div>
                <div className="p-2 sm:p-3">
                  {loading ? (
                    // Loading placeholders for sell orders
                    Array(5).fill(0).map((_, index) => (
                      <div key={`sell-loading-${index}`} className="flex justify-between text-xs sm:text-sm py-2 animate-pulse">
                        <div className="h-3 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))
                  ) : processedOrderBook.sell.length > 0 ? (
                    processedOrderBook.sell.map((order, index) => {
                   
                      return (
                        <div 
                          key={`sell-${order.id}-${index}`} 
                          className="flex justify-between text-xs sm:text-sm py-1.5 sm:py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
                        >
                          <span className="text-red-500 font-medium" >
                            {order.MDEntryPx.toLocaleString()} ₮
                          </span>
                          <span className="bg-red-50 dark:bg-red-900/10 px-1.5 sm:px-2 rounded text-gray-700 dark:text-gray-300 text-xs">
                            {order.MDEntrySize.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-6">{t('dashboard.noSellOrders')}</div>
                  )}
                </div>
              </div>
              
              {/* Buy Orders */}
              <div className="overflow-hidden">
                <div className="px-2 sm:px-4 py-2 bg-green-50 dark:bg-green-900/10">
                  <h3 className="text-xs sm:text-sm text-green-500 font-medium flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowUp size={12} className="mr-1" /> {t('dashboard.buy')}
                    </span>
                    <span className="text-xs text-gray-500">{t('dashboard.quantity')}</span>
                  </h3>
                </div>
                <div className="p-2 sm:p-3">
                  {loading ? (
                    // Loading placeholders for buy orders
                    Array(5).fill(0).map((_, index) => (
                      <div key={`buy-loading-${index}`} className="flex justify-between text-xs sm:text-sm py-2 animate-pulse">
                        <div className="h-3 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-3 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))
                  ) : processedOrderBook.buy.length > 0 ? (
                    processedOrderBook.buy.map((order, index) => {
                      // Calculate opacity based on position (higher index = lower opacity)
                   
                      return (
                        <div 
                          key={`buy-${order.id}-${index}`} 
                          className="flex justify-between text-xs sm:text-sm py-1.5 sm:py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
                        >
                          <span className="text-green-500 font-medium" >
                            {order.MDEntryPx.toLocaleString()} ₮
                          </span>
                          <span className="bg-green-50 dark:bg-green-900/10 px-1.5 sm:px-2 rounded text-gray-700 dark:text-gray-300 text-xs">
                            {order.MDEntrySize.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-6">{t('dashboard.noBuyOrders')}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Stock Details Section */}
          <div className="mt-6 p-4  ">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <BarChart3 size={18} className="mr-2 text-bdsec dark:text-indigo-400" />
              {t('dashboard.stockDetails')} - {selectedSymbol}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className=" overflow-hidden">
            
                <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-500">ISIN:</span>
                    <span className="text-sm font-medium">{getStockDetails.isin}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-500">{t('dashboard.companyCode')}:</span>
                    <span className="text-sm font-medium">{getStockDetails.companyCode}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-500">{t('dashboard.email')}:</span>
                    <span className="text-sm font-medium text-bdsec dark:text-indigo-400">{getStockDetails.email}</span>
                  </div>
                </div>
              </div>
              
              <div className=" overflow-hidden">
          
                <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-500">{t('dashboard.totalShares')}:</span>
                    <span className="text-sm font-medium">{getStockDetails.totalShares}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-500">{t('dashboard.listedShares')}:</span>
                    <span className="text-sm font-medium">{getStockDetails.listedShares}</span>
                  </div>
                  <div className="flex justify-between items-center p-3">
                    <span className="text-sm text-gray-500">{t('dashboard.listingDate')}:</span>
                    <span className="text-sm font-medium">{getStockDetails.listingDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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