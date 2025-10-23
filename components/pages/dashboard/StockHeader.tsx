
// External libraries
import React, { useEffect, useRef } from 'react';
import { Search, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

// Internal UI components
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { BlinkEffect } from '@/components/ui/BlinkEffect';

// Types
import type { StockData, OrderBookEntry } from '@/lib/api';


// Props interface
interface StockHeaderProps {
  selectedSymbol: string;
  selectedStockData: StockData | null;
  isSearchOpen?: boolean;
  searchTerm?: string;
  searchResults?: StockData[];
  chartLoading: boolean;
  isDataFresh?: boolean;
  orderBook?: {
    buy: OrderBookEntry[];
    sell: OrderBookEntry[];
  };
  canTrade?: boolean; // Whether user has MCSD account and can place orders
  onSearchClick?: () => void;
  onSearchClose?: () => void;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStockSelect?: (symbol: string) => void;
}


// Helper: Format price for stocks/bonds
const formatPrice = (price: number | undefined, symbol?: string) => {
  if (price === undefined || price === null) return '-';
  const isBond = symbol?.toUpperCase().includes('-BD');
  const finalPrice = isBond ? price * 1000 : price;
  return finalPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

// Helper: Get company name by language
const getCompanyName = (stock: StockData | null, t: any, lang: string) => {
  if (!stock) return t('dashboard.stock');
  return lang === 'mn' ? stock.mnName : stock.enName;
};

// Helper: Format symbol display (shorten both stocks and bonds)
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


// Main StockHeader component
export const StockHeader = ({
  selectedSymbol,
  selectedStockData,
  isSearchOpen,
  searchTerm,
  searchResults,
  chartLoading,
  isDataFresh = true,
  orderBook,
  canTrade = false,
  onSearchClick,
  onSearchClose,
  onSearchChange,
  onStockSelect
}: StockHeaderProps) => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const currentLanguage = i18n.language || 'mn';

  // Get best bid (highest buy price) and best ask (lowest sell price) from orderbook
  const bestBid = orderBook?.buy && orderBook.buy.length > 0
    ? Math.max(...orderBook.buy.map(order => order.MDEntryPx || 0))
    : null;

  const bestAsk = orderBook?.sell && orderBook.sell.length > 0
    ? Math.min(...orderBook.sell.map(order => order.MDEntryPx || 0))
    : null;

  // Handler for quick buy (use best ask price)
  const handleQuickBuy = () => {
    if (!canTrade || !selectedStockData) return;

    // Navigate to exchange page with query params
    const params = new URLSearchParams({
      symbol: selectedStockData.Symbol,
      side: 'BUY',
      ...(bestAsk && { price: bestAsk.toString() })
    });

    router.push(`/exchange?${params.toString()}`);
  };

  // Handler for quick sell (use best bid price)
  const handleQuickSell = () => {
    if (!canTrade || !selectedStockData) return;

    // Navigate to exchange page with query params
    const params = new URLSearchParams({
      symbol: selectedStockData.Symbol,
      side: 'SELL',
      ...(bestBid && { price: bestBid.toString() })
    });

    router.push(`/exchange?${params.toString()}`);
  };

  // Close search popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onSearchClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSearchClose]);

  // UI
  return (
    <div className="w-full transition-all duration-300">
      <div className="flex flex-col">
        {/* Single Line Header with Symbol/Price/Time on left, Buttons on right */}
        <div className="flex items-start justify-between gap-4">
          {/* Left: Symbol with Price and Time stacked below */}
          <div className="flex flex-col gap-1">
            {/* Symbol Only */}
            <h2 className="text-lg font-semibold">
              {selectedStockData?.Symbol ? formatSymbolDisplay(selectedStockData.Symbol) : ''}
            </h2>

            {/* Price */}
            {selectedStockData ? (
              <BlinkEffect value={selectedStockData.LastTradedPrice || 0}>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(selectedStockData.LastTradedPrice, selectedStockData.Symbol)} ₮
                </div>
              </BlinkEffect>
            ) : (
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-24 h-8"></div>
            )}

            {/* Last Updated - Label on one line, Date/Time on line below */}
            {chartLoading && !selectedStockData?.MDEntryTime ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">Сүүлд шинэчлэгдсэн</span>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 border-2 border-gray-300 border-t-bdsec dark:border-t-white rounded-full animate-spin"></span>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Ачаалж байна...</span>
                </div>
              </div>
            ) : selectedStockData?.MDEntryTime ? (
              (() => {
                const isoString = selectedStockData.MDEntryTime;
                const [datePart, timePartWithZ] = isoString.split('T');
                const timePart = timePartWithZ.split('.')[0];
                
                return (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Сүүлд шинэчлэгдсэн</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {datePart} {timePart}
                    </span>
                  </div>
                );
              })()
            ) : (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-gray-600 dark:text-gray-400">Сүүлд шинэчлэгдсэн</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Мэдээлэл байхгүй</span>
              </div>
            )}
          </div>

          {/* Right: Quick Buy/Sell Buttons - Only show if user can trade */}
          {canTrade && selectedStockData && (
            <div className="flex gap-2 flex-shrink-0">
              {/* Buy Button with Best Ask Price */}
              <button
                onClick={handleQuickBuy}
                disabled={!bestAsk}
                className="flex flex-col items-center justify-center px-5 py-3 rounded-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-colors duration-200 min-w-[95px]"
                title={bestAsk ? `Авах - ${formatPrice(bestAsk, selectedStockData.Symbol)}₮` : 'Захиалга байхгүй'}
              >
                <span className="text-sm font-bold">Авах</span>
                {bestAsk && (
                  <span className="text-xs font-semibold mt-0.5 opacity-90">
                    {formatPrice(bestAsk, selectedStockData.Symbol)}₮
                  </span>
                )}
              </button>

              {/* Sell Button with Best Bid Price */}
              <button
                onClick={handleQuickSell}
                disabled={!bestBid}
                className="flex flex-col items-center justify-center px-5 py-3 rounded-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white transition-colors duration-200 min-w-[95px]"
                title={bestBid ? `Зарах - ${formatPrice(bestBid, selectedStockData.Symbol)}₮` : 'Захиалга байхгүй'}
              >
                <span className="text-sm font-bold">Зарах</span>
                {bestBid && (
                  <span className="text-xs font-semibold mt-0.5 opacity-90">
                    {formatPrice(bestBid, selectedStockData.Symbol)}₮
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Search Popover - Only show if search props are provided */}
        {onSearchClick && onSearchClose && onSearchChange && onStockSelect && (
          <div className="relative flex h-7 justify-start mt-2">
            <Popover open={isSearchOpen} onOpenChange={open => open ? onSearchClick() : onSearchClose()}>
              <PopoverTrigger asChild>
              {selectedStockData ? (
                <button
                  className="flex items-center border rounded-lg px-3 py-2 dark:bg-blue-900/20 dark:border-blue-800 max-w-44 sm:max-w-52 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 h-10"
                  type="button"
                  onClick={onSearchClick}
                >
                  <Search size={12} className="text-gray-600 dark:text-gray-400 mr-1 flex-shrink-0" />
                  <div className="flex items-center text-xs font-normal min-w-0 overflow-hidden">
                    <span className="font-medium flex-shrink-0 text-gray-900 dark:text-gray-100">
                      {selectedStockData ? formatSymbolDisplay(selectedStockData.Symbol) : selectedSymbol.split('-')[0]}
                    </span>
                    <span className="mx-1 text-xs font-normal flex-shrink-0 text-gray-500 dark:text-gray-400">•</span>
                    <span className="truncate text-xs font-normal text-gray-600 dark:text-gray-300">
                      {getCompanyName(selectedStockData, t, currentLanguage)?.substring(0, 8) || ''}
                    </span>
                  </div>
                  <ChevronDown size={12} className="text-gray-600 dark:text-gray-400 ml-1 flex-shrink-0" />
                </button>
              ) : (
                <button
                  className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 h-10"
                  type="button"
                  onClick={onSearchClick}
                >
                  <Search size={12} className="text-gray-600 dark:text-gray-400 mr-1" />
                  <span className="text-xs font-normal text-gray-900 dark:text-gray-100">{t('common.search')}</span>
                </button>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 sm:w-72 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mt-2">
              <div ref={searchRef} className="w-full">
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-100 dark:bg-gray-800 w-full h-10">
                  <Search size={12} className="text-gray-600 dark:text-gray-400 mr-1.5 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={onSearchChange}
                    className="bg-transparent outline-none text-gray-900 dark:text-gray-100 flex-1 text-sm font-normal min-w-0"
                    placeholder={t('dashboard.searchByCompanyOrSymbol')}
                    autoFocus
                  />
                </div>
                {/* Search Results Dropdown */}
                {searchTerm && (
                  <div className="mt-2 max-h-48 overflow-y-auto">
                    {searchResults && searchResults.length > 0 ? (
                      searchResults.map((stock, index) => {
                        const companyName = getCompanyName(stock, t, currentLanguage);
                        return (
                          <button
                            key={`search-${stock.Symbol}-${index}`}
                            className="w-full text-left px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm font-normal bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 mb-1 h-12"
                            onClick={() => {
                              onStockSelect(stock.Symbol);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">{formatSymbolDisplay(stock.Symbol)}</span>
                              <span className="text-gray-600 dark:text-gray-300 truncate text-xs font-normal mt-0.5">{companyName}</span>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-2.5 py-2 text-xs font-normal text-gray-500">{t('common.noResults')}</div>
                    )}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          </div>
        )}
      </div>
    </div>
  );
};