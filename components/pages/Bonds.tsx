'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react'
import { fetchBonds, type BondData } from '@/lib/api'

const Bonds = () => {
  const { t } = useTranslation()
  const [bonds, setBonds] = useState<BondData[]>([])
  const [filteredBonds, setFilteredBonds] = useState<BondData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof BondData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' })

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
        bond.Symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bond.BondmnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bond.BondenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bond.Issuer.toLowerCase().includes(searchTerm.toLowerCase())
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
  }, [bonds, searchTerm, sortConfig])

  // Fetch data on component mount
  useEffect(() => {
    fetchBondsData()
  }, [fetchBondsData])

  // Format date - improved to handle different formats
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return dateString
  }

  // Format nominal value with safe handling of null/undefined
  const formatNominalValue = (value: number | null | undefined) => {
    if (value === null || value === undefined || isNaN(value)) return '-'
    return value.toLocaleString() + ' ₮'
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 md:px-6 py-6">
        <h1 className="text-xl font-bold mb-6">{t('bonds.title', 'Bonds')}</h1>
        
        {/* Search bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-bdsec dark:focus:ring-indigo-500 focus:border-bdsec dark:focus:border-indigo-500 block w-full pl-10 p-2.5"
            placeholder={t('bonds.searchPlaceholder', 'Search bonds...')}
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
        
        {/* Bonds table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin h-8 w-8 border-4 border-bdsec dark:border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredBonds.length === 0 ? (
            <div className="text-center py-10">
              <p>{t('bonds.noResults', 'No bonds found')}</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('Symbol')}>
                    <div className="flex items-center">
                      {t('bonds.symbol', 'Symbol')}
                      {sortConfig.key === 'Symbol' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('BondmnName')}>
                    <div className="flex items-center">
                      {t('bonds.name', 'Name')}
                      {sortConfig.key === 'BondmnName' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('Issuer')}>
                    <div className="flex items-center">
                      {t('bonds.issuer', 'Issuer')}
                      {sortConfig.key === 'Issuer' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('Interest')}>
                    <div className="flex items-center">
                      {t('bonds.interest', 'Interest')}
                      {sortConfig.key === 'Interest' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('NominalValue')}>
                    <div className="flex items-center">
                      {t('bonds.nominalValue', 'Nominal Value')}
                      {sortConfig.key === 'NominalValue' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('TradedDate')}>
                    <div className="flex items-center">
                      {t('bonds.tradedDate', 'Traded Date')}
                      {sortConfig.key === 'TradedDate' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 cursor-pointer" onClick={() => handleSort('RefundDate')}>
                    <div className="flex items-center">
                      {t('bonds.refundDate', 'Refund Date')}
                      {sortConfig.key === 'RefundDate' && (
                        sortConfig.direction === 'asc' 
                          ? <ArrowUp className="ml-1 h-4 w-4" /> 
                          : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3">
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
                    <td className="px-4 py-3 font-medium">{bond.Symbol}</td>
                    <td className="px-4 py-3">{bond.BondmnName}</td>
                    <td className="px-4 py-3">{bond.Issuer}</td>
                    <td className="px-4 py-3">{bond.Interest}</td>
                    <td className="px-4 py-3">{formatNominalValue(bond.NominalValue)}</td>
                    <td className="px-4 py-3">{formatDate(bond.TradedDate)}</td>
                    <td className="px-4 py-3">{formatDate(bond.RefundDate)}</td>
                    <td className="px-4 py-3">
                      {bond.MoreInfo && (
                        <a 
                          href={bond.MoreInfo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-bdsec dark:text-indigo-400 hover:underline flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
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

export default Bonds 