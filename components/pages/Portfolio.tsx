'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet, PieChart, History, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Cookies from 'js-cookie';
import { BASE_URL } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { GlowCard } from '@/components/ui/GlowCard';
import { PortfolioCharts } from '@/components/charts/PortfolioCharts';

interface AssetBalance {
  exchangeId: number;
  symbol: string;
  quantity: number;
  stockAccountId: number;
  name: string;
}

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
}

interface TransactionHistory {
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
  price: number;
  assetId: number;
  name: string;
  exchange: string;
  currency: string;
  creditAmt: number;
  id: number;
  firstBalance: number;
  debitAmt: number;
}

interface YieldAnalysis {
  symbol: string;
  amount: number;
  totalNow: number;
  withdrawWaitingAmount: number;
  holdQty: number;
  fee: number;
  depositWaitingAmount: number;
  type: string;
  profitPer: number;
  offerTypeCode: string | null;
  exchangeId: number;
  accountId: number;
  total: number;
  rate: number;
  firstTotal: number;
  exchangeName: string;
  closePrice: number;
  profit: number;
}

interface PortfolioData {
  assetBalances: AssetBalance[];
  nominalBalance: NominalBalance;
  transactionHistory: TransactionHistory[];
  yieldAnalysis: YieldAnalysis[];
}

