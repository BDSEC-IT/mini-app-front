'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Define the TradingHistoryData interface to match the API response
interface TradingHistoryData {
  id: number
  Symbol: string
  MDSubOrderBookType: string
  OpeningPrice: number
  ClosingPrice: number
  HighPrice: number
  LowPrice: number
  VWAP: number
  Volume: number
  HighestBidPrice: number
  LowestOfferPrice: number
  PreviousClose: number
  BuyOrderQty: number
  SellOrderQty: number
  Turnover: number
  Trades: number
  MDEntryTime: string
  companycode: number
  MarketSegmentID: string
  securityType: string
  dates: string
}

// Define the response interface for the API
interface TradingHistoryResponse {
  success: boolean
  data: TradingHistoryData[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    limit: number
  }
}

// Function to fetch trading history data
async function fetchTradingHistory(symbol: string, page: number = 1, limit: number = 100): Promise<TradingHistoryResponse> {
  const BASE_URL = 'https://miniapp.bdsec.mn/apitest'
  const url = `${BASE_URL}/securities/trading-history?page=${page}&limit=${limit}&sortField&sortOrder=desc&symbol=${symbol}`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch trading history data')
  }
  return response.json()
}

interface TradingViewChartProps {
  symbol?: string
  theme?: string
  period?: string
}

interface Point {
  x: number
  y: number
  date: Date
  value: number
}

