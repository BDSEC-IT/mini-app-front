'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react'
import { sendRegistrationNumber, digipayLogin, type RegistrationResponse, getRegistrationNumber, BASE_URL } from '@/lib/api'
import Cookies from 'js-cookie'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nationality = searchParams.get('nationality') || '496'
  
  const [registerNumber, setRegisterNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<{
    type: 'error' | 'success' | 'warning' | null;
    message: string | null;
    details?: string | null;
  }>({ type: null, message: null })
  const [countries, setCountries] = useState<{ countryCode: string, countryName: string }[]>([])
  const [selectedCountry, setSelectedCountry] = useState<{ countryCode: string, countryName: string } | null>(null)
  
  // Get token on component mount if it doesn't exist

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const url = `${BASE_URL}/helper/countries`
        const response = await fetch(url)
        const data = await response.json()
        const countriesData = data.data || []
        setCountries(countriesData)
        
        // Find the selected country
        const country = countriesData.find((c: any) => c.countryCode === nationality)
        setSelectedCountry(country || null)
      } catch (error) {
        console.error('Error fetching countries:', error)
      }
    }
    
    fetchCountries()
  }, [nationality])

  // Function to get appropriate placeholder based on nationality
  const getPlaceholder = () => {
    if (nationality === '496') {
      // Mongolia - use Mongolian registration number format
      return 'AX01234567'
    } else {
      // Other countries - use descriptive text
      return t('auth.enterRegisterNumber', 'Enter your register number')
    }
  }
  
  // Handle registration number input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterNumber(e.target.value.toUpperCase())
    setError(null)
    setResponseStatus({ type: null, message: null })
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!registerNumber.trim()) {
      setError(t('auth.registerNumberRequired'))
      return
    }
    
    setIsLoading(true)
    setError(null)
    setResponseStatus({ type: null, message: null })
    
    // Always get the token from the cookie right before the API call
    const cookieToken = Cookies.get('token');
    console.log('Token from cookie:', cookieToken);
    if (!cookieToken) {
      setError('No token found in cookies. Please log in again.');
      setIsLoading(false);
      return;
    }
    try {
      const response = await sendRegistrationNumber(registerNumber, cookieToken)
      
      if (response.success) {
        // Handle different success cases
        let message = t('auth.registrationSuccess')
        let details = null
        
        if (response.data?.mcsdStateRequest === 'PENDING') {
          message = t('auth.mcsdRequestPending')
          details = t('auth.mcsdRequestPendingDetails')
        } else if (response.data?.mcsdStateRequest === 'APPROVED') {
          message = t('auth.mcsdRequestApproved')
          details = t('auth.mcsdRequestApprovedDetails')
        } else if (response.data?.successType === 'MCSD_ACCOUNT_CREATED') {
          message = t('auth.mcsdAccountCreated')
          details = t('auth.mcsdAccountCreatedDetails')
        } else if (response.data?.successType === 'USER_UPDATED') {
          message = t('auth.userUpdated')
          details = t('auth.userUpdatedDetails')
        } else if (response.data?.successType === 'USER_CREATED') {
          message = t('auth.userCreated')
          details = t('auth.userCreatedDetails')
        }
        
        setResponseStatus({ 
          type: 'success', 
          message, 
          details 
        })
        
        // Wait for 2 seconds before redirecting to profile page
        setTimeout(() => {
            window.location.href = '/profile';
            return;
          router.push('/profile')
        }, 2000)
      } else {
        // Handle different error cases
        switch (response.errorCode) {
          case 'NOT_PERMITTED':
            setResponseStatus({ 
              type: 'error',
              message: t('auth.notPermitted'),
              details: t('auth.notPermittedDetails')
            })
            break
          case 'USER_NOT_FOUND':
            setResponseStatus({ 
              type: 'error',
              message: t('auth.accountNotFound'),
              details: t('auth.accountNotFoundDetails')
            })
            break
          case 'MCSD_ALREADY_CREATED':
            setResponseStatus({ 
              type: 'warning',
              message: t('auth.mcsdAlreadyCreated'),
              details: t('auth.mcsdAlreadyCreatedDetails')
            })
            // Still allow navigation to profile since user has an account
            setTimeout(() => {
              router.push('/profile')
            }, 2000)
            break
          case 'NAME_MISMATCH':
            setResponseStatus({ 
              type: 'error',
              message: t('auth.namesMismatch'),
              details: t('auth.namesMismatchDetails')
            })
            break
          case 'MCSD_CONNECTION_ERROR':
            setResponseStatus({ 
              type: 'error',
              message: t('auth.mcsdConnectionError'),
              details: t('auth.mcsdConnectionErrorDetails')
            })
            break
          default:
            setError(response.message || t('auth.verificationFailed'))
        }
      }
    } catch (error) {
      console.error('Error verifying account:', error)
      setError(t('auth.verificationFailed'))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Render the appropriate status message
  const renderStatusMessage = () => {
    if (!responseStatus.type) return null
    
    const statusIcons = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      error: <XCircle className="h-5 w-5 text-red-500" />,
      warning: <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
    
    const statusColors = {
      success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-700 dark:text-green-400',
      error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-400',
      warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'
    }
    
    return (
      <div className={`border rounded-lg p-4 my-4 ${statusColors[responseStatus.type]}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5 mr-3">
            {statusIcons[responseStatus.type]}
          </div>
          <div>
            <p className="font-medium">{responseStatus.message}</p>
            {responseStatus.details && (
              <p className="mt-1 text-sm opacity-90">{responseStatus.details}</p>
            )}
            {responseStatus.type === 'success' && (
              <div className="mt-2 flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                <span className="text-sm">{t('auth.redirectingToProfile')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  useEffect(() => {
    const checkRegister = async () => {
      const token = Cookies.get('token');
      if (token) {
        const regRes = await getRegistrationNumber(token);
        if (regRes.registerNumber) {
          router.replace('/account-setup/general');
        }
      }
    };
    checkRegister();
  }, []);
  
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background accents */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-bdsec/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 max-w-md mx-auto p-4 sm:p-6 lg:p-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 dark:text-gray-400 mb-5"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t('common.back')}
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <ShieldCheck className="h-6 w-6 text-bdsec dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('auth.enterYourRegisterNumber')}
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {t('auth.registerHelpText', { country: selectedCountry?.countryName || nationality })}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 shadow-xl backdrop-blur-md p-4 sm:p-6">
          {renderStatusMessage()}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.registerNumber')}
              </label>
              <input
                type="text"
                id="registerNumber"
                value={registerNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
                }`}
                placeholder={getPlaceholder()}
                disabled={isLoading || responseStatus.type === 'success'}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || responseStatus.type === 'success'}
              className="w-full px-4 py-3 bg-bdsec dark:bg-indigo-600 text-white rounded-lg font-medium hover:bg-bdsec/90 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec dark:focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  {t('common.loading')}
                </div>
              ) : (
                t('auth.verifyAccount')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 