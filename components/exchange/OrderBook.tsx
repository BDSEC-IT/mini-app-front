import React from 'react';
import { useTranslation } from 'react-i18next';

interface OrderBookEntry {
  price: number;
  quantity: number;
}

interface OrderBookData {
  buy: OrderBookEntry[];
  sell: OrderBookEntry[];
}

interface OrderBookProps {
  orderBook: OrderBookData | null;
  onOrderClick: (side: 'BUY' | 'SELL', price: string, quantity: string) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({ orderBook, onOrderClick }) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="col-span-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-1.5 border border-gray-200 dark:border-gray-700">
      {/* Order Book Headers */}
      <div className="grid grid-cols-4  text-[10px] font-medium text-gray-600 dark:text-gray-300 pb-1">
                <div className="text-center">{t('exchange.shares', 'Ширхэг')}</div>
        <div className="text-green-600 text-center">{t('exchange.buy', 'Авах')}</div>

        <div className="text-red-600 text-center">{t('exchange.sell', 'Зарах')}</div>
        <div className="text-center">{t('exchange.shares', 'Ширхэг')}</div>
      </div>

      {/* Order Book Data */}
      <div>
        {orderBook ? (
          Array.from({ length: Math.max(orderBook.sell?.length || 0, orderBook.buy?.length || 0) }).map((_, index) => {
            const bidOrder = orderBook.sell[index];
            const askOrder = orderBook.buy[index];
            return (
              <div key={index} className="grid pr-5 grid-cols-4 gap-x-4 text-[10px]">
                {/* Buy side - clickable row */}
                <button 
                  onClick={() => {
                    if (bidOrder) {
                      onOrderClick('BUY', bidOrder.price.toString(), bidOrder.quantity.toString());
                    }
                  }}
                  className="col-span-2  gap-x-4 grid grid-cols-2 hover:bg-green-50 dark:hover:bg-green-900/10 py-0.5 transition-colors"
                >
                     <span className="text-gray-700 dark:text-gray-300 text-right">
                    {bidOrder ? bidOrder.quantity : ''}
                  </span>
                  <span className="text-green-600 ml-3 font-medium text-right">
                    {bidOrder ? bidOrder.price.toFixed(0) : ''}
                  </span>
               
                </button>
                {/* Sell side - clickable row */}
                <button 
                  onClick={() => {
                    if (askOrder) {
                      onOrderClick('SELL', askOrder.price.toString(), askOrder.quantity.toString());
                    }
                  }}
                  className="col-span-2 grid  grid-cols-2 hover:bg-red-50 dark:hover:bg-red-900/10 py-0.5 transition-colors"
                >
                  <span className="text-red-600 font-medium text-right">
                    {askOrder ? askOrder.price.toFixed(0) : ''}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-right">
                    {askOrder ? askOrder.quantity : ''}
                  </span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">{t('common.loading', 'Мэдээлэл ачааллаж байна')}</div>
        )}
      </div>
    </div>
  );
};