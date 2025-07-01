'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserAccountInformation, getAccountStatusRequest, checkInvoiceStatus, type UserAccountResponse } from '@/lib/api'
import { User, X, Mail, Phone, Flag, Calendar, AlertTriangle, CheckCircle, XCircle, CreditCard, Clock, RefreshCw } from 'lucide-react'
import Cookies from 'js-cookie'
import Link from 'next/link'

const Profile = () => {
  const { t } = useTranslation()
  const [accountInfo, setAccountInfo] = useState<UserAccountResponse['data'] | null>(null)
  const [accountStatusData, setAccountStatusData] = useState<any>(null)
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingInvoice, setIsCheckingInvoice] = useState(false)
  // Check if general info is completed from sessionStorage
  const [generalInfoCompleted, setGeneralInfoCompleted] = useState<boolean>(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
        
        // Fetch account info, status request, and invoice status in parallel
        const [accountResponse, statusResponse, invoiceResponse] = await Promise.all([
          getUserAccountInformation(token),
          getAccountStatusRequest(token),
          checkInvoiceStatus(token)
        ]);
        
        if (accountResponse.success && accountResponse.data) {
          setAccountInfo(accountResponse.data)
        } else {
          setError(accountResponse.message || t('profile.fetchError'))
        }
        
        if (statusResponse.success && statusResponse.data) {
          setAccountStatusData(statusResponse.data)
        }
        
        if (invoiceResponse.success && invoiceResponse.data) {
          setInvoiceData(invoiceResponse.data)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(t('profile.fetchError'))
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [t])
  
  useEffect(() => {
    // Check session storage for completed general info
    if (typeof window !== 'undefined') {
      const accountSetupData = sessionStorage.getItem('accountSetupData');
      if (accountSetupData) {
        try {
          const parsedData = JSON.parse(accountSetupData);
          const hasGeneralInfo = parsedData.firstName && parsedData.lastName && 
                                (parsedData.registerNumber || parsedData.childRegisterNumber);
          setGeneralInfoCompleted(hasGeneralInfo);
        } catch (e) {
          setGeneralInfoCompleted(false);
        }
      }
    }
  }, []);
  
  // Listen for account setup data changes
  useEffect(() => {
    const handleAccountSetupChange = () => {
      if (typeof window !== 'undefined') {
        const accountSetupData = sessionStorage.getItem('accountSetupData');
        if (accountSetupData) {
          try {
            const parsedData = JSON.parse(accountSetupData);
            const hasGeneralInfo = parsedData.firstName && parsedData.lastName && 
                                  (parsedData.registerNumber || parsedData.childRegisterNumber);
            setGeneralInfoCompleted(hasGeneralInfo);
          } catch (e) {
            setGeneralInfoCompleted(false);
          }
        }
      }
    };
    
    window.addEventListener('accountSetupDataChanged', handleAccountSetupChange);
    return () => {
      window.removeEventListener('accountSetupDataChanged', handleAccountSetupChange);
    };
  }, []);
  
  // Function to check invoice status
  const handleCheckInvoice = async () => {
    setIsCheckingInvoice(true)
    try {
      const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
      const response = await checkInvoiceStatus(token)
      
      if (response.success && response.data) {
        setInvoiceData(response.data)
      }
    } catch (err) {
      console.error('Error checking invoice status:', err)
    } finally {
      setIsCheckingInvoice(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-bdsec border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 my-4">
        <div className="flex">
          <X className="h-5 w-5 text-red-500 dark:text-red-400 mr-3 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!accountInfo || !accountInfo.khanUser) {
    return (
      <div className="text-center py-10">
        <p>{t('profile.noProfileFound')}</p>
      </div>
    )
  }

  const { khanUser, MCSDAccount } = accountInfo;
  const hasMcsdAccount = MCSDAccount !== null;

  // Simplified completion checks - check both sessionStorage and API status
  const isGeneralInfoComplete = () => {
    // Complete if we have data in sessionStorage OR actual account status data with proper status
    const apiComplete = accountStatusData && accountStatusData.status && 
           ['SUBMITTED', 'PAID', 'APPROVED', 'COMPLETED'].includes(accountStatusData.status);
    const sessionComplete = generalInfoCompleted;
    
    // Check if we have account status data based on actual API response structure
    const hasDirectAccountData = accountStatusData && (
      (accountStatusData.FirstName && accountStatusData.LastName) || // API uses PascalCase
      (accountStatusData.firstName && accountStatusData.lastName) || // Fallback to camelCase
      accountStatusData.RegistryNumber || accountStatusData.registerNumber || // Has registration number
      accountStatusData.id // Has account status record ID
    );
    
    // Check if we have account data from the nested structure (from accountInfo.khanUser.MCSDStateRequest)
    const mcsdRequest = accountInfo?.khanUser?.MCSDStateRequest as any;
    const hasNestedAccountData = mcsdRequest && typeof mcsdRequest === 'object' && (
      (mcsdRequest.FirstName && mcsdRequest.LastName) ||
      mcsdRequest.RegistryNumber ||
      mcsdRequest.id
    );
    
    console.log('Profile DEBUG:', {
      accountStatusData,
      accountInfo,
      mcsdRequest,
      hasDirectAccountData,
      hasNestedAccountData,
      sessionComplete,
      apiComplete,
      finalResult: sessionComplete || apiComplete || hasDirectAccountData || hasNestedAccountData
    });

    
    return sessionComplete || apiComplete || hasDirectAccountData || hasNestedAccountData;
  }

  const isPaymentComplete = () => {
    // Only complete if invoice is actually paid
    return invoiceData && invoiceData.status === 'PAID';
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 md:px-6 py-6">
        <h1 className="text-xl font-bold mb-6">{t('profile.title', 'My Profile')}</h1>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-bdsec to-bdsec/80 dark:from-indigo-600 dark:to-indigo-800 p-6">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-bdsec dark:text-indigo-400" />
              </div>
              <h2 className="text-white text-xl font-bold">
                {khanUser.firstName} {khanUser.lastName}
              </h2>
              <p className="text-white/80 mt-1">{khanUser.register}</p>
            </div>
          </div>
          
          {/* Simplified Account Status - Only for users without MCSD account */}
          {!hasMcsdAccount && (
            <div className="p-6 border-b dark:border-gray-700">
              <h3 className="font-medium text-lg mb-4">Данын төлөв</h3>
              
              {/* State 1: Not registered - Create MCSD account */}
              <div className="flex items-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 mb-4">
                <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Та манай дээр бүртгэлгүй байна - Та ҮЦТХТ-ийн данс үүсгэнэ үү?</p>
                </div>
              </div>

              {/* State 2: Account opening fee not paid */}
              {!isPaymentComplete() && (
                <div className="flex items-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 mb-4">
                  <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Данс нээх хураамж төлөөгүй</p>
                      <button
                        onClick={handleCheckInvoice}
                        disabled={isCheckingInvoice}
                        className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                      >
                        <RefreshCw className={`h-4 w-4 ${isCheckingInvoice ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    {invoiceData && invoiceData.paymentUrl && (
                      <a 
                        href={invoiceData.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-xs font-medium px-3 py-1.5 bg-orange-100 dark:bg-orange-800/50 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                      >
                        Төлбөр төлөх
                      </a>
                    )}
                    {!invoiceData && (
                      <Link 
                        href="/account-setup/fee"
                        className="inline-block mt-2 text-xs font-medium px-3 py-1.5 bg-orange-100 dark:bg-orange-800/50 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
                      >
                        Хураамж төлөх
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Account Opening Process Section */}
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <h4 className="font-medium mb-4">Данс нээх явц</h4>
                <div className="space-y-4">
                  
                  {/* Step 1: General Information */}
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                      isGeneralInfoComplete() ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {isGeneralInfoComplete() ? <CheckCircle className="h-5 w-5" /> : '1'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isGeneralInfoComplete() ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        Ерөнхий мэдээлэл
                      </p>
                    </div>
                    {!isGeneralInfoComplete() && (
                      <Link 
                        href="/account-setup/general" 
                        className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        Эхлэх
                      </Link>
                    )}
                  </div>

                  {/* Step 2: Account Opening Fee */}
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                      isPaymentComplete() ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {isPaymentComplete() ? <CheckCircle className="h-5 w-5" /> : '2'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isPaymentComplete() ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        Данс нээх хураамж
                      </p>
                    </div>
                    {!isPaymentComplete() && (
                      <Link 
                        href="/account-setup/fee" 
                        className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        Эхлэх
                      </Link>
                    )}
                  </div>

                  {/* Step 3: Account Activation */}
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${
                      hasMcsdAccount ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {hasMcsdAccount ? <CheckCircle className="h-5 w-5" /> : '3'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${hasMcsdAccount ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        ҮЦТХТ-ийн данс, брокерийн данс идэвхижүүлэх
                      </p>
                    </div>
                    <div className={`text-xs px-3 py-1.5 rounded transition-colors ${
                      isGeneralInfoComplete() && isPaymentComplete() 
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 opacity-60'
                    }`}>
                      {isGeneralInfoComplete() && isPaymentComplete() ? 'Боловсруулж байна' : 'Түгжээтэй'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show success message for users with MCSD account */}
          {hasMcsdAccount && (
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Таны ҮЦТХТ болон брокерийн данс идэвхитэй байна</p>
                  <p className="text-sm opacity-80">Та цаасны арилжаа хийх боломжтой</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          <div className="p-6">
            <h3 className="font-medium text-lg mb-4">Холбоо барих мэдээлэл</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">И-мэйл</p>
                  <p>{khanUser.email || 'Өгөөгүй'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Утас</p>
                  <p>{khanUser.phone || 'Өгөөгүй'}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Flag className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Иргэншил</p>
                  <p>Монгол</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Элссэн огноо</p>
                  <p>{new Date(accountInfo.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile 