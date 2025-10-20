"use client";

import { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function InfoTooltip({ 
  content, 
  position = 'bottom',
  iconSize = 'md',
  className = ''
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update tooltip position when position prop changes
  useEffect(() => {
    setTooltipPosition(position);
  }, [position]);

  // Icon sizes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Calculate position before showing tooltip to prevent shifting
  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const button = buttonRef.current;
      const buttonRect = button.getBoundingClientRect();
      
      // Calculate where tooltip would be positioned
      let newPosition = position;
      
      // Check horizontal overflow for bottom/top positions
      if (position === 'bottom' || position === 'top') {
        const tooltipWidth = 200; // Approximate tooltip width
        const tooltipLeft = buttonRect.left + (buttonRect.width / 2) - (tooltipWidth / 2);
        
        if (tooltipLeft < 0) {
          newPosition = 'right';
        } else if (tooltipLeft + tooltipWidth > window.innerWidth) {
          newPosition = 'left';
        }
      }
      
      // Check vertical overflow for left/right positions
      if (position === 'left' || position === 'right') {
        const tooltipHeight = 100; // Approximate tooltip height
        const tooltipTop = buttonRect.top + (buttonRect.height / 2) - (tooltipHeight / 2);
        
        if (tooltipTop < 0) {
          newPosition = 'bottom';
        } else if (tooltipTop + tooltipHeight > window.innerHeight) {
          newPosition = 'top';
        }
      }
      
      setTooltipPosition(newPosition);
    }
  }, [isVisible, position]);

  // Position classes
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  // Arrow classes
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900 dark:border-b-gray-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900 dark:border-l-gray-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900 dark:border-r-gray-700'
  };

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
        aria-label="Information"
      >
        <Info className={iconSizes[iconSize]} />
      </button>

      {isVisible && (
        <>
          {/* Backdrop for mobile - close on click */}
          <div 
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsVisible(false)}
          />
          
          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className={`
              absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg
              max-w-xs sm:max-w-sm md:max-w-md whitespace-normal
              animate-in fade-in zoom-in-95 duration-200
              ${positionClasses[tooltipPosition]}
            `}
            style={{ minWidth: '200px' }}
          >
            {content}
            
            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 border-4 ${arrowClasses[tooltipPosition]}`}
            />
          </div>
        </>
      )}
    </div>
  );
}
