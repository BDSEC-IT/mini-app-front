import React, { useRef, useEffect, useState, useLayoutEffect, useCallback } from 'react'
import { BarChart3, ChevronRight, ChevronDown, TrendingUp, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
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
import { InfoTooltip } from '@/components/ui'

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

// Helper function to format symbol display (shorten both stocks and bonds)
const formatSymbolDisplay = (symbol: string): string => {
  if (!symbol) return '';
  
  // For bonds with pattern like "TMPG-BD-07/03/18-A0121-15.5"
  // Extract just the first part before "-BD"
  if (symbol.toUpperCase().includes('-BD')) {
    const parts = symbol.split('-BD');
    return parts[0]; // Returns "TMPG" from "TMPG-BD-07/03/18-A0121-15.5"
  }
  
  // For stocks with pattern like "BRM-O-0000" or "BRM-O-0001"
  // Extract just the base symbol
  return symbol.split('-')[0]; // Returns "BRM" from "BRM-O-0000"
};

// Loading Skeleton Component with scroll animations
const LoadingSkeleton = ({ delay = 0, fromRight = false, inView = false }: { delay?: number, fromRight?: boolean, inView?: boolean }) => {
  return (
    <div 
      className={`transition-all duration-700 ${
        inView 
          ? `opacity-100 ${fromRight ? 'translate-x-0' : 'translate-x-0'}` 
          : `opacity-0 ${fromRight ? 'translate-x-8' : '-translate-x-8'}`
      }`}
      style={{ 
        minWidth: 160, 
        maxWidth: 160, 
        minHeight: 140, 
        height: 140,
        transitionDelay: `${delay}ms`
      }}
    >
      <div className="relative w-full p-3 overflow-hidden border rounded-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 flex flex-col justify-between">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-1">
          <div className="w-7 h-7 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
          <div className="w-12 h-5 bg-gray-300 dark:bg-gray-600 rounded-md animate-pulse"></div>
        </div>
        
        {/* Company name skeleton */}
        <div className="mt-1">
          <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
        
        {/* Price section skeleton */}
        <div className="mt-1">
          <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
          <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
        
        {/* Mini chart skeleton */}
        <div className="absolute bottom-2 right-2">
          <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

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
  displayPeriodDescription?: string
}

const formatPrice = (price: number | undefined, isBond: boolean = false) => {
  if (price === undefined || price === null) return '-';
  const transformedPrice = isBond ? price * 1000 : price;
  if (isBond && (!transformedPrice || transformedPrice === 0)) return '-';
  return transformedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const StockListComponent = ({
  loading,
  activeFilter,
  filteredStocks,
  onFilterChange,
  onStockSelect,
  selectedCard,
  displayPeriodDescription,
}: StockListProps) => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language || 'mn';
  const [api, setApi] = useState<CarouselApi>()
  const [historicalData, setHistoricalData] = useState<{ [symbol: string]: TradingHistoryData[] }>({})
  const [loadingHistorical, setLoadingHistorical] = useState<{ [symbol: string]: boolean }>({})
  
  // Add intersection observer for scroll animations
  const { ref: stockListRef, inView: stockListInView } = useInView(0.1)

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
    <div ref={stockListRef} className="w-full max-w-full overflow-hidden transition-all duration-300 my-4">
      <div className={`flex justify-between items-center mb-4 transition-all duration-1000 ${
        stockListInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
            {t('dashboard.popularStocks')}
          </h2>
         
          {displayPeriodDescription && activeFilter !== 'bonds' && (
           
            <p className="text-xs max-w-[150px] text-gray-500 dark:text-gray-400 ">
            {displayPeriodDescription} 
          </p>
       
            
          )}
     
        </div>
  
        {/* Filter Dropdown */}
          <div className="">
      <div className={`flex justify-end transition-all duration-1000 delay-200 ${
        stockListInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
      
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1 text-bdsec   dark:bg-gray-800 px-2 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700  dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 transition-colors"
              aria-label={t('dashboard.filter')}
              type="button"
            >
              {filters.find(f => f.id === activeFilter)?.label}
              
              <ChevronDown size={16} className="text-bdsec dark:text-gray-400 " />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px] p-1">
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.id}
                onSelect={() => onFilterChange(filter.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-normal rounded-md cursor-pointer transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                aria-selected={activeFilter === filter.id}
              >
                {filter.icon && <filter.icon size={16} className="mr-1" />}
                {filter.label}
                
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
         
      </div>
      {/* <div className="text-end">

         <div className={`mt-0 px-1 sm:px-0 text-xs font-normal text-gray-500 dark:text-gray-400 transition-all duration-1000 delay-800 ${
        stockListInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        {activeFilter && t(`dashboard.tooltip.${activeFilter}`)}
      </div>
        </div> */}
      </div>
      </div>

     

     
      <div className={`flex items-stretch gap-1 mt-0 py-0  transition-all duration-1000 delay-400 overflow-hidden ${
        stockListInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {selectedStock && (
          <div
            className={`shrink-0 ${getBasisClass()} border-bdsec border-[2px] dark:border-indigo-400 dark:from-indigo-500/10 dark:to-indigo-500/5 rounded-xl p-3 my-2 sm:p-3 flex flex-col justify-between transition-all duration-300 relative overflow-hidden z-10`}
            style={{ minWidth: 160, maxWidth: 160, minHeight: 140, height: 140 }}
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
              <h3 className="flex items-center justify-center font-medium text-xs text-white rounded-full h-7 w-7 bg-bdsec dark:bg-indigo-400">
                {formatSymbolDisplay(selectedStock.Symbol)}
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
              <p className="font-normal text-gray-800 truncate text-xs dark:text-gray-200" title={getCompanyName(selectedStock)}>
                {getCompanyName(selectedStock)}
              </p>
            </div>
            <div className="mt-1 z-10">
              <div className="text-xs font-normal text-gray-500 dark:text-gray-400">Хаалт</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatPrice(selectedStock.PreviousClose, isStockABond(selectedStock))} 
                {formatPrice(selectedStock.PreviousClose, isStockABond(selectedStock)) !== '-' ? '₮' : ''}
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
        <div className="flex-1 min-w-0 overflow-hidden relative">
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
            <CarouselContent className="flex pl-2 py-2">
              {loading ? (
                // Cool loading skeletons with staggered animations from left and right
                Array.from({ length: 6 }).map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className={`pl-2 md:pl-3 ${getBasisClass()}`}>
                    <LoadingSkeleton 
                      delay={index * 100} 
                      fromRight={index % 2 === 1} 
                      inView={stockListInView}
                    />
                  </CarouselItem>
                ))
              ) : otherStocks.length > 0 ? (
                otherStocks.map((stock, index) => {
                  const isPositive = (stock.Changep || 0) >= 0;
                  return (
                    <CarouselItem key={`stock-${stock.Symbol}`} className={`pl-2 md:pl-3 ${getBasisClass()}`} >
                      <div
                        className={`relative w-full p-3 sm:p-3 overflow-hidden transition-all duration-700 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between ${
                          stockListInView 
                            ? `opacity-100 ${index % 2 === 0 ? 'translate-x-0' : 'translate-x-0'}` 
                            : `opacity-0 ${index % 2 === 0 ? '-translate-x-8' : 'translate-x-8'}`
                        }`}
                        style={{ 
                          minWidth: 160, 
                          maxWidth: 160, 
                          minHeight: 140, 
                          height: 140,
                          transitionDelay: `${600 + index * 100}ms`
                        }}
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
                          <h3 className="flex items-center justify-center font-medium text-xs text-white rounded-full h-7 w-7 bg-bdsec dark:bg-indigo-500">
                            {formatSymbolDisplay(stock.Symbol)}
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
                          <p className="font-normal text-gray-800 truncate text-xs dark:text-gray-200" title={getCompanyName(stock)}>
                            {getCompanyName(stock)}
                          </p>
                        </div>
                        <div className="mt-1 z-10">
                          <div className="text-xs font-normal text-gray-500 dark:text-gray-400">Хаалт</div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatPrice(stock.PreviousClose, isStockABond(stock))}
                            {formatPrice(stock.PreviousClose, isStockABond(stock)) !== '-' ? '₮' : ''}
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
                    <p className="text-sm font-normal text-gray-500">{loading ? t('dashboard.loadingStocks') : t('common.noResults')}</p>
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            
            {/* Navigation Buttons */}
            <CarouselPrevious className="absolute  left-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-bdsec font-bold dark:text-bdsec-dark hover:text-gray-900 dark:hover:text-white transition-all duration-200 z-10" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 text-bdsec  font-bold dark:text-bdsec-dark hover:text-gray-900 dark:hover:text-white transition-all duration-200 z-10" />
          </Carousel>
        </div>
      </div>
      <div className="flex w-full justify-end ">
   
              
              <Link 
          href={`/stocks?filter=${activeFilter}`} 
          aria-label={t('dashboard.viewAll')}
          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-bdsec/50 dark:focus:ring-indigo-500/40 transition"
        >
          <span>{t('dashboard.viewAll')}</span>
          <ChevronRight size={14} className="ml-0.5 transition-transform group-hover:translate-x-0.5" />
          
        </Link>
      </div>

    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const StockList = React.memo(StockListComponent, (prevProps, nextProps) => {
  console.log(prevProps, nextProps)
  // Simplified comparison to reduce computation and prevent over-optimization
  if (prevProps.loading !== nextProps.loading) return false;
  if (prevProps.activeFilter !== nextProps.activeFilter) return false;
  if (prevProps.displayPeriodDescription !== nextProps.displayPeriodDescription) return false;
  
  // Check selected card key fields only
  if (prevProps.selectedCard?.Symbol !== nextProps.selectedCard?.Symbol) return false;
  if (Math.abs((prevProps.selectedCard?.PreviousClose || 0) - (nextProps.selectedCard?.PreviousClose || 0)) > 0.01) return false;
  if (Math.abs((prevProps.selectedCard?.Changep || 0) - (nextProps.selectedCard?.Changep || 0)) > 0.01) return false;
  
  // Check filteredStocks length and first few items only (performance optimization)
  if (prevProps.filteredStocks.length !== nextProps.filteredStocks.length) return false;
  
  // Only check first 5 stocks to reduce computation
  const checkLimit = Math.min(5, prevProps.filteredStocks.length);
  for (let i = 0; i < checkLimit; i++) {
    const prev = prevProps.filteredStocks[i];
    const next = nextProps.filteredStocks[i];
    if (!prev || !next) return false;
    if (prev.Symbol !== next.Symbol) return false;
    if (Math.abs((prev.PreviousClose || 0) - (next.PreviousClose || 0)) > 0.01) return false;
    if (Math.abs((prev.Changep || 0) - (next.Changep || 0)) > 0.01) return false;
  }
  
  return true;
})
