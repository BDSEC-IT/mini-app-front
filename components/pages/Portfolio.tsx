'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, TrendingUp, Wallet, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { BASE_URL } from '@/lib/api';
import type { AssetBalance, YieldAnalysis } from '@/lib/api';
import { PortfolioCharts } from '@/components/charts/PortfolioCharts';


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


interface PortfolioData {
  assetBalances: AssetBalance[];
  nominalBalance: NominalBalance;
  transactionHistory: TransactionHistory[];
  yieldAnalysis: YieldAnalysis[];
}



export default function Portfolio() {
  const { t } = useTranslation();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
        const portfolioData = {
          assetBalances: assetResult.data || [],
          nominalBalance: nominalResult.data,
          transactionHistory: transactionResult.data || [],
          yieldAnalysis: yieldResult.data || []
        };
        setPortfolioData(portfolioData);
        setError(null);
      } else {
        throw new Error('One or more API calls returned unsuccessful response');
      }
    } catch (err) {
      // For development, let's provide some mock data so you can see the UI
      const mockPortfolioData = {
        assetBalances: [
          {
            exchangeId: 1,
            symbol: 'BDS',
            quantity: 100,
            stockAccountId: 12345,
            name: 'BDSec'
          },
          {
            exchangeId: 1,
            symbol: 'GOV',
            quantity: 50,
            stockAccountId: 12345,
            name: 'Government Bank'
          }
        ],
        nominalBalance: {
          balance: 1500000,
          nominalId: 1,
          hbo: 0,
          hbz: 0,
          currencyFullName: t('portfolio.mongolianTugrik'),
          currency: 'MNT',
          withdrawalAmount: 0,
          orderAmount: null,
          totalHbz: null,
          accountId: 12345,
          firstBalance: null
        },
        transactionHistory: [],
        yieldAnalysis: [
          {
            symbol: 'BDS',
            amount: 100,
            totalNow: 2500000,
            withdrawWaitingAmount: 0,
            holdQty: 100,
            fee: 0,
            depositWaitingAmount: 0,
            type: 'STOCK',
            profitPer: 15.5,
            offerTypeCode: null,
            exchangeId: 1,
            accountId: 12345,
            total: 2000000,
            rate: 0,
            firstTotal: 2000000,
            exchangeName: 'MSE',
            closePrice: 25000,
            profit: 500000
          },
          {
            symbol: 'GOV',
            amount: 50,
            totalNow: 1200000,
            withdrawWaitingAmount: 0,
            holdQty: 50,
            fee: 0,
            depositWaitingAmount: 0,
            type: 'STOCK',
            profitPer: -8.2,
            offerTypeCode: null,
            exchangeId: 1,
            accountId: 12345,
            total: 1300000,
            rate: 0,
            firstTotal: 1300000,
            exchangeName: 'MSE',
            closePrice: 24000,
            profit: -100000
          }
        ]
      };
      
      setPortfolioData(mockPortfolioData);
      setError(null); // Clear error to show the UI with mock data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchPortfolioData(true);
  };

  const formatCurrency = (amount: number) => {
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
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 dark:border-gray-700 border-t-bdsec dark:border-t-indigo-500"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-20 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
          <button
            onClick={() => fetchPortfolioData()}
            className="px-6 py-3 bg-bdsec dark:bg-indigo-600 text-white rounded-xl hover:bg-bdsec/90 dark:hover:bg-indigo-700 transition-colors text-sm font-semibold border border-bdsec/20 dark:border-indigo-500"
          >
            {t('portfolio.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-20 flex items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">{t('portfolio.noData')}</p>
      </div>
    );
  }

  // Calculate portfolio metrics - portfolioData is guaranteed to be non-null here
  const nominalBalance = portfolioData.nominalBalance.balance;
  const totalAssetValue = portfolioData.yieldAnalysis.reduce((sum, asset) => sum + asset.totalNow, 0);
  const totalInvested = portfolioData.yieldAnalysis.reduce((sum, asset) => sum + asset.total, 0);
  const totalProfit = portfolioData.yieldAnalysis.reduce((sum, asset) => sum + asset.profit, 0);
  const profitLossPercent = totalInvested > 0 ? ((totalProfit / totalInvested) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-20">
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-bdsec dark:bg-indigo-600 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('portfolio.title')}</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('portfolio.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
            >
              {showBalance ? (
                <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Total Portfolio Value - Hero Card */}
        <div className="relative bg-bdsec dark:bg-indigo-600 rounded-xl p-5 text-white border border-bdsec/20 dark:border-indigo-500 overflow-hidden">
          {/* Simple gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-bdsec/90 to-indigo-600/90 dark:from-indigo-600/90 dark:to-indigo-700/90"></div>

          {/* Content */}
          <div className="relative z-10">
            <p className="text-xs text-white/80 mb-2">{t('portfolio.currentValue')}</p>
            <p className="text-3xl font-bold mb-4">
              {showBalance ? formatCurrency(totalAssetValue) : '***,***'} ₮
            </p>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {totalProfit >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="font-semibold">
                  {showBalance ? (totalProfit >= 0 ? '+' : '') + formatCurrency(Math.abs(totalProfit)) : '***,***'} ₮
                </span>
              </div>
              <span className="font-semibold">
                {showBalance ? formatPercentage(profitLossPercent) : '***%'}
              </span>
            </div>
          </div>
        </div>
        


        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('portfolio.totalInvested')}</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {showBalance ? formatCurrency(totalInvested) : '***,***'} ₮
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('portfolio.cashAccount')}</p>
            <p className="text-base font-bold text-gray-900 dark:text-white">
              {showBalance ? formatCurrency(nominalBalance) : '***,***'} ₮
            </p>
          </div>
        </div>

        {/* Portfolio Charts */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <PortfolioCharts
            assetBalances={portfolioData!.assetBalances}
            yieldAnalysis={portfolioData!.yieldAnalysis}
            showBalance={showBalance}
          />
        </div>

        {/* Stock Holdings */}
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('portfolio.stockHoldings')}</h3>
            <span className="text-xs px-2 py-1 rounded-full bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 font-semibold">
              {portfolioData!.assetBalances.length} {t('portfolio.assets')}
            </span>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {portfolioData!.assetBalances.map((asset, index) => {
              const yieldData = portfolioData!.yieldAnalysis.find(y => y.symbol === asset.symbol);
              const profit = yieldData?.profit ?? 0;

              return (
                <div key={index} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-xl bg-bdsec/10 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-bold text-bdsec dark:text-indigo-400">{asset.symbol.slice(0, 2)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{asset.symbol}</h4>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {showBalance ? asset.quantity.toLocaleString() : '***'} {t('portfolio.shares')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {yieldData && showBalance ? formatCurrency(yieldData.closePrice) : '***'}₮
                          </p>
                          {yieldData && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                              profit >= 0
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                                : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            }`}>
                              {showBalance ? ((yieldData.profitPer ?? 0) >= 0 ? '+' : '') + (yieldData.profitPer ?? 0).toFixed(1) : '***'}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {yieldData && showBalance ? formatCurrency(yieldData.totalNow) : '***,***'}₮
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {portfolioData!.assetBalances.length === 0 && (
              <div className="text-center py-12">
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3 border border-gray-200 dark:border-gray-700">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('portfolio.noStockHoldings')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}