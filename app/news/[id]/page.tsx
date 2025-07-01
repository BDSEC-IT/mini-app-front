'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { fetchNews, NewsData } from '@/lib/api'
import { Calendar, Eye } from 'lucide-react'

export default function NewsDetailPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const [article, setArticle] = useState<NewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadArticle = async () => {
      try {
        setLoading(true)
        // Fetch all news and find the specific article
        // In a real app, you'd have a specific API endpoint for single articles
        const response = await fetchNews(1, 100)
        
        if (response.success) {
          const foundArticle = response.data.find(item => item.id === parseInt(params.id as string))
          if (foundArticle) {
            setArticle(foundArticle)
          } else {
            setError('Мэдээ олдсонгүй')
          }
        } else {
          setError('Мэдээ ачааллахад алдаа гарлаа')
        }
      } catch (err) {
        setError('Мэдээ ачааллахад алдаа гарлаа')
        console.error('Error loading article:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadArticle()
    }
  }, [params.id])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '-')
  }

  const formatContent = (html: string) => {
    // Basic HTML rendering - in production you might want to use a proper HTML parser
    return html
      .replace(/<p>/g, '<p class="mb-4">')
      .replace(/<a /g, '<a class="text-bdsec hover:underline" ')
      .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4">')
      .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4">')
      .replace(/<li>/g, '<li class="mb-2">')
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bdsec"></div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Article Title */}
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {article.mnTitle || 'Гарчиггүй мэдээ'}
          </h1>

          {/* Article Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>Published at: {formatDate(article.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{article.seenCount.toLocaleString()}</span>
            </div>
          </div>

          {/* Organization Logos */}
          {article.cover && (
            <div className="mb-6">
              <div className="flex justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
                {/* You can add specific logos here based on the article */}
                <div className="flex gap-4 items-center opacity-60">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">ХААН БАНК</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">BDSEC ҮЦК</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">BDO</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">PwC</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Article Image */}
          {article.cover && (
            <div className="mb-6">
              <img
                src={article.cover}
                alt={article.mnTitle || 'News image'}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Article Body */}
          {article.mnBody && (
            <div 
              className="prose prose-gray dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(article.mnBody) 
              }}
            />
          )}

          {/* If no Mongolian content, show as plain text */}
          {!article.mnBody && (
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>Энэ мэдээний дэлгэрэнгүй мэдээлэл байхгүй байна.</p>
            </div>
          )}
        </div>
      </div>
  )
} 