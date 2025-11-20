import { FileText, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { fetchMSEReport, type MSEReportData, type MSEReportRow, type StockData, type WeekHighLowData } from '@/lib/api'

interface StockDetailsProps {
  selectedSymbol: string
  details: any
  infoLabel?: string // Optional label for stock/bond info
  stockData?: StockData | null
  weekStats?: WeekHighLowData | null
  weekStatsLoading?: boolean
}

export const StockDetails = ({ selectedSymbol, details, infoLabel, stockData, weekStats, weekStatsLoading = false }: StockDetailsProps) => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const defaultYear = currentMonth <= 3 ? currentYear - 1 : currentYear
  const [selectedYear, setSelectedYear] = useState(defaultYear.toString())
  const [selectedQuarter, setSelectedQuarter] = useState('2')
  const [reportData, setReportData] = useState<MSEReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFinancials, setShowFinancials] = useState(false)
  const formatPrice = (value?: number | null) => {
    if (value === null || value === undefined || Number.isNaN(value)) return '-'
    return `${Number(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₮`
  }

  // Generate year options (last 5 years)
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())
  const quarters = [ '2',  '4']

  // Fetch report when company code, year, or quarter changes
  useEffect(() => {
    if (details?.companycode && showFinancials) {
      fetchReport()
    }
  }, [details?.companycode, selectedYear, selectedQuarter, showFinancials])

  const fetchReport = async () => {
    if (!details?.companycode) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetchMSEReport(details.companycode, selectedYear, selectedQuarter)
      if (response.success) {
        setReportData(response.data)
      } else {
        setError(t('stockDetails.financialReportNotFound', 'Санхүүгийн тайлан олдсонгүй'))
      }
    } catch (err) {
      setError(t('stockDetails.financialReportNotFound', 'Санхүүгийн тайлан олдсонгүй'))
      console.error('Error fetching MSE report:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderFinancialTable = (data: MSEReportRow[], title: string) => {
    if (!data || data.length === 0) return null

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-100 dark:bg-gray-800">
              {data.filter(row => row.type === 'header').map((header, idx) => (
                <tr key={idx}>
                  <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300 w-12">{header.data.number}</th>
                  <th className="px-2 py-2 text-left font-medium text-gray-600 dark:text-gray-300">{header.data.indicator}</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600 dark:text-gray-300">{header.data.initialBalance}</th>
                  <th className="px-2 py-2 text-right font-medium text-gray-600 dark:text-gray-300">{header.data.finalBalance}</th>
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.filter(row => row.type === 'data').map((row, idx) => {
                const isSubtotal = row.data.indicator.includes('дүн') || row.data.indicator.includes('ХӨРӨНГӨ') || row.data.indicator.includes('ӨР ТӨЛБӨР')
                return (
                  <tr key={idx} className={`${isSubtotal ? 'bg-gray-50 dark:bg-gray-800 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{row.data.number}</td>
                    <td className="px-2 py-2 text-gray-900 dark:text-white">{row.data.indicator}</td>
                    <td className="px-2 py-2 text-right tabular-nums text-gray-900 dark:text-white">
                      {row.data.initialBalance ? parseFloat(row.data.initialBalance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                    </td>
                    <td className="px-2 py-2 text-right tabular-nums text-gray-900 dark:text-white">
                      {row.data.finalBalance && !row.data.finalBalance.includes('/') && !row.data.finalBalance.includes('...') 
                        ? parseFloat(row.data.finalBalance).toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                        : row.data.finalBalance || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Calculate market cap
  const marketCap = stockData?.LastTradedPrice && details?.issued_shares
    ? stockData.LastTradedPrice * parseInt(details.issued_shares, 10)
    : null;

  const formatMarketCap = (value: number | null) => {
    if (!value) return '-';
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)} их наяд ₮`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)} тэрбум ₮`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)} сая ₮`;
    return `${value.toLocaleString()} ₮`;
  };

  const metricCards = [
    {
      key: 'prevClose',
      label: t('stockDetails.previousClose', 'Өмнөх хаалт'),
      value: stockData?.PreviousClose
    },
    {
      key: 'open',
      label: t('stockDetails.openPrice', 'Нээлт'),
      value: stockData?.OpeningPrice
    },
    {
      key: 'high',
      label: t('stockDetails.highPrice', 'Дээд'),
      value: stockData?.HighPrice
    },
    {
      key: 'low',
      label: t('stockDetails.lowPrice', 'Доод'),
      value: stockData?.LowPrice
    },
    {
      key: '52high',
      label: t('stockDetails.high52', '52-д.х дээд'),
      value: weekStats?.['52high']
    },
    {
      key: '52low',
      label: t('stockDetails.low52', '52-д.х доод'),
      value: weekStats?.['52low']
    }
  ]

  if (!details) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full backdrop-blur-2xl my-3">
      <h2 className="text-base sm:text-lg font-medium mb-4">
        {infoLabel || t('dashboard.stockDetails')} - {selectedSymbol.split('-')[0]}
      </h2>

      <div className="overflow-hidden">
        <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
          <div className="flex justify-between items-center p-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">ISIN:</span>
            <span className="text-xs sm:text-sm font-medium">{details.ISIN}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">{t('dashboard.companyCode')}:</span>
            <span className="text-xs sm:text-sm font-medium">{details.companycode}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">{t('dashboard.totalShares')}:</span>
            <span className="text-xs sm:text-sm font-medium">{parseInt(details.issued_shares, 10).toLocaleString('en-US')}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">{t('stockDetails.marketCap', 'Зах зээлийн үнэлгээ')}:</span>
            <span className="text-xs sm:text-sm font-medium">{formatMarketCap(marketCap)}</span>
          </div>
          {weekStatsLoading ? (
            metricCards.map(card => (
              <div key={card.key} className="flex justify-between items-center p-3 animate-pulse">
                <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))
          ) : (
            metricCards.map(card => (
              <div key={card.key} className="flex justify-between items-center p-3">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">{card.label}:</span>
                <span className="text-xs sm:text-sm font-medium">{formatPrice(card.value)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Financial Reports Section */}
      {details.companycode && (
        <div className="mt-6">
          <button
            onClick={() => setShowFinancials(!showFinancials)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <FileText size={18} className="mr-2 text-bdsec dark:text-indigo-400" />
              <span className="text-sm font-medium">{t('stockDetails.financialReport', 'Санхүүгийн тайлан')}</span>
            </div>
            <ChevronDown 
              size={18} 
              className={`transition-transform ${showFinancials ? 'rotate-180' : ''}`}
            />
          </button>

          {showFinancials && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Period Selection */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('stockDetails.year', 'Он')}</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{t('stockDetails.quarter', 'Улирал')}</label>
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {quarters.map(quarter => (
                      <option key={quarter} value={quarter}>
                        {quarter === '2' ? t('stockDetails.firstHalf', '1-р хагас жил') : quarter === '4' ? t('stockDetails.secondHalf', '2-р хагас жил') : `${quarter}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Report Content */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec dark:border-indigo-500"></div>
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-sm text-red-500">{error}</div>
              )}

              {reportData && !loading && !error && (
                <div>
                  {/* Company Info */}
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{reportData.companyInfo.companyName}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {t('stockDetails.registry', 'Регистр')}: {reportData.companyInfo.registryNumber}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {reportData.currency}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedYear} {t('stockDetails.yearOf', 'оны')} {selectedQuarter}-{t('stockDetails.quarterSuffix', 'р улирал')}
                    </p>
                  </div>

                  {/* Balance Sheet */}
                  {renderFinancialTable(reportData.balanceData, t('stockDetails.balanceSheet', 'Баланс'))}

                  {/* Income Statement */}
                  {renderFinancialTable(reportData.incomeData, t('stockDetails.incomeStatement', 'Орлогын тайлан'))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
