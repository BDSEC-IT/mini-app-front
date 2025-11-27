'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { fetchStockData, type StockData } from '@/lib/api';

interface StockDetails {
  isin: string;
  companyCode: string;
  totalShares: string;
  listedShares: string;
  marketCap: string;
  listingDate: string;
}

interface StockInfoProps {
  symbol?: string;
  onSymbolSelect?: (symbol: string) => void;
  price?: number;
  change?: number;
  changePercent?: number;
  details?: StockDetails;
}

export default function StockInfo({ 
  symbol = 'BDS', 
  onSymbolSelect,
  price,
  change,
  changePercent,
  details
}: StockInfoProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'mn';
  
  // Helper function to get company name based on current language
  const getCompanyName = (stock: StockData) => {
    return currentLanguage === 'mn' ? stock.mnName : stock.enName;
  };

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [allStocks, setAllStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Deduplicate stocks by symbol
  const uniqueStocks = useMemo(() => {
    const stockMap = new Map();
    allStocks.forEach(stock => {
      if (!stockMap.has(stock.Symbol)) {
        stockMap.set(stock.Symbol, stock);
      }
    });
    return Array.from(stockMap.values());
  }, [allStocks]);

  // Format stock options for dropdown to be shorter on mobile
  const formatStockOption = (stock: StockData) => {
    const baseSymbol = stock.Symbol.split('-')[0];
    if (isMobile) {
      return `${baseSymbol}`;
    }
    return `${baseSymbol} - ${getCompanyName(stock)}`;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch specific stock data
      const response = await fetchStockData(`${symbol}-O-0000`);
      if ('data' in response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        const newData = response.data[0] as StockData;
        setStockData(newData);
      }

      // Fetch all stocks for the dropdown only if we don't have them yet
      if (allStocks.length === 0) {
        const allStocksResponse = await fetchStockData();
        if ('data' in allStocksResponse && allStocksResponse.data && Array.isArray(allStocksResponse.data)) {
          setAllStocks(allStocksResponse.data);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setLoading(false);
    }
  }, [symbol, allStocks.length, price, details]);

  useEffect(() => {
    fetchData();
    
    // Only set up polling if we're not using external data
    if (price === undefined && !details) {
      const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [fetchData, price, details]);

  const handleSymbolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSymbol = e.target.value;
    if (onSymbolSelect) {
      onSymbolSelect(newSymbol);
    }
  };

  if (loading && !stockData && price === undefined) return <div className="animate-pulse">{t('dashboard.loading')}</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stockData && price === undefined) return null;

  // Use provided data or fallback to fetched data
  const displayPrice = price !== undefined ? price : stockData?.LastTradedPrice;
  const displayChange = change !== undefined ? change : stockData?.Changes;
  const displayChangePercent = changePercent !== undefined ? changePercent : stockData?.Changep;
  const isPositiveChange = (displayChange || 0) >= 0;

  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '-';
    return value.toLocaleString();
  };

  return (
    <div className="bg-card rounded-lg p-3 sm:p-4">
      {onSymbolSelect && (
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <select 
            className="bg-background text-foreground px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm max-w-[150px] sm:max-w-[180px] md:max-w-none truncate"
            value={symbol}
            onChange={handleSymbolChange}
          >
            {uniqueStocks.map((stock) => {
              // Extract the base symbol without the -O-0000 suffix
              const baseSymbol = stock.Symbol.split('-')[0];
              return (
                <option key={`${baseSymbol}-${stock.pkId}`} value={baseSymbol} className="truncate">
                  {formatStockOption(stock)}
                </option>
              );
            })}
          </select>
          {stockData && isMobile && (
            <span className="text-xs bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 px-2 py-1 rounded-full truncate max-w-[100px]">
              {getCompanyName(stockData)}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">{t('dashboard.price')}</h3>
          <p className="text-lg font-semibold">{formatNumber(displayPrice)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">{t('dashboard.change')}</h3>
          <p className={`text-lg font-semibold flex items-center ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {formatNumber(displayChange)} ({displayChangePercent?.toFixed(2) || '0.00'}%)
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">{t('dashboard.volume')}</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.Volume)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">{t('dashboard.turnover')}</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.Turnover)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">{t('dashboard.high')}</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.HighPrice)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">{t('dashboard.low')}</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.LowPrice)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground" title={t('dashboard.vwapTooltip')}>{t('dashboard.vwap')}</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.VWAP)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">{t('dashboard.orders')}</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.trades)}</p>
        </div>
      </div>

      {details && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ISIN</span>
                <span className="font-semibold">{details.isin}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('dashboard.companyCode')}</span>
                <span className="font-semibold">{details.companyCode}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('dashboard.totalShares')}</span>
                <span className="font-semibold">{parseInt(details.totalShares, 10).toLocaleString('en-US')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('dashboard.listedShares')}</span>
                <span className="font-semibold">{details.listedShares}</span>
              </div>
              {/* <div className="flex justify-between">
                <span>{t('dashboard.listingDate')}</span>
                <span className="font-semibold">{details.listingDate}</span>
              </div> */}
            </div>
          </div>
        </div>
      )}

      {stockData && !details && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="text-sm text-muted-foreground mb-2">{t('dashboard.buy')} {t('dashboard.orders')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('dashboard.vwap')}</span>
                <span className="font-semibold">{formatNumber(stockData.BuyOrderVWAP)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('dashboard.quantity')}</span>
                <span className="font-semibold">{formatNumber(stockData.BuyOrderQty)}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h3 className="text-sm text-muted-foreground mb-2">{t('dashboard.sell')} {t('dashboard.orders')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('dashboard.vwap')}</span>
                <span className="font-semibold">{formatNumber(stockData.SellOrderVWAP)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('dashboard.quantity')}</span>
                <span className="font-semibold">{formatNumber(stockData.SellOrderQty)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 