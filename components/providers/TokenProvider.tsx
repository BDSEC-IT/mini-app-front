'use client'

import { useEffect } from 'react'
import Cookies from 'js-cookie'

export default function TokenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up demo token for testing only if no other token exists
    const existingToken = Cookies.get('token');
    if (!existingToken) {
      const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsInJvbGUiOiJVU0VSIiwidXNlcm5hbWUiOiJkaWdpcGF5IiwiaWF0IjoxNzUxOTM1Nzg5fQ.dWyKtgkHQC6pqeRaH2c7B7OY6GjhH6b29LpZ4C4oN-Y"
      Cookies.set('token', demoToken, { expires: 7 });
      console.log('Demo JWT token set for testing');
    }
  }, [])

  return <>{children}</>
} 