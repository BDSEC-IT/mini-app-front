import React from 'react'
import { Activity, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect, useState } from 'react'
import type { OrderBookEntry } from '@/lib/api'

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

const formatOrderPrice = (price: number | undefined, symbol: string) => {
  if (price === undefined || price === null) return '-';
  const isBond = symbol.toUpperCase().includes('-BD');
  const finalPrice = isBond ? price * 1000 : price;
  return finalPrice.toLocaleString();
};

// Skeleton component for order book entries
const OrderBookSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, index) => (
      <div
        key={index}
        className="grid grid-cols-2 text-right text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
      >
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse justify-self-end w-16"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse justify-self-end w-12"></div>
      </div>
    ))}
  </div>
);

// Custom date check function that considers strings that might be dates
const isValidDate = (dateStr: any): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

interface OrderBookProps {
  selectedSymbol: string
  loading: boolean
  lastUpdated: string
  processedOrderBook: {
    buy: OrderBookEntry[]
    sell: OrderBookEntry[]
  }
  onRefresh?: () => void
}

const OrderBookComponent = ({
  selectedSymbol,
  loading,
  lastUpdated,
  processedOrderBook,
  onRefresh
}: OrderBookProps) => {
  const { t } = useTranslation()
  const { ref: orderBookRef, inView: orderBookInView } = useInView(0.1)
  
  // Sort orders by price
  const sortOrders = (orders: OrderBookEntry[], isSell: boolean) => {
    return [...orders].sort((a, b) => {
      const priceA = a.MDEntryPx || 0;
      const priceB = b.MDEntryPx || 0;
      // For sell orders, show lowest price first
      // For buy orders, show highest price first
      return isSell ? priceA - priceB : priceB - priceA;
    });
  };

  // Process buy and sell orders
  const sortedBuyOrders = sortOrders(processedOrderBook.buy, false);
  const sortedSellOrders = sortOrders(processedOrderBook.sell, true);

  // Split the lastUpdated string into date and time parts
  const [datePart, timePart] = lastUpdated.split(' ');

  // Regular order book display for non-bond securities
  return (
    <div 
      ref={orderBookRef}
      className={`w-full rounded-lg backdrop-blur-2xl transition-all duration-1000 my-4 ${
        orderBookInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className={`flex justify-between items-center mb-4 transition-all duration-1000 delay-200 ${
        orderBookInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div>
          <h2 className="text-lg font-semibold flex items-center">
            <Activity size={16} className="mr-2 text-gray-600 dark:text-gray-400" />
            {t('dashboard.orderBook')} - {selectedSymbol.split('-')[0]}
          </h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.orderBookExplanation')}</div>

          {/* <div className="flex items-center gap-2 mt-1">
            <div className="hidden sm:block text-sm font-normal text-gray-600 dark:text-gray-400">
              {t('dashboard.lastUpdated')}
            </div>
            <div className="flex gap-1">
              <div className="text-xs text-gray-500 dark:text-gray-400">{datePart}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{timePart}</div>
            </div>
          </div> */}
        </div>
        {onRefresh && (
          <Button
            onClick={onRefresh}
            disabled={loading}
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-indigo-500"
            title="Refresh order book"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'} />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
      

        {/* Buy Orders */}
        <div className="overflow-hidden">
          <div className="px-3 py-2 bg-green-50 dark:bg-green-900/10">
            <div className="grid grid-cols-2 text-right">
                <h3 className="text-sm font-medium text-gray-500">{t('dashboard.quantity')}</h3>
              <h3 className="text-sm font-medium text-green-500 flex justify-end">
                <ArrowUp size={12} className="mr-1 text-green-500" />
                {t('dashboard.buy')}
              </h3>
            
            </div>
          </div>

          <div className="p-3">
            {loading ? (
              <OrderBookSkeleton />
            ) : sortedBuyOrders.length > 0 ? (
              sortedBuyOrders.map((order, index) => (
                <div
                  key={`buy-${order.id}-${index}`}
                  className="grid grid-cols-2 text-right text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="bg-green-50 dark:bg-green-900/10 px-2 rounded text-gray-700 dark:text-gray-300 text-xs justify-self-end">
                    {(order.MDEntrySize || 0).toLocaleString()}
                  </span>
                  <span className="text-green-500 font-medium justify-self-end text-xs sm:text-sm">
                    {formatOrderPrice(order.MDEntryPx, selectedSymbol)}
                  </span>
                  
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-6">
                {t('dashboard.noBuyOrders')}
              </div>
            )}
          </div>
        </div>
          {/* Sell Orders */}
        <div className="overflow-hidden">
          <div className="px-3 py-2 bg-red-50 dark:bg-red-900/10">
            <div className="grid grid-cols-2 text-right">
              <h3 className="text-sm font-medium text-red-500 flex items-center">
                <ArrowDown size={12} className="mr-1 text-red-500" />
                {t('dashboard.sell')}
              </h3>
              <h3 className="text-sm font-medium text-gray-500">{t('dashboard.quantity')}</h3>
            </div>
          </div>

          <div className="p-3">
            {loading ? (
              <OrderBookSkeleton />
            ) : sortedSellOrders.length > 0 ? (
              sortedSellOrders.map((order, index) => (
                <div
                  key={`sell-${order.id}-${index}`}
                  className="grid grid-cols-2 text-right text-sm py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="text-red-500 mr-5 font-medium justify-self-end text-xs sm:text-sm">
                    {formatOrderPrice(order.MDEntryPx, selectedSymbol)} ₮
                  </span>
                  <span className="bg-red-50 dark:bg-red-900/10 px-2 rounded text-gray-700 dark:text-gray-300 text-xs justify-self-end">
                    {(order.MDEntrySize || 0).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 text-sm py-6">
                {t('dashboard.noSellOrders')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Memoize the OrderBook component to prevent unnecessary re-renders
export const OrderBook = React.memo(OrderBookComponent, (prevProps, nextProps) => {
  return (
    prevProps.selectedSymbol === nextProps.selectedSymbol &&
    prevProps.loading === nextProps.loading &&
    prevProps.lastUpdated === nextProps.lastUpdated &&
    prevProps.processedOrderBook.buy.length === nextProps.processedOrderBook.buy.length &&
    prevProps.processedOrderBook.sell.length === nextProps.processedOrderBook.sell.length &&
    // Check if first few orders are the same (performance optimization)
    JSON.stringify(prevProps.processedOrderBook.buy.slice(0, 3)) === JSON.stringify(nextProps.processedOrderBook.buy.slice(0, 3)) &&
    JSON.stringify(prevProps.processedOrderBook.sell.slice(0, 3)) === JSON.stringify(nextProps.processedOrderBook.sell.slice(0, 3))
  )
}) 