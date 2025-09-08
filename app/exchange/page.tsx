'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ExchangePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to orders page
    router.replace('/orders')
  }, [router])

  return null // Return null while redirecting
} 