'use client'

import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import Cookies from 'js-cookie'
import { BASE_URL } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type IStockAccountStatus =
  | 'NOT_SENT'
  | 'NEW'
  | 'SENT'
  | 'INFO_RECEIVED'
  | 'INFO_REJECTED'
  | 'CONFIRM'
  | 'CONFIRMED'

export default function AccountOpeningProcess() {
  const router = useRouter()
  const { t } = useTranslation()
  const [status, setStatus] = useState<'loading' | 'waiting_submission' | 'waiting_approval' | 'error' | 'success'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [istockStatus, setIstockStatus] = useState<IStockAccountStatus | null>(null)
  const token = Cookies.get('token')

  useEffect(() => {
    const fetchIstockStatus = async () => {
      if (!token) {
        setStatus('error')
        setErrorMessage(t('common.error.generic', 'Алдаа гарлаа. Дахин оролдоно уу.'))
        return
      }

      try {
        const response = await fetch(`${BASE_URL}/istockApp/account/check?source=superapp`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()
        console.log('ISTOCK account check response', data)

        if (!response.ok || !data?.success) {
          setStatus('error')
          setErrorMessage(data?.message || t('common.error.generic', 'Алдаа гарлаа. Дахин оролдоно уу.'))
          return
        }

        const rawStatus: IStockAccountStatus | undefined = data?.data?.accountStatus?.status
        if (!rawStatus) {
          // If we don't get a clear status, treat as not sent and redirect to general setup
          router.replace('/account-setup/general')
          return
        }
        setIstockStatus(rawStatus)

        switch (rawStatus) {
          case 'NOT_SENT':
            // No account / no request yet – send user back to general setup
            router.replace('/account-setup/general')
            break

          case 'NEW':
            // Request prepared, broker should send – similar to "waiting to be submitted"
            setStatus('waiting_submission')
            break

          case 'SENT':
          case 'INFO_RECEIVED':
            // Request sent / info received – under review at depository
            setStatus('waiting_approval')
            break

          case 'INFO_REJECTED':
            // Rejected on depository side
            setStatus('error')
            setErrorMessage(
              t(
                'profile.accountOpeningRejected',
                'Таны данс нээх хүсэлт ҮЦТХТ дээр саатсан байна.',
              ),
            )
            break

          case 'CONFIRM':
          case 'CONFIRMED':
            // Account successfully opened (and possibly with online rights)
            setStatus('success')
            window.alert(t('profile.accountCreatedSuccess', 'Таны данс амжилттай үүссэн байна'))
            router.push('/')
            break

          default:
            setStatus('error')
            setErrorMessage(t('common.error.generic', 'Алдаа гарлаа. Дахин оролдоно уу.'))
        }
      } catch (error) {
        console.error('Error fetching ISTOCK account status:', error)
        setStatus('error')
        setErrorMessage(t('common.error.generic', 'Алдаа гарлаа. Дахин оролдоно уу.'))
      }
    }

    fetchIstockStatus()
  }, [router, t, token])

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bdsec mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">{t('common.loading', 'Уншиж байна...')}</p>
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
                  {t('profile.waitingSubmission', 'Таны мэдээллийг илгээхэд бэлэн болж байна')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.waitingSubmissionDesc', 'Таны мэдээллийг ҮЦТХТ-рүү илгээхэд бэлэн болж байна. Түр хүлээнэ үү.')}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>{t('profile.processingTime', '1-2 минут')}</span>
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
                  {t('profile.waitingApproval', 'Таны мэдээллийг шалгаж байна')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.waitingApprovalDesc', 'ҮЦТХТ таны мэдээллийг шалгаж байна. Энэ хугацаанд та түр хүлээнэ үү.')}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>{t('profile.underReview', 'Шалгаж байна')}</span>
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
                  {t('profile.accountOpeningError', 'Данс нээх хүсэлт саатлаа')}
                </h3>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errorMessage || t('common.error.generic', 'Алдаа гарлаа. Дахин оролдоно уу.')}
                </p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {istockStatus && (
                    <span className="inline-block rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 px-2 py-0.5 text-xs font-medium mr-2">
                      {istockStatus}
                    </span>
                  )}
                  {t('profile.accountOpeningErrorHint', 'Таны мэдээлэл буруу тул түр саатлаа. Брокертой холбоо барина уу.')}
                </p>
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
                  {t('profile.accountOpeningSuccess', 'Таны данс амжилттай нээгдлээ')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.accountOpeningSuccessDesc', 'Таны данс амжилттай нээгдлээ. Та одоо арилжаанд оролцох боломжтой боллоо.')}
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="mt-4 inline-flex items-center text-sm font-medium text-bdsec hover:text-bdsec/80"
                >
                  {t('profile.goToDashboard', 'Нүүр хуудас руу очих')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-2xl min-h-screen mx-auto p-4 sm:p-6 lg:p-8">
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