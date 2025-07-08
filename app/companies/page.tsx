'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchCompanies, type CompanyData } from '@/lib/api'
import { ChevronRight } from 'lucide-react'

const CompaniesPage = () => {
  const { t, i18n } = useTranslation()
  const [companies, setCompanies] = useState<CompanyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getCompanies = async () => {
      try {
        setLoading(true)
        const response = await fetchCompanies()
        if (response.success && response.data) {
          setCompanies(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch companies:', error)
      } finally {
        setLoading(false)
      }
    }

    getCompanies()
  }, [])

  const getLocalizedName = (company: CompanyData) => {
    return i18n.language === 'mn' ? company.mnTitle : company.enTitle
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              <ChevronRight className="transform rotate-180" size={18} />
            </a>
            <h1 className="text-xl font-bold">{t('companies.title')}</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bdsec dark:border-indigo-500 mb-2"></div>
            <p className="text-gray-500 text-sm ml-3">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">{t('companies.symbol')}</th>
                  <th className="px-4 py-3 text-left">{t('companies.name')}</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3">{company.symbol}</td>
                    <td className="px-4 py-3">{getLocalizedName(company)}</td>
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

export default CompaniesPage 