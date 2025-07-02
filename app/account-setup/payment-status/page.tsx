'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function PaymentStatusPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'success' | 'failure' | 'processing'>('processing')
  const [message, setMessage] = useState('')
  
  useEffect(() => {
    // Get payment status from URL params
    const paymentStatus = searchParams.get('status')
    const paymentMessage = searchParams.get('message')
    
    if (paymentStatus === 'success') {
      setStatus('success')
      setMessage(paymentMessage || 'Payment was successful')
      
      // Redirect to dashboard after 3 seconds on success
      const timer = setTimeout(() => {
        router.push('/')
      }, 3000)
      
      return () => clearTimeout(timer)
    } else if (paymentStatus === 'failure') {
      setStatus('failure')
      setMessage(paymentMessage || 'Payment failed')
    } else {
      // If no status is provided, assume we're still processing
      setStatus('processing')
      setMessage('Checking payment status...')
      
      // If we're still processing after 5 seconds, assume failure
      const timer = setTimeout(() => {
        setStatus('failure')
        setMessage('Payment verification timed out')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold mb-6">{t('payment.status', 'Payment Status')}</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md text-center">
          {status === 'processing' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 size={64} className="text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                {t('payment.processing', 'Processing Payment')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {message || t('payment.pleaseWait', 'Please wait while we verify your payment...')}
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle size={64} className="text-green-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">
                {t('payment.success', 'Payment Successful')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {message || t('payment.successMessage', 'Your payment has been successfully processed.')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('payment.redirecting', 'Redirecting to dashboard...')}
              </p>
            </>
          )}
          
          {status === 'failure' && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle size={64} className="text-red-500" />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">
                {t('payment.failure', 'Payment Failed')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {message || t('payment.failureMessage', 'There was a problem processing your payment.')}
              </p>
              <div className="flex flex-col space-y-3">
                <Link 
                  href="/account-setup/fee" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('payment.tryAgain', 'Try Again')}
                </Link>
                <Link 
                  href="/" 
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {t('payment.backToDashboard', 'Back to Dashboard')}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 