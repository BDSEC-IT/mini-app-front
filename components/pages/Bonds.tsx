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
  }, [bonds, searchTerm, sortConfig, currentLanguage])

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
    // This is the critical change: multiply the value by 1000 for bonds
    const transformedValue = value * 1000;
    return transformedValue.toLocaleString() + (isdollar === null || isdollar === "-" ? ' ₮' : ' $')
  }

  // Format symbol to show only the first part before "-"
  const formatSymbol = (symbol: string | null | undefined) => {
    if (!symbol) return '-';
    return symbol.split('-')[0];
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-800">
        <h1 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('bonds.title')}</h1>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="h-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bdsec dark:focus:ring-indigo-500 focus:border-bdsec dark:focus:border-indigo-500 block w-full pl-9 pr-10"
            placeholder={t('bonds.searchPlaceholder', 'Search bonds...')}
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 h-8 w-8 justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={clearSearch}
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Bonds table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-bdsec dark:border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredBonds.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-base font-normal text-gray-600 dark:text-gray-400">{t('bonds.noResults', 'No bonds found')}</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-sm uppercase bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-3 py-3 cursor-pointer whitespace-nowrap" onClick={() => handleSort('Symbol')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.symbol', 'Symbol')}
                      {sortConfig.key === 'Symbol' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort(currentLanguage === 'mn' ? 'BondmnName' : 'BondenName')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.name', 'Name')}
                      {sortConfig.key === (currentLanguage === 'mn' ? 'BondmnName' : 'BondenName') && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort(currentLanguage === 'mn' ? 'Issuer' : 'IssuerEn')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.issuer', 'Issuer')}
                      {sortConfig.key === (currentLanguage === 'mn' ? 'Issuer' : 'IssuerEn') && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort('TradedDate')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.period', 'Period')}
                      {sortConfig.key === 'TradedDate' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort('Interest')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.yield', 'Yield %')}
                      {sortConfig.key === 'Interest' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort(currentLanguage === 'mn' ? 'mnInterestConditions' : 'enInterestConditions')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.conditions', 'Conditions')}
                      {sortConfig.key === (currentLanguage === 'mn' ? 'mnInterestConditions' : 'enInterestConditions') && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort('NominalValue')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.price', 'Price')}
                      {sortConfig.key === 'NominalValue' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 cursor-pointer" onClick={() => handleSort('RefundDate')}>
                    <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('bonds.refundDate', 'Refund')}
                      {sortConfig.key === 'RefundDate' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" /> 
                          : <ArrowDown className="ml-1 h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                  </th>
                  <th className="px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
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
                    <td className="px-3 py-3 font-medium">
                      {bond.Symbol ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {formatSymbol(bond.Symbol)}
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm font-normal text-gray-900 dark:text-gray-100">{currentLanguage === 'mn' ? bond.BondmnName : bond.BondenName}</td>
                    <td className="px-3 py-3 text-sm font-normal text-gray-900 dark:text-gray-100">{currentLanguage === 'mn' ? bond.Issuer : bond.IssuerEn}</td>
                    <td className="px-3 py-3 text-sm font-normal text-gray-900 dark:text-gray-100">{formatDate(bond.Date)} {bond.Date==="-" ? '' : t('bonds.years', 'years')}</td>
                    <td className="px-3 py-3 text-sm font-normal text-gray-900 dark:text-gray-100">{formatPercentage(bond.Interest)}</td>
                    <td className="px-3 py-3 text-sm font-normal text-gray-900 dark:text-gray-100">{currentLanguage === 'mn' ? bond.mnInterestConditions : bond.enInterestConditions}</td>
                    <td className="px-3 py-3 text-sm font-normal text-gray-900 dark:text-gray-100">{formatNominalValue(bond.NominalValue, bond.Isdollar)}</td>
                    <td className="px-3 py-3 text-sm font-normal text-gray-900 dark:text-gray-100">{formatDate(bond.RefundDate)}</td>
                    <td className="px-3 py-3">
                      {bond.MoreInfo && (
                        <a 
                          href={bond.MoreInfo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-bdsec dark:text-indigo-400 hover:underline flex items-center text-sm font-normal"
                        >
                          <ExternalLink className="h-3 w-3 mr-1 text-gray-600 dark:text-gray-400" />
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
  if (!percentageStr) return '-';
  const num = parseFloat(percentageStr.replace('%', ''));
  if (isNaN(num)) return '-';
  return `${Number(num.toFixed(2))}%`;
}

export default Bonds 