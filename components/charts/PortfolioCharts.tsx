'use client'

import { useState } from 'react'
import { AssetAllocationChart } from './AssetAllocationChart'
import { ProfitLossChart } from './ProfitLossChart'
import { PieChart, TrendingUp, BarChart3 } from 'lucide-react'
import type { AssetBalance, YieldAnalysis } from '@/lib/api'

interface PortfolioChartsProps {
  assetBalances: AssetBalance[]
  yieldAnalysis: YieldAnalysis[]
  showBalance: boolean
}

export const PortfolioCharts = ({
  assetBalances,
  yieldAnalysis,
  showBalance
}: PortfolioChartsProps) => {
  const [activeTab, setActiveTab] = useState<'allocation' | 'profitloss'>('allocation')

  const hasAssets = yieldAnalysis.length > 0 && yieldAnalysis.some(asset => asset.totalNow > 0)

  if (!hasAssets) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Portfolio Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Start investing to see your portfolio analytics and charts
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-bdsec dark:bg-indigo-600 text-white rounded-lg text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-2" />
            Begin Your Investment Journey
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 overflow-hidden">
      {/* Header with tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="h-6 w-1 bg-bdsec dark:bg-indigo-500 rounded-md"></span>
            Portfolio Analytics
          </h3>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('allocation')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'allocation'
                ? 'bg-white dark:bg-gray-700 text-bdsec dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Asset Allocation
          </button>
          <button
            onClick={() => setActiveTab('profitloss')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'profitloss'
                ? 'bg-white dark:bg-gray-700 text-bdsec dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Profit & Loss
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        <div className="transition-all duration-300 ease-in-out">
          {activeTab === 'allocation' ? (
            <AssetAllocationChart
              assetBalances={assetBalances}
              yieldAnalysis={yieldAnalysis}
              showBalance={showBalance}
            />
          ) : (
            <ProfitLossChart
              yieldAnalysis={yieldAnalysis}
              showBalance={showBalance}
            />
          )}
        </div>
      </div>

      {/* Footer with summary stats */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 px-6 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Assets</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {yieldAnalysis.filter(asset => asset.totalNow > 0).length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profitable</div>
            <div className="text-sm font-semibold text-green-600 dark:text-green-400">
              {yieldAnalysis.filter(asset => asset.profit > 0).length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unprofitable</div>
            <div className="text-sm font-semibold text-red-600 dark:text-red-400">
              {yieldAnalysis.filter(asset => asset.profit < 0).length}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Neutral</div>
            <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {yieldAnalysis.filter(asset => asset.profit === 0).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}