'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getUserAccountInformation, getAccountStatusRequest, checkInvoiceStatus, type UserAccountResponse } from '@/lib/api'
import { User, X, Mail, Phone, Flag, Calendar, AlertTriangle, CheckCircle, XCircle, CreditCard, Clock, RefreshCw } from 'lucide-react'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingInvoice, setIsCheckingInvoice] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = Cookies.get('token')
        
        // Fetch account info, status request, and invoice status in parallel
        const [accountResponse, statusResponse, invoiceResponse] = await Promise.all([
          getUserAccountInformation(token),
          getAccountStatusRequest(token!),
          checkInvoiceStatus(token!)
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

  if (!accountInfo || !accountInfo.khanUser) {
    return (
      <div className="text-center py-10">
        <p>{t('profile.noProfileFound')}</p>
      </div>
    )
  }

  const { khanUser, MCSDAccount } = accountInfo;
  const hasMcsdAccount = MCSDAccount !== null;
  const hasActiveMcsdAccount = MCSDAccount?.DGOrder === 'COMPLETED';

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
      apiComplete,
      finalResult: apiComplete || hasDirectAccountData || hasNestedAccountData
    });

    
    return apiComplete || hasDirectAccountData || hasNestedAccountData;
  }

  const isPaymentComplete = () => {
    // Only complete if invoice is actually paid
    console.log('invoiceData', invoiceData);
    //console.log("rad",invoiceData.data.registrationFee?.status)
    return invoiceData && invoiceData.data && invoiceData.data.registrationFee?.status === 'COMPLETED';
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
                  {khanUser.firstName} {khanUser.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{khanUser.register}</p>
              </div>
            </div>
          </div>
          
          {/* Account Status */}
          <div className="p-6">
            <h3 className="font-semibold text-base mb-4">{t('profile.accountStatus')}</h3>
            {!hasMcsdAccount ? (
              <div className="space-y-4">
                <div className="flex items-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p className="font-medium text-sm">{t('profile.mcsdAccountNeededDetail')}</p>
                </div>
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
              </div>
            ) : (
              hasActiveMcsdAccount ? (
              <div className="flex items-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="font-medium text-sm">{t('profile.mcsdAccountActiveDetail')}</p>
              </div>
              ) : (
                <div className="flex flex-col gap-2">
                <div className="flex items-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                  <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p className="font-medium text-sm">Таны мэдээлэл ҮЦТХТ-д шалгагдаж байна</p>
                </div>
                <div className="flex justify-end">
                  <Link
                  href="/account-setup/opening-process"
                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-800 rounded"
                  >
                    Данс нээх үйл явцийг харах
                  </Link>
                </div>
              </div>
              
              )
            )}
          </div>
          
          {/* Contact Information */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-base mb-4">{t('profile.contactInfo')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div className="flex items-start">
                <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.email')}</p>
                  <p className="font-medium">{khanUser.email || t('profile.notProvided')}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('profile.phone')}</p>
                  <p className="font-medium">{khanUser.phone || t('profile.notProvided')}</p>
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