'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Activity, ArrowDown, ArrowUp, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { fetchOrderBook, type OrderBookEntry, type StockData } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface OrderBookWidgetProps {
  selectedStock: StockData | null;
  onPriceSelect?: (price: number, side: 'BUY' | 'SELL') => void;
  className?: string;
}

interface ProcessedOrderBook {
  buy: OrderBookEntry[];
  sell: OrderBookEntry[];
  spread: number;
  midPrice: number;
}

const formatOrderPrice = (price: number | undefined, symbol: string) => {
  if (price === undefined || price === null) return '-';
  const isBond = symbol.toUpperCase().includes('-BD');
  const finalPrice = isBond ? price * 1000 : price;
  return finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

const formatQuantity = (quantity: number | undefined) => {
  if (quantity === undefined || quantity === null) return '-';
  return quantity.toLocaleString();
};

export const OrderBookWidget: React.FC<OrderBookWidgetProps> = ({
  selectedStock,
  onPriceSelect,
  className = ''
}) => {
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [orderBook, setOrderBook] = useState<ProcessedOrderBook>({
    buy: [],
    sell: [],
    spread: 0,
    midPrice: 0
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process raw order book data
  const processOrderBook = useCallback((data: OrderBookEntry[]): ProcessedOrderBook => {
    const buyOrders = data
      .filter(order => order.MDEntryType === '0') // Buy orders
      .sort((a, b) => (b.MDEntryPx || 0) - (a.MDEntryPx || 0)) // Highest price first
      .slice(0, 10); // Top 10

    const sellOrders = data
      .filter(order => order.MDEntryType === '1') // Sell orders
      .sort((a, b) => (a.MDEntryPx || 0) - (b.MDEntryPx || 0)) // Lowest price first
      .slice(0, 10); // Top 10

    const bestBid = buyOrders[0]?.MDEntryPx || 0;
    const bestAsk = sellOrders[0]?.MDEntryPx || 0;
    const spread = bestAsk - bestBid;
    const midPrice = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : 0;

    return {
      buy: buyOrders,
      sell: sellOrders,
      spread,
      midPrice
    };
  }, []);

  // Fetch order book data
  const fetchOrderBookData = useCallback(async () => {
    if (!selectedStock?.Symbol) return;

    setLoading(true);
    try {
      const response = await fetchOrderBook(selectedStock.Symbol);
      if (response.status && response.data) {
        const processed = processOrderBook(response.data);
        setOrderBook(processed);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
      toast.error(t('orders.orderBookError'));
    } finally {
      setLoading(false);
    }
  }, [selectedStock?.Symbol, processOrderBook, t]);

  // Auto-refresh order book
  useEffect(() => {
    if (selectedStock?.Symbol) {
      fetchOrderBookData();
      
      // Set up auto-refresh every 10 seconds
      intervalRef.current = setInterval(fetchOrderBookData, 10000);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [selectedStock?.Symbol, fetchOrderBookData]);

  // Handle price selection
  const handlePriceClick = (price: number, side: 'BUY' | 'SELL') => {
    if (onPriceSelect) {
      onPriceSelect(price, side);
    }
  };

  if (!selectedStock) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
          {t('orders.selectStockForOrderBook')}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            {t('orders.orderBook')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedStock.Symbol} • {lastUpdated && t('orders.lastUpdated')}: {lastUpdated}
          </p>
        </div>
        <Button
          onClick={fetchOrderBookData}
          disabled={loading}
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </div>

      {/* Market Info */}
      {orderBook.spread > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('orders.spread')}: </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatOrderPrice(orderBook.spread, selectedStock.Symbol)} ₮
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">{t('orders.midPrice')}: </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatOrderPrice(orderBook.midPrice, selectedStock.Symbol)} ₮
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Sell Orders (Ask) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ArrowDown size={14} className="text-red-500" />
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {t('orders.sell')} ({orderBook.sell.length})
                </span>
              </div>
            </div>
            
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {loading && orderBook.sell.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {t('orders.loading')}
                </div>
              ) : orderBook.sell.length > 0 ? (
                orderBook.sell.map((order, index) => (
                  <button
                    key={`sell-${order.id}-${index}`}
                    onClick={() => handlePriceClick(order.MDEntryPx || 0, 'SELL')}
                    className="w-full group hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg p-2 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
                        {formatOrderPrice(order.MDEntryPx, selectedStock.Symbol)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {formatQuantity(order.MDEntrySize)}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {t('orders.noSellOrders')}
                </div>
              )}
            </div>
          </div>

          {/* Buy Orders (Bid) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ArrowUp size={14} className="text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {t('orders.buy')} ({orderBook.buy.length})
                </span>
              </div>
            </div>
            
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {loading && orderBook.buy.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {t('orders.loading')}
                </div>
              ) : orderBook.buy.length > 0 ? (
                orderBook.buy.map((order, index) => (
                  <button
                    key={`buy-${order.id}-${index}`}
                    onClick={() => handlePriceClick(order.MDEntryPx || 0, 'BUY')}
                    className="w-full group hover:bg-green-50 dark:hover:bg-green-900/10 rounded-lg p-2 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300">
                        {formatOrderPrice(order.MDEntryPx, selectedStock.Symbol)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {formatQuantity(order.MDEntrySize)}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {t('orders.noBuyOrders')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Best Bid/Ask Summary */}
        {(orderBook.buy.length > 0 || orderBook.sell.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-1">{t('orders.bestBid')}</div>
                <div className="text-green-600 dark:text-green-400 font-semibold">
                  {orderBook.buy[0] ? formatOrderPrice(orderBook.buy[0].MDEntryPx, selectedStock.Symbol) : '-'} ₮
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-1">{t('orders.bestAsk')}</div>
                <div className="text-red-600 dark:text-red-400 font-semibold">
                  {orderBook.sell[0] ? formatOrderPrice(orderBook.sell[0].MDEntryPx, selectedStock.Symbol) : '-'} ₮
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};