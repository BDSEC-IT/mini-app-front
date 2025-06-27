'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchStockData, type StockData } from '@/lib/api';

interface StockDetails {
  isin: string;
  companyCode: string;
  totalShares: string;
  listedShares: string;
  marketCap: string;
  listingDate: string;
  email: string;
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
    return `${baseSymbol} - ${stock.mnName || stock.enName}`;
  };

  const fetchData = useCallback(async () => {
    // If we have external data provided, don't fetch
    if (price !== undefined && details) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch specific stock data
      console.log(`Fetching stock data for symbol: ${symbol}`);
      const response = await fetchStockData(`${symbol}-O-0000`);
      if ('data' in response && !Array.isArray(response.data)) {
        const newData = response.data as StockData;
        setStockData(newData);
      }

      // Fetch all stocks for the dropdown only if we don't have them yet
      if (allStocks.length === 0) {
        const allStocksResponse = await fetchStockData();
        if ('data' in allStocksResponse && Array.isArray(allStocksResponse.data)) {
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
    console.log(`Symbol changed to: ${newSymbol}`);
    if (onSymbolSelect) {
      onSymbolSelect(newSymbol);
    }
  };

  if (loading && !stockData && price === undefined) return <div className="animate-pulse">Loading...</div>;
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
    <div className="bg-card rounded-lg p-4">
      {onSymbolSelect && (
        <div className="flex justify-between items-center mb-4">
          <select 
            className="bg-background text-foreground px-3 py-2 rounded-md text-sm max-w-[180px] md:max-w-none truncate"
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
            <span className="text-xs bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 px-2 py-1 rounded-full truncate max-w-[120px]">
              {stockData.mnName || stockData.enName}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Last Price</h3>
          <p className="text-lg font-semibold">{formatNumber(displayPrice)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Change</h3>
          <p className={`text-lg font-semibold flex items-center ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {formatNumber(displayChange)} ({displayChangePercent?.toFixed(2) || '0.00'}%)
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Volume</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.Volume)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Turnover</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.Turnover)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">High</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.HighPrice)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Low</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.LowPrice)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">VWAP</h3>
          <p className="text-lg font-semibold">{formatNumber(stockData?.VWAP)}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Trades</h3>
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
                <span>Company Code</span>
                <span className="font-semibold">{details.companyCode}</span>
              </div>
              <div className="flex justify-between">
                <span>Email</span>
                <span className="font-semibold">{details.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Shares</span>
                <span className="font-semibold">{details.totalShares}</span>
              </div>
              <div className="flex justify-between">
                <span>Listed Shares</span>
                <span className="font-semibold">{details.listedShares}</span>
              </div>
              <div className="flex justify-between">
                <span>Listing Date</span>
                <span className="font-semibold">{details.listingDate}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {stockData && !details && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <h3 className="text-sm text-muted-foreground mb-2">Buy Orders</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>VWAP</span>
                <span className="font-semibold">{formatNumber(stockData.BuyOrderVWAP)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span className="font-semibold">{formatNumber(stockData.BuyOrderQty)}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-lg">
            <h3 className="text-sm text-muted-foreground mb-2">Sell Orders</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>VWAP</span>
                <span className="font-semibold">{formatNumber(stockData.SellOrderVWAP)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span className="font-semibold">{formatNumber(stockData.SellOrderQty)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 