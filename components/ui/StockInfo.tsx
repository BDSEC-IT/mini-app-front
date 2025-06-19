'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { fetchStockData, type StockData } from '@/lib/api';

interface StockInfoProps {
  symbol?: string;
  onSymbolSelect?: (symbol: string) => void;
}

export default function StockInfo({ symbol = 'KHAN', onSymbolSelect }: StockInfoProps) {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [allStocks, setAllStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch specific stock data
      const response = await fetchStockData(symbol);
      if ('data' in response && !Array.isArray(response.data)) {
        const newData = response.data as StockData;
        setStockData(prev => {
          // Only update if data has changed
          if (!prev || JSON.stringify(prev) !== JSON.stringify(newData)) {
            return newData;
          }
          return prev;
        });
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
  }, [symbol, allStocks.length]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && !stockData) return <div className="animate-pulse">Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stockData) return null;

  const isPositiveChange = stockData.Changes >= 0;

  return (
    <div className="bg-card rounded-lg p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <select 
          className="bg-background text-foreground px-3 py-2 rounded-md"
          value={symbol}
          onChange={(e) => onSymbolSelect?.(e.target.value)}
        >
          {uniqueStocks.map((stock) => (
            <option key={`${stock.Symbol}-${stock.pkId}`} value={stock.Symbol}>
              {stock.Symbol} - {stock.mnName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Last Price</h3>
          <p className="text-lg font-semibold">{stockData.LastTradedPrice.toLocaleString()}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Change</h3>
          <p className={`text-lg font-semibold flex items-center ${isPositiveChange ? 'text-green-500' : 'text-red-500'}`}>
            {isPositiveChange ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
            {stockData.Changes.toLocaleString()} ({stockData.Changep.toFixed(2)}%)
          </p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Volume</h3>
          <p className="text-lg font-semibold">{stockData.Volume.toLocaleString()}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Turnover</h3>
          <p className="text-lg font-semibold">{stockData.Turnover.toLocaleString()}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">High</h3>
          <p className="text-lg font-semibold">{stockData.HighPrice.toLocaleString()}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Low</h3>
          <p className="text-lg font-semibold">{stockData.LowPrice.toLocaleString()}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">VWAP</h3>
          <p className="text-lg font-semibold">{stockData.VWAP.toLocaleString()}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Trades</h3>
          <p className="text-lg font-semibold">{stockData.trades.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-muted p-3 rounded-lg">
          <h3 className="text-sm text-muted-foreground mb-2">Buy Orders</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>VWAP</span>
              <span className="font-semibold">{stockData.BuyOrderVWAP.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity</span>
              <span className="font-semibold">{stockData.BuyOrderQty.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <h3 className="text-sm text-muted-foreground mb-2">Sell Orders</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>VWAP</span>
              <span className="font-semibold">{stockData.SellOrderVWAP.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Quantity</span>
              <span className="font-semibold">{stockData.SellOrderQty.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 