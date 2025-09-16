import React from 'react';

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
  return (
    <div className="col-span-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      {/* Order Book Headers */}
      <div className="grid grid-cols-4 gap-0 text-xs font-semibold text-gray-600 dark:text-gray-300 pb-2 mb-1">
        <div className="text-green-600 text-center flex items-center justify-center">Авах</div>
        <div className="text-center flex items-center justify-center">Тоо ширхэг</div>
        <div className="text-red-600 text-center flex items-center justify-center">Зарах</div>
        <div className="text-center flex items-center justify-center">Тоо ширхэг</div>
      </div>

      {/* Order Book Data */}
      <div>
        {orderBook ? (
          Array.from({ length: Math.max(orderBook.sell?.length || 0, orderBook.buy?.length || 0) }).map((_, index) => {
            const bidOrder = orderBook.sell[index];
            const askOrder = orderBook.buy[index];
            return (
              <div key={index} className="grid grid-cols-4 gap-0 text-xs">
                {/* Buy side - clickable row */}
                <button 
                  onClick={() => {
                    if (bidOrder) {
                      onOrderClick('BUY', bidOrder.price.toString(), bidOrder.quantity.toString());
                    }
                  }}
                  className="col-span-2 grid grid-cols-2 hover:bg-green-50 dark:hover:bg-green-900/10 py-1.5 transition-colors"
                >
                  <span className="text-green-600 font-semibold text-left flex items-center justify-evenly">
                    {bidOrder ? bidOrder.price.toFixed(0) : ''}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-left flex items-center justify-evenly">
                    {bidOrder ? bidOrder.quantity : ''}
                  </span>
                </button>
                {/* Sell side - clickable row */}
                <button 
                  onClick={() => {
                    if (askOrder) {
                      onOrderClick('SELL', askOrder.price.toString(), askOrder.quantity.toString());
                    }
                  }}
                  className="col-span-2 grid grid-cols-2 hover:bg-red-50 dark:hover:bg-red-900/10 py-1.5 transition-colors"
                >
                  <span className="text-red-600 font-semibold text-center flex items-center justify-center">
                    {askOrder ? askOrder.price.toFixed(0) : ''}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 text-center flex items-center justify-center">
                    {askOrder ? askOrder.quantity : ''}
                  </span>
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">Мэдээлэл ачааллаж байна</div>
        )}
      </div>
    </div>
  );
};