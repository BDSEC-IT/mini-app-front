"use client";

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Search, ChevronDown, ArrowLeft, Download, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { BASE_URL, fetchIstockNominalBalance, fetchIstockBalanceAsset, fetchIstockSecurityTransactions, fetchIstockCsdTransactions, fetchIstockYieldAnalysis } from '@/lib/api';
import type { AssetBalance as ApiAssetBalance, YieldAnalysis as ApiYieldAnalysis } from '@/lib/api'

interface NominalBalance {
  balance: number;
  nominalId: number;
  hbo: number;
  hbz: number;
  currencyFullName: string;
  currency: string;
  withdrawalAmount: number;
  orderAmount: number | null;
  totalHbz: number | null;
  accountId: number;
  firstBalance: number | null;
  // Optional MCSD balances returned by nominal-balance API
  mcsdBalance?: Array<{
    account: number | null;
    currency: string;
    amount: number;
    code: string;
    withdrawalBalance: number | null;
  }>;
}

// Use shared types from API module
type AssetBalance = ApiAssetBalance

interface SecurityTransaction {
  statementAmount: number;
  symbol: string;
  buySell: string;
  code: string;
  feePercent: number;
  description: string;
  transactionDate: string;
  exchangeId: number;
  lastBalance: number;
  feeAmount: number;
  totalAmount: number;
  accountId: number;
  price?: number;
  assetId?: number;
  name?: string;
  exchange?: string;
  currency?: string;
  creditAmt?: number;
  id?: number;
  firstBalance?: number;
  debitAmt?: number;
}

interface CSDTransaction {
  code: string;
  stockAccountId: number;
  description: string;
  transactionDate: string;
  typeCode: string;
  lastBalance: number;
  totalAmount: number;
  feeAmount: number;
  price: number;
  creditAmt: number;
  firstBalance: number;
  debitAmt: number;
  username: string;
}

type BalanceType = 'securities' | 'nominal' | 'fund';
type PageType = 'balance' | 'transactions' | 'withdrawals';

