import { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react'
import { BarChart3, ChevronRight, TrendingUp, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay'
import type { StockData, TradingHistoryData } from '@/lib/api'
import { fetchTradingHistory } from '@/lib/api'
import { BlinkEffect } from '@/components/ui/BlinkEffect'

// Helper function to determine if a stock is a bond (duplicated for now, could be refactored to a shared utility if needed)
const isStockABond = (stock: StockData | undefined | null): boolean => {
  if (!stock) return false;
  const isSymbolBond = stock.Symbol.toUpperCase().includes('-BD');

  let isMarketSegmentBond = false;
  if (stock.MarketSegmentID) { // Ensure MarketSegmentID is not null or empty string
    isMarketSegmentBond = stock.MarketSegmentID.toUpperCase().includes('BOND') || stock.MarketSegmentID === '1';
  }
  return isSymbolBond || isMarketSegmentBond;
};

// Mini Chart Component
const MiniChart = ({ historicalData, isPositive, changePercent = 0, width = 60, height = 30 }: { 
  historicalData: TradingHistoryData[], 
  isPositive: boolean, 
  changePercent?: number,
  width?: number, 
  height?: number 
}) => {
  // Determine if we should show neutral colors (when change is very small or 0)
  const isNeutral = Math.abs(changePercent) < 0.01
  
  // Use useRef to generate stable mock data as fallback
  const mockDataRef = useRef<number[] | undefined>(undefined);
  
  let data: number[] = [];
  
  if (historicalData && historicalData.length >= 2) {
    // Use real historical data - get the last 10 closing prices
    const recentData = historicalData.slice(-10);
    data = recentData.map(item => item.ClosingPrice);
  } else {
    // Generate mock data only once if no real data
    if (!mockDataRef.current) {
      mockDataRef.current = Array.from({ length: 10 }, (_, i) => {
        const base = 100
        if (isNeutral) {
          // Flat line for neutral
          return base + (Math.random() * 4 - 2)
        }
        const trend = isPositive ? 1 : -1
        return base + (Math.random() * 20 - 10) + (trend * i * 2)
      })
    }
    data = mockDataRef.current
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height
  }))

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ')

  const areaPathData = pathData + ` L ${width} ${height} L 0 ${height} Z`

  // Color logic
  const lineColor = isNeutral ? '#6b7280' : (isPositive ? '#10b981' : '#ef4444')
  const gradientId = isNeutral ? 'gradient-neutral' : `gradient-${isPositive ? 'up' : 'down'}`

  return (
    <svg width={width} height={height} className="absolute bottom-2 right-2 opacity-60">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPathData}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      <path
        d={pathData}
        stroke={lineColor}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface StockListProps {
  loading: boolean
  activeFilter: string
  filteredStocks: StockData[]
  onFilterChange: (filter: string) => void
  onStockSelect: (symbol: string) => void
  selectedCard?: StockData
}

const formatPrice = (price: number | undefined, isBond: boolean = false) => {
  if (price === undefined || price === null) return '-';
  const transformedPrice = isBond ? price * 1000 : price;
  if (isBond && (!transformedPrice || transformedPrice === 0)) return '-';
  return transformedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export const StockList = ({
  loading,
  activeFilter,
  filteredStocks,
  onFilterChange,
  onStockSelect,
  selectedCard,
}: StockListProps) => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language || 'mn';
  const [api, setApi] = useState<CarouselApi>()
  const [historicalData, setHistoricalData] = useState<{ [symbol: string]: TradingHistoryData[] }>({})
  const [loadingHistorical, setLoadingHistorical] = useState<{ [symbol: string]: boolean }>({})

  // Helper function to get company name based on current language
  const getCompanyName = (stock: StockData) => {
    return currentLanguage === 'mn' ? stock.mnName : stock.enName;
  };

  // Fetch historical data for a stock
  const fetchStockHistoricalData = useCallback(async (symbol: string) => {
    if (historicalData[symbol] || loadingHistorical[symbol]) return;
    
    setLoadingHistorical(prev => ({ ...prev, [symbol]: true }));
    
    try {
      const response = await fetchTradingHistory(symbol, 1, 10); // Get last 10 data points
      if (response.success && response.data) {
        setHistoricalData(prev => ({ ...prev, [symbol]: response.data }));
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
    } finally {
      setLoadingHistorical(prev => ({ ...prev, [symbol]: false }));
    }
  }, [historicalData, loadingHistorical]);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  )

  const filters = [
    { id: 'trending', label: t('dashboard.trending'), icon: TrendingUp },
    { id: 'mostActive', label: t('dashboard.mostActive'), icon: Activity },
    { id: 'gainers', label: t('dashboard.gainers'), icon: ArrowUp },
    { id: 'losers', label: t('dashboard.losers'), icon: ArrowDown },
    { id: 'bonds', label: t('dashboard.bonds'), icon: BarChart3 }, // New Bonds tab
  ]

  // Filter stocks for bonds tab
  const filteredForBonds = activeFilter === 'bonds'
    ? filteredStocks.filter(stock => stock.MarketSegmentID && (stock.MarketSegmentID.toUpperCase().includes('BOND') || stock.MarketSegmentID === '1' || stock.Symbol.toUpperCase().includes('-BD')))
    : filteredStocks;

  // Prepare cards: selected card first, then the rest
  const selectedStock = selectedCard;
  const otherStocks = selectedStock
    ? filteredForBonds.filter(stock => stock.Symbol.split('-')[0] !== selectedStock.Symbol.split('-')[0])
    : filteredForBonds;

  // Responsive basis for carousel items
  const getBasisClass = () => {
    return 'min-w-[170px] max-w-[170px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[170px] md:max-w-[170px] lg:min-w-[170px] lg:max-w-[170px]';
  };

  useLayoutEffect(() => {
    if (!api) return
    // Always scroll to the first card (start) on symbol change or card update
    api.scrollTo(0, false)
  }, [selectedCard, api, otherStocks.length])

  // Fetch historical data for visible stocks
  useEffect(() => {
    const stocksToFetch = [selectedCard, ...otherStocks.slice(0, 5)].filter(Boolean) as StockData[];
    
    stocksToFetch.forEach(stock => {
      if (stock.Symbol) {
        fetchStockHistoricalData(stock.Symbol);
      }
    });
  }, [filteredStocks, selectedCard, fetchStockHistoricalData]);

  return (
    <div className="w-full px-2 sm:px-6 pb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base sm:text-lg font-medium flex items-center">
          <BarChart3 size={18} className="mr-2 text-bdsec dark:text-indigo-400" />
          {t('dashboard.popularStocks')}
        </h2>
        <Link 
          href="/stocks" 
          className="flex items-center text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1.5 bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 rounded-md hover:bg-bdsec/20 dark:hover:bg-indigo-500/30 transition-colors"
        >
          {t('dashboard.viewAll')} <ChevronRight size={16} className="ml-1" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 sm:mt-5 mt-0  sm:pb-2 pb-0 flex-wrap sm:flex-wrap no-scrollbar">
        {filters.map((filter) => (
          <div key={filter.id} className="relative group">
            <button
              className={`px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm rounded-full whitespace-nowrap flex items-center ${
                activeFilter === filter.id
                  ? 'bg-bdsec dark:bg-bdsec-dark text-white'
                  : 'border dark:border-indigo-500 text-gray-500'
              }`}
              onClick={() => onFilterChange(filter.id)}
            >
              <filter.icon size={12} className="mr-1" />
              {filter.label}
            </button>
          </div>
        ))}
      </div>

      {/* Display active filter explanation below the buttons */}
      {/* <div className="mt-0 px-2 sm:px-0 text-xs text-gray-400 dark:text-gray-500">
        {activeFilter && t(`dashboard.tooltip.${activeFilter}`)}
      </div> */}

      {/* Selected card pinned to the left, outside the scrollable carousel */}
      <div className="flex items-stretch gap-2 mt-0 py-0 sm:py-4 sm:mt-4">
        
        {selectedStock && (
          <div
            className={`shrink-0 ${getBasisClass()} border-bdsec border-[2px]  dark:border-indigo-400  dark:from-indigo-500/10 dark:to-indigo-500/5 rounded-xl  p-2 my-2 sm:p-3 flex flex-col justify-between transition-all duration-300 relative overflow-hidden z-10`}
            style={{ minWidth: 150, maxWidth: 150 }}
          >
            {/* SVG Illumination Effect */}
            <svg
              className="absolute text-indigo-600 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
              width="300%"
              height="300%"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                transform="translate(100 100)"
              />
            </svg>
            <div className="flex items-start justify-between mb-1 z-10">
              <h3 className="flex items-center justify-center font-semibold text-xs text-white rounded-full h-7 w-7 bg-bdsec dark:bg-indigo-400">
                {selectedStock.Symbol.toUpperCase().includes('-BD') ? selectedStock.Symbol : selectedStock.Symbol.split('-')[0]}
              </h3>
              <div className={`text-xs font-semibold px-1 py-0.5 rounded-md ${
                Math.abs(selectedStock.Changep || 0) < 0.01 
                  ? 'text-gray-600 bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400'
                  : selectedStock.Changep >= 0 
                    ? 'text-green-600 bg-green-100 dark:bg-green-500/10 dark:text-green-400' 
                    : 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400'
              }`}>
                {Math.abs(selectedStock.Changep || 0) < 0.01 
                  ? '0.00' 
                  : (selectedStock.Changep >= 0 ? '+' : '') + (selectedStock.Changep || 0).toFixed(2)
                }%
              </div>
            </div>
            <div className="mt-1 z-10">
              <p className="font-medium text-gray-800 truncate text-xs dark:text-gray-200" title={getCompanyName(selectedStock)}>
                {getCompanyName(selectedStock)}
              </p>
            </div>
            <div className="mt-1 z-10">
              <div className="text-xs text-gray-500 dark:text-gray-400">Сүүлийн үнэ</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">
                {formatPrice(selectedStock.LastTradedPrice, isStockABond(selectedStock))} 
                {formatPrice(selectedStock.LastTradedPrice, isStockABond(selectedStock)) !== '-' ? '₮' : ''}
              </div>
            </div>
            <MiniChart 
              historicalData={historicalData[selectedStock.Symbol] || []} 
              isPositive={selectedStock.Changep >= 0} 
              changePercent={selectedStock.Changep}
              width={50} 
              height={25} 
            />
          </div>
        )}
        {/* Scrollable carousel for other cards */}
        <div className="flex-1 overflow-x-auto no-scrollbar">
          <Carousel
            opts={{
              align: "start",
              loop: true,
              skipSnaps: false,
              containScroll: "trimSnaps",
            }}
            plugins={[autoplayPlugin.current]}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent className="flex pl-8 py-2">
              {otherStocks.length > 0 ? (
                otherStocks.map((stock, index) => {
                  const isPositive = (stock.Changep || 0) >= 0;
                  return (
                    <CarouselItem key={`stock-${stock.Symbol}-${index}`} className={`pl-6  md:pl-4 ${getBasisClass()}`} >
                      <div
                        className="relative w-full p-2 sm:p-3 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between"
                        style={{ minWidth: 150, maxWidth: 150 }}
                        onClick={() => {
                          onStockSelect(stock.Symbol);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        {/* SVG Illumination Effect */}
                        <svg
                          className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
                          width="200%"
                          height="200%"
                          viewBox="0 0 200 200"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill="currentColor"
                            d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                            transform="translate(100 100)"
                          />
                        </svg>
                        <div className="flex items-start justify-between mb-1 z-10">
                          <h3 className="flex items-center justify-center font-semibold text-xs text-white rounded-full h-7 w-7 bg-bdsec dark:bg-indigo-500">
                            {stock.Symbol.toUpperCase().includes('-BD') ? stock.Symbol : stock.Symbol.split('-')[0]}
                          </h3>
                          <div className={`text-xs font-semibold px-1 py-0.5 rounded-md ${
                            Math.abs(stock.Changep || 0) < 0.01 
                              ? 'text-gray-600 bg-gray-100 dark:bg-gray-500/10 dark:text-gray-400'
                              : isPositive 
                                ? 'text-green-600 bg-green-100 dark:bg-green-500/10 dark:text-green-400' 
                                : 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400'
                          }`}>
                            {Math.abs(stock.Changep || 0) < 0.01 
                              ? '0.00' 
                              : (isPositive ? '+' : '') + (stock.Changep || 0).toFixed(2)
                            }%
                          </div>
                        </div>
                        <div className="mt-1 z-10">
                          <p className="font-medium text-gray-800 truncate text-xs dark:text-gray-200" title={getCompanyName(stock)}>
                            {getCompanyName(stock)}
                          </p>
                        </div>
                        <div className="mt-1 z-10">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Сүүлийн үнэ</div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatPrice(stock.LastTradedPrice, isStockABond(stock))}
                            {formatPrice(stock.LastTradedPrice, isStockABond(stock)) !== '-' ? '₮' : ''}
                          </div>
                        </div>
                        <MiniChart 
                          historicalData={historicalData[stock.Symbol] || []} 
                          isPositive={isPositive} 
                          changePercent={stock.Changep}
                          width={50} 
                          height={25} 
                        />
                      </div>
                    </CarouselItem>
                  )
                })
              ) : (
                <CarouselItem className={`pl-2 md:pl-4 ${getBasisClass()}`} >
                  <div className="h-20 flex items-center justify-center">
                    <p className="text-gray-500">{loading ? t('dashboard.loadingStocks') : t('common.noResults')}</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
         <div className="mt-0 px-2 sm:px-0 text-[8px] text-gray-400 dark:text-gray-500">
        {activeFilter && t(`dashboard.tooltip.${activeFilter}`)}
      </div>
    </div>
  )
} 