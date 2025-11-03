import React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'subtle' | 'strong'
  hover?: boolean
}

const GlassCard = ({ 
  children, 
  className, 
  variant = 'default',
  hover = true 
}: GlassCardProps) => {
  const baseClasses = "rounded-2xl border backdrop-blur-xl transition-all duration-300"
  
  const variants = {
    default: "bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-gray-700/30 shadow-2xl",
    subtle: "bg-white/20 dark:bg-gray-900/20 border-white/10 dark:border-gray-700/20 shadow-xl",
    strong: "bg-white/40 dark:bg-gray-900/40 border-white/30 dark:border-gray-700/40 shadow-3xl"
  }
  
  const hoverClasses = hover 
    ? "hover:bg-white/40 dark:hover:bg-gray-900/40 hover:shadow-3xl hover:scale-[1.01]" 
    : ""

  return (
    <div className={cn(
      baseClasses,
      variants[variant],
      hoverClasses,
      className
    )}>
      {children}
    </div>
  )
}

export default GlassCard
