'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, ChevronDown, Search, X, Filter, SlidersHorizontal, ChevronRight } from 'lucide-react'
import { fetchAllStocks, type StockData } from '@/lib/api'

// Define stock categories
interface Category {
  id: string;
  name: string;
  mnName: string;
}

const AllStocks = () => {
  const { t, i18n } = useTranslation()
  const currentLanguage = i18n.language || 'mn';
  
  // Helper function to get company name based on current language
  const getCompanyName = (stock: StockData) => {
    return currentLanguage === 'mn' ? stock.mnName : stock.enName;
  };

  const [allStocks, setAllStocks] = useState<StockData[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('active')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'I': true,
    'II': true,
    'III': true
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' })

  // Stock categories
  const categories: Category[] = useMemo(() => [
    { id: 'all', name: t('allStocks.all'), mnName: t('allStocks.all') },
    { id: 'I', name: t('allStocks.categoryI'), mnName: t('allStocks.categoryI') },
    { id: 'II', name: t('allStocks.categoryII'), mnName: t('allStocks.categoryII') },
    { id: 'III', name: t('allStocks.categoryIII'), mnName: t('allStocks.categoryIII') }
  ], [t]);

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

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
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

  // Get stock category from MarketSegmentID
  const getStockCategory = (stock: StockData): string => {
    if (!stock.MarketSegmentID) return 'III'
    
    // Extract category from MarketSegmentID (e.g., "I classification" -> "I")
    const match = stock.MarketSegmentID.match(/([IV]+)\s*classification/i)
    return match ? match[1] : 'III'
  }

  // Filter stocks based on search, active tab and category
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
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(stock => getStockCategory(stock) === selectedCategory)
    }
    
    setFilteredStocks(filtered)
  }, [allStocks, searchTerm, activeTab, selectedCategory])

  // Fetch data on component mount
  useEffect(() => {
    fetchStocksData()
  }, [fetchStocksData])

  // Format price with commas
  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Group stocks by category
  const stocksByCategory = useMemo(() => {
    const sorted = sortedStocks()
    const grouped: Record<string, StockData[]> = {
      'I': [],
      'II': [],
      'III': []
    }
    
    sorted.forEach(stock => {
      const category = getStockCategory(stock)
      if (grouped[category]) {
        grouped[category].push(stock)
      }
    })
    
    return grouped
  }, [sortedStocks])

  // Calculate summary for a category (only stocks with trades today, sizemd > 0, using allStocks)
  const getCategorySummary = (category: string) => {
    const stocks = allStocks.filter(stock => {
      if (!stock.MarketSegmentID) return category === 'III';
      const match = stock.MarketSegmentID.match(/([IV]+)\\s*classification/i);
      const cat = match ? match[1] : 'III';
      
      // Filter by category and sizemd > 0 (today's trades)
      // Note: updatedAt is sync time, not trade date, so we only filter by sizemd > 0
      return cat === category && Number(stock.sizemd) > 0;
    });
    
    return {
      count: stocks.length,
      // Calculate today's turnover: sizemd * LastTradedPrice
      totalTurnover: stocks.reduce((sum, s) => sum + (Number(s.Turnover) || 0), 0),
      totalVolume: stocks.reduce((sum, s) => sum + (Number(s.Volume) || 0), 0),
    };
  };

  // Render table rows for a category
  const renderCategoryStocks = (stocks: StockData[]) => {
    return stocks.map((stock, index) => (
      <tr 
        key={`${stock.Symbol}-${index}`} 
        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <td className="px-2 py-3">
          <div>
            <div className="font-medium">{stock.Symbol}</div>
            <div className="text-xs text-gray-500">{getCompanyName(stock)}</div>
          </div>
        </td>
        <td className="px-2 py-3 text-right">
          {Number(stock.Volume)}
        </td>
        <td className="px-2 py-3 text-right">
          {formatPrice(stock.Turnover)}
        </td>
        <td className="px-2 py-3 text-right">
          {formatPrice(stock.PreviousClose)}
        </td>
        <td className="px-2 py-3 text-right">
          {formatPrice(stock.OpeningPrice )}
        </td>
        <td className="px-2 py-3 text-right">
          {formatPrice(stock.HighPrice )}
        </td>
           <td className="px-2 py-3 text-right">
          {formatPrice(stock.LowPrice  )}
        </td>
            <td className="px-2 py-3 text-right">
          {formatPrice(stock.LastTradedPrice )}
        </td>
            <td className="px-2 py-3 text-right">
          {formatPrice(stock.ClosingPrice)}
        </td>
           <td className={`px-2 py-3 text-right ${stock.Changes >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {formatPrice(stock.Changes)}
        </td>
            <td className={`px-2 py-3 text-right ${stock.Changep >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          <div className="flex items-center justify-end">
            {stock.Changep >= 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
            <span>{stock.Changep?.toFixed(2)}%</span>
          </div>
        </td>
        <td className="px-2 py-3 text-right">
          {Number(stock.sizemd) > 0 ? Number(stock.sizemd).toLocaleString() : '-'}
        </td>
              <td className="px-2 py-3 text-right">
          {formatPrice(stock.MDEntryPx)}
        </td>
         <td className="px-2 py-3 text-right">
          {formatPrice(stock.MDEntryPx2)}
        </td>
          <td className="px-2 py-3 text-right">
          {Number(stock.sizemd2) > 0 ? Number(stock.sizemd2).toLocaleString() : '-'}
        </td>
           
      </tr>
    ))
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="transform rotate-180" size={18} />
            </a>
            <h1 className="text-xl font-bold">{t('allStocks.title')}</h1>
          </div>
          <div className="text-sm text-gray-500">
            {t('allStocks.lastUpdated')}: {new Date().toLocaleTimeString()}
          </div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={toggleFilters}
            className="flex items-center gap-1 text-sm text-bdsec dark:text-indigo-400"
          >
            <SlidersHorizontal size={16} />
            {t('allStocks.filter')}
          </button>
        </div>
        
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
        
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium mb-2">{t('allStocks.categories')}</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedCategory === category.id
                      ? 'bg-bdsec dark:bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.mnName}
                </button>
              ))}
            </div>
            
            <div className="mt-3">
              <h3 className="font-medium mb-2">{t('allStocks.timeFilter')}</h3>
              <div className="flex flex-wrap gap-2">
                {['today', 'yesterday', 'thisWeek', 'thisMonth'].map(period => (
                  <button
                    key={period}
                    className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    {t(`allStocks.${period}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Filter Tabs */}
        <div className="flex mb-4 border-b overflow-x-auto">
          {[
              { id: 'all', label: t('allStocks.all') },
            { id: 'active', label: t('allStocks.active') },
            { id: 'gainers', label: t('dashboard.gainers') },
            { id: 'losers', label: t('dashboard.losers') },
          
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-bdsec dark:bg-indigo-500 text-white rounded-t-md'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stocks Table with Category Groups */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bdsec dark:border-indigo-500 mb-2"></div>
            <p className="text-gray-500 text-sm ml-3">{t('common.loading')}</p>
          </div>
        ) : sortedStocks().length > 0 ? (
          <div className="space-y-6">
            {/* Category I */}
            {stocksByCategory['I'] && stocksByCategory['I'].length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
                {/* Category I Header with summary */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg cursor-pointer gap-2"
                  onClick={() => toggleCategory('I')}
                >
                  <div className="flex items-center">
                    <span className={`transform transition-transform ${expandedCategories['I'] ? 'rotate-90' : ''}`}>
                      <ChevronRight size={20} />
                    </span>
                    <h3 className="font-medium ml-2 text-blue-800 dark:text-blue-300">
                      {t('allStocks.categoryI')}
                    </h3>
                  </div>
                  {/* Summary info for I */}
                  {(() => {
                    const summary = getCategorySummary('I');
                    return (
                      <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                        <span>Компани: <span className="font-semibold text-bdsec dark:text-indigo-400">{summary.count}</span></span>
                        <span>Үнийн дүн: <span className="font-semibold">{summary.totalTurnover.toLocaleString()}₮</span></span>
                        <span>Тоо ширхэг: <span className="font-semibold">{summary.totalVolume.toLocaleString()}</span></span>
                      </div>
                    );
                  })()}
                </div>
                
                {expandedCategories['I'] && (
                   <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="px-2 py-3 text-left">
                            <div className="flex items-center cursor-pointer" onClick={() => handleSort('Symbol')}>
                              {t('allStocks.symbol')}
                              {sortConfig.key === 'Symbol' && (
                                sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                              )}
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                              {t('allStocks.volume')}
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Үнийн дүн 
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Өмнөх хаалт
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Нээлт
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Дээд үнэ
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                          Доод үнэ
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Сүүлийн ханш
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Хаалт
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Өөрчлөлт
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             %
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Авах тоо
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Авах үнэ
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Зарах үнэ
                            </div>
                          </th>
                            <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Зарах тоо
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stocksByCategory['I'] && renderCategoryStocks(stocksByCategory['I'])}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Category II */}
            {stocksByCategory['II'] && stocksByCategory['II'].length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
                {/* Category II Header with summary */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-t-lg cursor-pointer gap-2"
                  onClick={() => toggleCategory('II')}
                >
                  <div className="flex items-center">
                    <span className={`transform transition-transform ${expandedCategories['II'] ? 'rotate-90' : ''}`}>
                      <ChevronRight size={20} />
                    </span>
                    <h3 className="font-medium ml-2 text-purple-800 dark:text-purple-300">
                      {t('allStocks.categoryII')}
                    </h3>
                  </div>
                  {/* Summary info for II */}
                  {(() => {
                    const summary = getCategorySummary('II');
                    return (
                      <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                        <span>Компани: <span className="font-semibold text-bdsec dark:text-indigo-400">{summary.count}</span></span>
                        <span>Үнийн дүн: <span className="font-semibold">{summary.totalTurnover.toLocaleString()}₮</span></span>
                        <span>Тоо ширхэг: <span className="font-semibold">{summary.totalVolume.toLocaleString()}</span></span>
                      </div>
                    );
                  })()}
                </div>
                
                {expandedCategories['II'] && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="px-2 py-3 text-left">
                            <div className="flex items-center cursor-pointer" onClick={() => handleSort('Symbol')}>
                              {t('allStocks.symbol')}
                              {sortConfig.key === 'Symbol' && (
                                sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                              )}
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                              {t('allStocks.volume')}
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Үнийн дүн 
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Өмнөх хаалт
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Нээлт
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Дээд үнэ
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                          Доод үнэ
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Сүүлийн ханш
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Хаалт
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Өөрчлөлт
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             %
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Авах тоо
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Авах үнэ
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Зарах үнэ
                            </div>
                          </th>
                            <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Зарах тоо
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stocksByCategory['II'] && renderCategoryStocks(stocksByCategory['II'])}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {/* Category III */}
            {stocksByCategory['III'] && stocksByCategory['III'].length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow">
                {/* Category III Header with summary */}
                <div 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-t-lg cursor-pointer gap-2"
                  onClick={() => toggleCategory('III')}
                >
                  <div className="flex items-center">
                    <span className={`transform transition-transform ${expandedCategories['III'] ? 'rotate-90' : ''}`}>
                      <ChevronRight size={20} />
                    </span>
                    <h3 className="font-medium ml-2 text-gray-800 dark:text-gray-300">
                      {t('allStocks.categoryIII')}
                    </h3>
                  </div>
                  {/* Summary info for III */}
                  {(() => {
                    const summary = getCategorySummary('III');
                    return (
                      <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                        <span>Компани: <span className="font-semibold text-bdsec dark:text-indigo-400">{summary.count}</span></span>
                        <span>Үнийн дүн: <span className="font-semibold">{summary.totalTurnover.toLocaleString()}₮</span></span>
                        <span>Тоо ширхэг: <span className="font-semibold">{summary.totalVolume.toLocaleString()}</span></span>
                      </div>
                    );
                  })()}
                </div>
                
                {expandedCategories['III'] && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="px-2 py-3 text-left">
                            <div className="flex items-center cursor-pointer" onClick={() => handleSort('Symbol')}>
                              {t('allStocks.symbol')}
                              {sortConfig.key === 'Symbol' && (
                                sortConfig.direction === 'asc' ? <ChevronDown size={16} /> : <ChevronDown size={16} className="transform rotate-180" />
                              )}
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                              {t('allStocks.volume')}
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Үнийн дүн 
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Өмнөх хаалт
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Нээлт
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                              Дээд үнэ
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer">
                          Доод үнэ
                            </div>
                          </th>
                          <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Сүүлийн ханш
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Хаалт
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Өөрчлөлт
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             %
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Авах тоо
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Авах үнэ
                            </div>
                          </th>
                             <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Зарах үнэ
                            </div>
                          </th>
                            <th className="px-2 py-3 text-right">
                            <div className="flex items-center justify-end cursor-pointer" onClick={() => handleSort('Volume')}>
                             Зарах тоо
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {stocksByCategory['III'] && renderCategoryStocks(stocksByCategory['III'])}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('common.noResults')}</p>
          </div>
        )}
        
        {/* Summary Section */}
        <div className="mt-6 text-xs text-gray-500 flex justify-between items-center">
          <div>{t('allStocks.showing', { count: sortedStocks().length, total: allStocks.length })}</div>
          <div>{t('allStocks.lastUpdated')}: {new Date().toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

export default AllStocks 