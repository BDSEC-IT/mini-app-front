'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Wallet, TrendingUp, Building, Lock, Landmark, Newspaper, BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getUserAccountInformation, type UserAccountResponse } from '@/lib/api'
import Cookies from 'js-cookie'

const BottomNavigation = () => {
  const pathname = usePathname()
  const { t } = useTranslation()
  const iconSize = 20
  const isActive = (p: string) => pathname === p
  
  const [accountInfo, setAccountInfo] = useState<UserAccountResponse['data'] | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showTooltip, setShowTooltip] = useState<'balance' | 'returns' | 'ipo' | 'exchange' | null>(null)
  
  useEffect(() => {
    const checkAccountStatus = async () => {
      const token = Cookies.get('jwt') || Cookies.get('auth_token') || Cookies.get('token')
      if (token) {
        setIsLoggedIn(true)
        try {
          const response = await getUserAccountInformation(token)
          if (response.success && response.data) {
            setAccountInfo(response.data)
          }
        } catch (error) {
          console.error('Error fetching account info:', error)
        }
      }
    }
    checkAccountStatus()
  }, [])
  
  const accountOpened = accountInfo?.MCSDAccount && accountInfo.MCSDAccount.DGStatus === 'COMPLETED';

  const handleMenuClick = (e: React.MouseEvent, type: 'balance' | 'returns' | 'ipo' | 'exchange') => {
    if (!isLoggedIn || !accountOpened) {
      e.preventDefault()
      setShowTooltip(type)
      setTimeout(() => setShowTooltip(null), 3000)
      return
    }

    const targetPath = `/${type}`;
    if (pathname !== targetPath) {
      window.location.href = targetPath;
    }
  }

  const basicNavItems = [
    { name: 'stocks', href: '/stocks', icon: BarChart3, label: t('common.stocks') },
    { name: 'bonds', href: '/bonds', icon: Landmark, label: t('common.bonds') },
    { name: 'news', href: '/news', icon: Newspaper, label: t('menu.news') },
  ];

  const advancedNavItems = [
    { name: 'balance', href: '/balance', icon: Wallet, label: t('nav.balance') },
    { name: 'returns', href: '/returns', icon: TrendingUp, label: 'өгөөж' },
    { name: 'ipo', href: '/ipo', icon: Building, label: 'IPO' }
  ];

  const itemsToShow = accountOpened ? advancedNavItems : basicNavItems;

  const BAR_H = 70, PANEL_Y = 6, PANEL_H = BAR_H - PANEL_Y, CURVE_W = 133.5, CURVE_H = PANEL_H;
  const curvePath = `M35.43 17.24644 L36.477 18.73144 C52.495 41.44864 86.353 40.92664 101.663 17.72634 C108.764 6.96584 120.658 0.37226 133.5 0.01528 V64 H0 V2.16615 C0 0.96982 0.97 0 2.166 0 C15.5 -0.49997 27.804 6.43234 35.43 17.24644 Z`;
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const overlap = 8;
  const sideW = Math.max(0, (winW - CURVE_W) / 2) + overlap;
  
  const renderNavItem = (item: typeof basicNavItems[0] | typeof advancedNavItems[0]) => {
      const isButton = accountOpened;
      const className = `flex flex-col items-center ${isActive(item.href) ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`;

      if (isButton) {
          return (
              <div className="relative" key={item.name}>
                  <button onClick={(e) => handleMenuClick(e, item.name as any)} className={`${className} hover:text-bdsec dark:hover:text-indigo-400`}>
                      <item.icon size={iconSize} />
                      <span className="text-[10px] mt-1">{item.label}</span>
                  </button>
              </div>
          );
      }
      
      return (
          <Link href={item.href} className={className} key={item.name}>
              <item.icon size={iconSize} />
              <span className="text-[10px] mt-1">{item.label}</span>
          </Link>
      );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="relative" style={{ height: BAR_H }}>
        <div className="absolute inset-0 flex items-start">
          <div className="relative z-20 bg-white dark:bg-gray-950 dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.07)]" style={{ width: sideW, height: PANEL_H, marginTop: PANEL_Y, marginRight: -overlap, boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)' }} />
          <div className="relative z-10" style={{ width: CURVE_W, height: CURVE_H, marginTop: PANEL_Y - 0.5, marginLeft: -4, }}>
            <svg width={CURVE_W} height={CURVE_H} viewBox={`0 0 ${CURVE_W} ${CURVE_H}`} xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_-4px_4px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.07)]">
              <path d={curvePath} fill="currentColor" className="text-white dark:text-gray-950" strokeWidth="0" />
            </svg>
          </div>
          <div className="relative z-20 bg-white dark:bg-gray-950 dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.07)]" style={{ width: sideW, height: PANEL_H, marginTop: PANEL_Y, marginLeft: -overlap, boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)' }} />
        </div>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div className="relative">
              <button onClick={(e) => handleMenuClick(e, 'exchange')} className={`relative w-16 h-16 rounded-full bg-bdsec dark:bg-indigo-500 text-white flex items-center justify-center transition ${(!isLoggedIn || !accountOpened) ? 'cursor-not-allowed opacity-80' : 'hover:scale-105'}`}>
                <div className="absolute inset-0 bg-bdsec dark:bg-indigo-500 rounded-full blur-[14px] opacity-60 dark:opacity-80 -z-10" />
                {(!isLoggedIn || !accountOpened) && (<Lock size={16} className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-1" />)}
                <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
                  <path d="M25.625 18.7373L19.3625 25.0123" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.375 18.7373H25.625" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.375 11.2623L10.6375 4.9873" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M25.625 11.2627H4.375" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {showTooltip === 'exchange' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                  {!isLoggedIn ? t('auth.login') : !accountOpened ? (
                    <div className="flex flex-col items-center">
                      <span>{t('common.securitiesAccountRequired')}</span>
                      <Link href="/account-setup/general" className="mt-2 px-3 py-1 bg-indigo-500 text-white rounded">
                        {t('common.openAccount')}
                      </Link>
                    </div>
                  ) : t('common.comingSoon')}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-2 inset-x-0 flex justify-between items-center px-4 pointer-events-auto z-30">
            <Link href="/" className={`flex flex-col items-center ${isActive('/') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`}>
                <Home size={iconSize} />
                <span className="text-[10px] mt-1">{t('nav.home')}</span>
            </Link>
            {renderNavItem(itemsToShow[0])}
            <div className="w-16" />
            {renderNavItem(itemsToShow[1])}
            {renderNavItem(itemsToShow[2])}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomNavigation
