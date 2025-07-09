'use client'

import { useEffect, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { fetch52WeekHighLow, type WeekHighLowData } from '@/lib/api'
import { useTranslation } from 'react-i18next'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const StockAverageModal = ({ isOpen, onClose }: Props) => {
  const [data, setData] = useState<WeekHighLowData[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
 const { t, i18n } = useTranslation()
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WeekHighLowData | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })

  useEffect(() => {
    if (!isOpen) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch52WeekHighLow()
        if (response.success) {
          setData(response.data)
        }
      } catch (err) {
        console.error('Error fetching 52-week data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isOpen])

  const handleSort = (key: keyof WeekHighLowData) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortArrow = (key: keyof WeekHighLowData) => {
    if (sortConfig.key !== key) return null
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const sortedStocks = useCallback(() => {
    const filtered = data.filter((item) => {
      const term = searchTerm.toLowerCase()
      return (
        item.Symbol.toLowerCase().includes(term) ||
        item.enTitle.toLowerCase().includes(term) ||
        item.mnTitle.toLowerCase().includes(term)
      )
    })

    if (!sortConfig.key) return filtered

    return [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

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
  }, [data, searchTerm, sortConfig])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-6xl max-h-[80vh] overflow-y-auto shadow-lg">
      <div className="flex justify-between items-center mb-4 px-4 sm:px-6 pt-4 relative">
                  <h2 className="text-base sm:text-lg font-medium flex items-center">{t('StockAver.52/7average')}</h2>
                   <button
                     onClick={onClose}
                    className="text-gray-500 hover:text-red-500 text-lg transition-transform duration-200 hover:scale-110 sticky top-4 right-4 z-50 bg-white dark:bg-gray-900 rounded-full p-1 shadow-md"
                    aria-label={t('Close')} ><X />
                    </button>
       </div>


        <div className="mb-4 px-4 sm:px-6">
          <input
            type="text"
            placeholder={i18n.language === 'mn' ? 'Симбол/Нэр-ээр хайх........' : 'Search by Symbol/Name.........'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/3 p-2 border rounded"
          />
        </div>

        {loading ? (
          <div className="text-center py-10">Уншиж байна...</div>
        ) : (
          <div className="overflow-x-auto px-4 sm:px-6">
            <table className="min-w-full border text-xs sm:text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th
                    className="px-2 py-1 border cursor-pointer"
                    onClick={() => handleSort('Symbol')}
                  >
                   {t('allStocks.symbol')} {getSortArrow('Symbol')}
                  </th>
                  <th className="px-2 py-1 border">
                  
                    {t('StockAver.company_name')}

                  </th>
                  <th className="px-2 py-1 border">{t('StockAver.52data')}</th>
                  <th
                    className="px-2 py-1 border cursor-pointer"
                    onClick={() => handleSort('last_closing_price')}
                  >
                    {t('StockAver.close_price')} {getSortArrow('last_closing_price')}
                  </th>
                  <th
                    className="px-2 py-1 border cursor-pointer"
                    onClick={() => handleSort('last_closing_date')}
                  >
                     {t('StockAver.close_date')} {getSortArrow('last_closing_date')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStocks().map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-2 py-1 border">{item.Symbol}</td>
                    <td className="px-2 py-1 border">
                      {i18n.language === 'mn' ? item.mnTitle : item.enTitle}
                    </td>
                    <td className="px-2 py-1 border">
                      {Math.floor(Number(item['52low']))}-{Math.floor(Number(item['52high']))}
                    </td>
                    <td className="px-2 py-1 border">{Math.floor(Number(item.last_closing_price))}</td>
                    <td className="px-2 py-1 border">{item.last_closing_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default StockAverageModal
