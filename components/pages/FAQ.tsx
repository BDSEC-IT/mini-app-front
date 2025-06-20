'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const FAQ = () => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [openItems, setOpenItems] = useState<number[]>([])
  const [expandedItem, setExpandedItem] = useState<number | null>(0)
  
  // Sample FAQ data
  const faqItems: FAQItem[] = [
    {
      question: 'How do I open an account?',
      answer: 'To open an account, please visit our office with your ID card and fill out the account opening form. You can also start the process online through our website.',
      category: 'account'
    },
    {
      question: 'What are the trading hours?',
      answer: 'Trading hours are from Monday to Friday, 10:00 AM to 1:00 PM local time.',
      category: 'trading'
    },
    {
      question: 'How do I place an order?',
      answer: 'You can place orders through our mobile app, website, or by calling our broker desk during trading hours.',
      category: 'trading'
    },
    {
      question: 'What are the fees for trading?',
      answer: 'Our standard commission is 0.2% of the trade value. There may be additional fees for specific services.',
      category: 'fees'
    },
    {
      question: 'How do I withdraw funds?',
      answer: 'You can request a withdrawal through our app or website. Funds are typically processed within 1-2 business days.',
      category: 'account'
    }
  ]
  
  const categories = [
    { id: 'all', label: t('faq.all') },
    { id: 'account', label: t('faq.account') },
    { id: 'trading', label: t('faq.trading') },
    { id: 'fees', label: t('faq.fees') }
  ]
  
  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(item => item !== index))
    } else {
      setOpenItems([...openItems, index])
    }
  }
  
  const filteredItems = faqItems.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  const helpOptions = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Шууд харилцах',
      action: 'Эхлэх'
    },
    {
      icon: Phone,
      title: 'Утасаар',
      description: '70505050',
      action: 'Залгах'
    },
    {
      icon: Mail,
      title: 'И-мэйл',
      description: 'info@bdsec.mn',
      action: 'Илгээх'
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen pb-24">
      <div className="px-4 py-6">
        <h1 className="text-xl font-bold mb-4">{t('faq.title')}</h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none"
              placeholder={t('faq.search')}
            />
          </div>
        </div>
        
        {/* Categories */}
        <div className="mb-6">
          <h2 className="text-sm font-medium mb-2 text-gray-500">{t('faq.categories')}</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                className={`px-3 py-1 text-sm rounded-full ${
                  activeCategory === category.id
                    ? 'bg-bdsec text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div 
                key={index} 
                className="border dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  className="flex justify-between items-center w-full p-4 text-left"
                  onClick={() => toggleItem(index)}
                >
                  <span className="font-medium">{item.question}</span>
                  {openItems.includes(index) ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </button>
                {openItems.includes(index) && (
                  <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700">
                    {item.answer}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t('faq.noResults')}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-primary mb-4 text-center">Тусламж хэрэгтэй үү?</h3>
        
        <div className="space-y-4">
          {helpOptions.map((option, index) => {
            const IconComponent = option.icon
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{option.title}</div>
                    <div className="text-sm text-secondary">{option.description}</div>
                  </div>
                </div>
                <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors">
                  {option.action}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <h4 className="font-bold text-primary mb-2">Асуулт байвал</h4>
        <p className="text-sm text-secondary mb-4">
          Манай тусламжийн багтай холбогдож өөрт тохирсон үйлчилгээг сонгоорой
        </p>
        <button className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors">
          Холбогдох
        </button>
      </div>
    </div>
  )
}

export default FAQ 