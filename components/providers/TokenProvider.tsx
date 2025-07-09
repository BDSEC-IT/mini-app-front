'use client'

import { useEffect } from 'react'
import Cookies from 'js-cookie'

export default function TokenProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
} 