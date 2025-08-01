// shadcn/ui Card primitive
import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // More pronounced shadow, more rounded, subtle background
      "rounded-2xl border bg-white/95 dark:bg-gray-900/90 text-gray-900 dark:text-gray-50 shadow-2xl transition-shadow duration-200",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
