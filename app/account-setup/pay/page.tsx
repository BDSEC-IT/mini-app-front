'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import { createOrRenewInvoice, getAccountStatusRequest } from '@/lib/api';
import { AlertCircle } from 'lucide-react';

export default function PayPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token');
      if (!token) {
        setError("Та нэвтрээгүй байна. Нэвтэрч дахин оролдоно уу.");
        setTimeout(() => router.push('/auth/nationality'), 3000);
        return;
      }

      try {
        // First, validate that account status request has all required fields
        const statusResponse = await getAccountStatusRequest(token);
        if (!statusResponse.success || !statusResponse.data) {
          setError("Дансны мэдээлэл олдсонгүй. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
          setTimeout(() => router.push('/account-setup/general'), 3000);
          return;
        }

        const accountData = statusResponse.data;
        
        // Check for required fields - if any are null, account status creation failed
        const requiredFields = [
          'FirstName', 'LastName', 'RegistryNumber', 'MobilePhone', 'Gender', 
          'BirthDate', 'HomeAddress', 'BankCode', 'BankAccountNumber'
        ];
        
        const missingFields = requiredFields.filter(field => {
          const value = accountData[field];
          return value === null || value === undefined || value === '';
        });

        if (missingFields.length > 0) {
          console.error('Account status validation failed. Missing fields:', missingFields);
          console.error('Account data:', accountData);
          setError("Дансны мэдээлэл бүрэн бөгөөгүй байна. Зарим талбарууд хоосон байна. Эхлээд дансны мэдээллээ бүрэн бөглөнө үү.");
          setTimeout(() => router.push('/account-setup/general'), 3000);
          return;
        }

        // If all validations pass, proceed with invoice creation
        const invoiceResponse = await createOrRenewInvoice(token);
        if (invoiceResponse.success && invoiceResponse.data?.paymentUrl) {
          window.location.href = invoiceResponse.data.paymentUrl;
        } else {
          setError(invoiceResponse.message || "Төлбөрийн нэхэмжлэх үүсгэхэд алдаа гарлаа. Та дахин оролдоно уу.");
        }
      } catch (err) {
        setError("Төлбөрийн системтэй холбогдоход алдаа гарлаа.");
      }
    };

    processPayment();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 text-center p-4">
      {error ? (
        <div className="w-full max-w-md">
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            </div>
            <button onClick={() => router.push('/profile')} className="text-sm text-bdsec dark:text-indigo-400 hover:underline">
                Профайл руу буцах
            </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-bdsec dark:border-indigo-500 border-t-transparent rounded-full mb-6"></div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Төлбөрийн систем рүү шилжиж байна...</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Түр хүлээнэ үү.</p>
        </div>
      )}
    </div>
  );
} 