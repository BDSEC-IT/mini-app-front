# UI Standardization Master Plan

> **Generated**: 2025-10-23
> **Status**: Ready for Implementation
> **Compliance Score**: Currently 85% → Target 100%

---

## Executive Summary

This plan consolidates findings from comprehensive audits of typography, spacing, colors, backgrounds, and borders across the entire codebase. It provides a systematic approach to eliminate inconsistencies while maintaining your existing design aesthetic.

### Key Findings:
- **Typography**: 12+ font sizes found, need reduction to 8 standard sizes
- **Spacing**: 65% consistency, need standardization of padding/margin patterns
- **Colors**: 97% adherence to CLAUDE.md, but critical `gray-950` violation
- **Components Analyzed**: 75+ files
- **Total Inconsistencies**: 142 items requiring fixes

---

## Part 1: Typography Standardization

### 1.1 Standard Typography Scale

**BEFORE** (Current State):
```
text-[8px], text-[9px], text-[10px], text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl + inconsistent weights
```

**AFTER** (Standardized Scale):
```typescript
// TYPOGRAPHY SYSTEM
const TYPOGRAPHY = {
  // Display & Heroes
  hero: 'text-3xl font-bold',              // 30px - Stock prices, hero numbers
  display: 'text-2xl font-bold',           // 24px - Page titles, major headings

  // Headings
  h1: 'text-xl font-semibold',             // 20px - Section headers
  h2: 'text-lg font-semibold',             // 18px - Card headers, subsections
  h3: 'text-base font-medium',             // 16px - Minor headers, emphasized text

  // Body Text
  body: 'text-sm font-normal',             // 14px - Standard body text, paragraphs
  bodySmall: 'text-xs font-normal',        // 12px - Fine print, captions, timestamps

  // UI Elements
  buttonPrimary: 'text-sm font-bold',      // 14px - Primary CTAs
  buttonSecondary: 'text-sm font-medium',  // 14px - Secondary buttons
  buttonSmall: 'text-xs font-medium',      // 12px - Compact buttons

  label: 'text-sm font-medium',            // 14px - Form labels
  labelSmall: 'text-xs font-medium',       // 12px - Compact labels

  badge: 'text-xs font-semibold',          // 12px - Status badges, percentage changes
  caption: 'text-xs font-normal',          // 12px - Metadata, helper text

  // Special Cases
  navLabelResponsive: 'text-[10px] font-normal',  // 10px - Bottom navigation (responsive)
  compactData: 'text-[10px] font-medium',         // 10px - Dense data displays (order tables)
};
```

### 1.2 Text Color Hierarchy

```typescript
// TEXT COLOR SYSTEM
const TEXT_COLORS = {
  // Primary Text
  primary: 'text-gray-900 dark:text-white',

  // Secondary Text (two-tier system)
  secondary: 'text-gray-600 dark:text-gray-300',      // Labels, secondary info
  muted: 'text-gray-500 dark:text-gray-400',          // Less important info, placeholders
  disabled: 'text-gray-400 dark:text-gray-500',       // Disabled states

  // Brand & Interactive
  brand: 'text-bdsec dark:text-indigo-400',           // Brand color, active states
  link: 'text-blue-600 dark:text-blue-400',           // Links, interactive elements

  // Semantic Colors
  success: 'text-green-600 dark:text-green-400',      // Positive changes, success states
  error: 'text-red-600 dark:text-red-400',            // Errors, negative changes
  warning: 'text-amber-600 dark:text-amber-400',      // Warnings, historical indicators
  info: 'text-blue-600 dark:text-blue-400',           // Informational states
};
```

### 1.3 Critical Typography Fixes

| Component | Current Issue | Fix Required | Priority |
|-----------|--------------|--------------|----------|
| **Page Titles** | Vary between text-base → text-2xl | Standardize to `text-2xl font-bold` | HIGH |
| **Stock Prices (Cards)** | Mix of text-sm, text-lg, text-2xl | Use `text-sm font-semibold` for cards | HIGH |
| **Stock Prices (Hero)** | Inconsistent sizing | Use `text-3xl font-bold` for featured | HIGH |
| **Form Labels** | Mix of text-xs, text-sm, text-base | Standardize to `text-sm font-medium` | MEDIUM |
| **Button Text** | Inconsistent weights | Primary: `text-sm font-bold`, Secondary: `text-sm font-medium` | MEDIUM |
| **Secondary Text** | Three competing patterns | Use `text-gray-600 dark:text-gray-300` for labels | LOW |

