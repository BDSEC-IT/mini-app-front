'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { TradingViewChart } from '../ui/TradingViewChart'
import { useTheme } from '@/contexts/ThemeContext'
import { fetchOrderBook, fetchAllStocks, fetchAllStocksWithCompanyInfo, fetchStockDataWithCompanyInfo, getUserAccountInformation, type OrderBookEntry, type StockData, BASE_URL } from '@/lib/api'
import socketIOService from '@/lib/socketio'
import { StockHeader } from './dashboard/StockHeader'
import { OrderBook } from './dashboard/OrderBook'
import { StockDetails } from './dashboard/StockDetails'
import { StockList } from './dashboard/StockList'
import { getStockFilterDate, shouldDisplayStock, getDisplayPeriodDescription, isDuringTradingHours, filterTodaysFreshStocks, isTodaysFreshData } from '@/lib/trading-time-utils'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useTranslation } from 'react-i18next'
import Cookies from 'js-cookie'

// Custom hook for intersection observer
const useInView = (threshold = 0.1) => {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect() // Only trigger once
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}



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
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'mn';
  
  // Helper: Format symbol display
  const formatSymbolDisplay = (symbol: string): string => {
    if (!symbol) return '';
    if (symbol.toUpperCase().includes('-BD')) {
      return symbol.split('-BD')[0];
    }
    return symbol.split('-')[0];
  };

  // Helper: Get company name by language
  const getCompanyName = (stock: StockData | null) => {
    if (!stock) return t('dashboard.stock');
    return currentLanguage === 'mn' ? stock.mnName : stock.enName;
  };

  const [selectedSymbol, setSelectedSymbol] = useState('BDS'); // Default to BDS
  const { theme } = useTheme()
  const [activeFilter, setActiveFilter] = useState('mostActive')
  const [orderBookData, setOrderBookData] = useState<OrderBookEntry[]>([])
  const [stocksLoading, setStocksLoading] = useState(true)
  const [orderBookLoading, setOrderBookLoading] = useState(false)
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
  const [stockFilterDate, setStockFilterDate] = useState<string>('')
  const [displayPeriodDescription, setDisplayPeriodDescription] = useState<string>('')
  const [updateQueue, setUpdateQueue] = useState<StockData[]>([])
  const throttleRef = useRef<NodeJS.Timeout | null>(null)
  const [canTrade, setCanTrade] = useState(false)

  // Throttled update function to reduce visual glitching
  const processUpdateQueue = useCallback(() => {
    if (updateQueue.length === 0) return

    setAllStocks(prevStocks => {
      const updatedStocks = [...prevStocks];
      let updatedCount = 0;

      updateQueue.forEach((update) => {
        if (!update || !update.Symbol) return;
        
        const stockIndex = updatedStocks.findIndex(s => s.Symbol === update.Symbol);
        if (stockIndex !== -1) {
          // Only update if data actually changed to prevent unnecessary re-renders
          const currentStock = updatedStocks[stockIndex];
          const hasChanges = (
            currentStock.PreviousClose !== update.PreviousClose ||
            currentStock.Volume !== update.Volume ||
            currentStock.Changep !== update.Changep ||
            currentStock.MDEntryTime !== update.MDEntryTime
          );
          
          if (hasChanges) {
            updatedStocks[stockIndex] = {
              ...currentStock,
              ...update
            };
            updatedCount++;
          }
        }
      });

      if (updatedCount > 0) {
        console.log(`🏠 Dashboard: Processed ${updatedCount} stock updates`);
        setLastUpdated(new Date().toLocaleTimeString());
      }

      return updatedStocks;
    });

    setUpdateQueue([]);
  }, [updateQueue])

  // Process updates every 500ms to reduce glitching
  useEffect(() => {
    if (updateQueue.length > 0) {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      
      throttleRef.current = setTimeout(() => {
        processUpdateQueue();
      }, 800); // 800ms throttle - faster updates for real-time feel like bdsec.mn
    }
    
    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [updateQueue, processUpdateQueue]);

  // Add intersection observers for scroll animations
  const { ref: headerRef, inView: headerInView } = useInView(0.1)
  const { ref: chartRef, inView: chartInView } = useInView(0.1)
  const { ref: bondRef, inView: bondInView } = useInView(0.1)
  const { ref: orderBookRef, inView: orderBookInView } = useInView(0.1)
  const { ref: detailsRef, inView: detailsInView } = useInView(0.1)



  // selectedCard - simple approach that always works
  const selectedCard = selectedStockData || allStocks.find(stock => stock.Symbol.split('-')[0] === selectedSymbol.split('-')[0]) || allStocks[0];

  // selectedStockData for other components - show searched stock even if historical
  const displayStockData = selectedStockData || allStocks.find(stock => stock.Symbol.split('-')[0] === selectedSymbol.split('-')[0]) || allStocks[0];

  // Detect if the selected symbol is a bond
  const isBond = selectedCard?.Symbol?.toUpperCase().includes('-BD');
  
  // Check if current data is fresh or historical  
  const isDataFresh = displayStockData ? isTodaysFreshData(displayStockData.MDEntryTime) : false;

  // Fetch all stocks data with company information
  const fetchStocksData = useCallback(async () => {
    console.log('=== Dashboard: fetchStocksData START ===');
    setStocksLoading(true)
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
    } finally {
      setStocksLoading(false)
    }
    console.log('=== Dashboard: fetchStocksData END ===');
  }, [])

  // Fetch specific stock data for the selected symbol with company information
  const fetchSelectedStockData = useCallback(async () => {
    console.log('=== Dashboard: fetchSelectedStockData START ===');
    console.log('Selected symbol:', selectedSymbol);
    
    try {
      // Construct the full symbol directly to avoid circular dependency
      const baseSymbol = selectedSymbol.split('-')[0]; // Extract base symbol like 'BDS' from 'BDS-O-0000'
      const fullSymbol = `${baseSymbol}-O-0000`;
      console.log('Using full symbol for API call:', fullSymbol);
      console.log('Calling fetchStockDataWithCompanyInfo...');
      const response = await fetchStockDataWithCompanyInfo(fullSymbol)
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
    if (!displayStockData) return;
    try {
      const response = await fetch(`${BASE_URL}/securities/companies?page=1&limit=1&sortField&symbol=${displayStockData.Symbol}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setCompanyDetails(data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  }, [displayStockData]);

  // Fetch order book data
  const fetchOrderBookData = useCallback(async () => {
    try {
      setOrderBookLoading(true)
      setError(null)
      const baseSymbol = selectedSymbol.split('-')[0]; // Extract base symbol
      const fullSymbol = `${baseSymbol}-O-0000`;
      const response = await fetchOrderBook(fullSymbol)
      if (response.status && response.data) {
        setOrderBookData(response.data)
        
        // Use MDEntryTime from the display stock data if available
        if (displayStockData?.MDEntryTime) {
          // Extract date and time parts directly from the ISO string
          const isoString = displayStockData.MDEntryTime;
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
      setOrderBookLoading(false)
    }
  }, [selectedSymbol, displayStockData])



  // Check if user can trade (has MCSD account)
  useEffect(() => {
    const checkTradingStatus = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setCanTrade(false);
        return;
      }

      try {
        const accountInfo = await getUserAccountInformation(token);
        if (accountInfo.success && accountInfo.data) {
          // Check if user has MCSD account with COMPLETED status
          const hasActiveAccount = accountInfo.data.MCSDAccount &&
                                   accountInfo.data.MCSDAccount.DGStatus === 'COMPLETED';
          setCanTrade(hasActiveAccount);
        }
      } catch (error) {
        console.error('Error checking trading status:', error);
        setCanTrade(false);
      }
    };

    checkTradingStatus();
  }, []);

  // Fetch data when component mounts or selectedSymbol changes
  useEffect(() => {
    console.log('=== Dashboard: useEffect triggered ===');
    console.log('fetchStocksData function:', typeof fetchStocksData);
    console.log('fetchSelectedStockData function:', typeof fetchSelectedStockData);

    fetchStocksData()
    fetchSelectedStockData()
  }, [fetchStocksData, fetchSelectedStockData])

  // Initialize Socket.IO for real-time updates
  useEffect(() => {
    const initializeSocketIO = async () => {
      console.log('🏠 Dashboard: Initializing Socket.IO...');
      
      const connected = await socketIOService.connect();
      if (connected) {
        console.log('🏠 Dashboard: Socket.IO connected successfully');
        socketIOService.joinTradingRoom();
        
        // Listen for real-time trading data updates
        socketIOService.onTradingDataUpdate((data: StockData[]) => {
          console.log('🏠 Dashboard: Real-time update received:', data?.length, 'stocks');
          
          // Queue updates instead of immediately applying them
          const dataArray = Array.isArray(data) ? data : [data];
          
          setUpdateQueue(prevQueue => {
            // Merge new updates with existing queue, avoiding duplicates
            const newQueue = [...prevQueue];
            
            dataArray.forEach((update) => {
              if (!update || !update.Symbol) return;
              
              // Remove existing update for the same symbol to avoid duplicates
              const existingIndex = newQueue.findIndex(item => item.Symbol === update.Symbol);
              if (existingIndex !== -1) {
                newQueue[existingIndex] = update;
              } else {
                newQueue.push(update);
              }
            });
            
            return newQueue;
          });
        });
      } else {
        console.log('🏠 Dashboard: Socket.IO connection failed, using periodic refresh');
        // Fallback to periodic refresh every 20 seconds
        const interval = setInterval(() => {
          fetchStocksData();
        }, 20000);
        
        return () => clearInterval(interval);
      }
    };

    initializeSocketIO();

    return () => {
      socketIOService.disconnect();
    };
  }, [])

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
    
    // Process all securities (both bonds and equities) the same way
    const buyOrders = orderBookData
      .filter(entry => entry.MDEntryType === '0')
      .sort((a, b) => (b.MDEntryPx || 0) - (a.MDEntryPx || 0))
      .slice(0, 5)
      
    const sellOrders = orderBookData
      .filter(entry => entry.MDEntryType === '1')
      .sort((a, b) => (a.MDEntryPx || 0) - (b.MDEntryPx || 0))
      .slice(0, 5)
      
    return { buy: buyOrders, sell: sellOrders }
  }, [orderBookData])

  // Helper function to get last trading day date
  const getLastTradingDay = (now: Date = new Date()): Date => {
    const currentDay = now.getDay();
    const lastTrading = new Date(now);
    
    // If it's Monday (1), go back to Friday (3 days)
    // If it's Sunday (0), go back to Friday (2 days)
    // If it's Saturday (6), go back to Friday (1 day)
    // Otherwise, it's a weekday - just use today or yesterday
    
    if (currentDay === 0) { // Sunday
      lastTrading.setDate(lastTrading.getDate() - 2); // Go to Friday
    } else if (currentDay === 6) { // Saturday
      lastTrading.setDate(lastTrading.getDate() - 1); // Go to Friday
    } else if (currentDay === 1) { // Monday before trading hours
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;
      const tradingStartMinutes = 9 * 60 + 30; // 9:30 AM
      
      if (currentTimeInMinutes < tradingStartMinutes) {
        lastTrading.setDate(lastTrading.getDate() - 3); // Go to last Friday
      }
    }
    
    return lastTrading;
  };

  // Helper function to format date in Mongolian
  const formatDateMongolian = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  // Update display description for real-time data
  useEffect(() => {
    const updateDescription = () => {
      const now = new Date();
      const isTrading = isDuringTradingHours(now);
      
      if (isTrading) {
        const formattedDate = formatDateMongolian(now);
        setDisplayPeriodDescription(formattedDate); // Just today's date
      } else {
        const lastTradingDay = getLastTradingDay(now);
        const formattedDate = formatDateMongolian(lastTradingDay);
        setDisplayPeriodDescription(formattedDate); // Just the last trading day date
      }
    };
    
    updateDescription();
    
    // Update every minute to handle trading hour transitions
    const interval = setInterval(updateDescription, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Memoized filtered stocks calculation to prevent unnecessary re-computations
  const filteredStocksMemo = useMemo(() => {
    if (!allStocks.length) return []
    
    // Filter to show only today's fresh trading data (like bdsec.mn real-time table)
    let filtered = filterTodaysFreshStocks(allStocks);
    
    switch (activeFilter) {

      case 'mostActive':
        // Exclude bonds from most active view
        filtered = filtered
          .filter(stock => !stock.Symbol.toUpperCase().includes('-BD'))
          .sort((a, b) => {
            const dateA = a.MDEntryTime ? new Date(a.MDEntryTime).getTime() : 0;
            const dateB = b.MDEntryTime ? new Date(b.MDEntryTime).getTime() : 0;
            return dateB - dateA;
          });
        break
      case 'gainers':
        // Exclude bonds from gainers view
        filtered = filtered
          .filter(stock => !stock.Symbol.toUpperCase().includes('-BD') && stock.Changep > 0)
          .sort((a, b) => b.Changep - a.Changep)
        break
      case 'losers':
        // Exclude bonds from losers view
        filtered = filtered
          .filter(stock => !stock.Symbol.toUpperCase().includes('-BD') && stock.Changep < 0)
          .sort((a, b) => a.Changep - b.Changep)
        break
      case 'bonds':
        // For bonds, don't apply time filter - show all bonds with prices
        filtered = allStocks.filter(stock => stock.Symbol.toUpperCase().includes('-BD') && (stock.LastTradedPrice || 0) > 0)
        break
    }
    
    return filtered.slice(0, 20);
  }, [allStocks, activeFilter]);

  // Update filteredStocks only when memo changes
  useEffect(() => {
    setFilteredStocks(filteredStocksMemo);
  }, [filteredStocksMemo]);

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
  
      case 'mostActive':
        // Exclude bonds from most active view
        filtered = filtered
          .filter(stock => !stock.Symbol.toUpperCase().includes('-BD'))
          .sort((a, b) => {
            const dateA = a.MDEntryTime ? new Date(a.MDEntryTime).getTime() : 0;
            const dateB = b.MDEntryTime ? new Date(b.MDEntryTime).getTime() : 0;
            return dateB - dateA;
          });
        break;
      case 'gainers':
        // Exclude bonds from gainers view
        filtered = filtered
          .filter(stock => !stock.Symbol.toUpperCase().includes('-BD') && stock.Changep > 0)
          .sort((a, b) => b.Changep - a.Changep);
        break;
      case 'losers':
        // Exclude bonds from losers view
        filtered = filtered
          .filter(stock => !stock.Symbol.toUpperCase().includes('-BD') && stock.Changep < 0)
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
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24 p-3 px-2.5 pt-2.5 flex flex-col gap-y-2.5 overflow-hidden overflow-x-hidden">
      
      {/* Search Bar at Top */}
      <div className="w-full mb-1.5 h-[26px]">
        <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <PopoverTrigger asChild>
            <button
              className="w-full flex items-center border rounded-lg px-3 py-1.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
              type="button"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={16} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
              <div className="flex-1 text-left">
                {selectedStockData ? (
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      {formatSymbolDisplay(selectedStockData.Symbol)}
                    </span>
                    <span className="text-gray-400 text-[10px]">•</span>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 truncate">
                      {getCompanyName(selectedStockData)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.searchByCompanyOrSymbol')}</span>
                )}
              </div>
              <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 ml-1.5 flex-shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[calc(100vw-2rem)] sm:w-96 p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg rounded-lg">
            <div className="w-full">
              <div className="flex items-center border rounded-lg px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-800 mb-2">
                <Search size={14} className="text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-transparent outline-none text-gray-900 dark:text-gray-100 flex-1 text-xs"
                  placeholder={t('dashboard.searchByCompanyOrSymbol')}
                  autoFocus
                />
              </div>
              {/* Search Results */}
              {searchTerm && (
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((stock, index) => (
                      <button
                        key={`search-${stock.Symbol}-${index}`}
                        className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-0.5"
                        onClick={() => {
                          handleStockSelect(stock.Symbol);
                          setIsSearchOpen(false);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-xs text-gray-900 dark:text-white">
                              {formatSymbolDisplay(stock.Symbol)}
                            </div>
                            <div className="text-[10px] text-gray-600 dark:text-gray-400 truncate mt-0.5">
                              {getCompanyName(stock)}
                            </div>
                          </div>
                          {stock.Changep !== undefined && (
                            <div className={`ml-2 text-[10px] font-semibold ${
                              stock.Changep >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {stock.Changep >= 0 ? '+' : ''}{stock.Changep.toFixed(2)}%
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                      {t('common.noResults')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    
        <StockList
          loading={stocksLoading}
          activeFilter={activeFilter}
          filteredStocks={filteredStocks}
          onFilterChange={handleFilterChange}
          onStockSelect={handleStockSelect}
          selectedCard={selectedCard}
          displayPeriodDescription={displayPeriodDescription}
        />

      
          {/* Chart section: full-bleed, outside the padded container */}
      {!isBond && (
        <div 
          ref={chartRef}
          className={`relative w-full max-w-full transition-all duration-1000 delay-200 ${
            chartInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="h-[400px] sm:h-[400px] md:h-[420px] lg:h-[440px] rounded-md bg-transparent">
            <div className="relative w-full h-full  ">
              {displayStockData && (
                <TradingViewChart 
                  key={`${selectedSymbol}-${chartRefreshKey}`}
                  symbol={displayStockData.Symbol}
                  theme={theme}
                  period="ALL"
                  onPriceHover={handlePriceHover}
                  selectedStockData={displayStockData}
                  chartLoading={chartLoading}
                  isDataFresh={isDataFresh}
                />
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Bond info section - Keep StockHeader separate for bonds */}
      {isBond && (
        <>
          <div 
            ref={headerRef}
            className={`transition-all duration-1000 ${
              headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <StockHeader
              selectedSymbol={selectedSymbol}
              selectedStockData={displayStockData}
              chartLoading={chartLoading}
              isDataFresh={isDataFresh}
            />
          </div>
        </>
      )}
      {/* Bond info section */}
      {isBond && displayStockData && (
        <div 
          ref={bondRef}
          className={` rounded-md shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-1000 delay-200 ${
            !bondInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="border-b border-gray-100 dark:border-gray-700 p-4 rounded-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="h-6 w-1 bg-bdsec dark:bg-indigo-500 rounded-md"></span>
              {t('dashboard.bondDetails')}
            </h2>
          </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info Section */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('dashboard.symbol')}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCard.Symbol}</div>
                  </div>
                  <div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('dashboard.name')}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCard.mnName || selectedCard.enName}</div>
                  </div>
                  <div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('dashboard.previousClose')}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {selectedCard.LastTradedPrice ? (selectedCard.LastTradedPrice * 1000).toLocaleString() : '-'} ₮
                    </div>
                  </div>
                </div>
                {/* Trading Info Section */}
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('dashboard.turnover')}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {selectedCard.Turnover ? selectedCard.Turnover.toLocaleString() : '-'}
                    </div>
                  </div>
                  {/* <div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('dashboard.volume')}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {selectedCard.Volume ? selectedCard.Volume.toLocaleString() : '-'}
                    </div>
                  </div> */}
                  <div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">ISIN</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {companyDetails?.ISIN || '-'}
                    </div>
                  </div>
                  {/* <div>
                    <div className="text-sm font-normal text-gray-500 dark:text-gray-400">{t('dashboard.listingDate')}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                      {companyDetails?.NominalValue || '-'}
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
      
      )}
    
      <div ref={orderBookRef}>
        <OrderBook
          selectedSymbol={selectedSymbol}
          loading={orderBookLoading}
          lastUpdated={lastUpdated}
          processedOrderBook={processedOrderBook}
          onRefresh={fetchOrderBookData}
          canTrade={canTrade}
        />
      </div>
      
      <div ref={detailsRef}>
        <StockDetails
          selectedSymbol={selectedSymbol}
          details={companyDetails}
          infoLabel={isBond ? 'Bond Info' : 'Компанийн мэдээлэл'}
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