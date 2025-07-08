import { useRef, useEffect, useState, useLayoutEffect } from 'react'
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
import type { StockData } from '@/lib/api'

interface StockListProps {
  loading: boolean
  activeFilter: string
  filteredStocks: StockData[]
  onFilterChange: (filter: string) => void
  onStockSelect: (symbol: string) => void
  selectedCard?: StockData
}

const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null) return '-'
  return price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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

  // Helper function to get company name based on current language
  const getCompanyName = (stock: StockData) => {
    return currentLanguage === 'mn' ? stock.mnName : stock.enName;
  };
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: false })
  )

  const filters = [
    { id: 'trending', label: t('dashboard.trending'), icon: TrendingUp },
    { id: 'mostActive', label: t('dashboard.mostActive'), icon: Activity },
    { id: 'gainers', label: t('dashboard.gainers'), icon: ArrowUp },
    { id: 'losers', label: t('dashboard.losers'), icon: ArrowDown }
  ]

  // Prepare cards: selected card first, then the rest
  const selectedStock = selectedCard;
  const otherStocks = selectedStock
    ? filteredStocks.filter(stock => stock.Symbol.split('-')[0] !== selectedStock.Symbol.split('-')[0])
    : filteredStocks;

  // Responsive basis for carousel items
  const getBasisClass = () => {
    return 'min-w-[170px] max-w-[170px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[170px] md:max-w-[170px] lg:min-w-[170px] lg:max-w-[170px]';
  };

  useLayoutEffect(() => {
    if (!api) return
    // Always scroll to the first card (start) on symbol change or card update
    api.scrollTo(0, false)
  }, [selectedCard, api, otherStocks.length])

  return (
    <div className="w-full px-2 sm:px-4">
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
      <div className="flex gap-2 mt-5 pb-4 overflow-x-auto flex-nowrap sm:flex-wrap no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter.id}
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
        ))}
      </div>

      {/* Selected card pinned to the left, outside the scrollable carousel */}
      <div className="flex items-stretch gap-2 mt-4 py-2">
        
        {selectedStock && (
          <div
            className={`shrink-0 ${getBasisClass()} border-bdsec border-[2px] dark:border-indigo-400 bg-gradient-to-br from-bdsec/5 to-bdsec/10 dark:from-indigo-500/10 dark:to-indigo-500/5 rounded-xl  p-2 sm:p-3 flex flex-col justify-between transition-all duration-300 relative overflow-hidden z-10`}
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
            <div className="flex items-start justify-between mb-2 z-10">
              <h3 className="flex items-center justify-center font-semibold text-xs text-white rounded-full h-8 w-8 bg-bdsec dark:bg-indigo-400   ">
                {selectedStock.Symbol.split('-')[0]}
              </h3>
              <div className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${selectedStock.Changep >= 0 ? 'text-green-600 bg-green-100 dark:bg-green-500/10 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400'}`}>
                {selectedStock.Changep >= 0 ? '+' : ''}{(selectedStock.Changep || 0).toFixed(2)}%
              </div>
            </div>
            <div className="mt-1 z-10">
              <p className="font-medium text-gray-800 truncate text-xs dark:text-gray-200" title={getCompanyName(selectedStock)}>
                {getCompanyName(selectedStock)}
              </p>
            </div>
            <div className="mt-2 z-10">
              <p className="text-xs text-gray-500 dark:text-gray-400">Сүүлийн үнэ</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {formatPrice(selectedStock.LastTradedPrice)} ₮
              </p>
            </div>
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
            <CarouselContent className="flex pl-8">
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
                        <div className="flex items-start justify-between mb-2 z-10">
                          <h3 className="flex items-center justify-center font-semibold text-xs text-white rounded-full h-8 w-8 bg-bdsec dark:bg-indigo-500">
                            {stock.Symbol.split('-')[0]}
                          </h3>
                          <div className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${isPositive ? 'text-green-600 bg-green-100 dark:bg-green-500/10 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400'}`}>
                            {isPositive ? '+' : ''}{(stock.Changep || 0).toFixed(2)}%
                          </div>
                        </div>
                        <div className="mt-1 z-10">
                          <p className="font-medium text-gray-800 truncate text-xs dark:text-gray-200" title={getCompanyName(stock)}>
                            {getCompanyName(stock)}
                          </p>
                        </div>
                        <div className="mt-2 z-10">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Сүүлийн үнэ</p>
                          <p className="text-base font-bold text-gray-900 dark:text-white">
                            {formatPrice(stock.LastTradedPrice)} ₮
                          </p>
                        </div>
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
    </div>
  )
} 