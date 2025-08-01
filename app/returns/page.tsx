'use client'

import { useTranslation } from 'react-i18next'
import { ExternalLink, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function ReturnsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-bdsec/10 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-bdsec dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ашиг алдагдал
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              тун удахгүй
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Одоогоор та өөрийн ашиг алдагдлыг BDSEC-ийн онлайн системээс харах боломжтой
            </p>
            
            <a
              href="https://dbx.bdsec.mn/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-bdsec hover:bg-bdsec/90 text-white font-medium rounded-md transition-colors"
            >
              BDSEC онлайн систем рүү очих
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
            
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Буцах
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 