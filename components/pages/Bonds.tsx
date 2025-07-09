'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { fetchBonds, type BondData } from '@/lib/api'

const Bonds = () => {
  const { t, i18n } = useTranslation()
  const [bonds, setBonds] = useState<BondData[]>([])
  const [filteredBonds, setFilteredBonds] = useState<BondData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BondData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' })
  const currentLanguage = i18n.language || 'mn'
  // Fetch bonds data
  const fetchBondsData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchBonds()
      if (response.success && response.data) {
        setBonds(response.data)
        setFilteredBonds(response.data)
      }
    } catch (err) {
      console.error('Error fetching bonds:', err)
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
  const handleSort = (key: keyof BondData) => {
    let direction: 'asc' | 'desc' = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
  }

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...bonds]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(bond => 
        (bond.Symbol?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (currentLanguage === 'mn' ? bond.BondmnName?.toLowerCase() : bond.BondenName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (currentLanguage === 'mn' ? bond.Issuer?.toLowerCase() : bond.IssuerEn?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    }
    console.log(filteredBonds, "filteredBonds")
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
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
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    
    setFilteredBonds(filtered)
  }, [bonds, searchTerm, sortConfig])

  // Fetch data on component mount
  useEffect(() => {
    fetchBondsData()
  }, [fetchBondsData])

  // Format date - improved to handle different formats
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    if (dateString === 'Буцаан төлөгдсөн') {
      return t('bonds.refunded', 'Refunded')
    }
    return dateString
  }

  // Format nominal value with safe handling of null/undefined
  const formatNominalValue = (value: number | null | undefined, isdollar: string | null) => {
    if (value === null || value === undefined || isNaN(value)) return '-'
    return value.toLocaleString() + (isdollar === null || isdollar === "-" ? ' ₮' : ' $')
  }

  // Format symbol to show only the first part before "-"
  const formatSymbol = (symbol: string | null | undefined) => {
    if (!symbol) return '-';
    return symbol.split('-')[0];
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24 px-2">
      <div className="py-6">
        <h1 className="text-xl font-bold mb-4">{t('bonds.title', 'Bonds')}</h1>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bdsec dark:focus:ring-indigo-500 focus:border-bdsec dark:focus:border-indigo-500 block w-full pl-9 p-2"
            placeholder={t('bonds.searchPlaceholder', 'Search bonds...')}
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={clearSearch}
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Bonds table */}
        <div className="overflow-x-auto -mx-2 md:mx-0">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-bdsec dark:border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredBonds.length === 0 ? (
            <div className="text-center py-10">
              <p>{t('bonds.noResults', 'No bonds found')}</p>
            </div>
          ) : (
            <table className="w-full text-xs md:text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('Symbol')}>
                    <div className="flex items-center">
                      {t('bonds.symbol', 'Symbol')}
                      {sortConfig.key === 'Symbol' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer" onClick={() => handleSort(currentLanguage === 'mn' ? 'BondmnName' : 'BondenName')}>
                    <div className="flex items-center">
                      {t('bonds.name', 'Name')}
                      {sortConfig.key === (currentLanguage === 'mn' ? 'BondmnName' : 'BondenName') && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer" onClick={() => handleSort(currentLanguage === 'mn' ? 'Issuer' : 'IssuerEn')}>
                    <div className="flex items-center">
                      {t('bonds.issuer', 'Issuer')}
                      {sortConfig.key === (currentLanguage === 'mn' ? 'Issuer' : 'IssuerEn') && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer" onClick={() => handleSort('TradedDate')}>
                    <div className="flex items-center">
                      {t('bonds.period', 'Period')}
                      {sortConfig.key === 'TradedDate' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer" onClick={() => handleSort('Interest')}>
                    <div className="flex items-center">
                      {t('bonds.yield', 'Yield %')}
                      {sortConfig.key === 'Interest' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer" onClick={() => handleSort(currentLanguage === 'mn' ? 'mnInterestConditions' : 'enInterestConditions')}>
                    <div className="flex items-center">
                      {t('bonds.conditions', 'Conditions')}
                      {sortConfig.key === (currentLanguage === 'mn' ? 'mnInterestConditions' : 'enInterestConditions') && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer" onClick={() => handleSort('NominalValue')}>
                    <div className="flex items-center">
                      {t('bonds.price', 'Price')}
                      {sortConfig.key === 'NominalValue' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3 cursor-pointer" onClick={() => handleSort('RefundDate')}>
                    <div className="flex items-center">
                      {t('bonds.refundDate', 'Refund')}
                      {sortConfig.key === 'RefundDate' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3" /> 
                          : <ArrowDown className="ml-1 h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 md:px-4 md:py-3">
                    {t('bonds.details', 'Details')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBonds.map((bond, index) => (
                  <tr 
                    key={bond.pkId || `${bond.Symbol}-${index}`} 
                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-2 py-2 md:px-4 md:py-3 font-medium">
                      {bond.Symbol ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {formatSymbol(bond.Symbol)}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{currentLanguage === 'mn' ? bond.BondmnName : bond.BondenName}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{currentLanguage === 'mn' ? bond.Issuer : bond.IssuerEn}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{formatDate(bond.Date)} {bond.Date==="-" ? '' : t('bonds.years', 'years')}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{formatPercentage(bond.Interest)}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{currentLanguage === 'mn' ? bond.mnInterestConditions : bond.enInterestConditions}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{formatNominalValue(bond.NominalValue, bond.Isdollar)}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">{formatDate(bond.RefundDate)}</td>
                    <td className="px-2 py-2 md:px-4 md:py-3">
                      {bond.MoreInfo && (
                        <a 
                          href={bond.MoreInfo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-bdsec dark:text-indigo-400 hover:underline flex items-center"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          {t('bonds.viewMore', 'View')}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
function formatPercentage(percentageStr: string): string {
  const num = parseFloat(percentageStr.replace('%', ''));
  return `${Number(num.toFixed(2))}%`;
}

export default Bonds 