---

## Part 2: Spacing Standardization

### 2.1 Padding System

```typescript
// PADDING STANDARDS
const PADDING = {
  // Component Padding
  compact: 'p-2',           // 8px - Very small components, tight spaces
  small: 'p-3',             // 12px - Stock cards, compact cards (MOST COMMON)
  standard: 'p-4',          // 16px - Standard cards, containers
  large: 'p-6',             // 24px - Large cards, modals, glass cards

  // Directional Padding - Vertical
  vCompact: 'py-1',         // 4px - Very tight list items
  vSmall: 'py-2',           // 8px - Compact list items, buttons (STANDARD)
  vStandard: 'py-3',        // 12px - Standard list items, table cells
  vLarge: 'py-4',           // 16px - Spacious items

  // Directional Padding - Horizontal
  hTight: 'px-2',           // 8px - Compact horizontal
  hStandard: 'px-3',        // 12px - Standard horizontal
  hWide: 'px-4',            // 16px - Wide horizontal (BUTTONS)
  hWider: 'px-6',           // 24px - Extra wide

  // Special Cases
  pageBottom: 'pb-24',      // 96px - Bottom padding for mobile nav clearance
  pageContainer: 'p-4 md:p-6',  // Responsive page padding
};
```

### 2.2 Margin System

```typescript
// MARGIN STANDARDS
const MARGIN = {
  // Section Spacing
  sectionSmall: 'mb-4',     // 16px - Standard section spacing (MOST COMMON)
  sectionMedium: 'mb-6',    // 24px - Large section spacing
  sectionLarge: 'mb-8',     // 32px - Extra large sections

  // Element Spacing
  elementTight: 'mb-1',     // 4px - Minimal spacing
  elementSmall: 'mb-2',     // 8px - Small spacing
  elementStandard: 'mb-3',  // 12px - Standard spacing

  // Icon Spacing (STANDARDIZE THESE)
  iconRight: 'mr-2',        // 8px - Icon before text (STANDARD)
  iconLeft: 'ml-2',         // 8px - Icon after text (STANDARD)
  iconLarge: 'mr-3 ml-3',   // 12px - Larger icon spacing (avoid)
};
```

### 2.3 Gap System (Flexbox/Grid)

```typescript
// GAP STANDARDS
const GAP = {
  tight: 'gap-1',           // 4px - Minimal gap
  compact: 'gap-2',         // 8px - Standard compact gap (MOST COMMON)
  standard: 'gap-3',        // 12px - Medium gap
  wide: 'gap-4',            // 16px - Wide gap
  wider: 'gap-6',           // 24px - Extra wide gap for major sections
};
```

### 2.4 Critical Spacing Fixes

| Component Type | Current Issue | Fix Required | Priority |
|----------------|--------------|--------------|----------|
| **Card Padding** | p-2, p-3, p-4, p-6 variations | Stock/compact: `p-3`, Standard: `p-4`, Glass: `p-6` | HIGH |
| **Table Cell Padding** | px-0.5 py-0.5 → px-4 py-3 range | Mobile: `px-2 py-2`, Desktop: `px-4 py-3` | HIGH |
| **Icon Spacing** | mr-1, mr-2, mr-3 mix | Standardize to `mr-2` for all icons | MEDIUM |
| **Section Margins** | mb-3, mb-4, mb-6, mb-8 mix | Standard: `mb-4`, Major: `mb-6` | MEDIUM |
| **Button Padding** | Custom vs shadcn variants | Use shadcn size variants (`size="default"`) | LOW |

---

## Part 3: Color & Background Standardization

### 3.1 Background System

```typescript
// BACKGROUND STANDARDS
const BACKGROUNDS = {
  // Containers
  pageMain: 'bg-white dark:bg-gray-900',                    // ✅ CORRECT

  // Cards & Components
  card: 'bg-white dark:bg-gray-800/50',                     // ✅ CORRECT
  cardSolid: 'bg-white dark:bg-gray-800',                   // Alternative solid version

  // Forms & Inputs
  input: 'bg-gray-50 dark:bg-gray-800',                     // ✅ STANDARDIZE ON THIS
  inputAlt: 'bg-gray-100 dark:bg-gray-800',                 // ❌ PHASE OUT

  // Buttons
  primary: 'bg-bdsec dark:bg-indigo-600',                   // ✅ CORRECT
  secondary: 'bg-gray-100 dark:bg-gray-800',                // ✅ CORRECT

  // Semantic Backgrounds
  successBg: 'bg-green-50 dark:bg-green-900/20',
  errorBg: 'bg-red-50 dark:bg-red-900/20',
  warningBg: 'bg-yellow-50 dark:bg-yellow-900/20',
  infoBg: 'bg-blue-50 dark:bg-blue-900/20',

  // Category Colors (AllStocks)
  categoryI: 'bg-blue-50 dark:bg-blue-900/30',
  categoryII: 'bg-purple-50 dark:bg-purple-900/30',
  categoryIII: 'bg-gray-50 dark:bg-gray-800/60',
  categoryFund: 'bg-green-50 dark:bg-green-900/30',
  categoryBond: 'bg-orange-50 dark:bg-orange-900/30',
};
```

### 3.2 Border System

```typescript
// BORDER STANDARDS
const BORDERS = {
  // Standard Borders
  standard: 'border-gray-200 dark:border-gray-700',        // ✅ USE THIS
  enhanced: 'border-gray-300 dark:border-gray-600',        // For inputs only

  // Accent Borders (Special Card Effect)
  accentLeft: 'dark:border-l-indigo-500',
  accentTop: 'dark:border-t-indigo-500',

  // Hover States
  hoverBorder: 'hover:border-bdsec/50 dark:hover:border-indigo-500/50',

  // Semantic Borders
  successBorder: 'border-green-200 dark:border-green-800',
  errorBorder: 'border-red-200 dark:border-red-800',
  warningBorder: 'border-yellow-200 dark:border-yellow-800',
  infoBorder: 'border-blue-200 dark:border-blue-800',
};
```

### 3.3 CRITICAL: Fix gray-950 Violation

**❌ CRITICAL ISSUE:**
- **File**: [BottomNavigation.tsx](components/layout/BottomNavigation.tsx)
- **Lines**: 163, 165, 187, 191, 194, 197
- **Violation**: Uses `dark:bg-gray-950` (not in design system)

**Fix Required:**
```tsx
// BEFORE (WRONG):
className="bg-white dark:bg-gray-950"
className="text-white dark:text-gray-950"

// AFTER (CORRECT):
className="bg-white dark:bg-gray-900"
className="text-gray-900 dark:text-white"
```

**Priority**: 🔴 **CRITICAL** - Must fix immediately

### 3.4 Other Color Fixes

| Component | Issue | Fix | Priority |
|-----------|-------|-----|----------|
| **header.tsx:36** | Uses `dark:border-gray-800` | Change to `dark:border-gray-700` | MEDIUM |
| **Input backgrounds** | Mix of bg-gray-50/100/white | Standardize to `bg-gray-50 dark:bg-gray-800` | LOW |

---

## Part 4: Component-Specific Patterns

### 4.1 Standard Card Pattern (Reference)

```tsx
// STANDARD INTERACTIVE CARD (from CLAUDE.md)
className="
  relative w-full p-3
  overflow-hidden
  transition-all duration-300
  border rounded-xl cursor-pointer
  transform hover:scale-105
  border-gray-200 dark:border-gray-700
  bg-white dark:bg-gray-800/50
  dark:border-l-indigo-500 dark:border-t-indigo-500
  hover:border-bdsec/50 dark:hover:border-indigo-500/50
"
```

**Use cases**: Balance cards, withdrawal cards, interactive selections

### 4.2 Simple Card Pattern

```tsx
// SIMPLE CARD (no interaction)
className="
  border border-gray-200 dark:border-gray-700
  rounded-xl
  bg-white dark:bg-gray-800/50
  p-4
"
```

**Use cases**: Portfolio cards, stat displays, read-only content

### 4.3 Button Patterns (Use shadcn variants)

```tsx
// PRIMARY BUTTON
<Button size="default" className="bg-bdsec dark:bg-indigo-600">
  // size="default" → h-9 px-4 py-2 text-sm font-bold
</Button>

// SECONDARY BUTTON
<Button size="default" variant="secondary">
  // Inherits: bg-gray-100 dark:bg-gray-800 text-sm font-medium
</Button>

// SMALL BUTTON
<Button size="sm">
  // h-8 px-3 text-xs font-medium
</Button>
```

### 4.4 Form Input Pattern

```tsx
// STANDARD INPUT
<input
  className="
    w-full px-3 py-2
    bg-gray-50 dark:bg-gray-800
    border border-gray-300 dark:border-gray-600
    rounded-lg
    text-sm
    text-gray-900 dark:text-white
  "
/>
```

### 4.5 Table Pattern

```tsx
// TABLE HEADER
<th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">

// TABLE CELL (Desktop)
<td className="px-4 py-3 text-sm text-gray-900 dark:text-white">

// TABLE CELL (Mobile - Compact)
<td className="px-2 py-2 text-xs text-gray-900 dark:text-white">
```

---

## Part 5: Implementation Plan

### Phase 1: Critical Fixes (Week 1)
**Priority**: 🔴 **MUST FIX IMMEDIATELY**

#### 1.1 Fix gray-950 Violations
- [ ] Fix [BottomNavigation.tsx](components/layout/BottomNavigation.tsx) lines 163, 165, 187, 191, 194, 197
  - Replace `dark:bg-gray-950` → `dark:bg-gray-900`
  - Replace `dark:text-gray-950` → `text-gray-900 dark:text-white`

#### 1.2 Standardize Page Titles
- [ ] [FAQ.tsx](components/pages/FAQ.tsx):150 → `text-2xl font-bold`
- [ ] [Bonds.tsx](components/pages/Bonds.tsx):90 → `text-2xl font-bold`
- [ ] [HighLow.tsx](components/pages/HighLow.tsx):154 → `text-2xl font-bold`
- [ ] [AllStocks.tsx](components/pages/AllStocks.tsx):857 → `text-2xl font-bold`
- [ ] [Orders.tsx](components/pages/Orders.tsx):329, 373, 395, 512, 553 → Review and standardize

#### 1.3 Standardize Stock Price Display
**Card View** (StockList, Dashboard grids):
- [ ] [StockList.tsx](components/pages/dashboard/StockList.tsx):527, 529 → `text-sm font-semibold`

**Hero Display** (StockHeader, Exchange header):
- [ ] [StockHeader.tsx](components/pages/dashboard/StockHeader.tsx):120 → `text-3xl font-bold`
- [ ] [Exchange.tsx](components/pages/Exchange.tsx):732 → `text-2xl font-bold`

### Phase 2: High-Priority Typography (Week 2)
**Priority**: 🟠 **HIGH**

#### 2.1 Form Labels
- [ ] [OrderForm.tsx](components/exchange/OrderForm.tsx):98, 218-219, 259-260, 275-276 → `text-sm font-medium`
- [ ] [BalanceHeader.tsx](components/balance/BalanceHeader.tsx):56, 75 → `text-sm font-medium`
- [ ] [RechargeBalance.tsx](components/pages/RechargeBalance.tsx):263, 277, 281 → `text-sm font-medium`
- [ ] [Orders.tsx](components/pages/Orders.tsx) → All input labels → `text-sm font-medium`

#### 2.2 Button Text Standardization
- [ ] Review all `<Button>` components to use shadcn size variants
- [ ] Replace custom `px-3 py-2` with `size="default"`
- [ ] Replace custom small buttons with `size="sm"`
- [ ] Ensure primary CTAs use `font-bold`, secondary use `font-medium`

#### 2.3 Secondary Text Hierarchy
- [ ] Audit all `text-gray-500`, `text-gray-600` usage
- [ ] Labels/secondary info → `text-gray-600 dark:text-gray-300`
- [ ] Placeholders/muted → `text-gray-500 dark:text-gray-400`
- [ ] Disabled states → `text-gray-400 dark:text-gray-500`

### Phase 3: Spacing Standardization (Week 3)
**Priority**: 🟡 **MEDIUM**

#### 3.1 Card Padding
- [ ] Audit all card components
- [ ] Stock cards → `p-3`
- [ ] Standard cards → `p-4`
- [ ] Glass cards → `p-6`

#### 3.2 Table Cell Padding
- [ ] [AllStocks.tsx](components/pages/AllStocks.tsx):642 (mobile) → `px-2 py-2`
- [ ] [AllStocks.tsx](components/pages/AllStocks.tsx):752+ (desktop) → `px-4 py-3`
- [ ] [HighLow.tsx](components/pages/HighLow.tsx):317 → Verify `px-4 py-3`

#### 3.3 Icon Spacing
- [ ] Audit all icon components
- [ ] Right icons (icon + text) → `mr-2`
- [ ] Left icons (text + icon) → `ml-2`
- [ ] Remove `mr-3` variations

#### 3.4 Section Margins
- [ ] Standard sections → `mb-4`
- [ ] Major sections → `mb-6`
- [ ] Phase out `mb-3`, `mb-8` unless justified

### Phase 4: Background/Border Cleanup (Week 4)
**Priority**: 🟢 **LOW**

#### 4.1 Input Backgrounds
- [ ] [Orders.tsx](components/pages/Orders.tsx):441, 456, 464, 476 → Change `bg-white` to `bg-gray-50`
- [ ] Audit all input elements for `bg-gray-100` → change to `bg-gray-50`

#### 4.2 Border Fixes
- [ ] [header.tsx](components/layout/header.tsx):36 → Change `dark:border-gray-800` to `dark:border-gray-700`

### Phase 5: Documentation & Verification (Week 5)
**Priority**: 📋 **DOCUMENTATION**

#### 5.1 Update CLAUDE.md
- [ ] Add typography scale section
- [ ] Add spacing system documentation
- [ ] Document backdrop-blur patterns
- [ ] Document semantic color system
- [ ] Add category color documentation

#### 5.2 Create Component Library Reference
- [ ] Document all standard patterns
- [ ] Create copy-paste examples for developers
- [ ] Add "Do/Don't" examples

#### 5.3 Verification
- [ ] Run visual regression tests
- [ ] Test dark mode across all components
- [ ] Verify responsive breakpoints
- [ ] Check accessibility (WCAG AA contrast ratios)

---

## Part 6: Files Requiring Changes

### Priority 1: Critical (10 files)
1. ✅ [BottomNavigation.tsx](components/layout/BottomNavigation.tsx) - gray-950 fix
2. [FAQ.tsx](components/pages/FAQ.tsx) - Page title
3. [Bonds.tsx](components/pages/Bonds.tsx) - Page title
4. [HighLow.tsx](components/pages/HighLow.tsx) - Page title
5. [AllStocks.tsx](components/pages/AllStocks.tsx) - Page title + table padding
6. [Orders.tsx](components/pages/Orders.tsx) - Multiple typography issues
7. [StockList.tsx](components/pages/dashboard/StockList.tsx) - Price display
8. [StockHeader.tsx](components/pages/dashboard/StockHeader.tsx) - Hero price
9. [Exchange.tsx](components/pages/Exchange.tsx) - Header price
10. [header.tsx](components/layout/header.tsx) - Border fix

### Priority 2: High (15 files)
11. [OrderForm.tsx](components/exchange/OrderForm.tsx) - Form labels
12. [BalanceHeader.tsx](components/balance/BalanceHeader.tsx) - Labels + metadata
13. [RechargeBalance.tsx](components/pages/RechargeBalance.tsx) - Form standardization
14. [Portfolio.tsx](components/pages/Portfolio.tsx) - Metric displays
15. [Balance.tsx](components/pages/Balance.tsx) - Card patterns
16. [BalanceWithdrawal.tsx](components/pages/BalanceWithdrawal.tsx) - Form inputs
17. [MyOrders.tsx](components/exchange/MyOrders.tsx) - Compact text
18. [Dashboard.tsx](components/pages/Dashboard.tsx) - Various sizing
19-25. Other form/input components

### Priority 3: Medium (20 files)
26-45. Various components requiring spacing/button standardization

### Priority 4: Low (30+ files)
46+. Minor tweaks, documentation updates

---

## Part 7: Testing Checklist

### Visual Testing
- [ ] Light mode: All pages render correctly
- [ ] Dark mode: All pages render correctly
- [ ] Dark mode: No `gray-950` visible anywhere
- [ ] Typography: Consistent hierarchy across all pages
- [ ] Spacing: Cards, buttons, forms aligned

### Responsive Testing
- [ ] Mobile (375px): All layouts work
- [ ] Tablet (768px): Breakpoints function
- [ ] Desktop (1024px+): Full layouts display
- [ ] Bottom navigation: Clears content (pb-24)

### Accessibility Testing
- [ ] Color contrast: WCAG AA compliance
- [ ] Text sizing: Readable on all devices
- [ ] Focus states: Visible keyboard navigation
- [ ] Screen reader: Semantic HTML maintained

### Browser Testing
- [ ] Safari (iOS/macOS)
- [ ] Chrome
- [ ] Firefox
- [ ] Edge

---

## Part 8: Quick Reference Cheat Sheet

### Typography
```tsx
{/* Page Title */}
<h1 className="text-2xl font-bold text-gray-900 dark:text-white">

{/* Section Header */}
<h2 className="text-xl font-semibold text-gray-900 dark:text-white">

{/* Card Header */}
<h3 className="text-lg font-semibold text-gray-900 dark:text-white">

{/* Body Text */}
<p className="text-sm font-normal text-gray-600 dark:text-gray-300">

{/* Small Text */}
<span className="text-xs font-normal text-gray-500 dark:text-gray-400">

{/* Badge */}
<span className="text-xs font-semibold px-2 py-1 rounded-full">
```

### Components
```tsx
{/* Standard Card */}
<div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50">

{/* Interactive Card */}
<div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 transform hover:scale-105 cursor-pointer dark:border-l-indigo-500 dark:border-t-indigo-500">

{/* Input */}
<input className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm" />

{/* Button */}
<Button size="default" className="bg-bdsec dark:bg-indigo-600 text-sm font-bold">

{/* Section Spacing */}
<section className="mb-4">
```

---

## Part 9: Success Metrics

### Quantitative Goals
- Typography consistency: 85% → **100%**
- Spacing consistency: 65% → **95%**
- Color adherence: 97% → **100%**
- Files with issues: 75 → **0**

### Qualitative Goals
- Visual harmony across all pages
- Predictable component behavior
- Faster development (copy-paste patterns)
- Easier onboarding for new developers

---

## Part 10: Maintenance Guidelines

### For Future Development

**ALWAYS:**
1. Reference this document before creating new components
2. Copy patterns from exemplary files (Balance.tsx, StockList.tsx)
3. Use typography/spacing constants from this guide
4. Test in both light and dark mode
5. Verify against CLAUDE.md rules

**NEVER:**
1. Introduce new font sizes without updating this document
2. Use `gray-950` or other non-standard colors
3. Create custom button styles (use shadcn variants)
4. Mix `gap` and `space-*` (prefer `gap`)
5. Use arbitrary spacing values (use standard scale)

---

## Appendix A: Color Palette Reference

```typescript
// COMPLETE COLOR SYSTEM
export const colors = {
  // Primary Brand
  bdsec: '#21214f',
  indigo: {
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
  },

  // Grays (Light Mode)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',   // ← Standard border
    300: '#d1d5db',   // ← Enhanced border
    400: '#9ca3af',   // ← Disabled text
    500: '#6b7280',   // ← Muted text
    600: '#4b5563',   // ← Secondary text
    700: '#374151',   // ← Dark border
    800: '#1f2937',   // ← Dark card background
    900: '#111827',   // ← Dark page background
  },

  // Semantic Colors
  success: {
    light: '#dcfce7',   // bg-green-50
    DEFAULT: '#16a34a', // text-green-600
    dark: '#166534',    // dark:text-green-400 equivalent
  },
  error: {
    light: '#fef2f2',   // bg-red-50
    DEFAULT: '#dc2626', // text-red-600
    dark: '#991b1b',    // dark:text-red-400 equivalent
  },
  warning: {
    light: '#fef3c7',   // bg-amber-50
    DEFAULT: '#f59e0b', // text-amber-600
    dark: '#b45309',    // dark:text-amber-400 equivalent
  },
  info: {
    light: '#dbeafe',   // bg-blue-50
    DEFAULT: '#2563eb', // text-blue-600
    dark: '#1e40af',    // dark:text-blue-400 equivalent
  },
};
```

---

## Appendix B: Common Mistakes to Avoid

### ❌ Don't Do This:
```tsx
// Custom font size
<p className="text-[15px]">

// Non-standard background
<div className="bg-gray-950">

// Inconsistent spacing
<div className="mb-3">  // When mb-4 is standard

// Custom button padding
<button className="px-5 py-2.5">

// Mixed icon spacing
<Icon className="mr-3" />  // Should be mr-2

// Arbitrary spacing
<div className="space-y-5">  // Not in standard scale
```

### ✅ Do This Instead:
```tsx
// Use standard font size
<p className="text-sm">

// Use approved background
<div className="bg-gray-900">

// Use standard spacing
<div className="mb-4">

// Use shadcn button variant
<Button size="default">

// Standard icon spacing
<Icon className="mr-2" />

// Standard spacing scale
<div className="space-y-4">
```

---

## Version History

**v1.0** - 2025-10-23
- Initial comprehensive audit completed
- Typography scale defined
- Spacing system standardized
- Color/background patterns documented
- Implementation plan created
- 142 inconsistencies identified
- 5-week rollout plan established

---

**END OF STANDARDIZATION PLAN**

This document serves as the single source of truth for all UI/UX decisions in the project. All developers must reference this before making styling changes.
