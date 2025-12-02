'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { getRegistrationNumber } from '@/lib/api'
import Cookies from 'js-cookie'

interface RegistrationGuardProps {
  children: React.ReactNode
}

export default function RegistrationGuard({ children }: RegistrationGuardProps) {
  const [isChecking, setIsChecking] = useState(true)
  const [hasRegistration, setHasRegistration] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { i18n } = useTranslation()

  // Skip registration check for auth pages
  const isAuthPage = pathname?.startsWith('/auth/') || pathname?.startsWith('/api/')

  useEffect(() => {
    // Skip registration check for auth pages
    if (isAuthPage) {
      setIsChecking(false)
      setHasRegistration(true)
      return
    }

    const checkRegistration = async () => {
      try {
        const token = Cookies.get('token');

        if (!token) {
          // No token found, allow user to browse the site (testing/guest mode)
          setHasRegistration(true);
          setIsChecking(false);
          return;
        }

        // Token found, check for registration number
        const response = await getRegistrationNumber(token);

        if (response.success && response.registerNumber) {
          // User is registered
          setHasRegistration(true);
        } else {
          // User is not registered, redirect to complete registration
          router.push('/auth/nationality');
          return;
        }
      } catch (error) {
        console.error('Error checking registration:', error);
        // On error (e.g., invalid token), redirect to registration
        router.push('/auth/nationality');
        return;
      } finally {
        setIsChecking(false);
      }
    }

    checkRegistration()
  }, [router, isAuthPage])

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bdsec dark:border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {i18n.language === 'mn' ? 'Шалгаж байна...' : 'Checking...'}
          </p>
        </div>
      </div>
    )
  }

  // Only render children if user has registration
  return hasRegistration ? <>{children}</> : null
} 