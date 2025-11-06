"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ChevronDown, TrendingUp, TrendingDown, Filter, X } from 'lucide-react';
import { formatCurrency } from '@/utils/balanceUtils';
import { SkeletonTransaction } from './SkeletonComponents';
import { useTranslation } from 'react-i18next';
import type { 
  SecurityTransaction, 
  CSDTransaction, 
  CashTransaction,
  TransactionFilter, 
  TransactionType, 
  DateRangeOption,
  BalanceType 
} from '@/types/balance';

interface SecurityTransactionCardProps {
  transaction: SecurityTransaction;
}

const SecurityTransactionCard = ({ transaction }: SecurityTransactionCardProps) => {
  const { t } = useTranslation();
  const isSell = transaction.buySell === 'sell';
  const quantity = isSell ? transaction.creditAmt || 0 : transaction.debitAmt || 0;
  const date = new Date(transaction.transactionDate).toLocaleDateString('mn-MN');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header - Symbol, Name, Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isSell ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {isSell ? (
              <TrendingUp className={`w-4 h-4 text-green-600 dark:text-green-400`} />
            ) : (
              <TrendingDown className={`w-4 h-4 text-red-600 dark:text-red-400`} />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{transaction.symbol}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{transaction.name}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${
            isSell ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isSell ? '+' : '-'}{quantity.toLocaleString()} ш
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {formatCurrency(transaction.price || 0)} ₮
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Гүйлгээний дүн</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(transaction.statementAmount)} ₮
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Шимтгэл ({transaction.feePercent}%)</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(transaction.feeAmount)} ₮
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Нийт дүн</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(transaction.totalAmount)} ₮
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Арилжаа</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {transaction.exchange}
          </p>
        </div>
      </div>
    </div>
  );
};

interface CSDTransactionCardProps {
  transaction: CSDTransaction;
}

const CSDTransactionCard = ({ transaction }: CSDTransactionCardProps) => {
  const { t } = useTranslation();
  const isIncome = (transaction.creditAmt || 0) > 0;
  const amount = isIncome ? transaction.creditAmt || 0 : transaction.debitAmt || 0;
  const date = new Date(transaction.transactionDate).toLocaleDateString('mn-MN');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {isIncome ? (
              <TrendingUp className={`w-4 h-4 text-green-600 dark:text-green-400`} />
            ) : (
              <TrendingDown className={`w-4 h-4 text-red-600 dark:text-red-400`} />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {transaction.code}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {transaction.username}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${
            isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isIncome ? '+' : '-'}{formatCurrency(amount)} ₮
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Үлдэгдэл: {formatCurrency(transaction.lastBalance)} ₮
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">
        {transaction.description}
      </div>
    </div>
  );
};

interface CashTransactionCardProps {
  transaction: CashTransaction;
}

const CashTransactionCard = ({ transaction }: CashTransactionCardProps) => {
  const { t } = useTranslation();
  // For cash transactions, creditAmt means money going out (expense)
  // and debitAmt means money coming in (income)
  const isIncome = (transaction.debitAmt || 0) > 0;
  const amount = isIncome ? transaction.debitAmt || 0 : transaction.creditAmt || 0;
  const date = new Date(transaction.transactionDate).toLocaleDateString('mn-MN');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between gap-4">
        {/* Left side: Icon and Date */}
        <div className="flex items-start space-x-3 min-w-0">
          <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mt-0.5 ${
            isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
          }`}>
            {isIncome ? (
              <TrendingUp className={`w-4 h-4 text-green-600 dark:text-green-400`} />
            ) : (
              <TrendingDown className={`w-4 h-4 text-red-600 dark:text-red-400`} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Номинал данс
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 break-words line-clamp-2">
              {transaction.description}
            </p>
          </div>
        </div>

        {/* Right side: Amount and Balance */}
        <div className="text-right flex-shrink-0 min-w-[120px]">
          <div className={`text-sm font-medium ${
            isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isIncome ? '+' : '-'}{formatCurrency(amount)} ₮
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Үлдэгдэл: {formatCurrency(transaction.lastBalance)} ₮
          </div>
        </div>
      </div>
    </div>
  );
};

interface TransactionsPageProps {
  selectedAssetSymbol: string | null;
  securityTransactions: SecurityTransaction[];
  csdTransactions: CSDTransaction[];
  cashTransactions: CashTransaction[];
  loadingSecurityTransactions: boolean;
  loadingCsdTransactions: boolean;
  loadingCashTransactions: boolean;
  transactionFilter: TransactionFilter;
  transactionType: TransactionType;
  dateRangeOption: DateRangeOption;
  customStart: string;
  customEnd: string;
  onBack: () => void;
  onClearAssetFilter: () => void;
  onTransactionFilterChange: (filter: TransactionFilter) => void;
  onTransactionTypeChange: (type: TransactionType) => void;
  onDateRangeChange: (option: DateRangeOption) => void;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
}

