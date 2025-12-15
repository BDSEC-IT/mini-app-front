'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Loader2, Globe } from 'lucide-react'
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
      <div className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Ambient gradient blobs */}
        <div className="pointer-events-none absolute -top-32 -left-20 h-72 w-72 rounded-full bg-bdsec/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-gray-800/60 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <Loader2 className="h-6 w-6 animate-spin text-bdsec dark:text-indigo-500" />
          </div>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {t('common.loading', 'Уншиж байна...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient decorative gradients */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-bdsec/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative z-10 max-w-md mx-auto p-4 sm:p-6 lg:p-8 pb-24">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/70 dark:bg-gray-800/70 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
            <Globe className="h-6 w-6 text-bdsec dark:text-indigo-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {t('auth.selectYourNationality', 'Улсаа сонгоно уу')}
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {t('auth.nationalitySubtitle', 'Бүртгэлийг үргэлжлүүлэхийн өмнө өөрийн харъялалтай улсаа сонгоно уу')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white/70 dark:bg-gray-900/60 shadow-xl backdrop-blur-md p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('common.selectCountry', 'Улс сонгох')}
              </label>
              <div className="relative">
                <select
                  id="nationality"
                  value={selected}
                  onChange={e => setSelected(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 border-gray-300 dark:border-gray-700 focus:ring-bdsec dark:focus:ring-indigo-500 bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white appearance-none"
                >
                  <option value="">{t('common.selectCountry', 'Улс сонгох')}</option>
                  {countries.map(c => (
                    <option key={c.countryCode} value={c.countryCode}>{c.countryName}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                  ▾
                </span>
              </div>
            </div>

            <button type="submit" className="w-full px-4 py-2 bg-bdsec dark:bg-indigo-500 text-white rounded-md hover:bg-bdsec/90 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              {t('auth.verifyAccount', 'Үргэлжлүүлэх')}
            </button>
          </form>
        </div>

        {/* Small helper text */}
        {/* <p className="mt-4 text-[11px] text-center text-gray-500 dark:text-gray-400">
          {t('auth.nationalityHelp', 'Та буруу сонгосон бол дараагийн алхамд өөрчилж болно.')}
        </p> */}
      </div>
    </div>
  )
} 