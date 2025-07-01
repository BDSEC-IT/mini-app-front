'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CreditCard } from 'lucide-react'
import Cookies from 'js-cookie'
import { createOrRenewInvoice } from '@/lib/api'

export default function FeePaymentPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)
    const token = Cookies.get('token')

    if (!token) {
      setError("Authentication token not found. Please log in again.")
      setIsProcessing(false)
      return
    }

    try {
      const result = await createOrRenewInvoice(token)
      if (result.success) {
        // The parent application should now handle the Digipay flow.
        // We will just inform the user that the invoice was created.
        alert('Нэхэмжлэл амжилттай үүслээ. Та банкны апп-аасаа төлбөрөө гүйцэтгэнэ үү.')
        // Optionally, redirect the user or update the UI
        router.push('/profile')
      } else {
        setError(result.message || "Failed to create payment invoice.")
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {t('profile.accountFee', 'Данс нээх хураамж')}
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="text-center p-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('profile.paymentRequired', 'Нэхэмжлэл үүсгэх')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('profile.paymentFeeDescription', 'Данс нээлтийн хураамж 5,000₮-ийн нэхэмжлэлийг үүсгэж, төлбөрөө төлнө үү.')}
          </p>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CreditCard className="h-5 w-5" />
            {isProcessing 
              ? t('profile.processing', 'Боловсруулж байна...') 
              : t('profile.createInvoice', 'Нэхэмжлэл үүсгэх (5,000₮)')}
          </button>
        </div>
      </div>
    </div>
  )
} 