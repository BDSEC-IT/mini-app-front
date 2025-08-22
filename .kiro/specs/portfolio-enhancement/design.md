# Design Document

## Overview

The portfolio enhancement will transform the current simple portfolio page into a visually engaging and informative dashboard. The design incorporates interactive pie charts for data visualization and implements the glowing card aesthetic from the main dashboard, creating a cohesive user experience across the application.

## Architecture

### Component Structure
```
Portfolio.tsx (Enhanced)
├── PortfolioHeader (existing, enhanced)
├── PortfolioSummaryCards (enhanced with glow effects)
├── PortfolioCharts (new component)
│   ├── AssetAllocationChart
│   └── ProfitLossChart
├── CashBalanceCard (enhanced)
└── StockHoldingsSection (enhanced)
```

### Chart Library Integration
- **Library**: Chart.js with react-chartjs-2 for pie charts
- **Fallback**: If Chart.js is not available, implement custom SVG-based pie charts
- **Responsive**: Charts adapt to container size and device orientation

## Components and Interfaces

### 1. PortfolioCharts Component

```typescript
interface ChartData {
  labels: string[]
  datasets: {
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

interface PortfolioChartsProps {
  assetBalances: AssetBalance[]
  yieldAnalysis: YieldAnalysis[]
  showBalance: boolean
  theme: 'light' | 'dark'
}
```

**Features:**
- Asset allocation pie chart showing distribution by stock symbol
- Profit/loss pie chart showing gains vs losses
- Interactive tooltips with detailed information
- Responsive design for mobile and desktop
- Privacy mode support (blur values when showBalance is false)

### 2. Enhanced Card Components

```typescript
interface GlowCardProps {
  children: React.ReactNode
  glowColor?: 'green' | 'red' | 'blue' | 'neutral'
  className?: string
  onClick?: () => void
}
```

**Glow Effect Implementation:**
- CSS-based glow using box-shadow and pseudo-elements
- SVG blob shapes for organic glow patterns (similar to StockList)
- Conditional rendering based on theme (dark mode only)
- Smooth transitions on hover and state changes

### 3. Layout Enhancements

**Grid System:**
- 2-column grid for summary cards on mobile
- 3-column grid for summary cards on tablet+
- Full-width sections for charts and detailed views
- Consistent spacing using Tailwind's spacing scale

**Animation System:**
- Intersection Observer for scroll-triggered animations
- Staggered entrance animations for cards
- Smooth transitions for data updates
- Loading states with skeleton components

## Data Models

### Chart Data Processing

```typescript
interface ProcessedChartData {
  assetAllocation: {
    labels: string[]
    values: number[]
    colors: string[]
  }
  profitLoss: {
    profitable: number
    unprofitable: number
    neutral: number
  }
}

const processPortfolioData = (
  assetBalances: AssetBalance[],
  yieldAnalysis: YieldAnalysis[]
): ProcessedChartData => {
  // Process asset allocation
  const assetAllocation = yieldAnalysis.map(asset => ({
    label: asset.symbol,
    value: asset.totalNow,
    color: generateColorForAsset(asset.symbol)
  }))

  // Process profit/loss distribution
  const profitLoss = yieldAnalysis.reduce((acc, asset) => {
    if (asset.profit > 0) acc.profitable += asset.profit
    else if (asset.profit < 0) acc.unprofitable += Math.abs(asset.profit)
    else acc.neutral += asset.totalNow
    return acc
  }, { profitable: 0, unprofitable: 0, neutral: 0 })

  return { assetAllocation, profitLoss }
}
```

### Color Scheme

**Light Mode:**
- Primary: #1e40af (blue-700)
- Success: #059669 (emerald-600)
- Danger: #dc2626 (red-600)
- Neutral: #6b7280 (gray-500)

**Dark Mode:**
- Primary: #6366f1 (indigo-500)
- Success: #10b981 (emerald-500)
- Danger: #ef4444 (red-500)
- Neutral: #9ca3af (gray-400)

## Error Handling

### Chart Rendering Errors
- Graceful fallback to text-based summaries if charts fail to render
- Error boundaries around chart components
- Loading states during data processing
- Empty state handling for no data scenarios

### Data Validation
- Validate numerical data before chart rendering
- Handle null/undefined values in portfolio data
- Sanitize user input for chart interactions
- Prevent division by zero in percentage calculations

## Testing Strategy

### Unit Tests
- Chart data processing functions
- Color generation utilities
- Responsive behavior helpers
- Privacy mode toggle functionality

### Integration Tests
- Portfolio data flow from API to charts
- Theme switching with glow effects
- Mobile responsiveness
- Chart interactions and tooltips

### Visual Tests
- Screenshot comparisons for glow effects
- Chart rendering across different data sets
- Animation timing and smoothness
- Cross-browser compatibility

### Accessibility Tests
- Screen reader compatibility for charts
- Keyboard navigation for interactive elements
- Color contrast ratios for all themes
- Focus management and ARIA labels

## Performance Considerations

### Chart Optimization
- Lazy loading of chart library
- Memoization of processed chart data
- Debounced resize handlers
- Efficient re-rendering on data updates

### Animation Performance
- CSS transforms over layout changes
- RequestAnimationFrame for smooth animations
- Reduced motion support for accessibility
- GPU acceleration for glow effects

### Bundle Size
- Tree-shaking for chart library
- Code splitting for chart components
- Optimized SVG assets
- Compressed animation assets

## Implementation Notes

### Glow Effect Technical Details
The glow effect will be implemented using a combination of:
1. CSS box-shadow for subtle outer glow
2. SVG blob shapes with blur filters for organic patterns
3. Pseudo-elements for layered glow effects
4. CSS custom properties for dynamic color theming

### Chart Responsiveness
Charts will use a responsive container pattern:
1. Container queries for optimal sizing
2. Aspect ratio maintenance across devices
3. Dynamic font scaling based on container size
4. Touch-friendly interaction areas on mobile

### Privacy Mode Integration
When balance visibility is toggled off:
1. Chart segments show as uniform gray
2. Tooltips display "***" instead of values
3. Smooth transitions between states
4. Consistent behavior across all components