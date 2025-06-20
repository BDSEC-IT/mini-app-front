'use client'

import { useTranslation } from 'react-i18next'
import { Phone, Globe, TrendingUp, TrendingDown } from 'lucide-react'
import { Facebook, Youtube } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'
import { fetchAllStocks, type StockData } from '@/lib/api'
import Image from 'next/image'

const AboutUs = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [topGainers, setTopGainers] = useState<StockData[]>([])
  const [topLosers, setTopLosers] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true)
        const response = await fetchAllStocks()
        
        if (response.success && response.data) {
          // Filter out stocks with no price change data
          const validStocks = response.data.filter(stock => 
            stock.Changep !== undefined && !isNaN(stock.Changep)
          )
          
          // Sort by percentage change
          const sortedByGain = [...validStocks].sort((a, b) => b.Changep - a.Changep)
          const sortedByLoss = [...validStocks].sort((a, b) => a.Changep - b.Changep)
          
          // Get top 4 gainers and losers
          setTopGainers(sortedByGain.slice(0, 4))
          setTopLosers(sortedByLoss.slice(0, 4))
        }
      } catch (err) {
        console.error('Error fetching stock data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStockData()
  }, [])

  // Format price for display
  const formatPrice = (price?: number) => {
    if (price === undefined || isNaN(price)) return '-'
    return price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 md:px-1 py-6">
        <h1 className="text-xl font-bold mb-4">{t('about.title')}</h1>
        
        {/* Top section with company image and market movers side by side */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {/* Left column with Company Image and Services */}
          <div className="w-[63%]">
            {/* Company Image - smaller height */}
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-48 lg:h-80 w-full flex items-center justify-center mb-6">
              <div className="text-gray-500 dark:text-gray-400">
                <img src="/images/bdsec.png" className="rounded-md" alt="BDSec" />
              </div>
            </div>
            
            {/* Services Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-3 text-bdsec dark:text-indigo-400">{t('about.services')}</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.broker')}
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.dealer')}
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.underwriter')}
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.investment')}
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.consulting')}
                </li>
                <li className="flex items-center">
                  <div className="w-1.5 h-1.5 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.exchange')}
                </li>
              </ul>
            </div>
          </div>
          
          {/* Market Movers (1/4 width on desktop, 1/3 on mobile) */}
          <div className="w-[35%]">
            <div>
              {/* <h2 className="text-lg font-semibold mb-4">{t('about.marketMovers', 'Market Movers Today')}</h2> */}
              
              {/* Top Gainers */}
              <div className="border-l-1 p-3 border-soft border-opacity-50 mb-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="text-green-500 dark:text-green-400 mr-2" size={16} />
                  <h3 className="font-semibold text-bdsec dark:text-indigo-400 text-sm">{t('about.topGainers', 'Top Gainers')}</h3>
                </div>
                
                {isLoading ? (
                  <div className="py-2 flex justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-bdsec dark:border-indigo-400 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-soft divide-opacity-30">
                    {topGainers.slice(0, 4).map((stock) => (
                      <div key={stock.Symbol} className="py-[6px] flex justify-between items-center">
                        <div className="">
                          <div className="font-medium text-xs">{stock.Symbol.split('-')[0]}</div>
                          <div className="text-2xs text-gray-600 dark:text-gray-300 truncate max-w-[80px] sm:max-w-[150px]">{stock.mnName || stock.enName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-[2px] py-1 rounded-md font-medium text-xs">+{stock.Changep.toFixed(2)}%</div>
                          <div className="text-xs">{formatPrice(stock.LastTradedPrice)} ₮</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Top Losers */}
              <div className="border-l-1 p-3 border-soft border-opacity-50">
                <div className="flex items-center mb-2">
                  <TrendingDown className="text-red-500 dark:text-red-400 mr-2" size={16} />
                  <h3 className="font-semibold text-bdsec dark:text-indigo-400 text-sm">{t('about.topLosers', 'Top Losers')}</h3>
                </div>
                
                {isLoading ? (
                  <div className="py-2 flex justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-bdsec dark:border-indigo-400 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-soft divide-opacity-30">
                    {topLosers.slice(0, 4).map((stock) => (
                      <div key={stock.Symbol} className="py-[6px] flex justify-between items-center">
                        <div>
                          <div className="font-medium text-xs">{stock.Symbol.split('-')[0]}</div>
                          <div className="text-2xs text-gray-600 dark:text-gray-300 truncate max-w-[80px] sm:max-w-[150px]">{stock.mnName || stock.enName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-[2px] py-1 rounded-md font-medium text-xs">{stock.Changep.toFixed(2)}%</div>
                          <div className="text-xs">{formatPrice(stock.LastTradedPrice)} ₮</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="lg:pr-4">
          {/* Company Stats */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center border-soft border-opacity-50 border-1">
              <h3 className="text-[40px] text-left font-bold text-bdsec dark:text-indigo-400">34<span className="text-xs text-left font-normal">{t('about.years', 'жил')}</span></h3>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">{t('about.yearsExperience')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center border-soft border-opacity-50 border-1">
              <h3 className="text-[40px] text-left font-bold text-bdsec dark:text-indigo-400">2.0<span className="text-xs text-left font-normal">{t('about.billion', 'их наяд')}</span></h3>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">{t('about.billionAssets')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-soft border-opacity-50 border-1">
              <h3 className="text-[40px] text-left font-bold text-bdsec dark:text-indigo-400">06<span className="text-xs text-left font-normal">{t('about.deals', 'онд')}</span></h3>
              <p className="text-xs text-right text-gray-500 dark:text-gray-400 mt-1">{t('about.ipoDeals')}</p>
            </div>
          </div>
          
          {/* Contact and Address in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Section */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-bdsec dark:text-indigo-400">{t('about.address')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('about.addressLine1')}<br />
                {t('about.addressLine2')}
              </p>
            </div>
            
            {/* Contact Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-bdsec dark:text-indigo-400">{t('about.contact')}</h2>
              <div className="flex justify-between items-center">
                <div className="space-y-4">
                  <a href="tel:97675551919" className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-bdsec dark:hover:text-indigo-400 transition-colors">
                    <Phone size={24} className="mr-3 text-bdsec dark:text-indigo-400" />
                    <span>976-7555-1919</span>
                  </a>
                  <a href="https://www.bdsec.mn" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-bdsec dark:hover:text-indigo-400 transition-colors">
                    <Globe size={24} className="mr-3 text-bdsec dark:text-indigo-400" />
                    <span>www.bdsec.mn</span>
                  </a>
                </div>
                
                <div className="min-w-[200px] space-x-4 justify-end">
                  <a href="https://www.facebook.com/BDSecJSC" target="_blank" rel="noopener noreferrer" className="inline-block dark:bg-indigo-500/20 p-3 rounded-full hover:bg-bdsec/10 dark:hover:bg-indigo-500/30 transition-colors">
                    <Facebook size={24} className="text-bdsec dark:text-indigo-400" />
                  </a>
                  <a href="https://www.youtube.com/@bdsecjsc9617" target="_blank" rel="noopener noreferrer" className="inline-block dark:bg-indigo-500/20 p-3 rounded-full hover:bg-bdsec/10 dark:hover:bg-indigo-500/30 transition-colors">
                    <Youtube size={24} className="text-bdsec dark:text-indigo-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs 