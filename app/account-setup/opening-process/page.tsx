'use client'

import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import Cookies from 'js-cookie'
import { BASE_URL, getUpdateMCSDStatus, getUserAccountInformation } from '@/lib/api'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AccountFixFormMCSD from './AccountFixFormMCSD'

export default function AccountOpeningProcess() {
  const router = useRouter()
  const { t } = useTranslation()
  const [status, setStatus] = useState<'loading' | 'waiting_submission' | 'waiting_approval' | 'error' | 'success'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [accountData, setAccountData] = useState<any>(null)
  const [newRegNumber, setNewRegNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mcsdIsError, setMcsdIsError] = useState(false)
  const token = Cookies.get('token') 
  const handleUpdateRegistryNumber = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRegNumber) return
    
    // Show confirmation dialog
    const confirmed = window.confirm(t('profile.registryUpdateWarning', 'Анхааруулга: Регистрийн дугаар солих үйлдлийг буцаах боломжгүй. Та итгэлтэй байна уу?'))
    if (!confirmed) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`${BASE_URL}/user/update-registration-number`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ registrationNumber: newRegNumber })
      })
       
      const data = await response.json()
      console.log("data", data)

      if (response.ok) {
        //hard refresh
        window.location.reload()
        return;
    
      } else {
        const stillDuplicate=data.message==="Registry number is duplicated"
        if(stillDuplicate){
          alert(t('profile.registryDuplicate', 'Энэ регистрийн дугаар дээр бүртгэлтэй байна.'))
          setShowForm(false)
          return
        }
        setErrorMessage(data.message || t('common.error.generic', 'Алдаа гарлаа'))
      }
    } catch (error) {
      console.error('Error:', error)
      setErrorMessage(t('common.error.generic', 'Алдаа гарлаа'))
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleOpenAccountError = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/resend-form-to-mcsd`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log("data opening",data)
      if (response.ok) {
        alert(t('profile.resendSuccess', 'Амжилттай илгээгдлээ. Та түр хүлээнэ үү.'));
        window.location.reload();
      } else {
        alert(t('profile.resendError', 'Алдаа гарлаа. Дахин оролдоно уу.'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(t('profile.resendError', 'Алдаа гарлаа. Дахин оролдоно уу.'));
    }
  };

  const handleRegNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRegNumber(e.target.value.toUpperCase())
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserAccountInformation(token)
        console.log('Fetched Account Data:', data)
        console.log('MCSD Accounts:', data.data?.superAppAccounts)
        setAccountData(data.data)
        const accounts = data.data?.superAppAccounts || [];
        const primary = accounts.find((a: any) => a.registerConfirmed) || accounts[0];
        const latestFee = primary?.registrationFees?.[0];
        if (!primary || !primary?.registrationFees || primary.registrationFees.length === 0) {
          router.replace('/account-setup/general')
          return
        }
        if(accounts.some((a: any) => !!a.MCSDAccountId)){
          window.alert(t('profile.accountCreatedSuccess', 'Таны данс амжилттай үүссэн байна'))
          router.push('/')
          return
        }

        // ҮЦТХТ-д илгээгдэлгүй алдаа заасан
        if (!accounts.some((a: any) => !!a.MCSDAccountId) && latestFee?.mcsdError ) {
          
          setStatus('error')
          setErrorMessage(latestFee.mcsdError || t('common.error.generic'))
          return
        }
        if(!accounts.some((a: any) => !!a.MCSDAccountId) && latestFee?.status === "COMPLETED"){
          alert(t('profile.sendingToMCSD', 'Таны мэдээллийг ҮЦТХТ-рүү илгээж байна. Түр хүлээгээд дахин оролдоно уу.'))
          router.push('/account-setup/fee')
          return
        }
        // Success case: Account is approved
        // If accountId exists we already returned; otherwise continue

        // Step 1: Fee paid but not sent to MCSD
        if (latestFee?.status === 'COMPLETED' && !accounts.some((a: any) => !!a.MCSDAccountId)) {
       
          setStatus('waiting_submission')
          return
        }

        // Step 2: Try updating from backend status endpoint
        if (!accounts.some((a: any) => !!a.MCSDAccountId)) {
          const mcsdStatus=await getUpdateMCSDStatus(token!)
          console.log("mcsdStatus",mcsdStatus)
          if(mcsdStatus.success){
            if(mcsdStatus.accountOpened){
            setStatus('success')
              alert("Таны данс амжилттай нээгдлээ")
              router.push('/')
              return
            }
            else{
              const mcsdIsErrorValue = false
              
              console.log("mcsdIsError",mcsdIsErrorValue)
              setMcsdIsError(mcsdIsErrorValue)
              // alert(mcsdStatus.message)
              setStatus('waiting_approval')
              return
            }
          }
          else{

            alert(mcsdStatus.message)
            router.push('/account-setup/general')
            return
            // setStatus('error')
          }
          return
        }
     

        router.replace('/account-setup/general')
      } catch (error) {
        console.error('Error fetching account status:', error)
        setStatus('error')
        setErrorMessage(t('common.error.generic', 'Алдаа гарлаа. Дахин оролдоно уу.'))
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
                <Clock className={`h-6 w-6 ${mcsdIsError ? 'text-red-500' : 'text-blue-500'}`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {mcsdIsError ? t('profile.waitingApprovalError', 'Таны мэдээлэл алдаатай байна') : t('profile.waitingApproval', 'Таны мэдээллийг шалгаж байна')}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {!mcsdIsError &&t('profile.waitingApprovalDesc', 'ҮЦТХТ таны мэдээллийг шалгаж байна. Энэ хугацаанд та түр хүлээнэ үү.')}
                </p>
              </div>
            </div>
            {accountData?.MCSDAccount?.ErrorMessage && (
              <div className='p-4 w-full bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600'>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('profile.mcsdMessage', 'ҮЦТХТ мэдэгдэл')}</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {accountData?.MCSDAccount?.ErrorMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-3 h-3 ${mcsdIsError ? 'bg-red-500' : 'bg-blue-500'} rounded-full`} />
                <span>{t('profile.underReview', 'Шалгаж байна')}</span>
              </div>
            </div>
            {mcsdIsError && (
              <div className="mt-6">
                {!isEditMode ? (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (window.confirm('Та мэдээллээ шинэчлэхийг хүсэж байна уу? Энэ үйлдлийг буцаах боломжгүй.')) {
                          setIsEditMode(true);
                        }
                      }}
                      className="px-4 py-2 bg-bdsec text-white rounded-md hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-bdsec focus:ring-offset-2 transition-colors"
                    >
                      {t('profile.update', 'Засварлах')}
                    </button>
                  </div>
                ) : (
                  <AccountFixFormMCSD token={token!}/>
                )}
              </div>
            )}
          </div>
        )
        //There are two type of errors
        //1. Registry number is duplicated. Add an quickform to change the registry number
        //2. BDCId and BDCAcc is duplicated. We already tried 10times of sending it. so for now it is a dead-end we can't fix. Please manually check it.
      case 'error':
       {const ResponseMessage=accountData?.khanUser?.registrationFee?.mcsdError
        const match = ResponseMessage.match(/"([A-Za-z]+)"/);
        const isRegistryError=(match&&match[1]==="RegistryNumber")
        let regId = null
        if(isRegistryError){
          const matches = ResponseMessage.match(/"([\u0400-\u04FF0-9A-Za-z-]+)"/g);
          regId = matches?.[matches.length - 1]?.replace(/"/g, "");
          console.log("regId",regId)
        }
        console.log("regId",regId)
         return (
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {isRegistryError&&regId ? `${regId} дугаартай регистер өмнө нь илгээгдсэн байна.` : t('profile.accountOpeningError')}
                </h3>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errorMessage || t('common.error.generic')}
                </p>
                <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>{isRegistryError&&regId ? `${regId} дугаартай регистер өмнө нь илгээгдсэн байна. Та регистрийн дугаараа зөв оруулсан эсэхээ шалгаарай. Хэрэв буруу оруулсан бол регистрийн дугаараа зөв оруулна уу. Регистрийн дугаар зөв бол та аль хэдийн БиДиСЕК үнэт цаасны компанитай холбогдоно уу.` : `Дахин оролдоно уу.`}</p>
               {regId&& isRegistryError&& <div>
                 <button
                    onClick={() => setShowForm(!showForm)}
                    className="disabled  mt-4 inline-flex items-center text-sm font-medium text-red-500 hover:text-red-500/80"
                  >
                    {t('profile.updateInformation')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
               </div>
                }
                {regId && isRegistryError && showForm && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <form onSubmit={handleUpdateRegistryNumber} className="space-y-4">
                        <div>
                          <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('profile.newRegistryNumber', 'Шинэ регистрийн дугаар')}
                          </label>
                          <div className="mt-1 relative">
                            <input
                              type="text"
                              id="regNumber"
                              name="regNumber"
                              value={newRegNumber}
                              onChange={handleRegNumberChange}
                              placeholder={t('profile.registryPlaceholder', 'ТЕ12345678')}
                              className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200 text-base tracking-wider font-medium focus:border-bdsec focus:ring-2 focus:ring-bdsec/20 focus:outline-none"
                              maxLength={10}
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-gray-400 dark:text-gray-500 text-sm">{t('profile.registryShort', 'РД')}</span>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('profile.registryExample', 'Жишээ: ТЕ12345678')}
                          </p>
                        </div>
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => router.push('/account-setup/general')}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec"
                          >
                            {t('common.back', 'Буцах')}
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !newRegNumber}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-bdsec hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? t('common.sending', 'Илгээж байна...') : t('common.send', 'Илгээх')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
                {!isRegistryError && (
                  <div className="mt-6 flex justify-start">
                    <button
                      onClick={handleOpenAccountError}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-bdsec hover:bg-bdsec/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {t('profile.resendForm', 'Дахин илгээх')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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