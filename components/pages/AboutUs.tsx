'use client'

import { useTranslation } from 'react-i18next'
import { Phone, Globe, TrendingUp, TrendingDown } from 'lucide-react'
import { Facebook, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react'
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
          
          // Get top 8 gainers and losers
          setTopGainers(sortedByGain.slice(0, 8))
          setTopLosers(sortedByLoss.slice(0, 8))
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
      <div className="px-4 md:px-6 py-6">
        <h1 className="text-xl font-bold mb-6">{t('about.title')}</h1>
        
        {/* Main content with side-by-side layout */}
        <div className="flex flex-row gap-2 md:gap-4 mb-8">
          {/* Left column with Company Image and Services */}
          <div className="w-2/3 pr-1 md:pr-0">
            {/* Company Image */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg w-full flex items-center justify-center mb-6 overflow-hidden">
              <img 
                src="/images/bdsec.png" 
                className="w-full h-auto" 
                alt="BDSec" 
              />
            </div>
            
            {/* Services Section */}
            <div className="mb-8">
              <h2 className="text-base font-medium mb-4 text-bdsec dark:text-indigo-400">{t('about.services')}</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.broker')}
                </li>
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.dealer')}
                </li>
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.underwriter')}
                </li>
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.investment')}
                </li>
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.consulting')}
                </li>
                <li className="flex items-center">
                  <div className="w-1 h-1 bg-bdsec dark:bg-indigo-400 rounded-full mr-2"></div>
                  {t('about.exchange')}
                </li>
              </ul>
            </div>
          </div>
          
          {/* Right column with Market Movers - always shown to the right */}
          <div className="w-1/3">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-full">
              {/* Top Gainers */}
              <div className="border-l-2 border-green-500 dark:border-green-600 p-2.5 mb-1">
                <div className="flex items-center mb-3">
                  <TrendingUp className="text-green-500 dark:text-green-400 mr-1.5" size={14} />
                  <h3 className="font-medium text-xs md:text-sm">{t('about.topGainers', 'Top Gainers')}</h3>
                </div>
                
                {isLoading ? (
                  <div className="py-2 flex justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-bdsec dark:border-indigo-400 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {topGainers.map((stock, index) => (
                      <div key={`gainer-${stock.Symbol}-${index}`} className="py-1 flex justify-between items-center">
                        <div className="">
                          <div className="font-medium text-[10px] md:text-xs">{stock.Symbol.split('-')[0]}</div>
                          <div className="text-[9px] md:text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{stock.mnName || stock.enName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-500 dark:text-green-400 text-[10px] md:text-xs font-medium">+{stock.Changep.toFixed(2)}%</div>
                          <div className="text-[9px] md:text-xs">{formatPrice(stock.LastTradedPrice)} ₮</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Top Losers */}
              <div className="border-l-2 border-red-500 dark:border-red-600 p-2.5">
                <div className="flex items-center mb-2">
                  <TrendingDown className="text-red-500 dark:text-red-400 mr-1.5" size={14} />
                  <h3 className="font-medium text-xs md:text-sm">{t('about.topLosers', 'Top Losers')}</h3>
                </div>
                
                {isLoading ? (
                  <div className="py-2 flex justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-bdsec dark:border-indigo-400 border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {topLosers.map((stock, index) => (
                      <div key={`loser-${stock.Symbol}-${index}`} className="py-1 flex justify-between items-center">
                        <div>
                          <div className="font-medium text-[10px] md:text-xs">{stock.Symbol.split('-')[0]}</div>
                          <div className="text-[9px] md:text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">{stock.mnName || stock.enName}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-500 dark:text-red-400 text-[10px] md:text-xs font-medium">{stock.Changep.toFixed(2)}%</div>
                          <div className="text-[9px] md:text-xs">{formatPrice(stock.LastTradedPrice)} ₮</div>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <h3 className="text-3xl md:text-4xl font-bold text-bdsec dark:text-indigo-400">34 <span className="text-sm md:text-base font-normal">{t('about.years', 'жил')}</span></h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('about.yearsExperience')}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <h3 className="text-3xl md:text-4xl font-bold text-bdsec dark:text-indigo-400">2.0 <span className="text-sm md:text-base font-normal">{t('about.billion', 'их наяд')}</span></h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('about.billionAssets')}</p>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <h3 className="text-3xl md:text-4xl font-bold text-bdsec dark:text-indigo-400">06 <span className="text-sm md:text-base font-normal">{t('about.deals', 'онд')}</span></h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{t('about.ipoDeals')}</p>
            </div>
          </div>
          
          {/* Contact and Address in two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Section */}
            <div className="mb-6">
              <h2 className="text-base font-medium mb-3 text-bdsec dark:text-indigo-400">{t('about.address')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('about.addressLine1')}<br />
                {t('about.addressLine2')}
              </p>
            </div>
            
            {/* Contact Section */}
            <div className="mb-8">
              <h2 className="text-base font-medium mb-3 text-bdsec dark:text-indigo-400">{t('about.contact')}</h2>
              <div className="flex flex-col md:flex-row justify-between">
                <div className="space-y-4 mb-4 md:mb-0">
                  <a href="tel:97675551919" className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-bdsec dark:hover:text-indigo-400 transition-colors">
                    <Phone size={18} className="mr-3 text-bdsec dark:text-indigo-400" />
                    <span>976-7555-1919</span>
                  </a>
                  <a href="https://www.bdsec.mn" target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-bdsec dark:hover:text-indigo-400 transition-colors">
                    <Globe size={18} className="mr-3 text-bdsec dark:text-indigo-400" />
                    <span>www.bdsec.mn</span>
                  </a>
                </div>
                
                <div className="flex space-x-2">
                  <a href="https://www.facebook.com/BDSecJSC" target="_blank" rel="noopener noreferrer" className="inline-block border border-gray-200 dark:border-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Facebook size={16} className="text-bdsec dark:text-indigo-400" />
                  </a>
                  <a href="https://www.youtube.com/@bdsecjsc9617" target="_blank" rel="noopener noreferrer" className="inline-block border border-gray-200 dark:border-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Youtube size={16} className="text-bdsec dark:text-indigo-400" />
                  </a>
                  <a href="https://www.instagram.com/bdsec_jsc/" target="_blank" rel="noopener noreferrer" className="inline-block border border-gray-200 dark:border-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Instagram size={16} className="text-bdsec dark:text-indigo-400" />
                  </a>
                  <a href="https://twitter.com/BDSecJSC" target="_blank" rel="noopener noreferrer" className="inline-block border border-gray-200 dark:border-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Twitter size={16} className="text-bdsec dark:text-indigo-400" />
                  </a>
                  <a href="https://www.linkedin.com/company/bdsec-jsc/" target="_blank" rel="noopener noreferrer" className="inline-block border border-gray-200 dark:border-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Linkedin size={16} className="text-bdsec dark:text-indigo-400" />
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