"use client";

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import TransactionsPage from '@/components/balance/TransactionsPage';
import { useBalanceData } from '@/hooks/useBalanceData';
import { useTransactionParams } from '@/hooks/useTransactionParams';

export default function HistoryPage() {
  const router = useRouter();
  const {
    type,
    filter,
    dateRange,
    symbol,
    startDate,
    endDate,
    setType,
    setFilter,
    setDateRange,
    setSymbol,
    setCustomDates
  } = useTransactionParams();

  // Use custom hook for data fetching
  const {
    loadingSecurityTransactions,
    loadingCsdTransactions,
    loadingCashTransactions,
    securityTransactions,
    csdTransactions,
    cashTransactions,
  } = useBalanceData();
  const transactions = useMemo(() => {
    switch (type) {
      case 'security':
        return {
          data: securityTransactions,
          loading: loadingSecurityTransactions
        };
      case 'cash':
        return {
          data: cashTransactions,
          loading: loadingCashTransactions
        };
      case 'csd':
        return {
          data: csdTransactions,
          loading: loadingCsdTransactions
        };
      default:
        return {
          data: [],
          loading: false
        };
    }
  }, [
    type,
    securityTransactions,
    cashTransactions,
    csdTransactions,
    loadingSecurityTransactions,
    loadingCashTransactions,
    loadingCsdTransactions
  ]);

  return (
    <TransactionsPage
      selectedAssetSymbol={symbol}
      securityTransactions={securityTransactions}
      csdTransactions={csdTransactions}
      cashTransactions={cashTransactions}
      loadingSecurityTransactions={transactions.loading}
      loadingCsdTransactions={transactions.loading}
      loadingCashTransactions={transactions.loading}
      transactionFilter={filter}
      transactionType={type}
      dateRangeOption={dateRange}
      customStart={startDate}
      customEnd={endDate}
      onBack={() => router.push('/balance')}
      onClearAssetFilter={() => setSymbol(null)}
      onTransactionFilterChange={setFilter}
      onTransactionTypeChange={setType}
      onDateRangeChange={setDateRange}
      onCustomStartChange={(date) => setCustomDates(date, endDate)}
      onCustomEndChange={(date) => setCustomDates(startDate, date)}
    />
  );
}