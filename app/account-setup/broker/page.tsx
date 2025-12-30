'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Info } from 'lucide-react'
import Link from 'next/link'


export default function AccountSetupBrokerPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isMcsdActive, setIsMcsdActive] = useState(false)
  
  // Check if MCSD account is active
  useEffect(() => {
    // This is a placeholder. In a real implementation, we would check the MCSD status
    // For now, we'll assume it's not active
    setIsMcsdActive(false)
  }, [])
  
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-32">
      <div className="max-w-md mx-auto pt-8 px-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {t('profile.setupBrokerAccount')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('profile.accountSetup')}
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 pb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
            <Info className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <div>
              <p className="text-blue-700 dark:text-blue-400">
                {t('profile.bothAccountsCreated')}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-500 mt-2">
                {t('profile.brokerSetupInfo')}
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('profile.accountSetupProgress')}
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {t('profile.payFee')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.completed')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {t('profile.generalInfo')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.completed')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-white">
                  <div className="h-5 w-5 flex items-center justify-center">3</div>
                </div>
                <div className="ml-4">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">
                    {t('profile.activateAccounts')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('profile.accountsActivatedTogether')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between">
              <Link
                href="/profile"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
              >
                <ArrowLeft className="inline-block mr-1 h-4 w-4" /> {t('profile.backToProfile')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 