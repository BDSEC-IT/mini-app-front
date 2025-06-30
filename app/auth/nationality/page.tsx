'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Search, ChevronRight } from 'lucide-react'
import { digipayLogin } from '@/lib/api'
import Cookies from 'js-cookie'

// ISO 3166-1 country codes with names in English and Mongolian
const countries = [
  { code: 'MN', name: 'Mongolia', nameMN: 'Монгол' },
  { code: 'US', name: 'United States', nameMN: 'Америк' },
  { code: 'CN', name: 'China', nameMN: 'Хятад' },
  { code: 'JP', name: 'Japan', nameMN: 'Япон' },
  { code: 'KR', name: 'South Korea', nameMN: 'Өмнөд Солонгос' },
  { code: 'RU', name: 'Russia', nameMN: 'Орос' },
  { code: 'GB', name: 'United Kingdom', nameMN: 'Их Британи' },
  { code: 'DE', name: 'Germany', nameMN: 'Герман' },
  { code: 'FR', name: 'France', nameMN: 'Франц' },
  { code: 'IT', name: 'Italy', nameMN: 'Итали' },
  { code: 'CA', name: 'Canada', nameMN: 'Канад' },
  { code: 'AU', name: 'Australia', nameMN: 'Австрали' },
  { code: 'NZ', name: 'New Zealand', nameMN: 'Шинэ Зеланд' },
  { code: 'SG', name: 'Singapore', nameMN: 'Сингапур' },
  { code: 'IN', name: 'India', nameMN: 'Энэтхэг' },
  { code: 'ID', name: 'Indonesia', nameMN: 'Индонез' },
  { code: 'MY', name: 'Malaysia', nameMN: 'Малайз' },
  { code: 'TH', name: 'Thailand', nameMN: 'Тайланд' },
  { code: 'VN', name: 'Vietnam', nameMN: 'Вьетнам' },
  { code: 'PH', name: 'Philippines', nameMN: 'Филиппин' },
  { code: 'TR', name: 'Turkey', nameMN: 'Турк' },
  { code: 'AE', name: 'United Arab Emirates', nameMN: 'Арабын Нэгдсэн Эмират' },
  { code: 'KZ', name: 'Kazakhstan', nameMN: 'Казахстан' },
  { code: 'KG', name: 'Kyrgyzstan', nameMN: 'Киргиз' },
  { code: 'UZ', name: 'Uzbekistan', nameMN: 'Узбекистан' },
  { code: 'TJ', name: 'Tajikistan', nameMN: 'Тажикистан' },
  { code: 'TM', name: 'Turkmenistan', nameMN: 'Туркменистан' },
  { code: 'AF', name: 'Afghanistan', nameMN: 'Афганистан' },
  { code: 'PK', name: 'Pakistan', nameMN: 'Пакистан' },
  { code: 'IR', name: 'Iran', nameMN: 'Иран' },
  { code: 'IQ', name: 'Iraq', nameMN: 'Ирак' },
  { code: 'SA', name: 'Saudi Arabia', nameMN: 'Саудын Араб' },
  { code: 'QA', name: 'Qatar', nameMN: 'Катар' },
  { code: 'KW', name: 'Kuwait', nameMN: 'Кувейт' },
  { code: 'BH', name: 'Bahrain', nameMN: 'Бахрейн' },
  { code: 'OM', name: 'Oman', nameMN: 'Оман' },
  { code: 'IL', name: 'Israel', nameMN: 'Израиль' },
  { code: 'PS', name: 'Palestine', nameMN: 'Палестин' },
  { code: 'JO', name: 'Jordan', nameMN: 'Йордан' },
  { code: 'LB', name: 'Lebanon', nameMN: 'Ливан' },
  { code: 'SY', name: 'Syria', nameMN: 'Сири' }
].sort((a, b) => a.name.localeCompare(b.name));

export default function NationalityPage() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCountries, setFilteredCountries] = useState(countries)
  const currentLanguage = i18n.language
  
  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCountries(countries)
      return
    }
    
    const filtered = countries.filter(country => {
      const searchLower = searchTerm.toLowerCase()
      return (
        country.name.toLowerCase().includes(searchLower) || 
        country.nameMN.toLowerCase().includes(searchLower)
      )
    })
    
    setFilteredCountries(filtered)
  }, [searchTerm])
  
  // Handle country selection
  const selectCountry = async (countryCode: string) => {
    // Store selected nationality in session storage
    sessionStorage.setItem('nationality', countryCode)
    
    // Get DigiPay token if it doesn't exist
    const token = Cookies.get('auth_token')
    if (!token) {
      try {
        // For demo purposes, using a hardcoded userIdKhan
        // In production, this would come from an environment variable or another source
        const response = await digipayLogin('demo_user_id')
        
        if (response.success && response.data?.token) {
          // Store token in cookies
          Cookies.set('auth_token', response.data.token, { expires: 7 })
        } else {
          console.error('Failed to get token:', response.message)
          // Set a fallback demo token for testing purposes
          const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
          Cookies.set('auth_token', demoToken, { expires: 7 })
          console.log('Using fallback demo token for testing')
        }
      } catch (error) {
        console.error('Error during login:', error)
        // Set a fallback demo token for testing purposes
        const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
        Cookies.set('auth_token', demoToken, { expires: 7 })
        console.log('Using fallback demo token for testing')
      }
    }
    
    // Navigate to registration page
    router.push(`/auth/register?nationality=${countryCode}`)
  }
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-4">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {t('auth.selectYourNationality')}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('auth.nationalityHelpText')}
        </p>
        
        {/* Search input */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('common.searchForCountry')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none 
                     focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500"
          />
        </div>
        
        {/* Country list */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          {filteredCountries.length > 0 ? (
            <ul className="max-h-[400px] overflow-y-auto">
              {filteredCountries.map((country) => (
                <li key={country.code} className="border-b border-gray-200 dark:border-gray-800 last:border-b-0">
                  <button
                    onClick={() => selectCountry(country.code)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {currentLanguage === 'mn' ? country.nameMN : country.name}
                    </span>
                    <ChevronRight className="text-gray-400" size={18} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {t('common.noResults')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 