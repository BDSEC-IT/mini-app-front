'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'next/navigation'
import { ArrowDown, ArrowUp, ChevronDown, Search, X, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { fetchAllStocks, type StockData } from '@/lib/api'
import socketIOService from '@/lib/socketio'
// import { testBackendDevConfig } from '@/lib/simple-socket-test' // Disabled
import realTimePollingService from '@/lib/realtime-polling'
import { getStockFilterDate, shouldDisplayStock, getDisplayPeriodDescription } from '@/lib/trading-time-utils'
import StockAverageModal from '../pages/StockAverageModal'
import FullStockTableModal from './FullStockTableModal';

// Define stock categories
interface Category {
  id: string;
  name: string;
  mnName: string;
}
const AllStocks = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language || 'mn';
  const searchParams = useSearchParams()


  
  // Helper function to get company name based on current language
  const getCompanyName = useCallback((stock: StockData) => {
    return currentLanguage === 'mn' ? stock.mnName : stock.enName;
  }, [currentLanguage]);

   const [isModalOpen, setIsModalOpen] = useState(false)
  const [allStocks, setAllStocks] = useState<StockData[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'I': true,
    'II': true,
    'III': true,
    'FUND': true,
    'BOND': true,
    'IABS': true
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' })
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [previousStockValues, setPreviousStockValues] = useState<{ [symbol: string]: { price: number; change: number } }>({})
  const [blinkingRows, setBlinkingRows] = useState<Map<string, 'gain' | 'loss'>>(new Map());
  const [isFullTableModalOpen, setIsFullTableModalOpen] = useState(false);
  const [stockFilterDate, setStockFilterDate] = useState<string>('');
  const [displayPeriodDescription, setDisplayPeriodDescription] = useState<string>('');

  // Set active tab from URL query parameter on initial load
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'gainers' || filter === 'losers') {
      setActiveTab(filter);
    }
  }, [searchParams]);

  // Stock categories
  const categories: Category[] = useMemo(() => [
    { id: 'all', name: t('allStocks.all'), mnName: t('allStocks.all') },
    { id: 'I', name: t('allStocks.categoryI'), mnName: t('allStocks.categoryI') },
    { id: 'II', name: t('allStocks.categoryII'), mnName: t('allStocks.categoryII') },
    { id: 'III', name: t('allStocks.categoryIII'), mnName: t('allStocks.categoryIII') },
    { id: 'FUND', name: 'Хөрөнгө оруулалтын сан', mnName: 'Хөрөнгө оруулалтын сан' },
    { id: 'BOND', name: 'Компанийн бонд', mnName: 'Компанийн бонд' },
    { id: 'IABS', name: 'Хөрөнгөөр баталгаажсан үнэт цаас', mnName: 'Хөрөнгөөр баталгаажсан үнэт цаас' }
  ], [t]);

  // Fetch all stocks data
  const fetchStocksData = useCallback(async () => {
      try {
        setLoading(true)
      const response = await fetchAllStocks()
      if (response.success && response.data) {
        const uniqueStocks = filterUniqueStocks(response.data)
        
        setAllStocks(uniqueStocks)
        setFilteredStocks(uniqueStocks)
      }
      } catch (err) {
      console.error('Error fetching stocks:', err)
      } finally {
        setLoading(false)
      }
  }, [])

  // Filter unique stocks (removing duplicates with -O-0000 suffix)
  const filterUniqueStocks = (stocks: StockData[]) => {
    const uniqueSymbols = new Map<string, StockData>()
    
    stocks.forEach(stock => {
      const baseSymbol = stock.Symbol.split('-')[0]
      const currentStock = uniqueSymbols.get(baseSymbol)
      
      // If we don't have this symbol yet, or if this stock has a more recent MDEntryTime
      if (!currentStock || (new Date(stock.MDEntryTime) > new Date(currentStock.MDEntryTime))) {
        // Store with clean symbol
        const cleanStock = {...stock}
        cleanStock.Symbol = baseSymbol
        uniqueSymbols.set(baseSymbol, cleanStock)
      }
    })
    
    return Array.from(uniqueSymbols.values())
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
  }

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Handle sorting
  const handleSort = (key: keyof StockData) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // Apply sorting
  const sortedStocks = useCallback(() => {
    if (!sortConfig.key) return filteredStocks
    
    return [...filteredStocks].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredStocks, sortConfig])

  // Get stock category from MarketSegmentID
const getStockCategory = (stock: StockData): string => {
  // First check for IABS security type
  if (stock.securityType === 'IABS') {
    return 'IABS';
  }

  if (!stock.MarketSegmentID) return '';

  // Case-insensitive check with string comparison
  const segment = stock.MarketSegmentID.toString().trim().toUpperCase();
  
  // Check various patterns
  if (segment === 'I' || segment === 'I CLASSIFICATION' || segment === 'I АНГИЛАЛ' || segment.startsWith('I ')) {
    return 'I';
  } 
  else if (segment === 'II' || segment === 'II CLASSIFICATION' || segment === 'II АНГИЛАЛ' || segment.startsWith('II ')) {
    return 'II';
  }
  else if (segment === 'III' || segment === 'III CLASSIFICATION' || segment === 'III АНГИЛАЛ' || segment.startsWith('III ')) {
    return 'III';
  }
  else if (segment === 'FUND' || segment.includes('FUND') || segment.includes('САН')) {
    return 'FUND';
  }
  else if (segment === '1' || segment === 'BOND' || segment.includes('БОНД') || segment.includes('BOND')) {
    return 'BOND';
  }
  else if (segment === 'BD' || segment === 'BONDS' || segment.startsWith('BD')) {
    // BD is likely Bond/Debt securities
    return 'BOND';
  }
  else if (segment === 'MAIN' || segment === 'MAIN MARKET' || segment.includes('MAIN')) {
    // MAIN market segment - treat as category I by default
    return 'I';
  }
  else if (segment === 'N/A' || segment === 'NA' || segment === '' || segment === 'NULL') {
    // Unknown/undefined market segment - treat as category I by default
    return 'I';
  }
  
  // Only log truly unknown segments to avoid spam
  if (segment && segment !== 'MAIN' && segment !== 'N/A' && segment !== 'BD') {
    console.log('Unknown MarketSegmentID:', segment);
  }
  return 'I'; // Default to category I instead of empty string
};



  // Update stock filter date and description
  useEffect(() => {
    const updateFilterDate = () => {
      const filterDate = getStockFilterDate();
      const description = getDisplayPeriodDescription();
      setStockFilterDate(filterDate);
      setDisplayPeriodDescription(description);
    };
    
    updateFilterDate();
    
    // Update every minute to handle trading hour transitions
    const interval = setInterval(updateFilterDate, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter stocks based on search, active tab, category, and trading time
  useEffect(() => {
    let filtered = [...allStocks]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(stock => 
        stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (getCompanyName(stock) || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply trading time filter for 'active' tab (only for stocks, not bonds)
    if (activeTab === 'active' && stockFilterDate) {
      filtered = filtered.filter(stock => {
        const isBond = stock.Symbol?.toUpperCase().includes('-BD') || getStockCategory(stock) === 'BOND';
        return shouldDisplayStock(stock.MDEntryTime, stockFilterDate, isBond);
      });
    } else if (activeTab === 'gainers') {
      filtered = filtered.filter(stock => Number(stock.Changes) > 0)
    } else if (activeTab === 'losers') {
      filtered = filtered.filter(stock => Number(stock.Changes) < 0)
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(stock => getStockCategory(stock) === selectedCategory)
    }
    
    setFilteredStocks(filtered)
  }, [allStocks, searchTerm, activeTab, selectedCategory, stockFilterDate, getCompanyName])
  
  // Group stocks by category
  const stocksByCategory = useMemo(() => {
    return sortedStocks().reduce((acc, stock) => {
      const category = getStockCategory(stock);
      if (category) {
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(stock);
      }
      return acc;
    }, {} as Record<string, StockData[]>);
  }, [sortedStocks]);


  // Initialize Socket.IO service
  useEffect(() => {
    fetchStocksData();
    
    // Try Socket.IO first, fallback to polling if it fails
    const initRealTime = async () => {
      // testBackendDevConfig(); // Disable duplicate test
      
      // Try Socket.IO with timeout
      const socketIOPromise = socketIOService.connect();
      const timeoutPromise = new Promise<boolean>(resolve => {
        setTimeout(() => resolve(false), 8000); // 8 second timeout
      });
      
      const socketIOResult = await Promise.race([socketIOPromise, timeoutPromise]);
      
      if (socketIOResult) {
        socketIOService.joinTradingRoom();
        
        // Use Socket.IO for real-time updates
        socketIOService.onTradingDataUpdate((data: StockData[]) => {
          console.log('📊 Socket.IO: Processing real-time data:', data?.length, 'stocks')
          
          setAllStocks(prevStocks => {
            const updatedStocks = [...prevStocks];
            const newBlinkingRows = new Map<string, 'gain' | 'loss'>();
            let updatedCount = 0;

            // Ensure data is an array
            const dataArray = Array.isArray(data) ? data : [data];

            dataArray.forEach((update) => {
              if (!update || !update.Symbol) return;
              
              const stockIndex = updatedStocks.findIndex(s => s.Symbol === update.Symbol);
              if (stockIndex !== -1) {
                const oldPrice = updatedStocks[stockIndex].LastTradedPrice || 0;
                const newPrice = update.LastTradedPrice || 0;

                // Store previous values for blinking comparison
                setPreviousStockValues(prev => ({
                  ...prev,
                  [update.Symbol]: {
                    price: oldPrice,
                    change: updatedStocks[stockIndex].Changep || 0
                  }
                }));

                // Determine flash color based on price change
                if (newPrice > oldPrice) {
                  newBlinkingRows.set(update.Symbol, 'gain');
                  console.log(`📈 ${update.Symbol}: ${oldPrice} → ${newPrice} (GAIN)`)
                } else if (newPrice < oldPrice) {
                  newBlinkingRows.set(update.Symbol, 'loss');
                  console.log(`📉 ${update.Symbol}: ${oldPrice} → ${newPrice} (LOSS)`)
                } else {
                  // Even if price didn't change, still flash to show it's updating
                  newBlinkingRows.set(update.Symbol, 'gain');
                  console.log(`🔄 ${update.Symbol}: Updated (no price change)`)
                }

                // Update the stock data
                updatedStocks[stockIndex] = {
                  ...updatedStocks[stockIndex],
                  ...update
                };
                updatedCount++;
              }
            });

            // Apply flashing effects to all updated rows
            if (newBlinkingRows.size > 0) {
              console.log('✨ Socket.IO: Flashing rows:', Array.from(newBlinkingRows.keys()))
              
              setBlinkingRows(prev => {
                const nextMap = new Map(prev);
                newBlinkingRows.forEach((value, key) => nextMap.set(key, value));
                return nextMap;
              });

              // Remove flash effect after 800ms
              newBlinkingRows.forEach((_, symbol) => {
                setTimeout(() => {
                  setBlinkingRows(prev => {
                    const nextMap = new Map(prev);
                    nextMap.delete(symbol);
                    return nextMap;
                  });
                }, 800);
              });
            }

            console.log(`🎯 Socket.IO: Updated ${updatedCount} stocks with real-time data`)
            return updatedStocks;
          });
          
          setLastUpdate(new Date());
        });
        
      } else {
        
        // Use polling service as fallback
        const pollingResult = await realTimePollingService.connect();
        
        if (pollingResult) {
          console.log('✅ Polling service connected successfully!');
          realTimePollingService.joinTradingRoom();
          
          // Use polling for real-time-like updates
          realTimePollingService.onTradingDataUpdate((data: StockData[]) => {
            console.log('📊 Polling data received:', data?.length || 0, 'stocks');
            
            setAllStocks(prevStocks => {
              console.log('📊 Processing polled stock updates:')
              console.log('  Previous stocks count:', prevStocks.length)
              
              const updatedStocks = [...prevStocks];
              const newBlinkingRows = new Map<string, 'gain' | 'loss'>();
              let updatedCount = 0;
              let priceChangedCount = 0;

              // Ensure data is an array
              const dataArray = Array.isArray(data) ? data : [data];
              console.log('  Processing array with', dataArray.length, 'items')

              dataArray.forEach((update, index) => {
                if (!update || !update.Symbol) return;
                
                const stockIndex = updatedStocks.findIndex(s => s.Symbol === update.Symbol);
                if (stockIndex !== -1) {
                  const oldPrice = updatedStocks[stockIndex].LastTradedPrice || 0;
                  const newPrice = update.LastTradedPrice || 0;
                  const oldChange = updatedStocks[stockIndex].Changep || 0;

                  // Store previous values for price and change
                  setPreviousStockValues(prev => ({
                    ...prev,
                    [update.Symbol]: {
                      price: oldPrice,
                      change: oldChange
                    }
                  }));

                  // Determine if price changed significantly
                  if (newPrice > oldPrice) {
                    newBlinkingRows.set(update.Symbol, 'gain');
                    priceChangedCount++;
                    console.log(`  🟢 ${update.Symbol} GAIN: ${oldPrice} -> ${newPrice}`)
                  } else if (newPrice < oldPrice) {
                    newBlinkingRows.set(update.Symbol, 'loss');
                    priceChangedCount++;
                    console.log(`  🔴 ${update.Symbol} LOSS: ${oldPrice} -> ${newPrice}`)
                  }

                  updatedStocks[stockIndex] = {
                    ...updatedStocks[stockIndex],
                    ...update
                  };
                  updatedCount++;
                }
              });

              // Apply blinking effects
              if (newBlinkingRows.size > 0) {
                console.log('✨ Applying blink effects to:', Array.from(newBlinkingRows.keys()))
                setBlinkingRows(prev => {
                  const nextMap = new Map(prev);
                  newBlinkingRows.forEach((value, key) => nextMap.set(key, value));
                  return nextMap;
                });
                newBlinkingRows.forEach((_, symbol) => {
                  setTimeout(() => {
                    setBlinkingRows(prev => {
                      const nextMap = new Map(prev);
                      nextMap.delete(symbol);
                      return nextMap;
                    });
                  }, 500);
                });
              }

              console.log('📈 Polling update summary:', updatedCount, 'updates,', priceChangedCount, 'price changes')
              return updatedStocks;
            });
            
            setLastUpdate(new Date());
          });
          
        } else {
          console.error('❌ Both Socket.IO and polling failed');
        }
      }
    };

    initRealTime();

    // Listen for connection status changes
    socketIOService.onConnectionStatusChange((connected) => {
      console.log('📡 Socket.IO connection status changed:', connected);
      if (connected) {
        socketIOService.joinTradingRoom();
      }
    });

    // Listen for trading data updates
    socketIOService.onTradingDataUpdate((data: StockData[]) => {
      console.log('🏢 AllStocks received trading data update:')
      console.log('  Raw data type:', typeof data)
      console.log('  Is array:', Array.isArray(data))
      console.log('  Data length/size:', Array.isArray(data) ? data.length : 'N/A')
      console.log('  Full data:', data)
      
      setAllStocks(prevStocks => {
        console.log('📊 Processing stock updates:')
        console.log('  Previous stocks count:', prevStocks.length)
        
        const updatedStocks = [...prevStocks];
        const newBlinkingRows = new Map<string, 'gain' | 'loss'>();
        let updatedCount = 0;
        let priceChangedCount = 0;

        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : [data];
        console.log('  Processing array with', dataArray.length, 'items')

        dataArray.forEach((update, index) => {
          console.log(`  [${index}] Processing update for:`, {
            Symbol: update?.Symbol,
            LastTradedPrice: update?.LastTradedPrice,
            Changes: update?.Changes,
            Changep: update?.Changep
          })
          
          if (!update || !update.Symbol) {
            console.log(`  [${index}] ⚠️ Skipping invalid update (no symbol)`)
            return;
          }
          
          const stockIndex = updatedStocks.findIndex(s => s.Symbol === update.Symbol);
          if (stockIndex !== -1) {
            const oldPrice = updatedStocks[stockIndex].LastTradedPrice || 0;
            const newPrice = update.LastTradedPrice || 0;
            const oldChange = updatedStocks[stockIndex].Changep || 0;

            console.log(`  [${index}] ${update.Symbol}: ${oldPrice} -> ${newPrice}`)

            // Store previous values for price and change
            setPreviousStockValues(prev => ({
              ...prev,
              [update.Symbol]: {
                price: oldPrice,
                change: oldChange
              }
            }));

            // Determine if price or change percentage has changed significantly
            if (newPrice > oldPrice) {
              newBlinkingRows.set(update.Symbol, 'gain');
              priceChangedCount++;
              console.log(`  [${index}] 🟢 ${update.Symbol} GAIN: ${oldPrice} -> ${newPrice}`)
            } else if (newPrice < oldPrice) {
              newBlinkingRows.set(update.Symbol, 'loss');
              priceChangedCount++;
              console.log(`  [${index}] 🔴 ${update.Symbol} LOSS: ${oldPrice} -> ${newPrice}`)
            } else if (oldPrice !== 0) {
              console.log(`  [${index}] ⚪ ${update.Symbol} NO CHANGE: ${oldPrice}`)
            }

            updatedStocks[stockIndex] = {
              ...updatedStocks[stockIndex],
              ...update
            };
            updatedCount++;
          } else {
            console.log(`  [${index}] ⚠️ Stock ${update.Symbol} not found in current list`)
          }
        });

        console.log('📈 Update summary:')
        console.log('  Total updates processed:', updatedCount)
        console.log('  Price changes detected:', priceChangedCount)
        console.log('  Blinking stocks:', Array.from(newBlinkingRows.keys()))

        // Apply blinking rows and set timeouts to remove them
        if (newBlinkingRows.size > 0) {
          console.log('✨ Applying blink effects to:', Array.from(newBlinkingRows.keys()))
          setBlinkingRows(prev => {
            const nextMap = new Map(prev);
            newBlinkingRows.forEach((value, key) => nextMap.set(key, value));
            return nextMap;
          });
          newBlinkingRows.forEach((_, symbol) => {
            setTimeout(() => {
              setBlinkingRows(prev => {
                const nextMap = new Map(prev);
                nextMap.delete(symbol);
                return nextMap;
              });
            }, 500); // Blink for 500ms
          });
        }

        console.log('✅ Stock update complete')
        return updatedStocks;
      });
      
      console.log('🕒 Setting last update time')
      setLastUpdate(new Date());
    });

    return () => {
      console.log('🔌 Cleaning up real-time connections...');
      socketIOService.disconnect();
      realTimePollingService.disconnect();
    };
  }, [fetchStocksData]);

  // Format price with appropriate transformation for bonds
  const formatPrice = (price: number | undefined, isBond: boolean = false) => {
    if (price === undefined || price === null) return '-';
    // For bonds, multiply the price by 1000
    const transformedPrice = isBond ? price * 1000 : price;
    return transformedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  // Get summary for a category
  const getCategorySummary = (category: string) => {
    const categoryStocks = stocksByCategory[category] || []
    
    return {
      count: categoryStocks.length,
      totalVolume: categoryStocks.reduce((sum, s) => sum + (s.Volume || 0), 0),
      totalTurnover: categoryStocks.reduce((sum, s) => sum + (s.Turnover || 0), 0),
    }
  }

  // Render stocks for a specific category
  const renderCategoryStocks = (stocks: StockData[]) => {
    // Check if we're rendering bonds
    const isBondCategory = stocks.length > 0 && getStockCategory(stocks[0]) === 'BOND';
    
    return stocks.map((stock) => {
      const blinkClass = blinkingRows.get(stock.Symbol);

      return (
        <tr 
          key={stock.Symbol} 
          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          style={blinkClass ? {
            animation: blinkClass === 'gain' 
              ? 'flash-green 800ms ease-out' 
              : 'flash-red 800ms ease-out'
          } : {}}
        >
          <td className="px-0.5 py-0.5 whitespace-nowrap">
            <a href={`/stocks/${stock.Symbol}`} className="flex flex-col">
              <span className="font-medium text-xs">{stock.Symbol}</span>
              <span className="text-[10px] text-gray-500">{getCompanyName(stock)}</span>
            </a>
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {stock.Volume?.toLocaleString() || '-'}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {stock.Turnover?.toLocaleString() || '-'}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.PreviousClose, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.OpeningPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.HighPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.LowPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.LastTradedPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.ClosingPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            <span className={
              Number(stock.Changes) > 0 
                ? 'text-green-500' 
                : Number(stock.Changes) < 0 
                  ? 'text-red-500' 
                  : ''
            }>
              {Number(stock.Changes) > 0 ? '+' : ''}{Number(stock.Changes || 0).toFixed(2)}
                    </span>
          </td>
          <td className="px-0.5 py-0.5 text-right">
              <div className="flex items-center justify-end">
                {stock.Changep !== null && stock.Changep !== undefined ? (
                  <>
                    <span className={
                      stock.Changep > 0 
                        ? 'text-green-500' 
                        : stock.Changep < 0 
                          ? 'text-red-500' 
                          : ''
                    }>
                      {stock.Changep > 0 ? '+' : ''}{stock.Changep.toFixed(2)}%
                    </span>
                    {stock.Changep !== 0 && (
                      <span className="ml-0.5">
                        {stock.Changep > 0 ? <ArrowUp size={8} className="text-green-500" /> : <ArrowDown size={8} className="text-red-500" />}
                    </span>
                    )}
                  </>
                ) : '-'}
              </div>
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {stock.sizemd?.toLocaleString() || '-'}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.MDEntryPx, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {formatPrice(stock.MDEntryPx2, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right">
            {stock.sizemd2?.toLocaleString() || '-'}
          </td>
        </tr>
      );
    });
  };

  // Function to render a category section with table
  const renderCategorySection = (categoryId: string, title: string, bgColorClass: string, textColorClass: string) => {
    const stocks = stocksByCategory[categoryId] || [];
    if (stocks.length === 0) return null;
    
    const summary = getCategorySummary(categoryId);
    
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6">
        {/* Category Header with summary */}
        <div 
          className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 ${bgColorClass} rounded-t-lg cursor-pointer gap-2`}
          onClick={() => toggleCategory(categoryId)}
        >
          <div className="flex items-center">
            <span className={`transform transition-transform ${expandedCategories[categoryId] ? 'rotate-90' : ''}`}>
              <ChevronRight size={20} />
            </span>
            <h3 className={`font-medium ml-2 ${textColorClass}`}>
              {title}
            </h3>
                </div>
          {/* Summary info */}
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            <span>Компани: <span className="font-semibold text-bdsec dark:text-indigo-400">{summary.count}</span></span>
            <span>Үнийн дүн: <span className="font-semibold">{summary.totalTurnover.toLocaleString()}₮</span></span>
            <span>Тоо ширхэг: <span className="font-semibold">{summary.totalVolume.toLocaleString()}</span></span>
          </div>
        </div>

        {expandedCategories[categoryId] && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="px-2 py-3 text-left">
                    <div className="flex items-center cursor-pointer" onClick={() => handleSort('Symbol')}>
                      {t('allStocks.symbol')}
                      {sortConfig.key === 'Symbol' && (
                        sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                      {t('allStocks.volume')}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Turnover')}>
                      {t('allStocks.turnover')}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('PreviousClose')}>
                      {t("dashboard.previousClose")}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('OpeningPrice')}>
                      {t("allStocks.openingPrice")}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('HighPrice')}>
                       {t("allStocks.highPrice")}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('LowPrice')}>
                      {t("allStocks.lowPrice")}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('LastTradedPrice')}>
                     {t("allStocks.lastTradedPrice")}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('ClosingPrice')}>
                      {t('allStocks.closingPrice')}
          </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Changes')}>
                    {t('dashboard.change')}
        </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Changep')}>
                      %
          </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('sizemd')}>
                   {t('allStocks.bidVolume')}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('MDEntryPx')}>
                   {t('allStocks.bidPrice')}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('MDEntryPx2')}>
                    {t('allStocks.askPrice')}
                    </div>
                  </th>
                  <th className="px-2 py-3 text-right">
                    <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('sizemd2')}>
                      {t('allStocks.askVolume')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {renderCategoryStocks([...stocks].sort((a, b) => b.Turnover - a.Turnover))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
        {/* ...existing code... */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <a 
                href="/" 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                <ChevronRight className="transform rotate-180" size={18} />
              </a>
              <h1 className="text-base font-bold">{t('allStocks.title')}</h1>
            </div>
            <div className="text-[10px] text-right text-gray-500">
              {activeTab === 'active' && displayPeriodDescription && (
                <div className="mb-1 font-medium text-bdsec dark:text-indigo-400">
                  {displayPeriodDescription}
                </div>
              )}
              {lastUpdate ? (
                <span>
                  {t('allStocks.lastUpdated')}: {lastUpdate.toLocaleTimeString()}
                </span>
              ) : (
                <span>
                  {t('allStocks.lastUpdated')}: {new Date().toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={toggleFilters}
              className="flex items-center gap-1 text-sm text-bdsec dark:text-indigo-400"
            >
              <SlidersHorizontal size={16} />
              {t('allStocks.filter')}
            </button>
            <button
              onClick={() => setIsFullTableModalOpen(true)}
              className="flex items-center gap-1 text-sm text-bdsec dark:text-indigo-400"
            >
              {t('allStocks.seeFullTable')}
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4 relative">
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 h-10">
              <Search size={16} className="text-gray-600 dark:text-gray-400 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="bg-transparent outline-none w-full text-sm text-gray-900 dark:text-gray-100"
                placeholder={t('common.search')}
              />
              {searchTerm && (
                <button onClick={clearSearch} className="ml-2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <X size={16} className="text-gray-600 dark:text-gray-400" />
                </button>
              )}
            </div>
          </div>
          
              {/* Filters Panel */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-sm font-medium mb-3 text-gray-900 dark:text-gray-100">{t('allStocks.categories')}</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors h-8 ${
                      selectedCategory === category.id
                        ? 'bg-bdsec dark:bg-indigo-500 text-white font-medium'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.mnName}
                  </button>
                ))}
              </div>
              
              {/* <div className="mt-3">
                <h3 className="font-medium mb-2">{t('allStocks.timeFilter')}</h3>
                <div className="flex flex-wrap gap-2">
                  {['today', 'yesterday', 'thisWeek', 'thisMonth'].map(period => (
                    <button
                      key={period}
                      className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                      {t(`allStocks.${period}`)}
                    </button>
                  ))}
                </div>
              </div> */}
            </div>
          )}
          
          {/* Filter Tabs */}
          <div className="flex mb-4 border-b overflow-x-auto justify-between items-center">
            <div className="flex">
              {[
                { id: 'all', label: t('allStocks.all') },
                { id: 'active', label: t('allStocks.active') },
                { id: 'gainers', label: t('dashboard.gainers') },
                { id: 'losers', label: t('dashboard.losers') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-bdsec dark:bg-indigo-500 text-white rounded-t-md'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 52/7 Button */}
            <div className="px-4 py-2 text-sm whitespace-nowrap">
              <button
                onClick={() => {
                  setIsModalOpen(true);    // Open modal
                }}
                className={`px-4 py-2 text-sm whitespace-nowrap ${
                  activeTab === 'average'
                    ? 'bg-bdsec dark:bg-indigo-500 text-white rounded-t-md'
                    : 'text-gray-500'
                }`}
              >
             {t('StockAver.see_data') }
              </button>

              <StockAverageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          </div>


            
          {/* Stocks Table with Category Groups */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bdsec dark:border-indigo-500 mb-2"></div>
              <p className="text-gray-500 text-sm ml-3">{t('common.loading')}</p>
            </div>
          ) : sortedStocks().length > 0 ? (
            <div className="space-y-6">
              {renderCategorySection('I', t('allStocks.categoryI'), 'bg-blue-50 dark:bg-blue-900/30', 'text-blue-800 dark:text-blue-200')}
              {renderCategorySection('II', t('allStocks.categoryII'), 'bg-purple-50 dark:bg-purple-900/30', 'text-purple-800 dark:text-purple-200')}
              {renderCategorySection('III', t('allStocks.categoryIII'), 'bg-gray-50 dark:bg-gray-800/60', 'text-gray-800 dark:text-gray-200')}
              {renderCategorySection('FUND', 'Хөрөнгө оруулалтын сан', 'bg-green-50 dark:bg-green-900/30', 'text-green-800 dark:text-green-200')}
              {renderCategorySection('IABS', 'Хөрөнгөөр баталгаажсан үнэт цаас', 'bg-teal-50 dark:bg-teal-900/30', 'text-teal-800 dark:text-teal-200')}
              {renderCategorySection('BOND', 'Компанийн бонд', 'bg-orange-50 dark:bg-orange-900/30', 'text-orange-800 dark:text-orange-200')}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('common.noResults')}</p>
            </div>
          )}
          
          {/* Summary Section */}
          <div className="mt-6 text-xs text-gray-500 flex justify-between items-center">
            <div>{t('allStocks.showing', { count: sortedStocks().length, total: allStocks.length })}</div>
            <div>{t('allStocks.lastUpdated')}: {new Date().toLocaleString()}</div>
          </div>
        {/* Stock Average Modal */}
        <StockAverageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />

        {/* Full Stock Table Modal */}
        {isFullTableModalOpen && (
          <FullStockTableModal
            isOpen={isFullTableModalOpen}
            onClose={() => setIsFullTableModalOpen(false)}
            filteredStocks={filteredStocks}
            sortConfig={sortConfig}
            blinkingRows={blinkingRows}
            previousStockValues={previousStockValues}
            getCompanyName={getCompanyName}
            formatPrice={formatPrice}
            getStockCategory={getStockCategory}
            handleSort={handleSort}
          />
        )}
      </div>
    </div>
  );
}

export default AllStocks