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
          <td className="px-0.5 py-0.5 whitespace-nowrap w-10 flex">
            <a href={`/stocks/${stock.Symbol}`} className="flex flex-col">
              <span className="font-medium text-[9px]">{stock.Symbol}</span>
              <span className="text-[8px] flex flex-wrap text-wrap text-gray-500">{truncateCompanyName(getCompanyName(stock))}</span>
            </a>
          </td>
          {/* Reordered columns */}
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.LastTradedPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            <div className="flex items-center justify-end">
              {stock.Changep !== null && stock.Changep !== undefined ? (
                <>
                  <span className={`
                    ${stock.Changep > 0 ? 'text-green-500' : stock.Changep < 0 ? 'text-red-500' : ''}
                  `}>
                    {stock.Changep > 0 ? '+' : ''}{stock.Changep.toFixed(2)}%
                  </span>
                  {stock.Changep !== 0 && (
                    <span className="ml-0.5">
                      {stock.Changep > 0 ? <ArrowUp size={8} className="text-green-500" /> : <ArrowDown size={8} className="text-red-500" />}
                    </span>
                  )}
                </>
              ) : '-'}
            </div>
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            <span className={`
              ${stock.Changes > 0 ? 'text-green-500' : stock.Changes < 0 ? 'text-red-500' : ''}
            `}>
              {stock.Changes > 0 ? '+' : ''}{stock.Changes?.toFixed(2) || '-'}
            </span>
          </td>
          {/* Original columns continue */}
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {stock.Volume?.toLocaleString() || '-'}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {stock.Turnover?.toLocaleString() || '-'}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.PreviousClose, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.OpeningPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.HighPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.LowPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.ClosingPrice, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {stock.sizemd?.toLocaleString() || '-'}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.MDEntryPx, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {formatPrice(stock.MDEntryPx2, isBondCategory)}
          </td>
          <td className="px-0.5 py-0.5 text-right text-[8px]">
            {stock.sizemd2?.toLocaleString() || '-'}
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-1">
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full h-full max-w-full max-h-[98vh] overflow-hidden flex flex-col">
        <div className="flex justify-end items-center p-2 border-b border-gray-200 dark:border-gray-700">
          {/* <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('allStocks.fullTableTitle')}</h2> */}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={18} />
          </button>
        </div>
        <div className="flex-grow overflow-auto"> {/* This will handle scrolling */}
          <table className="w-full text-[8px] min-w-max"><thead>
              <tr className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                <th className="px-0.5 py-1 text-left w-10">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSort('Symbol')}>
                    {t('allStocks.symbol')}
                    {sortConfig.key === 'Symbol' && (
                      sortConfig.direction === 'asc' ? <ChevronDown size={8} /> : <ChevronDown size={8} className="transform rotate-180" />
                    )}
                  </div>
                </th>
                {/* Reordered headers */}
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('LastTradedPrice')}>
                    {t('allStocks.lastTradedPrice')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Changep')}>
                    {t('allStocks.changePercentage')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Changes')}>
                    {t('allStocks.changes')}
                  </div>
                </th>
                {/* Original headers continue */}
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                    {t('allStocks.volume')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Turnover')}>
                    {t('allStocks.turnover')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('PreviousClose')}>
                    {t('allStocks.previousClose')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('OpeningPrice')}>
                    {t('allStocks.openingPrice')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('HighPrice')}>
                    {t('allStocks.highPrice')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('LowPrice')}>
                    {t('allStocks.lowPrice')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('ClosingPrice')}>
                    {t('allStocks.closingPrice')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('sizemd')}>
                    {t('allStocks.bidVolume')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('MDEntryPx')}>
                    {t('allStocks.bidPrice')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('MDEntryPx2')}>
                    {t('allStocks.askPrice')}
                  </div>
                </th>
                <th className="px-0.5 py-1 text-right">
                  <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('sizemd2')}>
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
