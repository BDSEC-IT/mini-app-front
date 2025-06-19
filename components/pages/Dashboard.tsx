'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import TradingViewChart from '../ui/TradingViewChart'
import StockInfo from '../ui/StockInfo'
import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown, ArrowDown, ArrowUp, X, TrendingUp, Activity, ChevronRight, BarChart3 } from 'lucide-react'
import { fetchOrderBook, fetchAllStocks, type OrderBookEntry, type StockData } from '@/lib/api'
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
  const [selectedSymbol, setSelectedSymbol] = useState('KHAN')
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('1D')
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
  
  // Autoplay plugin configuration
  const autoplayPlugin = useRef(
    Autoplay({
      delay: 3000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )
  
  // Get the selected stock data
  const selectedStockData = useMemo(() => {
    return allStocks.find(stock => stock.Symbol.split('-')[0] === selectedSymbol) || null;
  }, [selectedSymbol, allStocks]);
  
  // Fetch all stocks data
  const fetchStocksData = useCallback(async () => {
    try {
      const response = await fetchAllStocks();
      if (response.success && response.data) {
        setAllStocks(response.data);
        setFilteredStocks(response.data);
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  }, []);
  
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
    const selectedStockData = allStocks.find(stock => stock.Symbol === selectedSymbol);
    
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
  
  // Fetch order book data on component mount and when symbol changes
  useEffect(() => {
    fetchOrderBookData();
    
    // Set up polling interval
    const interval = setInterval(fetchOrderBookData, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [fetchOrderBookData]);
  
  // Fetch all stocks data on component mount
  useEffect(() => {
    fetchStocksData();
  }, [fetchStocksData]);
  
  // Format price with commas
  const formatPrice = (price: number | undefined) => {
    if (!price) return '-';
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      {/* Stock Index Section */}
      <div className="px-4 py-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{selectedSymbol}</h2>
              {selectedStockData && (
                <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded-full">
                  {selectedStockData.mnName || selectedStockData.enName || t('dashboard.stock')}
                </span>
              )}
            </div>
            
            <div className="mt-2">
              <h1 className="text-3xl font-bold">
                {selectedStockData ? formatPrice(selectedStockData.LastTradedPrice) : '-'} ₮
              </h1>
              {selectedStockData && (
                <div className={`flex items-center text-sm ${selectedStockData.Changep >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {selectedStockData.Changep >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  <span>
                    {selectedStockData.Changes?.toFixed(2)} ({selectedStockData.Changep?.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Search bar - moved to top right */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center border rounded-full px-3 py-2 bg-gray-100 dark:bg-gray-800">
                <Search size={16} className="text-gray-500 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-transparent outline-none w-40 text-sm"
                  placeholder={t('common.search')}
                />
                <button onClick={handleSearchClose} className="ml-2">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSearchClick}
                className="flex items-center border rounded-full px-3 py-2 bg-gray-100 dark:bg-gray-800"
              >
                <Search size={16} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">{t('common.search')}</span>
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {isSearchOpen && searchTerm && (
              <div className="absolute top-full right-0 mt-1 w-64 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border rounded-md shadow-lg z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((stock, index) => {
                    // Get clean symbol without suffix
                    const cleanSymbol = stock.Symbol.split('-')[0];
                    return (
                      <button
                        key={`search-${cleanSymbol}-${index}`}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                        onClick={() => handleStockSelect(stock.Symbol)}
                      >
                        <div className="font-medium">{cleanSymbol}</div>
                        <div className="text-xs text-gray-500">{stock.mnName || stock.enName}</div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">{t('common.noResults')}</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Chart Period Selector */}
        <div className="mt-6 flex border-b">
          {['1H', '1D', '1W', '1M', '1Y', 'All'].map((period) => (
            <button
              key={period}
              className={`px-4 py-2 text-sm ${
                activeTab === period 
                  ? 'bg-indigo-900 text-white rounded-t-md' 
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(period)}
            >
              {period}
            </button>
          ))}
        </div>
        
        {/* Chart */}
        <div className="h-[220px] mt-4">
          <TradingViewChart 
            symbol={`MSE:${selectedSymbol}`}
            theme={theme}
          />
        </div>
      </div>
      
      {/* Stock List Section */}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">{t('dashboard.popularStocks')}</h2>
          <Link href="/stocks" className="text-indigo-600 flex items-center text-sm">
            {t('dashboard.viewAll')} <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {[
            { id: 'trending', label: 'dashboard.trending', icon: TrendingUp },
            { id: 'mostActive', label: 'dashboard.mostActive', icon: Activity },
            { id: 'gainers', label: 'dashboard.gainers', icon: ArrowUp },
            { id: 'losers', label: 'dashboard.losers', icon: ArrowDown }
          ].map((filter) => (
            <button
              key={filter.id}
              className={`px-4 py-2 text-sm rounded-full whitespace-nowrap flex items-center ${
                activeFilter === filter.id
                  ? 'bg-indigo-900 text-white'
                  : 'border text-gray-500'
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              <filter.icon size={14} className="mr-1" />
              {t(filter.label)}
            </button>
          ))}
          
          <div className="ml-auto">
            <button className="border rounded-md px-3 py-1 flex items-center text-sm">
              {t('dashboard.sort')} <ChevronDown size={14} className="ml-1" />
            </button>
          </div>
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
                        className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white p-4 rounded-lg cursor-pointer shadow-md hover:shadow-lg transition-shadow"
                        onClick={() => handleStockSelect(stock.Symbol)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">{stock.Symbol.split('-')[0]}</h3>
                            <p className="text-xs text-gray-300 truncate max-w-[100px]">{stock.mnName || stock.enName}</p>
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isPositive ? '+' : ''}{stock.Changep?.toFixed(2)}%
                          </div>
                        </div>
                        
                        <div className="relative h-16 mb-2">
                          <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
                            {/* Area fill */}
                            <defs>
                              <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={isPositive ? "#4ade80" : "#f87171"} stopOpacity="0.05" />
                              </linearGradient>
                            </defs>
                            
                            {/* Chart line */}
                            <polyline
                              points={chartPoints.map((point, i) => `${i * (100 / (chartPoints.length - 1))},${30 - (point / 100) * 30}`).join(' ')}
                              fill="none"
                              stroke={isPositive ? "#4ade80" : "#f87171"}
                              strokeWidth="2"
                            />
                            
                            {/* Area fill */}
                            <path
                              d={`M0,${30 - (chartPoints[0] / 100) * 30} ${chartPoints.map((point, i) => `L${i * (100 / (chartPoints.length - 1))},${30 - (point / 100) * 30}`).join(' ')} L100,30 L0,30 Z`}
                              fill={`url(#gradient-${index})`}
                            />
                          </svg>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold">{formatPrice(stock.LastTradedPrice)} ₮</div>
                          <div className="text-xs text-gray-300">Vol: {(stock.Volume || 0).toLocaleString()}</div>
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
            <CarouselPrevious className="left-0 bg-indigo-900 text-white border-none" />
            <CarouselNext className="right-0 bg-indigo-900 text-white border-none" />
          </Carousel>
        </div>
        
        {/* Order Book Section */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">{t('dashboard.orderBook')} - {selectedSymbol}</h2>
            <div className="text-xs text-gray-500">{t('dashboard.asOf')} {lastUpdated}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-3 min-h-[200px]">
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm">
              <h3 className="text-sm text-red-500 font-medium mb-2 flex items-center">
                <ArrowDown size={14} className="mr-1" /> {t('dashboard.sell')}
              </h3>
              <div className="space-y-2">
                {loading ? (
                  // Loading placeholders for sell orders
                  Array(5).fill(0).map((_, index) => (
                    <div key={`sell-loading-${index}`} className="flex justify-between text-sm border-b pb-1 last:border-0 animate-pulse">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))
                ) : processedOrderBook.sell.length > 0 ? (
                  processedOrderBook.sell.map((order, index) => {
                    // Calculate opacity based on position (higher = more opaque)
                    const opacity = 0.2 + (index / processedOrderBook.sell.length) * 0.8;
                    return (
                      <div 
                        key={`sell-${order.id}-${index}`} 
                        className="flex justify-between text-sm border-b pb-1 last:border-0"
                        style={{ 
                          background: `linear-gradient(to left, rgba(239, 68, 68, ${opacity * 0.1}), transparent)`
                        }}
                      >
                        <span className="text-red-500 font-medium">{order.MDEntryPx.toLocaleString()} ₮</span>
                        <span>{order.MDEntrySize.toLocaleString()}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 text-sm py-2">{t('dashboard.noSellOrders')}</div>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm">
              <h3 className="text-sm text-green-500 font-medium mb-2 flex items-center">
                <ArrowUp size={14} className="mr-1" /> {t('dashboard.buy')}
              </h3>
              <div className="space-y-2">
                {loading ? (
                  // Loading placeholders for buy orders
                  Array(5).fill(0).map((_, index) => (
                    <div key={`buy-loading-${index}`} className="flex justify-between text-sm border-b pb-1 last:border-0 animate-pulse">
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  ))
                ) : processedOrderBook.buy.length > 0 ? (
                  processedOrderBook.buy.map((order, index) => {
                    // Calculate opacity based on position (higher = more opaque)
                    const opacity = 0.2 + (index / processedOrderBook.buy.length) * 0.8;
                    return (
                      <div 
                        key={`buy-${order.id}-${index}`} 
                        className="flex justify-between text-sm border-b pb-1 last:border-0"
                        style={{ 
                          background: `linear-gradient(to right, rgba(34, 197, 94, ${opacity * 0.1}), transparent)`
                        }}
                      >
                        <span className="text-green-500 font-medium">{order.MDEntryPx.toLocaleString()} ₮</span>
                        <span>{order.MDEntrySize.toLocaleString()}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-400 text-sm py-2">{t('dashboard.noBuyOrders')}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Stock Details Section */}
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-medium mb-3">{t('dashboard.stockDetails')} - {selectedSymbol}</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm p-2 bg-white dark:bg-gray-900 rounded">
                <span className="text-gray-500">ISIN:</span>
                <span className="font-medium">{getStockDetails.isin}</span>
              </div>
              <div className="flex justify-between text-sm p-2 bg-white dark:bg-gray-900 rounded">
                <span className="text-gray-500">{t('dashboard.companyCode')}:</span>
                <span className="font-medium">{getStockDetails.companyCode}</span>
              </div>
              <div className="flex justify-between text-sm p-2 bg-white dark:bg-gray-900 rounded">
                <span className="text-gray-500">{t('dashboard.totalShares')}:</span>
                <span className="font-medium">{getStockDetails.totalShares}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm p-2 bg-white dark:bg-gray-900 rounded">
                <span className="text-gray-500">{t('dashboard.listedShares')}:</span>
                <span className="font-medium">{getStockDetails.listedShares}</span>
              </div>
              <div className="flex justify-between text-sm p-2 bg-white dark:bg-gray-900 rounded">
                <span className="text-gray-500">{t('dashboard.listingDate')}:</span>
                <span className="font-medium">{getStockDetails.listingDate}</span>
              </div>
              <div className="flex justify-between text-sm p-2 bg-white dark:bg-gray-900 rounded">
                <span className="text-gray-500">{t('dashboard.email')}:</span>
                <span className="font-medium">{getStockDetails.email}</span>
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