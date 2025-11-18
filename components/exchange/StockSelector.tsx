import React from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StockData } from '@/lib/api';

interface StockSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockData[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStock: StockData | null;
  onSelectStock: (stock: StockData) => void;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  isOpen,
  onClose,
  stocks,
  searchTerm,
  setSearchTerm,
  selectedStock,
  onSelectStock
}) => {
  if (!isOpen) return null;

  const filteredStocks = stocks.filter(stock => 
    stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stock.mnName && stock.mnName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (stock.enName && stock.enName.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  console.log(filteredStocks);
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <button onClick={onClose} className="mr-4">
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Хувьцаа сонгох</h2>
      </div>
      
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Хувьцааны нэр эсвэл симболоор хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl outline-none bg-white dark:bg-gray-800 text-[16px] text-gray-900 dark:text-white text-small"
            autoFocus
          />
        </div>
      </div>
      
      {/* Stock List */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 min-h-0">
        {filteredStocks.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStocks.map((stock, index) => (
              <button
                key={`${stock.Symbol}-${index}`}
                onClick={() => {
                  onSelectStock(stock);
                  onClose();
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                  selectedStock?.Symbol === stock.Symbol ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">
                      {stock.Symbol.split('-')[0]}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {stock.mnName || stock.enName}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500 dark:text-gray-400 text-sm">Хувьцаа олдсонгүй</div>
          </div>
        )}
      </div>
    </div>
  );
};