'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bankInfoSchema, mongolianBanks, BankInfoFormData } from '@/lib/schemas'
import FormField from '@/components/ui/FormField'
import { ArrowLeft, Check, AlertCircle, CreditCard, ExternalLink, RefreshCw } from 'lucide-react'
import { submitAccountSetup, getAccountStatusRequest, createOrRenewInvoice, checkInvoiceStatus } from '@/lib/api'
import Cookies from 'js-cookie'

export default function AccountSetupFeePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingBankInfo, setIsSubmittingBankInfo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previousData, setPreviousData] = useState<any>(null)
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [invoiceStatus, setInvoiceStatus] = useState<string | null>(null)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [bankInfoSubmitted, setBankInfoSubmitted] = useState(false)
  
  const methods = useForm<BankInfoFormData>({
    resolver: zodResolver(bankInfoSchema),
    defaultValues: {
      bankCode: '',
      bankName: '',
      accountNumber: '',
    }
  })
  
  // Load previous form data from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('accountSetupData')
      if (savedData) {
        setPreviousData(JSON.parse(savedData))
      } else {
        // If no previous data, redirect back to the first step
        router.push('/account-setup/general')
      }
    }
  }, [router])
  
  // Function to create or renew invoice
  const handleCreateInvoice = async () => {
    setIsCreatingInvoice(true)
    setError(null)
    
    try {
      // Get token from cookie
      const token = Cookies.get('auth_token') || Cookies.get('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
      
      const response = await createOrRenewInvoice(token)
      
      if (response.success && response.data) {
        setInvoiceData(response.data)
        setSuccess(t('profile.invoiceCreated'))
        // Start polling for invoice status
        pollInvoiceStatus(token)
      } else {
        setError(response.message || t('profile.invoiceCreateError'))
      }
    } catch (err) {
      console.error('Error creating invoice:', err)
      setError(t('profile.invoiceCreateError'))
    } finally {
      setIsCreatingInvoice(false)
    }
  }
  
  // Function to check invoice status
  const checkStatus = async () => {
    setIsCheckingStatus(true)
    
    try {
      const token = Cookies.get('auth_token') || Cookies.get('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
      
      const response = await checkInvoiceStatus(token)
      
      if (response.success && response.data) {
        setInvoiceStatus(response.data.status)
        
        // If paid, show success message
        if (response.data.status === 'PAID') {
          setSuccess(t('profile.invoicePaid'))
        }
        
        return response.data.status
      } else {
        console.error('Failed to check invoice status:', response.message)
        return null
      }
    } catch (err) {
      console.error('Error checking invoice status:', err)
      return null
    } finally {
      setIsCheckingStatus(false)
    }
  }
  
  // Poll for invoice status
  const pollInvoiceStatus = async (token: string) => {
    let attempts = 0
    const maxAttempts = 10
    const interval = 3000 // 3 seconds
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.log('Max polling attempts reached')
        return
      }
      
      attempts++
      const status = await checkStatus()
      
      if (status === 'PAID') {
        console.log('Invoice paid!')
        // Stop polling
      } else if (status === 'PENDING' || status === 'CREATED') {
        // Continue polling
        setTimeout(poll, interval)
      }
    }
    
    // Start polling
    poll()
  }
  
  // Submit bank account information
  const submitBankInfo = async (data: BankInfoFormData) => {
    if (!previousData) {
      setError(t('profile.formError'))
      return
    }
    
    setIsSubmittingBankInfo(true)
    setError(null)
    
    try {
      // Combine all form data
      const combinedData = {
        ...previousData,
        ...data,
        // Add bank name if not provided
        bankName: data.bankName || mongolianBanks.find(bank => bank.code === data.bankCode)?.name || '',
      }
      
      // Get token from cookie
      const token = Cookies.get('auth_token') || Cookies.get('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
      
      // Submit the form data
      const response = await submitAccountSetup(combinedData, token)
      
      if (response.success) {
        setSuccess(t('profile.bankInfoSuccess'))
        setBankInfoSubmitted(true)
        
        // Verify the request was created by checking the status
        try {
          const statusResponse = await getAccountStatusRequest(token);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Account status verification response:', statusResponse);
          }
          
          if (!statusResponse.success || !statusResponse.data) {
            console.warn('Account status request verification failed, but proceeding anyway');
          }
        } catch (verifyError) {
          console.error('Error verifying account status request:', verifyError);
          // Continue with the success flow even if verification fails
        }
      } else {
        // Handle specific error codes
        if (response.errorCode === 'PARSE_ERROR') {
          setError(t('profile.serverError'))
        } else if (response.errorCode === 'TIMEOUT') {
          setError(t('profile.requestTimeout'))
        } else if (response.errorCode === 'NETWORK_ERROR') {
          setError('Сүлжээний алдаа. Интернет холболтоо шалгаад дахин оролдоно уу.')
        } else {
          setError(response.message || t('profile.formError'))
        }
      }
    } catch (err) {
      console.error('Error submitting form:', err)
      setError('Сүлжээний алдаа. Интернет холболтоо шалгаад дахин оролдоно уу.')
    } finally {
      setIsSubmittingBankInfo(false)
    }
  }
  
  // Complete the entire account setup process
  const completeAccountSetup = async () => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Clear session storage since we're done with the setup
      sessionStorage.removeItem('accountSetupData')
      
      setSuccess(t('profile.accountSetupSuccess'))
      
      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        router.push('/profile')
      }, 2000)
    } catch (err) {
      console.error('Error completing account setup:', err)
      setError(t('profile.accountSetupError'))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle form submission
  const onSubmit = async (data: BankInfoFormData) => {
    await submitBankInfo(data);
  }
  
  // Handle back button
  const handleBack = () => {
    router.push('/account-setup/general')
  }
  
  // Render progress indicator
  const renderProgress = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bdsec dark:bg-indigo-600 text-white">
            <Check className="h-5 w-5" />
          </div>
          <div className="flex-1 h-1 mx-2 bg-bdsec dark:bg-indigo-600"></div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bdsec dark:bg-indigo-600 text-white">
            2
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-300 dark:bg-gray-700"></div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            3
          </div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.generalInfo')}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.bankInfo')}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('profile.accountFee')}</span>
        </div>
      </div>
    )
  }
  
  // Render invoice section
  const renderInvoiceSection = () => {
    if (!invoiceData && !invoiceStatus) {
      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-4">
            <CreditCard className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
            <p className="text-blue-700 dark:text-blue-400 font-medium">
              {t('profile.createInvoicePrompt')}
            </p>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
            {t('profile.bothAccountsCreated')}
          </p>
          <button
            type="button"
            onClick={handleCreateInvoice}
            disabled={isCreatingInvoice || !bankInfoSubmitted}
            className={`w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              (isCreatingInvoice || !bankInfoSubmitted) ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isCreatingInvoice ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                {t('profile.creatingInvoice')}
              </>
            ) : (
              t('profile.createInvoice')
            )}
          </button>
          
          {!bankInfoSubmitted && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 text-center">
              {t('profile.submitBankInfoFirst')}
            </p>
          )}
        </div>
      )
    }
    
    // If we have invoice data
    if (invoiceData) {
      return (
        <div className={`p-4 rounded-lg mb-6 ${
          invoiceStatus === 'PAID' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <CreditCard className={`h-6 w-6 mr-3 ${
                invoiceStatus === 'PAID' 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-yellow-500 dark:text-yellow-400'
              }`} />
              <p className={`font-medium ${
                invoiceStatus === 'PAID' 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                {invoiceStatus === 'PAID' 
                  ? t('profile.invoicePaid') 
                  : t('profile.invoicePending')}
              </p>
            </div>
            
            <button
              type="button"
              onClick={checkStatus}
              disabled={isCheckingStatus}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`h-5 w-5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('profile.invoiceNumber')}</span>
              <span className="text-sm font-medium">{invoiceData.invoiceNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('profile.amount')}</span>
              <span className="text-sm font-medium">{invoiceData.amount?.toLocaleString() || '-'} ₮</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('profile.status')}</span>
              <span className={`text-sm font-medium ${
                invoiceStatus === 'PAID' 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {invoiceStatus === 'PAID' 
                  ? t('profile.statusPaid') 
                  : t('profile.statusPending')}
              </span>
            </div>
          </div>
          
          {invoiceData.paymentUrl && invoiceStatus !== 'PAID' && (
            <a
              href={invoiceData.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
            >
              {t('profile.payNow')} <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          )}
          
          {invoiceStatus === 'PAID' && (
            <button
              type="button"
              onClick={completeAccountSetup}
              disabled={isSubmitting}
              className={`w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                  {t('profile.completing')}
                </>
              ) : (
                t('profile.completeSetup')
              )}
            </button>
          )}
        </div>
      )
    }
    
    return null
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-32">
      <div className="max-w-md mx-auto pt-8 px-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          {t('profile.accountFee')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('profile.accountSetup')}
        </p>
        
        {renderProgress()}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <Check className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0" />
              <p className="text-green-700 dark:text-green-400">{success}</p>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 pb-8 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
              <CreditCard className="h-6 w-6 text-blue-500 dark:text-blue-400 mr-3" />
              <p className="text-blue-700 dark:text-blue-400">
                {t('profile.registrationFeeInfo')}
              </p>
            </div>
            
            {/* Bank Information Section */}
            <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              {t('profile.bankInfo')}
            </h3>
            
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                <div className="mb-4">
                  <label htmlFor="bankCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('profile.selectBank')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="bankCode"
                    {...methods.register('bankCode')}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      methods.formState.errors.bankCode
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    disabled={bankInfoSubmitted}
                  >
                    <option value="">{t('profile.selectBank')}</option>
                    {mongolianBanks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                  {methods.formState.errors.bankCode && (
                    <p className="mt-1 text-sm text-red-500">
                      {methods.formState.errors.bankCode.message}
                    </p>
                  )}
                </div>
                
                <FormField
                  name="accountNumber"
                  label={t('profile.accountNumber')}
                  required
                  disabled={bankInfoSubmitted}
                />
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    disabled={bankInfoSubmitted}
                  >
                    <ArrowLeft className="inline-block mr-1 h-4 w-4" /> {t('profile.back')}
                  </button>
                  
                  {!bankInfoSubmitted && (
                    <button
                      type="submit"
                      disabled={isSubmittingBankInfo}
                      className={`px-4 py-2 bg-bdsec dark:bg-indigo-600 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
                        isSubmittingBankInfo ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmittingBankInfo ? (
                        <>
                          <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                          {t('profile.submitting')}
                        </>
                      ) : (
                        t('profile.submitBankInfo')
                      )}
                    </button>
                  )}
                </div>
              </form>
            </FormProvider>
            
            {/* Invoice Section - only show after bank info is submitted */}
            {bankInfoSubmitted && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                  {t('profile.paymentSection')}
                </h3>
                {renderInvoiceSection()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 