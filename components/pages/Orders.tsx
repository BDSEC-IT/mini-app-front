'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  fetchOrderHistory, 
  placeOrder, 
  cancelOrder,
  fetchAllStocksWithCompanyInfo,
  fetchCompanies,
  fetchSpecificStockData,
  getUserAccountInformation,
  type OrderData,
  type PlaceOrderRequest,
  type StockData 
} from '@/lib/api';
import { ArrowUpIcon, ArrowDownIcon, XMarkIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { OrderBookWidget } from './orders/OrderBookWidget';

type OrderType = 'MARKET' | 'CONDITIONAL';
type TimeInForce = 'DAY' | 'GTC' | 'GTD' | 'GTT';
type OrderSide = 'BUY' | 'SELL';

export default function Orders() {
  const { t, i18n } = useTranslation('common');
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showStockSelector, setShowStockSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Order form state
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('DAY');
  const [quantity, setQuantity] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [expireDate, setExpireDate] = useState<string>('');


  useEffect(() => {
    const init = async () => {
      await fetchAccountInfo();
      await fetchStocks();
      await fetchOrders();
    };
    init();
  }, []);

  const fetchAccountInfo = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const result = await getUserAccountInformation(token);
      if (result.success && result.data?.MCSDAccount?.accountId) {
        setAccountId(result.data.MCSDAccount.accountId);
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  const fetchStocks = async () => {
    try {
      // First try to get all companies (which includes all tradeable stocks)
      const companiesResult = await fetchCompanies(1, 5000); // Get all companies
      if (companiesResult.success && companiesResult.data) {
        // Convert companies data to stock format for the dropdown
        const allTradingStocks = companiesResult.data
          .filter(company => company.symbol && !company.symbol.includes('-BD')) // Exclude bonds
          .map(company => ({
            pkId: company.id,
            id: company.id,
            Symbol: company.symbol.replace('-O-0000', ''), // Clean symbol
            mnName: company.mnTitle,
            enName: company.enTitle,
            Volume: 0,
            Turnover: 0,
            MDSubOrderBookType: '',
            LastTradedPrice: 0,
            PreviousClose: 0,
            ClosingPrice: 0,
            OpeningPrice: 0,
            Changes: 0,
            Changep: 0,
            VWAP: 0,
            MDEntryTime: '',
            trades: 0,
            HighPrice: 0,
            LowPrice: 0,
            MarketSegmentID: company.MarketSegmentID,
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
        
        setStocks(allTradingStocks);
        if (allTradingStocks.length > 0) {
          setSelectedStock(allTradingStocks[0]);
        }
      } else {
        // Fallback to the current method (only today's active stocks)
        const result = await fetchAllStocksWithCompanyInfo();
        if (result.success && result.data) {
          setStocks(result.data);
          if (result.data.length > 0) {
            setSelectedStock(result.data[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching stocks:', error);
      // Fallback to the current method
      try {
        const result = await fetchAllStocksWithCompanyInfo();
        if (result.success && result.data) {
          setStocks(result.data);
          if (result.data.length > 0) {
            setSelectedStock(result.data[0]);
          }
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    setLoading(true);
    try {
      const result = await fetchOrderHistory(token);
      if (result.success) {
        setOrders(result.data);
      } else {
        toast.error(t('orders.fetchError'));
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('orders.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem('authToken');
    if (!token || !accountId || !selectedStock) {
      toast.error(t('orders.missingInfo'));
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error(t('orders.invalidQuantity'));
      return;
    }

    if (orderType === 'CONDITIONAL' && (!price || parseFloat(price) <= 0)) {
      toast.error(t('orders.invalidPrice'));
      return;
    }

    if (timeInForce === 'GTD' && !expireDate) {
      toast.error(t('orders.expireDateRequired'));
      return;
    }

    setPlacing(true);
    try {
      const orderData: PlaceOrderRequest = {
        accountId,
        symbol: selectedStock.Symbol,
        orderType,
        timeForce: timeInForce,
        channel: 'APP',
        side: orderSide,
        price: orderType === 'MARKET' ? selectedStock.PreviousClose : parseFloat(price),
        quantity: parseFloat(quantity),
        expireDate: timeInForce === 'GTD' ? expireDate : undefined,
        exchangeId: 10
      };

      const result = await placeOrder(orderData, token);
      if (result.success) {
        toast.success(t('orders.placeSuccess'));
        // Reset form
        setQuantity('');
        setPrice('');
        setExpireDate('');
        // Refresh orders
        await fetchOrders();
      } else {
        toast.error(result.message || t('orders.placeFailed'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(t('orders.placeFailed'));
    } finally {
      setPlacing(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const result = await cancelOrder(orderId, token);
      if (result.success) {
        toast.success(t('orders.cancelSuccess'));
        await fetchOrders();
      } else {
        toast.error(result.message || t('orders.cancelFailed'));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(t('orders.cancelFailed'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      case 'expired':
        return 'text-gray-600 bg-gray-50';
      case 'wrong':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(i18n.language === 'mn' ? 'mn-MN' : 'en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(i18n.language === 'mn' ? 'mn-MN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredStocks = stocks.filter(stock => {
    const query = searchQuery.toLowerCase();
    return stock.Symbol.toLowerCase().includes(query) || 
           stock.mnName?.toLowerCase().includes(query) ||
           stock.enName?.toLowerCase().includes(query);
  });

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const prc = orderType === 'MARKET' 
      ? (selectedStock?.PreviousClose || 0)
      : (parseFloat(price) || 0);
    return qty * prc;
  };

  const calculateFee = () => {
    const total = calculateTotal();
    return total * 0.01; // 1% fee
  };

  // Handle price selection from orderbook
  const handlePriceFromOrderBook = (orderPrice: number, side: 'BUY' | 'SELL') => {
    if (orderType === 'CONDITIONAL') {
      setPrice(orderPrice.toString());
    }
    // Optionally set the order side based on the orderbook selection
    // setOrderSide(side);
  };

  // Fetch current stock data when a stock is selected
  const handleStockSelection = async (stock: StockData) => {
    setSelectedStock(stock);
    
    // Try to get current pricing data for the selected stock
    try {
      const result = await fetchSpecificStockData(stock.Symbol);
      if (result.success && result.data) {
        // Update the selected stock with current data
        setSelectedStock({
          ...stock,
          ...result.data,
          mnName: stock.mnName, // Preserve company name
          enName: stock.enName
        });
      }
    } catch (error) {
      console.error('Error fetching current stock data:', error);
      // Continue with the basic stock info if current data fetch fails
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Account Balance Header */}
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">BDSec</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Securities</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">Дансны үлдэгдэл:</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">1884.41₮</div>
          </div>
        </div>
      </div>

      {/* Stock Selection Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Stock Selector */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-600">
          <button
            onClick={() => setShowStockSelector(true)}
            className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {selectedStock ? selectedStock.Symbol.charAt(0) : 'S'}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedStock ? selectedStock.Symbol : 'Хувьцаа сонгох'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedStock 
                    ? (i18n.language === 'mn' ? selectedStock.mnName : selectedStock.enName)
                    : 'Арилжаа хийх хувьцааг сонгоно уу'
                  }
                </div>
              </div>
            </div>
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Stock Info Display */}
        {selectedStock && (
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStock.Symbol}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {i18n.language === 'mn' ? selectedStock.mnName : selectedStock.enName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(selectedStock.PreviousClose || 0)}₮
                </div>
                <div className={`text-sm ${(selectedStock.Changep || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(selectedStock.Changep || 0) >= 0 ? '+' : ''}{(selectedStock.Changep || 0).toFixed(2)} ({((selectedStock.Changep || 0)).toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Order Book */}
        <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('orders.orderBook')} {selectedStock ? `- ${selectedStock.Symbol}` : ''}
            </h3>
          </div>
          
          <OrderBookWidget 
            selectedStock={selectedStock}
            onPriceSelect={handlePriceFromOrderBook}
            className="border-0 bg-transparent p-0"
          />
        </div>

        {/* Order Placement Form */}
        <div className="bg-white dark:bg-gray-800 p-4">
          {/* Buy/Sell Toggle - Compact Design */}
          <div className="grid grid-cols-2 gap-1 mb-4">
            <button
              onClick={() => setOrderSide('BUY')}
              className={`py-3 rounded font-medium text-sm transition-all ${
                orderSide === 'BUY'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('orders.buy', 'Авах')}
            </button>
            <button
              onClick={() => setOrderSide('SELL')}
              className={`py-3 rounded font-medium text-sm transition-all ${
                orderSide === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t('orders.sell', 'Зарах')}
            </button>
          </div>

          {/* Type Selector */}
          <div className="mb-4">
            <select
              value={orderType}
              onChange={(e) => {
                setOrderType(e.target.value as OrderType);
                if (e.target.value === 'MARKET') setTimeInForce('DAY');
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
            >
              <option value="MARKET">{t('orders.market', 'Зах зээлийн')}</option>
              <option value="CONDITIONAL">{t('orders.conditional', 'Шинжээт')}</option>
            </select>
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {orderType === 'CONDITIONAL' && (
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={t('exchange.price')}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
              />
            )}
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t('exchange.quantity', 'Хувцаа')}
              className={`px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm ${
                orderType === 'MARKET' ? 'col-span-2' : ''
              }`}
            />
          </div>

          {/* Time in Force for Conditional */}
          {orderType === 'CONDITIONAL' && (
            <div className="mb-4">
              <select
                value={timeInForce}
                onChange={(e) => setTimeInForce(e.target.value as TimeInForce)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
              >
                <option value="DAY">{t('exchange.day', 'Өдөр')}</option>
                <option value="GTC">{t('exchange.gtc', 'Цуцлах хүртэл')}</option>
                <option value="GTD">{t('exchange.gtd', 'Заасан өдөр хүртэл')}</option>
              </select>
            </div>
          )}

          {/* Total */}
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('exchange.total', 'НИЙТ ДҮН')}:</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('exchange.subtotal', 'ДҮН')} + {t('exchange.tradingFee', 'Шимтгэл')}: (-1.00%)</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatNumber(calculateTotal() + calculateFee())}₮
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !accountId || !selectedStock || !quantity || (orderType === 'CONDITIONAL' && !price)}
            className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
              placing || !accountId || !selectedStock || !quantity || (orderType === 'CONDITIONAL' && !price)
                ? 'bg-gray-400 cursor-not-allowed'
                : orderSide === 'BUY'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {placing ? t('exchange.placing', 'Захиалж байна...') : orderSide === 'BUY' ? t('orders.buy', 'Авах') : t('orders.sell', 'Зарах')}
          </button>
        </div>

        {/* Order History */}
        <div className="bg-white dark:bg-gray-800 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('orders.orderHistory', 'Захиалгын түүх')}
            <span className="ml-2 text-sm bg-red-100 text-red-600 px-2 py-1 rounded">{t('news.newest', 'Шинэ')}</span>
          </h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('orders.noOrders', 'Захиалга байхгүй байна')}
            </div>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="grid grid-cols-6 gap-2 text-sm py-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="font-medium text-gray-900 dark:text-white">{order.symbol}</div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {new Date(order.createdDate).toLocaleDateString()}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{formatNumber(order.quantity)}</div>
                  <div className="text-gray-600 dark:text-gray-400">{formatNumber(order.price)}</div>
                  <div className={`text-xs px-2 py-1 rounded ${getStatusColor(order.statusname)}`}>
                    {order.statusname}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{formatNumber(order.total)}₮</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stock Selector Modal */}
      {showStockSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg max-h-[80vh] rounded-2xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Хувьцаа сонгох
                </h3>
                <button
                  onClick={() => {
                    setShowStockSelector(false);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Хувьцааны код эсвэл нэр хайх..."
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Stock List */}
            <div className="overflow-y-auto max-h-[60vh]">
              {filteredStocks.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {t('common.noResultsFound', 'Хайлтын үр дүн олдсонгүй')}
                </div>
              ) : (
                <div className="p-2">
                  {filteredStocks.map((stock, index) => (
                    <button
                      key={`${stock.Symbol}-${stock.id || index}`}
                      onClick={() => {
                        handleStockSelection(stock);
                        setShowStockSelector(false);
                        setSearchQuery('');
                      }}
                      className="w-full p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
                          {stock.Symbol.charAt(0)}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {stock.Symbol}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {i18n.language === 'mn' ? stock.mnName || stock.enName : stock.enName || stock.mnName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {stock.PreviousClose > 0 && (
                          <>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatNumber(stock.PreviousClose)} ₮
                            </div>
                            <div className={`text-sm ${(stock.Changep || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(stock.Changep || 0) >= 0 ? '+' : ''}{(stock.Changep || 0).toFixed(2)}%
                            </div>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {filteredStocks.length} хувьцааны мэдээлэл
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}