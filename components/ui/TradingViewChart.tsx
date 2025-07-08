'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchTradingHistory, type TradingHistoryData, type TradingHistoryResponse } from '@/lib/api'

// Define the TradingHistoryData interface to match the API response
// interface TradingHistoryData {
//   id: number
//   Symbol: string
//   MDSubOrderBookType: string
//   OpeningPrice: number
//   ClosingPrice: number
//   HighPrice: number
//   LowPrice: number
//   VWAP: number
//   Volume: number
//   HighestBidPrice: number
//   LowestOfferPrice: number
//   PreviousClose: number
//   BuyOrderQty: number
//   SellOrderQty: number
//   Turnover: number
//   Trades: number
//   MDEntryTime: string
//   companycode: number
//   MarketSegmentID: string
//   securityType: string
//   dates: string
// }

// Define the response interface for the API
// interface TradingHistoryResponse {
//   success: boolean
//   data: TradingHistoryData[]
//   pagination: {
//     total: number
//     totalPages: number
//     currentPage: number
//     limit: number
//   }
// }

// Function to fetch trading history data
// async function fetchTradingHistory(symbol: string, page: number = 1, limit: number = 100): Promise<TradingHistoryResponse> {
//   const BASE_URL = 'https://miniapp.bdsec.mn/apitest'
//   const url = `${BASE_URL}/securities/trading-history?page=${page}&limit=${limit}&sortField&sortOrder=desc&symbol=${symbol}`
//   
//   try {
//     // Create an abort controller with a timeout
//     const controller = new AbortController()
//     const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
//     
//     const response = await fetch(url, { 
//       method: 'GET',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json',
//       },
//       signal: controller.signal
//     })
//     
//     // Clear the timeout since we got a response
//     clearTimeout(timeoutId)
//     
//     if (!response.ok) {
//       console.error(`API error: ${response.status} ${response.statusText}`)
//       throw new Error(`Failed to fetch trading history data: ${response.status}`)
//     }
//     
//     return response.json()
//   } catch (error) {
//     console.error('Fetch error:', error)
//     
//     // Return mock data as fallback when API is unavailable
//     console.log('Using fallback mock data for symbol:', symbol)
//     return generateMockHistoryResponse(symbol, page, limit)
//   }
// }

// Function to generate mock history data as fallback
// function generateMockHistoryResponse(symbol: string, page: number, limit: number): TradingHistoryResponse {
//   // Generate mock data for the requested symbol
//   const mockData: TradingHistoryData[] = []
//   const today = new Date()
//   const basePrice = 10000 + Math.random() * 5000 // Random base price between 10,000 and 15,000
//   
//   // Generate data points for the last 100 days
//   for (let i = 100; i >= 0; i--) {
//     const date = new Date(today)
//     date.setDate(date.getDate() - i)
//     
//     // Generate realistic price movements
//     const dailyVolatility = 0.02 // 2% daily volatility
//     const priceChange = basePrice * dailyVolatility * (Math.random() * 2 - 1)
//     const dayPrice = basePrice + (priceChange * (100 - i) / 10) // Slight trend over time
//     
//     // Create mock data point
//     mockData.push({
//       id: i,
//       Symbol: symbol,
//       MDSubOrderBookType: "0",
//       OpeningPrice: dayPrice * (0.98 + Math.random() * 0.04),
//       ClosingPrice: dayPrice,
//       HighPrice: dayPrice * (1 + Math.random() * 0.03),
//       LowPrice: dayPrice * (0.97 + Math.random() * 0.03),
//       VWAP: dayPrice * (0.99 + Math.random() * 0.02),
//       Volume: Math.floor(Math.random() * 10000) + 1000,
//       HighestBidPrice: dayPrice * 0.99,
//       LowestOfferPrice: dayPrice * 1.01,
//       PreviousClose: dayPrice * (0.99 + Math.random() * 0.02),
//       BuyOrderQty: Math.floor(Math.random() * 5000) + 500,
//       SellOrderQty: Math.floor(Math.random() * 5000) + 500,
//       Turnover: Math.floor(Math.random() * 100000000) + 10000000,
//       Trades: Math.floor(Math.random() * 100) + 10,
//       MDEntryTime: "14:00:00",
//       companycode: 123,
//       MarketSegmentID: "MAIN",
//       securityType: "STOCK",
//       dates: date.toISOString().split('T')[0]
//     })
//   }
//   
//   // Calculate pagination
//   const startIndex = (page - 1) * limit
//   const endIndex = startIndex + limit
//   const paginatedData = mockData.slice(startIndex, endIndex)
//   
//   return {
//     success: true,
//     data: paginatedData,
//     pagination: {
//       total: mockData.length,
//       totalPages: Math.ceil(mockData.length / limit),
//       currentPage: page,
//       limit: limit
//     }
//   }
// }

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<TradingHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFallbackData, setIsFallbackData] = useState(false);
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
  // Track if we've ever shown a tooltip
  const [hasInteracted, setHasInteracted] = useState(false)
  // Store the last valid tooltip
  const lastValidTooltipRef = useRef<{x: number, y: number, date: Date, value: number, change: number, changePercent: number, entryTime: string} | null>(null)
  
  const pointsRef = useRef<Point[]>([])
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [activePeriod, setActivePeriod] = useState(period)
  
  // Cache for filtered data by period
  const dataCache = useRef<{[key: string]: TradingHistoryData[]}>({})
  // Reference to store all fetched data
  const allDataRef = useRef<TradingHistoryData[]>([])
  // Track if data has been fetched
  const dataFetchedRef = useRef(false)

  // Store the latest price in a ref to maintain it across renders
  const latestPriceRef = useRef<number | null>(null)
  
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

  // Update latest price and time when chart data changes
  useEffect(() => {
    if (chartData.length > 0) {
      const sortedData = [...chartData].sort((a, b) => new Date(b.dates).getTime() - new Date(a.dates).getTime())
      const latestData = sortedData[0];
      
      latestPriceRef.current = latestData.ClosingPrice
      
      if (onPriceHover && !tooltip.visible) {
        onPriceHover(latestData.ClosingPrice, undefined, undefined)
      }
      
      // Pass the latest MDEntryTime to parent component
      if (onLatestTimeUpdate && latestData.MDEntryTime) {
        onLatestTimeUpdate(latestData.MDEntryTime)
      }
    }
  }, [chartData, onPriceHover, onLatestTimeUpdate, tooltip.visible])

  // Filter data based on the selected time period
  const filterDataByPeriod = useCallback((data: TradingHistoryData[], period: string): TradingHistoryData[] => {
    if (!data.length) {
      setIsFallbackData(false);
      return [];
    }
    
    if (period === 'ALL') {
      setIsFallbackData(false);
      dataCache.current[period] = data
      return data
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    
    // Calculate start date based on period
    switch (period) {
      case '1W':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        break
      case '1M':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        break
      case '3M':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
        break
      case '1Y':
        startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        break
      default:
        startDate = new Date(0) // Beginning of time for 'ALL'
    }
    
    const filteredData = data.filter(point => {
      const pointDate = new Date(point.dates);
      const normalizedPointDate = new Date(pointDate.getFullYear(), pointDate.getMonth(), pointDate.getDate());
      return normalizedPointDate >= startDate;
    });
    
    // If filtering results in no data, fall back to the 30 most recent data points
    if (filteredData.length === 0 && data.length > 0) {
      setIsFallbackData(true);
      return data.slice(0, 30);
    }
    
    setIsFallbackData(false);
    dataCache.current[period] = filteredData
    
    return filteredData
  }, [])

  // Fetch all data at once
  const fetchAllData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // If we've already fetched data, use it
      if (dataFetchedRef.current && allDataRef.current.length > 0) {
        // Filter the already fetched data based on the selected period
        const filteredData = filterDataByPeriod(allDataRef.current, activePeriod)
        setChartData(filteredData)
        setIsLoading(false)
        return
      }
      
      // Fetch data from API
      const response = await fetchTradingHistory(symbol, 1, 500)
      
      if (response.success && response.data) {
        // Store all data in ref
        allDataRef.current = response.data
        dataFetchedRef.current = true
        
        // Filter based on selected period
        const filteredData = filterDataByPeriod(response.data, activePeriod)
        setChartData(filteredData)
        
        // Check if we're using fallback data
        setIsFallbackData(response.data.length > 0 && !response.data[0].dates.includes('-'))
      } else {
        console.error('Failed to fetch trading history data')
        setError('Failed to load chart data')
        setIsFallbackData(true)
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
      setError('Failed to load chart data')
      setIsFallbackData(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data when component mounts or symbol/period changes
  useEffect(() => {
    if (mounted) {
      console.log(`Symbol or period changed: ${symbol}, ${activePeriod}`)
      
      // If symbol changes, clear the cache and fetch new data
      if (symbol !== allDataRef.current[0]?.Symbol) {
        console.log('Symbol changed, clearing cache')
        dataFetchedRef.current = false
        dataCache.current = {}
        allDataRef.current = []
      }
      
      fetchAllData()
    }
  }, [symbol, activePeriod, mounted])

  // Set up the chart when data changes
  useEffect(() => {
    if (!mounted || !canvasRef.current || chartData.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    
    // Scale context to match device pixel ratio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    // Clear canvas and set transparent background
    ctx.clearRect(0, 0, rect.width, rect.height)
    
    // Sort data by date
    const sortedData = [...chartData].sort((a, b) => {
      return new Date(a.dates).getTime() - new Date(b.dates).getTime()
    })
    
    if (sortedData.length === 0) return
    
    // Find min and max values for scaling
    const prices = sortedData.map(d => d.ClosingPrice)
    const minPrice = Math.min(...prices) * 0.99 // Add some padding
    const maxPrice = Math.max(...prices) * 1.01 // Add some padding
    const priceRange = maxPrice - minPrice
    
    // Create points for the chart
    const points: Point[] = sortedData.map((d, i) => {
      const date = new Date(d.dates)
      const x = sortedData.length > 1 ? (i / (sortedData.length - 1)) * rect.width : rect.width / 2
      const y = rect.height - ((d.ClosingPrice - minPrice) / priceRange) * (rect.height * 0.8) - (rect.height * 0.1)
      
      const change = i > 0 ? d.ClosingPrice - sortedData[i - 1].ClosingPrice : 0;
      const changePercent = i > 0 && sortedData[i - 1].ClosingPrice !== 0
        ? (change / sortedData[i - 1].ClosingPrice) * 100
        : 0;
        
      return { x, y, date, value: d.ClosingPrice, change, changePercent, entryTime: d.MDEntryTime }
    })
    
    // Store points for interaction
    pointsRef.current = points
    
    // Draw grid lines
    ctx.strokeStyle = theme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.2)'
    ctx.lineWidth = 1
    
    // Horizontal grid lines - responsive to screen size
    const numHLines = rect.width < 400 ? 3 : 4
    for (let i = 0; i <= numHLines; i++) {
      const y = rect.height * 0.1 + (rect.height * 0.8 * i) / numHLines
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
      
      // Price labels
      const price = maxPrice - (priceRange * i) / numHLines
      ctx.fillStyle = theme === 'dark' ? 'rgba(203, 213, 225, 0.8)' : 'rgba(71, 85, 105, 0.8)'
      ctx.font = rect.width < 400 ? '9px sans-serif' : '10px sans-serif'
      ctx.textAlign = 'left'
      
      // Format price based on screen size
      const priceText = rect.width < 400 
        ? price.toLocaleString(undefined, { maximumFractionDigits: 0 })
        : price.toLocaleString()
      
      ctx.fillText(priceText, 5, y - 3)
    }
    
    // Vertical grid lines - responsive to screen size
    if (sortedData.length > 5) {
      // Determine number of vertical lines based on screen width
      const maxVLines = rect.width < 400 ? 3 : rect.width < 600 ? 4 : 6
      const numVLines = Math.min(sortedData.length, maxVLines)
      
      for (let i = 0; i <= numVLines; i++) {
        const x = (rect.width * i) / numVLines
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rect.height)
        ctx.stroke()
        
        // Date labels - only show on selected lines to prevent stacking
        if (i < numVLines && i % (rect.width < 400 ? 1 : 1) === 0) {
          const dataIndex = Math.floor((sortedData.length - 1) * i / numVLines)
          const date = new Date(sortedData[dataIndex].dates)
          ctx.fillStyle = theme === 'dark' ? 'rgba(203, 213, 225, 0.8)' : 'rgba(71, 85, 105, 0.8)'
          ctx.font = rect.width < 400 ? '9px sans-serif' : '10px sans-serif'
          ctx.textAlign = 'center'
          
          // Format date based on screen size
          const dateText = rect.width < 400 
            ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : date.toLocaleDateString()
          
          ctx.fillText(dateText, x, rect.height - 5)
        }
      }
    }
    
    // Draw price line with purple/indigo color
    if (points.length > 1) {
      ctx.strokeStyle = theme === 'dark' ? '#818cf8' : '#4f46e5'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      
      ctx.stroke()
      
      // Fill area under the line
      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
      if (theme === 'dark') {
        gradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)')
        gradient.addColorStop(1, 'rgba(129, 140, 248, 0)')
      } else {
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.3)')
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)')
      }
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      
      ctx.lineTo(points[points.length - 1].x, rect.height)
      ctx.lineTo(points[0].x, rect.height)
      ctx.closePath()
      ctx.fill()
    } else if (points.length === 1) {
        // Draw a single dot for a single data point
        ctx.beginPath()
        ctx.arc(points[0].x, points[0].y, 4, 0, Math.PI * 2)
        ctx.fillStyle = theme === 'dark' ? '#818cf8' : '#4f46e5'
        ctx.fill()
    }
    
  }, [chartData, theme, mounted])

  // Set up mouse interaction
  useEffect(() => {
    if (!mounted || !containerRef.current) return
    
    const container = containerRef.current
    
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        
        // Redraw chart
        const event = new Event('resize')
        window.dispatchEvent(event)
      }
    }
    
    const handleMouseMove = (e: MouseEvent) => {
      if (pointsRef.current.length === 0) return
      
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      
      // Find closest point
      let closestPoint = pointsRef.current[0]
      let minDistance = Math.abs(closestPoint.x - x)
      
      for (let i = 1; i < pointsRef.current.length; i++) {
        const distance = Math.abs(pointsRef.current[i].x - x)
        if (distance < minDistance) {
          minDistance = distance
          closestPoint = pointsRef.current[i]
        }
      }
      
      // Update tooltip with full data
      setTooltip({
        visible: true,
        x: closestPoint.x,
        y: closestPoint.y,
        date: closestPoint.date,
        value: closestPoint.value,
        change: closestPoint.change,
        changePercent: closestPoint.changePercent,
        entryTime: closestPoint.entryTime
      })
      
      // Store last valid tooltip
      lastValidTooltipRef.current = {
        x: closestPoint.x,
        y: closestPoint.y,
        date: closestPoint.date,
        value: closestPoint.value,
        change: closestPoint.change,
        changePercent: closestPoint.changePercent,
        entryTime: closestPoint.entryTime
      }
      
      // Mark that we've interacted with the chart
      setHasInteracted(true)
      
      // Notify parent component of price hover
      if (onPriceHover) {
        onPriceHover(closestPoint.value, closestPoint.change, closestPoint.changePercent)
      }
    }
    
    const handleMouseLeave = () => {
      setTooltip(prev => ({ ...prev, visible: false }))
      
      // Reset to latest price when not hovering
      if (onPriceHover && latestPriceRef.current !== null) {
        onPriceHover(null)
      }
    }
    
    const handleClick = (e: MouseEvent) => {
      // Implement click handling if needed
    }
    
    // Add event listeners
    window.addEventListener('resize', handleResize)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('click', handleClick)
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('click', handleClick)
    }
  }, [mounted, onPriceHover])

  // Set mounted state when component mounts
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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
        
        {isFallbackData && (
          <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300 z-20">
            No data for this period. Showing most recent data.
          </div>
        )}
        
        {/* Updated Tooltip with smart positioning */}
        {(tooltip.visible || (hasInteracted && lastValidTooltipRef.current)) && (
          <div 
            className="absolute pointer-events-none bg-white dark:bg-gray-800 border border-soft border-opacity-50 rounded-md px-3 py-2 z-10 text-xs shadow-lg"
            style={{ 
              left: (() => {
                const tooltipX = tooltip.visible ? tooltip.x : (lastValidTooltipRef.current?.x || 0)
                const containerWidth = containerRef.current?.offsetWidth || 0
                const tooltipWidth = 120 // Approximate tooltip width
                const margin = 10 // Minimum margin from edges
                
                // Calculate the ideal centered position
                let left = tooltipX - (tooltipWidth / 2)
                
                // Adjust if tooltip would go off the left edge
                if (left < margin) {
                  left = margin
                }
                
                // Adjust if tooltip would go off the right edge
                if (left + tooltipWidth > containerWidth - margin) {
                  left = containerWidth - tooltipWidth - margin
                }
                
                return `${left}px`
              })(),
              top: (() => {
                const tooltipY = tooltip.visible ? tooltip.y : (lastValidTooltipRef.current?.y || 0)
                const tooltipHeight = 80 // Approximate tooltip height
                const margin = 10 // Minimum margin from edges
                
                // Position tooltip above the point
                let top = tooltipY - tooltipHeight - margin
                
                // If tooltip would go above the container, position it below the point
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
              {/* {(tooltip.visible ? tooltip.entryTime : (lastValidTooltipRef.current?.entryTime || '')) && (
                <span className="ml-2">
                  {(tooltip.visible ? tooltip.entryTime : (lastValidTooltipRef.current?.entryTime || ''))}
                </span>
              )} */}
            </div>
          </div>
        )}
      </div>
      
      {/* Time filter buttons at bottom - with fixed height and prominent styling */}
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
