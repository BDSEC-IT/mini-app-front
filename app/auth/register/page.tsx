'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, ChevronRight, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sendRegistrationNumber } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const country = searchParams.get('country')
  const [registerNumber, setRegisterNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountData, setAccountData] = useState<any>(null)

  const handleNext = async () => {
    if (registerNumber) {
      setIsLoading(true)
      setError(null)
      try {
        const response = await sendRegistrationNumber(registerNumber)
        
        // Check if account was found
        if (response.success && response.data) {
          // Account found, show the data
          console.log('Account found:', response.data)
          setAccountData(response.data)
        } else if (response.success && !response.data) {
          // Account not found
          setError(t('auth.accountNotFound'))
        } else {
          // API returned an error
          setError(response.message || t('auth.verificationFailed'))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('auth.verificationFailed'))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleProceedToDashboard = () => {
    router.push('/')
  }

  // If account data is found, show the account information
  if (accountData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
              Account Found
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Account information retrieved successfully
            </p>
          </div>

          <div className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Details</h3>
            
            {/* Display account data */}
            {Object.entries(accountData).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleProceedToDashboard}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bdsec hover:bg-bdsec/90 dark:bg-indigo-600 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec dark:focus:ring-indigo-500 transition-colors"
            >
              {t('auth.verifyAccount')}
              <ChevronRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <FileText className="mx-auto h-12 w-12 text-bdsec dark:text-indigo-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.enterYourRegisterNumber')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.registerHelpText', { country: country || 'your country' })}
          </p>
        </div>

        <div>
          <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('auth.registerNumber')}
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="registerNumber"
              id="registerNumber"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-bdsec focus:border-bdsec dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. АА00112233"
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={!registerNumber || isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bdsec hover:bg-bdsec/90 disabled:bg-gray-400 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec dark:focus:ring-indigo-500 transition-colors"
          >
            {isLoading ? t('common.loading') : t('auth.verifyAccount')}
            {!isLoading && <ChevronRight className="ml-2 h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
} 