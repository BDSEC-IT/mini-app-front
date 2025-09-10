'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  fetchTodayCompletedOrders,
  type StockData,
  type SecondaryOrderData,
  type EnhancedOrderBookData,
  type CompletedOrderEntry
} from '@/lib/api';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

type OrderSide = 'BUY' | 'SELL';

export default function Exchange() {
  const { t, i18n } = useTranslation('common');
  
  // Core state
  const [accountBalance, setAccountBalance] = useState<number | null>(null);
  const [stockBalance, setStockBalance] = useState(0);
  const [stockHoldings, setStockHoldings] = useState<any[]>([]);
  const [selectedStockHolding, setSelectedStockHolding] = useState<any>(null);
  const [orders, setOrders] = useState<SecondaryOrderData[]>([]);
  const [orderBook, setOrderBook] = useState<EnhancedOrderBookData | null>(null);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrderEntry[]>([]);
  const [placing, setPlacing] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [showStockSelector, setShowStockSelector] = useState(false);
  const [showPriceSteps, setShowPriceSteps] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState('Зах зээлийн');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  // Initialize data
  useEffect(() => {
    const init = async () => {
      console.log('Exchange: Initializing data...');
      await Promise.all([
        fetchAccountInfo(),
        fetchStockHoldings(),
        fetchStocks(),
        fetchOrdersData()
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
        
        // Try to find and select the first available stock
        const defaultStock = tradingStocks.find(stock => 
          ['KHAN', 'APU', 'MSM', 'TDB', 'SBN'].includes(stock.Symbol)
        ) || tradingStocks[0];
        
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

  const fetchOrdersData = async () => {
    const token = Cookies.get('token');
    if (!token) return;
    try {
      const result = await fetchSecondaryOrders(token);
      if (result.success && result.data) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchOrderBookData = async (symbol: string) => {
    const token = Cookies.get('token');
    try {
      const [orderBookResult, completedResult] = await Promise.all([
        fetchEnhancedOrderBook(`${symbol}-O-0000`, token || undefined),
        fetchTodayCompletedOrders(symbol, token || undefined)
      ]);

      if (orderBookResult.success) {
        setOrderBook(orderBookResult.data);
      }
      if (completedResult.success) {
        setCompletedOrders(completedResult.data.assetTradeList.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  const validateOrder = () => {
    if (!selectedStock || !quantity) return 'Мэдээлэл дутуу байна';
    
    const qty = parseFloat(quantity);
    if (qty <= 0) return 'Тоо ширхэг буруу байна';
    
    if (orderSide === 'SELL') {
      const availableShares = selectedStockHolding?.quantity || 0;
      if (qty > availableShares) return `Зөвхөн ${availableShares} ширхэг зарах боломжтой`;
    }
    
    if (orderSide === 'BUY') {
      const orderPrice = orderType === 'Зах зээлийн' 
        ? (selectedStock.PreviousClose || 0)
        : (parseFloat(price) || 0);
      const totalCost = qty * orderPrice;
      if (totalCost > (accountBalance || 0)) return 'Дансны үлдэгдэл хүрэлцэхгүй байна';
    }
    
    if (orderType === 'Нөхцөлт' && !price) return 'Үнэ оруулна уу';
    
    return null;
  };

  const handlePlaceOrder = async () => {
    const token = Cookies.get('token');
    if (!token) {
      toast.error('Нэвтэрч орно уу');
      return;
    }

    const validationError = validateOrder();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        symbol: selectedStock!.Symbol,
        orderType: orderType === 'Зах зээлийн' ? 'MARKET' : 'CONDITIONAL',
        timeForce: 'GTC',
        channel: 'API',
        side: orderSide,
        price: orderType === 'Зах зээлийн' ? (selectedStock!.PreviousClose || selectedStock!.LastTradedPrice || 0) : parseFloat(price),
        quantity: parseFloat(quantity),
        exchangeId: 1
      };

      const result = await placeSecondaryOrder(orderData, token);
      if (result.success) {
        toast.success('Захиалга амжилттай илгээгдлээ');
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
        toast.error(result.message || 'Захиалга амжилтгүй');
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setPlacing(false);
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

  const handleCancelOrder = async (orderId: number) => {
    const token = Cookies.get('token');
    if (!token) return;
    
    try {
      const result = await cancelSecondaryOrder(orderId, token);
      if (result.success) {
        toast.success('Захиалга цуцлагдлаа');
        await fetchOrdersData();
      } else {
        toast.error('Захиалга цуцлах үед алдаа гарлаа');
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
  };

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const orderPrice = orderType === 'Зах зээлийн' 
      ? (selectedStock?.PreviousClose || selectedStock?.LastTradedPrice || 0)
      : (parseFloat(price) || 0);
    return (qty * orderPrice * 1.001); // Include 0.1% fee
  };

  const formatNumber = (num: number) => num.toLocaleString('mn-MN', { minimumFractionDigits: 2 });

  if (showPriceSteps) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="flex items-center p-4 border-b">
          <button onClick={() => setShowPriceSteps(false)} className="mr-3">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium">Үнийн алхам</h1>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm font-medium text-gray-600">
            <div>Нэгжийн үнэ</div>
            <div>Өөрчлөлтийн хэмжээ</div>
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
            <div key={index} className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100">
              <div className="text-gray-800">{range}</div>
              <div className="text-gray-800">{step}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showStockSelector) {
    const filteredStocks = stocks.filter(stock => 
      stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.mnName && stock.mnName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (stock.enName && stock.enName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="flex items-center p-4 border-b">
          <button onClick={() => setShowStockSelector(false)} className="mr-3">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium">Хувьцаа сонгох</h1>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Хувьцаа хайх..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {filteredStocks.length} хувьцаа олдлоо
          </div>
        </div>

        <div className="divide-y max-h-96 overflow-y-auto">
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <button
                key={stock.id}
                onClick={() => {
                  setSelectedStock(stock);
                  setShowStockSelector(false);
                  setSearchTerm(''); // Clear search
                  // Fetch real price data when switching stocks
                  fetchStockPrice(stock.Symbol);
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 ${
                  selectedStock?.Symbol === stock.Symbol ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{stock.Symbol}</div>
                    <div className="text-sm text-gray-500">{stock.mnName || stock.enName}</div>
                  </div>
                  {selectedStock?.Symbol === stock.Symbol && (
                    <div className="text-blue-600 text-xs">✓ Сонгогдсон</div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="text-lg mb-2">🔍</div>
              <div className="text-sm">Хувьцаа олдсонгүй</div>
              <div className="text-xs mt-1">Өөр утга хайж үзээрэй</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
 

      {/* Balance Cards - Show relevant balance based on order side */}
      {selectedStock && (
        <div className="p-4">
          {orderSide === 'BUY' ? (
            // When buying - show cash balance
            <div className="bg-slate-800 rounded-lg p-4 text-white relative">
              <div className="text-sm opacity-80">Дансны үлдэгдэл:</div>
              <div className="text-2xl font-bold mb-2">
                {accountBalance !== null ? `${formatNumber(accountBalance)}₮` : 'Ачаалж байна...'}
              </div>
              <div className="text-xs opacity-60">Авах боломжтой дүн</div>
              <div className="absolute top-3 right-3">
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Цэнэглэх</span>
              </div>
            </div>
          ) : (
            // When selling - show stock holdings for this specific stock
            <div className="bg-slate-800 rounded-lg p-4 text-white relative">
              <div className="text-sm opacity-80">Үнэт цаасны үлдэгдэл:</div>
              <div className="text-2xl font-bold mb-2">
                {selectedStockHolding ? `${selectedStockHolding.quantity || 0} ширхэг` : '0 ширхэг'}
              </div>
              <div className="text-xs opacity-60">
                {selectedStock.Symbol} - Зарах боломжтой
              </div>
              {selectedStockHolding && (
                <div className="text-xs opacity-60 mt-1">
                  Үнийн дүн: {formatNumber((selectedStockHolding.quantity || 0) * (selectedStock.PreviousClose || 0))}₮
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stock Info */}
      {selectedStock && (
        <div className="px-4">
          <button
            onClick={() => setShowStockSelector(true)}
            className="w-full flex justify-between items-center mb-4"
          >
            <div className="text-left">
              <h2 className="text-xl font-bold text-gray-900">{selectedStock.Symbol}</h2>
              <p className="text-sm text-gray-600">{selectedStock.mnName || selectedStock.enName}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {selectedStock.PreviousClose > 0 ? formatNumber(selectedStock.PreviousClose) : '...'}
              </div>
              <div className={`text-sm ${selectedStock.Changes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedStock.PreviousClose > 0 ? `${selectedStock.Changes.toFixed(2)} (${selectedStock.Changep.toFixed(2)}%)` : '...'}
              </div>
            </div>
          </button>

          {/* Chart/OrderBook Toggle */}
          {showChart ? (
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <div className="text-gray-500 text-sm mb-2">График харуулах боломжтой</div>
                <button 
                  onClick={() => setShowChart(false)}
                  className="text-blue-600 text-sm underline"
                >
                  Захиалгын дэвтэр харах
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Order Book Headers */}
              <div className="grid grid-cols-4 gap-1 py-2 text-xs font-medium text-gray-600 text-center border-b">
                <div className="text-green-600">Авах үнэ</div>
                <div>Тоо ширхэг</div>
                <div className="text-red-600">Зарах үнэ</div>
                <div>Тоо ширхэг</div>
              </div>

              {/* Order Book Data */}
              <div className="mb-6">
                {orderBook ? (
                  Array.from({ length: 10 }).map((_, index) => {
                    const bidOrder = orderBook.sell[index];
                    const askOrder = orderBook.buy[index];
                    return (
                      <div key={index} className="grid grid-cols-4 gap-1 py-1 text-xs text-center">
                        <button 
                          onClick={() => {
                            if (bidOrder) {
                              setOrderSide('BUY');
                              setPrice(bidOrder.price.toString());
                              setOrderType('Нөхцөлт');
                            }
                          }}
                          className="text-green-600 font-semibold hover:bg-green-50 py-1 rounded"
                        >
                          {bidOrder ? bidOrder.price.toFixed(2) : ''}
                        </button>
                        <button 
                          onClick={() => {
                            if (bidOrder) {
                              setQuantity(bidOrder.quantity.toString());
                            }
                          }}
                          className="text-gray-800 hover:bg-gray-50 py-1 rounded"
                        >
                          {bidOrder ? bidOrder.quantity : ''}
                        </button>
                        <button 
                          onClick={() => {
                            if (askOrder) {
                              setOrderSide('SELL');
                              setPrice(askOrder.price.toString());
                              setOrderType('Нөхцөлт');
                            }
                          }}
                          className="text-red-600 font-semibold hover:bg-red-50 py-1 rounded"
                        >
                          {askOrder ? askOrder.price.toFixed(2) : ''}
                        </button>
                        <button 
                          onClick={() => {
                            if (askOrder) {
                              setQuantity(askOrder.quantity.toString());
                            }
                          }}
                          className="text-gray-800 hover:bg-gray-50 py-1 rounded"
                        >
                          {askOrder ? askOrder.quantity : ''}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">Мэдээлэл ачааллаж байна</div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setShowPriceSteps(true)}
              className="py-2 px-3 bg-slate-800 text-white rounded text-sm font-medium"
            >
              Үнийн алхам
            </button>
            <button 
              onClick={() => setShowChart(!showChart)}
              className="py-2 px-3 bg-slate-800 text-white rounded text-sm font-medium"
            >
              Зах зээлийн харах
            </button>
          </div>

          {/* Buy/Sell Toggle */}
          <div className="grid grid-cols-2 gap-1 mb-4">
            <button
              onClick={() => setOrderSide('BUY')}
              className={`py-2 rounded text-sm font-medium ${
                orderSide === 'BUY'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Авах
            </button>
            <button
              onClick={() => setOrderSide('SELL')}
              className={`py-2 rounded text-sm font-medium ${
                orderSide === 'SELL'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Зарах
            </button>
          </div>

          {/* Order Form */}
          <div className="space-y-3 mb-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Захиалгын төрөл</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-white"
                >
                  <option value="Зах зээлийн">Зах зээлийн</option>
                  <option value="Нөхцөлт">Нөхцөлт</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Тоо ширхэг</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Тоо ширхэг"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  min="1"
                  max={getMaxQuantity()}
                />
              </div>
            </div>

            {/* Quick quantity buttons */}
            <div className="flex gap-1">
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={percent}
                  onClick={() => {
                    const maxQty = getMaxQuantity();
                    const qty = Math.floor((maxQty * percent) / 100);
                    setQuantity(qty.toString());
                  }}
                  className="flex-1 py-1 px-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  disabled={getMaxQuantity() === 0}
                >
                  {percent}%
                </button>
              ))}
              <button
                onClick={() => setQuantity(getMaxQuantity().toString())}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                disabled={getMaxQuantity() === 0}
              >
                Max
              </button>
            </div>

            {getMaxQuantity() > 0 && (
              <div className="text-xs text-gray-500">
                {orderSide === 'BUY' 
                  ? `Авах боломжтой: ${getMaxQuantity().toLocaleString()} ширхэг`
                  : `Зарах боломжтой: ${getMaxQuantity().toLocaleString()} ширхэг`
                }
              </div>
            )}

            {orderType === 'Нөхцөлт' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Үнэ</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Үнэ"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  step="0.01"
                />
              </div>
            )}

            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs text-gray-600 mb-1">НИЙТ ДҮН:</div>
              <div className="text-xs text-gray-500 mb-1">ДҮН + Шимтгэл: (0.10%)</div>
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(calculateTotal())}₮
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing || !quantity || (orderType === 'Нөхцөлт' && !price)}
            className={`w-full py-3 rounded font-medium text-white mb-6 ${
              placing || !quantity || (orderType === 'Хугацаа' && !price)
                ? 'bg-gray-400'
                : orderSide === 'BUY'
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
          >
            {placing ? 'Захиалж байна...' : orderSide === 'BUY' ? 'Авах' : 'Зарах'}
          </button>
        </div>
      )}

      {/* Order History */}
      <div className="bg-white border-t-4 border-gray-100">
        <div className="grid grid-cols-2 text-center py-3 bg-gray-50 text-sm font-medium">
          <div>Бүх захиалга</div>
          <div>Биелсэн арилжаа</div>
        </div>
        
        <div className="grid grid-cols-2 min-h-[300px]">
          {/* All Orders Column */}
          <div className="border-r border-gray-100 p-2">
            {orders
              .slice(0, 8)
              .map((order) => (
                <div key={order.id} className="mb-3 text-xs border-b border-gray-50 pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{order.symbol}</span>
                    <div className="flex gap-1 items-center">
                      <span className={`px-1 rounded text-[9px] ${
                        order.statusname === 'pending' 
                          ? 'bg-orange-100 text-orange-600' 
                          : order.statusname === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : order.statusname === 'cancelled'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.statusname === 'pending' 
                          ? 'Хүлээгдэж буй' 
                          : order.statusname === 'completed'
                          ? 'Биелсэн'
                          : order.statusname === 'cancelled'
                          ? 'Цуцлагдсан'
                          : order.statusname
                        }
                      </span>
                      {order.statusname === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="text-red-500 hover:text-red-700 text-[9px] underline"
                        >
                          Цуцлах
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-700 text-[10px] mb-0.5 font-medium">
                    {order.buySell === 'BUY' ? '📈 ' + (order.buySellTxt || 'Худалдан авах') : '📉 ' + (order.buySellTxt || 'Худалдан зарах')}
                  </div>
                  <div className="text-gray-600 text-[10px] mb-0.5">
                    Тоо: {order.quantity} ширхэг
                  </div>
                  <div className="text-gray-600 text-[10px] mb-0.5">
                    Үнэ: {order.price.toFixed(2)}₮
                  </div>
                  <div className="text-gray-500 text-[9px]">
                    Нийт: {formatNumber(order.quantity * order.price)}₮
                  </div>
                  <div className="text-gray-400 text-[9px]">
                    {new Date(order.createdDate).toLocaleString('mn-MN', { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </div>
                </div>
              ))}
          </div>

          {/* Completed Orders Column */}
          <div className="p-2">
            {completedOrders.slice(0, 8).map((trade, index) => (
              <div key={index} className="mb-3 text-xs">
                <div className="flex justify-between text-[10px] text-gray-700 font-medium mb-1">
                  <span>Огноо</span>
                  <span>Хэмжээ</span>
                  <span>Хэмжээ</span>
                </div>
                <div className="text-[10px] text-gray-500 mb-0.5">
                  {trade.mdentryTime}
                </div>
                <div className="text-[10px] text-gray-900">
                  {trade.mdentryPx.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-900">
                  {trade.mdentrySize}
                </div>
                <div className="text-[10px] text-gray-500">
                  {Math.floor(Math.random() * 500) + 5}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}