const VALID_TYPES = ['security', 'cash', 'csd'] as const;
type ValidType = typeof VALID_TYPES[number];

export default function TransactionsPage({
  selectedAssetSymbol,
  securityTransactions,
  csdTransactions,
  cashTransactions,
  loadingSecurityTransactions,
  loadingCsdTransactions,
  loadingCashTransactions,
  transactionFilter,
  transactionType,
  dateRangeOption,
  customStart,
  customEnd,
  onBack,
  onClearAssetFilter,
  onTransactionFilterChange,
  onTransactionTypeChange,
  onDateRangeChange,
  onCustomStartChange,
  onCustomEndChange
}: TransactionsPageProps) {
  
  const filterTransactionsByDate = useMemo(() => (transaction: SecurityTransaction | CSDTransaction | CashTransaction) => {
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
  }, [dateRangeOption, customStart, customEnd]);

  const filteredSecurityTransactions = useMemo(() => {
    if (transactionType !== 'security') return [];
    
    return securityTransactions
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .filter((transaction) => {
        // filter by selected asset symbol if provided
        if (selectedAssetSymbol) {
          return (transaction.symbol || '').toLowerCase() === selectedAssetSymbol.toLowerCase();
        }
        return true;
      })
      .filter((transaction) => {
        // filter by income/expense
        if (transactionFilter === 'income') return transaction.buySell === 'sell';
        if (transactionFilter === 'expense') return transaction.buySell === 'buy';
        return true;
      })
      .filter(filterTransactionsByDate);
  }, [securityTransactions, selectedAssetSymbol, transactionFilter, transactionType, filterTransactionsByDate]);

  const filteredCsdTransactions = useMemo(() => {
    if (transactionType !== 'csd') return [];
    
    return csdTransactions
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .filter((transaction) => {
        if (selectedAssetSymbol) {
          const sym = selectedAssetSymbol.toLowerCase();
          if (transaction.code && transaction.code.toLowerCase().includes(sym)) return true;
          if (transaction.description && transaction.description.toLowerCase().includes(sym)) return true;
          return false;
        }
        return true;
      })
      .filter((transaction) => {
        if (transactionFilter === 'income') return transaction.creditAmt > 0;
        if (transactionFilter === 'expense') return transaction.debitAmt > 0;
        return true;
      })
      .filter(filterTransactionsByDate);
  }, [csdTransactions, selectedAssetSymbol, transactionFilter, transactionType, filterTransactionsByDate]);

  const filteredCashTransactions = useMemo(() => {
    if (transactionType !== 'cash') return [];
    
    return cashTransactions
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .filter((transaction) => {
        // For cash transactions, we don't filter by symbol
        if (transactionFilter === 'income') return (transaction.debitAmt || 0) > 0;
        if (transactionFilter === 'expense') return (transaction.creditAmt || 0) > 0;
        return true;
      })
      .filter(filterTransactionsByDate);
  }, [cashTransactions, transactionFilter, transactionType, filterTransactionsByDate]);

  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 10;

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  // Get paginated data
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Get total pages
  const getTotalPages = (data: any[]) => Math.ceil(data.length / itemsPerPage);

  // Get current data based on transaction type
  const getCurrentData = () => {
    switch (transactionType) {
      case 'security':
        return {
          data: getPaginatedData(filteredSecurityTransactions),
          totalPages: getTotalPages(filteredSecurityTransactions),
          loading: loadingSecurityTransactions
        };
      case 'cash':
        return {
          data: getPaginatedData(filteredCashTransactions),
          totalPages: getTotalPages(filteredCashTransactions),
          loading: loadingCashTransactions
        };
      case 'csd':
        return {
          data: getPaginatedData(filteredCsdTransactions),
          totalPages: getTotalPages(filteredCsdTransactions),
          loading: loadingCsdTransactions
        };
      default:
        return { data: [], totalPages: 0, loading: false };
    }
  };

  const { data: paginatedData, totalPages, loading } = getCurrentData();

  // Reset to first page when changing filters
  useEffect(() => {
    setCurrentPage(1);
  }, [transactionType, transactionFilter, dateRangeOption, customStart, customEnd]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of transaction list
    const transactionList = document.getElementById('transaction-list');
    if (transactionList) {
      transactionList.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle type change with validation
  const handleTypeChange = (newType: string) => {
    console.log('newType', newType);
    if (VALID_TYPES.includes(newType as ValidType)) {
      onTransactionTypeChange(newType as TransactionType);
      // Don't call onClearAssetFilter here - it's handled in setType
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      {/* Filter Panel - Fixed Modal (Rendered First) */}
      {showFilters && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          />
          
          <div 
            ref={filterPanelRef}
            className="pb-28 fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
          >
            {/* Panel Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Шүүлтүүр</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="px-4 py-4 space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Хуулганы төрөл
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTypeChange('security')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    transactionType === 'security'
                      ? 'bg-bdsec dark:bg-indigo-600 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  📊 Үнэт цаас
                </button>
                <button
                  onClick={() => handleTypeChange('cash')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    transactionType === 'cash'
                      ? 'bg-bdsec dark:bg-indigo-600 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  💰 Номинал
                </button>
              </div>
            </div>

            {/* Income/Expense Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Төрөл
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onTransactionFilterChange('all')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    transactionFilter === 'all'
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Бүгд
                </button>
                <button
                  onClick={() => onTransactionFilterChange('income')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    transactionFilter === 'income'
                      ? 'bg-green-600 dark:bg-green-500 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Орлого
                </button>
                <button
                  onClick={() => onTransactionFilterChange('expense')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    transactionFilter === 'expense'
                      ? 'bg-red-600 dark:bg-red-500 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Зарлага
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Хугацаа
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onDateRangeChange('all')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    dateRangeOption === 'all'
                      ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Бүгд
                </button>
                <button
                  onClick={() => onDateRangeChange('7')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    dateRangeOption === '7'
                      ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  7 хоног
                </button>
                <button
                  onClick={() => onDateRangeChange('30')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    dateRangeOption === '30'
                      ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  30 хоног
                </button>
                <button
                  onClick={() => onDateRangeChange('custom')}
                  className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                    dateRangeOption === 'custom'
                      ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  Өдрөөр
                </button>
              </div>

              {/* Custom Date Inputs */}
              {dateRangeOption === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => onCustomStartChange(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => onCustomEndChange(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-sm focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

       
            </div>
          </div>
        </>
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Буцах</span>
          </button>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white">
            Хуулга
          </h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative flex items-center justify-center w-9 h-9 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <Filter className="w-5 h-5" />
            {/* Active Filter Indicator */}
            {(transactionFilter !== 'all' || dateRangeOption !== 'all' || selectedAssetSymbol) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-bdsec dark:bg-indigo-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Compact Filter Bar - Always Visible */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {/* Transaction Type Chip */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-shrink-0 px-3 py-1.5 bg-bdsec/10 dark:bg-indigo-500/20 text-bdsec dark:text-indigo-400 rounded-full text-sm font-medium flex items-center gap-1.5 hover:bg-bdsec/20 dark:hover:bg-indigo-500/30 transition-colors"
            >
              {transactionType === 'security' ? '📊 Үнэт цаас' : 
               transactionType === 'cash' ? '💰 Номинал' : '🏦 ҮЦТХТ'}
            </button>

            {/* Selected Symbol Chip */}
            {transactionType === 'security' && selectedAssetSymbol && (
              <div className="flex-shrink-0 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                <span>{selectedAssetSymbol}</span>
                <button 
                  onClick={onClearAssetFilter}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  ×
                </button>
              </div>
            )}

                {/* Date Range Chip */}
                {dateRangeOption !== 'all' && (
                  <div className="flex-shrink-0 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <span>
                      {dateRangeOption === '7' ? '7 хоног' : 
                       dateRangeOption === '30' ? t('transactions.thirtyDays', '30 хоног') : t('transactions.byDay', 'Өдрөөр')}
                    </span>
                    <button
                      onClick={() => onDateRangeChange('all')}
                      className="hover:text-purple-900 dark:hover:text-purple-100"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Filter Type Chip */}
                {transactionFilter !== 'all' && (
                  <div className="flex-shrink-0 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <span>{transactionFilter === 'income' ? '📈 Орлого' : '📉 Зарлага'}</span>
                    <button
                      onClick={() => onTransactionFilterChange('all')}
                      className="hover:text-green-900 dark:hover:text-green-100"
                    >
                      ×
                    </button>
                  </div>
                )}
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div id="transaction-list" className="pb-40 p-4 space-y-3">
        {/* Transactions */}
        {loading ? (
          <>
            <SkeletonTransaction />
            <SkeletonTransaction />
            <SkeletonTransaction />
          </>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedData.map((transaction, index) => {
                const uniqueKey = `${transactionType}-${transaction.transactionDate}-${transaction.totalAmount}-${index}`;
                switch (transactionType) {
                  case 'security':
                    return <SecurityTransactionCard key={uniqueKey} transaction={transaction} />;
                  case 'cash':
                    return <CashTransactionCard key={uniqueKey} transaction={transaction} />;
                  case 'csd':
                    return <CSDTransactionCard key={uniqueKey} transaction={transaction} />;
                  default:
                    return null;
                }
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-2">
                {/* Previous Page */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === 1
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  ←
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current page
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, array) => {
                      // If there's a gap, show ellipsis
                      if (index > 0 && page - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-2 text-gray-400 dark:text-gray-600">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`min-w-[32px] px-3 py-1 rounded-lg text-sm ${
                                currentPage === page
                                  ? 'bg-bdsec text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`min-w-[32px] px-3 py-1 rounded-lg text-sm ${
                            currentPage === page
                              ? 'bg-bdsec text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  →
                </button>
              </div>
            )}

            {/* No Data Message */}
            {paginatedData.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t('common.noTransactions')}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}