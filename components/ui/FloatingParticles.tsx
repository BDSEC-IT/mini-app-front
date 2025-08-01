import React from 'react'

const FloatingParticles = () => (
  <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
    {/* Floating dots */}
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="absolute w-1 h-1 bg-indigo-400/20 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 20}s`,
          animationDuration: `${20 + Math.random() * 20}s`,
        }}
      >
        <div className="w-full h-full bg-indigo-400/20 rounded-full animate-ping" />
      </div>
    ))}
    
    {/* Subtle gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20" />
  </div>
)

export default FloatingParticles
