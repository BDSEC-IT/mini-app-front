'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, BarChart3, FileText, PieChart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { AiOutlineStock } from "react-icons/ai";

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
            <svg width={iconSize} height={iconSize} viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M20.5805 0.803223C19.7978 0.803223 19.1612 1.45025 19.1612 2.24587C19.1612 2.52322 19.2421 2.77967 19.3762 2.99999L11.3357 12.5343C11.1302 12.4167 10.8971 12.3442 10.6451 12.3442C10.2509 12.3442 9.8943 12.509 9.63669 12.7734L6.92856 10.8468C7.03251 10.6462 7.09674 10.4219 7.09674 10.1803C7.09674 9.38465 6.46016 8.73763 5.67737 8.73763C4.89458 8.73763 4.25806 9.38465 4.25806 10.1803C4.25806 10.4472 4.33437 10.6938 4.45925 10.9084L2.13577 13.27C1.92467 13.143 1.68197 13.0655 1.41938 13.0655C0.636589 13.0655 0 13.7125 0 14.5081C0 15.3038 0.636589 15.9508 1.41938 15.9508C2.20217 15.9508 2.83876 15.3038 2.83876 14.5081C2.83876 14.2412 2.76245 13.9946 2.63756 13.78L4.96104 11.4184C5.17215 11.5454 5.41485 11.6229 5.67744 11.6229C5.96306 11.6229 6.22782 11.5353 6.45062 11.3871L9.28327 13.4024C9.24958 13.5258 9.22581 13.6531 9.22581 13.7869C9.22581 14.5825 9.8624 15.2295 10.6452 15.2295C11.428 15.2295 12.0646 14.5825 12.0646 13.7869C12.0646 13.5095 11.9836 13.2531 11.8495 13.0328L19.8901 3.49841C20.0955 3.61596 20.3287 3.68852 20.5806 3.68852C21.3634 3.68852 22 3.04149 22 2.24587C22 1.45025 21.3633 0.803223 20.5805 0.803223ZM1.41938 15.2295C1.02802 15.2295 0.709689 14.906 0.709689 14.5081C0.709689 14.1103 1.02795 13.7868 1.41938 13.7868C1.81081 13.7868 2.12907 14.1103 2.12907 14.5081C2.12907 14.906 1.81074 15.2295 1.41938 15.2295ZM5.67737 10.9016C5.28601 10.9016 4.96768 10.5781 4.96768 10.1803C4.96768 9.7825 5.28593 9.45895 5.67737 9.45895C6.0688 9.45895 6.38705 9.78242 6.38705 10.1803C6.38705 10.578 6.0688 10.9016 5.67737 10.9016ZM10.6451 14.5081C10.2538 14.5081 9.93543 14.1847 9.93543 13.7868C9.93543 13.389 10.2537 13.0655 10.6451 13.0655C11.0365 13.0655 11.3548 13.389 11.3548 13.7868C11.3548 14.1846 11.0365 14.5081 10.6451 14.5081ZM20.5805 2.96719C20.1892 2.96719 19.8709 2.64372 19.8709 2.24587C19.8709 1.84802 20.1891 1.52455 20.5805 1.52455C20.9719 1.52455 21.2902 1.84802 21.2902 2.24587C21.2902 2.64372 20.972 2.96719 20.5805 2.96719Z" fill="#21214F"/>
</svg>

              <span className="text-xs mt-1">{t('nav.ipo')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomNavigation
