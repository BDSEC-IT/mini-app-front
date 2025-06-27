'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const countries = [
  { code: 'MN', name: 'Mongolia' },
  { code: 'US', name: 'United States' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'RU', name: 'Russia' },
]

export default function NationalityPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountry(countryCode)
  }

  const handleNext = () => {
    if (selectedCountry) {
      router.push(`/auth/register?country=${selectedCountry}`)
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

        <div className="space-y-3">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleSelectCountry(country.code)}
              className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
                selectedCountry === country.code
                  ? 'bg-bdsec/10 border-bdsec dark:bg-indigo-500/20 dark:border-indigo-500'
                  : 'bg-white border-gray-200 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 dark:text-white">{country.name}</p>
              </div>
              {selectedCountry === country.code && (
                <div className="w-5 h-5 rounded-full bg-bdsec dark:bg-indigo-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              )}
            </button>
          ))}
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