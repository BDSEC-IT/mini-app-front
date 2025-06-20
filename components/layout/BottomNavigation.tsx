'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BarChart3, FileText, PieChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

const BottomNavigation = () => {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const iconSize = 26
  const isActive = (p: string) => pathname === p

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
              borderTopLeftRadius: 32,
              boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)'
            }}
          />

          {/* center static SVG (z10) */}
          <div
            className="relative z-10  "
            style={{
              width: CURVE_W,
              height: CURVE_H,
              marginTop: PANEL_Y,
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
              borderTopRightRadius: 32,
              boxShadow: '0 -4px 4px -2px rgba(0, 0, 0, 0.15)'
            }}
          />
        </div>

        {/* ─── overlay: FAB + nav items ───────────────────── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* FAB */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
            <Link
              href="/orders"
              className="relative w-16 h-16 rounded-full bg-bdsec dark:bg-indigo-500 text-white 
                         flex items-center justify-center hover:scale-105 transition"
            >
              <div
                className="absolute inset-0 bg-bdsec dark:bg-indigo-500 rounded-full 
                           blur-[14px] opacity-60 dark:opacity-80 -z-10"
              />
              {/* exchange icon */}
              <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
                <path
                  d="M25.625 18.7373L19.3625 25.0123"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.375 18.7373H25.625"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.375 11.2623L10.6375 4.9873"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M25.625 11.2627H4.375"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>

          {/* nav items */}
          <div className="absolute bottom-2 inset-x-0 flex justify-between items-center px-4 md:px-6 lg:px-8 mx-auto max-w-[1400px] pointer-events-auto z-30">
            <Link
              href="/"
              className={`flex flex-col items-center ${
                isActive('/') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'
              }`}
            >
              <Home size={iconSize} />
              <span className="text-xs mt-1">{t('nav.home')}</span>
            </Link>

            <Link
              href="/assets"
              className={`flex flex-col items-center ${
                isActive('/assets') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'
              }`}
            >
              <BarChart3 size={iconSize} />
              <span className="text-xs mt-1">{t('nav.assets')}</span>
            </Link>

            <div className="w-16" />

            <Link
              href="/orders"
              className={`flex flex-col items-center ${
                isActive('/orders') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'
              }`}
            >
              <FileText size={iconSize} />
              <span className="text-xs mt-1">{t('nav.orders')}</span>
            </Link>

            <Link
              href="/ipo"
              className={`flex flex-col items-center ${
                isActive('/ipo') ? 'text-bdsec dark:text-indigo-400' : 'text-gray-400'
              }`}
            >
              <PieChart size={iconSize} />
              <span className="text-xs mt-1">{t('nav.ipo')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomNavigation
