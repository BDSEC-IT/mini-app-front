'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ChevronDown, Search, X } from 'lucide-react'
import { fetchAllStocks, type StockData } from '@/lib/api'

const AllStocks = () => {
  const { t } = useTranslation()
  const [allStocks, setAllStocks] = useState<StockData[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' })

  // Fetch all stocks data
  const fetchStocksData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchAllStocks()
      if (response.success && response.data) {
        const uniqueStocks = filterUniqueStocks(response.data)
        setAllStocks(uniqueStocks)
        setFilteredStocks(uniqueStocks)
      }
    } catch (err) {
      console.error('Error fetching stocks:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Filter unique stocks (removing duplicates with -O-0000 suffix)
  const filterUniqueStocks = (stocks: StockData[]) => {
    const uniqueSymbols = new Map<string, StockData>()
    
    stocks.forEach(stock => {
      const baseSymbol = stock.Symbol.split('-')[0]
      if (!uniqueSymbols.has(baseSymbol)) {
        // Store with clean symbol
        const cleanStock = {...stock}
        cleanStock.Symbol = baseSymbol
        uniqueSymbols.set(baseSymbol, cleanStock)
      }
    })
    
    return Array.from(uniqueSymbols.values())
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm('')
  }

  // Handle sorting
  const handleSort = (key: keyof StockData) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // Apply sorting
  const sortedStocks = useCallback(() => {
    if (!sortConfig.key) return filteredStocks
    
    return [...filteredStocks].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredStocks, sortConfig])

  // Filter stocks based on search and active tab
  useEffect(() => {
    let filtered = [...allStocks]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(stock => 
        stock.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (stock.mnName && stock.mnName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stock.enName && stock.enName.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Apply tab filter
    switch (activeTab) {
      case 'active':
        // Show stocks with recent activity
        filtered = filtered.filter(stock => stock.Volume && stock.Volume > 0)
        break
      case 'gainers':
        filtered = filtered.filter(stock => stock.Changep > 0)
        break
      case 'losers':
        filtered = filtered.filter(stock => stock.Changep < 0)
        break
    }
    
    setFilteredStocks(filtered)
  }, [allStocks, searchTerm, activeTab])

  // Fetch data on component mount
  useEffect(() => {
    fetchStocksData()
  }, [fetchStocksData])

  // Format price with commas
  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold mb-4">{t('allStocks.title')}</h1>
        
        {/* Search Bar */}
        <div className="mb-4 relative">
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100 dark:bg-gray-800">
            <Search size={20} className="text-gray-500 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="bg-transparent outline-none w-full text-sm"
              placeholder={t('common.search')}
            />
            {searchTerm && (
              <button onClick={clearSearch} className="ml-2">
                <X size={20} className="text-gray-500" />
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex mb-4 border-b overflow-x-auto">
          {[
            { id: 'active', label: t('allStocks.active') },
            { id: 'gainers', label: t('dashboard.gainers') },
            { id: 'losers', label: t('dashboard.losers') },
            { id: 'all', label: t('allStocks.all') }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-900 text-white rounded-t-md'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Stocks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-2 py-3 text-left" onClick={() => handleSort('Symbol')}>
                  <div className="flex items-center cursor-pointer">
                    {t('allStocks.symbol')}
                    {sortConfig.key === 'Symbol' && (
                      sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-right" onClick={() => handleSort('LastTradedPrice')}>
                  <div className="flex items-center justify-end cursor-pointer">
                    {t('allStocks.price')}
                    {sortConfig.key === 'LastTradedPrice' && (
                      sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-right" onClick={() => handleSort('BestBidPx')}>
                  <div className="flex items-center justify-end cursor-pointer">
                    {t('allStocks.bid')}
                    {sortConfig.key === 'BestBidPx' && (
                      sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-right" onClick={() => handleSort('BestOfferPx')}>
                  <div className="flex items-center justify-end cursor-pointer">
                    {t('allStocks.ask')}
                    {sortConfig.key === 'BestOfferPx' && (
                      sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-right" onClick={() => handleSort('Changep')}>
                  <div className="flex items-center justify-end cursor-pointer">
                    {t('allStocks.change')}
                    {sortConfig.key === 'Changep' && (
                      sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                    )}
                  </div>
                </th>
                <th className="px-2 py-3 text-right" onClick={() => handleSort('Volume')}>
                  <div className="flex items-center justify-end cursor-pointer">
                    {t('allStocks.volume')}
                    {sortConfig.key === 'Volume' && (
                      sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mb-2"></div>
                    <p className="text-gray-500 text-sm">{t('common.loading')}</p>
                  </td>
                </tr>
              ) : sortedStocks().length > 0 ? (
                sortedStocks().map((stock, index) => (
                  <tr 
                    key={`${stock.Symbol}-${index}`} 
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-2 py-3">
                      <div>
                        <div className="font-medium">{stock.Symbol}</div>
                        <div className="text-xs text-gray-500">{stock.mnName || stock.enName}</div>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      {formatPrice(stock.LastTradedPrice)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {formatPrice(stock.BestBidPx)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      {formatPrice(stock.BestOfferPx)}
                    </td>
                    <td className={`px-2 py-3 text-right ${stock.Changep >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      <div className="flex items-center justify-end">
                        {stock.Changep >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                        <span>{stock.Changep?.toFixed(2)}%</span>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      {stock.Volume?.toLocaleString() || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <p className="text-gray-500">{t('common.noResults')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Summary Section */}
        <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
          <div>{t('allStocks.showing', { count: sortedStocks().length, total: allStocks.length })}</div>
          <div>{t('allStocks.lastUpdated')}: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

export default AllStocks 