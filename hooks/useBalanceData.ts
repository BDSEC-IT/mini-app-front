"use client";

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
  fetchIstockNominalBalance, 
  fetchIstockBalanceAsset, 
  fetchIstockSecurityTransactions, 
  fetchIstockCsdTransactions, 
  fetchIstockCashTransactions,
  fetchIstockYieldAnalysis 
} from '@/lib/api';
import type { 
  NominalBalance, 
  SecurityTransaction, 
  CSDTransaction,
  CashTransaction
} from '@/types/balance';
import type { AssetBalance as ApiAssetBalance, YieldAnalysis as ApiYieldAnalysis } from '@/lib/api';

export const useBalanceData = () => {
  // Loading states
  const [loadingNominal, setLoadingNominal] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingSecurityTransactions, setLoadingSecurityTransactions] = useState(true);
  const [loadingCsdTransactions, setLoadingCsdTransactions] = useState(true);
  const [loadingCashTransactions, setLoadingCashTransactions] = useState(true);
  const [loadingYield, setLoadingYield] = useState(true);
  
  // Data states
  const [nominalBalance, setNominalBalance] = useState<NominalBalance | null>(null);
  const [assetBalances, setAssetBalances] = useState<ApiAssetBalance[]>([]);
  const [yieldAnalysis, setYieldAnalysis] = useState<ApiYieldAnalysis[]>([]);
  const [securityTransactions, setSecurityTransactions] = useState<SecurityTransaction[]>([]);
  const [csdTransactions, setCsdTransactions] = useState<CSDTransaction[]>([]);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchNominalBalance = async () => {
    try {
      const token = Cookies.get('token');
      const result = await fetchIstockNominalBalance(token || undefined);
      if (result && result.success) {
        setNominalBalance(result.data);
        setError(null);
      } else {
        setError('Nominal balance API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nominal balance');
    } finally {
      setLoadingNominal(false);
    }
  };

  const fetchAssetBalances = async () => {
    try {
      const token = Cookies.get('token');
      const result = await fetchIstockBalanceAsset(token || undefined);
      if (result && result.success) {
        setAssetBalances(result.data || []);
        setError(null);
      } else {
        setError('Asset balance API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asset balances');
    } finally {
      setLoadingAssets(false);
    }
  };

  const fetchSecurityTransactions = async () => {
    try {
      const token = Cookies.get('token');
      const result = await fetchIstockSecurityTransactions(token || undefined);
      if (result && result.success) {
        setSecurityTransactions(result.data || []);
        setError(null);
      } else {
        setError('Security transaction API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch security transactions');
    } finally {
      setLoadingSecurityTransactions(false);
    }
  };

  const fetchYieldAnalysis = async () => {
    try {
      const token = Cookies.get('token');
      const result = await fetchIstockYieldAnalysis(token || undefined);
      if (result && result.success) {
        const data: ApiYieldAnalysis[] = result.data || [];
        setYieldAnalysis(data);
        setError(null);
      } else {
        setError('Yield analysis API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch yield analysis');
    } finally {
      setLoadingYield(false);
    }
  };

  const fetchCsdTransactions = async () => {
    try {
      const token = Cookies.get('token');
      const result = await fetchIstockCsdTransactions(token || undefined);
      if (result && result.success) {
        setCsdTransactions(result.data || []);
        setError(null);
      } else {
        setError('CSD transaction API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSD transactions');
    } finally {
      setLoadingCsdTransactions(false);
    }
  };

  const fetchCashTransactions = async () => {
    try {
      const token = Cookies.get('token');
      const result = await fetchIstockCashTransactions(token || undefined);
      if (result && result.success) {
        setCashTransactions(result.data || []);
        setError(null);
      } else {
        setError('Cash transaction API returned unsuccessful response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cash transactions');
    } finally {
      setLoadingCashTransactions(false);
    }
  };

  useEffect(() => {
    fetchNominalBalance();
    fetchAssetBalances();
    fetchSecurityTransactions();
    fetchCsdTransactions();
    fetchCashTransactions();
    fetchYieldAnalysis();
  }, []);

  return {
    // Loading states
    loadingNominal,
    loadingAssets,
    loadingSecurityTransactions,
    loadingCsdTransactions,
    loadingCashTransactions,
    loadingYield,
    
    // Data
    nominalBalance,
    assetBalances,
    yieldAnalysis,
    securityTransactions,
    csdTransactions,
    cashTransactions,
    error,
    
    // Computed loading state
    isLoading: loadingNominal && loadingAssets && loadingSecurityTransactions && loadingCashTransactions
  };
};