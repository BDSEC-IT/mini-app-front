import { useRef } from 'react'
import { BarChart3, ChevronRight, TrendingUp, Activity, ArrowUp, ArrowDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from 'embla-carousel-autoplay'
import type { StockData } from '@/lib/api'

interface StockListProps {
  loading: boolean
  activeFilter: string
  filteredStocks: StockData[]
  onFilterChange: (filter: string) => void
  onStockSelect: (symbol: string) => void
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
  onStockSelect
}: StockListProps) => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language || 'mn';
  
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

  return (
    <div className="w-full">
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

      {/* Stock Cards Carousel */}
      <div className="mt-4">
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
                const isPositive = (stock.Changep || 0) >= 0
                
                return (
                  <CarouselItem key={`stock-${stock.Symbol}-${index}`} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div
                      className="relative w-full p-4 overflow-hidden transition-transform duration-300 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500"
                      onClick={() => {
                        onStockSelect(stock.Symbol);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-50 dark:hidden"></div>
                      <svg
                        className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-60"
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
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="flex items-center justify-center font-semibold text-xs  text-white rounded-full bg-bdsec dark:bg-indigo-500 h-10 w-10">
                            {stock.Symbol.split('-')[0]}
                          </h3>
                          <div className={`text-xs font-semibold px-2 py-1 rounded-md ${isPositive ? 'text-green-600 bg-green-100 dark:bg-green-500/10 dark:text-green-400' : 'text-red-600 bg-red-100 dark:bg-red-500/10 dark:text-red-400'}`}>
                            {isPositive ? '+' : ''}{(stock.Changep || 0).toFixed(2)}%
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="font-medium text-gray-800 truncate text-s dark:text-gray-200" title={getCompanyName(stock)}>
                            {getCompanyName(stock)}
                          </p>
                        </div>
                        <div className="mt-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Сүүлийн үнэ</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatPrice(stock.LastTradedPrice)} ₮
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                )
              })
            ) : (
              <CarouselItem className="pl-2 md:pl-4 basis-full">
                <div className="h-24 flex items-center justify-center">
                  <p className="text-gray-500">{loading ? t('dashboard.loadingStocks') : t('common.noResults')}</p>
                </div>
              </CarouselItem>
            )}
          </CarouselContent>
          {/* <CarouselPrevious className="left-0 bg-bdsec dark:bg-indigo-500 text-white border-none shadow-lg hover:bg-bdsec/90 dark:hover:bg-indigo-600 transition-colors" />
          <CarouselNext className="right-0 bg-bdsec dark:bg-indigo-500 text-white border-none shadow-lg hover:bg-bdsec/90 dark:hover:bg-indigo-600 transition-colors" /> */}
        </Carousel>
      </div>
    </div>
  )
} 