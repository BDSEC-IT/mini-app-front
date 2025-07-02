'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CreditCard } from 'lucide-react'
import Cookies from 'js-cookie'
import { createOrRenewInvoice, getAccountStatusRequest } from '@/lib/api'

export default function FeePaymentPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsProcessing(true)
    setError(null)
    const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token')

    if (!token) {
      setError("Authentication token not found. Please log in again.")
      setIsProcessing(false)
      return
    }

    try {
      // First, validate that account status request has all required fields
      const statusResponse = await getAccountStatusRequest(token);
      if (!statusResponse.success || !statusResponse.data) {
        setError("Failed to get account status. Please complete your account setup first.");
        alert("Алдаа: Дансны мэдээлэл олдсонгүй. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
        setIsProcessing(false);
        return;
      }

      const accountData = statusResponse.data;
      
      // Debug: Log the actual account data structure
      console.log('=== FEE PAGE ACCOUNT STATUS DEBUG ===');
      console.log('Account data:', accountData);
      console.log('Account data keys:', Object.keys(accountData || {}));
      console.log('Backend validation:', (statusResponse.data as any)?.validation);
      console.log('=== END DEBUG ===');
      
      // Trust the backend's validation if it exists
      const backendValidation = (statusResponse.data as any)?.validation;
      if (backendValidation && backendValidation.isValid === false) {
        console.error('Backend validation failed:', backendValidation);
        setError("Account setup is incomplete. Please complete your account setup first.");
        alert("Алдаа: Дансны мэдээлэл бүрэн бөгөөгүй байна. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
        setIsProcessing(false);
        return;
      }
      
      // Fallback validation only if backend doesn't provide validation
      if (!backendValidation) {
        // Check for required fields - if any are null, account status creation failed
        // Check both PascalCase and camelCase field names since backend might return either
        const requiredFields = [
          { pascalCase: 'FirstName', camelCase: 'firstName' },
          { pascalCase: 'LastName', camelCase: 'lastName' },
          { pascalCase: 'RegistryNumber', camelCase: 'registryNumber' },
          { pascalCase: 'MobilePhone', camelCase: 'mobilePhone' },
          { pascalCase: 'Gender', camelCase: 'gender' },
          { pascalCase: 'BirthDate', camelCase: 'birthDate' },
          { pascalCase: 'HomeAddress', camelCase: 'homeAddress' },
          { pascalCase: 'BankCode', camelCase: 'bankCode' },
          { pascalCase: 'BankAccountNumber', camelCase: 'bankAccountNumber' },
          { pascalCase: 'Country', camelCase: 'country' } // Backend returns 'Country' field
        ];
        
        const missingFields = requiredFields.filter(field => {
          const pascalValue = accountData[field.pascalCase];
          const camelValue = accountData[field.camelCase];
          const value = pascalValue !== undefined ? pascalValue : camelValue;
          return value === null || value === undefined || value === '';
        });

        if (missingFields.length > 0) {
          console.error('Account status validation failed. Missing fields:', missingFields);
          console.error('Account data:', accountData);
          setError("Account setup is incomplete. Some required fields are missing. Please complete your account setup first.");
          alert("Алдаа: Дансны мэдээлэл бүрэн бөгөөгүй байна. Зарим талбарууд хоосон байна. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
          setIsProcessing(false);
          return;
        }
      }

      // Debug: Test token with a known working endpoint first
      console.log('=== TOKEN TEST DEBUG ===');
      console.log('Testing token with getAccountStatusRequest first...');
      const testResponse = await getAccountStatusRequest(token);
      console.log('Token test result:', testResponse.success ? 'SUCCESS' : 'FAILED');
      console.log('=== END TOKEN TEST ===');

      // If all validations pass, proceed with invoice creation
      const result = await createOrRenewInvoice(token)
      if (result.success) {
        // Extract the orderId from the response - try different possible structures
        let orderId = null;
        
        // Try direct access first
        if (result.data?.orderId) {
          orderId = result.data.orderId;
        }
        // Try nested data structure
        else if (result.data?.data?.orderId) {
          orderId = result.data.data.orderId;
        }
        // Try if data is the orderId directly
        else if (typeof result.data === 'string' && result.data.startsWith('http')) {
          orderId = result.data;
        }
        
        if (orderId) {
          // Show success message and redirect to Digipay
          alert('Нэхэмжлэл амжилттай үүслээ. Digipay төлбөрийн хуудас руу шилжиж байна...');
          
          // Ensure the URL uses HTTPS instead of HTTP
          let secureUrl = orderId;
          if (secureUrl.startsWith('http:')) {
            secureUrl = secureUrl.replace('http:', 'https:');
          }
          
          // Redirect to the Digipay order URL using assign() for better history management
          window.location.assign(secureUrl);
        } else {
          // Fallback if orderId is missing
          console.error("Failed to extract orderId from invoice response:", result);
          alert('Нэхэмжлэл амжилттай үүслээ, гэхдээ төлбөрийн хуудас олдсонгүй. Та банкны апп-аасаа төлбөрөө гүйцэтгэнэ үү.');
          router.push('/profile');
        }
      } else {
        setError(result.message || "Failed to create payment invoice.")
      }
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const checkAccountStatus = async () => {
      const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token');
      if (!token) return;
      const statusResponse = await getAccountStatusRequest(token);
      if (!statusResponse.success || !statusResponse.data) {
        alert('Та эхлээд ерөнхий мэдээллээ бүрэн бөглөнө үү.');
        router.replace('/account-setup/general');
        return;
      }
      const accountData = statusResponse.data;
      
      // Trust the backend's validation if it exists
      const backendValidation = (statusResponse.data as any)?.validation;
      if (backendValidation && backendValidation.isValid === false) {
        alert('Та эхлээд ерөнхий мэдээллээ бүрэн бөглөнө үү.');
        router.replace('/account-setup/general');
        return;
      }
      
      // Fallback validation only if backend doesn't provide validation
      if (!backendValidation) {
        const requiredFields = [
          { pascalCase: 'FirstName', camelCase: 'firstName' },
          { pascalCase: 'LastName', camelCase: 'lastName' },
          { pascalCase: 'RegistryNumber', camelCase: 'registryNumber' },
          { pascalCase: 'MobilePhone', camelCase: 'mobilePhone' },
          { pascalCase: 'Gender', camelCase: 'gender' },
          { pascalCase: 'BirthDate', camelCase: 'birthDate' },
          { pascalCase: 'HomeAddress', camelCase: 'homeAddress' },
          { pascalCase: 'BankCode', camelCase: 'bankCode' },
          { pascalCase: 'BankAccountNumber', camelCase: 'bankAccountNumber' },
          { pascalCase: 'Country', camelCase: 'country' }
        ];
        const missingFields = requiredFields.filter(field => {
          const pascalValue = accountData[field.pascalCase];
          const camelValue = accountData[field.camelCase];
          const value = pascalValue !== undefined ? pascalValue : camelValue;
          return value === null || value === undefined || value === '';
        });
        if (missingFields.length > 0) {
          alert('Та эхлээд ерөнхий мэдээллээ бүрэн бөглөнө үү.');
          router.replace('/account-setup/general');
        }
      }
    };
    checkAccountStatus();
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {t('profile.accountFee', 'Данс нээх хураамж')}
        </h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        <div className="text-center p-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('profile.paymentRequired', 'Нэхэмжлэл үүсгэх')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('profile.paymentFeeDescription', 'Данс нээлтийн хураамж 5,000₮-ийн нэхэмжлэлийг үүсгэж, төлбөрөө төлнө үү.')}
          </p>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CreditCard className="h-5 w-5" />
            {isProcessing 
              ? t('profile.processing', 'Боловсруулж байна...') 
              : t('profile.createInvoice', 'Нэхэмжлэл үүсгэх (5,000₮)')}
          </button>
        </div>
      </div>
    </div>
  )
} 