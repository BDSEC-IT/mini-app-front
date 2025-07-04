'use client'

import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import Cookies from 'js-cookie'
import { getUserAccountInformation } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountOpeningProcess() {
  const router = useRouter()
  const { t } = useTranslation()
  const [status, setStatus] = useState<'loading' | 'waiting_submission' | 'waiting_approval' | 'error' | 'success'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserAccountInformation(token)
        console.log("Account opening process data:", data)

        if (!data.data?.khanUser?.registrationFee) {
          router.replace('/account-setup/general')
          return
        }

        // Error case: MCSD returned with error message
        if (data.data?.khanUser?.registrationFee?.status ) {
          setStatus('error')
          setErrorMessage(data.data.khanUser.registrationFee.mcsdError || t('common.error.generic'))
          return
        }

        // Success case: Account is approved
        if (data.data?.MCSDAccount?.approved === "COMPLETED") {
          setStatus('success')
          return
        }

        // Step 1: Fee paid but not sent to MCSD
        if (data.data?.khanUser?.registrationFee?.status === 'COMPLETED' && !data.data?.MCSDAccount) {
          setStatus('waiting_submission')
          return
        }

        // Step 2: Sent to MCSD but waiting approval
        if (data.data?.MCSDAccount && data.data?.MCSDAccount?.approved !== "COMPLETED") {
          setStatus('waiting_approval')
          return
        }

        router.replace('/account-setup/general')
      } catch (error) {
        console.error('Error fetching account status:', error)
        setStatus('error')
        setErrorMessage(t('common.error.generic', 'Something went wrong. Please try again later.'))
      }
    }
    fetchData()
  }, [router, t, token])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bdsec mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        )

      case 'waiting_submission':
        return (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('profile.waitingSubmission')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.waitingSubmissionDesc')}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>{t('profile.processingTime')}</span>
              </div>
            </div>
          </div>
        )

      case 'waiting_approval':
        return (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('profile.waitingApproval')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.waitingApprovalDesc')}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>{t('profile.underReview')}</span>
              </div>
            </div>
          </div>
        )

      case 'error':
        return (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('profile.accountOpeningError')}
                </h3>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errorMessage || t('common.error.generic')}
                </p>
                <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>Та регистрийн дугаараа зөв оруулсан эсэхээ шалгаарай. Хэрэв буруу оруулсан бол регистрийн дугаараа зөв оруулна уу. Регистрийн дугаар зөв бол та аль хэдийн БиДиСЕКд үнэт цаасны данстай байна.</p>
                <button
                  onClick={() => router.push('/account-setup/general')}
                  className="disabled mt-4 inline-flex items-center text-sm font-medium text-red-500 hover:text-red-500/80"
                >
                  {t('profile.updateInformation')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )

      case 'success':
        return (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('profile.accountOpeningSuccess')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.accountOpeningSuccessDesc')}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 inline-flex items-center text-sm font-medium text-bdsec hover:text-bdsec/80"
                >
                  {t('profile.goToDashboard')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          {t('profile.accountOpeningProcess')}
        </h1>
        
        <div className="space-y-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
} 