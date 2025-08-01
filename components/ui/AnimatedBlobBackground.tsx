import React from 'react'


const AnimatedBlobBackground = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    {/* Gradient overlay for depth */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-blue-50/20 dark:from-purple-900/10 dark:via-transparent dark:to-blue-900/10" />
    
    <svg width="100vw" height="100vh" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute w-full h-full">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Enhanced gradient definitions with much lower opacity */}
        <radialGradient id="gradient1" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.08"/>
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04"/>
        </radialGradient>
        <radialGradient id="gradient2" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.07"/>
          <stop offset="50%" stopColor="#6366f1" stopOpacity="0.05"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.03"/>
        </radialGradient>
        <radialGradient id="gradient3" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.06"/>
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.04"/>
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.02"/>
        </radialGradient>
        <radialGradient id="gradient4" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.05"/>
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.03"/>
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02"/>
        </radialGradient>
      </defs>
      
      {/* Large primary blob - more visible */}
      <g>
        <path
          d="M200,300 Q400,150 600,250 Q800,350 750,550 Q700,750 500,700 Q300,650 250,450 Q200,300 200,300Z"
          fill="url(#gradient1)"
          filter="url(#glow)"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 500 400" 
            to="360 500 400" 
            dur="25s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="d" 
            values="M200,300 Q400,150 600,250 Q800,350 750,550 Q700,750 500,700 Q300,650 250,450 Q200,300 200,300Z;
                    M250,350 Q450,200 650,300 Q850,400 800,600 Q750,800 550,750 Q350,700 300,500 Q250,350 250,350Z;
                    M200,300 Q400,150 600,250 Q800,350 750,550 Q700,750 500,700 Q300,650 250,450 Q200,300 200,300Z" 
            dur="15s" 
            repeatCount="indefinite" 
          />
        </path>
        
        {/* Medium secondary blob */}
        <path
          d="M700,150 Q850,100 900,250 Q950,400 850,450 Q750,500 700,350 Q650,200 700,150Z"
          fill="url(#gradient2)"
          filter="url(#glow)"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 800 300" 
            to="-360 800 300" 
            dur="35s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="d" 
            values="M700,150 Q850,100 900,250 Q950,400 850,450 Q750,500 700,350 Q650,200 700,150Z;
                    M720,170 Q870,120 920,270 Q970,420 870,470 Q770,520 720,370 Q670,220 720,170Z;
                    M700,150 Q850,100 900,250 Q950,400 850,450 Q750,500 700,350 Q650,200 700,150Z" 
            dur="18s" 
            repeatCount="indefinite" 
          />
        </path>
        
        {/* Large accent blob - bottom left */}
        <path
          d="M100,700 Q200,650 250,750 Q300,850 200,900 Q100,950 50,850 Q0,750 100,700Z"
          fill="url(#gradient3)"
          filter="url(#glow)"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 150 800" 
            to="360 150 800" 
            dur="20s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="d" 
            values="M100,700 Q200,650 250,750 Q300,850 200,900 Q100,950 50,850 Q0,750 100,700Z;
                    M120,720 Q220,670 270,770 Q320,870 220,920 Q120,970 70,870 Q20,770 120,720Z;
                    M100,700 Q200,650 250,750 Q300,850 200,900 Q100,950 50,850 Q0,750 100,700Z" 
            dur="22s" 
            repeatCount="indefinite" 
          />
        </path>
        
        {/* Floating accent blob - bottom right */}
        <path
          d="M800,700 Q900,650 950,750 Q1000,850 900,900 Q800,950 750,850 Q700,750 800,700Z"
          fill="url(#gradient4)"
          filter="url(#glow)"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 850 800" 
            to="-360 850 800" 
            dur="28s" 
            repeatCount="indefinite" 
          />
          <animate 
            attributeName="opacity" 
            values="0.18;0.3;0.18" 
            dur="12s" 
            repeatCount="indefinite" 
          />
        </path>
        
        {/* Additional center blob for more coverage */}
        <path
          d="M400,400 Q500,300 600,400 Q700,500 600,600 Q500,700 400,600 Q300,500 400,400Z"
          fill="url(#gradient1)"
          fillOpacity="0.15"
          filter="url(#glow)"
        >
          <animateTransform 
            attributeName="transform" 
            type="rotate" 
            from="0 500 500" 
            to="360 500 500" 
            dur="30s" 
            repeatCount="indefinite" 
          />
        </path>
        
      </g>
    </svg>
  </div>
)

export default AnimatedBlobBackground
