'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Search, ChevronRight } from 'lucide-react'
import { digipayLogin, getRegistrationNumber, BASE_URL } from '@/lib/api'
import Cookies from 'js-cookie'

export default function NationalityPage() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [countries, setCountries] = useState<{ countryCode: string, countryName: string }[]>([])
  const [selected, setSelected] = useState('')
  const currentLanguage = i18n.language
  
  useEffect(() => {
    fetch(`${BASE_URL}/helper/countries`)
      .then(res => res.json())
      .then(data => setCountries(data.data || []))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected) {
      // Redirect to register page with selected countryCode as query param
      router.push(`/auth/register?nationality=${selected}`)
    }
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