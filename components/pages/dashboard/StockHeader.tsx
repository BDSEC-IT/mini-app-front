import { Search, ChevronDown, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/lib/utils'
import type { StockData } from '@/lib/api'
import { useEffect, useRef } from 'react';

interface StockHeaderProps {
  selectedSymbol: string
  selectedStockData: StockData | null
  isSearchOpen: boolean
  searchTerm: string
  searchResults: StockData[]
  chartLoading: boolean
  latestEntryTime: string
  onSearchClick: () => void
  onSearchClose: () => void
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onStockSelect: (symbol: string) => void
}

const formatPrice = (price: number | undefined) => {
  if (price === undefined || price === null) return '-'
  return price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export const StockHeader = ({
  selectedSymbol,
  selectedStockData,
  isSearchOpen,
  searchTerm,
  searchResults,
  chartLoading,
  latestEntryTime,
  onSearchClick,
  onSearchClose,
  onSearchChange,
  onStockSelect
}: StockHeaderProps) => {
  const { t, i18n } = useTranslation()
  const searchRef = useRef<HTMLDivElement>(null);
  const currentLanguage = i18n.language || 'mn';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onSearchClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSearchClose]);

  console.log("selectedStockData", selectedStockData);
  console.log("LastTradedPrice", selectedStockData?.LastTradedPrice);
  console.log("ClosingPrice", selectedStockData?.ClosingPrice);
  console.log("PreviousClose", selectedStockData?.PreviousClose);
  
  // Helper function to get company name based on current language
  const getCompanyName = (stock: StockData | null) => {
    if (!stock) return t('dashboard.stock');
    return currentLanguage === 'mn' ? stock.mnName : stock.enName;
  };
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <div className="w-full flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-bold">{selectedSymbol}</h2>
          {selectedStockData && (
            <span className="text-xs bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 px-2 py-1 rounded-full">
              {getCompanyName(selectedStockData)}
            </span>
          )}
        </div>
        
        <div className="mt-2">
          <div className="flex flex-col items-start mb-2 px-2 sm:px-4">
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {selectedStockData ? formatPrice(selectedStockData.LastTradedPrice || selectedStockData.ClosingPrice) : '-'} ₮
            </div>
            <div className="text-xs text-gray-500 mt-1 min-h-[20px] flex items-center">
              {chartLoading && !latestEntryTime ? (
                <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-bdsec dark:border-t-white rounded-full animate-spin mr-2"></span>
              ) : latestEntryTime ? (
                formatDateTime(latestEntryTime)
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Search Component */}
      <div className="relative flex justify-end">
        {isSearchOpen ? (
          <div ref={searchRef} className="absolute right-0 sm:relative">
            <div className="flex items-center border rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-800 w-44 sm:w-52">
              <Search size={12} className="text-gray-500 mr-1.5 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={onSearchChange}
                className="bg-transparent outline-none flex-1 text-xs sm:text-sm min-w-0"
                placeholder={t('common.search')}
              />
            </div>

            {/* Search Results Dropdown */}
            {searchTerm && (
              <div className="absolute right-0 mt-1 w-64 sm:w-72 max-h-48 overflow-y-auto bg-white dark:bg-gray-800 border rounded-md shadow-lg z-50" style={{ minWidth: '200px', maxWidth: 'calc(100vw - 2rem)' }}>
                {searchResults.length > 0 ? (
                  searchResults.map((stock, index) => {
                    const cleanSymbol = stock.Symbol.split('-')[0]
                    const companyName = getCompanyName(stock)
                    return (
                      <button
                        key={`search-${cleanSymbol}-${index}`}
                        className="w-full text-left px-2.5 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs sm:text-sm transition-colors"
                        onClick={() => {
                          onStockSelect(stock.Symbol);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-900 dark:text-white flex-shrink-0">{cleanSymbol}</span>
                          <span className="mx-1.5 text-gray-400 text-xs flex-shrink-0">•</span>
                          <span className="text-gray-600 dark:text-gray-300 truncate text-xs">{companyName}</span>
                        </div>
                      </button>
                    )
                  })
                ) : (
                  <div className="px-2.5 py-2 text-xs text-gray-500">{t('common.noResults')}</div>
                )}
              </div>
            )}
          </div>
        ) : selectedStockData ? (
          <div 
            className="flex items-center border rounded-md px-2 py-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 max-w-44 sm:max-w-52 cursor-pointer" 
            onClick={onSearchClick}
          >
            <Search size={12} className="text-blue-500 mr-1 flex-shrink-0" />
            <div className="flex items-center text-xs min-w-0 overflow-hidden">
              <span className="font-semibold text-blue-700 dark:text-blue-300 flex-shrink-0">{selectedSymbol}</span>
              <span className="mx-1 text-blue-400 text-xs flex-shrink-0">•</span>
              <span className="text-blue-600 dark:text-blue-400 truncate text-xs">
                {(getCompanyName(selectedStockData) || '').substring(0, 8)}
              </span>
            </div>
            <ChevronDown size={12} className="text-blue-500 ml-1 flex-shrink-0" />
          </div>
        ) : (
          <div 
            className="flex items-center border rounded-md px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer" 
            onClick={onSearchClick}
          >
            <Search size={12} className="text-gray-500 mr-1" />
            <span className="text-xs text-gray-500">{t('common.search')}</span>
          </div>
        )}
      </div>
    </div>
  )
} 