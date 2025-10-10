import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  fetchWithdrawalList,
  fetchBankList,
  fetchNominalBalance,
  fetchCSDBalance,
  checkCSDAgreement,
  createWithdrawalRequest,
  cancelWithdrawalRequest,
  addBankAccount,
  type WithdrawalRequest,
  type BankAccount,
  type NominalBalance,
  type CSDAgreement,
  type WithdrawalType
} from '@/lib/api';

export const useWithdrawalData = () => {
  const token = Cookies.get('token');
  const [loading, setLoading] = useState(true);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingNominal, setLoadingNominal] = useState(false);
  const [loadingAgreement, setLoadingAgreement] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingAddBank, setLoadingAddBank] = useState(false);

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [nominalBalance, setNominalBalance] = useState<NominalBalance | null>(null);
  const [csdBalance, setCsdBalance] = useState<any[]>([]);
  const [csdAgreement, setCsdAgreement] = useState<CSDAgreement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch CSD balance
  const fetchCSD = async () => {
    if (!token) return;
    
    try {
      const result = await fetchCSDBalance(token);
      if (result.success) {
        setCsdBalance(result.data?.mcsdBalance || []);
      } else {
        setError(result.message || 'Failed to fetch CSD balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CSD balance');
    }
  };

  // Fetch all initial data
  const fetchAllData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchWithdrawals(),
        fetchBanks(),
        fetchNominal(),
        fetchCSD(),
        fetchAgreement()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch withdrawal list
  const fetchWithdrawals = async () => {
    if (!token) return;
    
    setLoadingWithdrawals(true);
    try {
      const result = await fetchWithdrawalList(token);
      if (result.success) {
        setWithdrawals(result.data);
      } else {
        setError(result.message || 'Failed to fetch withdrawals');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch withdrawals');
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  // Fetch bank list
  const fetchBanks = async () => {
    if (!token) return;
    
    setLoadingBanks(true);
    try {
      const result = await fetchBankList(token);
      if (result.success) {
        setBanks(result.data);
      } else {
        setError(result.message || 'Failed to fetch banks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch banks');
    } finally {
      setLoadingBanks(false);
    }
  };

  // Fetch nominal balance
  const fetchNominal = async () => {
    if (!token) return;
    
    setLoadingNominal(true);
    try {
      const result = await fetchNominalBalance(token);
      if (result.success) {
        setNominalBalance(result.data || null);
      } else {
        setError(result.message || 'Failed to fetch nominal balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nominal balance');
    } finally {
      setLoadingNominal(false);
    }
  };

  // Check CSD agreement
  const fetchAgreement = async () => {
    if (!token) return;
    
    setLoadingAgreement(true);
    try {
      const result = await checkCSDAgreement(token);
      if (result.success) {
        setCsdAgreement(result.data || null);
      } else {
        setError(result.message || 'Failed to check CSD agreement');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check CSD agreement');
    } finally {
      setLoadingAgreement(false);
    }
  };

  // Create withdrawal request
  const createWithdrawal = async (
    type: WithdrawalType,
    requestData: {
      accountNumber: string;
      amount: number;
      description: string;
      assetCode?: string;
      channel: string;
    }
  ) => {
    if (!token) return { success: false, message: 'No token available' };
    
    setLoadingCreate(true);
    try {
      const result = await createWithdrawalRequest(type, requestData, token);
      if (result.success) {
        // Refresh withdrawal list after successful creation
        await fetchWithdrawals();
        // Refresh appropriate balance based on type
        if (type === 'NOMINAL') {
          await fetchNominal();
        } else {
          await fetchCSD();
        }
      }
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to create withdrawal request'
      };
    } finally {
      setLoadingCreate(false);
    }
  };

  // Cancel withdrawal request
  const cancelWithdrawal = async (withdrawalId: number) => {
    if (!token) return { success: false, message: 'No token available' };
    
    setLoadingCancel(true);
    try {
      const result = await cancelWithdrawalRequest(withdrawalId, token);
      if (result.success) {
        // Refresh withdrawal list after successful cancellation
        await fetchWithdrawals();
        await fetchNominal(); // Refresh balance
      }
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to cancel withdrawal request'
      };
    } finally {
      setLoadingCancel(false);
    }
  };

  // Add bank account
  const addBank = async (bankData: {
    accNumber: string;
    accName: string;
    bankCode: string;
    currency: string;
  }) => {
    if (!token) return { success: false, message: 'No token available' };
    
    setLoadingAddBank(true);
    try {
      const result = await addBankAccount(bankData, token);
      if (result.success) {
        // Refresh bank list after successful addition
        await fetchBanks();
      }
      return result;
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Failed to add bank account'
      };
    } finally {
      setLoadingAddBank(false);
    }
  };

  // Get active withdrawal (new state)
  const getActiveWithdrawal = () => {
    return withdrawals.find(w => w.state === 'new');
  };

  // Check if user has active withdrawal
  const hasActiveWithdrawal = () => {
    return withdrawals.some(w => w.state === 'new');
  };

  // Get available balance for withdrawal
  const getAvailableBalance = () => {
    if (!nominalBalance) return 0;
    return nominalBalance.balance - (nominalBalance.withdrawalAmount || 0);
  };

  // Get CSD available balance
  const getCSDAvailableBalance = () => {
    return csdBalance.reduce((total, item) => total + (item.amount || 0), 0);
  };

  // Get withdrawals by type
  const getWithdrawalsByType = (type: WithdrawalType) => {
    return withdrawals.filter(w => w.type.toLowerCase() === type.toLowerCase());
  };

  // Check if user has active withdrawal for specific type
  const hasActiveWithdrawalForType = (type: WithdrawalType) => {
    return withdrawals.some(w => w.state === 'new' && w.type.toLowerCase() === type.toLowerCase());
  };

  useEffect(() => {
    fetchAllData();
  }, [token]);

  return {
    // Data
    withdrawals,
    banks,
    nominalBalance,
    csdBalance,
    csdAgreement,
    error,
    
    // Loading states
    loading,
    loadingWithdrawals,
    loadingBanks,
    loadingNominal,
    loadingAgreement,
    loadingCreate,
    loadingCancel,
    loadingAddBank,
    
    // Actions
    fetchWithdrawals,
    fetchBanks,
    fetchNominal,
    fetchCSD,
    fetchAgreement,
    createWithdrawal,
    cancelWithdrawal,
    addBank,
    refreshData: fetchAllData,
    
    // Computed values
    getActiveWithdrawal,
    hasActiveWithdrawal,
    getAvailableBalance,
    getCSDAvailableBalance,
    getWithdrawalsByType,
    hasActiveWithdrawalForType
  };
};
