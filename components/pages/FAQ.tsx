'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { fetchFAQ, fetchFAQType } from '@/lib/api'


interface FAQType {
  id: number;
  mnName: string;
  enName: string;
}


interface CategoryType {
  id: number | 'all';
  mnName: string;
  enName: string;
}

interface FAQItem {
  id: number;
  type_id: number;
  mnQuestion: string;
  enQuestion: string | null;
  mnAnswer: string;
  enAnswer: string | null;
  FAQType: FAQType;
}
const FAQ = () => {
  console.log("FAQ");
  const { t, i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all')
  const [openItems, setOpenItems] = useState<number[]>([])
  const [faqTypes, setFaqTypes] = useState<FAQType[]>([])
  const [faqItems, setFaqItems] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const currentLanguage = i18n.language || 'mn'

  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [data, dataType] = await Promise.all([fetchFAQ(), fetchFAQType()]);

        if (data && Array.isArray(data)) {
          setFaqItems(data)
        } else {
          setFaqItems([])
        }
        console.log("data arrived,",data);

        if (dataType && Array.isArray(dataType)) {
          setFaqTypes(dataType)
        } else {
          setFaqTypes([])
        }
      } catch (err) {
        setError(t('common.errorOccurred'))
        setFaqItems([])
        setFaqTypes([])
      } finally {
        setLoading(false)
      }
    }
    fetchFAQData()
  }, [t])
  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(item => item !== index))
    } else {
      setOpenItems([...openItems, index])
    }
  }
  const filteredItems = faqItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      (currentLanguage === 'mn' ? 
        item.mnQuestion.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.mnAnswer.toLowerCase().includes(searchTerm.toLowerCase()) :
        (item.enQuestion?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.enAnswer?.toLowerCase().includes(searchTerm.toLowerCase()) || false))
      
    const matchesCategory = activeCategory === 'all' || item.type_id === activeCategory
    
    return matchesSearch && matchesCategory
  })
  const getCategories = () => {
    const allCategory = { id: 'all' as const, mnName: t('faq.all'), enName: t('faq.all') }
    return [allCategory, ...faqTypes] as CategoryType[]
  }

  const getQuestionText = (item: FAQItem) => {
    return currentLanguage === 'mn' || !item.enQuestion ? item.mnQuestion : item.enQuestion
  }

  const getAnswerText = (item: FAQItem) => {
    return currentLanguage === 'mn' || !item.enAnswer ? item.mnAnswer : item.enAnswer
  }

  // Function to format answer text with proper spacing
  const formatAnswerText = (text: string) => {
    // Replace multiple consecutive newlines with a single one
    return text
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map((paragraph, i) => (
        <p key={i} className={i > 0 ? 'mt-3' : ''}>
          {paragraph}
        </p>
      ))
  }

  const getCategoryName = (category: CategoryType) => {
    return currentLanguage === 'mn' ? category.mnName : category.enName
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bdsec dark:border-indigo-500 mx-auto"></div>
          <p className="mt-4">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <HelpCircle size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-bdsec dark:bg-indigo-500 text-white rounded-lg"
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t('faq.title')}</h1>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search size={20} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 w-full pl-12 pr-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 transition-all"
              placeholder={t('faq.search')}
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-base font-medium mb-3 text-gray-700 dark:text-gray-300">{t('faq.categories')}</h2>
          <div className="flex flex-wrap gap-3">
            {getCategories().map(category => (
              <button
                key={category.id.toString()}
                className={`px-4 py-2 text-sm rounded-full transition-colors ${
                  activeCategory === category.id
                    ? 'bg-bdsec dark:bg-indigo-500 text-white font-medium'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
        
        {/* FAQ Items */}
        <div className="space-y-6">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div 
                key={item.id} 
                className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  className="flex justify-between items-center w-full p-5 text-left"
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="font-medium text-base">{getQuestionText(item)}</span>
                  {openItems.includes(item.id) ? (
                    <ChevronUp size={20} className="text-gray-500 flex-shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500 flex-shrink-0 ml-2" />
                  )}
                </button>
                {openItems.includes(item.id) && (
                  <div className="p-5 pt-0 text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700">
                    <div className="mt-3 leading-relaxed">
                      {formatAnswerText(getAnswerText(item))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              {t('faq.noResults')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FAQ 