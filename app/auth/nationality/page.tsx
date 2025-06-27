'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, ChevronRight, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const countries = [
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'CN', name: 'China' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'KR', name: 'South Korea' },
  { code: 'RU', name: 'Russia' },
  { code: 'US', name: 'United States' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function NationalityPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCountries = useMemo(() => {
    if (!searchTerm) {
      return countries
    }
    return countries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleSelectCountry = (country: { code: string; name: string }) => {
    setSelectedCountry(country)
    setSearchTerm(country.name)
  }

  const handleNext = () => {
    if (selectedCountry) {
      router.push(`/auth/register?country=${selectedCountry.code}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Globe className="mx-auto h-12 w-12 text-bdsec dark:text-indigo-400" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.selectYourNationality')}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('auth.nationalityHelpText')}
          </p>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              // Deselect country if user types something that doesn't match the selection
              if (selectedCountry && selectedCountry.name !== e.target.value) {
                setSelectedCountry(null)
              }
            }}
            placeholder={t('common.searchForCountry')}
            className="block w-full rounded-md border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 pl-10 pr-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-bdsec focus:border-bdsec dark:focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="mt-4 h-64 overflow-y-auto space-y-2 pr-2">
          {filteredCountries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleSelectCountry(country)}
              className={`w-full flex items-center p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedCountry?.code === country.code
                  ? 'bg-bdsec/10 border-bdsec dark:bg-indigo-500/20 dark:border-indigo-500'
                  : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <span className="flex-1 font-medium text-gray-900 dark:text-white">{country.name}</span>
              {selectedCountry?.code === country.code && (
                <div className="w-5 h-5 rounded-full bg-bdsec dark:bg-indigo-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              )}
            </button>
          ))}
          {filteredCountries.length === 0 && (
             <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                {t('common.noResults')}
             </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={handleNext}
            disabled={!selectedCountry}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-bdsec hover:bg-bdsec/90 disabled:bg-gray-400 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:disabled:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bdsec dark:focus:ring-indigo-500 transition-colors"
          >
            {t('common.next')}
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 