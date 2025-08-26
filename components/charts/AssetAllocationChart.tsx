'use client'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useTheme } from '@/contexts/ThemeContext'
import { formatCurrency, calculatePercentage } from '@/lib/chartUtils'
import type { AssetBalance, YieldAnalysis } from '@/lib/api'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface AssetAllocationChartProps {
  assetBalances: AssetBalance[]
  yieldAnalysis: YieldAnalysis[]
  showBalance: boolean
  className?: string
}

export const AssetAllocationChart = ({
  assetBalances,
  yieldAnalysis,
  showBalance,
  className = ''
}: AssetAllocationChartProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const chartRef = useRef<ChartJS<'doughnut'>>(null)

  // Process data for the chart
  const processedData = yieldAnalysis
    .filter(asset => asset.totalNow > 0)
    .sort((a, b) => b.totalNow - a.totalNow)
    .slice(0, 8) // Show top 8 assets

  const totalValue = processedData.reduce((sum, asset) => sum + asset.totalNow, 0)

  // Generate colors for each asset
  const colors = processedData.map((_, index) => {
    const hue = (index * 137.5) % 360 // Golden angle for better color distribution
    return theme === 'dark' 
      ? `hsl(${hue}, 70%, 60%)` 
      : `hsl(${hue}, 60%, 50%)`
  })

  const borderColors = colors.map(color => 
    theme === 'dark' ? color : color.replace('50%)', '40%)')
  )

  const chartData = {
    labels: processedData.map(asset => asset.symbol),
    datasets: [
      {
        data: showBalance ? processedData.map(asset => asset.totalNow) : processedData.map(() => 1),
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 8,
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: false, // We'll create a custom legend
      },
      tooltip: {
        enabled: showBalance,
        backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme === 'dark' ? '#f9fafb' : '#111827',
        bodyColor: theme === 'dark' ? '#d1d5db' : '#374151',
        borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            if (!showBalance) return '***'
            const asset = processedData[context.dataIndex]
            const percentage = calculatePercentage(asset.totalNow, totalValue)
            return `${asset.symbol}: ${formatCurrency(asset.totalNow)} ₮ (${percentage.toFixed(1)}%)`
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart',
    },
    onHover: (event, elements) => {
      if (chartRef.current) {
        chartRef.current.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default'
      }
    },
  }

  // Update chart when theme changes
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update('none')
    }
  }, [theme])

  if (processedData.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('portfolio.noAssetsToDisplay')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('portfolio.startInvestingToSeeAllocation')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart */}
        <div className="flex-1 relative h-64">
          <Doughnut ref={chartRef} data={chartData} options={options} />
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('portfolio.totalValue')}</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {showBalance ? formatCurrency(totalValue) : '***,***'} ₮
              </div>
            </div>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="flex-1 min-w-0">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {processedData.map((asset, index) => {
              const percentage = calculatePercentage(asset.totalNow, totalValue)
              return (
                <div 
                  key={asset.symbol} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colors[index] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {asset.symbol}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {showBalance ? `${percentage.toFixed(1)}%` : '***%'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {showBalance ? formatCurrency(asset.totalNow) : '***,***'} ₮
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}