'use client'

import { useTranslation } from 'react-i18next'
import { Phone, Globe, TrendingUp, TrendingDown, Award, Users, Building, Shield, Target, BarChart3, PieChart, TrendingUp as TrendingUpIcon } from 'lucide-react'
import { Facebook, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { useState, useEffect } from 'react'
import { fetchAllStocks, type StockData } from '@/lib/api'
import Image from 'next/image'
import CircularProgress from '../ui/CircularProcess'

const AboutUs = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const [topGainers, setTopGainers] = useState<StockData[]>([])
  const [topLosers, setTopLosers] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const chartData = {
    underwriter: [
      { value: 30.1, sublabel: 'Тэрбум ₮', otherValue: 208.9 },
      { value: 57.7, sublabel: 'Тэрбум₮', otherValue: 48.9 },
      { value: 77.5, sublabel: 'Их наяд ₮', otherValue: 1.71 },
    ],
    broker: [
      { year: '2021', value: 37, label: '1.04', sublabel: 'Их наяд ₮', otherValue: 2.8 },
      { year: '2022', value: 18, label: '207.8', sublabel: 'Тэрбум ₮', otherValue: 1.2 },
      { year: '2023', value: 26.8, label: '389.2', sublabel: 'Тэрбум ₮', otherValue: 1.45 },
      { year: '2024', value: 37, label: '1.04', sublabel: 'Их наяд ₮', otherValue: 2.8 },
    ],
  }

  const [selectedType, setSelectedType] = useState<'underwriter' | 'broker'>('underwriter')
  const data = chartData[selectedType]

  const services = [
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: t('about.broker', 'Брокер'),
      description: 'Үнэт цаасны арилжаанд зуучлах үйлчилгээ'
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: t('about.dealer', 'Дилер'),
      description: 'Үнэт цаасны арилжаанд дилерийн үйлчилгээ'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('about.underwriter', 'Андеррайтер'),
      description: 'Үнэт цаас гаргах, түүнд баталгаа өгөх үйлчилгээ'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Гадаад арилжаанд зуучлах',
      description: 'Олон улсын зах зээлд арилжаа хийх боломж'
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: 'Уул уурхайн биржийн бүтээгдэхүүний зуучлагч',
      description: 'Түүхий эдийн арилжаанд зуучлах үйлчилгээ'
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: t('about.consulting', 'Хөрөнгө оруулалтын зөвлөх'),
      description: 'Хөрөнгө оруулалтын стратеги, зөвлөгөө өгөх үйлчилгээ'
    }
  ]

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
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                <span className="text-blue-600 dark:text-blue-400">BDSec</span> JSC
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
  Монголын хөрөнгийн зах зээлийн анхдагчдын нэг, {" "}
  <span className="text-blue-600 dark:text-blue-400 font-semibold">итгэлтэй, мэргэжлийн санхүүгийн зөвлөх тань</span>
