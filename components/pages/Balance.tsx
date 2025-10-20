"use client";

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
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

  // Use custom hook for data fetching
  const {
    loadingNominal,
    loadingAssets,
    nominalBalance,
    assetBalances,
    yieldAnalysis,
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
    <div className="p-4">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Өөрийн үнэт цаас хайх"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-bdsec"
        />
      </div>

      <div className="space-y-3">
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
              <div key={index} className=" relative w-full p-3 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between">
                {/* SVG Illumination Effect */}
                <svg
                  className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
                  width="200%"
                  height="200%"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="currentColor"
                    d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                    transform="translate(100 100)"
                  />
                </svg>
                <div className="flex items-center justify-between mb-10 z-10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {asset.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div className="z-10">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</p>
                    </div>
                  </div>
                  <div className="text-right z-10">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {showBalance ? asset.quantity.toLocaleString() : '***'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Одоогийн үнэлгээ: </span>{showBalance ? `${formatCurrency(assetValue)} ₮` : '***,*** ₮'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-end z-10">
                  {/* Temporarily commented out Арилжаа button
                  <button className="bg-bdsec dark:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-bdsec/90">
                    Арилжаа
                  </button>
                  */}
                  <button
                    onClick={() => {
                      router.push(`/balance/history?symbol=${asset.symbol}&type=security`);
                    }}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
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

  const renderNominalContent = () => (
    <div className="p-4 space-y-4">
      {loadingNominal ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : nominalBalance ? (
        <div className="relative w-full p-3 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between">
          {/* SVG Illumination Effect */}
          <svg
            className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
            width="200%"
            height="200%"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="flex items-center justify-between mb-10 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">₮</span>
              </div>
              <div className="z-10">
                <h3 className="font-semibold text-gray-900 dark:text-white">{nominalBalance.currency}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Бэлэн мөнгө</p>
              </div>
            </div>
            <div className="text-right z-10">
              <p className="font-bold text-gray-900 dark:text-white">
                {showBalance ? `${formatCurrency(nominalBalance.balance)} ₮` : '***,*** ₮'}
              </p>
             
            </div>
          </div>
          
          
          {/* <div className="flex items-center justify-end space-x-2 z-10">
            <button
              onClick={() => {
                console.log('clicked');
                router.push(`/balance/history?type=cash`);
                
              }}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              Хуулга
            </button>
            <button 
              onClick={() => router.push('/balance/withdrawal')}
              className="bg-bdsec dark:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-bdsec/90"
            >
              Мөнгө хүсэх
            </button>
          </div> */}
        </div>
      ) : (
        // Fallback display with zeroed balances - sorted in descending order
        [
          { currency: 'USD', name: 'Бэлэн мөнгө', balance: 0, icon: '$' },
          { currency: 'MNT', name: 'Бэлэн мөнгө', balance: 0, icon: '₮' }
        ].map((item, index) => (
          <div key={index} className="relative w-full p-3 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between">
            {/* SVG Illumination Effect */}
            <svg
              className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
              width="200%"
              height="200%"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
                transform="translate(100 100)"
              />
            </svg>
            <div className="flex items-center justify-between mb-10 z-10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.icon}</span>
                </div>
                <div className="z-10">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.currency}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Бэлэн мөнгө</p>
                </div>
              </div>
              <div className="text-right z-10">
                <p className="font-bold text-gray-900 dark:text-white">
                  {showBalance ? `${formatCurrency(item.balance)} ₮` : '***,*** ₮'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>Одоогийн үнэлгээ: </span>{showBalance ? `${formatCurrency(item.balance)} ₮` : '***,*** ₮'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 z-10">
              <button
                onClick={() => {
                  console.log('clicked');
                  router.push(`/balance/history?type=cash`);
                }}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-sm rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Хуулга
              </button>
              <button 
                onClick={() => router.push('/balance/withdrawal')}
                className="bg-bdsec dark:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-bdsec/90"
              >
                Мөнгө хүсэх
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderFundContent = () => (
    <div className="p-4 space-y-3">
      {(nominalBalance?.mcsdBalance?.length ? nominalBalance.mcsdBalance : [
        { account: null, currency: 'MNT', amount: 0, code: '9998', withdrawalBalance: 0 },
        { account: null, currency: 'USD', amount: 0, code: '8889', withdrawalBalance: 0 },
        { account: null, currency: 'DIV', amount: 0, code: '9992', withdrawalBalance: 0 }
      ]).map((item, index) => (
        <div key={index} className="relative w-full p-3 overflow-hidden transition-all duration-300 border rounded-xl cursor-pointer transform hover:scale-105 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 dark:border-l-indigo-500 dark:border-t-indigo-500 hover:border-bdsec/50 dark:hover:border-indigo-500/50 flex flex-col justify-between">
          {/* SVG Illumination Effect */}
          <svg
            className="absolute text-indigo-500 -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-0 dark:opacity-80 pointer-events-none z-0"
            width="200%"
            height="200%"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="flex items-center justify-between mb-10 z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {item.currency === 'MNT' ? '₮' : item.currency === 'USD' ? '$' : '₮'}
                </span>
              </div>
              <div className="z-10">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.currency || item.code}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">ҮЦТХТ</p>
              </div>
            </div>
            <div className="text-right z-10">
              <p className="font-bold text-gray-900 dark:text-white">
                {showBalance ? `${formatCurrency(item.amount || 0)} ${item.currency ? item.currency.toUpperCase() : '₮'}` : '***,*** ₮'}
              </p>
            </div>
          </div>
          
          {/* Buttons removed from ҮЦТХТ tab */}
        </div>
      ))}
    </div>
  );

  // Main loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec dark:border-indigo-500"></div>
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
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
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