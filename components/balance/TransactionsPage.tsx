"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
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
  const itemsPerPage = 10;

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
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Буцах</span>
          </button>
          <h1 className="text-base font-semibold text-gray-900 dark:text-white truncate max-w-[200px] text-center">
            {transactionType === 'security' ? 'Үнэт цаасны гүйлгээ' :
             transactionType === 'csd' ? 'ҮЦТХТ-ийн гүйлгээ' :
             transactionType === 'cash' ? 'Номинал дансны гүйлгээ' : 'Хуулга'}
          </h1>
          <div className="w-5"></div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-4 space-y-3">
          {/* Transaction Type Filter */}
          <div className="w-full">
            <select
              // value={'cash'}
              value={transactionType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm"
            >
              <option value="security">Үнэт цаасны гүйлгээ</option>
              {/* <option value="csd">ҮЦТХТ-ийн гүйлгээ</option> */}
              <option value="cash">Номинал дансны гүйлгээ</option>
            </select>
          </div>

          {/* Symbol Filter for Securities */}
          {transactionType === 'security' && selectedAssetSymbol && (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Үнэт цаас:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedAssetSymbol}</span>
              </div>
              <button 
                onClick={onClearAssetFilter}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-lg">×</span>
              </button>
            </div>
          )}

          {/* Date Range and Custom Date Filters */}
          <div className="flex flex-col space-y-3">
            <select
              value={dateRangeOption}
              onChange={(e) => onDateRangeChange(e.target.value as DateRangeOption)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 pr-8 text-sm"
            >
              <option value="all">Бүх хугацаа</option>
              <option value="7">7 хоног</option>
              <option value="30">30 хоног</option>
              <option value="custom">Өөрчлөх</option>
            </select>

            {dateRangeOption === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={customStart} 
                  onChange={(e) => onCustomStartChange(e.target.value)} 
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm" 
                />
                <input 
                  type="date" 
                  value={customEnd} 
                  onChange={(e) => onCustomEndChange(e.target.value)} 
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm" 
                />
              </div>
            )}
          </div>

          {/* Income/Expense Filter */}
          <div className="grid grid-cols-3 gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => onTransactionFilterChange('all')}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                transactionFilter === 'all' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              Бүгд
            </button>
            <button
              onClick={() => onTransactionFilterChange('income')}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                transactionFilter === 'income' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              Орлого
            </button>
            <button
              onClick={() => onTransactionFilterChange('expense')}
              className={`py-2 rounded-md text-sm font-medium transition-colors ${
                transactionFilter === 'expense' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              Зарлага
            </button>
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