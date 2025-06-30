'use client'

import { useEffect, useState } from 'react'
import {
  X,
  Home,
  BarChart3,
  HelpCircle,
  FileText,
  Building,
  LogIn,
  Sun,
  Moon,
  PieChart,
  User,
  CircleCheck,
  CircleAlert,
  CircleDashed,
  CreditCard,
  UserCircle
} from 'lucide-react'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import LanguageToggle from '../ui/LanguageToggle'
import { getUserAccountInformation, getAccountStatusRequest, type UserAccountResponse } from '@/lib/api'

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
}

const SideMenu = ({ isOpen, onClose }: SideMenuProps) => {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [accountInfo, setAccountInfo] = useState<UserAccountResponse['data'] | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Check if user is logged in
  useEffect(() => {
    const token = Cookies.get('auth_token')
    setIsLoggedIn(!!token)
    
    if (token) {
      fetchAccountInfo(token)
    }
  }, [])
  
  // Fetch account info
  const fetchAccountInfo = async (token: string) => {
    try {
      setLoading(true)
      const response = await getUserAccountInformation(token)
      if (response.success && response.data) {
        setAccountInfo(response.data)
      }
    } catch (error) {
      console.error('Error fetching account info:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { href: '/', icon: Home, label: 'bottomNav.dashboard' },
    { href: '/stocks', icon: BarChart3, label: 'bottomNav.stocks' },
    { href: '/bonds', icon: FileText, label: 'bottomNav.bonds' },
    { href: '/news', icon: FileText, label: 'menu.news' },
    { href: '/about', icon: Building, label: 'bottomNav.about' },
    { href: '/faq', icon: HelpCircle, label: 'bottomNav.faq' },
  ]
  
  // Helper function to render status icon
  const renderStatusIcon = (isComplete: boolean | null) => {
    if (isComplete === true) {
      return <CircleCheck size={18} className="text-green-500" />
    } else if (isComplete === false) {
      return <CircleAlert size={18} className="text-red-500" />
    } else {
      return <CircleDashed size={18} className="text-gray-400" />
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('.side-menu-content')) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Check if MCSD account setup is needed
  const needsMcsdSetup = isLoggedIn && accountInfo?.khanUser && 
    (!accountInfo.MCSDAccount || accountInfo.khanUser.MCSDStateRequest === 'PENDING' || accountInfo.khanUser.MCSDStateRequest === 'REJECTED');
  
  // Check if general info is completed
  const [generalInfoCompleted, setGeneralInfoCompleted] = useState<boolean | null>(null);
  const [feeInfoCompleted, setFeeInfoCompleted] = useState<boolean | null>(null);
  const [accountStatusRequest, setAccountStatusRequest] = useState<any>(null);
  
  useEffect(() => {
    // Check if general info is completed by looking for stored data
    if (typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('accountSetupData');
      
      // If user is logged in, check the actual status from the API
      if (isLoggedIn) {
        const token = Cookies.get('auth_token');
        fetchAccountStatusRequest(token);
      } else {
        // Fall back to session storage if not logged in
        setGeneralInfoCompleted(!!storedData);
        setFeeInfoCompleted(null);
      }
    }
  }, [isLoggedIn, accountInfo]);
  
  // Fetch account status request
  const fetchAccountStatusRequest = async (token: string | undefined) => {
    try {
      if (!token) {
        console.error('No auth token provided');
        // Fall back to session storage if no token
        const storedData = sessionStorage.getItem('accountSetupData');
        setGeneralInfoCompleted(!!storedData);
        setFeeInfoCompleted(null);
        return;
      }
      
      const response = await getAccountStatusRequest(token);
      if (response.success && response.data) {
        setAccountStatusRequest(response.data);
        
        // If we have a status request, general info is completed
        setGeneralInfoCompleted(true);
        
        // Fee is completed if MCSD request is submitted or approved
        const status = response.data.status;
        setFeeInfoCompleted(status === 'SUBMITTED' || status === 'APPROVED');
      } else {
        // If no status request exists, check if we have stored data
        const storedData = sessionStorage.getItem('accountSetupData');
        setGeneralInfoCompleted(!!storedData);
        setFeeInfoCompleted(null);
      }
    } catch (error) {
      console.error('Error fetching account status request:', error);
      // Fall back to session storage on error
      const storedData = sessionStorage.getItem('accountSetupData');
      setGeneralInfoCompleted(!!storedData);
      setFeeInfoCompleted(null);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`side-menu-content fixed top-0 right-0 h-full w-64 sm:w-72 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('header.menu')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Theme and Language toggles */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.theme')}
            </span>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.language')}
            </span>
            <LanguageToggle />
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {isLoggedIn && (
              <li>
                <Link href="/profile" onClick={onClose}>
                  <div className={`flex items-center p-3 rounded-lg transition-colors ${
                    pathname === '/profile'
                      ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/20 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                    <User size={20} className="mr-3" />
                    <span className="text-sm sm:text-base">{t('profile.title', 'My Profile')}</span>
                  </div>
                </Link>
              </li>
            )}
            
            {/* Account Setup Section */}
            {needsMcsdSetup && (
              <li className="mt-4">
                <div className="mb-2 px-3">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('profile.accountSetup')}</h3>
                </div>
                
                <Link href="/account-setup/general" onClick={onClose}>
                  <div className={`flex items-center p-3 rounded-lg transition-colors ${
                    pathname === '/account-setup/general'
                      ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/20 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                    <div className="mr-3">
                      {renderStatusIcon(generalInfoCompleted)}
                    </div>
                    <span className="text-sm sm:text-base">{t('profile.generalInfo')}</span>
                  </div>
                </Link>
                
                <Link href="/account-setup/fee" onClick={onClose}>
                  <div className={`flex items-center p-3 rounded-lg transition-colors ${
                    pathname === '/account-setup/fee'
                      ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/20 dark:text-indigo-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                    <div className="mr-3">
                      {renderStatusIcon(feeInfoCompleted)}
                    </div>
                    <span className="text-sm sm:text-base">{t('profile.accountFee')}</span>
                  </div>
                </Link>
              </li>
            )}
            
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href} onClick={onClose}>
                  <div
                    className={`flex items-center p-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/20 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon size={20} className="mr-3" />
                    <span className="text-sm sm:text-base">{t(item.label)}</span>
                  </div>
                </Link>
              </li>
            ))}
            {!isLoggedIn && (
              <li>
                <Link href="/auth/nationality" onClick={onClose}>
                  <div className="flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <LogIn size={20} className="mr-3" />
                    <span className="text-sm sm:text-base">{t('auth.login')}</span>
                  </div>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  )
}

export default SideMenu