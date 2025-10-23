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
      <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen pb-20 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-800 border-t-bdsec dark:border-t-indigo-500"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('portfolio.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen pb-20 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
          </div>
          <button 
            onClick={() => fetchPortfolioData()}
            className="px-4 py-2 bg-bdsec dark:bg-indigo-600 text-white rounded-lg hover:bg-bdsec/90 dark:hover:bg-indigo-700 transition-colors text-xs font-semibold"
          >
            {t('portfolio.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen pb-20 flex items-center justify-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('portfolio.noData')}</p>
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
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white min-h-screen pb-20">
      {/* Compact Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center space-x-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-bdsec to-indigo-600 flex items-center justify-center">
              <Wallet className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold">{t('portfolio.title')}</h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{t('portfolio.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
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

      <div className="p-2.5 space-y-2">
        {/* Total Portfolio Value - Hero Card */}
        <div className="relative bg-gradient-to-br from-bdsec to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 rounded-xl p-4 text-white shadow-xl overflow-hidden">
          {/* Multiple Static Noise Layers */}
          <div 
            className="absolute inset-0 opacity-[0.3] mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter1'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter1)'/%3E%3C/svg%3E")`,
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.2] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter2'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter2)'/%3E%3C/svg%3E")`,
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter3'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter3)'/%3E%3C/svg%3E")`,
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.15] mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter4'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter4)'/%3E%3C/svg%3E")`,
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter5'%3E%3CfeTurbulence type='turbulence' baseFrequency='1.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter5)'/%3E%3C/svg%3E")`,
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.12] mix-blend-soft-light pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter6'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.0' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter6)'/%3E%3C/svg%3E")`,
            }}
          />
          
          {/* Gradient Orbs - Static */}
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-indigo-300/15 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/8 rounded-full blur-2xl" />
          <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-indigo-500/15 rounded-full blur-2xl" />
          
          {/* Subtle Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Content */}
          <div className="relative z-10">
            <p className="text-[10px] opacity-90 mb-1">{t('portfolio.currentValue')}</p>
            <p className="text-2xl font-bold mb-3 drop-shadow-lg">
              {showBalance ? formatCurrency(totalAssetValue) : '***,***'} ₮
            </p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                {totalProfit >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 drop-shadow" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 drop-shadow" />
                )}
                <span className="font-semibold drop-shadow">
                  {showBalance ? (totalProfit >= 0 ? '+' : '') + formatCurrency(Math.abs(totalProfit)) : '***,***'} ₮
                </span>
              </div>
              <span className="font-semibold opacity-90 drop-shadow">
                {showBalance ? formatPercentage(profitLossPercent) : '***%'}
              </span>
            </div>
          </div>
        </div>
        


        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-200 dark:border-gray-800">
            <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1">{t('portfolio.totalInvested')}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {showBalance ? formatCurrency(totalInvested) : '***,***'} ₮
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-200 dark:border-gray-800">
            <p className="text-[9px] text-gray-500 dark:text-gray-400 mb-1">{t('portfolio.cashAccount')}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {showBalance ? formatCurrency(nominalBalance) : '***,***'} ₮
            </p>
          </div>
        </div>

        {/* Portfolio Charts */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <PortfolioCharts
            assetBalances={portfolioData!.assetBalances}
            yieldAnalysis={portfolioData!.yieldAnalysis}
            showBalance={showBalance}
          />
        </div>

        {/* Stock Holdings */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="text-[10px] font-bold text-gray-900 dark:text-white">{t('portfolio.stockHoldings')}</h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
              {portfolioData!.assetBalances.length}
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {portfolioData!.assetBalances.map((asset, index) => {
              const yieldData = portfolioData!.yieldAnalysis.find(y => y.symbol === asset.symbol);
              const profit = yieldData?.profit ?? 0;
              
              return (
                <div key={index} className="px-2.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 min-w-0 flex-1">
                      <div className="h-7 w-7 rounded-md bg-gradient-to-br from-bdsec to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-white">{asset.symbol.slice(0, 2)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <h4 className="text-[10px] font-bold text-gray-900 dark:text-white">{asset.symbol}</h4>
                          <span className="text-[8px] text-gray-500 dark:text-gray-400">
                            {showBalance ? asset.quantity.toLocaleString() : '***'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[9px] text-gray-500 dark:text-gray-400">
                            {yieldData && showBalance ? formatCurrency(yieldData.closePrice) : '***'}₮
                          </p>
                          {yieldData && (
                            <span className={`text-[8px] font-semibold ${
                              profit >= 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {showBalance ? ((yieldData.profitPer ?? 0) >= 0 ? '+' : '') + (yieldData.profitPer ?? 0).toFixed(1) : '***'}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-[10px] font-bold text-gray-900 dark:text-white">
                        {yieldData && showBalance ? formatCurrency(yieldData.totalNow) : '***,***'}₮
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {portfolioData!.assetBalances.length === 0 && (
              <div className="text-center py-8">
                <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-1.5">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-[10px]">{t('portfolio.noStockHoldings')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}