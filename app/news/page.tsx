'use client'

import { useTranslation } from 'react-i18next'
import MainLayout from '@/components/layout/MainLayout'

export default function NewsPage() {
  const { t } = useTranslation()

  return (
    <MainLayout>
      <div className="px-2 sm:px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('menu.news')}</h1>
        
        <div className="space-y-6">
          {/* News items would go here */}
          {[1, 2, 3, 4, 5].map((item) => (
            <div 
              key={item} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg mb-1">
                    {t('menu.news')} {item}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                    {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 