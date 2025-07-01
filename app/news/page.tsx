'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { fetchNews, NewsData } from '@/lib/api'
import { Search } from 'lucide-react'

export default function NewsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [news, setNews] = useState<NewsData[]>([])
  const [filteredNews, setFilteredNews] = useState<NewsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'new' | 'old'>('new')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadNews = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true)
      const response = await fetchNews(pageNum, 50)
      
      if (response.success) {
        if (append) {
          setNews(prev => [...prev, ...response.data])
        } else {
          setNews(response.data)
        }
        setHasMore(response.data.length === 50)
      } else {
        setError('Failed to load news')
      }
    } catch (err) {
      setError('Failed to load news')
      console.error('Error loading news:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNews()
  }, [])

  // Filter and search news
  useEffect(() => {
    let filtered = [...news]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.mnTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.mnBody?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply date filter
    if (activeFilter === 'new') {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    } else {
      filtered.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime())
    }
    
    setFilteredNews(filtered)
  }, [news, searchTerm, activeFilter])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadNews(nextPage, true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInHours < 24) {
      return `${diffInHours} цагийн өмнө`
    } else if (diffInDays === 1) {
      return '1 хоногийн өмнө'
    } else if (diffInDays < 7) {
      return `${diffInDays} хоногийн өмнө`
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '.')
    }
  }

  const handleNewsClick = (newsId: number) => {
    router.push(`/news/${newsId}`)
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('new')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'new'
                  ? 'bg-bdsec text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Шинэ
            </button>
            <button
              onClick={() => setActiveFilter('old')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === 'old'
                  ? 'bg-bdsec text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Хуучин
            </button>
            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-bdsec focus:bg-white dark:focus:bg-gray-600 transition-colors text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mx-4 mt-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* News List */}
        <div className="px-4 py-2">
          {filteredNews.map((article) => (
            <div
              key={article.id}
              onClick={() => handleNewsClick(article.id)}
              className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
            >
              {/* Thumbnail */}
              {article.cover && (
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={article.cover}
                    alt={article.mnTitle || 'News image'}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {article.mnTitle || 'Гарчиггүй мэдээ'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(article.publishedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {loading && filteredNews.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec"></div>
          </div>
        )}

        {/* Load more button */}
        {hasMore && filteredNews.length > 0 && !searchTerm && (
          <div className="flex justify-center p-4">
            <button
              onClick={loadMore}
              disabled={loading}
              className="bg-bdsec hover:bg-bdsec/90 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ачааллаж байна...
                </>
              ) : (
                'Цааш үзэх'
              )}
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredNews.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Мэдээ олдсонгүй'}
            </p>
          </div>
        )}
      </div>
  )
} 