'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

// Define the FAQ API base URL - using Next.js proxy to avoid CORS issues
const FAQ_API_BASE_URL = '/api/faq'

// Sample data as fallback
const SAMPLE_FAQ_TYPES = [
  {
    "id": 1,
    "mnName": "Хувьцаа",
    "enName": "Stock",
    "createdAt": null,
    "updatedAt": null
  },
  {
    "id": 2,
    "mnName": "Бонд ",
    "enName": "Bond",
    "createdAt": null,
    "updatedAt": null
  },
  {
    "id": 3,
    "mnName": "Арилжаанд оролцох",
    "enName": "Trading",
    "createdAt": null,
    "updatedAt": null
  },
  {
    "id": 4,
    "mnName": "Данс нээх",
    "enName": "Opening account",
    "createdAt": null,
    "updatedAt": null
  },
  {
    "id": 5,
    "mnName": "1072 хувьцаа",
    "enName": "1072 stock",
    "createdAt": null,
    "updatedAt": null
  }
];

// Sample FAQ items as fallback (first 5 items from the provided data)
const SAMPLE_FAQ_ITEMS = [
  {
    "id": 1,
    "type_id": 1,
    "mnQuestion": "Хувьцаа гэж юу вэ?",
    "enQuestion": null,
    "mnAnswer": "Хувьцаа гэдэг нь хувь хүн, хуулийн этгээд тодорхой нэг компанид хөрөнгө оруулалт хийснийг баталгаажуулсан үнэт цаас юм. Хувьцаа эзэмшигч нь тухайн компанийн ашиг орлогоос ногдол ашиг авах, мөн хөрөнгийн зах зээл дээр хувьцаагаа арилжих замаар ханшийн зөрүүнээс ашиг олох боломжтой. Түүнчлэн компани татан буугдсан тохиолдолд хуульд заасан журмын дагуу үлдсэн эд хөрөнгийг борлуулсан орлогоос тодорхой хувийг хүртэх эрхтэй байдаг.",
    "enAnswer": null,
    "createdAt": null,
    "updatedAt": null,
    "FAQType": {
      "id": 1,
      "mnName": "Хувьцаа",
      "enName": "Stock"
    }
  },
  {
    "id": 2,
    "type_id": 1,
    "mnQuestion": "Хувьцааны ханшийг хэрхэн харах вэ ?",
    "enQuestion": null,
    "mnAnswer": "Та BDSec апп-ын нүүр хуудас болон Монголын хөрөнгийн биржийн mse.mn вэб сайтаас компанийн хувьцаа бүрийн ханшийн мэдээллийг хугацааны үечлэлээр харах боломжтой.",
    "enAnswer": null,
    "createdAt": null,
    "updatedAt": null,
    "FAQType": {
      "id": 1,
      "mnName": "Хувьцаа",
      "enName": "Stock"
    }
  },
  {
    "id": 7,
    "type_id": 2,
    "mnQuestion": "Бонд гэж юу вэ?",
    "enQuestion": null,
    "mnAnswer": "Бонд гэдэг нь тогтмол орлоготой, эрсдэл багатай үнэт цаас юм. Компанийн болон засгийн газрын бондод хөрөнгө оруулж байгаа нь тухайн компани болон засгийн газарт мөнгө зээлж байна гэсэн ба тодорхой хугацааны дараа үндсэн мөнгө болон хүүг эргэн төлөлтийн хуваарийн дагуу буцаан авдаг.",
    "enAnswer": null,
    "createdAt": null,
    "updatedAt": null,
    "FAQType": {
      "id": 2,
      "mnName": "Бонд ",
      "enName": "Bond"
    }
  },
  {
    "id": 9,
    "type_id": 3,
    "mnQuestion": "Хэрхэн арилжаанд орж захиалга өгөх вэ?",
    "enQuestion": null,
    "mnAnswer": "Та үнэт цаасны арилжаанд оролцохын тулд заавал үнэт цаасны данстай байх шаардлагатай бөгөөд хэрэв та данстай бол \"Арилжаа\" цэс рүү хандаж, тухайн хувьцааг авах эсвэл зарах захиалга өгөх боломжтой",
    "enAnswer": null,
    "createdAt": null,
    "updatedAt": null,
    "FAQType": {
      "id": 3,
      "mnName": "Арилжаанд оролцох",
      "enName": "Trading"
    }
  },
  {
    "id": 14,
    "type_id": 4,
    "mnQuestion": "Хэрхэн онлайн данс нээх вэ ?",
    "enQuestion": null,
    "mnAnswer": "Онлайнаар данс нээх : Хэрэв та үнэт цаасны дансгүй бол BDSec апп руу нэвтрэх үед танд Нүүр цэсний дээд талд \"Данс нээх\" харагдах бөгөөд та шаардлагатай мэдээллийг бүрэн бөглөж, дансны хураамж төлснөөр данс нээгдэнэ.",
    "enAnswer": null,
    "createdAt": null,
    "updatedAt": null,
    "FAQType": {
      "id": 4,
      "mnName": "Данс нээх",
      "enName": "Opening account"
    }
  }
];

interface FAQType {
  id: number;
  mnName: string;
  enName: string;
}

// Custom type for our categories including the "all" option
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
      setLoading(true)
      setError(null)
      
      try {
        // Fetch FAQ types using the proxy
        const typesResponse = await fetch(`${FAQ_API_BASE_URL}/types`)
        
        if (!typesResponse.ok) {
          console.error('FAQ Types API error:', typesResponse.status, typesResponse.statusText)
          throw new Error(`Failed to fetch FAQ categories: ${typesResponse.status} ${typesResponse.statusText}`)
        }
        
        const typesData = await typesResponse.json()
        
        // Fetch FAQ items using the proxy
        const itemsResponse = await fetch(`${FAQ_API_BASE_URL}`)
        
        if (!itemsResponse.ok) {
          console.error('FAQ Items API error:', itemsResponse.status, itemsResponse.statusText)
          throw new Error(`Failed to fetch FAQ items: ${itemsResponse.status} ${itemsResponse.statusText}`)
        }
        
        const itemsData = await itemsResponse.json()
        
        // Check if we have valid data
        if (!typesData.data || !Array.isArray(typesData.data)) {
          console.error('Invalid FAQ types data format:', typesData)
          throw new Error('Invalid FAQ types data format')
        }
        
        if (!itemsData.data || !Array.isArray(itemsData.data)) {
          console.error('Invalid FAQ items data format:', itemsData)
          throw new Error('Invalid FAQ items data format')
        }
        
        setFaqTypes(typesData.data)
        setFaqItems(itemsData.data)
      } catch (err) {
        console.error('Error fetching FAQ data:', err)
        // Use sample data as fallback
        setFaqTypes(SAMPLE_FAQ_TYPES)
        setFaqItems(SAMPLE_FAQ_ITEMS)
        setError(null) // Clear error since we're using fallback data
      } finally {
        setLoading(false)
      }
    }
    
    fetchFAQData()
  }, [])
  
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
              <Search size={16} className="text-gray-600 dark:text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 w-full pl-12 pr-4 py-3 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500 transition-all text-gray-900 dark:text-gray-100 h-12"
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