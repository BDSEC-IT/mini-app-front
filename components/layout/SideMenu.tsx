'use client'

import { useEffect, useState } from 'react'
import {
  X,
  LayoutDashboard,
  TrendingUp,
  HelpCircle,
  Newspaper,
  Info,
  LogIn,
  Sun,
  Moon,
  Landmark,
  User,
  CircleCheck,
  CircleAlert,
  CircleDashed,
  BanknoteArrowUp,
  BanknoteArrowDown,
  ArrowUpDown,
  Wallet2,
} from 'lucide-react'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import LanguageToggle from '../ui/LanguageToggle'
import { getUserAccountInformation, checkInvoiceStatus, hasCompletedForms, hasPaidRegistrationFee, hasActiveMCSDAccount, hasPendingMCSDAccount, getMCSDAccountError, type UserAccountResponse } from '@/lib/api'

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
  const [isGeneralInfoComplete, setIsGeneralInfoComplete] = useState<boolean | null>(null);
  const [feeInfoCompleted, setFeeInfoCompleted] = useState<boolean | null>(null);
  const [hasExistingMcsdAccount, setHasExistingMcsdAccount] = useState(false);
  const [hasPaidFee, setHasPaidFeed] = useState<boolean>(false);
  const [mcsdError, setMcsdError] = useState<string | null>(null);
  


  const fetchStatus = async () => {
    const token = Cookies.get('token');
    if (!token) {
      setIsLoggedIn(prev => false);
      setIsGeneralInfoComplete(prev => false);
      setFeeInfoCompleted(prev => false);
      return;
    }

    setIsLoggedIn(prev => true);

    try {
      const [infoRes, invoiceRes] = await Promise.all([
        getUserAccountInformation(token),
        checkInvoiceStatus(token)
      ]);
      console.log("infoRes",infoRes)
      console.log("invoiceRes",invoiceRes)
      if (infoRes.success) setAccountInfo(prev => infoRes.data);
      
      // Use DRY helper functions for all status checks
      const formsComplete = hasCompletedForms(infoRes.data);
      const feePaid = hasPaidRegistrationFee(infoRes.data);
      const accountActive = hasActiveMCSDAccount(infoRes.data);
      const accountPending = hasPendingMCSDAccount(infoRes.data);
      const errorMessage = getMCSDAccountError(infoRes.data);
      
      setIsGeneralInfoComplete(prev => formsComplete);
      setHasPaidFeed(prev => feePaid);
      setHasExistingMcsdAccount(prev => accountActive);
      setMcsdError(prev => errorMessage);

      // Fee completion detection from invoice endpoint
      const invoiceStatus = invoiceRes?.data?.status;
      const feeCompleted = invoiceRes.success && invoiceStatus === 'PAID';
      setFeeInfoCompleted(prev => feeCompleted);

    } catch (error) {
      console.error('SideMenu: Error fetching user data:', error);
      setIsGeneralInfoComplete(prev => false);
      setFeeInfoCompleted(prev => false);
    }
  }

  useEffect(() => {
    // Only fetch status when component mounts or when explicitly triggered
    fetchStatus();
    
    const handleAccountSetupChange = () => {
      // console.log('SideMenu: Account setup data changed event triggered');
      // Add a small delay to avoid excessive calls
      setTimeout(() => fetchStatus(), 100);
    };
    
    window.addEventListener('accountSetupDataChanged', handleAccountSetupChange);
    return () => window.removeEventListener('accountSetupDataChanged', handleAccountSetupChange);
  }, []); // Empty dependency array - only run on mount

  const menuItems = [
    { href: '/', icon: LayoutDashboard, label: 'bottomNav.dashboard' },
    { href: '/stocks', icon: TrendingUp, label: 'common.securities' },
    { href: '/bonds', icon: Landmark, label: 'bottomNav.bonds' },
    { href: '/news', icon: Newspaper, label: 'menu.news' },
    { href: '/about', icon: Info, label: 'bottomNav.about' },
    { href: '/faq', icon: HelpCircle, label: 'bottomNav.faq' },
  ]
  
  // Add Orders menu item for logged-in users with MCSD account
  // CRITICAL: Only consider account opened if DGStatus === 'COMPLETED'
  const accountOpened = hasActiveMCSDAccount(accountInfo);
  const advancedMenuItems = accountOpened ? [
    { href: '/exchange', icon: ArrowUpDown, label: 'nav.orders' },
    { href: '/balance', icon: Wallet2, label: 'nav.balance' },
    { href: '/portfolio', icon: TrendingUp, label: 'nav.portfolio' },
    { href: '/balance/recharge', icon: BanknoteArrowUp, label: 'nav.recharge' },
    { href: '/balance/withdrawal', icon: BanknoteArrowDown, label: 'nav.withdrawal' },
    ...menuItems
  ] : menuItems;
  
  const renderStatusIcon = (isComplete: boolean | null) => {
    if (isComplete === true) {
      return <CircleCheck size={18} className="text-green-500" />;
    }
    if (isComplete === false) {
      return <CircleAlert size={18} className="text-red-500" />;
    }
    return <CircleDashed size={18} className="text-gray-400" />;
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('.side-menu-content')) onClose()
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <>
      <div
        className={`sticky inset-0  bg-black/50 z-40 o transition-opacity duration-300  ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`side-menu-content fixed top-0 right-0 h-screen w-64 sm:w-72 bg-white dark:bg-gray-900 shadow-xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{t('header.menu')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1"><X size={20} /></button>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">{t('common.theme')}</span>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">{t('common.language')}</span>
            <LanguageToggle />
          </div>
        </div>
                {/* Simple scrollable container */}
        <div className="overflow-y-auto h-[calc(100vh-180px)] pb-10">
          <nav className="p-3">
            <ul className="space-y-1.5">
            {isLoggedIn && (
              <li>
                <Link href="/profile" onClick={onClose} className={`flex items-center p-2.5 rounded-lg transition-colors ${pathname === '/profile' ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <User size={18} className="mr-2.5" />
                    <span className="text-sm">{t('profile.title', 'My Profile')}</span>
                </Link>
              </li>
            )}
            
            {isLoggedIn &&  !accountOpened && (
              <li className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-2 px-2">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('profile.accountSetup')}</h3>
                </div>
                <Link href="/account-setup/general" onClick={onClose} className={`flex items-center p-2.5 rounded-lg transition-colors ${pathname === '/account-setup/general' ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}> 
                  <div className="mr-2.5">{renderStatusIcon(isGeneralInfoComplete)}</div>
                  <span className="text-sm">{t('profile.generalInfo')}</span>
                </Link>
                <Link href="/account-setup/fee" onClick={onClose} className={`flex items-center p-2.5 rounded-lg transition-colors ${pathname === '/account-setup/fee' ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}> 
                  <div className="mr-2.5">{renderStatusIcon(hasPaidFee)}</div>
                  <span className="text-sm">{t('profile.accountFee')}</span>
                </Link>
                {/* Third link: Show if fee paid OR if account exists (even if pending) */}
                {/* Always show if fee is paid, even if account not completed yet - this shows red status */}
                {(hasPaidFee || hasExistingMcsdAccount || mcsdError) && (
                  <Link href="/account-setup/opening-process" onClick={onClose} className={`flex items-center p-2.5 rounded-lg transition-colors ${pathname === '/account-setup/opening-process' ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}> 
                    <div className="mr-2.5">
                      {hasExistingMcsdAccount ? (
                        // Green: Account is COMPLETED
                        <CircleCheck size={18} className="text-green-500" />
                      ) : (hasPaidFee && !hasExistingMcsdAccount) || mcsdError ? (
                        // Red: Fee paid but account not completed, OR has error
                        <CircleAlert size={18} className="text-red-500" />
                      ) : (
                        // Gray: Pending
                        <CircleDashed size={18} className="text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm">{t('profile.accountProcess')}</span>
                    {(mcsdError || (hasPaidFee && !hasExistingMcsdAccount)) && (
                      <span className="ml-auto text-xs text-red-500" title={mcsdError || 'Waiting for account activation'}>
                        ⚠️
                      </span>
                    )}
                  </Link>
                )}
              </li>
            )}
            
            {/* My Section - Advanced Menu Items */}
            {accountOpened && (
              <li className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-2 px-2">
                  <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('menu.mySection', 'My Section')}</h3>
                </div>
                {advancedMenuItems.slice(0, 5).map((item) => (
                  <Link href={item.href} onClick={onClose} key={item.href}>
                    <div className={`flex items-center p-2.5 rounded-lg transition-colors ${pathname === item.href ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      <item.icon size={18} className="mr-2.5" />
                      <span className="text-sm">{t(item.label)}</span>
                    </div>
                  </Link>
                ))}
              </li>
            )}

            {/* General Section - Basic Menu Items */}
            <li className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="mb-2 px-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('menu.general', 'General')}</h3>
              </div>
              {menuItems.map((item) => (
                <Link href={item.href} onClick={onClose} key={item.href}>
                  <div className={`flex items-center p-2.5 rounded-lg transition-colors ${pathname === item.href ? 'bg-bdsec/10 text-bdsec dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <item.icon size={18} className="mr-2.5" />
                    <span className="text-sm">{t(item.label)}</span>
                  </div>
                </Link>
              ))}
            </li>

            {/* {!isLoggedIn && (
              <li className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Link href="/auth/nationality" onClick={onClose} className="flex items-center p-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <LogIn size={18} className="mr-2.5" />
                    <span className="text-sm">{t('auth.login')}</span>
                </Link>
              </li>
            )} */}
          </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default SideMenu