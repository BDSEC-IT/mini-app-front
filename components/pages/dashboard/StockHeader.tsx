
// External libraries
import React, { useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Internal UI components
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { BlinkEffect } from '@/components/ui/BlinkEffect';

// Types
import type { StockData } from '@/lib/api';


// Props interface
interface StockHeaderProps {
  selectedSymbol: string;
  selectedStockData: StockData | null;
  isSearchOpen: boolean;
  searchTerm: string;
  searchResults: StockData[];
  chartLoading: boolean;
  isDataFresh?: boolean;
  onSearchClick: () => void;
  onSearchClose: () => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStockSelect: (symbol: string) => void;
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


// Main StockHeader component
export const StockHeader = ({
  selectedSymbol,
  selectedStockData,
  isSearchOpen,
  searchTerm,
  searchResults,
  chartLoading,
  isDataFresh = true,
  onSearchClick,
  onSearchClose,
  onSearchChange,
  onStockSelect
}: StockHeaderProps) => {
  const { t, i18n } = useTranslation();
  const searchRef = useRef<HTMLDivElement>(null);
  const currentLanguage = i18n.language || 'mn';

  // Close search popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onSearchClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSearchClose]);

  // UI
  return (
    <div className="w-full transition-all duration-300 my-3 ">
      <div className="flex flex-col">
        {/* Symbol and Company Name */}
        <div className="flex ">
        <div className="w-full items-center ">
          <h2 className="text-lg font-semibold ml-2">
            {selectedStockData?.Symbol?.toUpperCase().includes('-BD')
              ? selectedStockData?.Symbol
              : selectedStockData?.Symbol?.split('-')[0]}
          </h2>
          {selectedStockData && (
            <span className="text-sm font-medium bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 px-2 py-1 rounded-md">
              {getCompanyName(selectedStockData, t, currentLanguage)}
            </span>
          )}
        </div>

        {/* Search Popover */}
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
                    <span className="font-medium flex-shrink-0 text-gray-900 dark:text-gray-100">{selectedSymbol.split('-')[0]}</span>
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
                    {searchResults.length > 0 ? (
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
                              <span className="font-medium text-gray-900 dark:text-white flex-shrink-0">{stock.Symbol}</span>
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

</div>
        {/* Price and Date */}
        <div className="mt-2">
          <div className="flex flex-col items-start mb-2 px-2">
            {selectedStockData ? (
              <BlinkEffect value={selectedStockData?.PreviousClose || 0}>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatPrice(selectedStockData.PreviousClose, selectedStockData.Symbol)} ₮
                </div>
              </BlinkEffect>
            ) : (
              <div className="animate-pulse bg-gray-300 dark:bg-gray-700 rounded-md w-32 h-10"></div>
            )}
            
            {/* Historical data indicator */}
            {selectedStockData && !isDataFresh && (
              <div className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-800 mt-1">
                Түүхэн дата
              </div>
            )}
            
            {/* Enhanced date/time display with clear visibility */}
            <div className="mt-2 min-h-[32px] flex items-center gap-2">
              {chartLoading && !selectedStockData?.MDEntryTime ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-bdsec dark:border-t-white rounded-full animate-spin"></span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Мэдээлэл ачаалж байна...</span>
                </div>
              ) : selectedStockData?.MDEntryTime ? (
                (() => {
                  const isoString = selectedStockData.MDEntryTime;
                  const [datePart, timePartWithZ] = isoString.split('T');
                  const timePart = timePartWithZ.split('.')[0];
                  
                  // Check if it's today's data
                  const entryDate = new Date(isoString);
                  const today = new Date();
                  const isToday = (
                    entryDate.getFullYear() === today.getFullYear() &&
                    entryDate.getMonth() === today.getMonth() &&
                    entryDate.getDate() === today.getDate()
                  );
                  
                  return (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      isToday 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isToday 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-amber-500'
                      }`}></div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${
                          isToday 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-amber-700 dark:text-amber-400'
                        }`}>
                          {isToday ? 'Өнөөдрийн мэдээлэл' : 'Түүхэн мэдээлэл'}
                        </span>
                        <span className={`text-xs ${
                          isToday 
                            ? 'text-green-600 dark:text-green-500' 
                            : 'text-amber-600 dark:text-amber-500'
                        }`}>
                          {datePart} {timePart}
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Мэдээлэл байхгүй</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};