export default function Balance() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState<PageType>('balance');
  const [balanceType, setBalanceType] = useState<BalanceType>('securities');
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading states for different APIs
  const [loadingNominal, setLoadingNominal] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingSecurityTransactions, setLoadingSecurityTransactions] = useState(true);
  const [loadingCsdTransactions, setLoadingCsdTransactions] = useState(true);
  
  // Data states
  const [nominalBalance, setNominalBalance] = useState<NominalBalance | null>(null);
  const [assetBalances, setAssetBalances] = useState<AssetBalance[]>([]);
  const [yieldAnalysis, setYieldAnalysis] = useState<ApiYieldAnalysis[]>([]);
  const [securityTransactions, setSecurityTransactions] = useState<SecurityTransaction[]>([]);
  const [csdTransactions, setCsdTransactions] = useState<CSDTransaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingYield, setLoadingYield] = useState(true);
  // Transaction filters and date range for the transactions page
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [transactionType, setTransactionType] = useState<'all' | 'security' | 'csd' | 'dividend' | 'primary' | 'secondary'>('all');
  const [dateRangeOption, setDateRangeOption] = useState<'all' | '7' | '30' | 'custom'>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  // If user clicks "Хуулга" on a specific asset, show transactions filtered to that symbol
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string | null>(null);

  useEffect(() => {
    fetchNominalBalance();
    fetchAssetBalances();
    fetchSecurityTransactions();
    fetchCsdTransactions(); // This one is slow
  fetchYieldAnalysis();
  }, []);

  const fetchNominalBalance = async () => {
    try {
      const token = Cookies.get('token')
      const result = await fetchIstockNominalBalance(token || undefined)
      if (result && result.success) {
        setNominalBalance(result.data)
        setError(null)
      } else {
        setError('Nominal balance API returned unsuccessful response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nominal balance')
    } finally {
      setLoadingNominal(false)
    }
  };

  const fetchAssetBalances = async () => {
    try {
      const token = Cookies.get('token')
      const result = await fetchIstockBalanceAsset(token || undefined)
      if (result && result.success) {
        setAssetBalances(result.data || [])
        setError(null)
      } else {
        setError('Asset balance API returned unsuccessful response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asset balances')
    } finally {
      setLoadingAssets(false)
    }
  };

  const fetchSecurityTransactions = async () => {
    try {
      const token = Cookies.get('token')
      const result = await fetchIstockSecurityTransactions(token || undefined)
      if (result && result.success) {
        setSecurityTransactions(result.data || [])
        setError(null)
      } else {
        setError('Security transaction API returned unsuccessful response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security transactions')
    } finally {
      setLoadingSecurityTransactions(false)
    }
  };

  const fetchYieldAnalysis = async () => {
    try {
      const token = Cookies.get('token')
      const result = await fetchIstockYieldAnalysis(token || undefined)
      if (result && result.success) {
        const data: ApiYieldAnalysis[] = result.data || []
        setYieldAnalysis(data)
        setError(null)
      } else {
        setError('Yield analysis API returned unsuccessful response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch yield analysis')
    } finally {
      setLoadingYield(false)
    }
  };

  const fetchCsdTransactions = async () => {
    try {
      const token = Cookies.get('token')
      const result = await fetchIstockCsdTransactions(token || undefined)
      if (result && result.success) {
        setCsdTransactions(result.data || [])
        setError(null)
      } else {
        setError('CSD transaction API returned unsuccessful response')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSD transactions')
    } finally {
      setLoadingCsdTransactions(false)
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Compute securities valuation from yieldAnalysis
  const securitiesValue = yieldAnalysis.reduce((sum, a) => sum + (a.totalNow || 0), 0);

  // Update total balance whenever nominal or securities values change
  useEffect(() => {
    const nominal = nominalBalance?.balance || 0;
    setTotalBalance(nominal + securitiesValue);
  }, [nominalBalance, securitiesValue]);

  const filteredAssets = assetBalances.filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Skeleton components
  const SkeletonCard = () => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-1"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12"></div>
      </div>
    </div>
  );

  const SkeletonTransaction = () => (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
        </div>
        <div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-12 mb-1"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
        </div>
      </div>
    </div>
  );

  // Header showing total balance and eye toggle
  const renderBalanceHeader = () => (
    <div className="bg-bdsec dark:bg-indigo-600 text-white p-4 rounded-t-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">Нийт хөрөнгө</p>
          {loadingNominal ? (
            <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold">
              {showBalance ? formatCurrency(totalBalance) : '***.**'}
            </p>
          )}
        </div>
        <button 
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {showBalance ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );

  const renderTabNavigation = () => (
    <div className="flex justify-between items-center space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="relative">
        <select
          value={balanceType}
          onChange={(e) => setBalanceType(e.target.value as BalanceType)}
          className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bdsec"
        >
          <option value="securities">Үнэт цаас</option>
          <option value="nominal">Номинал</option>
          <option value="fund">ҮЦТХТ</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      </div>
      
      {balanceType === 'securities' ? (
        <div className="ml-auto text-right">
          <div className="text-xs text-white/90">ҮНЭТ ЦААСНЫ ҮНЭЛГЭЭ</div>
          <div className="text-lg font-bold">{showBalance ? formatCurrency(securitiesValue) : '***,***.**'}</div>
        </div>
      ) : (
        <div className='flex gap-x-4'>
          <button 
            onClick={() => setCurrentPage('withdrawals')}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-bdsec"
          >
            <Download className="w-4 h-4" />
            <span>Орлого</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage('transactions')}
            className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-bdsec"
          >
            <Calendar className="w-4 h-4" />
            <span>Хуулга</span>
          </button>
        </div>
      )}
    </div>
  );

  const renderSecuritiesContent = () => (
    <div className="p-4">
      {/* <div className="mb-4">
        <div className="text-right text-sm text-gray-500 dark:text-gray-400 mb-2">
          ҮНЭТ ЦААСНЫ ҮНЭЛГЭЭ
        </div>
        <div className="text-right text-xl font-bold text-gray-900 dark:text-white">
          {showBalance ? formatCurrency(securitiesValue) : '***.**'}
        </div>
      </div>
       */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Өөрийн үнэт цаас хайх"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bdsec"
        />
      </div>

      <div className="space-y-3">
    {loadingAssets ? (
          // Show skeleton while loading
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          filteredAssets.map((asset, index) => {
            const y = yieldAnalysis.find(z => z.symbol === asset.symbol);
            const assetValue = y ? (y.totalNow || 0) : 0;
            return (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {asset.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Тоо ширхэг</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {showBalance ? asset.quantity : '***'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {showBalance ? `${formatCurrency(assetValue)} ₮` : '***,*** ₮'}
                  </p>
                </div>
              </div>
              
              {/* <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div>ХБО: 0</div>
                <div>ХБЗ: 0</div>
                <div>Идэвхтэй зарах захиалга: 0</div>
                <div>Зээний үлдэгдэл: 873</div>
                <div>Хаалттай тоо хэмжээ: 0.00</div>
              </div> */}
              
              <div className="flex items-center justify-between">
                <button className="bg-bdsec dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-bdsec/90">
                  Арилжаа
                </button>
                <button
                  onClick={() => {
                    setSelectedAssetSymbol(asset.symbol);
                    setTransactionType('security');
                    setCurrentPage('transactions');
                  }}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Хуулга
                </button>
                  
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );

  const renderNominalContent = () => (
    <div className="p-4 space-y-4">
      {loadingNominal ? (
        // Show skeleton while loading
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : nominalBalance ? (
        // Show real nominal balance data
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bdsec dark:bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">₮</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{nominalBalance.currency}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{nominalBalance.currencyFullName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {showBalance ? `${formatCurrency(nominalBalance.balance)} ₮` : '***,*** ₮'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div>ХБО: {nominalBalance.hbo}</div>
            <div>ХБЗ: {nominalBalance.hbz}</div>
            <div>Татах дүн: {nominalBalance.withdrawalAmount}</div>
            <div>Захиалгын дүн: {nominalBalance.orderAmount || 0}</div>
            <div>Данс: {nominalBalance.accountId}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <button className="bg-bdsec dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-bdsec/90">
              Мөнгө хүсэх
            </button>
  <button className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500">
              Хуулга
            </button>
          </div>
        </div>
      ) : (
        // Fallback mock data for display (use zeroed balances instead of hardcoded values)
        [
          { currency: 'MNT', name: 'Бэлэн мөнгө', balance: 0, icon: '₮' },
          { currency: 'USD', name: 'Бэлэн мөнгө', balance: 0, icon: '$' }
        ].map((item, index) => (
        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bdsec dark:bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{item.icon}</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.currency}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {showBalance ? `${formatCurrency(item.balance)} ₮` : '***,*** ₮'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div>ХБО: 0</div>
            <div>ХБЗ: 0</div>
            <div>Идэвхтэй зарах захиалга: 0</div>
            <div>Зээний үлдэгдэл: 873</div>
            <div>Хаалттай тоо хэмжээ: 0.00</div>
          </div>
          
          <div className="flex items-center justify-between">
            <button className="bg-bdsec dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-bdsec/90">
              Мөнгө хүсэх
            </button>
  <button className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500">
              Хуулга
            </button>
          </div>
        </div>
      )))}
    </div>
  );

  const renderFundContent = () => (
    <div className="p-4 space-y-4">
      {
        // Use mcsdBalance from nominalBalance if available, otherwise fallback to zeroed entries
        (nominalBalance?.mcsdBalance?.length ? nominalBalance.mcsdBalance : [
          { account: null, currency: 'MNT', amount: 0, code: '9998', withdrawalBalance: 0 },
          { account: null, currency: 'USD', amount: 0, code: '8889', withdrawalBalance: 0 },
          { account: null, currency: 'DIV', amount: 0, code: '9992', withdrawalBalance: 0 }
        ]).map((item, index) => (
        <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bdsec dark:bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{item.currency === 'MNT' ? '₮' : item.currency === 'USD' ? '$' : '₮'}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{item.currency || item.code}</h3>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 dark:text-white">
                {showBalance ? `${formatCurrency(item.amount || 0)} ${item.currency ? item.currency.toUpperCase() : '₮'}` : '***,*** ₮'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button className="bg-bdsec dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-bdsec/90">
              Мөнгө хүсэх
            </button>
            <button className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500">
              Хуулга
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTransactionsPage = () => (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => {
            setSelectedAssetSymbol(null);
            setCurrentPage('balance');
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Хуулга</h1>
        <div></div>
      </div>
      
      <div className="p-4">
        {selectedAssetSymbol && (
          <div className="mb-4 flex items-center space-x-2">
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-full">Үнэт цаас: <span className="font-semibold ml-2">{selectedAssetSymbol}</span></div>
            <button onClick={() => setSelectedAssetSymbol(null)} className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500">Төгсгөл</button>
          </div>
        )}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm"
            >
              <option value="all">Бүгд</option>
              <option value="security">Үнэт цаасны гүйлгээ</option>
              <option value="csd">ҮЦТХТ-ийн гүйлгээ</option>
              <option value="dividend">Ногдол ашиг</option>
              <option value="primary">Анхдагч арилжаа</option>
              <option value="secondary">Хоёрдогч арилжаа</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={dateRangeOption}
              onChange={(e) => setDateRangeOption(e.target.value as any)}
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm"
            >
              <option value="all">Огноо: Бүгд</option>
              <option value="7">7 хоног</option>
              <option value="30">30 хоног</option>
              <option value="custom">Өөрчлөх</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {dateRangeOption === 'custom' ? (
            <div className="flex items-center space-x-2">
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs" />
              <span>—</span>
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs" />
            </div>
          ) : (
            <span>
              {dateRangeOption === '7' ? 'Сүүлийн 7 хоног' : dateRangeOption === '30' ? 'Сүүлийн 30 хоног' : 'Бүгд'}
            </span>
          )}
        </div>

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setTransactionFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${transactionFilter === 'all' ? 'bg-bdsec text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Бүгд
          </button>
          <button
            onClick={() => setTransactionFilter('income')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${transactionFilter === 'income' ? 'bg-bdsec text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Орлого
          </button>
          <button
            onClick={() => setTransactionFilter('expense')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${transactionFilter === 'expense' ? 'bg-bdsec text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Зарлага
          </button>
        </div>
        
        <div className="space-y-4">
          {transactionType !== 'csd' && (loadingSecurityTransactions ? (
            // Show skeleton while loading security transactions
            <>
              <SkeletonTransaction />
              <SkeletonTransaction />
              <SkeletonTransaction />
            </>
          ) : (
            securityTransactions
              .filter((transaction) => {
                // filter by selected asset symbol if provided
                if (selectedAssetSymbol) {
                  return (transaction.symbol || '').toLowerCase() === selectedAssetSymbol.toLowerCase();
                }
                // filter by income/expense
                if (transactionFilter === 'income') return (transaction.creditAmt || 0) > 0 || transaction.buySell === 'sell';
                if (transactionFilter === 'expense') return (transaction.debitAmt || 0) > 0 || transaction.buySell === 'buy';
                return true;
              })
              .filter((transaction) => {
                // filter by transactionType - best-effort using available fields
                if (transactionType === 'all') return true;
                if (transactionType === 'security') return !!transaction.symbol || !!transaction.assetId;
                if (transactionType === 'dividend') return /dividend|nogdol|ногдол/i.test(transaction.description || '');
                if (transactionType === 'primary') return /primary|анхдагч/i.test(transaction.description || '');
                if (transactionType === 'secondary') return /secondary|хоёрдогч/i.test(transaction.description || '');
                return true;
              })
              .filter((transaction) => {
                // filter by date range
                if (dateRangeOption === 'all') return true;
                const txDate = new Date(transaction.transactionDate);
                const now = new Date();
                if (dateRangeOption === '7') {
                  const past = new Date(now);
                  past.setDate(now.getDate() - 7);
                  return txDate >= past;
                }
                if (dateRangeOption === '30') {
                  const past = new Date(now);
                  past.setDate(now.getDate() - 30);
                  return txDate >= past;
                }
                if (dateRangeOption === 'custom' && customStart && customEnd) {
                  const start = new Date(customStart);
                  const end = new Date(customEnd);
                  return txDate >= start && txDate <= end;
                }
                return true;
              })
              .map((transaction, index) => {
              const isIncome = transaction.buySell === 'sell' || (transaction.creditAmt || 0) > 0;
              const amount = transaction.totalAmount || transaction.statementAmount || 0;
              return (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <span className={`text-xs font-bold ${
                        isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isIncome ? '�' : '�'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{transaction.transactionDate}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">{isIncome ? 'Орлого' : 'Зарлага'}</p>
                    <p className={`font-medium ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {formatCurrency(amount)}₮
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Шимтгэл</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(transaction.feeAmount)}₮
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Нийт</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(amount)}₮
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Гүйлгээний утга</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {transaction.description}
                    </p>
                  </div>
                </div>
              </div>
            )})
          ))}
          
          {/* CSD Transactions for ҮЦТХТ - Show when filter 'csd' selected or on fund tab */}
          {(transactionType === 'csd' || balanceType === 'fund') && (
            loadingCsdTransactions ? (
              <>
                <SkeletonTransaction />
                <SkeletonTransaction />
              </>
            ) : (
              csdTransactions
                .filter((transaction) => {
                  // best-effort: if selectedAssetSymbol provided, try match by code or description
                  if (selectedAssetSymbol) {
                    const sym = selectedAssetSymbol.toLowerCase();
                    if (transaction.code && transaction.code.toLowerCase().includes(sym)) return true;
                    if (transaction.description && transaction.description.toLowerCase().includes(sym)) return true;
                    return false;
                  }
                  if (transactionFilter === 'income') return (transaction.creditAmt || 0) > 0;
                  if (transactionFilter === 'expense') return (transaction.debitAmt || 0) > 0;
                  return true;
                })
                .filter((transaction) => {
                  if (dateRangeOption === 'all') return true;
                  const txDate = new Date(transaction.transactionDate);
                  const now = new Date();
                  if (dateRangeOption === '7') {
                    const past = new Date(now);
                    past.setDate(now.getDate() - 7);
                    return txDate >= past;
                  }
                  if (dateRangeOption === '30') {
                    const past = new Date(now);
                    past.setDate(now.getDate() - 30);
                    return txDate >= past;
                  }
                  if (dateRangeOption === 'custom' && customStart && customEnd) {
                    const start = new Date(customStart);
                    const end = new Date(customEnd);
                    return txDate >= start && txDate <= end;
                  }
                  return true;
                })
                .map((transaction, index) => {
                const isIncome = (transaction.creditAmt || 0) > 0;
                return (
                <div key={`csd-${index}`} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                        <span className={`text-xs font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isIncome ? '💰' : '🛒'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(transaction.transactionDate).toLocaleDateString('mn-MN')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">{isIncome ? 'Орлого' : 'Зарлага'}</p>
                      <p className={`font-medium ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(isIncome ? (transaction.creditAmt || 0) : (transaction.debitAmt || 0))}₮
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Үлдэгдэл</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(transaction.lastBalance)}₮
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Хэрэглэгч</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {transaction.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Тайлбар</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {transaction.description}
                      </p>
                    </div>
                  </div>
                </div>
              )})
            )
          )}
        </div>
      </div>
    </div>
  );

  const renderWithdrawalsPage = () => (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setCurrentPage('balance')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Зарлага</h1>
        <div></div>
      </div>
      
      <div className="p-4">
        <div className="bg-bdsec dark:bg-indigo-600 text-white p-4 rounded-lg mb-6">
          <p className="text-sm opacity-90 mb-1">Номинал дансны үлдэгдэл</p>
          <p className="text-xl font-bold">
            {showBalance ? `${formatCurrency(nominalBalance?.balance || 0)} ${nominalBalance?.currency || 'MNT'}` : '***.**'}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Банкны данс</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 text-gray-900 dark:text-white">Мөнгөн дүн</div>
            <div className="p-4 text-gray-900 dark:text-white">Мөнгөн дүн (үсгээр)</div>
            <div className="p-4 text-gray-900 dark:text-white">Гүйлгээний утга (Заавал биш)</div>
          </div>
          
          <button className="w-full bg-bdsec dark:bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-bdsec/90">
            Мөнгөн дүн
          </button>
        </div>
      </div>
    </div>
  );

  // Only show main loading if all critical APIs are loading
  if (loadingNominal && loadingAssets && loadingSecurityTransactions) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec dark:border-indigo-500"></div>
      </div>
    );
  }

  if (currentPage === 'transactions') {
    return renderTransactionsPage();
  }

  if (currentPage === 'withdrawals') {
    return renderWithdrawalsPage();
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
      {renderBalanceHeader()}
      {renderTabNavigation()}
      
      {balanceType === 'securities' && renderSecuritiesContent()}
      {balanceType === 'nominal' && renderNominalContent()}
      {balanceType === 'fund' && renderFundContent()}
    </div>
  );
}