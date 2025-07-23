import { BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface StockDetailsProps {
  selectedSymbol: string
  details: any
  infoLabel?: string // Optional label for stock/bond info
}

export const StockDetails = ({ selectedSymbol, details, infoLabel }: StockDetailsProps) => {
  const { t } = useTranslation()

  if (!details) {
    return <div>Loading...</div>
  }

  return (
    <div className="sm:mt-6 sm:p-4 p-2">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <BarChart3 size={18} className="mr-2 text-bdsec dark:text-indigo-400" />
        {infoLabel || t('dashboard.stockDetails')} - {selectedSymbol.split('-')[0]}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="overflow-hidden">
          <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">ISIN:</span>
              <span className="text-sm font-medium">{details.ISIN}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.companyCode')}:</span>
              <span className="text-sm font-medium">{details.companycode}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="divide-y divide-dashed divide-gray-200 dark:divide-gray-700">
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.totalShares')}:</span>
              <span className="text-sm font-medium">{details.issued_shares}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.listedShares')}:</span>
              <span className="text-sm font-medium">{details.outstanding_shares}</span>
            </div>
            <div className="flex justify-between items-center p-3">
              <span className="text-sm text-gray-500">{t('dashboard.listingDate')}:</span>
              <span className="text-sm font-medium">{details.changedate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 