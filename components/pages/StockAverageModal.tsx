'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetch52WeekHighLow, type WeekHighLowData } from '@/lib/api'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const StockAverageModal = ({ isOpen, onClose }: Props) => {
  const [data, setData] = useState<WeekHighLowData[]>([])
  const [loading, setLoading] = useState(false)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">52/7 Дундаж</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-lg">
            <X />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10">Уншиж байна...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-2 py-1 border">Symbol</th>
                  <th className="px-2 py-1 border">MN Title</th>
                  <th className="px-2 py-1 border">EN Title</th>
                  <th className="px-2 py-1 border">Trade Count</th>
                  <th className="px-2 py-1 border">52 Low</th>
                  <th className="px-2 py-1 border">52 High</th>
                  <th className="px-2 py-1 border">52 Week Avg</th>
                  <th className="px-2 py-1 border">Last Closing Date</th>
                  <th className="px-2 py-1 border">Last Closing Price</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-2 py-1 border">{item.Symbol}</td>
                    <td className="px-2 py-1 border">{item.mnTitle}</td>
                    <td className="px-2 py-1 border">{item.enTitle}</td>
                    <td className="px-2 py-1 border">{item.trade_count}</td>
                    <td className="px-2 py-1 border">{item['52low']}</td>
                    <td className="px-2 py-1 border">{item['52high']}</td>
                    <td className="px-2 py-1 border">{item.avg_52_week_closing_price}</td>
                    <td className="px-2 py-1 border">{item.last_closing_date}</td>
                    <td className="px-2 py-1 border">{item.last_closing_price}</td>
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
