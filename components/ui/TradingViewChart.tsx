'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchTradingHistory, type TradingHistoryData } from '@/lib/api'
import { ChevronDown } from 'lucide-react'

interface TradingViewChartProps {
  symbol?: string
  theme?: string
  period?: string
  onPriceHover?: (price: number | null, change?: number, changePercent?: number) => void
  showChartTypeToggle?: boolean
  defaultChartType?: ChartType
}

interface Point {
  x: number
  y: number
  date: Date
  value: number
  change: number
  changePercent: number
  entryTime: string
  open: number
  high: number
  low: number
  close: number
}

type ChartType = 'line' | 'candlestick';


// Fixed candle colors: green-500 for up, red-500 for down
const candleColors = { up: '#22c55e', down: '#ef4444' }; // Tailwind green-500/red-500

export function TradingViewChart({
  symbol = 'BDS-O-0000',
  theme = 'light',
  period = 'ALL',
  onPriceHover,
  showChartTypeToggle = true,
  defaultChartType = 'line'
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const crosshairRef = useRef<SVGLineElement>(null)
  const [mounted, setMounted] = useState(false)
  const [allChartData, setAllChartData] = useState<TradingHistoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFallbackData, setIsFallbackData] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const pointsRef = useRef<Point[]>([])
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [activePeriod, setActivePeriod] = useState(period)
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  // Removed colorTheme state
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch all data once
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetchTradingHistory(symbol, 1, 1000)
        if (response.success && response.data.length > 0) {
          setAllChartData(response.data.sort((a, b) => new Date(a.dates).getTime() - new Date(b.dates).getTime()))
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
    if (mounted) {
      fetchAllData()
    }
  }, [symbol, mounted])

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        if (rect.width > 0) {
          setContainerSize({ width: rect.width, height: rect.height })
        }
      }
    }
    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [allChartData]) // Rerun on data change

  const drawCandlestickChart = useCallback((svg: SVGSVGElement, points: Point[], options: any) => {
    const { width, height, padding, minPrice, maxPrice, theme } = options;
    const chartHeight = height - padding.top - padding.bottom;
    const bandwidth = (width - padding.left - padding.right) / points.length;
    const candleWidth = Math.max(2, bandwidth * 0.7);

    points.forEach(p => {
      const x = p.x;
      const openY = padding.top + chartHeight - ((p.open - minPrice) / (maxPrice - minPrice)) * chartHeight;
      const highY = padding.top + chartHeight - ((p.high - minPrice) / (maxPrice - minPrice)) * chartHeight;
      const lowY = padding.top + chartHeight - ((p.low - minPrice) / (maxPrice - minPrice)) * chartHeight;
      const closeY = padding.top + chartHeight - ((p.close - minPrice) / (maxPrice - minPrice)) * chartHeight;

      const isBullish = p.close >= p.open;
      const color = isBullish ? candleColors.up : candleColors.down;

      // Wick
      const wick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      wick.setAttribute('x1', x.toString());
      wick.setAttribute('y1', highY.toString());
      wick.setAttribute('x2', x.toString());
      wick.setAttribute('y2', lowY.toString());
      wick.setAttribute('stroke', color);
      wick.setAttribute('stroke-width', '1');
      svg.appendChild(wick);

      // Candle body
      const body = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      body.setAttribute('x', (x - candleWidth / 2).toString());
      body.setAttribute('y', Math.min(openY, closeY).toString());
      body.setAttribute('width', candleWidth.toString());
      body.setAttribute('height', Math.abs(openY - closeY).toString());
      body.setAttribute('fill', color);
      svg.appendChild(body);
    });
  }, []);

  // Draw chart using SVG
  useEffect(() => {
    if (!mounted || !svgRef.current || allChartData.length === 0 || containerSize.width === 0) return

    const now = new Date()
    const periodMap: { [key: string]: number } = { '1M': 30, '3M': 90, '1Y': 365, 'ALL': Infinity }
    
    let filteredData = allChartData
    if (activePeriod !== 'ALL') {
      const days = periodMap[activePeriod]
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filteredData = allChartData.filter(item => new Date(item.dates) >= cutoffDate)
    }

    setIsFallbackData(filteredData.length === 0)
    if (filteredData.length === 0) {
      filteredData = allChartData.slice(-30)
    }

    const svg = svgRef.current
    const { width, height } = containerSize
    const padding = { top: 20, right: 50, bottom: 30, left: 20 }; // Adjusted padding
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    svg.innerHTML = ''

    const selectedColor = '#3b82f6'; // blue-500 for line chart (unchanged)
    
    const prices = filteredData.map(d => d.ClosingPrice)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    
    pointsRef.current = filteredData.map((d, i) => {
      const x = padding.left + (i / (filteredData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.ClosingPrice - minPrice) / (maxPrice - minPrice)) * chartHeight;
      const change = i > 0 ? d.ClosingPrice - filteredData[i - 1].ClosingPrice : 0
      const changePercent = i > 0 && filteredData[i - 1].ClosingPrice !== 0 ? (change / filteredData[i - 1].ClosingPrice) * 100 : 0
      return { 
        x, y, 
        date: new Date(d.dates), 
        value: d.ClosingPrice, 
        change, 
        changePercent, 
        entryTime: d.MDEntryTime,
        open: d.OpeningPrice,
        high: d.HighPrice,
        low: d.LowPrice,
        close: d.ClosingPrice
      }
    })
    
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    gradient.setAttribute('id', 'chartGradient')
    gradient.setAttribute('x1', '0%')
    gradient.setAttribute('y1', '0%')
    gradient.setAttribute('x2', '0%')
    gradient.setAttribute('y2', '100%')
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', selectedColor)
    stop1.setAttribute('stop-opacity', '0.4')
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', selectedColor)
    stop2.setAttribute('stop-opacity', '0')
    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    defs.appendChild(gradient)
    svg.appendChild(defs)

    const points = pointsRef.current
    if (chartType === 'line' && points.length > 1) {
      const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      let pathData = `M ${points[0].x} ${points[0].y}`
      for (let i = 1; i < points.length; i++) pathData += ` L ${points[i].x} ${points[i].y}`
      pathData += ` L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
      areaPath.setAttribute('d', pathData)
      areaPath.setAttribute('fill', 'url(#chartGradient)')
      svg.appendChild(areaPath)

      const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      pathData = `M ${points[0].x} ${points[0].y}`
      for (let i = 1; i < points.length; i++) pathData += ` L ${points[i].x} ${points[i].y}`
      linePath.setAttribute('d', pathData)
      linePath.setAttribute('stroke', selectedColor)
      linePath.setAttribute('stroke-width', '2')
      linePath.setAttribute('fill', 'none')
      svg.appendChild(linePath)
    } else if (chartType === 'candlestick') {
      drawCandlestickChart(svg, points, { width, height, padding, minPrice, maxPrice, theme });
    }
    
    const crosshair = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    crosshair.setAttribute('stroke', theme === 'dark' ? '#9ca3af' : '#6b7280');
    crosshair.setAttribute('stroke-width', '1');
    crosshair.setAttribute('stroke-dasharray', '4 4');
    crosshair.style.display = 'none';
    svg.appendChild(crosshair);
    (crosshairRef as React.MutableRefObject<SVGLineElement>).current = crosshair;

    const xLabelCount = 4;
    const xStep = Math.max(1, Math.floor(points.length / xLabelCount))
    for (let i = 0; i < points.length; i += xStep) {
      const point = points[i]
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', point.x.toString())
      text.setAttribute('y', (height - padding.bottom + 20).toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('font-size', isMobile ? '9px' : '11px')
      text.setAttribute('fill', theme === 'dark' ? '#9ca3af' : '#6b7280')
      text.textContent = point.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      svg.appendChild(text)
    }

    const yLabelCount = 4;
    const priceStep = (maxPrice - minPrice) / (yLabelCount > 1 ? yLabelCount - 1 : 1);
    for (let i = 0; i < yLabelCount; i++) {
        const price = minPrice + (i * priceStep);
        const y = padding.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;
        
        const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        gridLine.setAttribute('x1', padding.left.toString());
        gridLine.setAttribute('y1', y.toString());
        gridLine.setAttribute('x2', (width - padding.right).toString());
        gridLine.setAttribute('y2', y.toString());
        gridLine.setAttribute('stroke', theme === 'dark' ? '#374151' : '#e5e7eb');
        gridLine.setAttribute('stroke-dasharray', '2 2');
        svg.appendChild(gridLine);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (width - padding.right + 10).toString());
        text.setAttribute('y', y.toString());
        text.setAttribute('text-anchor', 'start');
        text.setAttribute('alignment-baseline', 'middle');
        text.setAttribute('font-size', isMobile ? '9px' : '11px');
        text.setAttribute('fill', theme === 'dark' ? '#9ca3af' : '#6b7280');
        text.textContent = price.toFixed(2);
        svg.appendChild(text);
    }
    
  }, [mounted, svgRef, allChartData, containerSize, theme, activePeriod, chartType, drawCandlestickChart]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || pointsRef.current.length === 0) return;

    const handleInteraction = (clientX: number) => {
        const rect = svg.getBoundingClientRect();
        const x = clientX - rect.left;
        const closestPoint = pointsRef.current.reduce((prev, curr) => (Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev));

        if (tooltipRef.current) {
            const tooltip = tooltipRef.current;
            tooltip.style.display = 'block';
            tooltip.innerHTML = `
                <div class="font-semibold text-sm">${closestPoint.value.toLocaleString()} ₮</div>
                <div class="flex items-center text-xs ${closestPoint.change >= 0 ? 'text-green-400' : 'text-red-400'}">
                    <span class="mr-1">${closestPoint.change >= 0 ? '▲' : '▼'}</span>
                    <span>${closestPoint.change.toFixed(2)} (${closestPoint.changePercent.toFixed(2)}%)</span>
                </div>
                <div class="text-gray-400 text-xs font-normal mt-1">${closestPoint.date.toLocaleDateString()}</div>
            `;

            const tooltipWidth = tooltip.offsetWidth;
            const tooltipHeight = tooltip.offsetHeight;
            const containerHeight = rect.height;
            const containerWidth = rect.width;

            let top = closestPoint.y - tooltipHeight / 2;
            if (top < 5) top = 5;
            if (top + tooltipHeight > containerHeight - 5) top = containerHeight - tooltipHeight - 5;

            const gap = 15;
            let left;
            if (closestPoint.x < containerWidth / 2) {
                left = closestPoint.x + gap;
            } else {
                left = closestPoint.x - tooltipWidth - gap;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        }
        if (crosshairRef.current) {
            crosshairRef.current.setAttribute('x1', closestPoint.x.toString());
            crosshairRef.current.setAttribute('y1', '20');
            crosshairRef.current.setAttribute('x2', closestPoint.x.toString());
            crosshairRef.current.setAttribute('y2', (svg.clientHeight - 30).toString());
            crosshairRef.current.style.display = 'block';
        }
    };

    const handleLeave = () => {
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        if (crosshairRef.current) crosshairRef.current.style.display = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => handleInteraction(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) handleInteraction(e.touches[0].clientX);
    };

    svg.addEventListener('mousemove', handleMouseMove);
    svg.addEventListener('touchmove', handleTouchMove, { passive: false });
    svg.addEventListener('mouseleave', handleLeave);
    svg.addEventListener('touchend', handleLeave);

    return () => {
        svg.removeEventListener('mousemove', handleMouseMove);
        svg.removeEventListener('touchmove', handleTouchMove);
        svg.removeEventListener('mouseleave', handleLeave);
        svg.removeEventListener('touchend', handleLeave);
    };
  }, [allChartData, activePeriod, containerSize]);

  useEffect(() => setMounted(true), [])

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="text-center">
          <div className="animate-spin rounded-md h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div>
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
          <p className="mt-4 text-base font-medium text-gray-700 dark:text-gray-100">{t('chart.noData')}</p>
          <p className="mt-2 text-sm font-normal text-gray-500 dark:text-gray-400">{t('chart.tryAnother')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col transition-all duration-300 mb-8">
      {/* Conditional Header Bar for Chart Type Toggle */}
      {showChartTypeToggle && (
        <div className="h-[38px] flex justify-between items-center md:px-4 rounded-lg mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('line')}
              className={`text-center text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                chartType === 'line'
                  ? 'bg-bdsec dark:bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('chart.line')}
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                chartType === 'candlestick'
                  ? 'bg-bdsec dark:bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {t('chart.candlestick')}
            </button>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className={`w-full relative mb-2 ${
          showChartTypeToggle ? 'h-[calc(100%-80px)]' : 'h-[calc(100%-50px)]'
        }`}
      >
        <svg 
          ref={svgRef} 
          className="w-full h-full"
          style={{ transform: 'translate3d(0, 0, 0)' }}
          viewBox={`0 0 ${containerSize.width || 400} ${containerSize.height || 300}`}
          preserveAspectRatio="xMidYMid meet"
        />
        {isFallbackData && (
          <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-md dark:bg-yellow-900 dark:text-yellow-300 z-20">
            No data for this period. Showing most recent data.
          </div>
        )}
        <div 
          ref={tooltipRef} 
          className="absolute pointer-events-none bg-black bg-opacity-75 text-white rounded-md px-2 py-1 z-10 text-xs shadow-lg"
          style={{ display: 'none' }}
        />
      </div>
      <div className="h-[50px] flex justify-center items-center border-t border-gray-200 dark:border-gray-700 border-opacity-70 pt-2 pb-2 rounded-md mt-2">
        <div className="flex justify-center items-center gap-2 sm:gap-2">
          {[
            { id: '1M', label: '1M' },
            { id: '3M', label: '3M' },
            { id: '1Y', label: '1Y' },
            { id: 'ALL', label: 'ALL' }
          ].map((periodOption) => (
            <button
              key={periodOption.id}
              className={` text-xs font-medium px-5 py-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                activePeriod === periodOption.id 
                  ? 'bg-bdsec dark:bg-indigo-500 text-white   ' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700  '
              }`}
              onClick={() => setActivePeriod(periodOption.id)}
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