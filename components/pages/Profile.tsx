'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserAccountInformation, getAccountStatusRequest, checkInvoiceStatus, type UserAccountResponse } from '@/lib/api'
import { User, ShieldCheck, X, Mail, Phone, Flag, Calendar, AlertTriangle, CheckCircle, XCircle, CreditCard, Clock, RefreshCw } from 'lucide-react'
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = Cookies.get('auth_token') || Cookies.get('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
        
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
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Account status data:', statusResponse.data);
          }
        }
        
        if (invoiceResponse.success && invoiceResponse.data) {
          setInvoiceData(invoiceResponse.data)
          
          if (process.env.NODE_ENV === 'development') {
            console.log('Invoice data:', invoiceResponse.data);
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
      const token = Cookies.get('auth_token') || Cookies.get('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
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
  const mcsdStateRequest = khanUser.MCSDStateRequest;
  const registrationFee = khanUser.registrationFee;

  // Helper function to render account status badge
  const renderStatusBadge = (isActive: boolean, type: 'mcsd' | 'broker') => {
    if (isActive) {
      return (
        <div className="flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t(`profile.${type}AccountActive`)}
        </div>
      )
    } else {
      return (
        <div className="flex items-center px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {t(`profile.${type}AccountInactive`)}
        </div>
      )
    }
  }

  // Helper function to check if general info is complete
  const isGeneralInfoComplete = () => {
    return !!accountStatusData || (accountInfo?.khanUser?.MCSDStateRequest === 'SUBMITTED' || accountInfo?.khanUser?.MCSDStateRequest === 'APPROVED');
  }

  // Helper function to check if payment is complete
  const isPaymentComplete = () => {
    return (invoiceData && invoiceData.status === 'PAID') || (accountInfo?.khanUser?.registrationFee && accountInfo.khanUser.registrationFee > 0);
  }
  
  // Helper function to check if accounts are active
  const isAccountActive = (type: 'mcsd' | 'broker') => {
    if (type === 'mcsd') {
      return hasMcsdAccount;
    } else {
      // For broker account, we consider it active if MCSD account is active
      // since they are created together
      return hasMcsdAccount;
    }
  }

  // Helper function to render MCSD state request status
  const renderMcsdStateRequest = () => {
    // First check if we have status from the dedicated endpoint
    const status = accountStatusData?.status;
    
    // Fall back to the accountInfo if no dedicated status
    if (!status && !accountInfo?.khanUser?.MCSDStateRequest) return null;
    
    // Use the most up-to-date status (prefer the dedicated endpoint)
    const mcsdState = status || accountInfo?.khanUser?.MCSDStateRequest;
    
    let statusColor = "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
    let statusIcon = <Clock className="h-5 w-5" />;
    let statusMessage = t('profile.mcsdRequestPending');
    
    if (mcsdState === 'APPROVED') {
      statusColor = "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      statusIcon = <CheckCircle className="h-5 w-5" />;
      statusMessage = t('profile.mcsdRequestApproved');
    } else if (mcsdState === 'REJECTED') {
      statusColor = "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      statusIcon = <XCircle className="h-5 w-5" />;
      statusMessage = t('profile.mcsdRequestRejected');
    }
    
    return (
      <div className={`flex items-center p-3 rounded-lg mt-4 ${statusColor}`}>
        <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
          {statusIcon}
        </div>
        <div className="flex-1">
          <p className="font-medium">{t('profile.accountRequestStatus')}</p>
          <p className="text-sm opacity-80">{statusMessage}</p>
          
          {/* Add navigation button if general info is incomplete but payment is complete */}
          {!isGeneralInfoComplete() && isPaymentComplete() && (
            <Link 
              href="/account-setup/general" 
              className="inline-block mt-2 text-xs font-medium px-3 py-1.5 bg-blue-100 dark:bg-blue-800/50 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {t('profile.completeGeneralInfo')}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Helper function to render registration fee information
  const renderRegistrationFee = () => {
    // First check if we have invoice data
    if (invoiceData) {
      const isPaid = invoiceData.status === 'PAID';
      
      return (
        <div className={`flex items-center p-3 rounded-lg mt-4 ${
          isPaid 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
        }`}>
          <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <p className="font-medium">{t('profile.registrationFee')}</p>
              <button
                onClick={handleCheckInvoice}
                disabled={isCheckingInvoice}
                className="p-1 rounded-full hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingInvoice ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <p className="text-sm opacity-80">
              {isPaid 
                ? t('profile.registrationFeePaid', { amount: invoiceData.amount }) 
                : t('profile.registrationFeeNotPaid')}
            </p>
            {!isPaid && invoiceData.paymentUrl && (
              <a 
                href={invoiceData.paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-xs font-medium px-2 py-1 bg-white/20 dark:bg-black/20 rounded hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
              >
                {t('profile.payNow')}
              </a>
            )}
            
            {/* Add navigation button if payment is complete but general info is incomplete */}
            {isPaid && !isGeneralInfoComplete() && (
              <Link 
                href="/account-setup/general" 
                className="inline-block mt-2 text-xs font-medium px-3 py-1.5 bg-green-100 dark:bg-green-800/50 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors ml-2"
              >
                {t('profile.completeGeneralInfo')}
              </Link>
            )}
          </div>
        </div>
      );
    }
    
    // Fall back to the original registration fee display
    if (registrationFee === null) return null;
    
    return (
      <div className="flex items-center p-3 rounded-lg mt-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
        <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
          <CreditCard className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{t('profile.registrationFee')}</p>
          <p className="text-sm opacity-80">
            {registrationFee > 0 
              ? t('profile.registrationFeePaid', { amount: registrationFee }) 
              : t('profile.registrationFeeNotPaid')}
          </p>
          
          {registrationFee === 0 && (
            <Link 
              href="/account-setup/fee"
              className="inline-block mt-2 text-xs font-medium px-2 py-1 bg-blue-100 dark:bg-blue-800/50 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            >
              {t('profile.payRegistrationFee')}
            </Link>
          )}
          
          {/* Add navigation button if payment is complete but general info is incomplete */}
          {registrationFee > 0 && !isGeneralInfoComplete() && (
            <Link 
              href="/account-setup/general" 
              className="inline-block mt-2 text-xs font-medium px-3 py-1.5 bg-green-100 dark:bg-green-800/50 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors ml-2"
            >
              {t('profile.completeGeneralInfo')}
            </Link>
          )}
        </div>
      </div>
    );
  }
  
  // Helper function to render broker account status
  const renderBrokerAccountStatus = () => {
    // Broker account is active if MCSD account is active (they are created together)
    const hasBrokerAccount = isAccountActive('broker');
    
    return (
      <div className={`flex items-center p-3 rounded-lg ${
        hasBrokerAccount 
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
          : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
      }`}>
        <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
          {hasBrokerAccount 
            ? <CheckCircle className="h-5 w-5" /> 
            : <AlertTriangle className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <p className="font-medium">{t('profile.brokerAccount', 'Broker Account')}</p>
          <p className="text-sm opacity-80">
            {hasBrokerAccount 
              ? t('profile.brokerAccountActiveDetail', 'Your broker account is active and can be used for trading') 
              : t('profile.brokerAccountInactiveDetail', 'You do not have a broker account. This is required for trading.')}
          </p>
          
          {/* Show note that broker account is created with MCSD account */}
          {!hasBrokerAccount && (
            <p className="text-xs mt-1 text-yellow-600 dark:text-yellow-400">
              {t('profile.brokerAccountWithMcsd')}
            </p>
          )}
        </div>
      </div>
    );
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
              <div className="mt-3 flex gap-2">
                {renderStatusBadge(isAccountActive('mcsd'), 'mcsd')}
                {renderStatusBadge(isAccountActive('broker'), 'broker')}
              </div>
            </div>
          </div>
          
          {/* Account Status */}
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="font-medium text-lg mb-4">{t('profile.accountStatus', 'Account Status')}</h3>
            <div className="space-y-4">
              <div className={`flex items-center p-3 rounded-lg ${
                hasMcsdAccount 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                  : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
              }`}>
                <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
                  {hasMcsdAccount 
                    ? <CheckCircle className="h-5 w-5" /> 
                    : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t('profile.mcsdAccount', 'MCSD Account')}</p>
                  <p className="text-sm opacity-80">
                    {hasMcsdAccount 
                      ? t('profile.mcsdAccountActiveDetail', 'Your MCSD account is active and can be used for securities trading') 
                      : t('profile.mcsdAccountInactiveDetail', 'You need an MCSD account to trade securities. Please contact support for assistance.')}
                  </p>
                  
                  {/* Show setup button if MCSD account is not active */}
                  {!hasMcsdAccount && !isGeneralInfoComplete() && (
                    <Link 
                      href="/account-setup/general" 
                      className="inline-block mt-2 text-xs font-medium px-3 py-1.5 bg-yellow-100 dark:bg-yellow-800/50 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                    >
                      {t('profile.setupMcsdAccount')}
                    </Link>
                  )}
                </div>
              </div>
              
              {renderMcsdStateRequest()}
              {renderRegistrationFee()}
              {renderBrokerAccountStatus()}
              
              {!hasMcsdAccount && !mcsdStateRequest && !isPaymentComplete() && (
                <div className="mt-4 p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400">
                  <p className="text-sm font-medium">{t('profile.accountSetupNeeded', 'Account Setup Required')}</p>
                  <p className="text-xs mt-1">{t('profile.accountSetupNeededDetail', 'To trade securities in Mongolia, you need both an MCSD account and a broker account. Start by setting up your MCSD account.')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link 
                      href="/account-setup/general" 
                      className="inline-block px-3 py-2 text-xs font-medium bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                    >
                      {t('profile.setupMcsdAccount', 'Set Up MCSD Account')}
                    </Link>
                    
                    <Link 
                      href="/account-setup/fee" 
                      className="inline-block px-3 py-2 text-xs font-medium bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                    >
                      {t('profile.payRegistrationFee', 'Pay Registration Fee')}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Account Setup Progress */}
            {!hasMcsdAccount && (
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <h4 className="font-medium mb-4">{t('profile.accountSetupProgress', 'Account Setup Progress')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      isPaymentComplete() ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {isPaymentComplete() ? <CheckCircle className="h-4 w-4" /> : '1'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isPaymentComplete() ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {t('profile.payFee', 'Pay Registration Fee')}
                      </p>
                    </div>
                    {!isPaymentComplete() && (
                      <Link 
                        href="/account-setup/fee" 
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        {t('common.start')}
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      isGeneralInfoComplete() ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {isGeneralInfoComplete() ? <CheckCircle className="h-4 w-4" /> : '2'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isGeneralInfoComplete() ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {t('profile.completeGeneralInfo', 'Complete General Information')}
                      </p>
                    </div>
                    {!isGeneralInfoComplete() && (
                      <Link 
                        href="/account-setup/general" 
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          isPaymentComplete() 
                            ? 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40' 
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-not-allowed opacity-60'
                        }`}
                        onClick={e => !isPaymentComplete() && e.preventDefault()}
                      >
                        {isPaymentComplete() ? t('common.start') : t('common.locked')}
                      </Link>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                      isAccountActive('mcsd') ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {isAccountActive('mcsd') ? <CheckCircle className="h-4 w-4" /> : '3'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${isAccountActive('mcsd') ? 'text-green-600 dark:text-green-400' : ''}`}>
                        {t('profile.activateAccounts', 'Activate MCSD & Broker Accounts')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('profile.accountsActivatedTogether')}
                      </p>
                    </div>
                    <div 
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        isGeneralInfoComplete() && isPaymentComplete() 
                          ? 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 cursor-pointer' 
                          : 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      {isGeneralInfoComplete() && isPaymentComplete() ? t('common.processing') : t('common.locked')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Contact Information */}
          <div className="p-6">
            <h3 className="font-medium text-lg mb-4">{t('profile.contactInfo', 'Contact Information')}</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.email', 'Email')}</p>
                  <p>{khanUser.email || t('profile.notProvided', 'Not provided')}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.phone', 'Phone')}</p>
                  <p>{khanUser.phone || t('profile.notProvided', 'Not provided')}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Flag className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.nationality', 'Nationality')}</p>
                  <p>Mongolia</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.memberSince', 'Member Since')}</p>
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