'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Wallet, TrendingUp, Building, Lock, Landmark, Newspaper, BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { getUserAccountInformation, hasActiveMCSDAccount, type UserAccountResponse } from '@/lib/api'
import Cookies from 'js-cookie'

const BottomNavigation = () => {
  const pathname = usePathname()
  const { t } = useTranslation()

  // Window width state must be defined first
  const [winW, setWinW] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  // Responsive icon and text sizing
  const iconSize = Math.max(16, Math.min(22, winW * 0.055));
  const textSize = winW < 360 ? 'text-[8px]' : winW < 390 ? 'text-[9px]' : 'text-[10px]';
  const isActive = (p: string) => pathname === p

  const [accountInfo, setAccountInfo] = useState<UserAccountResponse['data'] | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState<'balance' | 'portfolio' | 'news' | 'exchange' | null>(null)
  
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
      setIsLoading(false)
    }
    checkAccountStatus()
  }, [])
  
  // CRITICAL: Only consider account opened if DGStatus === 'COMPLETED'
  const accountOpened = hasActiveMCSDAccount(accountInfo);

  const handleMenuClick = (e: React.MouseEvent, type: 'balance' | 'portfolio' | 'news' | 'exchange') => {
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

  // Define nav items inside component to ensure proper translation
  const basicNavItems = useMemo(() => [
    { name: 'securities', href: '/stocks', icon: BarChart3, label: t('common.securities') },
    { name: 'bonds', href: '/bonds', icon: Landmark, label: t('common.bonds') },
    { name: 'news', href: '/news', icon: Newspaper, label: t('menu.news') },
  ], [t]);

  const advancedNavItems = useMemo(() => [
    { name: 'balance', href: '/balance', icon: Wallet, label: t('nav.balance') },
    { name: 'portfolio', href: '/portfolio', icon: TrendingUp, label: t('nav.portfolio') },
    { name: 'news', href: '/news', icon: Newspaper, label: t('menu.news') }
  ], [t]);

  const itemsToShow = accountOpened ? advancedNavItems : basicNavItems;

  const BAR_H = 70, PANEL_Y = 6, PANEL_H = BAR_H - PANEL_Y;

  // Debounced resize handler for better performance
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWinW(window.innerWidth);
      }, 16); // ~60fps debouncing
    };

    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', onResize);
    };
  }, [])

  // Memoized responsive dimensions calculation
  const responsiveDimensions = useMemo(() => {
    // Smooth scaling formula for curve width (35-40% of screen width, with constraints)
    const curveWidth = Math.max(120, Math.min(160, winW * 0.37));

    // Responsive button size (smooth scaling)
    const buttonSize = Math.max(50, Math.min(64, winW * 0.15));

    // Dynamic top offset
    const topOffset = Math.max(8, Math.min(12, buttonSize * 0.2));

    // Adaptive overlap
    const overlap = Math.max(4, Math.min(10, winW * 0.02));

    return { curveWidth, buttonSize, topOffset, overlap };
  }, [winW]);

  const { curveWidth, buttonSize, topOffset, overlap } = responsiveDimensions;
  const CURVE_W = curveWidth;
  const CURVE_H = PANEL_H;

  // Memoized SVG curve path generation
  const curvePath = useMemo(() => {
    const w = CURVE_W;
    const h = CURVE_H;

    // Proportional curve points based on width
    const leftCurveStart = w * 0.265; // ~35.43 for 133.5px width
    const leftCurveControl = w * 0.273; // ~36.477
    const rightCurveEnd = w * 0.761; // ~101.663
    const rightCurveControl = w * 0.814; // ~108.764

    return `M${leftCurveStart} ${h * 0.269} L${leftCurveControl} ${h * 0.292} C${w * 0.393} ${h * 0.647} ${w * 0.647} ${h * 0.639} ${rightCurveEnd} ${h * 0.277} C${rightCurveControl} ${h * 0.109} ${w * 0.904} ${h * 0.006} ${w} ${h * 0.0002} V${h} H0 V${h * 0.034} C0 ${h * 0.015} ${w * 0.007} 0 ${w * 0.016} 0 C${w * 0.116} ${h * -0.008} ${w * 0.208} ${h * 0.1} ${leftCurveStart} ${h * 0.269} Z`;
  }, [CURVE_W, CURVE_H]);

  const sideW = Math.max(0, (winW - CURVE_W) / 2) + overlap;
  
  const renderNavItem = useCallback((item: typeof basicNavItems[0] | typeof advancedNavItems[0]) => {
      const isButton = accountOpened;
      const className = `flex flex-col items-center ${isActive(item.href) ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`;
      
      // Specific icon size for Newspaper icon to ensure consistency
      const iconSizeToUse = item.name === 'news' ? Math.max(16, Math.min(20, winW * 0.05)) : iconSize;

      if (isButton) {
          return (
              <div className="relative" key={item.name}>
                  <button onClick={(e) => handleMenuClick(e, item.name as any)} className={`${className} hover:text-bdsec dark:hover:text-indigo-400`}>
                      <item.icon size={iconSizeToUse} />
                      <span className={`${textSize} mt-1`}>{item.label}</span>
                  </button>
              </div>
          );
      }

      return (
          <Link href={item.href} className={className} key={item.name}>
              <item.icon size={iconSizeToUse} />
              <span className={`${textSize} mt-1`}>{item.label}</span>
          </Link>
      );
  }, [accountOpened, isActive, handleMenuClick, iconSize, textSize, winW]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900" style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: BAR_H }}>
      <div className="relative" style={{ height: BAR_H }}>
        <div className="absolute inset-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" />
        <div className="absolute bottom-2 inset-x-0 flex items-center justify-evenly px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="w-8 h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: BAR_H }}>
      <div className="relative" style={{ height: BAR_H }}>
        {pathname === '/exchange' ? (
          // Simple flat background for exchange page
          <div className="absolute inset-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" />
        ) : (
          // Curved background for other pages
          <div className="absolute inset-0 flex items-start">
            <div className="relative z-20 bg-white dark:bg-gray-900 dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.05)]" style={{ width: sideW, height: PANEL_H, marginTop: PANEL_Y, marginRight: -overlap, boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)' }} />
            <div className="relative z-10" style={{ width: CURVE_W, height: CURVE_H, marginTop: PANEL_Y - 0.5, marginLeft: -4, }}>
              <svg width={CURVE_W} height={CURVE_H} viewBox={`0 0 ${CURVE_W} ${CURVE_H}`} xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_-4px_4px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.05)]">
                <path d={curvePath} fill="currentColor" className="text-white dark:text-gray-900" strokeWidth="0" />
              </svg>
            </div>
            <div className="relative z-20 bg-white dark:bg-gray-900 dark:drop-shadow-[0_-4px_4px_rgba(255,255,255,0.05)]" style={{ width: sideW, height: PANEL_H, marginTop: PANEL_Y, marginLeft: -overlap, boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)' }} />
          </div>
        )}

        <div className="absolute inset-0 pointer-events-none">
          {/* Conditionally hide exchange button when on /exchange page */}
          {pathname !== '/exchange' && (
            <div className={`absolute left-1/2 -translate-x-1/2 translate-y-1 z-30 pointer-events-auto`} style={{ top: -topOffset - buttonSize/2 }}>
              <div className="relative">
                <button
                  onClick={(e) => handleMenuClick(e, 'exchange')}
                  className={`relative rounded-full bg-bdsec dark:bg-indigo-500 text-white  flex items-center justify-center transition ${(!isLoggedIn || !accountOpened) ? 'cursor-not-allowed opacity-80' : 'hover:scale-105'}`}
                  style={{ width: buttonSize, height: buttonSize }}
                >
                  <div
                    className="absolute inset-0 bg-bdsec dark:bg-indigo-500 rounded-full opacity-60 dark:opacity-80 -z-10"
                    style={{ filter: `blur(${Math.max(8, buttonSize * 0.2)}px)` }}
                  />
                  {(!isLoggedIn || !accountOpened) && (
                    <Lock size={Math.max(12, buttonSize * 0.25)} className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-1" />
                  )}
                  <svg width={buttonSize * 0.45} height={buttonSize * 0.45} viewBox="0 0 30 30" fill="none">
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
          )}
          <div className={`absolute bottom-2 inset-x-0 flex items-center px-4 pointer-events-auto z-30 ${
            pathname === '/exchange' ? 'justify-evenly' : 'justify-between'
          }`}>
            <Link href="/" className={`flex flex-col items-center ${isActive('/') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'}`}>
                <Home size={iconSize} />
                <span className={`${textSize} mt-1`}>{t('nav.home')}</span>
            </Link>
            {renderNavItem(itemsToShow[0])}
            {pathname !== '/exchange' && <div style={{ width: buttonSize }} />}
            {renderNavItem(itemsToShow[1])}
            {renderNavItem(itemsToShow[2])}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomNavigation
