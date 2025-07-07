'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react'
import Link from 'next/link'
import { checkInvoiceStatus } from '@/lib/api'
import Cookies from 'js-cookie'

export default function PaymentStatusPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'success' | 'failure' | 'processing'>('processing')
  const [message, setMessage] = useState<string | null>(null)
  
  useEffect(() => {
    const pollInvoiceStatus = async () => {
      const token = Cookies.get('token');
      if (!token) {
        setStatus('failure');
        setMessage('Authentication token not found.');
        return;
      }

      try {
        const response = await checkInvoiceStatus(token);
        
        if (response.success && response.data) {
          const invoiceStatus = response.data?.invoice?.status || response.data?.registrationFee?.status;
          
          if (invoiceStatus === 'PAID' || invoiceStatus === 'success') {
            setStatus('success');
            setMessage(t('payment.successMessage'));
            setTimeout(() => router.push('/profile'), 3000);
            return 'stop'; // Stop polling
          } else if (invoiceStatus === 'FAILED' || invoiceStatus === 'failure' || invoiceStatus === 'CANCELED') {
            setStatus('failure');
            setMessage(t('payment.failureMessage'));
            return 'stop'; // Stop polling
          }
        }
      } catch (err) {
        console.error("Error checking invoice status:", err);
      }
    };

    // Poll every 5 seconds
    const intervalId = setInterval(async () => {
      const result = await pollInvoiceStatus();
      if (result === 'stop') {
        clearInterval(intervalId);
      }
    }, 5000);

    // Stop polling after 10 minutes (600,000 ms)
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (status === 'processing') {
        setStatus('failure');
        setMessage('Payment verification timed out. Please check your transaction history.');
      }
    }, 600000);

    // Initial check
    pollInvoiceStatus();

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [router, t, status]);
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('payment.status', 'Төлбөрийн төлөв')}</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 size={48} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                {t('payment.processing', 'Төлбөр шалгаж байна...')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {message || t('payment.pleaseWait', 'Түр хүлээнэ үү...')}
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">
                {t('payment.success', 'Төлбөр амжилттай')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {message || t('payment.successMessage', 'Таны төлбөр амжилттай хийгдлээ.')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
                <Clock size={14} className="mr-2" />
                {t('payment.redirecting', 'Профайл руу шилжиж байна...')}
              </p>
            </>
          )}
          
          {status === 'failure' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle size={48} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
                {t('payment.failure', 'Төлбөр амжилтгүй')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {message || t('payment.failureMessage', 'Төлбөр хийхэд алдаа гарлаа.')}
              </p>
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/account-setup/fee" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('payment.tryAgain', 'Дахин оролдох')}
                </Link>
                <Link 
                  href="/" 
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('payment.backToDashboard', 'Нүүр хуудас руу буцах')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 