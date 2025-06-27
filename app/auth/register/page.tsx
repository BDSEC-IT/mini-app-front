'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const country = searchParams.get('country')
  const [registerNumber, setRegisterNumber] = useState('')

  const handleNext = () => {
    if (registerNumber) {
      // Here you would typically handle the authentication logic,
      // for now, we'll just redirect to the dashboard.
      console.log({
        country,
        registerNumber,
      })
      router.push('/')
    }
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
        </div>

        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={!registerNumber}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bdsec hover:bg-bdsec/90 disabled:bg-gray-400 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec dark:focus:ring-indigo-500 transition-colors"
          >
            {t('common.finish')}
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 