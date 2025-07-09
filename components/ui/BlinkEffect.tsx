'use client'

import { useEffect, useState, useRef } from 'react'

interface BlinkEffectProps {
  children: React.ReactNode
  value: number
  previousValue?: number
  className?: string
  duration?: number
}

export const BlinkEffect = ({ 
  children, 
  value, 
  previousValue, 
  className = '', 
  duration = 1000 
}: BlinkEffectProps) => {
  const [isBlinking, setIsBlinking] = useState(false)
  const [blinkColor, setBlinkColor] = useState<'green' | 'red' | null>(null)
  const previousValueRef = useRef<number | undefined>(previousValue)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Only trigger blink if we have a previous value to compare
    if (previousValueRef.current !== undefined && previousValueRef.current !== value) {
      const isIncrease = value > previousValueRef.current
      const isDecrease = value < previousValueRef.current
      
      if (isIncrease || isDecrease) {
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        // Set blink color
        setBlinkColor(isIncrease ? 'green' : 'red')
        setIsBlinking(true)
        
        // Clear blink after duration
        timeoutRef.current = setTimeout(() => {
          setIsBlinking(false)
          setBlinkColor(null)
        }, duration)
      }
    }
    
    // Update previous value
    previousValueRef.current = value
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, duration])

  const getBlinkClasses = () => {
    if (!isBlinking || !blinkColor) return ''
    
    const baseClasses = 'transition-all duration-150 ease-in-out'
    
    if (blinkColor === 'green') {
      return `${baseClasses} bg-green-200 dark:bg-green-800/50 border-green-300 dark:border-green-600`
    } else {
      return `${baseClasses} bg-red-200 dark:bg-red-800/50 border-red-300 dark:border-red-600`
    }
  }

  return (
    <div className={`${className} ${getBlinkClasses()}`}>
      {children}
    </div>
  )
} 