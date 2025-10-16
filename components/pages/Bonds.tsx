'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X, ExternalLink } from 'lucide-react'
import { fetchBonds, type BondData } from '@/lib/api'

const Bonds = () => {
  const { t, i18n } = useTranslation()
  const [bonds, setBonds] = useState<BondData[]>([])
  const [filteredBonds, setFilteredBonds] = useState<BondData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
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

  // Apply search filter
  useEffect(() => {
    let filtered = [...bonds]
    
    if (searchTerm) {
      filtered = filtered.filter(bond => 
        (bond.Symbol?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (currentLanguage === 'mn' ? bond.BondmnName?.toLowerCase() : bond.BondenName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (currentLanguage === 'mn' ? bond.Issuer?.toLowerCase() : bond.IssuerEn?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      )
    }
    
    setFilteredBonds(filtered)
  }, [bonds, searchTerm, currentLanguage])

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
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24 p-3">
      {/* Header with MSE information */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{t('bonds.title')}</h1>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {currentLanguage === 'mn' ? 'МХБ-ийн бонд' : 'MSE Bonds'}
            </p>
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {currentLanguage === 'mn' ? 'MSE' : 'MSE'}
          </div>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-500" />
        </div>
        <input
          type="text"
          className="h-10 bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full pl-9 pr-10"
          placeholder={t('bonds.searchPlaceholder', 'Search bonds...')}
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3 h-8 w-8 justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={clearSearch}
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
      
      {/* Bonds list */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredBonds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('bonds.noResults', 'No bonds found')}</p>
          </div>
        ) : (
          filteredBonds.map((bond, index) => (
            <div 
              key={bond.pkId || `${bond.Symbol}-${index}`} 
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2"
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {bond.Symbol && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                      {formatSymbol(bond.Symbol)}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentLanguage === 'mn' ? bond.BondmnName : bond.BondenName}
                  </span>
                </div>
                {bond.MoreInfo && (
                  <a 
                    href={bond.MoreInfo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-xs"
                    aria-label="View more details"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    {t('bonds.viewMore', 'View')}
                  </a>
                )}
              </div>
              
              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('bonds.issuer', 'Issuer')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {currentLanguage === 'mn' ? bond.Issuer : bond.IssuerEn}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('bonds.yield', 'Yield')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatPercentage(bond.Interest)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('bonds.period', 'Period')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(bond.Date)} {bond.Date !== "-" && t('bonds.years', 'years')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t('bonds.price', 'Price')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatNominalValue(bond.NominalValue, bond.Isdollar)}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400">{t('bonds.refundDate', 'Refund')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatDate(bond.RefundDate)}
                  </div>
                </div>
                {(currentLanguage === 'mn' ? bond.mnInterestConditions : bond.enInterestConditions) && (
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">{t('bonds.conditions', 'Conditions')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white text-xs">
                      {currentLanguage === 'mn' ? bond.mnInterestConditions : bond.enInterestConditions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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