"use client";

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useBalanceData } from '@/hooks/useBalanceData';
import { formatCurrency, calculateSecuritiesValue, calculateTotalBalance } from '@/utils/balanceUtils';
import BalanceHeader from '@/components/balance/BalanceHeader';
import BalanceNavigation from '@/components/balance/BalanceNavigation';
import WithdrawalsPage from '@/components/balance/WithdrawalsPage';
import { SkeletonCard } from '@/components/balance/SkeletonComponents';
import type { BalanceType, PageType } from '@/types/balance';
import { useRouter } from 'next/navigation';

export default function Balance() {
  const router = useRouter();
  
  // Page and UI state
  const [currentPage, setCurrentPage] = useState<PageType>('balance');
  const [balanceType, setBalanceType] = useState<BalanceType>('securities');
  const [showBalance, setShowBalance] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalBalance, setTotalBalance] = useState(0);
  const [nominalFilter, setNominalFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Use custom hook for data fetching
  const {
    loadingNominal,
    loadingAssets,
    loadingCashTransactions,
    nominalBalance,
    assetBalances,
    yieldAnalysis,
    cashTransactions,
    isLoading
  } = useBalanceData();

  // Calculate securities value and total balance
  const securitiesValue = calculateSecuritiesValue(yieldAnalysis);
  
  useEffect(() => {
    const nominal = nominalBalance?.balance || 0;
    setTotalBalance(calculateTotalBalance(nominal, securitiesValue));
  }, [nominalBalance, securitiesValue]);

  // Filter assets based on search term
  const filteredAssets = assetBalances.filter(asset =>
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render functions for different content sections
  const renderSecuritiesContent = () => (
    <div className="p-2.5">
      <div className="relative mb-2.5">
        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Үнэт цаас хайх"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border text-xs border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-bdsec dark:focus:ring-indigo-500"
        />
      </div>

      <div className="space-y-1.5">
        {loadingAssets ? (
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
              <div 
                key={index} 
                className="relative w-full p-2.5 overflow-hidden transition-colors duration-150 border rounded-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-bdsec to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{asset.symbol.slice(0, 2)}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">{asset.symbol}</h3>
                      <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {showBalance ? asset.quantity.toLocaleString() : '***'}
                    </p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400">
                      {showBalance ? `${formatCurrency(assetValue)}₮` : '***,***₮'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => {
                      router.push(`/balance/history?symbol=${asset.symbol}&type=security`);
                    }}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Хуулга
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderNominalContent = () => {
    // Filter transactions based on selected filter
    const filteredTransactions = cashTransactions.filter(transaction => {
      const isIncome = (transaction.debitAmt || 0) > 0;
      if (nominalFilter === 'income') return isIncome;
      if (nominalFilter === 'expense') return !isIncome;
      return true; // 'all'
    });

    // Get only the last 10 transactions
    const recentTransactions = filteredTransactions.slice(0, 10);

    return (
      <div className="p-2.5 space-y-2">
        {/* Filter buttons */}
        <div className="flex gap-1.5 mb-2.5">
          <button
            onClick={() => setNominalFilter('all')}
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
              nominalFilter === 'all'
                ? 'bg-bdsec dark:bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Бүгд
          </button>
          <button
            onClick={() => setNominalFilter('income')}
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
              nominalFilter === 'income'
                ? 'bg-green-600 dark:bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Орлого
          </button>
          <button
            onClick={() => setNominalFilter('expense')}
            className={`flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
              nominalFilter === 'expense'
                ? 'bg-red-600 dark:bg-red-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            Зарлага
          </button>
        </div>

        {loadingCashTransactions ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : recentTransactions && recentTransactions.length > 0 ? (
          <>
            {recentTransactions.map((transaction, index) => {
              // For cash transactions, creditAmt means money going out (expense)
              // and debitAmt means money coming in (income)
              const isIncome = (transaction.debitAmt || 0) > 0;
              const amount = isIncome ? transaction.debitAmt || 0 : transaction.creditAmt || 0;
              const date = new Date(transaction.transactionDate).toLocaleDateString('mn-MN');

              return (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-2.5 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2 min-w-0 flex-1">
                      <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full ${
                        isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {isIncome ? (
                          <TrendingUp className={`w-3 h-3 text-green-600 dark:text-green-400`} />
                        ) : (
                          <TrendingDown className={`w-3 h-3 text-red-600 dark:text-red-400`} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5 mb-0.5">
                          <span className="text-[10px] font-semibold text-gray-900 dark:text-white">
                            Номинал данс
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-gray-400">{date}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 dark:text-gray-400 break-words line-clamp-2">
                          {transaction.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs font-bold ${
                        isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(amount)}₮
                      </div>
                      <div className="text-[9px] text-gray-500 dark:text-gray-400">
                        {showBalance ? `${formatCurrency(transaction.lastBalance)}₮` : '***,***₮'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredTransactions.length > 10 && (
              <button
                onClick={() => router.push('/balance/history?type=cash')}
                className="w-full py-2 mt-1 text-[10px] font-semibold text-bdsec dark:text-indigo-400 hover:text-bdsec/80 dark:hover:text-indigo-300 transition-colors"
              >
                Бүгдийг харах ({filteredTransactions.length})
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p className="text-xs">Гүйлгээний түүх байхгүй байна</p>
          </div>
        )}
      </div>
    );
  };

  const renderFundContent = () => {
    const p: any = nominalBalance || {};
    const mcsd = Array.isArray(p.mcsdBalance) ? p.mcsdBalance : [];
    const findByCode = (code: string) => mcsd.find((x: any) => (x.code || '').toString() === code);
    const mntEntry = findByCode('9998');
    const usdEntry = mcsd.find((x: any) => (x.currency || '').toString().toLowerCase() === 'usd' || (x.code || '').toString() === '8889');
    const divEntry = findByCode('9992');

    const csdCash = p.csdCashBalance?.lastBalance ?? null;
    const divCash = p.divCashBalance?.lastBalance ?? null;

    const rows = [
      {
        currency: 'MNT',
        amount: csdCash != null ? csdCash : (mntEntry?.amount ?? 0),
        code: '9998'
      },
      {
        currency: 'USD',
        amount: usdEntry?.amount ?? 0,
        code: '8889'
      },
      {
        currency: 'Ногдол ашгийн мөнгө',
        amount: divCash != null ? divCash : (divEntry?.amount ?? 0),
        code: '9992'
      }
    ];

    return (
      <div className="p-2.5 space-y-1.5">
        {rows.map((item, index) => (
          <div 
            key={index} 
            className="relative w-full p-2.5 overflow-hidden transition-colors duration-150 border rounded-lg border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-bdsec to-indigo-600 dark:from-indigo-600 dark:to-indigo-800 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {item.currency === 'MNT' ? '₮' : item.currency === 'USD' ? '$' : '₮'}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate">{item.currency}</h3>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400">ҮЦТХТ</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {showBalance ? `${formatCurrency(item.amount || 0)}` : '***,***'}
                </p>
                <p className="text-[9px] text-gray-500 dark:text-gray-400">
                  {item.currency === 'Ногдол ашгийн мөнгө' ? '₮' : item.currency}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => {
                  router.push('/balance/history?type=csd');
                }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] font-semibold rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Хуулга
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Main loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center pb-20">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 dark:border-gray-800 border-t-bdsec dark:border-t-indigo-500"></div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'withdrawals') {
    return (
      <WithdrawalsPage
        nominalBalance={nominalBalance}
        showBalance={showBalance}
        onBack={() => setCurrentPage('balance')}
      />
    );
  }

  // Main balance page
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24 ">
      <BalanceHeader
        totalBalance={totalBalance}
        nominalBalance={nominalBalance}
        showBalance={showBalance}
        loadingNominal={loadingNominal}
        onToggleBalance={() => setShowBalance(!showBalance)}
      />
      
      <BalanceNavigation
        balanceType={balanceType}
        securitiesValue={securitiesValue}
        showBalance={showBalance}
        onBalanceTypeChange={setBalanceType}
        onPageChange={setCurrentPage}
      />
      
      {balanceType === 'securities' && renderSecuritiesContent()}
      {balanceType === 'nominal' && renderNominalContent()}
      {balanceType === 'fund' && renderFundContent()}
    </div>
  );
}