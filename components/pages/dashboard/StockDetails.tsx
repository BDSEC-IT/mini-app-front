import { BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StockDetailsProps {
  selectedSymbol: string
  details: {
    isin: string
    companyCode: string
    totalShares: string
    listedShares: string
    marketCap: string
    listingDate: string
  }
}

export const StockDetails = ({ selectedSymbol, details }: StockDetailsProps) => {
  const { t } = useTranslation()

  return (
    <div className="mt-6 p-4">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <BarChart3 size={18} className="mr-2 text-bdsec dark:text-indigo-400" />
        {t('dashboard.stockDetails')} - {selectedSymbol.split('-')[0]}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="overflow-hidden">
          <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">ISIN:</span>
              <span className="text-sm font-medium">{details.isin}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.companyCode')}:</span>
              <span className="text-sm font-medium">{details.companyCode}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.totalShares')}:</span>
              <span className="text-sm font-medium">{details.totalShares}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.listedShares')}:</span>
              <span className="text-sm font-medium">{details.listedShares}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.listingDate')}:</span>
              <span className="text-sm font-medium">{details.listingDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 