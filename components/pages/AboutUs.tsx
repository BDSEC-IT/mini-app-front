'use client'

import { useTranslation } from 'react-i18next'
import { Phone, Globe, TrendingUp, TrendingDown, Users, Building2, Award, Target, Eye, Heart, BarChart3 } from 'lucide-react'
import { Facebook, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect, useRef } from 'react'
import { fetchAllStocks, type StockData } from '@/lib/api'
import Image from 'next/image'
import CircularProgress from '../ui/CircularProcess'

// Animated Counter Component
const AnimatedCounter = ({ 
  end, 
  duration = 2000, 
  suffix = '', 
  prefix = '',
  decimals = 0,
  inView = false 
}: { 
  end: number
  duration?: number
  suffix?: string
  prefix?: string
  decimals?: number
  inView?: boolean
}) => {
  const [count, setCount] = useState(0)
  const startTime = useRef<number | null>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!inView) {
      setCount(0)
      return
    }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      setCount(end * easeOutQuart)
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      startTime.current = null
    }
  }, [end, duration, inView])

  return (
    <span>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  )
}

// Intersection Observer Hook
const useInView = (threshold = 0.1) => {
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView] as const
}



const AboutUs = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [topGainers, setTopGainers] = useState<StockData[]>([])
  const [topLosers, setTopLosers] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<'underwriter' | 'broker'>('underwriter')

  // Intersection observer refs for animations
  const [heroRef, heroInView] = useInView(0.1)
  const [statsRef, statsInView] = useInView(0.3)
  const [chartsRef, chartsInView] = useInView(0.2)
  
  const chartData = {
    underwriter: [
      { value: 39.3, sublabel: t('about.billion'), otherValue: 223.1 },
      { value: 61.5, sublabel: t('about.billion'), otherValue: 48.9 },
      { value: 77.5, sublabel: t('about.trillion'), otherValue: 1.71 },
    ],
    broker: [
      { year: '2021', value: 37, label: '1.04', sublabel: t('about.trillion'), otherValue: 2.8 , otherLabel:t('about.trillion') },
      { year: '2022', value: 18, label: '207.8', sublabel: t('about.trillion'), otherValue: 1.2 , otherLabel:t('about.trillion') },
      { year: '2023', value: 26.8, label: '389.2', sublabel: t('about.billion'), otherValue: 1.45 , otherLabel:t('about.trillion') },
      { year: '2024', value: 37, label: '1.04', sublabel: t('about.trillion'), otherValue: 2.8 , otherLabel:t('about.trillion') },
    ],
  }

  const data = chartData[selectedType]

  // Fetch stock data
  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true)
        const response = await fetchAllStocks()
        
        if (response.success && response.data) {
          const validStocks = response.data.filter(stock => 
            stock.Changep !== undefined && !isNaN(stock.Changep)
          )
          
          const sortedByGain = [...validStocks].sort((a, b) => b.Changep - a.Changep)
          const sortedByLoss = [...validStocks].sort((a, b) => a.Changep - b.Changep)
          
          setTopGainers(sortedByGain.slice(0, 6))
          setTopLosers(sortedByLoss.slice(0, 6))
        }
      } catch (err) {
        console.error('Error fetching stock data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStockData()
  }, [])

  const formatPrice = (price?: number) => {
    if (price === undefined || isNaN(price)) return '-'
    return price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
      {/* Minimal Hero Section */}
      <div ref={heroRef} className="px-4 md:px-6 py-6">
        <div className={`transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {t('about.title')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t('about.description')}
          </p>
        </div>

        {/* Clean company showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Company image - more compact */}
          <div className={`lg:col-span-3 transition-all duration-1000 delay-200 ${heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="aspect-[16/6] relative overflow-hidden">
                <img 
                  src="/images/bdsec.png" 
                  className="w-full h-full object-cover" 
                  alt="BDSec" 
                />
              </div>
            </div>
          </div>

          {/* Market movers - enhanced with more stocks */}
          <div className={`transition-all duration-1000 delay-400 ${heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-bdsec dark:text-indigo-400" />
                  {t('about.marketMovement')}
                </h3>
                <div className='w-full grid grid-cols-2 gap-4'>
                      {/* Top Gainers - 4 stocks */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('about.growth')}</h4>
                      </div>
                      
                      {isLoading ? (
                        <div className="flex justify-center py-3">
                          <div className="animate-spin w-4 h-4 border-2 border-bdsec dark:border-indigo-400 border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {topGainers.slice(0, 5).map((stock, index) => (
                            <div key={`gainer-${stock.Symbol}-${index}`} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-500/10 rounded-md hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors">
                              <div>
                                <div className="text-xs font-medium text-gray-900 dark:text-white">{stock.Symbol.split('-')[0]}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{formatPrice(stock.LastTradedPrice)} ₮</div>
                              </div>
                              <div className="text-green-600 dark:text-green-400 text-xs font-semibold">+{stock.Changep.toFixed(2)}%</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                      {/* Top Losers - 4 stocks */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Fall</h4>
                      </div>
                      
                      {isLoading ? (
                        <div className="flex justify-center py-3">
                          <div className="animate-spin w-4 h-4 border-2 border-bdsec dark:border-indigo-400 border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {topLosers.slice(0, 5).map((stock, index) => (
                            <div key={`loser-${stock.Symbol}-${index}`} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-500/10 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                              <div>
                                <div className="text-xs font-medium text-gray-900 dark:text-white">{stock.Symbol.split('-')[0]}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{formatPrice(stock.LastTradedPrice)} ₮</div>
                              </div>
                              <div className="text-red-600 dark:text-red-400 text-xs font-semibold">{stock.Changep.toFixed(2)}%</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                </div>                               
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Minimal Statistics Section */}
      <div ref={statsRef} className="px-4 md:px-6 pb-6">
        <div className={`mb-6 transition-all duration-1000 ${statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('about.ourAchievements')}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { 
              number: 34, 
              suffix: '', 
              label: t('about.years'),
              icon: Award,
            },
            { 
              number: 344, 
              suffix: '+', 
              label: t('about.customers_too'),
              icon: Users,
            },
            { 
              number: 3, 
              suffix: '', 
              label:t('about.branches'),
              icon: Building2,
            },
            { 
              number: 2.0, 
              suffix: '', 
              label: t('about.billionAssets'),
              icon: TrendingUp,
              decimals: 1
            }
          ].map((stat, index) => (
            <div 
              key={index}
              className={`text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-500 delay-${index * 100} ${
                statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="flex items-center justify-center mb-2">
                <stat.icon className="w-5 h-5 text-bdsec dark:text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                <AnimatedCounter 
                  end={stat.number} 
                  suffix={stat.suffix}
                  decimals={stat.decimals || 0}
                  inView={statsInView}
                  duration={2000}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Minimal Charts Section */}
      <div ref={chartsRef} className="px-4 md:px-6 py-6">
        <div className={`transition-all duration-1000 ${chartsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('about.services')}
            </h2>

            {/* Simple Toggle Buttons */}
            <div className="flex justify-start mb-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedType === 'underwriter'
                      ? 'bg-bdsec dark:bg-indigo-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
                  }`}
                  onClick={() => setSelectedType('underwriter')}
                >
                  {t('about.underwriter')}
                </button>
                <button
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedType === 'broker'
                      ? 'bg-bdsec dark:bg-indigo-500 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-bdsec dark:hover:text-indigo-400'
                  }`}
                  onClick={() => setSelectedType('broker')}
                >
                  {t('about.broker')}
                </button>
              </div>
            </div>
          </div>

          {/* Compact Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedType === 'broker' &&
              chartData.broker.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-start">
                    <CircularProgress
                      value={item.value}
                      label={item.label}
                      sublabel={item.sublabel}
                      otherValue={item.otherValue}
                      otherLabel={item.otherLabel}
                      bottomLabel={item.year}
                      variant="broker"
                    />
                  </div>
                </div>
              ))}

            {selectedType === 'underwriter' &&
              chartData.underwriter.map((item, idx) => {
                const labels = ['IPO', 'FPO', 'Бонд']
                return (
                  <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <CircularProgress
                        value={item.value}
                        label={item.otherValue.toString()}
                        sublabel={item.sublabel}
                        otherValue={item.otherValue}
                        bottomLabel=""
                        variant="underwriter"
                      />
                      <div className="text-left">
                        <div className="text-xl font-bold text-bdsec dark:text-indigo-400 mb-1">
                          {item.value.toFixed(1)}%
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {labels[idx]}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {t('about.marketShare')}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Minimal Contact Section */}
      <div className="px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('about.contact')}
            </h2>
            
            <div className="space-y-3">
              <a 
                href="tel:97675551919" 
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-bdsec dark:hover:border-indigo-400 transition-colors"
              >
                <Phone className="w-4 h-4 text-bdsec dark:text-indigo-400" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('about.phone')}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">976-7555-1919</div>
                </div>
              </a>
              
              <a 
                href="https://www.bdsec.mn" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-bdsec dark:hover:border-indigo-400 transition-colors"
              >
                <Globe className="w-4 h-4 text-bdsec dark:text-indigo-400" />
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t('about.website')}</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">www.bdsec.mn</div>
                </div>
              </a>

              {/* Address */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-bdsec dark:text-indigo-400 mt-1" />
                  <div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('about.address')}</div>
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {t('about.addressLine1')}<br />
                      {t('about.addressLine2')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('about.socialPlatforms')}
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Facebook', icon: Facebook, url: 'https://www.facebook.com/BDSecJSC' },
                { name: 'YouTube', icon: Youtube, url: 'https://www.youtube.com/@bdsecjsc9617' },
                { name: 'Instagram', icon: Instagram, url: 'https://www.instagram.com/bdsec.brokerage/' },
                { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/company/bdsec-jsc/' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-bdsec dark:hover:border-indigo-400 transition-colors"
                >
                  <social.icon className="w-4 h-4 text-bdsec dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs 