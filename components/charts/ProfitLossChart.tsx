'use client'

import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { useTheme } from '@/contexts/ThemeContext'
import { formatCurrency, calculatePercentage, getChartColors } from '@/lib/chartUtils'
import type { YieldAnalysis } from '@/lib/api'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend)

interface ProfitLossChartProps {
  yieldAnalysis: YieldAnalysis[]
  showBalance: boolean
  className?: string
}

export const ProfitLossChart = ({
  yieldAnalysis,
  showBalance,
  className = ''
}: ProfitLossChartProps) => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const chartRef = useRef<ChartJS<'doughnut'>>(null)
  const colors = getChartColors(theme)

  // Process profit/loss data
  const profitLossData = yieldAnalysis.reduce(
    (acc, asset) => {
      if (asset.profit > 0) {
        acc.profitable += asset.profit
        acc.profitableCount += 1
      } else if (asset.profit < 0) {
        acc.unprofitable += Math.abs(asset.profit)
        acc.unprofitableCount += 1
      } else {
        acc.neutral += asset.totalNow
        acc.neutralCount += 1
      }
      return acc
    },
    { 
      profitable: 0, 
      unprofitable: 0, 
      neutral: 0,
      profitableCount: 0,
      unprofitableCount: 0,
      neutralCount: 0
    }
  )

  const totalValue = profitLossData.profitable + profitLossData.unprofitable + profitLossData.neutral
  const hasData = totalValue > 0

  // Prepare chart data
  const chartLabels: string[] = []
  const chartValues: number[] = []
  const chartColors: string[] = []

  if (profitLossData.profitable > 0) {
    chartLabels.push(t('portfolio.profitable'))
    chartValues.push(showBalance ? profitLossData.profitable : 1)
    chartColors.push(colors.profitable)
  }

  if (profitLossData.unprofitable > 0) {
    chartLabels.push(t('portfolio.unprofitable'))
    chartValues.push(showBalance ? profitLossData.unprofitable : 1)
    chartColors.push(colors.unprofitable)
  }

  if (profitLossData.neutral > 0) {
    chartLabels.push(t('portfolio.neutral'))
    chartValues.push(showBalance ? profitLossData.neutral : 1)
    chartColors.push(colors.neutral)
  }

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: chartColors,
        borderColor: chartColors.map(color => color),
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
        display: false,
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
            const value = chartValues[context.dataIndex]
            const percentage = calculatePercentage(value, totalValue)
            const label = chartLabels[context.dataIndex]
            return `${label}: ${formatCurrency(value)} ₮ (${percentage.toFixed(1)}%)`
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

  if (!hasData) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('portfolio.noProfitLossData')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('portfolio.startTradingToSeePerformance')}</p>
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
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('portfolio.netPL')}</div>
              <div className={`text-lg font-bold ${
                (profitLossData.profitable - profitLossData.unprofitable) >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {showBalance 
                  ? `${(profitLossData.profitable - profitLossData.unprofitable) >= 0 ? '+' : ''}${formatCurrency(profitLossData.profitable - profitLossData.unprofitable)} ₮`
                  : '***,*** ₮'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0">
          <div className="space-y-3">
            {profitLossData.profitable > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-3">
                  <div className="p-1 rounded-full bg-green-100 dark:bg-green-800">
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      {t('portfolio.profitableAssets')}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {profitLossData.profitableCount} {t('portfolio.assets')} • {showBalance ? calculatePercentage(profitLossData.profitable, totalValue).toFixed(1) : '***'}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                    +{showBalance ? formatCurrency(profitLossData.profitable) : '***,***'} ₮
                  </p>
                </div>
              </div>
            )}

            {profitLossData.unprofitable > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-3">
                  <div className="p-1 rounded-full bg-red-100 dark:bg-red-800">
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      {t('portfolio.unprofitableAssets')}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {profitLossData.unprofitableCount} {t('portfolio.assets')} • {showBalance ? calculatePercentage(profitLossData.unprofitable, totalValue).toFixed(1) : '***'}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                    -{showBalance ? formatCurrency(profitLossData.unprofitable) : '***,***'} ₮
                  </p>
                </div>
              </div>
            )}

            {profitLossData.neutral > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-1 rounded-full bg-gray-100 dark:bg-gray-700">
                    <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {t('portfolio.neutralAssets')}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {profitLossData.neutralCount} {t('portfolio.assets')} • {showBalance ? calculatePercentage(profitLossData.neutral, totalValue).toFixed(1) : '***'}%
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {showBalance ? formatCurrency(profitLossData.neutral) : '***,***'} ₮
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}