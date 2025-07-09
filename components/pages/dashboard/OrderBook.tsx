import { Activity, ArrowDown, ArrowUp, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { OrderBookEntry } from '@/lib/api'

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

export const OrderBook = ({
  selectedSymbol,
  loading,
  lastUpdated,
  processedOrderBook,
  onRefresh
}: OrderBookProps) => {
  const { t } = useTranslation()
  const date = new Date(lastUpdated);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  const formattedDate = date.toLocaleDateString();
  return (
    <div className="mt-8 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-medium flex items-center">
          <Activity size={16} className="mr-2 text-bdsec dark:text-indigo-400" />
          {t('dashboard.orderBook')} - {selectedSymbol.split('-')[0]}
        </h2>
        <div className="flex items-center gap-2">
          <div className="text-xs text-right text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
            <div className="hidden sm:block">{t('dashboard.lastUpdated')}</div>
            <div className="text-xs">{formattedDate}</div>
            <div className="text-xs">{formattedTime}</div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-bdsec dark:hover:text-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh order book"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-3 min-h-[200px]">
        {/* Sell Orders */}
        <div className="overflow-hidden">
          <div className="px-2 sm:px-4 py-2 bg-red-50 dark:bg-red-900/10">
            <div className="grid grid-cols-2 text-right">
              <h3 className="text-xs sm:text-sm text-red-500 font-medium flex items-center">
                <ArrowDown size={12} className="mr-1" />
                {t('dashboard.sell')}
              </h3>
              <h3 className="text-xs sm:text-sm text-gray-500 font-medium">{t('dashboard.quantity')}</h3>
            </div>
          </div>

          <div className="p-2 sm:p-3">
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <div
                  key={`sell-loading-${index}`}
                  className="grid grid-cols-2 text-right text-xs sm:text-sm py-2 animate-pulse"
                >
                  <div className="h-3 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded justify-self-end"></div>
                  <div className="h-3 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded justify-self-end"></div>
                </div>
              ))
            ) : processedOrderBook.sell.length > 0 ? (
              processedOrderBook.sell.map((order, index) => (
                <div
                  key={`sell-${order.id}-${index}`}
                  className="grid grid-cols-2 text-right text-xs sm:text-sm py-1.5 sm:py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="text-red-500 font-medium justify-self-end">
                    {order.MDEntryPx.toLocaleString()} ₮
                  </span>
                  <span className="bg-red-50 dark:bg-red-900/10 px-1.5 sm:px-2 rounded text-gray-700 dark:text-gray-300 text-xs justify-self-end">
                    {order.MDEntrySize.toLocaleString()}
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

        {/* Buy Orders */}
        <div className="overflow-hidden">
          <div className="px-2 sm:px-4 py-2 bg-green-50 dark:bg-green-900/10">
            <div className="grid grid-cols-2 text-right">
              <h3 className="text-xs sm:text-sm text-green-500 font-medium flex items-center">
                <ArrowUp size={12} className="mr-1" />
                {t('dashboard.buy')}
              </h3>
              <h3 className="text-xs sm:text-sm text-gray-500 font-medium">{t('dashboard.quantity')}</h3>
            </div>
          </div>

          <div className="p-2 sm:p-3">
            {loading ? (
              Array(5).fill(0).map((_, index) => (
                <div
                  key={`buy-loading-${index}`}
                  className="grid grid-cols-2 text-right text-xs sm:text-sm py-2 animate-pulse"
                >
                  <div className="h-3 w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded justify-self-end"></div>
                  <div className="h-3 w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded justify-self-end"></div>
                </div>
              ))
            ) : processedOrderBook.buy.length > 0 ? (
              processedOrderBook.buy.map((order, index) => (
                <div
                  key={`buy-${order.id}-${index}`}
                  className="grid grid-cols-2 text-right text-xs sm:text-sm py-1.5 sm:py-2 border-b border-dashed border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="text-green-500 font-medium justify-self-end">
                    {order.MDEntryPx.toLocaleString()} ₮
                  </span>
                  <span className="bg-green-50 dark:bg-green-900/10 px-1.5 sm:px-2 rounded text-gray-700 dark:text-gray-300 text-xs justify-self-end">
                    {order.MDEntrySize.toLocaleString()}
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
      </div>
    </div>
  )
} 