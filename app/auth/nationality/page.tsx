'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { BASE_URL } from '@/lib/api'

export default function NationalityPage() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [countries, setCountries] = useState<{ countryCode: string, countryName: string }[]>([])
  const [selected, setSelected] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const currentLanguage = i18n.language
  
  useEffect(() => {
    setIsLoading(true)
    fetch(`${BASE_URL}/helper/countries`)
      .then(res => res.json())
      .then(data => {
        const countriesData = data.data || []
        setCountries(countriesData)
        
        // Find and select Mongolia
        const mongolia = countriesData.find(
          (c: any) => c.countryCode === "496" || 
          c.countryName === "Монгол" || 
          c.countryNameEn === "Mongolia"
        )
        if (mongolia) {
          setSelected(mongolia.countryCode)
        }
      })
      .catch(error => {
        console.error('Error fetching countries:', error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected) {
      // Redirect to register page with selected countryCode as query param
      router.push(`/auth/register?nationality=${selected}`)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-bdsec mx-auto" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('common.loading', 'Уншиж байна...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 sm:p-6 lg:p-8 pb-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('auth.selectYourNationality', 'Улсын кодоо сонгоно уу')}
        </label>
        <select
          id="nationality"
          value={selected}
          onChange={e => setSelected(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">{t('common.selectCountry', 'Улс сонгох')}</option>
          {countries.map(c => (
            <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
          ))}
        </select>
        <button type="submit" className="w-full px-4 py-2 bg-bdsec dark:bg-indigo-500 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
          {t('common.continue', 'Үргэлжлүүлэх')}
        </button>
      </form>
    </div>
  )
} 