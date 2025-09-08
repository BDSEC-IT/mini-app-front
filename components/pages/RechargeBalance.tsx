"use client";

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import Cookies from 'js-cookie';
import { BASE_URL } from '@/lib/api';

interface RechargeHistory {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export default function RechargeBalance() {
  const { t } = useTranslation();
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RechargeHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = Cookies.get('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${BASE_URL}/istockApp/recharge-balance/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to fetch recharge history:', error);
    } finally {
      setLoadingHistory(false);
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
        //show the error message
        const data = await response.json();
        toast.error(data.message);
        throw new Error();
      }
      const data= await response.json();
      const realData : {
      
          recharge:{
            id:number;
            digiId:string;
            userId:number;
            amount:string;
            status:string;

          }
          redirectUrl:string;

     
      }= data.data;
      console.log(realData);
      toast.success(t('recharge.success'));
      console.log('Recharge request successful', realData.redirectUrl);
      router.push(realData.redirectUrl);
      setAmount('');
      // fetchHistory(); // Refresh history after successful recharge
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('mn-MN').format(amount) + '₮';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <GlassCard className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">
          {t('recharge.title')}
        </h1>
        
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
        <h2 className="text-xl font-semibold">
          {t('recharge.history')}
        </h2>

        {loadingHistory ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length > 0 ? (
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
                  {t(`recharge.${item.status}`)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {t('recharge.noHistory')}
          </p>
        )}
      </GlassCard>
    </div>
  );
}