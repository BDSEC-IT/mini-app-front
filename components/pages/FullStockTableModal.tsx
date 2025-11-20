import React from 'react';
import { X, ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StockData } from '@/lib/api'; // Assuming StockData type is exported from here

interface FullStockTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  filteredStocks: StockData[];
  sortConfig: { key: keyof StockData | null; direction: 'asc' | 'desc' };
  blinkingRows: Map<string, 'gain' | 'loss'>;
  previousStockValues: { [symbol: string]: { price: number; change: number } };
  getCompanyName: (stock: StockData) => string;
  formatPrice: (price: number | undefined, isBond: boolean) => string;
  getStockCategory: (stock: StockData) => string;
  handleSort: (key: keyof StockData) => void;
}

const FullStockTableModal: React.FC<FullStockTableModalProps> = ({
  isOpen,
  onClose,
  filteredStocks,
  sortConfig,
  blinkingRows,
  previousStockValues,
  getCompanyName,
  formatPrice,
  getStockCategory,
  handleSort,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'mn';

  

  // Re-implement sortedStocks and renderCategoryStocks locally for the modal
  // This ensures the modal is self-contained and doesn't rely on parent's memoized functions directly
  const sortedModalStocks = React.useMemo(() => {
    if (!sortConfig.key) return filteredStocks;

    return [...filteredStocks].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredStocks, sortConfig]);

  const truncateCompanyName = (name: string | null | undefined) => {
    if (!name) return '';
    const truncated = name.slice(0, 10);
    return name.length > 10 ? truncated + '...' : name;
  };

  const renderModalStocks = (stocks: StockData[]) => {
    return stocks.map((stock) => {
      const isBondCategory = getStockCategory(stock) === 'BOND';
      const blinkClass = blinkingRows.get(stock.Symbol);

      return (
        <tr
          key={stock.Symbol}
          className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
            blinkClass === 'gain' ? 'bg-green-100 dark:bg-green-900/30' : blinkClass === 'loss' ? 'bg-red-100 dark:bg-red-900/30' : ''
          }`}
        >
          <td className="px-2 py-2 whitespace-nowrap w-10 flex">
            <a href={`/stocks/${stock.Symbol}`} className="flex flex-col">
              <span className="font-medium text-xs text-gray-900 dark:text-gray-100">{stock.Symbol}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{truncateCompanyName(getCompanyName(stock))}</span>
            </a>
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.LastTradedPrice, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm">
            <div className="flex items-center justify-end">
              {stock.Changep !== null && stock.Changep !== undefined ? (
                <>
                  <span className={`font-medium ${
                    stock.Changep > 0 ? 'text-green-500' : stock.Changep < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {stock.Changep > 0 ? '+' : ''}{stock.Changep.toFixed(2)}%
                  </span>
                  {stock.Changep !== 0 && (
                    <span className="ml-1">
                      {stock.Changep > 0 ? 
                        <ArrowUp size={12} className="text-green-500" /> : 
                        <ArrowDown size={12} className="text-red-500" />
                      }
                    </span>
                  )}
                </>
              ) : '-'}
            </div>
          </td>
          <td className="px-2 py-2 text-right text-sm">
            <span className={`font-medium ${
              Number(stock.Changes) > 0 ? 'text-green-500' : Number(stock.Changes) < 0 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {Number(stock.Changes) > 0 ? '+' : ''}{typeof stock.Changes === 'number' ? stock.Changes.toFixed(2) : '-'}
            </span>
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {stock.Volume?.toLocaleString() || '-'}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {stock.Turnover?.toLocaleString() || '-'}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.PreviousClose, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.OpeningPrice, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.HighPrice, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.LowPrice, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.ClosingPrice, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {stock.sizemd?.toLocaleString() || '-'}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.MDEntryPx, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {formatPrice(stock.MDEntryPx2, isBondCategory)}
          </td>
          <td className="px-2 py-2 text-right text-sm font-normal">
            {stock.sizemd2?.toLocaleString() || '-'}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full h-full max-w-full max-h-[98vh] overflow-hidden flex flex-col">
        <div className="flex justify-end items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={onClose} 
            className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="flex-grow overflow-auto">
          <table className="w-full text-xs min-w-max">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <th className="px-2 py-3 text-left w-10">
                  <div className="flex items-center cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('Symbol')}>
                    {t('allStocks.symbol')}
                    {sortConfig.key === 'Symbol' && (
                      sortConfig.direction === 'asc' ? 
                        <ChevronDown size={12} className="ml-1 text-gray-600 dark:text-gray-400" /> : 
                        <ChevronDown size={12} className="ml-1 transform rotate-180 text-gray-600 dark:text-gray-400" />
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('LastTradedPrice')}>
                    {t('allStocks.lastTradedPrice')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('Changep')}>
                    {t('allStocks.changePercentage')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('Changes')}>
                    {t('allStocks.changes')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('Volume')}>
                    {t('allStocks.volume')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('Turnover')}>
                    {t('allStocks.turnover')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('PreviousClose')}>
                    {t('allStocks.previousClose')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('OpeningPrice')}>
                    {t('allStocks.openingPrice')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('HighPrice')}>
                    {t('allStocks.highPrice')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('LowPrice')}>
                    {t('allStocks.lowPrice')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('ClosingPrice')}>
                    {t('allStocks.closingPrice')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('sizemd')}>
                    {t('allStocks.bidVolume')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('MDEntryPx')}>
                    {t('allStocks.bidPrice')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('MDEntryPx2')}>
                    {t('allStocks.askPrice')}
                  </div>
                </th>
                <th className="px-2 py-3 text-right">
                  <div className="flex items-center justify-end cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400" onClick={() => handleSort('sizemd2')}>
                    {t('allStocks.askVolume')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {renderModalStocks(sortedModalStocks)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FullStockTableModal;