// Custom hook for intersection observer
const useInView = (threshold = 0.1) => {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect() // Only trigger once
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

export default function Portfolio() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add intersection observer for animations
  const { ref: portfolioRef, inView } = useInView(0.1);



  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all portfolio data in parallel
      const [assetResponse, nominalResponse, transactionResponse, yieldResponse] = await Promise.all([
        fetch(`${BASE_URL}/istockApp/balance-asset`, { method: 'GET', headers }),
        fetch(`${BASE_URL}/istockApp/nominal-balance`, { method: 'GET', headers }),
        fetch(`${BASE_URL}/istockApp/security-transaction-history`, { method: 'GET', headers }),
        fetch(`${BASE_URL}/istockApp/yield-analysis`, { method: 'GET', headers })
      ]);

      // Check if all responses are ok
      if (!assetResponse.ok || !nominalResponse.ok || !transactionResponse.ok || !yieldResponse.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      // Parse all responses
      const [assetResult, nominalResult, transactionResult, yieldResult] = await Promise.all([
        assetResponse.json(),
        nominalResponse.json(),
        transactionResponse.json(),
        yieldResponse.json()
      ]);

      // Check if all API calls were successful
      if (assetResult.success && nominalResult.success && transactionResult.success && yieldResult.success) {
        setPortfolioData({
          assetBalances: assetResult.data || [],
          nominalBalance: nominalResult.data,
          transactionHistory: transactionResult.data || [],
          yieldAnalysis: yieldResult.data || []
        });
        setError(null);
      } else {
        throw new Error('One or more API calls returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPortfolioData(true);
  };

  const formatCurrency = (amount: number, currency = 'MNT') => {
    return new Intl.NumberFormat('mn-MN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Early returns for loading, error, and no data states
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec dark:border-indigo-500"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
          <button 
            onClick={() => fetchPortfolioData()}
            className="px-6 py-3 bg-bdsec dark:bg-indigo-600 text-white rounded-xl hover:bg-bdsec/90 dark:hover:bg-indigo-700 transition-colors font-medium"
          >
            Дахин оролдох
          </button>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">No portfolio data available</p>
      </div>
    );
  }

  // Calculate portfolio metrics
  const nominalBalance = portfolioData.nominalBalance.balance;
  const totalAssetValue = portfolioData.yieldAnalysis.reduce((sum, asset) => sum + asset.totalNow, 0);
  const totalInvested = portfolioData.yieldAnalysis.reduce((sum, asset) => sum + asset.total, 0);
  const totalProfit = portfolioData.yieldAnalysis.reduce((sum, asset) => sum + asset.profit, 0);
  const profitLossPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-bdsec dark:bg-indigo-600 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Portfolio</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your investment overview</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {showBalance ? (
              <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div ref={portfolioRef} className="p-4 space-y-6">
        {/* Balance Overview Cards */}
        <div 
          className={`grid grid-cols-2 gap-4 transition-all duration-1000 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Total Investment */}
          <GlowCard 
            glowColor="blue" 
            className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 p-4 group"
          >
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-bdsec dark:text-indigo-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Нийт оруулсан</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {showBalance ? formatCurrency(totalInvested) : '***,***'} ₮
            </p>
          </GlowCard>

          {/* Current Value */}
          <GlowCard 
            glowColor="green" 
            className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 p-4 group"
          >
            <div className="flex items-center space-x-2 mb-2">
              <PieChart className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Одоогийн үнэлгээ</span>
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {showBalance ? formatCurrency(totalAssetValue) : '***,***'} ₮
            </p>
          </GlowCard>
        </div>

        {/* Profit/Loss Card */}
        <div 
          className={`transition-all duration-1000 delay-200 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <GlowCard 
            glowColor={totalProfit >= 0 ? "green" : "red"} 
            className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 p-4 group"
          >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {totalProfit >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className="text-sm text-gray-600 dark:text-gray-400">Ашиг/алдагдал</span>
            </div>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              totalProfit >= 0 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {showBalance ? formatPercentage(profitLossPercent) : '***%'}
            </div>
          </div>
          <p className={`text-xl font-bold mt-2 ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {showBalance ? (totalProfit >= 0 ? '+' : '') + formatCurrency(Math.abs(totalProfit)) : '***,***'} ₮
          </p>
        </GlowCard>
        </div>

        {/* Cash Balance */}
        <div 
          className={`transition-all duration-1000 delay-300 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <GlowCard 
            glowColor="blue" 
            className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 p-4 group"
          >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wallet className="h-5 w-5 text-bdsec dark:text-indigo-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Мөнгөн данс</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{portfolioData.nominalBalance.currencyFullName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {showBalance ? formatCurrency(nominalBalance) : '***,***'} ₮
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Данс: {portfolioData.nominalBalance.accountId}</p>
            </div>
          </div>
        </GlowCard>
        </div>

        {/* Portfolio Charts */}
        <div 
          className={`transition-all duration-1000 delay-400 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <PortfolioCharts
            assetBalances={portfolioData.assetBalances}
            yieldAnalysis={portfolioData.yieldAnalysis}
            showBalance={showBalance}
          />
        </div>

        {/* Stock Holdings */}
        <div 
          className={`border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 overflow-hidden transition-all duration-1000 delay-500 ${
            inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="h-6 w-1 bg-bdsec dark:bg-indigo-500 rounded-md"></span>
                Үнэт цаасны үлдэгдэл
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {portfolioData.assetBalances.length} assets
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {portfolioData.assetBalances.map((asset, index) => {
                const yieldData = portfolioData.yieldAnalysis.find(y => y.symbol === asset.symbol);
                const profit = yieldData?.profit ?? 0;
                const glowColor = profit > 0 ? 'green' : profit < 0 ? 'red' : 'neutral';
                
                return (
                  <GlowCard 
                    key={index} 
                    glowColor={glowColor}
                    intensity="low"
                    className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 group hover:scale-[1.01] transition-transform duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-bdsec dark:bg-indigo-600 flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{asset.symbol}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {showBalance ? asset.quantity.toLocaleString() : '***'} ширхэг
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {yieldData && showBalance ? formatCurrency(yieldData.totalNow) : '***,***'} ₮
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Хаалтын ханш</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {yieldData && showBalance ? formatCurrency(yieldData.closePrice) : '***'} ₮
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-1">Ашиг/алдагдал</p>
                        {yieldData ? (
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {showBalance ? (profit >= 0 ? '+' : '') + formatCurrency(Math.abs(profit)) : '***'} ₮
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              profit >= 0 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {showBalance ? ((yieldData.profitPer ?? 0) >= 0 ? '+' : '') + (yieldData.profitPer ?? 0).toFixed(2) : '***'}%
                            </span>
                          </div>
                        ) : (
                          <p className="text-gray-400">-</p>
                        )}
                      </div>
                    </div>
                  </GlowCard>
                );
              })}

              {portfolioData.assetBalances.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Үнэт цаасны үлдэгдэл байхгүй байна</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Хөрөнгө оруулалт хийж эхлээрэй</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}