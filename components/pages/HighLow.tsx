'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react'
import { fetch52WeekHighLow, type WeekHighLowData } from '@/lib/api'

const HighLow = () => {
  const { t } = useTranslation()
  const [highLowData, setHighLowData] = useState<WeekHighLowData[]>([])
  const [filteredData, setFilteredData] = useState<WeekHighLowData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'low'>('all')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WeekHighLowData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' })

  // Fetch 52-week high/low data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch52WeekHighLow()
      if (response.success && response.data) {
        setHighLowData(response.data)
        setFilteredData(response.data)
      }
    } catch (err) {
      console.error('Error fetching 52-week high/low data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
  }

  // Handle sorting
  const handleSort = (key: keyof WeekHighLowData) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...highLowData]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.mnTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.enTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply tab filter
    switch (activeTab) {
      case 'high':
        // Sort by 52-week high price (descending)
        filtered.sort((a, b) => (b['52high'] || 0) - (a['52high'] || 0))
        break
      case 'low':
        // Sort by 52-week low price (ascending)
        filtered.sort((a, b) => (a['52low'] || 0) - (b['52low'] || 0))
        break
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle special cases for 52high and 52low with bracket notation
        if (sortConfig.key === '52high' as keyof WeekHighLowData || 
            sortConfig.key === '52low' as keyof WeekHighLowData) {
          const aValue = a[sortConfig.key as keyof WeekHighLowData] as number;
          const bValue = b[sortConfig.key as keyof WeekHighLowData] as number;
          
          if (aValue === null || aValue === undefined) return 1
          if (bValue === null || bValue === undefined) return -1
          
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue === null || aValue === undefined) return 1
        if (bValue === null || bValue === undefined) return -1
        
        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
        
        // Handle number comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0
      })
    }
    
    setFilteredData(filtered)
  }, [highLowData, searchTerm, activeTab, sortConfig])

  // Fetch data on component mount
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Format price
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || isNaN(price)) return '-'
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString // Return original if invalid date
      
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '.')
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 md:px-6 py-6">
        <h1 className="text-xl font-bold mb-6">{t('highLow.title', '52-Week High/Low')}</h1>
        
        {/* Search and filters */}
        <div className="mb-6">
          {/* Search bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bdsec focus:border-bdsec block w-full pl-10 p-2.5"
              placeholder={t('highLow.searchPlaceholder', 'Search stocks...')}
              value={searchTerm}
              onChange={handleSearch}
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={clearSearch}
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-4 text-sm font-medium ${
                activeTab === 'all'
                  ? 'text-bdsec dark:text-indigo-400 border-b-2 border-bdsec dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
              }`}
            >
              {t('highLow.allStocks', 'All Stocks')}
            </button>
            <button
              onClick={() => setActiveTab('high')}
              className={`py-2 px-4 text-sm font-medium flex items-center ${
                activeTab === 'high'
                  ? 'text-bdsec dark:text-indigo-400 border-b-2 border-bdsec dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              {t('highLow.highestPrices', '52-Week Highs')}
            </button>
            <button
              onClick={() => setActiveTab('low')}
              className={`py-2 px-4 text-sm font-medium flex items-center ${
                activeTab === 'low'
                  ? 'text-bdsec dark:text-indigo-400 border-b-2 border-bdsec dark:border-indigo-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
              }`}
            >
              <TrendingDown className="w-4 h-4 mr-1" />
              {t('highLow.lowestPrices', '52-Week Lows')}
            </button>
          </div>
        </div>
        
        {/* Data table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-bdsec border-t-transparent rounded-full"></div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-10">
              <p>{t('highLow.noResults', 'No results found')}</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('Symbol')}>
                    <div className="flex items-center">
                      {t('highLow.symbol', 'Symbol')}
                      {sortConfig.key === 'Symbol' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('mnTitle')}>
                    <div className="flex items-center">
                      {t('highLow.name', 'Name')}
                      {sortConfig.key === 'mnTitle' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('52high' as keyof WeekHighLowData)}>
                    <div className="flex items-center">
                      {t('highLow.high', '52W High')}
                      {sortConfig.key === '52high' as keyof WeekHighLowData && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('52low' as keyof WeekHighLowData)}>
                    <div className="flex items-center">
                      {t('highLow.low', '52W Low')}
                      {sortConfig.key === '52low' as keyof WeekHighLowData && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('last_closing_price')}>
                    <div className="flex items-center">
                      {t('highLow.lastPrice', 'Last Price')}
                      {sortConfig.key === 'last_closing_price' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('last_closing_date')}>
                    <div className="flex items-center">
                      {t('highLow.lastDate', 'Last Date')}
                      {sortConfig.key === 'last_closing_date' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('trade_count')}>
                    <div className="flex items-center">
                      {t('highLow.tradeCount', 'Trades')}
                      {sortConfig.key === 'trade_count' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const high52 = item['52high'] || 0;
                  const low52 = item['52low'] || 0;
                  const lastPrice = item.last_closing_price || 0;
                  
                  const isNearHigh = lastPrice >= high52 * 0.95;
                  const isNearLow = lastPrice <= low52 * 1.05;
                  
                  return (
                    <tr 
                      key={item.Symbol} 
                      className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-3 font-medium">{item.Symbol}</td>
                      <td className="px-4 py-3">{item.mnTitle}</td>
                      <td className="px-4 py-3 text-green-500 dark:text-green-400 font-medium">
                        {formatPrice(high52)} ₮
                      </td>
                      <td className="px-4 py-3 text-red-500 dark:text-red-400 font-medium">
                        {formatPrice(low52)} ₮
                      </td>
                      <td className={`px-4 py-3 font-medium ${
                        isNearHigh ? 'text-green-500 dark:text-green-400' : 
                        isNearLow ? 'text-red-500 dark:text-red-400' : ''
                      }`}>
                        {formatPrice(lastPrice)} ₮
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(item.last_closing_date)}
                      </td>
                      <td className="px-4 py-3">
                        {item.trade_count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default HighLow 