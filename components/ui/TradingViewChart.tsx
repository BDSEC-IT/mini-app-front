'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchTradingHistory, type TradingHistoryData, type TradingHistoryResponse } from '@/lib/api'

interface TradingViewChartProps {
  symbol?: string
  theme?: string
  period?: string
  onPriceHover?: (price: number | null, change?: number, changePercent?: number) => void
  onLatestTimeUpdate?: (latestTime: string) => void
}

interface Point {
  x: number
  y: number
  date: Date
  value: number
  change: number
  changePercent: number
  entryTime: string
}

export function TradingViewChart({ 
  symbol = 'BDS-O-0000', 
  theme = 'light', 
  period = 'ALL',
  onPriceHover,
  onLatestTimeUpdate
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<TradingHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFallbackData, setIsFallbackData] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [tooltip, setTooltip] = useState<{
    visible: boolean, 
    x: number, 
    y: number, 
    date: Date, 
    value: number, 
    change: number, 
    changePercent: number,
    entryTime: string
  }>({
    visible: false,
    x: 0,
    y: 0,
    date: new Date(),
    value: 0,
    change: 0,
    changePercent: 0,
    entryTime: '',
  })
  const [hasInteracted, setHasInteracted] = useState(false)
  const lastValidTooltipRef = useRef<{x: number, y: number, date: Date, value: number, change: number, changePercent: number, entryTime: string} | null>(null)
  const pointsRef = useRef<Point[]>([])
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [activePeriod, setActivePeriod] = useState(period)
  const latestPriceRef = useRef<number | null>(null)

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch data based on period
  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetchTradingHistory(symbol, 1, 1000)
      
      if (response.success && response.data.length > 0) {
        let filteredData = response.data
        
        // Filter by period
        const now = new Date()
        const periodMap: { [key: string]: number } = {
          '1M': 30,
          '3M': 90,
          '1Y': 365,
          'ALL': 1000
        }
        
        if (period !== 'ALL' && periodMap[period]) {
          const cutoffDate = new Date(now.getTime() - periodMap[period] * 24 * 60 * 60 * 1000)
          filteredData = response.data.filter(item => new Date(item.dates) >= cutoffDate)
        }
        
        if (filteredData.length === 0) {
          // If no data for period, show most recent data
          filteredData = response.data.slice(0, 30)
          setIsFallbackData(true)
        }
        
        setChartData(filteredData)
        
        // Update latest price
        if (filteredData.length > 0) {
          const latest = filteredData[filteredData.length - 1]
          latestPriceRef.current = latest.ClosingPrice
          if (onLatestTimeUpdate) {
            onLatestTimeUpdate(latest.MDEntryTime)
          }
        }
      } else {
        setError('No data available')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when symbol or period changes
  useEffect(() => {
    if (mounted) {
      fetchAllData()
    }
  }, [symbol, activePeriod, mounted])

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }
    
    // Initial size update
    updateSize()
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    
    // Fallback for older browsers
    window.addEventListener('resize', updateSize)
    
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Draw chart using SVG
  useEffect(() => {
    if (!mounted || !svgRef.current || chartData.length === 0 || containerSize.width === 0) return

    const svg = svgRef.current
    const { width, height } = containerSize
    
    // Clear previous content
    svg.innerHTML = ''
    
    // Sort data by date
    const sortedData = [...chartData].sort((a, b) => new Date(a.dates).getTime() - new Date(b.dates).getTime())
    
    if (sortedData.length === 0) return
    
    // Calculate price range
    const prices = sortedData.map(d => d.ClosingPrice)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceRange = maxPrice - minPrice
    
    // Add padding to price range
    const padding = priceRange * 0.1
    const paddedMinPrice = minPrice - padding
    const paddedMaxPrice = maxPrice + padding
    const paddedPriceRange = paddedMaxPrice - paddedMinPrice
    
    // Calculate points
    const points: Point[] = sortedData.map((d, i) => {
      const x = (i / (sortedData.length - 1)) * width
      const y = height - ((d.ClosingPrice - paddedMinPrice) / paddedPriceRange) * height
      
      const change = i > 0 ? d.ClosingPrice - sortedData[i - 1].ClosingPrice : 0
      const changePercent = i > 0 
        ? (change / sortedData[i - 1].ClosingPrice) * 100
        : 0
        
      return { x, y, date: new Date(d.dates), value: d.ClosingPrice, change, changePercent, entryTime: d.MDEntryTime }
    })
    
    pointsRef.current = points
    
    // Create SVG elements
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.appendChild(defs)
    
    // Create gradient
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    gradient.setAttribute('id', 'chartGradient')
    gradient.setAttribute('x1', '0%')
    gradient.setAttribute('y1', '0%')
    gradient.setAttribute('x2', '0%')
    gradient.setAttribute('y2', '100%')
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', theme === 'dark' ? '#818cf8' : '#4f46e5')
    stop1.setAttribute('stop-opacity', '0.4')
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', theme === 'dark' ? '#818cf8' : '#4f46e5')
    stop2.setAttribute('stop-opacity', '0')
    
    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    defs.appendChild(gradient)
    
    // Draw area fill
    if (points.length > 1) {
      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      let pathData = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`
      }
      
      pathData += ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`
      
      areaPath.setAttribute('d', pathData)
      areaPath.setAttribute('fill', 'url(#chartGradient)')
      areaPath.setAttribute('stroke', 'none')
      svg.appendChild(areaPath)
    }
    
    // Draw line
    if (points.length > 1) {
      const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      let pathData = `M ${points[0].x} ${points[0].y}`
      
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`
      }
      
      linePath.setAttribute('d', pathData)
      linePath.setAttribute('stroke', theme === 'dark' ? '#818cf8' : '#4f46e5')
      linePath.setAttribute('stroke-width', '2')
      linePath.setAttribute('fill', 'none')
      svg.appendChild(linePath)
    } else if (points.length === 1) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', points[0].x.toString())
      circle.setAttribute('cy', points[0].y.toString())
      circle.setAttribute('r', '4')
      circle.setAttribute('fill', theme === 'dark' ? '#818cf8' : '#4f46e5')
      svg.appendChild(circle)
    }
    
    // Add interactive points
    points.forEach((point, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', point.x.toString())
      circle.setAttribute('cy', point.y.toString())
      circle.setAttribute('r', '6')
      circle.setAttribute('fill', 'transparent')
      circle.setAttribute('stroke', 'transparent')
      circle.setAttribute('stroke-width', '2')
      circle.style.cursor = 'pointer'
      
      // Add hover events
      circle.addEventListener('mouseenter', () => {
        setTooltip({
          visible: true,
          x: point.x,
          y: point.y,
          date: point.date,
          value: point.value,
          change: point.change,
          changePercent: point.changePercent,
          entryTime: point.entryTime
        })
        lastValidTooltipRef.current = {
          x: point.x,
          y: point.y,
          date: point.date,
          value: point.value,
          change: point.change,
          changePercent: point.changePercent,
          entryTime: point.entryTime
        }
        setHasInteracted(true)
        if (onPriceHover) {
          onPriceHover(point.value, point.change, point.changePercent)
        }
      })
      
      circle.addEventListener('mouseleave', () => {
        setTooltip(prev => ({ ...prev, visible: false }))
        if (onPriceHover && latestPriceRef.current !== null) {
          onPriceHover(null)
        }
      })
      
      svg.appendChild(circle)
    })
    
  }, [chartData, theme, mounted, containerSize])

  // Set mounted state
  useEffect(() => {
    setMounted(true)
    // Force initial size calculation after mount
    setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }, 0)
    return () => setMounted(false)
  }, [])

  // Force size update when chartData changes
  useEffect(() => {
    if (chartData.length > 0 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }
  }, [chartData])

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setActivePeriod(newPeriod)
  }

  if (!mounted) return null

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="text-center p-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-200">{t('chart.noData')}</p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('chart.tryAnother')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={containerRef} className="w-full h-[calc(100%-50px)] relative">
        <svg 
          ref={svgRef} 
          className="w-full h-full"
          style={{ transform: 'translate3d(0, 0, 0)' }}
          viewBox={`0 0 ${containerSize.width || 400} ${containerSize.height || 300}`}
          preserveAspectRatio="xMidYMid meet"
        />
        
        {isFallbackData && (
          <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 z-20">
            No data for this period. Showing most recent data.
          </div>
        )}
        
        {(tooltip.visible || (hasInteracted && lastValidTooltipRef.current)) && (
          <div 
            className="absolute pointer-events-none bg-white dark:bg-gray-800 border border-soft border-opacity-50 rounded-md px-3 py-2 z-10 text-xs shadow-lg"
            style={{ 
              left: (() => {
                const tooltipX = tooltip.visible ? tooltip.x : (lastValidTooltipRef.current?.x || 0)
                const containerWidth = containerRef.current?.offsetWidth || 0
                const tooltipWidth = 120
                const margin = 10
                let left = tooltipX - (tooltipWidth / 2)
                if (left < margin) left = margin
                if (left + tooltipWidth > containerWidth - margin) {
                  left = containerWidth - tooltipWidth - margin
                }
                return `${left}px`
              })(),
              top: (() => {
                const tooltipY = tooltip.visible ? tooltip.y : (lastValidTooltipRef.current?.y || 0)
                const tooltipHeight = 80
                const margin = 10
                let top = tooltipY - tooltipHeight - margin
                if (top < margin) {
                  top = tooltipY + margin
                }
                return `${top}px`
              })()
            }}
          >
            <div className="font-bold text-base text-gray-900 dark:text-white">
              {((tooltip.visible ? tooltip.value : lastValidTooltipRef.current?.value) ?? 0).toLocaleString()} ₮
            </div>
            <div className={`flex items-center text-sm ${
              ((tooltip.visible ? tooltip.change : lastValidTooltipRef.current?.change) ?? 0) >= 0 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              <span className="mr-1">
                {((tooltip.visible ? tooltip.change : lastValidTooltipRef.current?.change) ?? 0) >= 0 ? '▲' : '▼'}
              </span>
              <span>
                {((tooltip.visible ? tooltip.change : lastValidTooltipRef.current?.change) ?? 0).toFixed(2)}
                &nbsp;
                ({((tooltip.visible ? tooltip.changePercent : lastValidTooltipRef.current?.changePercent) ?? 0).toFixed(2)}%)
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {(tooltip.visible ? tooltip.date : (lastValidTooltipRef.current?.date || new Date())).toLocaleDateString()}
            </div>
          </div>
        )}
      </div>
      
      <div className="h-[50px] flex justify-center items-center border-t border-soft border-opacity-50 pt-2 pb-2 bg-white dark:bg-gray-900 rounded-b-lg">
        <div className="flex justify-center items-center gap-1 sm:gap-2">
          {[
            { id: '1M', label: '1M' },
            { id: '3M', label: '3M' },
            { id: '1Y', label: '1Y' },
            { id: 'ALL', label: 'ALL' }
          ].map((periodOption) => (
            <button
              key={periodOption.id}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                activePeriod === periodOption.id 
                  ? 'bg-indigo-900 text-white border border-soft border-opacity-50' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-soft border-opacity-30'
              }`}
              onClick={() => handlePeriodChange(periodOption.id)}
            >
              {periodOption.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TradingViewChart
