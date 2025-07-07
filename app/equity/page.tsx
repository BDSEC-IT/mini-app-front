'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { api } from '@/lib/api'

interface TradingStatus {
  pkId: number
  id: number
  Symbol: string
  mnName: string
  enName: string
  Volume: number
  Turnover: number
  MDSubOrderBookType: string
  LastTradedPrice: number
  PreviousClose: number
  ClosingPrice: number
  OpeningPrice: number
  Changes: number
  Changep: number
  VWAP: number
  MDEntryTime: string
  trades: number
  HighPrice: number
  LowPrice: number
  MarketSegmentID: string
  sizemd: string
  MDEntryPx: number
  sizemd2: string
  MDEntryPx2: number
  HighestBidPrice: number
  LowestOfferPrice: number
  AuctionClearingPrice: number
  Imbalance: number | null
  BuyOrderVWAP: number
  SellOrderVWAP: number
  BuyOrderQty: number
  SellOrderQty: number
  OpenIndicator: string
  CloseIndicator: string
  TradeCondition: string
  securityType: string
  dates: string
  createdAt: string
  updatedAt: string
}

interface SummaryByType {
  name: string
  companyCount: number
  totalTurnover: number
  totalVolume: number
}

export default function EquityPage() {
  const { theme } = useTheme()
  const { t } = useLanguage()
  const [tradingData, setTradingData] = useState<TradingStatus[]>([])
  const [summaryByType, setSummaryByType] = useState<SummaryByType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch trading status data
  useEffect(() => {
    const fetchTradingStatus = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await api.get('/securities/trading-status')
        
        if (response.data.success) {
          const data = response.data.data
          setTradingData(data)
          
          // Calculate summary by type
          const summary = getSummaryByType(data)
          setSummaryByType(summary)
        } else {
          setError('Failed to fetch trading data')
        }
      } catch (err) {
        console.error('Error fetching trading status:', err)
        setError('Failed to load trading data')
      } finally {
        setLoading(false)
      }
    }

    fetchTradingStatus()
  }, [])

  // Helper function to calculate summary by type
  const getSummaryByType = (data: TradingStatus[]): SummaryByType[] => {
    const summary: { [key: string]: SummaryByType } = {}
    
    data.forEach(item => {
      const type = item.MarketSegmentID || 'Бусад'
      if (!summary[type]) {
        summary[type] = { 
          name: type, 
          companyCount: 0, 
          totalTurnover: 0, 
          totalVolume: 0 
        }
      }
      summary[type].companyCount += 1
      summary[type].totalTurnover += item.Turnover || 0
      summary[type].totalVolume += item.Volume || 0
    })
    
    return Object.values(summary)
  }

  // Format number with Mongolian locale
  const formatNumber = (num: number) => {
    return num.toLocaleString('mn-MN')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Хөрөнгийн зах
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Хөрөнгийн захын ерөнхий мэдээлэл
          </p>
        </div>

        {/* Summary Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Ангилалаар нь
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {summaryByType.map((type, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {type.name}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Компани:</span>
                    <span className="text-sm font-semibold text-bdsec dark:text-indigo-400">
                      {formatNumber(type.companyCount)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Үнийн дүн:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(type.totalTurnover)}₮
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Тоо ширхэг:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatNumber(type.totalVolume)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trading Data Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Хөрөнгийн жагсаалт
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Символ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Компани
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Үнэ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Өөрчлөлт
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Эзлэхүүн
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Үнийн дүн
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tradingData.map((item, index) => (
                  <tr key={item.pkId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {item.Symbol}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.mnName}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                      {formatNumber(item.LastTradedPrice)}₮
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      item.Changes > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : item.Changes < 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.Changes > 0 ? '+' : ''}{item.Changes} ({item.Changep > 0 ? '+' : ''}{item.Changep.toFixed(2)}%)
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {formatNumber(item.Volume)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {formatNumber(item.Turnover)}₮
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 