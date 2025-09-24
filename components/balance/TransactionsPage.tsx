"use client";

import { ArrowLeft, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/utils/balanceUtils';
import { SkeletonTransaction } from './SkeletonComponents';
import type { 
  SecurityTransaction, 
  CSDTransaction, 
  CashTransaction,
  TransactionFilter, 
  TransactionType, 
  DateRangeOption,
  BalanceType 
} from '@/types/balance';

interface TransactionsPageProps {
  balanceType: BalanceType;
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

export default function TransactionsPage({
  balanceType,
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
  
  const filterTransactionsByDate = (transaction: SecurityTransaction | CSDTransaction | CashTransaction) => {
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
  };

  const filteredSecurityTransactions = securityTransactions
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
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
      // filter by transactionType
      if (transactionType === 'all') return true;
      if (transactionType === 'security') return !!transaction.symbol || !!transaction.assetId;
      if (transactionType === 'cash') return false; // Security transactions don't include cash
      if (transactionType === 'dividend') return /dividend|nogdol|ногдол/i.test(transaction.description || '');
      if (transactionType === 'primary') return /primary|анхдагч/i.test(transaction.description || '');
      if (transactionType === 'secondary') return /secondary|хоёрдогч/i.test(transaction.description || '');
      return true;
    })
    .filter(filterTransactionsByDate);

  const filteredCsdTransactions = csdTransactions
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    .filter((transaction) => {
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
    .filter(filterTransactionsByDate);

  const filteredCashTransactions = cashTransactions
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    .filter((transaction) => {
      if (selectedAssetSymbol) {
        const sym = selectedAssetSymbol.toLowerCase();
        if (transaction.symbol && transaction.symbol.toLowerCase().includes(sym)) return true;
        if (transaction.description && transaction.description.toLowerCase().includes(sym)) return true;
        return false;
      }
      if (transactionFilter === 'income') return (transaction.creditAmt || 0) > 0;
      if (transactionFilter === 'expense') return (transaction.debitAmt || 0) > 0;
      return true;
    })
    .filter(filterTransactionsByDate);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onBack}
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
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded-full">
              Үнэт цаас: <span className="font-semibold ml-2">{selectedAssetSymbol}</span>
            </div>
            <button 
              onClick={onClearAssetFilter} 
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500"
            >
              Төгсгөл
            </button>
          </div>
        )}
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <select
              value={transactionType}
              onChange={(e) => onTransactionTypeChange(e.target.value as TransactionType)}
              className="appearance-none bg-white dark:bg-gray-800 border border-dim rounded-lg px-4 py-2 pr-8 text-sm"
            >
              <option value="all">Бүгд</option>
              <option value="security">Үнэт цаасны гүйлгээ</option>
              <option value="csd">ҮЦТХТ-ийн гүйлгээ</option>
              <option value="cash">Бэлэн мөнгөний гүйлгээ</option>
              <option value="dividend">Ногдол ашиг</option>
              <option value="primary">Анхдагч арилжаа</option>
              <option value="secondary">Хоёрдогч арилжаа</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={dateRangeOption}
              onChange={(e) => onDateRangeChange(e.target.value as DateRangeOption)}
              className="appearance-none bg-white dark:bg-gray-800 border border-dim rounded-lg px-4 py-2 pr-8 text-sm"
            >
              <option value="all">Огноо: Бүгд</option>
              <option value="7">7 хоног</option>
              <option value="30">30 хоног</option>
              <option value="custom">Өөрчлөх</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {dateRangeOption === 'custom' && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-2">
              <input 
                type="date" 
                value={customStart} 
                onChange={(e) => onCustomStartChange(e.target.value)} 
                className="bg-white dark:bg-gray-800 border border-dim rounded px-2 py-1 text-xs" 
              />
              <span>—</span>
              <input 
                type="date" 
                value={customEnd} 
                onChange={(e) => onCustomEndChange(e.target.value)} 
                className="bg-white dark:bg-gray-800 border border-dim rounded px-2 py-1 text-xs" 
              />
            </div>
          </div>
        )}

        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => onTransactionFilterChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${transactionFilter === 'all' ? 'bg-bdsec text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Бүгд
          </button>
          <button
            onClick={() => onTransactionFilterChange('income')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${transactionFilter === 'income' ? 'bg-bdsec text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Орлого
          </button>
          <button
            onClick={() => onTransactionFilterChange('expense')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${transactionFilter === 'expense' ? 'bg-bdsec text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            Зарлага
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Security Transactions */}
          {transactionType !== 'csd' && (loadingSecurityTransactions ? (
            <>
              <SkeletonTransaction />
              <SkeletonTransaction />
              <SkeletonTransaction />
            </>
          ) : (
            filteredSecurityTransactions.map((transaction, index) => {
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
                          {isIncome ? '💰' : '🛒'}
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
              );
            })
          ))}
          
          {/* CSD Transactions */}
          {(transactionType === 'csd' || balanceType === 'fund') && (
            loadingCsdTransactions ? (
              <>
                <SkeletonTransaction />
                <SkeletonTransaction />
              </>
            ) : (
              filteredCsdTransactions.map((transaction, index) => {
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
                );
              })
            )
          )}
          
          {/* Cash Transactions */}
          {transactionType === 'cash' && (
            loadingCashTransactions ? (
              <>
                <SkeletonTransaction />
                <SkeletonTransaction />
                <SkeletonTransaction />
              </>
            ) : (
              filteredCashTransactions.map((transaction, index) => {
                const isIncome = (transaction.creditAmt || 0) > 0;
                return (
                  <div key={`cash-${index}`} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isIncome ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          <span className={`text-xs font-bold ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {isIncome ? '💸' : '💳'}
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
                        <p className="text-gray-500 dark:text-gray-400">Эхний үлдэгдэл</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          {formatCurrency(transaction.firstBalance)}₮
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
                );
              })
            )
          )}
        </div>
      </div>
    </div>
  );
}