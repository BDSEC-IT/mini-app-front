import type { AssetBalance, YieldAnalysis } from '@/lib/api'

export interface ProcessedChartData {
  assetAllocation: {
    labels: string[]
    values: number[]
    colors: string[]
  }
  profitLoss: {
    profitable: number
    unprofitable: number
    neutral: number
  }
}

// Generate consistent colors for assets
export const generateColorForAsset = (symbol: string, theme: 'light' | 'dark' = 'light'): string => {
  const colors = theme === 'dark' 
    ? [
        '#10b981', // emerald-500
        '#6366f1', // indigo-500
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#8b5cf6', // violet-500
        '#06b6d4', // cyan-500
        '#84cc16', // lime-500
        '#f97316', // orange-500
        '#ec4899', // pink-500
        '#14b8a6', // teal-500
      ]
    : [
        '#059669', // emerald-600
        '#4f46e5', // indigo-600
        '#d97706', // amber-600
        '#dc2626', // red-600
        '#7c3aed', // violet-600
        '#0891b2', // cyan-600
        '#65a30d', // lime-600
        '#ea580c', // orange-600
        '#db2777', // pink-600
        '#0d9488', // teal-600
      ]

  // Create a simple hash from the symbol
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    const char = symbol.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// Process portfolio data for charts
export const processPortfolioData = (
  assetBalances: AssetBalance[],
  yieldAnalysis: YieldAnalysis[],
  theme: 'light' | 'dark' = 'light'
): ProcessedChartData => {
  // Process asset allocation
  const assetAllocation = yieldAnalysis
    .filter(asset => asset.totalNow > 0)
    .map(asset => ({
      label: asset.symbol,
      value: asset.totalNow,
      color: generateColorForAsset(asset.symbol, theme)
    }))
    .sort((a, b) => b.value - a.value) // Sort by value descending

  // Process profit/loss distribution
  const profitLoss = yieldAnalysis.reduce(
    (acc, asset) => {
      if (asset.profit > 0) {
        acc.profitable += asset.profit
      } else if (asset.profit < 0) {
        acc.unprofitable += Math.abs(asset.profit)
      } else {
        acc.neutral += asset.totalNow
      }
      return acc
    },
    { profitable: 0, unprofitable: 0, neutral: 0 }
  )

  return {
    assetAllocation: {
      labels: assetAllocation.map(item => item.label),
      values: assetAllocation.map(item => item.value),
      colors: assetAllocation.map(item => item.color)
    },
    profitLoss
  }
}

// Format currency for display
export const formatCurrency = (amount: number, currency = 'MNT'): string => {
  return new Intl.NumberFormat('mn-MN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

// Calculate percentage of total
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0
  return (value / total) * 100
}

// Validate chart data
export const validateChartData = (data: any[]): boolean => {
  if (!Array.isArray(data) || data.length === 0) return false
  
  return data.every(item => 
    typeof item === 'number' && 
    !isNaN(item) && 
    isFinite(item) && 
    item >= 0
  )
}

// Get chart colors based on theme
export const getChartColors = (theme: 'light' | 'dark') => {
  return {
    profitable: theme === 'dark' ? '#10b981' : '#059669', // emerald
    unprofitable: theme === 'dark' ? '#ef4444' : '#dc2626', // red
    neutral: theme === 'dark' ? '#6b7280' : '#4b5563', // gray
    background: theme === 'dark' ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    text: theme === 'dark' ? '#f9fafb' : '#111827'
  }
}