export function TradingViewChart({ symbol = 'BDS-O-0000', theme = 'light', period = 'ALL' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<TradingHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<{visible: boolean, x: number, y: number, date: Date, value: number}>({
    visible: false,
    x: 0,
    y: 0,
    date: new Date(),
    value: 0
  })
  // Track if we've ever shown a tooltip
  const [hasInteracted, setHasInteracted] = useState(false)
  // Store the last valid tooltip
  const lastValidTooltipRef = useRef<{x: number, y: number, date: Date, value: number} | null>(null)
  
  const pointsRef = useRef<Point[]>([])
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [activePeriod, setActivePeriod] = useState(period)

  // Check if we're on a mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Update active period when prop changes
  useEffect(() => {
    setActivePeriod(period)
  }, [period])

  // Filter data based on the selected time period
  const filterDataByPeriod = (data: TradingHistoryData[], period: string): TradingHistoryData[] => {
    if (!data.length) return []
    
    console.log(`filterDataByPeriod called with period: ${period}, data length: ${data.length}`)
    
    // For 'ALL' period, return all data
    if (period === 'ALL') {
      console.log(`Returning all data (${data.length} points) for ALL period`)
      return data
    }
    
    const now = new Date()
    let cutoffDate = new Date()
    
    switch (period) {
      case '1D':
        // Get data from the last 24 hours
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '1W':
        // Get data from the last 7 days
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '1M':
        // Get data from the last 30 days
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '3M':
        // Get data from the last 90 days
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case '1Y':
        // Get data from the last 365 days
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        console.log(`Unknown period: ${period}, returning all data`)
        return data
    }
    
    console.log(`Filtering data for period ${period}, cutoff date: ${cutoffDate.toISOString()}`)
    
    const filteredData = data.filter(item => {
      const itemDate = new Date(item.dates)
      const result = itemDate >= cutoffDate
      return result
    })
    
    console.log(`Filtered ${data.length} items to ${filteredData.length} items`)
    
    // If no data after filtering, return at least some data
    if (filteredData.length === 0 && data.length > 0) {
      console.log(`No data after filtering for ${period}, returning most recent data`)
      // Return at least the most recent data points
      return data.slice(-Math.min(30, data.length))
    }
    
    return filteredData
  }

  useEffect(() => {
    setMounted(true)
    
    // Fetch all pages of trading history data
    const fetchAllData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log(`TradingViewChart: Fetching data for symbol ${symbol}, period ${activePeriod}`)
        
        let allData: TradingHistoryData[] = []
        let currentPage = 1
        let hasMorePages = true
        
        // Fetch all pages
        while (hasMorePages) {
          console.log(`Fetching page ${currentPage} for ${symbol}`)
          const response = await fetchTradingHistory(symbol, currentPage, 100)
          
          if (response.success && response.data.length > 0) {
            allData = [...allData, ...response.data]
            
            // Check if there are more pages
            if (currentPage < response.pagination.totalPages) {
              currentPage++
            } else {
              hasMorePages = false
            }
          } else {
            hasMorePages = false
            if (allData.length === 0) {
              console.log("No data returned from API for symbol:", symbol)
              setError('No data available')
            }
          }
        }
        
        if (allData.length > 0) {
          console.log(`Total data points fetched: ${allData.length}`)
          
          // Sort data by date (oldest to newest)
          const sortedData = [...allData].sort((a, b) => 
            new Date(a.dates).getTime() - new Date(b.dates).getTime()
          )
          
          console.log(`Total data points after sorting: ${sortedData.length}`)
          console.log(`First date: ${new Date(sortedData[0].dates).toISOString()}, Last date: ${new Date(sortedData[sortedData.length-1].dates).toISOString()}`)
          console.log(`Applying filter for period: ${activePeriod}`)
          
          // Apply period filter
          const filteredData = filterDataByPeriod(sortedData, activePeriod)
          
          console.log(`Data points after filtering for ${activePeriod}: ${filteredData.length}`)
          if (filteredData.length > 0) {
            console.log(`Filtered data first date: ${new Date(filteredData[0].dates).toISOString()}, last date: ${new Date(filteredData[filteredData.length-1].dates).toISOString()}`)
            setChartData(filteredData)
            setError(null)
          } else {
            console.error(`No data available after filtering for period ${activePeriod}`)
            setError('No data available for selected period')
          }
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
        setError('Failed to load chart data')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAllData()
  }, [symbol, activePeriod])

  useEffect(() => {
    if (!mounted || !canvasRef.current || !containerRef.current || chartData.length === 0) return

    const drawChart = () => {
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const container = containerRef.current!
      const rect = container.getBoundingClientRect()
      
      // Set canvas dimensions with higher resolution for better rendering
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      
      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)
      
      // Set background color based on theme (transparent background)
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, rect.width, rect.height)
      
      if (chartData.length === 0) return
      
      // Extract closing prices for the line chart
      const allPrices = chartData.map(d => ({
        close: d.ClosingPrice,
        date: new Date(d.dates)
      }))
      
      // Sample data points to make the chart smoother
      // Limit to fewer points on mobile for better performance
      const maxPoints = isMobile ? 50 : 100
      const sampleInterval = Math.max(1, Math.floor(allPrices.length / maxPoints))
      const prices = allPrices.filter((_, i) => i % sampleInterval === 0 || i === allPrices.length - 1)
      
      // Find min and max values for scaling
      const minPrice = Math.min(...prices.map(p => p.close))
      const maxPrice = Math.max(...prices.map(p => p.close))
      
      // Calculate price range with 10% padding (reduced from 15% for sharper look)
      const priceRange = (maxPrice - minPrice) * 1.1
      const scaledMinPrice = minPrice - priceRange * 0.05
      const scaledMaxPrice = maxPrice + priceRange * 0.05
      
      // Scale functions - use full canvas width with NO padding
      const xScale = (date: Date) => {
        const minDate = prices[0].date
        const maxDate = prices[prices.length - 1].date
        const dateRange = maxDate.getTime() - minDate.getTime()
        return (date.getTime() - minDate.getTime()) / dateRange * rect.width
      }
      
      const yScale = (price: number) => {
        return (scaledMaxPrice - price) / (scaledMaxPrice - scaledMinPrice) * rect.height
      }
      
      // Create gradient fill under the line
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)')  // Purple with opacity
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')    // Transparent
      } else {
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)')  // Indigo with opacity
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)')    // Transparent
      }
      
      // Draw smooth line chart
      ctx.beginPath()
      
      // Move to first point
      const firstX = xScale(prices[0].date)
      const firstY = yScale(prices[0].close)
      ctx.moveTo(firstX, firstY)
      
      // Create points for the curve
      const points = prices.map(p => ({
        x: xScale(p.date),
        y: yScale(p.close),
        date: p.date,
        value: p.close
      }))
      
      // Store points for tooltip interaction
      pointsRef.current = points
      
      // Draw a smoother curve using cardinal spline interpolation
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = i < points.length - 2 ? points[i + 2] : p2
        
        // Catmull-Rom to Bezier conversion
        // Use less tension for sharper curves
        const tension = 0.2
        
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
      
      // Draw the gradient fill under the curve
      ctx.lineTo(points[points.length - 1].x, rect.height)
      ctx.lineTo(points[0].x, rect.height)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
      
      // Redraw the line on top of the fill for better visibility
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = i < points.length - 2 ? points[i + 2] : p2
        
        // Catmull-Rom to Bezier conversion
        const tension = 0.2
        
        const cp1x = p1.x + (p2.x - p0.x) * tension
        const cp1y = p1.y + (p2.y - p0.y) * tension
        const cp2x = p2.x - (p3.x - p1.x) * tension
        const cp2y = p2.y - (p3.y - p1.y) * tension
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
      }
      
      // Set line style - use border instead of shadow
      ctx.strokeStyle = theme === 'dark' ? '#a78bfa' : '#818cf8' // Purple/indigo color
      ctx.lineWidth = 2 // Thinner line for sharper look
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      // Remove shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.stroke()
      
      // No tooltip point drawing - removed
    }

    drawChart()

    // Handle resize
    const handleResize = () => {
      drawChart()
    }
    
    // Handle mouse move for tooltip
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || pointsRef.current.length === 0) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Find the closest point to the mouse
      let closestPoint: Point | null = null
      let minDistance = Infinity
      
      pointsRef.current.forEach(point => {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2))
        if (distance < minDistance) {
          minDistance = distance
          closestPoint = point
        }
      })
      
      // Update tooltip when mouse is near a point
      const threshold = isMobile ? 40 : 30
      if (closestPoint && minDistance < threshold) {
        const point = closestPoint as Point
        setTooltip({
          visible: true,
          x: point.x,
          y: point.y,
          date: point.date,
          value: point.value
        })
        
        // Store this as the last valid tooltip
        lastValidTooltipRef.current = {
          x: point.x,
          y: point.y,
          date: point.date,
          value: point.value
        }
        
        // Mark that we've interacted with the chart
        setHasInteracted(true)
        
        // Redraw the chart
        requestAnimationFrame(() => drawChart())
      }
    }
    
    // Handle mouse leave - keep the last tooltip visible
    const handleMouseLeave = () => {
      // Do nothing, keep the last tooltip visible
    }
    
    // Handle click to set tooltip
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || pointsRef.current.length === 0) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // Find the closest point to the click
      let closestPoint: Point | null = null
      let minDistance = Infinity
      
      pointsRef.current.forEach(point => {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2))
        if (distance < minDistance) {
          minDistance = distance
          closestPoint = point
        }
      })
      
      // Set tooltip if click is close enough to a point
      const threshold = isMobile ? 40 : 30
      if (closestPoint && minDistance < threshold) {
        const point = closestPoint as Point
        
        setTooltip({
          visible: true,
          x: point.x,
          y: point.y,
          date: point.date,
          value: point.value
        })
        
        // Store this as the last valid tooltip
        lastValidTooltipRef.current = {
          x: point.x,
          y: point.y,
          date: point.date,
          value: point.value
        }
        
        // Mark that we've interacted with the chart
        setHasInteracted(true)
      }
      
      // Always redraw after click
      requestAnimationFrame(() => drawChart())
    }
    
    window.addEventListener('resize', handleResize)
    containerRef.current.addEventListener('mousemove', handleMouseMove)
    containerRef.current.addEventListener('mouseleave', handleMouseLeave)
    containerRef.current.addEventListener('click', handleClick)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove)
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave)
        containerRef.current.removeEventListener('click', handleClick)
      }
    }
  }, [mounted, chartData, theme, activePeriod, tooltip.visible, isMobile])

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setActivePeriod(newPeriod)
  }

  // Return null if not mounted yet
  if (!mounted) return null

  // Render the chart or error message
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
      {/* Chart container - take most of the height, with no horizontal padding */}
      <div ref={containerRef} className="w-full h-[calc(100%-50px)] relative">
        <canvas ref={canvasRef} className="w-full h-full"></canvas>
        
        {/* Show tooltip if visible or if we have interacted with the chart before */}
        {(tooltip.visible || (hasInteracted && lastValidTooltipRef.current)) && (
          <div 
            className="absolute pointer-events-none bg-white dark:bg-gray-800 border border-soft border-opacity-50 rounded-md px-3 py-2 z-10 transform -translate-x-1/2 -translate-y-full text-xs"
            style={{ 
              left: tooltip.visible ? tooltip.x : (lastValidTooltipRef.current?.x || 0), 
              top: (tooltip.visible ? tooltip.y : (lastValidTooltipRef.current?.y || 0)) - 8,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="font-medium text-indigo-600 dark:text-indigo-300">
              {tooltip.visible 
                ? tooltip.value.toLocaleString() 
                : (lastValidTooltipRef.current?.value || 0).toLocaleString()
              } ₮
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">
              {tooltip.visible 
                ? tooltip.date.toLocaleDateString() 
                : (lastValidTooltipRef.current?.date || new Date()).toLocaleDateString()
              } {isMobile ? '' : (tooltip.visible 
                ? tooltip.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                : (lastValidTooltipRef.current?.date || new Date()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Time filter buttons at bottom - with fixed height and prominent styling */}
      <div className="h-[50px] flex justify-center items-center border-t border-soft border-opacity-50 pt-2 pb-2 bg-white dark:bg-gray-900 rounded-b-lg">
        <div className="flex flex-wrap justify-center items-center gap-1">
          {[
            { id: '1D', label: '1D' },
            { id: '1W', label: '1W' },
            { id: '1M', label: '1M' },
            { id: '3M', label: '3M' },
            { id: '1Y', label: '1Y' },
            { id: 'ALL', label: 'ALL' }
          ].map((periodOption) => (
            <button
              key={periodOption.id}
              className={`px-3 py-1.5 text-sm font-medium rounded-md mx-1 transition-colors ${
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
