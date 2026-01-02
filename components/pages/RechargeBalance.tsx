"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, CheckCircle2, Clock, XCircle, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { BASE_URL } from '@/lib/api';
import { TYPOGRAPHY, TEXT_COLORS, SPACING, RADIUS, BACKGROUNDS, BORDERS, TRANSITIONS, getInputClasses, getButtonClasses, cn } from '@/lib/design-system';

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
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const fetchHistory = async (page: number) => {
    setLoadingHistory(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = new URL(`${BASE_URL}/istockApp/recharge-balance/history`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', '10');
      url.searchParams.append('status', 'COMPLETED');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || !Number.isInteger(numAmount) || numAmount < 1000) {
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
          amount: parseInt(amount, 10),
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

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'FAILED':
        return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    }
  };

  const quickAmounts = [10000, 50000, 100000, 500000];

  return (
    <div className={cn(BACKGROUNDS.page, "min-h-screen", SPACING.pageBottom)}>
      {/* Header */}
      <div className={cn("flex items-center justify-between", SPACING.hWide, SPACING.vStandard, "border-b", BORDERS.default)}>
        <button 
          onClick={() => router.back()}
          className={cn("p-2", RADIUS.standard, BACKGROUNDS.ghostHover, TRANSITIONS.colors)}
        >
          <ArrowLeft className={cn("w-5 h-5", TEXT_COLORS.secondary)} />
        </button>
        <h1 className={cn("text-medium", TYPOGRAPHY.pageTitle, TEXT_COLORS.primary, "flex items-center gap-2")}>
          {t('recharge.title')}
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Form Section */}
      <div className={cn(SPACING.standard, "space-y-4")}>
        <div className={cn(BACKGROUNDS.page, RADIUS.standard, SPACING.large, BORDERS.default)}>
          <p className={cn(TYPOGRAPHY.body, TEXT_COLORS.secondary, SPACING.sectionSmall)}>
            {t('recharge.explanation', 'By recharging your account, you can immediately start trading')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className={cn("block", TYPOGRAPHY.label, TEXT_COLORS.primary, SPACING.elementSmall)}>
                {t('recharge.amount')}
              </label>
              <div className="relative">
                <input
                  id="amount"
                  type="text"
                  inputMode="numeric"
                  value={amount ? new Intl.NumberFormat('mn-MN').format(Number(amount)) : ''}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/\D/g, '');
                    setAmount(numericValue);
                  }}
                  placeholder={t('recharge.enterAmount')}
                  className={cn("w-full pr-12", getInputClasses(), "font-semibold")}
                  min="1000"
                />
                <span className={cn("absolute right-4 top-1/2 -translate-y-1/2 font-semibold", TYPOGRAPHY.body, TEXT_COLORS.muted)}>
                  ₮
                </span>
              </div>
              <p className={cn(TYPOGRAPHY.caption, TEXT_COLORS.muted, "mt-2")}>
                {t('recharge.minimumAmount')}
              </p>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className={cn("grid grid-cols-4", SPACING.gapStandard, "pt-2")}>
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className={cn(BACKGROUNDS.secondary, BACKGROUNDS.secondaryHover, SPACING.hStandard, SPACING.vSmall, RADIUS.standard, TYPOGRAPHY.buttonCompact, TEXT_COLORS.primary, TRANSITIONS.colors)}
                >
                  {new Intl.NumberFormat('mn-MN', { notation: 'compact', maximumFractionDigits: 0 }).format(quickAmount)}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className={cn("w-full", getButtonClasses('primary', 'large'), "flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed")}
              disabled={loading || !amount || Number(amount) < 1000}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('recharge.submit')}
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  {t('recharge.submit')}
                </>
              )}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className={cn(BACKGROUNDS.page, RADIUS.standard, SPACING.large, BORDERS.default)}>
          <div className={cn("flex items-center justify-between", SPACING.sectionSmall)}>
            <div className={cn("flex items-center", SPACING.gapStandard)}>
              <History className={cn("w-5 h-5", TEXT_COLORS.brand)} />
              <h2 className={cn(TYPOGRAPHY.cardTitle, TEXT_COLORS.primary)}>
                {t('recharge.history')}
              </h2>
            </div>
            {pagination.total > 0 && (
              <span className={cn(TYPOGRAPHY.badge, TEXT_COLORS.muted, BACKGROUNDS.secondary, SPACING.hStandard, SPACING.vCompact, RADIUS.full)}>
                {pagination.total}
              </span>
            )}
          </div>
          {pagination.total > 0 && (
            <p className={cn(TYPOGRAPHY.caption, TEXT_COLORS.muted, SPACING.sectionSmall)}>
              {t('pagination.showing')} {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} {t('pagination.of')} {pagination.total}
            </p>
          )}

          {loadingHistory ? (
            <div className={cn("flex justify-center", SPACING.vLarge)}>
              <div className={cn("w-8 h-8 border-2 border-gray-200 dark:border-gray-800 border-t-bdsec dark:border-t-indigo-500 rounded-full animate-spin")} />
            </div>
          ) : history.length > 0 ? (
            <>
              <div className={cn("space-y-2.5")}>
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={cn(BACKGROUNDS.page, RADIUS.standard, SPACING.small, BORDERS.default, BACKGROUNDS.ghostHover, TRANSITIONS.colors)}
                  >
                    <div className={cn("flex items-start justify-between", SPACING.gapStandard)}>
                      <div className="flex-1 min-w-0">
                        <div className={cn("flex flex-col", SPACING.gapTight)}>
                          <span className={cn(TYPOGRAPHY.stockPrice, TEXT_COLORS.primary)}>
                            {formatAmount(item.amount)}
                          </span>
                          <span className={cn(TYPOGRAPHY.caption, TEXT_COLORS.muted)}>
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className={cn("flex items-center gap-1.5", SPACING.hStandard, SPACING.vCompact, RADIUS.base, TYPOGRAPHY.badge, "border", getStatusBadgeClass(item.status))}>
                        {getStatusIcon(item.status)}
                        <span>{t(`recharge.${item.status.toLowerCase()}`)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className={cn("flex justify-between items-center", SPACING.gapCompact, SPACING.sectionSmall, "pt-4 border-t", BORDERS.default)}>
                  <button
                    onClick={() => fetchHistory(Math.max(1, pagination.page - 1))}
                    disabled={pagination.page === 1}
                    className={cn(getButtonClasses('secondary', 'standard'), "disabled:opacity-50 disabled:cursor-not-allowed")}
                  >
                    {t('pagination.previous')}
                  </button>

                  <span className={cn(TYPOGRAPHY.caption, TEXT_COLORS.secondary)}>
                    {pagination.page} / {pagination.totalPages}
                  </span>

                  <button
                    onClick={() => fetchHistory(Math.min(pagination.totalPages, pagination.page + 1))}
                    disabled={pagination.page === pagination.totalPages}
                    className={cn(getButtonClasses('secondary', 'standard'), "disabled:opacity-50 disabled:cursor-not-allowed")}
                  >
                    {t('pagination.next')}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={cn("text-center py-12", TEXT_COLORS.muted)}>
              <p className={TYPOGRAPHY.body}>{t('recharge.noHistory')}</p>
              <p className={cn(TYPOGRAPHY.caption, "mt-1.5")}>{t('recharge.noHistoryDescription', 'Your recharge history will appear here')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}