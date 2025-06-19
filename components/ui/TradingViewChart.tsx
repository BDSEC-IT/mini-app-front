'use client'

import { useEffect, useRef, useState } from 'react'
import { datafeed } from '@/lib/tradingViewDatafeed'

interface TradingViewChartProps {
  symbol?: string
  theme?: string
}

export function TradingViewChart({ symbol = 'MSE:BDSC', theme = 'light' }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mounted, setMounted] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Fetch mock data
    const fetchData = async () => {
      try {
        // Generate 30 days of mock data
        const now = new Date()
        const data = []
        let price = 1000 // Starting price
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)
          
          // Generate random price movement (±2%)
          const change = price * 0.02 * (Math.random() * 2 - 1)
          price += change
          
          data.push({
            date: date.toISOString().split('T')[0],
            price: parseFloat(price.toFixed(2))
          })
        }
        
        setChartData(data)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }
    
    fetchData()
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current || chartData.length === 0) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)
    
    // Set chart dimensions
    const padding = { top: 10, right: 10, bottom: 20, left: 40 }
    const chartWidth = rect.width - padding.left - padding.right
    const chartHeight = rect.height - padding.top - padding.bottom
    
    // Find min and max prices
    const prices = chartData.map(d => d.price)
    const minPrice = Math.min(...prices) * 0.98
    const maxPrice = Math.max(...prices) * 1.02
    const priceRange = maxPrice - minPrice
    
    // Draw background
    ctx.fillStyle = theme === 'dark' ? '#1a1b1e' : '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
    
    // Draw grid
    ctx.strokeStyle = theme === 'dark' ? '#363c4e' : '#f0f3fa'
    ctx.lineWidth = 0.5
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i / 4)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(rect.width - padding.right, y)
      ctx.stroke()
      
      // Price labels
      const price = maxPrice - (priceRange * i / 4)
      ctx.fillStyle = theme === 'dark' ? '#a3a6af' : '#888888'
      ctx.font = '10px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(price.toFixed(0), padding.left - 5, y + 3)
    }
    
    // Vertical grid lines - only draw a few
    const step = Math.ceil(chartData.length / 6)
    for (let i = 0; i < chartData.length; i += step) {
      const x = padding.left + (chartWidth * i / (chartData.length - 1))
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, rect.height - padding.bottom)
      ctx.stroke()
      
      // Date labels
      const date = new Date(chartData[i].date)
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillStyle = theme === 'dark' ? '#a3a6af' : '#888888'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(dateStr, x, rect.height - padding.bottom + 12)
    }
    
    // Draw area chart with gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, rect.height - padding.bottom)
    gradient.addColorStop(0, 'rgba(149, 128, 255, 0.7)')
    gradient.addColorStop(1, 'rgba(149, 128, 255, 0.1)')
    
    // Draw line chart
    ctx.beginPath()
    chartData.forEach((d, i) => {
      const x = padding.left + (chartWidth * i / (chartData.length - 1))
      const y = padding.top + chartHeight - (chartHeight * (d.price - minPrice) / priceRange)
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    // Continue the path to create a closed shape for the area
    const lastX = padding.left + chartWidth
    const lastY = padding.top + chartHeight - (chartHeight * (chartData[chartData.length - 1].price - minPrice) / priceRange)
    
    // Draw the line
    ctx.strokeStyle = '#6c5ce7'
    ctx.lineWidth = 2
    ctx.stroke()
    
    // Create the area
    ctx.lineTo(lastX, rect.height - padding.bottom)
    ctx.lineTo(padding.left, rect.height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }, [mounted, chartData, theme])

  if (!mounted) return null

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

export default TradingViewChart 