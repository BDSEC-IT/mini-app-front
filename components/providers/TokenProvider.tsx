'use client'

import { useEffect } from 'react'
import Cookies from 'js-cookie'

export default function TokenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up demo token for testing only if no other token exists
    const existingToken = Cookies.get('token');
    if (!existingToken) {
      const demoToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTE0NDg4MjN9.CP4XJIAlErOi8fwrQ-vmBA4XT_wzdvIXw2lZ1wFbBII"
      Cookies.set('jwt', demoToken, { expires: 7 });
      console.log('Demo JWT token set for testing');
    }
  }, [])

  return <>{children}</>
} 