</p>

              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="tel:97675551919" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  Холбогдох
                </a>
                <a 
                  href="https://www.bdsec.mn" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  Вэбсайт
                </a>
              </div>
            </div>
            
            {/* Right Column - Company Image */}
            <div className="relative">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Award className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                
                <div className="text-center">
                  <img 
                    src="/images/bdsec.png" 
                    className="w-full max-w-md mx-auto h-auto" 
                    alt="BDSec JSC" 
                  />
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 animate-bounce"></div>
              <div className="absolute -bottom-4 -right-8 w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 md:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center group">
              <div className="relative inline-block w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-shadow">
                  <Award className="h-10 w-10 md:h-12 md:w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">34</h3>
                  <p className="text-sm md:text-base lg:text-lg font-medium text-gray-600 dark:text-gray-300">{t('about.years', 'жилийн туршлага')}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="relative inline-block w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-shadow">
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">344</h3>
                  <p className="text-sm md:text-base lg:text-lg font-medium text-gray-600 dark:text-gray-300">{t('about.customers_too', 'мянга гаруй харилцагч')}</p>
                </div>
              </div>
            </div>
            
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="relative inline-block w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-shadow">
                  <Building className="h-10 w-10 md:h-12 md:w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">3</h3>
                  <p className="text-sm md:text-base lg:text-lg font-medium text-gray-600 dark:text-gray-300">{t('about.salbar', 'салбартай')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.services', 'Манай үйлчилгээ')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Бид олон төрлийн санхүүгийн үйлчилгээ үзүүлж, таны хөрөнгө оруулалтын зорилгод хүрэхэд тусална
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="group">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white group-hover:scale-110 transition-transform">
                      {service.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Online Services Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Онлайн үйлчилгээ
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Манай онлайн платформоор дараах үйлчилгээг хүлээн авах боломжтой
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <TrendingUpIcon className="h-8 w-8" />,
                title: "Хувьцаа, бонд худалдах, худалдан авах захиалга өгөх",
                description: "Үнэт цаасны арилжаанд оролцох"
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Дансны үлдэгдэл хянах",
                description: "Хөрөнгө оруулалтын дансны мэдээлэл"
              },
              {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Дансны дэлгэрэнгүй хуулга авах",
                description: "Бүрэн дэлгэрэнгүй тайлан"
              },
              {
                icon: <PieChart className="h-8 w-8" />,
                title: "Үнэт цаасны ханш харах",
                description: "Бодит цагийн ханшийн мэдээлэл"
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Мөнгө хүсэх илгээх",
                description: "Санхүүгийн гүйлгээ хийх"
              }
            ].map((service, index) => (
              <div key={index} className="group">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <div className="text-blue-600 dark:text-blue-400">
                        {service.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Overview & Performance */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Market Movers */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('about.marketOverview', 'Зах зээлийн тойм')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Өнөөдрийн хамгийн идэвхтэй арилжаалагдаж буй үнэт цаасууд
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3">
                    <div className="flex items-center text-white">
                      <TrendingUp className="mr-2" size={20} />
                      <h3 className="font-semibold">{t('about.topGainers', 'Өсөлттэй')}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-3 border-green-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topGainers.map((stock, index) => (
                          <div key={`gainer-${stock.Symbol}-${index}`} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{stock.Symbol.split('-')[0]}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{stock.mnName || stock.enName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-green-600 dark:text-green-400 text-sm font-semibold">+{stock?.Changep?.toFixed(2)}%</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{formatPrice(stock.LastTradedPrice)} ₮</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Top Losers */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
                    <div className="flex items-center text-white">
                      <TrendingDown className="mr-2" size={20} />
                      <h3 className="font-semibold">{t('about.topLosers', 'Уналттай')}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-3 border-red-500 border-t-transparent rounded-full"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topLosers.map((stock, index) => (
                          <div key={`loser-${stock.Symbol}-${index}`} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{stock.Symbol.split('-')[0]}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{stock.mnName || stock.enName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-red-600 dark:text-red-400 text-sm font-semibold">{stock?.Changep?.toFixed(2)}%</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">{formatPrice(stock.LastTradedPrice)} ₮</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Performance */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('about.bdsec_did', 'Манай гүйцэтгэл')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  BDSec-ийн үйл ажиллагааны үр дүн
                </p>
              </div>
              
              {/* Underwriter Achievement */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-700 mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Андеррайтерийн үйл ажиллагаа
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  "БиДиСЕК ҮЦК" ХК 2005 оноос хойш МХБ дээр хийгдсэн нийт IPO ажиллагааны хүрээнд татан төвлөрүүлсэн дүнгийн 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> 30.1%-ийг</span>, 
                  FPO ажиллагааны татан төвлөрүүлсэн дүнгийн 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> 57.7%-ийг</span>, 
                  бондоор татан төвлөрүүлсэн дүнгийн 
                  <span className="font-semibold text-blue-600 dark:text-blue-400"> 77.5%-ийг</span> 
                  тус тус дангаараа гүйцэтгэсэн тэргүүлэх компани.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                    <button
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                        selectedType === 'underwriter'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      onClick={() => setSelectedType('underwriter')}
                    >
                      Андеррайтер
                    </button>
                    <button
                      className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                        selectedType === 'broker'
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                      onClick={() => setSelectedType('broker')}
                    >
                      Брокер
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedType === 'broker' &&
                    chartData.broker.map((item, idx) => (
                      <div key={idx} className="text-center">
                        <CircularProgress
                          value={item.value}
                          label={item.label}
                          sublabel={item.sublabel}
                          otherValue={item.otherValue}
                          bottomLabel={item.year}
                          variant="broker"
                        />
                      </div>
                    ))}

                  {selectedType === 'underwriter' &&
                    chartData.underwriter.map((item, idx) => {
                      const labels = ['IPO', 'FPO', 'Бонд']
                      return (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <CircularProgress
                            value={item.value}
                            label={item.otherValue.toString()}
                            sublabel={item.sublabel}
                            otherValue={item.otherValue}
                            bottomLabel=""
                            variant="underwriter"
                          />
                          <div className="text-left">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {item.value.toFixed(1)}%
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {labels[idx]}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.contact', 'Холбогдох')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Бидэнтэй холбогдож, санхүүгийн зөвлөгөө аваарай
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8 border border-blue-200 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('about.address', 'Хаяг')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                  {t('about.addressLine1', 'Улаанбаатар хот, Сүхбаатар дүүрэг')}<br />
                  {t('about.addressLine2', '1-р хороо, Чингисийн өргөн чөлөө 15')}
                </p>
                
                <div className="space-y-4">
                  <a 
                    href="tel:97675551919" 
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <Phone size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Утас</div>
                      <div className="text-sm">976-7555-1919</div>
                    </div>
                  </a>
                  
                  <a 
                    href="https://www.bdsec.mn" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                      <Globe size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium">Вэбсайт</div>
                      <div className="text-sm">www.bdsec.mn</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Сошиал хэрэгсэл
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Бидний сошиал хэрэгсэлээр дамжуулан хамгийн сүүлийн үеийн мэдээлэл авах боломжтой
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href="https://www.facebook.com/BDSecJSC" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all hover:scale-105 group"
                  >
                    <Facebook size={24} className="text-blue-600 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 dark:text-white">Facebook</span>
                  </a>
                  
                  <a 
                    href="https://www.youtube.com/@bdsecjsc9617" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all hover:scale-105 group"
                  >
                    <Youtube size={24} className="text-red-600 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 dark:text-white">YouTube</span>
                  </a>
                  
                  <a 
                    href="https://www.instagram.com/bdsec_jsc/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all hover:scale-105 group"
                  >
                    <Instagram size={24} className="text-pink-600 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 dark:text-white">Instagram</span>
                  </a>
                  
                  <a 
                    href="https://www.linkedin.com/company/bdsec-jsc/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all hover:scale-105 group"
                  >
                    <Linkedin size={24} className="text-blue-700 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-900 dark:text-white">LinkedIn</span>
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