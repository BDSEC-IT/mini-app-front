'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  fetchSecondaryOrders,
  placeSecondaryOrder,
  cancelSecondaryOrder,
  fetchIstockNominalBalance,
  fetchIstockBalanceAsset,
  fetchCompanies,
  fetchSpecificStockData,
  fetchEnhancedOrderBook,
  fetchOrderBook,
  fetchTodayCompletedOrders,
  getUserAccountInformation,
  type StockData,
  type SecondaryOrderData,
  type EnhancedOrderBookData,
  type CompletedOrderEntry
} from '@/lib/api';
import { ArrowLeftIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { TradingViewChart } from '../ui/TradingViewChart';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Input, Select, Card } from '@/components/ui';
import { StockSelector } from '@/components/exchange/StockSelector';
import { OrderBook } from '@/components/exchange/OrderBook';
import { CompletedOrders } from '@/components/exchange/CompletedOrders';
import { OrderForm } from '@/components/exchange/OrderForm';
import { MyOrders } from '@/components/exchange/MyOrders';

type OrderSide = 'BUY' | 'SELL';
type ActiveTab = 'orderbook' | 'chart';

interface OrderData {
  id: string;
  symbol: string;
  statusname: string;
  buySell: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}
type OrderTab = 'active' | 'completed' | 'cancelled';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderData: {
    symbol: string;
    side: OrderSide;
    type: string;
    quantity: string;
    price?: string;
    total: number;
  };
  feeEquity: string | null;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({ isOpen, onClose, onConfirm, orderData, feeEquity }) => {
  const { t } = useTranslation('common');
  
  if (!isOpen) return null;
  
  // Calculate fee and net total
  const feePercent = parseFloat(feeEquity || '1');
  const feeAmount = orderData.total * (feePercent / 100);
  const netTotal = orderData.side === 'BUY' 
    ? orderData.total + feeAmount 
    : orderData.total - feeAmount;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm w-full p-6">
        <h3 className="text-lg font-medium mb-4">{t('exchange.confirmOrder', 'Захиалга баталгаажуулах')}</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('exchange.stock', 'Хувьцаа')}:</span>
            <span className="font-medium">{orderData.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('exchange.type', 'Төрөл')}:</span>
            <span className={`font-medium ${orderData.side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
              {orderData.side === 'BUY' ? t('exchange.buyAction', 'Худалдан авах') : t('exchange.sellAction', 'Худалдан зарах')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('exchange.quantity')}:</span>
            <span className="font-medium">{orderData.quantity}</span>
          </div>
          {orderData.price && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('exchange.price')}:</span>
              <span className="font-medium">{parseFloat(orderData.price).toLocaleString()}₮</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">{t('exchange.subtotal', 'Дүн')}:</span>
            <span className="font-medium">{orderData.total.toLocaleString()}₮</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t('exchange.tradingFee', 'Шимтгэл')} ({feePercent}%):
            </span>
            <span className="font-medium text-orange-600 dark:text-orange-400">
              {orderData.side === 'BUY' ? '+' : '-'}{feeAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}₮
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-gray-300 dark:border-gray-600">
            <span className="text-base font-bold text-gray-800 dark:text-gray-200" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.02em' }}>
              {t('exchange.netTotal', 'Шимтгэл тооцсон нийт дүн')}:
            </span>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.01em' }}>
              {netTotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}₮
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            {t('exchange.cancel', 'Цуцлах')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 px-4 rounded-lg text-white ${
              orderData.side === 'BUY' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {t('exchange.confirm', 'Баталгаажуулах')}
          </button>
        </div>
      </div>
    </div>
  );
};


const getPriceStep = (price: number): number => {
  if (price < 1000) return 0.01;
  if (price < 5000) return 1;
  if (price < 10000) return 5;
  if (price < 20000) return 10;
  if (price < 40000) return 20;
  if (price < 50000) return 40;
  if (price < 80000) return 50;
  return 80;
};

export default function Exchange() {
  const { t } = useTranslation('common');
  const { theme } = useTheme();
  const searchParams = useSearchParams();

  // Core state
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [, setStockBalance] = useState(0);
  const [stockHoldings, setStockHoldings] = useState<any[]>([]);
  const [selectedStockHolding, setSelectedStockHolding] = useState<any>(null);
  const [orders, setOrders] = useState<SecondaryOrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [orderBook, setOrderBook] = useState<EnhancedOrderBookData | null>(null);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrderEntry[]>([]);
  const [placing, setPlacing] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showStockSelector, setShowStockSelector] = useState(false);
  const [showPriceSteps, setShowPriceSteps] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('orderbook');
  const [orderTab, setOrderTab] = useState<OrderTab>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [feeEquity, setFeeEquity] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  
  // Form state
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState('Нөхцөлт');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [orderDuration, setOrderDuration] = useState('GTC'); // GTC, DAY, GTD
  const [expireDate, setExpireDate] = useState<string>(''); // For GTD orders

  // Initialize data
  useEffect(() => {
    const init = async () => {
      console.log('Exchange: Initializing data...');
      await Promise.all([
        fetchAccountInfo(),
        fetchStockHoldings(),
        fetchStocks(),
        fetchOrdersData(),
        fetchFeeInformation()
      ]);
    };
    init();
  }, []);

  // Force refresh balance when component mounts (in case it wasn't called before)
  useEffect(() => {
    const refreshBalance = async () => {
      console.log('Exchange: Force refreshing balance...');
      await fetchAccountInfo();
    };
    
    // Refresh immediately and then every 30 seconds
    refreshBalance();
    const interval = setInterval(refreshBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh order book when stock changes
  useEffect(() => {
    if (selectedStock) {
      fetchOrderBookData(selectedStock.Symbol);
      const interval = setInterval(() => {
        fetchOrderBookData(selectedStock.Symbol);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedStock]);

  const fetchAccountInfo = async () => {
    const token = Cookies.get('token');
    if (!token) {
      console.log('No token found in cookies');
      return;
    }
    
    try {
      const result = await fetchIstockNominalBalance(token);
      console.log('Account balance API result:', result);
      
      if (result.success && result.data) {
        console.log('Balance data structure:', result.data);
        
        // Handle if data is an array
        if (Array.isArray(result.data)) {
          const mntBalance = result.data.find((item: any) => item.currency === 'MNT');
          if (mntBalance && mntBalance.balance !== undefined) {
            setAccountBalance(mntBalance.balance);
            console.log('Set account balance to:', mntBalance.balance);
          } else {
            console.log('No MNT balance found in array data');
            setAccountBalance(0);
          }
        } 
        // Handle if data is an object with balance property
        else if (typeof result.data === 'object' && result.data.balance !== undefined) {
          setAccountBalance(result.data.balance);
          console.log('Set account balance to:', result.data.balance);
        }
        // Handle if data is an object with MNT property
        else if (typeof result.data === 'object' && result.data.MNT !== undefined) {
          setAccountBalance(result.data.MNT);
          console.log('Set account balance to:', result.data.MNT);
        }
        // Handle other object structures
        else if (typeof result.data === 'object') {
          // Look for any numeric property that might be the balance
          const possibleBalance = Object.values(result.data).find(val => typeof val === 'number');
          if (possibleBalance !== undefined) {
            setAccountBalance(possibleBalance as number);
            console.log('Set account balance to:', possibleBalance);
          } else {
            console.log('No balance found in object data:', result.data);
            setAccountBalance(0);
          }
        } else {
          console.log('Unexpected data structure:', result.data);
          setAccountBalance(0);
        }
      } else {
        console.log('API call failed or no data:', result);
        setAccountBalance(0);
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
      setAccountBalance(0);
    }
  };

  const fetchFeeInformation = async () => {
    const token = Cookies.get('token');
    if (!token) {
      console.log('No token found in cookies');
      return;
    }
    
    try {
      const result = await getUserAccountInformation(token);
      console.log('Account information API result:', result);
      
      if (result.success && result.data) {
        const feeEquityValue = result.data.FeeEquity || '1';
        setFeeEquity(feeEquityValue);
        console.log('Set fee equity to:', feeEquityValue);
      }
    } catch (error) {
      console.error('Error fetching fee information:', error);
      setFeeEquity('1'); // Default to 1% if fetch fails
    }
  };

  const fetchStockHoldings = async () => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      const result = await fetchIstockBalanceAsset(token);
      console.log('Stock holdings result:', result);
      if (result.success && result.data) {
        setStockHoldings(result.data);
        // Calculate total stock balance
        const total = result.data.reduce((sum: number, asset: any) => sum + (asset.marketValue || 0), 0);
        setStockBalance(total);
      }
    } catch (error) {
      console.error('Error fetching stock holdings:', error);
    }
  };

  // Update selected stock holding when stock changes
  useEffect(() => {
    if (selectedStock && stockHoldings.length > 0) {
      const holding = stockHoldings.find(h => h.symbol === selectedStock.Symbol || h.assetId === selectedStock.Symbol);
      setSelectedStockHolding(holding || null);
    }
  }, [selectedStock, stockHoldings]);

  const fetchStocks = async () => {
    try {
      const result = await fetchCompanies(1, 5000);
      console.log('Companies API result:', result);
      
      if (result.success && result.data) {
        console.log('Raw companies data:', result.data);
        
        const tradingStocks = result.data
          .filter(company => {
            const hasSymbol = company.symbol && company.symbol.trim() !== '';
            const notBond = !company.symbol?.includes('-BD');
            const notOther = !company.symbol?.includes('-B-') && !company.symbol?.includes('-G-');
            return hasSymbol && notBond && notOther;
          })
          .map(company => ({
            ...company,
            Symbol: company.symbol.replace('-O-0000', ''),
            mnName: company.mnTitle || '',
            enName: company.enTitle || '',
            PreviousClose: 0,
            Changes: 0,
            Changep: 0,
            pkId: company.id,
            Volume: 0,
            Turnover: 0,
            MDSubOrderBookType: '',
            LastTradedPrice: 0,
            ClosingPrice: 0,
            OpeningPrice: 0,
            VWAP: 0,
            MDEntryTime: '',
            trades: 0,
            HighPrice: 0,
            LowPrice: 0,
            MarketSegmentID: '',
            sizemd: '',
            MDEntryPx: 0,
            sizemd2: '',
            MDEntryPx2: 0,
            HighestBidPrice: 0,
            LowestOfferPrice: 0,
            AuctionClearingPrice: 0,
            Imbalance: 0,
            BuyOrderVWAP: 0,
            SellOrderVWAP: 0,
            BuyOrderQty: 0,
            SellOrderQty: 0,
            OpenIndicator: '',
            CloseIndicator: '',
            TradeCondition: '',
            securityType: '',
            dates: '',
            createdAt: '',
            updatedAt: ''
          }));
        
        console.log('Processed trading stocks:', tradingStocks);
        console.log('Total stocks after filtering:', tradingStocks.length);
        
        setStocks(tradingStocks as StockData[]);
        
        // Try to find and select BDS as default, then fallback to others
        console.log('=== STOCK SELECTION DEBUG ===');
        console.log('Available stock symbols:', tradingStocks.map(s => s.Symbol));
        const bdsStock = tradingStocks.find(stock => stock.Symbol.includes('BDS'));
        console.log('BDS stock found:', bdsStock ? `YES - ${bdsStock.Symbol}` : 'NO');
        console.log('Total stocks available:', tradingStocks.length);
        
        const defaultStock = bdsStock ||
          tradingStocks.find(stock => ['KHAN', 'APU', 'MSM', 'TDB', 'SBN'].includes(stock.Symbol)) ||
          tradingStocks[0];
        
        if (defaultStock) {
          console.log('Selected default stock:', defaultStock.Symbol);
          setSelectedStock(defaultStock);
          // Fetch real price data
          fetchStockPrice(defaultStock.Symbol);
        } else {
          console.log('No stocks available');
        }
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchStockPrice = async (symbol: string) => {
    try {
      const result = await fetchSpecificStockData(symbol);
      console.log(`Fetching price for ${symbol}:`, result);

      if (result.success && result.data) {
        const stockData = Array.isArray(result.data) ? result.data[0] : result.data;
        if (stockData) {
          setSelectedStock(prev => prev ? {
            ...prev,
            PreviousClose: stockData.PreviousClose || stockData.ClosingPrice || 0,
            Changes: stockData.Changes || 0,
            Changep: stockData.Changep || 0,
            LastTradedPrice: stockData.LastTradedPrice || 0,
            HighPrice: stockData.HighPrice || 0,
            LowPrice: stockData.LowPrice || 0,
            Volume: stockData.Volume || 0,
            Turnover: stockData.Turnover || 0
          } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  };

  // Handle URL query parameters from quick buy/sell buttons
  useEffect(() => {
    if (!stocks.length) return; // Wait for stocks to load

    const symbol = searchParams.get('symbol');
    const side = searchParams.get('side');
    const priceParam = searchParams.get('price');

    if (symbol && side) {
      // Find the stock
      const stock = stocks.find(s => s.Symbol === symbol || s.Symbol.startsWith(symbol));
      if (stock) {
        setSelectedStock(stock);
        fetchStockPrice(stock.Symbol);
      }

      // Set order side
      if (side === 'BUY' || side === 'SELL') {
        setOrderSide(side as OrderSide);
      }

      // Set price if provided
      if (priceParam) {
        setPrice(priceParam);
        setOrderType('Нөхцөлт'); // Set to limit order
      }

      // Clear URL parameters after setting
      window.history.replaceState({}, '', '/exchange');
    }
  }, [stocks, searchParams]);

  const fetchOrdersData = async () => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      setLoadingOrders(true);
      const result = await fetchSecondaryOrders(token);
      if (result.success && result.data) {
        // Sort orders by date in descending order (newest first)
        const sortedOrders = result.data.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || a.date || 0).getTime();
          const dateB = new Date(b.createdAt || b.date || 0).getTime();
          return dateB - dateA; // Descending order
        });
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchOrderBookData = async (symbol: string) => {
    const token = Cookies.get('token');
    try {
      // Try to get more data by adding parameters
      const enhancedUrl = `${symbol}-O-0000`;
      console.log('Fetching orderbook for:', enhancedUrl);
      
      const [orderBookResult, completedResult] = await Promise.all([
        fetchEnhancedOrderBook(enhancedUrl, token || undefined, 20), // Request 20 entries
        fetchTodayCompletedOrders(symbol, token || undefined)
      ]);

      if (orderBookResult.success) {
        console.log('OrderBook data received:', orderBookResult.data);
        console.log('Buy orders count:', orderBookResult.data?.buy?.length || 0);
        console.log('Sell orders count:', orderBookResult.data?.sell?.length || 0);
        console.log('API source:', orderBookResult.source);
        setOrderBook(orderBookResult.data);
      } else {
        console.log('Enhanced orderbook failed, trying regular orderbook...');
        // Fallback to regular orderbook API if enhanced fails
        const regularOrderBook = await fetchOrderBook(symbol);
        console.log('Regular orderbook result:', regularOrderBook);
      }
      if (completedResult.success) {
        setCompletedOrders(completedResult.data.assetTradeList.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  const validateOrder = () => {
    if (!selectedStock || !quantity) return t('exchange.missingInfo', 'Мэдээлэл дутуу байна');
    
    const qty = parseFloat(quantity);
    if (qty <= 0) return t('exchange.invalidQuantity', 'Тоо ширхэг буруу байна');
    
    if (orderSide === 'SELL') {
      const availableShares = selectedStockHolding?.quantity || 0;
      if (qty > availableShares) return t('exchange.insufficientShares', `Зөвхөн ${availableShares} ширхэг зарах боломжтой`, { shares: availableShares });
    }
    
    if (orderSide === 'BUY') {
      const orderPrice = orderType === 'Зах зээлийн' 
        ? (selectedStock.PreviousClose || 0)
        : (parseFloat(price) || 0);
      const totalCost = qty * orderPrice;
      if (totalCost > (accountBalance || 0)) return t('exchange.insufficientBalance', 'Дансны үлдэгдэл хүрэлцэхгүй байна');
    }
    
    if (orderType === 'Нөхцөлт' && !price) return t('exchange.enterPrice', 'Үнэ оруулна уу');
    
    // Validate expireDate for GTD orders
    if (orderDuration === 'GTD' && !expireDate) {
      return t('exchange.selectExpireDate', 'Захиалга дуусах огноо сонгоно уу');
    }
    
    // Ensure date is within 30 days
    if (orderDuration === 'GTD' && expireDate) {
      const selectedDate = new Date(expireDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      maxDate.setHours(23, 59, 59, 999);
      
      if (selectedDate < today) {
        return t('exchange.pastDateNotAllowed', 'Захиалга дуусах огноо өнгөрсөн байж болохгүй');
      }
      if (selectedDate > maxDate) {
        return t('exchange.dateExceeds30Days', 'Захиалга дуусах огноо 30 хоногоос хэтрэхгүй байх ёстой');
      }
    }
    
    return null;
  };

  const handlePlaceOrder = async () => {
    const token = Cookies.get('token');
    if (!token) {
      toast.error(t('exchange.pleaseLogin', 'Нэвтэрч орно уу'));
      return;
    }

    const validationError = validateOrder();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const orderData = {
      symbol: selectedStock!.Symbol,
      side: orderSide,
      type: orderType,
      quantity: quantity,
      price: orderType === 'Нөхцөлт' ? price : undefined,
      total: calculateTotal()
    };

    setPendingOrder(orderData);
    setShowConfirmModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!pendingOrder) return;
    
    const token = Cookies.get('token');
    if (!token) return;

    setPlacing(true);
    setShowConfirmModal(false);
    
    try {
      // Calculate expireDate based on timeForce
      let calculatedExpireDate: string | undefined;
      
      if (orderDuration === 'DAY') {
        // For DAY orders: expire at end of today
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        calculatedExpireDate = today.toISOString();
      } else if (orderDuration === 'GTD') {
        // For GTD orders: use selected date or default to 30 days
        if (expireDate) {
          const selectedDate = new Date(expireDate);
          selectedDate.setHours(23, 59, 59, 999);
          calculatedExpireDate = selectedDate.toISOString();
        } else {
          // Default to 30 days from now
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
          thirtyDaysLater.setHours(23, 59, 59, 999);
          calculatedExpireDate = thirtyDaysLater.toISOString();
        }
      } else if (orderDuration === 'GTC') {
        // For GTC orders: automatically set to 30 days from now (MSE requirement)
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
        thirtyDaysLater.setHours(23, 59, 59, 999);
        calculatedExpireDate = thirtyDaysLater.toISOString();
      }
      
      const orderData = {
        symbol: selectedStock!.Symbol,
        orderType: orderType === 'Зах зээлийн' ? 'MARKET' : 'CONDITIONAL',
        timeForce: orderDuration,
        channel: 'API',
        side: orderSide,
        price: orderType === 'Зах зээлийн' ? (selectedStock!.PreviousClose || selectedStock!.LastTradedPrice || 0) : parseFloat(price),
        quantity: parseFloat(quantity),
        exchangeId: 1,
        ...(calculatedExpireDate && { expireDate: calculatedExpireDate })
      };

      const result = await placeSecondaryOrder(orderData, token);
      if (result.success) {
        toast.success(t('exchange.orderPlaced', 'Захиалга амжилттай илгээгдлээ'));
        setQuantity('');
        setPrice('');
        // Refresh all data
        await Promise.all([
          fetchOrdersData(),
          fetchStockHoldings(),
          fetchAccountInfo(),
          selectedStock ? fetchOrderBookData(selectedStock.Symbol) : Promise.resolve()
        ]);
      } else {
        // Show the actual API error message
        const errorMessage = result.message || result.error || t('exchange.orderFailed', 'Захиалга амжилтгүй');
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // Show the actual error message from the exception
      const errorMessage = error?.response?.data?.message || error?.message || t('exchange.error', 'Алдаа гарлаа');
      toast.error(errorMessage);
    } finally {
      setPlacing(false);
      setPendingOrder(null);
    }
  };

  const getMaxQuantity = () => {
    if (orderSide === 'SELL') {
      return selectedStockHolding?.quantity || 0;
    } else {
      const orderPrice = orderType === 'Зах зээлийн' 
        ? (selectedStock?.PreviousClose || 0)
        : (parseFloat(price) || selectedStock?.PreviousClose || 0);
      if (orderPrice > 0) {
        return Math.floor((accountBalance || 0) / orderPrice);
      }
    }
    return 0;
  };

  const handleCancelOrder = async (orderId: string) => {
    const numericOrderId: number = parseInt(orderId, 10);
    const token = Cookies.get('token');
    if (!token) return;

    try {
      const result = await cancelSecondaryOrder(numericOrderId, token);
      if (result.success) {
        toast.success(t('exchange.orderCancelled', 'Захиалга цуцлагдлаа'));
        await fetchOrdersData();
      } else {
        // Show the actual API error message
        const errorMessage = result.message || result.error || t('exchange.error', 'Захиалга цуцлах үед алдаа гарлаа');
        toast.error(errorMessage);
      }
    } catch (error: any) {
      // Show the actual error message from the exception
      const errorMessage = error?.response?.data?.message || error?.message || t('exchange.error', 'Алдаа гарлаа');
      toast.error(errorMessage);
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = orderType === 'Зах зээлийн' 
      ? (selectedStock?.PreviousClose || selectedStock?.LastTradedPrice || 0)
      : (parseFloat(price) || 0);
    return (qty * orderPrice * 1.001); // Include 0.1% fee
  };

  const adjustPriceByStep = (currentPrice: string, direction: 'up' | 'down') => {
    const priceVal = parseFloat(currentPrice) || (selectedStock?.PreviousClose || 0);
    const step = getPriceStep(priceVal);
    const newPrice = direction === 'up' ? priceVal + step : priceVal - step;
    return Math.max(0, newPrice).toString();
  };

  const formatNumber = (num: number) => num.toLocaleString('mn-MN', { minimumFractionDigits: 2 });

  const handleOrderClick = (side: 'BUY' | 'SELL', price: string, quantity: string) => {
    setOrderSide(side);
    setPrice(price);
    setQuantity(quantity);
    setOrderType('Нөхцөлт');
  };

  const handleSelectStock = (stock: StockData) => {
    setSelectedStock(stock);
    setSearchTerm('');
    fetchStockPrice(stock.Symbol);
  };

  if (showPriceSteps) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setShowPriceSteps(false)} className="mr-3">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">{t('exchange.priceSteps', 'Үнийн алхам')}</h1>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            <div>{t('exchange.unitPrice', 'Нэгжийн үнэ')}</div>
            <div>{t('exchange.changeAmount', 'Өөрчлөлтийн хэмжээ')}</div>
          </div>
          {[
            ['1000-с доош', '0.01 төгрөг'],
            ['1000-5000', '1 төгрөг'],
            ['5000-10000', '5 төгрөг'],
            ['10000-20000', '10 төгрөг'],
            ['20000-40000', '20 төгрөг'],
            ['40000-50000', '40 төгрөг'],
            ['50000-80000', '50 төгрөг'],
            ['80000-100000', '80 төгрөг'],
          ].map(([range, step], index) => (
            <div key={index} className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="text-gray-800 dark:text-gray-200">{range}</div>
              <div className="text-gray-800 dark:text-gray-200">{step}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showStockSelector) {
    return (
      <StockSelector
        isOpen={showStockSelector}
        onClose={() => setShowStockSelector(false)}
        stocks={stocks}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStock={selectedStock}
        onSelectStock={handleSelectStock}
      />
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 min-h-screen pb-24">
      {/* Trading Header - Price Focused */}
      {selectedStock && (
        <div className="bg-white dark:bg-gray-900 mx-3 mt-3 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Combined Header */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Symbol Search - Dashboard Style */}
              <button
                onClick={() => setShowStockSelector(true)}
                className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 max-w-44 sm:max-w-52 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 h-10 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <MagnifyingGlassIcon className="w-3 h-3 text-gray-600 dark:text-gray-300 mr-1 flex-shrink-0" />
                <div className="flex items-center text-xs font-normal min-w-0 overflow-hidden">
                  <span className="font-medium flex-shrink-0 text-gray-900 dark:text-gray-100">
                    {selectedStock.Symbol.split('-')[0]}
                  </span>
                  <span className="mx-1 text-xs font-normal flex-shrink-0 text-gray-500 dark:text-gray-300">
                    •
                  </span>
                  <span className="truncate text-xs font-normal text-gray-600 dark:text-gray-300">
                    {(selectedStock.mnName || selectedStock.enName)?.substring(0, 8) || ''}
                  </span>
                </div>
                <ChevronDownIcon className="w-3 h-3 text-gray-600 dark:text-gray-300 ml-1 flex-shrink-0" />
              </button>

              {/* Price & Change */}
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedStock.PreviousClose > 0 ? formatNumber(selectedStock.PreviousClose) : '...'}₮
                </div>
                <div className={`text-xs font-medium ${selectedStock.Changes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedStock.PreviousClose > 0 ? `${selectedStock.Changes > 0 ? '+' : ''}${selectedStock.Changes.toFixed(2)} (${selectedStock.Changes > 0 ? '+' : ''}${selectedStock.Changep.toFixed(2)}%)` : '...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {selectedStock && (
        <div className="px-3 pb-2 border-gray-200 dark:border-gray-700">
          <div className="flex mb-3 items-center gap-6">
            <button
              onClick={() => setActiveTab('orderbook')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'orderbook'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('exchange.orderbook', 'Захиалгын сан')}
              {activeTab === 'orderbook' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'chart'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('exchange.chart', 'График')}
              {activeTab === 'chart' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 dark:bg-blue-400"></div>
              )}
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'chart' ? (
            <div className="mb-10 mt-5 h-80">
              <TradingViewChart
                symbol={selectedStock.Symbol}
                theme={theme}
                period="ALL"
              />
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-5 gap-x-3">
                <OrderBook
                  orderBook={orderBook}
                  onOrderClick={handleOrderClick}
                />
                <CompletedOrders
                  completedOrders={completedOrders}
                />
              </div>
            </div>
          )}

          <OrderForm
            orderType={orderType}
            setOrderType={setOrderType}
            orderSide={orderSide}
            setOrderSide={setOrderSide}
            orderDuration={orderDuration}
            setOrderDuration={setOrderDuration}
            expireDate={expireDate}
            setExpireDate={setExpireDate}
            quantity={quantity}
            setQuantity={setQuantity}
            price={price}
            setPrice={setPrice}
            accountBalance={accountBalance}
            selectedStockHolding={selectedStockHolding}
            calculateTotal={calculateTotal}
            formatNumber={formatNumber}
            getMaxQuantity={getMaxQuantity}
            adjustPriceByStep={adjustPriceByStep}
            getPriceStep={getPriceStep}
            selectedStock={selectedStock}
            showPriceSteps={showPriceSteps}
            setShowPriceSteps={setShowPriceSteps}
            placing={placing}
            onPlaceOrder={handlePlaceOrder}
            feeEquity={feeEquity}
          />

          {/* Order Confirmation Modal */}
          <OrderConfirmationModal
            isOpen={showConfirmModal}
            onClose={() => {
              setShowConfirmModal(false);
              setPendingOrder(null);
            }}
            onConfirm={handleConfirmOrder}
            orderData={pendingOrder}
            feeEquity={feeEquity}
          />
        </div>
      )}

      <MyOrders
        loading={loadingOrders}
        orders={orders.map(order => ({ ...order, id: order.id.toString(), buySell: order.buySell as 'BUY' | 'SELL' }))}
        orderTab={orderTab}
        setOrderTab={setOrderTab}
        formatNumber={formatNumber}
        onCancelOrder={handleCancelOrder}
        feeEquity={feeEquity}
      />
    </div>
  );
}