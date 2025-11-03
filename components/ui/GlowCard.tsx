'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { ReactNode } from 'react'

interface GlowCardProps {
  children: ReactNode
  glowColor?: 'green' | 'red' | 'blue' | 'neutral'
  className?: string
  onClick?: () => void
  intensity?: 'low' | 'medium' | 'high'
}

export const GlowCard = ({ 
  children, 
  glowColor = 'blue', 
  className = '', 
  onClick,
  intensity = 'medium'
}: GlowCardProps) => {
  const { theme } = useTheme()
  
  // Only show glow effects in dark mode
  const showGlow = theme === 'dark'
  
  // Get glow colors based on the selected color
  const getGlowColors = () => {
    switch (glowColor) {
      case 'green':
        return {
          primary: '#10b981', // emerald-500
          secondary: '#059669', // emerald-600
          border: '#6ee7b7' // emerald-300
        }
      case 'red':
        return {
          primary: '#ef4444', // red-500
          secondary: '#dc2626', // red-600
          border: '#fca5a5' // red-300
        }
      case 'blue':
        return {
          primary: '#6366f1', // indigo-500
          secondary: '#4f46e5', // indigo-600
          border: '#a5b4fc' // indigo-300
        }
      case 'neutral':
      default:
        return {
          primary: '#6b7280', // gray-500
          secondary: '#4b5563', // gray-600
          border: '#d1d5db' // gray-300
        }
    }
  }

  const colors = getGlowColors()
  
  // Get opacity based on intensity
  const getOpacity = () => {
    switch (intensity) {
      case 'low': return 0.3
      case 'high': return 0.9
      case 'medium':
      default: return 0.6
    }
  }

  const opacity = getOpacity()

  return (
    <div 
      className={`relative overflow-hidden transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* SVG Glow Effect - Only in dark mode */}
      {showGlow && (
        <svg
          className="absolute -top-1/4 -left-1/4 transform -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none z-0 transition-opacity duration-300 group-hover:opacity-100"
          width="200%"
          height="200%"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity }}
        >
          <path
            fill={colors.primary}
            d="M50,-60C60,-40,70,-30,80,-10C90,10,80,30,60,50C40,70,20,90,-10,100C-40,110,-70,110,-90,90C-110,70,-110,40,-100,10C-90,-20,-60,-50,-40,-70C-20,-90,10,-110,30,-100C50,-90,50,-80,50,-60Z"
            transform="translate(100 100)"
          />
        </svg>
      )}
      
      {/* Border Glow - Only in dark mode */}
      {showGlow && (
        <div 
          className="absolute inset-0 rounded-xl opacity-50 pointer-events-none z-0"
          style={{
            background: `linear-gradient(135deg, ${colors.border}20, transparent 50%, ${colors.secondary}10)`,
            border: `1px solid ${colors.border}40`
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}