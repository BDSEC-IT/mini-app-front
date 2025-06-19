'use client'

import { useTranslation } from 'react-i18next'
import { Phone, Globe, Facebook, Youtube } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const AboutUs = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold mb-4">{t('about.title')}</h1>
        
        {/* Company Image */}
        <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-64 w-full flex items-center justify-center mb-6">
          <div className="text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        </div>
        
        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{t('about.services')}</h2>
          <ul className="space-y-2 text-sm">
            <li>{t('about.broker')}</li>
            <li>{t('about.dealer')}</li>
            <li>{t('about.underwriter')}</li>
            <li>{t('about.investment')}</li>
            <li>{t('about.consulting')}</li>
            <li>{t('about.exchange')}</li>
          </ul>
        </div>
        
        {/* Company Stats */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">34</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('about.yearsExperience')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2.0</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('about.billionAssets')}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">06</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('about.ipoDeals')}</p>
          </div>
        </div>
        
        {/* Address Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">{t('about.address')}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t('about.addressLine1')}<br />
            {t('about.addressLine2')}
          </p>
        </div>
        
        {/* Contact Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">{t('about.contact')}</h2>
          <div className="space-y-4">
            <a href="tel:97675551919" className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Phone size={24} className="mr-3 text-indigo-600 dark:text-indigo-400" />
              <span>976-7555-1919</span>
            </a>
            <a href="https://www.bdsec.mn" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Globe size={24} className="mr-3 text-indigo-600 dark:text-indigo-400" />
              <span>www.bdsec.mn</span>
            </a>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com/bdsec" target="_blank" rel="noopener noreferrer" className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                <Facebook size={24} className="text-indigo-600 dark:text-indigo-400" />
              </a>
              <a href="https://youtube.com/bdsec" target="_blank" rel="noopener noreferrer" className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                <Youtube size={24} className="text-indigo-600 dark:text-indigo-400" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs 