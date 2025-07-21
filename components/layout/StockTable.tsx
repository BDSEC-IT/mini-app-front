import { useState } from 'react'
import { StockData, BondData } from '@/lib/api'

interface StockTableProps {
  data: StockData[] | BondData[]
  type: 'stock' | 'bond'
  title?: string
  formatNumber?: (num: number) => string
}

const StockTable = ({ 
  data, 
  type, 
  title = type === 'stock' ? 'Хөрөнгийн жагсаалт' : 'Бондын жагсаалт',
  formatNumber = (num: number) => num.toLocaleString('mn-MN')
}: StockTableProps) => {
  // Use useState for sortable columns if needed later
  
  // Check for empty data
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
        Мэдээлэл байхгүй байна
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-4">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            {type === 'stock' ? (
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
            ) : (
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Символ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Бондын нэр
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Үүсгэн байгуулагч
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Хүү
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Үнэ
                </th>
              </tr>
            )}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {type === 'stock' ? (
              (data as StockData[]).map((item) => (
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
                    {item.Changes > 0 ? '+' : ''}{item.Changes} ({item.Changep != null ? (item.Changep > 0 ? '+' : '') + item.Changep.toFixed(2) : '0.00'}%)
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {formatNumber(item.Volume)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {formatNumber(item.Turnover)}₮
                  </td>
                </tr>
              ))
            ) : (
              (data as BondData[]).map((bond) => (
                <tr key={bond.pkId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    {bond.Symbol}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {bond.BondmnName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {bond.Issuer}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                    {bond.Interest}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">
                    {/* This is the critical change: multiply the NominalValue by 1000 for bonds */}
                    {bond.NominalValue ? formatNumber(bond.NominalValue * 1000) : '0'}₮
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockTable
