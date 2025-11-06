/**
 * BDSEC Mini App - Unified Design System
 * 
 * This file contains all standardized design tokens for the application.
 * Use these constants throughout the app for consistent UI/UX.
 * 
 * Generated: 2025-11-06
 * Status: Comprehensive Design System v1.0
 */

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const TYPOGRAPHY = {
  // Display & Hero Sizes
  hero: 'text-3xl font-bold',              // 24px - Stock prices, hero numbers
  heroPrice: 'text-2xl font-bold',         // 20px - Featured stock prices
  
  // Page & Section Headings
  pageTitle: 'text-2xl font-bold',         // 20px - Main page titles
  sectionTitle: 'text-xl font-semibold',   // 18px - Section headers
  cardTitle: 'text-lg font-semibold',      // 16px - Card headers
  subheading: 'text-base font-medium',     // 14px - Subheadings
  
  // Body Text
  bodyLarge: 'text-base font-normal',      // 14px - Large body text
  body: 'text-sm font-normal',             // 12px - Standard body text
  bodySmall: 'text-xs font-normal',        // 10px - Small body text, captions
  
  // UI Element Typography
  buttonPrimary: 'text-sm font-bold',      // 12px - Primary action buttons
  buttonSecondary: 'text-sm font-medium',  // 12px - Secondary buttons
  buttonCompact: 'text-xs font-medium',    // 10px - Small buttons
  
  label: 'text-sm font-medium',            // 12px - Form labels, data labels
  labelSmall: 'text-xs font-medium',       // 10px - Compact labels
  
  badge: 'text-xs font-semibold',          // 10px - Badges, status indicators
  caption: 'text-xs font-normal',          // 10px - Metadata, timestamps
  
  // Special Cases
  navLabel: 'text-[10px] font-normal',     // 10px - Bottom navigation labels
  compactData: 'text-[10px] font-medium',  // 10px - Dense data tables
  stockPrice: 'text-sm font-semibold',     // 12px - Stock card prices
} as const;

// ============================================================================
// TEXT COLORS
// ============================================================================

export const TEXT_COLORS = {
  // Primary Text
  primary: 'text-gray-900 dark:text-white',
  secondary: 'text-gray-600 dark:text-gray-300',
  muted: 'text-gray-500 dark:text-gray-400',
  disabled: 'text-gray-400 dark:text-gray-500',
  
  // Brand & Interactive
  brand: 'text-bdsec dark:text-indigo-400',
  brandStrong: 'text-bdsec dark:text-indigo-500',
  link: 'text-blue-600 dark:text-blue-400',
  linkHover: 'hover:text-blue-700 dark:hover:text-blue-300',
  
  // Semantic Colors
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
  
  // Stock Market Specific
  priceUp: 'text-green-500',
  priceDown: 'text-red-500',
  priceUnchanged: 'text-gray-600 dark:text-gray-400',
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const SPACING = {
  // Padding - General
  compact: 'p-2',          // 8px - Very tight spacing
  small: 'p-3',            // 12px - Stock cards, compact cards
  standard: 'p-4',         // 16px - Standard cards, containers
  large: 'p-6',            // 24px - Large cards, modals
  
  // Padding - Vertical
  vCompact: 'py-1',        // 4px - Very tight vertical
  vSmall: 'py-2',          // 8px - Standard buttons, list items
  vStandard: 'py-3',       // 12px - Standard spacing
  vLarge: 'py-4',          // 16px - Large spacing
  
  // Padding - Horizontal
  hCompact: 'px-2',        // 8px - Tight horizontal
  hStandard: 'px-3',       // 12px - Standard horizontal
  hWide: 'px-4',           // 16px - Wide (buttons, inputs)
  hWider: 'px-6',          // 24px - Extra wide
  
  // Margins - Sections
  sectionTight: 'mb-2',    // 8px - Minimal section spacing
  sectionSmall: 'mb-4',    // 16px - Standard section spacing
  sectionMedium: 'mb-6',   // 24px - Medium section spacing
  sectionLarge: 'mb-8',    // 32px - Large section spacing
  
  // Margins - Elements
  elementTight: 'mb-1',    // 4px - Tight element spacing
  elementSmall: 'mb-2',    // 8px - Small element spacing
  elementStandard: 'mb-3', // 12px - Standard element spacing
  
  // Gap (Flexbox/Grid)
  gapTight: 'gap-1',       // 4px - Minimal gap
  gapCompact: 'gap-2',     // 8px - Standard compact gap
  gapStandard: 'gap-3',    // 12px - Medium gap
  gapWide: 'gap-4',        // 16px - Wide gap
  gapWider: 'gap-6',       // 24px - Extra wide gap
  
  // Special Cases
  pageBottom: 'pb-24',     // 96px - Bottom clearance for mobile nav
  pageContainer: 'p-4 md:p-6', // Responsive page padding
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const RADIUS = {
  none: 'rounded-none',     // 0px - No rounding
  sm: 'rounded-sm',         // 2px - Subtle rounding
  base: 'rounded-md',       // 6px - Standard rounding
  standard: 'rounded-lg',   // 8px - Standard cards, buttons
  large: 'rounded-xl',      // 12px - Large cards, modals
  xl: 'rounded-2xl',        // 16px - Extra large rounding
  full: 'rounded-full',     // 9999px - Circular (pills, avatars)
} as const;

// ============================================================================
// BACKGROUNDS
// ============================================================================

export const BACKGROUNDS = {
  // Page Backgrounds
  page: 'bg-white dark:bg-gray-900',
  pageAlt: 'bg-gray-50 dark:bg-gray-900',
  
  // Card Backgrounds
  card: 'bg-white dark:bg-gray-800/50',
  cardSolid: 'bg-white dark:bg-gray-800',
  cardElevated: 'bg-white dark:bg-gray-800/70',
  
  // Form Elements
  input: 'bg-gray-50 dark:bg-gray-800',
  inputDisabled: 'bg-gray-100 dark:bg-gray-700',
  
  // Buttons
  primary: 'bg-bdsec dark:bg-indigo-600',
  primaryHover: 'hover:bg-bdsec/90 dark:hover:bg-indigo-500',
  secondary: 'bg-gray-100 dark:bg-gray-800',
  secondaryHover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
  ghost: 'bg-transparent',
  ghostHover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  
  // Semantic Backgrounds
  success: 'bg-green-50 dark:bg-green-900/20',
  error: 'bg-red-50 dark:bg-red-900/20',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20',
  info: 'bg-blue-50 dark:bg-blue-900/20',
  
  // Stock Market Specific
  buyOrder: 'bg-green-50 dark:bg-green-900/10',
  sellOrder: 'bg-red-50 dark:bg-red-900/10',
  
  // Category Colors (AllStocks page)
  categoryI: 'bg-blue-50 dark:bg-blue-900/30',
  categoryII: 'bg-purple-50 dark:bg-purple-900/30',
  categoryIII: 'bg-gray-50 dark:bg-gray-800/60',
  categoryFund: 'bg-green-50 dark:bg-green-900/30',
  categoryBond: 'bg-orange-50 dark:bg-orange-900/30',
} as const;

// ============================================================================
// BORDERS
// ============================================================================

export const BORDERS = {
  // Standard Borders
  default: 'border border-gray-200 dark:border-gray-700',
  input: 'border border-gray-300 dark:border-gray-600',
  hover: 'hover:border-bdsec/50 dark:hover:border-indigo-500/50',
  focus: 'focus:border-bdsec dark:focus:border-indigo-500',
  
  // Accent Borders (Special Effects)
  accentLeft: 'dark:border-l-indigo-500',
  accentTop: 'dark:border-t-indigo-500',
  accentFull: 'dark:border-l-indigo-500 dark:border-t-indigo-500',
  
  // Semantic Borders
  success: 'border-green-200 dark:border-green-800',
  error: 'border-red-200 dark:border-red-800',
  warning: 'border-yellow-200 dark:border-yellow-800',
  info: 'border-blue-200 dark:border-blue-800',
} as const;

// ============================================================================
// BUTTON HEIGHTS
// ============================================================================

export const BUTTON_HEIGHTS = {
  compact: 'h-8',      // 32px - Small buttons
  standard: 'h-10',    // 40px - Standard buttons, inputs
  large: 'h-11',       // 44px - Large buttons
  xl: 'h-12',          // 48px - Extra large buttons
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  base: 'shadow',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const TRANSITIONS = {
  fast: 'transition-all duration-150',
  base: 'transition-all duration-200',
  medium: 'transition-all duration-300',
  slow: 'transition-all duration-500',
  
  // Specific Properties
  colors: 'transition-colors duration-200',
  transform: 'transition-transform duration-200',
  opacity: 'transition-opacity duration-200',
} as const;

// ============================================================================
// COMMON COMPONENT PATTERNS
// ============================================================================

export const PATTERNS = {
  // Standard Card
  card: `${BACKGROUNDS.card} ${BORDERS.default} ${RADIUS.standard} ${SPACING.standard} ${SHADOWS.sm}`,
  
  // Interactive Card
  cardInteractive: `${BACKGROUNDS.card} ${BORDERS.default} ${RADIUS.large} ${SPACING.small} ${SHADOWS.sm} ${TRANSITIONS.base} cursor-pointer hover:scale-105 ${BORDERS.hover} ${BORDERS.accentFull}`,
  
  // Standard Input
  input: `${BACKGROUNDS.input} ${BORDERS.input} ${RADIUS.standard} ${SPACING.hWide} ${SPACING.vSmall} ${TEXT_COLORS.primary} text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`,
  
  // Primary Button
  buttonPrimary: `${BACKGROUNDS.primary} ${BACKGROUNDS.primaryHover} ${BUTTON_HEIGHTS.standard} ${SPACING.hWide} ${SPACING.vSmall} ${RADIUS.standard} ${TYPOGRAPHY.buttonPrimary} text-white ${TRANSITIONS.colors} ${SHADOWS.sm} hover:shadow-md`,
  
  // Secondary Button
  buttonSecondary: `${BACKGROUNDS.secondary} ${BACKGROUNDS.secondaryHover} ${BUTTON_HEIGHTS.standard} ${SPACING.hWide} ${SPACING.vSmall} ${RADIUS.standard} ${TYPOGRAPHY.buttonSecondary} ${TEXT_COLORS.primary} ${TRANSITIONS.colors} ${BORDERS.default}`,
  
  // Badge
  badge: `${TYPOGRAPHY.badge} ${SPACING.hCompact} ${SPACING.vCompact} ${RADIUS.full} inline-flex items-center justify-center`,
  
  // Stock Card
  stockCard: `${BACKGROUNDS.card} ${BORDERS.default} ${RADIUS.large} ${SPACING.small} ${TRANSITIONS.medium} hover:scale-105 ${BORDERS.accentFull} cursor-pointer`,
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
  base: 'z-0',
  dropdown: 'z-10',
  sticky: 'z-20',
  fixed: 'z-30',
  modalBackdrop: 'z-40',
  modal: 'z-50',
  popover: 'z-50',
  tooltip: 'z-60',
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Combines multiple design system classes
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Gets button classes by variant and size
 */
export function getButtonClasses(
  variant: 'primary' | 'secondary' | 'ghost' = 'primary',
  size: 'compact' | 'standard' | 'large' = 'standard'
): string {
  const baseClasses = `${RADIUS.standard} ${TRANSITIONS.colors} focus:outline-none focus:ring-2 focus:ring-indigo-500`;
  
  const variantClasses = {
    primary: PATTERNS.buttonPrimary,
    secondary: PATTERNS.buttonSecondary,
    ghost: `${BACKGROUNDS.ghost} ${BACKGROUNDS.ghostHover} ${TEXT_COLORS.primary}`,
  };
  
  const sizeClasses = {
    compact: `${BUTTON_HEIGHTS.compact} ${SPACING.hStandard} ${TYPOGRAPHY.buttonCompact}`,
    standard: `${BUTTON_HEIGHTS.standard} ${SPACING.hWide} ${TYPOGRAPHY.buttonPrimary}`,
    large: `${BUTTON_HEIGHTS.large} ${SPACING.hWider} ${TYPOGRAPHY.buttonPrimary}`,
  };
  
  return cn(baseClasses, variantClasses[variant], sizeClasses[size]);
}

/**
 * Gets input classes with optional error state
 */
export function getInputClasses(hasError = false): string {
  const baseClasses = PATTERNS.input;
  const errorClasses = hasError ? `${BORDERS.error} focus:ring-red-500` : '';
  
  return cn(baseClasses, errorClasses);
}

/**
 * Gets card classes with optional interactive state
 */
export function getCardClasses(interactive = false): string {
  return interactive ? PATTERNS.cardInteractive : PATTERNS.card;
}

/**
 * Gets badge classes by semantic type
 */
export function getBadgeClasses(
  type: 'success' | 'error' | 'warning' | 'info' | 'neutral' = 'neutral'
): string {
  const baseClasses = PATTERNS.badge;
  
  const typeClasses = {
    success: `${BACKGROUNDS.success} ${TEXT_COLORS.success}`,
    error: `${BACKGROUNDS.error} ${TEXT_COLORS.error}`,
    warning: `${BACKGROUNDS.warning} ${TEXT_COLORS.warning}`,
    info: `${BACKGROUNDS.info} ${TEXT_COLORS.info}`,
    neutral: `${BACKGROUNDS.secondary} ${TEXT_COLORS.secondary}`,
  };
  
  return cn(baseClasses, typeClasses[type]);
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  TYPOGRAPHY,
  TEXT_COLORS,
  SPACING,
  RADIUS,
  BACKGROUNDS,
  BORDERS,
  BUTTON_HEIGHTS,
  SHADOWS,
  TRANSITIONS,
  PATTERNS,
  Z_INDEX,
  cn,
  getButtonClasses,
  getInputClasses,
  getCardClasses,
  getBadgeClasses,
};
