'use client';

import React from 'react';

// Mock data that matches the screenshot
const mockOrderBookData = {
  buy: [
    { price: 4034.89, quantity: 3 },
    { price: 4034.89, quantity: 15 },
    { price: 4034.89, quantity: 20 },
    { price: 4034.89, quantity: 65 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
  ],
  sell: [
    { price: 4034.89, quantity: 20 },
    { price: 4034.89, quantity: 30 },
    { price: 4034.89, quantity: 45 },
    { price: 4034.89, quantity: 100 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
    { price: 4034.89, quantity: 500 },
  ]
};

interface OrderBookDisplayProps {
  symbol?: string;
  onPriceSelect?: (price: number, side: 'BUY' | 'SELL') => void;
}

export default function OrderBookDisplay({ symbol = 'KHAN', onPriceSelect }: OrderBookDisplayProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {symbol} - Хаан банк
        </h3>
      </div>

      {/* Order Book Headers */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 grid grid-cols-4 gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        <div className="text-center">Авах үнэ</div>
        <div className="text-center">Тоо ширхэг</div>
        <div className="text-center">Зарах үнэ</div>
        <div className="text-center">Тоо ширхэг</div>
      </div>

      {/* Order Book Data */}
      <div className="px-4 py-2">
        {mockOrderBookData.buy.map((buyOrder, index) => {
          const sellOrder = mockOrderBookData.sell[index];
          return (
            <div key={index} className="grid grid-cols-4 gap-2 py-1 text-sm border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              {/* Buy Price */}
              <div 
                className="text-center text-green-600 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 py-1 rounded"
                onClick={() => onPriceSelect?.(buyOrder.price, 'BUY')}
              >
                {formatNumber(buyOrder.price)}
              </div>
              
              {/* Buy Quantity */}
              <div className="text-center text-gray-700 dark:text-gray-300">
                {formatNumber(buyOrder.quantity)}
              </div>
              
              {/* Sell Price */}
              <div 
                className="text-center text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 py-1 rounded"
                onClick={() => onPriceSelect?.(sellOrder.price, 'SELL')}
              >
                {formatNumber(sellOrder.price)}
              </div>
              
              {/* Sell Quantity */}
              <div className="text-center text-gray-700 dark:text-gray-300">
                {formatNumber(sellOrder.quantity)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Buttons */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors">
            Авах
          </button>
          <button className="py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors">
            Зарах
          </button>
        </div>
      </div>
    </div>
  );
}