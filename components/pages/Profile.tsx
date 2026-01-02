'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserAccountInformation, getAccountStatusRequest, checkInvoiceStatus, hasActiveMCSDAccount, getPartnerInfo, type UserAccountResponse, type PartnerInfo } from '@/lib/api'
import { User, X, Mail, Phone, Flag, Calendar, AlertTriangle, CheckCircle, XCircle, CreditCard, Clock, RefreshCw, UserCheck } from 'lucide-react'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { SpotlightCard } from "@/components/ui/spotlight-card";

const Profile = () => {
  const { t } = useTranslation()
  const [accountInfo, setAccountInfo] = useState<UserAccountResponse['data'] | null>(null)
  const [accountStatusData, setAccountStatusData] = useState<any>(null)
  const [invoiceData, setInvoiceData] = useState<any>(null)
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null)
  const [kycStatus, setKycStatus] = useState<'none' | 'pending' | 'confirmed'>('none')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingInvoice, setIsCheckingInvoice] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = Cookies.get('token')
        
        // Fetch account info, status request, invoice status, and partner info in parallel
        const [accountResponse, statusResponse, invoiceResponse, partnerResponse] = await Promise.all([
          getUserAccountInformation(token),
          getAccountStatusRequest(token!),
          checkInvoiceStatus(token!),
          token ? getPartnerInfo(token) : Promise.resolve({ success: false, data: null })
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
        } else {
          console.warn('Invoice status check failed or returned no data:', invoiceResponse)
          // Don't set error here - invoice data is optional, we can use accountInfo instead
        }
        
        // Set partner info and KYC status
        if (partnerResponse.success && partnerResponse.data && partnerResponse.data.length > 0) {
          const partner = partnerResponse.data[0]; // Get the first partner info
          setPartnerInfo(partner)
          if (partner.state === 'confirmed') {
            setKycStatus('confirmed')
          } else if (partner.state === 'pending') {
            setKycStatus('pending')
          }
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
  

  
  // Function to check invoice status
  const handleCheckInvoice = async () => {
    setIsCheckingInvoice(true)
    try {
      const token = Cookies.get('token')
      const response = await checkInvoiceStatus(token!)
      
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
        <div className="animate-spin h-8 w-8 border-4 border-bdsec dark:border-indigo-500 border-t-transparent rounded-full"></div>
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

  if (!accountInfo || !accountInfo.superAppAccount) {
    return (
      <div className="text-center py-10">
        <p>{t('profile.noProfileFound')}</p>
      </div>
    )
  }

  const primary = accountInfo.superAppAccount;
  // CRITICAL: Only consider account active if DGStatus === 'COMPLETED'
  const hasActiveMcsdAccount = hasActiveMCSDAccount(accountInfo);
  // Check if user has any MCSD account (including PENDING) - for showing step 3
  const hasMcsdAccountId = !!primary?.MCSDAccountId || !!primary?.MCSDAccount;
  const hasMcsdAccount = hasActiveMcsdAccount; // Keep for backward compatibility

  // Check if user has entered registration number
  const hasRegistrationNumber = () => {
    // Check primary account register field
    if (primary?.register && primary.register.trim() !== '') {
      return true;
    }
    
    // Check account status data
    if (accountStatusData) {
      if (accountStatusData.RegistryNumber && accountStatusData.RegistryNumber.trim() !== '') {
        return true;
      }
      if (accountStatusData.registerNumber && accountStatusData.registerNumber.trim() !== '') {
        return true;
      }
    }
    
    // Check nested MCSD request
    const mcsdRequest = primary?.MCSDStateRequest as any;
    if (mcsdRequest && typeof mcsdRequest === 'object') {
      if (mcsdRequest.RegistryNumber && mcsdRequest.RegistryNumber.trim() !== '') {
        return true;
      }
    }
    
    return false;
  }

  // Simplified completion checks - only use backend API data
  const isGeneralInfoComplete = () => {
    // Complete if we have actual account status data with proper status
    const apiComplete = accountStatusData && accountStatusData.status && 
           ['SUBMITTED', 'PAID', 'APPROVED', 'COMPLETED'].includes(accountStatusData.status);
    
    // Check if we have account status data based on actual API response structure
    const hasDirectAccountData = accountStatusData && (
      (accountStatusData.FirstName && accountStatusData.LastName) || // API uses PascalCase
      (accountStatusData.firstName && accountStatusData.lastName) || // Fallback to camelCase
      accountStatusData.RegistryNumber || accountStatusData.registerNumber || // Has registration number
      accountStatusData.id // Has account status record ID
    );
    
    // Check if we have account data from the nested structure (from superAppAccount.MCSDStateRequest)
    const mcsdRequest = primary?.MCSDStateRequest as any;
    const hasNestedAccountData = mcsdRequest && typeof mcsdRequest === 'object' && (
      (mcsdRequest.FirstName && mcsdRequest.LastName) ||
      mcsdRequest.RegistryNumber ||
      mcsdRequest.id
    );
    
    return apiComplete || hasDirectAccountData || hasNestedAccountData;
  }

  const isPaymentComplete = () => {
    // Check registration fee status from accountInfo (primary source)
    // Fallback to invoiceData if accountInfo doesn't have it
    const feeStatus = primary?.registrationFee?.status;
    const invoiceFeeStatus = invoiceData?.data?.registrationFee?.status || invoiceData?.registrationFee?.status;
    
    return feeStatus === 'COMPLETED' || invoiceFeeStatus === 'COMPLETED';
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 px-4">{t('profile.title', 'My Profile')}</h1>
        
        {/* Profile Card */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600 mr-4">
                <User className="h-8 w-8 text-bdsec dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">
                  {primary?.firstName} {primary?.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{primary?.register}</p>
              </div>
            </div>
          </div>
          
          {/* Account Status */}
          <div className="p-6">
            <h3 className="font-semibold text-base mb-4">{t('profile.accountStatus')}</h3>
            {hasActiveMcsdAccount ? (
              <div className="flex items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="font-medium text-sm">{t('profile.mcsdAccountActiveDetail')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {!hasRegistrationNumber() ? (
                  // Show only begin step if no registration number
                  <>
                    <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                      <p className="font-medium text-sm">{t('profile.registrationNumberRequired', 'Үнэт цаасны данс нээхийн тулд эхлээд регистрийн дугаараа оруулна уу')}</p>
                    </div>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center mr-4 bg-gray-200 dark:bg-gray-700">
                        0
                      </div>
                      <p className="font-medium">{t('profile.enterRegistrationNumber', 'Регистрийн дугаар оруулах')}</p>
                      <Link href="/auth/nationality" className="ml-auto text-xs px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        {t('profile.begin', 'Эхлэх')}
                      </Link>
                    </div>
                  </>
                ) : (
                  // Show normal steps only if registration number exists
                  <>
                    {!hasMcsdAccountId && (
                      <div className="flex items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50">
                        <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                        <p className="font-medium text-sm">{t('profile.mcsdAccountNeededDetail')}</p>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${isGeneralInfoComplete() ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {isGeneralInfoComplete() ? <CheckCircle className="h-5 w-5" /> : '1'}
                      </div>
                      <p className={`font-medium ${isGeneralInfoComplete() ? 'text-green-600 dark:text-green-400' : ''}`}>{t('profile.generalInfo')}</p>
                      {!isGeneralInfoComplete() && (
                        <Link href="/account-setup/general" className="ml-auto text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded">{t('profile.completeGeneralInfo')}</Link>
                      )}
                    </div>
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${isPaymentComplete() ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {isPaymentComplete() ? <CheckCircle className="h-5 w-5" /> : '2'}
                      </div>
                      <p className={`font-medium ${isPaymentComplete() ? 'text-green-600 dark:text-green-400' : ''}`}>{t('profile.accountFee')}</p>
                      {!isPaymentComplete() && (
                        <Link href="/account-setup/fee" className="ml-auto text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded">{t('profile.payFee')}</Link>
                      )}
                    </div>
                    {isPaymentComplete() && hasMcsdAccountId && !hasActiveMcsdAccount && (
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center mr-4 bg-orange-500 text-white">
                          <Clock className="h-5 w-5" />
                        </div>
                        <p className="font-medium text-orange-600 dark:text-orange-400">{t('profile.openingProcess', 'Данс нээх үйл явц')}</p>
                        <Link href="/account-setup/opening-process" className="ml-auto text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded">
                          {t('profile.viewProcess', 'Харах')}
                        </Link>
                      </div>
                    )}
                    {isPaymentComplete() && !hasMcsdAccountId && (
                      <div className="flex items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
                        <p className="font-medium text-sm">{t('profile.waitingAccountCreation', 'Данс үүсгэгдэж байна...')}</p>
                        <Link href="/account-setup/opening-process" className="ml-auto text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded">
                          {t('profile.viewProcess', 'Харах')}
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Online Client Status - Only show if user has active MCSD account */}
          {hasActiveMcsdAccount && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-base mb-4">{t('profile.onlineClientStatus', 'Онлайн харилцагч')}</h3>
              {kycStatus === 'confirmed' ? (
                <div className="flex items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('profile.onlineClientConfirmed', 'Баталгаажсан')}</p>
                    <p className="text-xs mt-0.5 opacity-80">{t('profile.onlineClientConfirmedDesc', 'Та онлайнаар арилжаа хийх боломжтой')}</p>
                  </div>
                </div>
              ) : kycStatus === 'pending' ? (
                <div className="flex items-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Clock className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('profile.onlineClientPending', 'Хүлээгдэж байна')}</p>
                    <p className="text-xs mt-0.5 opacity-80">{t('profile.onlineClientPendingDesc', 'Таны хүсэлт шалгагдаж байна')}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  <UserCheck className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{t('profile.onlineClientNotStarted', 'Бүртгэлгүй')}</p>
                    <p className="text-xs mt-0.5 opacity-80">{t('profile.onlineClientNotStartedDesc', 'Онлайн харилцагч болохын тулд KYC бөглөнө үү')}</p>
                  </div>
                  <Link href="/account-setup/kyc-additional-info" className="ml-auto text-xs px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                    {t('profile.completeKyc', 'Бөглөх')}
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Contact Information */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-base mb-4">{t('profile.contactInfo')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-start">
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
                  <p className="font-medium">{primary?.email || t('profile.notProvided')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.phone')}</p>
                  <p className="font-medium">{primary?.phone || t('profile.notProvided')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Flag className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.nationality')}</p>
                  <p className="font-medium">{t('profile.mongolian')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.memberSince')}</p>
                  <p className="font-medium">{new Date(accountInfo.createdAt).toLocaleDateString()}</p>
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