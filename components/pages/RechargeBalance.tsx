"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { BASE_URL } from '@/lib/api';

interface RechargeOrder {
  passMnId: string;
  digiId: string;
  digipayUrl: string;
  shop: string;
  amount: string;
  order_ttl: number;
  fee: string;
  db_ref_no: string;
  resp_code: string;
  resp_msg: string;
  status_text: string;
  createdAt: string;
  updatedAt: string;
  channel: string;
}

interface RechargeHistoryItem {
  id: number;
  digiId: string;
  userId: number;
  amount: string;
  status: string;
  istockStatus: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isInstantChargeCompleted: boolean;
  order: RechargeOrder;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RechargeHistoryResponse {
  success: boolean;
  data: {
    items: RechargeHistoryItem[];
    pagination: PaginationInfo;
  };
}

export default function RechargeBalance() {
  const { t } = useTranslation();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RechargeHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'FAILED'>('COMPLETED');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const fetchHistory = async (page: number, status?: string) => {
    setLoadingHistory(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryStatus = status || statusFilter;
      const url = new URL(`${BASE_URL}/istockApp/recharge-balance/history`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '10');
      if (queryStatus !== 'ALL') {
        url.searchParams.append('status', queryStatus);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error();
      }
      const data: RechargeHistoryResponse = await response.json();
      
      if (data.success) {
        setHistory(data.data.items || []);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch recharge history:', error);
      setHistory([]);
      setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCheckAll = async () => {
    setCheckingStatus(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/istockApp/recharge-balance/check-all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      if (data.success) {
        if (data.data.completed > 0) {
          toast.success(t('recharge.completedMessage'));
          // Refresh the first page to show updated statuses
          fetchHistory(1);
        } else {
          toast(t('recharge.noUpdates'));
        }
      }
    } catch (error) {
      toast.error(t('recharge.checkError'));
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || isNaN(Number(amount)) || Number(amount) < 1000) {
      toast.error(t('recharge.invalidAmount'));
      return;
    }

    const token = Cookies.get('token');
    if (!token) {
      toast.error('Authentication required');
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/istockApp/recharge-balance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message);
        throw new Error();
      }
      const data = await response.json();
      const realData : {
        recharge: {
          id: number;
          digiId: string;
          userId: number;
          amount: string;
          status: string;
        }
        redirectUrl: string;
      } = data.data;
      toast.success(t('recharge.success'));
      router.push(realData.redirectUrl);
      setAmount('');
    } catch (error) {
      toast.error(t('recharge.error'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('mn-MN').format(Number(amount)) + '₮';
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'text-green-500';
      case 'FAILED':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6 pb-32">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('recharge.title')}
        </h1>
        <div className="w-9"></div> {/* Spacer for centering */}
      </div>
      
      <GlassCard className="p-6 space-y-6">
        <h2 className="text-lg font-bold text-center">
          {t('recharge.amount')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="amount" className="block text-sm font-medium">
              {t('recharge.amount')}
            </label>
            <div className="relative">
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t('recharge.enterAmount')}
                className="w-full px-4 py-2 rounded-lg border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-primary"
                min="1000"
                step="1000"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₮
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {t('recharge.minimumAmount')}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t('recharge.submit')}
              </div>
            ) : (
              t('recharge.submit')
            )}
          </Button>
        </form>
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {t('recharge.history')}
              </h2>
            <p className="text-sm text-gray-500">
              {pagination.total > 0 ? (
                <>{t('pagination.showing')} {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t('pagination.of')} {pagination.total}</>
              ) : ''}
            </p>
            </div>
            {/* <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  const newStatus = e.target.value as typeof statusFilter;
                  setStatusFilter(newStatus);
                  fetchHistory(1, newStatus);
                }}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bdsec w-full"
              >
                {(['ALL', 'COMPLETED', 'PENDING', 'FAILED'] as const).map((status) => (
                  <option key={status} value={status}>
                    {t(`recharge.status.${status.toLowerCase()}`)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div> */}
          </div>
          {/* <Button
            onClick={handleCheckAll}
            disabled={checkingStatus}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {checkingStatus ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                {t('recharge.checking')}
              </div>
            ) : (
              t('recharge.checkAll')
            )}
          </Button> */}
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length > 0 ? (
          <>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/30 dark:bg-gray-800/30"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {formatAmount(item.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                    {t(`recharge.${item.status.toLowerCase()}`)}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-between items-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => fetchHistory(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pagination.previous')}
                </button>

                <button
                  onClick={() => fetchHistory(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('pagination.next')}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {t('recharge.noHistory')}
          </p>
        )}
      </GlassCard>
    </div>
  );
}