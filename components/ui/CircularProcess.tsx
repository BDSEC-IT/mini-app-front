type Props = {
  value: number
  label?: string
  sublabel: string
  bottomLabel?: string
  otherValue: number
  otherLabel?: string
  variant: 'underwriter' | 'broker'
}

export default function CircularProgress({
  value,
  label,
  sublabel,
  bottomLabel,
  otherValue,
  otherLabel,
  variant,
}: Props) {
  const radius = 45
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius
  const strokeDashoffset = circumference - (value / 100) * circumference

  // Color scheme based on variant and progress value
  const getProgressColor = () => {
    if (variant === 'underwriter') {
      // Different colors for different performance levels
      if (value >= 70) return 'url(#gradient-high)' // Green gradient for high performance
      if (value >= 40) return 'url(#gradient-medium)' // Blue gradient for medium performance
      return 'url(#gradient-low)' // Orange gradient for lower performance
    } else {
      // Broker variant - use brand colors
      return 'url(#gradient-brand)'
    }
  }

  const getGlowEffect = () => {
    if (variant === 'underwriter') {
      if (value >= 70) return '#10b981' // green
      if (value >= 40) return '#3b82f6' // blue
      return '#f59e0b' // orange
    }
    return '#1C1C4A' // brand color
  }

  return (
    <div className="flex flex-col items-center text-xs">
      {/* Underwriter: Enhanced design with gradients */}
      {variant === 'underwriter' && (
        <div className="flex items-center space-x-2 mb-1">
          <div className="relative">
            <svg height="100" width="100" className="drop-shadow-lg">
              <defs>
                {/* Gradient definitions */}
                <linearGradient id="gradient-high" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="gradient-medium" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="gradient-low" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                
                {/* Glow effect filter */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background circle with subtle gradient */}
              <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="50"
                cy="50"
                className="dark:stroke-gray-600"
              />
              
              {/* Progress circle with gradient and glow */}
              <circle
                stroke={getProgressColor()}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ 
                  strokeDashoffset,
                  filter: 'url(#glow)',
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="50"
                cy="50"
                transform="rotate(-90 50 50)"
              />
              
              {/* Center content with better styling */}
              <text
                x="50"
                y="48"
                textAnchor="middle"
                fill="currentColor"
                fontSize="16"
                fontWeight="bold"
                className="text-gray-900 dark:text-white"
              >
                {otherValue}
              </text>
              <text
                x="50"
                y="62"
                textAnchor="middle"
                fill="currentColor"
                fontSize="9"
                className="text-gray-600 dark:text-gray-400"
              >
                {sublabel}
              </text>
            </svg>
            
            {/* Animated pulse effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-20 animate-ping"
              style={{ 
                background: `radial-gradient(circle, ${getGlowEffect()}20 0%, transparent 70%)`,
                animationDuration: '3s'
              }}
            />
          </div>
        </div>
      )}

      {/* Broker: Enhanced design */}
      {variant === 'broker' && (
        <div className="flex items-center space-x-2 ">
          <div className="relative">
            <svg height="100" width="100" className="drop-shadow-lg">
              <defs>
                {/* Brand gradient */}
                <linearGradient id="gradient-brand" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1C1C4A" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                
                {/* Dark mode gradient */}
                <linearGradient id="gradient-brand-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                
                {/* Glow effect */}
                <filter id="glow-broker">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Background circle */}
              <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx="50"
                cy="50"
                className="dark:stroke-gray-600"
              />
              
              {/* Progress circle */}
              <circle
                stroke="url(#gradient-brand)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{ 
                  strokeDashoffset,
                  filter: 'url(#glow-broker)',
                  transition: 'stroke-dashoffset 1s ease-in-out'
                }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx="50"
                cy="50"
                transform="rotate(-90 50 50)"
                className="dark:stroke-[url(#gradient-brand-dark)]"
              />
              
              {/* Center text */}
              <text
                x="50"
                y="48"
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="bold"
                className="text-gray-900 dark:text-white"
              >
                {otherValue}
              </text>
              <text
                x="50"
                y="60"
                textAnchor="middle"
                fill="currentColor"
                fontSize="8"
                className="text-gray-600 dark:text-gray-400"
              >
                {otherLabel}
              </text>
            </svg>
            
            {/* Subtle animation effect */}
            <div 
              className="absolute inset-0 rounded-full opacity-10 animate-pulse"
              style={{ 
                background: `radial-gradient(circle, #1C1C4A20 0%, transparent 70%)`,
                animationDuration: '2s'
              }}
            />
          </div>
           <div className="text-left mb-2">
            <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {bottomLabel}:
            </span>
            <p className="text-bdsec dark:text-indigo-400 text-xl font-bold leading-tight">
              {label}
            </p>
            <span className="block text-xs font-medium text-gray-600 dark:text-gray-400">
              {sublabel}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
