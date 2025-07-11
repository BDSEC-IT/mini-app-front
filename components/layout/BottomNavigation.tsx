'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Wallet, 
  TrendingUp, 
  Landmark, 
  Lock,
  Newspaper,
  Rocket,
  ClipboardList,
  Repeat
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getUserAccountInformation, type UserAccountResponse } from '@/lib/api'
import Cookies from 'js-cookie'

const BottomNavigation = () => {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const iconSize = 20
  const isActive = (p: string) => pathname === p
  
  // Account status state
  const [accountInfo, setAccountInfo] = useState<UserAccountResponse['data'] | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showTooltip, setShowTooltip] = useState<'balance' | 'returns' | 'ipo' | 'exchange' | null>(null)
  
  // Check account status
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
      } else {
        setIsLoggedIn(false)
        setAccountInfo(null)
      }
    }
    
    checkAccountStatus()
    
    // Listen for account setup data changes
    const handleAccountSetupChange = () => {
      console.log('BottomNavigation: Account setup data changed event triggered');
      checkAccountStatus();
    };
    
    window.addEventListener('accountSetupDataChanged', handleAccountSetupChange);
    
    // Listen for login/logout events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'jwt' || e.key === 'auth_token' || e.key === 'token') {
        checkAccountStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('accountSetupDataChanged', handleAccountSetupChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])
  
  // Check if user has MCSD account
  const hasMcsdAccount = accountInfo?.MCSDAccount !== null && accountInfo?.MCSDAccount !== undefined
  
  // Debug logging - commented out to prevent excessive re-rendering
  // console.log('BottomNavigation DEBUG:', { 
  //   isLoggedIn, 
  //   hasMcsdAccount, 
  //   accountInfo: accountInfo,
  //   mcsdAccount: accountInfo?.MCSDAccount 
  // });
  
  // Handle menu item click
  const handleMenuClick = (e: React.MouseEvent, type: 'balance' | 'returns' | 'ipo' | 'exchange') => {
    if (!isLoggedIn) {
      e.preventDefault()
      setShowTooltip(type)
      setTimeout(() => setShowTooltip(null), 3000)
      return
    }
    
    if (!hasMcsdAccount) {
      // User doesn't have MCSD account - show tooltip
      e.preventDefault()
      setShowTooltip(type)
      setTimeout(() => setShowTooltip(null), 3000)
    } else {
      // User has MCSD account - navigate to coming soon pages
      if (type === 'exchange') {
        // For exchange, redirect to exchange coming soon page
        window.location.href = '/exchange'
      } else if (type === 'balance') {
        window.location.href = '/balance'
      } else if (type === 'returns') {
        window.location.href = '/returns'
      } else if (type === 'ipo') {
        window.location.href = '/ipo'
      }
    }
  }

  // — Your Figma dims —
  const BAR_H = 70
  const PANEL_Y = 6
  const PANEL_H = BAR_H - PANEL_Y  // 64
  const CURVE_W = 133.5
  const CURVE_H = PANEL_H

  const curvePath = `
    M35.43 17.24644
    L36.477 18.73144
    C52.495 41.44864 86.353 40.92664 101.663 17.72634
    C108.764 6.96584 120.658 0.37226 133.5 0.01528
    V64
    H0
    V2.16615
    C0 0.96982 0.97 0 2.166 0
    C15.5 -0.49997 27.804 6.43234 35.43 17.24644
    Z
  `

  // track window width
  const [winW, setWinW] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  )
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // overlap amount & side widths
  const overlap = 8   // px
  const sideW = Math.max(0, (winW - CURVE_W) / 2) + overlap

  // Add a helper to determine allowed menus
  const allowedMenus = [
    { href: '/', icon: Home, label: t('nav.home') },
    { href: '/stocks', icon: TrendingUp, label: t('common.stocks') },
    { href: '/bonds', icon: Landmark, label: t('common.bonds') },
    { href: '/news', icon: Newspaper, label: t('menu.news') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Bar container (70px tall) */}
      <div className="relative" style={{ height: BAR_H }}>
        {/* ─── three-piece bg ──────────────────────────── */}
        <div className="absolute inset-0 flex items-start">
          {/* left panel (overlapping) */}
          <div
            className="relative z-20 bg-white dark:bg-gray-950 dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.07)]"
            style={{
              width: sideW,
              height: PANEL_H,
              marginTop: PANEL_Y,
              marginRight: -overlap,
              // borderTopLeftRadius: 32,
              boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)'
            }}
          />

          {/* center static SVG (z10) */}
          <div
            className="relative z-10  "
            style={{
              width: CURVE_W,
              height: CURVE_H,
              marginTop: PANEL_Y-0.5,
              marginLeft: -4,
              
            }}
          >
            <svg
              width={CURVE_W}
              height={CURVE_H}
              viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
              xmlns="http://www.w3.org/2000/svg"
              className="filter drop-shadow-[0_-4px_4px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.07)]"
            >
              <path
                d={curvePath}
                fill="currentColor"
                className="text-white dark:text-gray-950"
                strokeWidth="0"
              />
            </svg>
          </div>

          {/* right panel (overlapping) */}
          <div
            className="relative z-20 bg-white dark:bg-gray-950 dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.07)]"
            style={{
              width: sideW,
              height: PANEL_H,
              marginTop: PANEL_Y,
              marginLeft: -overlap,
              // borderTopRightRadius: 32,
              boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)'
            }}
          />
        </div>

        {/* ─── overlay: FAB + nav items ───────────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* FAB - Secondary Market Exchange */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <div className="relative">
              <button
                onClick={(e) => handleMenuClick(e, 'exchange')}
                className={`relative w-16 h-16 rounded-full bg-bdsec dark:bg-indigo-500 text-white flex items-center justify-center transition ${
                  (!isLoggedIn || !hasMcsdAccount) 
                    ? 'cursor-not-allowed opacity-80' 
                    : 'hover:scale-105'
                }`}
              >
                <div
                  className="absolute inset-0 bg-bdsec dark:bg-indigo-500 rounded-full 
                             blur-[14px] opacity-60 dark:opacity-80 -z-10"
                />
                
                {(!isLoggedIn || !hasMcsdAccount) && (
                  <Lock size={16} className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-1" />
                )}
                
                {/* secondary market exchange icon */}
                <Repeat size={26} />
              </button>
              
              {showTooltip === 'exchange' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                  {!isLoggedIn ? 'Эхлээд нэвтэрнэ үү' : !hasMcsdAccount ? 'Та эхлээд ҮЦТХТ данс нээлгэнэ үү?' : 'тун удахгүй'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </div>
          </div>

          {/* nav items */}
          <div className="absolute bottom-2 inset-x-0 flex justify-between items-center px-4 md:px-6 lg:px-8 mx-auto max-w-[1400px] pointer-events-auto z-30">
            {/* Always show home menu */}
            <Link href="/" className={`flex flex-col items-center ${isActive('/') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`}>
              <Home size={iconSize} />
              <span className="text-[10px] mt-1">{t('nav.home')}</span>
            </Link>

            {(!isLoggedIn || !hasMcsdAccount) ? (
              // Show basic menus for non-logged in users or users without MCSD account
              <>
                <Link href="/stocks" className={`flex flex-col items-center ${isActive('/stocks') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`}>
                  <TrendingUp size={iconSize} />
                  <span className="text-[10px] mt-1">{t('common.stocks')}</span>
                </Link>
                <Link href="/bonds" className={`flex flex-col items-center ${isActive('/bonds') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`}>
                  <Landmark size={iconSize} />
                  <span className="text-[10px] mt-1">{t('common.bonds')}</span>
                </Link>
                <Link href="/news" className={`flex flex-col items-center ${isActive('/news') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`}>
                  <Newspaper size={iconSize} />
                  <span className="text-[10px] mt-1">{t('menu.news')}</span>
                </Link>
              </>
            ) : (
              // Show advanced menus for logged in users with MCSD account
              <>
                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick(e, 'balance')}
                    className={`flex flex-col items-center ${
                      (!isLoggedIn || !hasMcsdAccount) ? 'text-gray-400 opacity-60' : 'text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
                    }`}
                  >
                    {(!isLoggedIn || !hasMcsdAccount) && <Lock size={12} className="absolute -top-1 -right-1" />}
                    <Wallet size={iconSize} />
                    <span className="text-[10px] mt-1">{t('nav.balance')}</span>
                  </button>
                  
                  {showTooltip === 'balance' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                      {!isLoggedIn ? 'Эхлээд нэвтэрнэ үү' : !hasMcsdAccount ? 'Та эхлээд ҮЦТХТ данс нээлгэнэ үү?' : 'тун удахгүй'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick(e, 'returns')}
                    className={`flex flex-col items-center ${
                      (!isLoggedIn || !hasMcsdAccount) ? 'text-gray-400 opacity-60' : 'text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
                    }`}
                  >
                    {(!isLoggedIn || !hasMcsdAccount) && <Lock size={12} className="absolute -top-1 -right-1" />}
                    <ClipboardList size={iconSize} />
                    <span className="text-[10px] mt-1">{t('nav.orders')}</span>
                  </button>
                  
                  {showTooltip === 'returns' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                      {!isLoggedIn ? 'Эхлээд нэвтэрнэ үү' : !hasMcsdAccount ? 'Та эхлээд ҮЦТХТ данс нээлгэнэ үү?' : 'тун удахгүй'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => handleMenuClick(e, 'ipo')}
                    className={`flex flex-col items-center ${
                      (!isLoggedIn || !hasMcsdAccount) ? 'text-gray-400 opacity-60' : 'text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
                    }`}
                  >
                    {(!isLoggedIn || !hasMcsdAccount) && <Lock size={12} className="absolute -top-1 -right-1" />}
                    <Rocket size={iconSize} />
                    <span className="text-[10px] mt-1">{t('nav.ipo')}</span>
                  </button>
                  
                  {showTooltip === 'ipo' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
                      {!isLoggedIn ? 'Эхлээд нэвтэрнэ үү' : !hasMcsdAccount ? 'Та эхлээд ҮЦТХТ данс нээлгэнэ үү?' : 'тун удахгүй'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomNavigation