'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { sendRegistrationNumber, digipayLogin, type RegistrationResponse, getRegistrationNumber } from '@/lib/api'
import Cookies from 'js-cookie'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nationality = searchParams.get('nationality') || '496'
  
  const [registerNumber, setRegisterNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [responseStatus, setResponseStatus] = useState<{
    type: 'error' | 'success' | 'warning' | null;
    message: string | null;
    details?: string | null;
  }>({ type: null, message: null })
  
  // Get token on component mount if it doesn't exist
  useEffect(() => {
    const authToken = Cookies.get('auth_token')
    if (authToken) {
      setToken(authToken)
    } else {
      // Get token if it doesn't exist
      const getToken = async () => {
        try {
          const response = await digipayLogin('demo_user_id')
          if (response.success && response.data?.token) {
            Cookies.set('auth_token', response.data.token, { expires: 7 })
            setToken(response.data.token)
          } else {
            // Set a fallback demo token for testing purposes
            const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTE0NDYyOTR9.y4IGXd76fqQcHQlve00vADg_sfuOvL3PKrH0W-05Y4E"
            Cookies.set('auth_token', demoToken, { expires: 7 })
            setToken(demoToken)
            console.log('Using fallback demo token for testing')
          }
        } catch (error) {
          console.error('Error getting token:', error)
          // Set a fallback demo token for testing purposes
          const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTE0NDYyOTR9.y4IGXd76fqQcHQlve00vADg_sfuOvL3PKrH0W-05Y4E"
          Cookies.set('auth_token', demoToken, { expires: 7 })
          setToken(demoToken)
          console.log('Using fallback demo token for testing')
        }
      }
      
      getToken()
    }
  }, [])
  
  // Handle registration number input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterNumber(e.target.value)
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
    
    try {
      const response = await sendRegistrationNumber(registerNumber, nationality, token || undefined)
      
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
      const token = Cookies.get('auth_token');
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
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4">
      <div className="max-w-md mx-auto pt-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-gray-600 dark:text-gray-400 mb-6"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t('common.back')}
        </button>
        
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {t('auth.enterYourRegisterNumber')}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('auth.registerHelpText', { country: nationality })}
        </p>
        
        {renderStatusMessage()}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auth.registerNumber')}
            </label>
            <input
              type="text"
              id="registerNumber"
              value={registerNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500'
              }`}
              placeholder="ӨӨ000000"
              disabled={isLoading || responseStatus.type === 'success'}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || responseStatus.type === 'success'}
            className="w-full px-4 py-3 bg-bdsec dark:bg-indigo-600 text-white rounded-lg font-medium
                     hover:bg-bdsec/90 dark:hover:bg-indigo-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-bdsec dark:focus:ring-indigo-500
                     disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
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
  )
} 