'use client'

import { useEffect } from 'react'
import Cookies from 'js-cookie'

export default function TokenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up demo token for testing if no token exists
    const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTEyNTMyODB9.1wffOlt_HaHYFXPj2w_LlLYsKC2hcewAXgCoW0ZD-0g"
    
    if (!Cookies.get('jwt') && !Cookies.get('auth_token') && !Cookies.get('token')) {
      Cookies.set('jwt', demoToken, { expires: 7 })
      console.log('Demo JWT token set for testing')
    }
  }, [])

  return <>{children}</>
} 