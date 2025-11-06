# Design System Quick Reference

**File**: `/lib/design-system.ts`  
**Last Updated**: November 6, 2025

---

## 🎨 Typography

```tsx
import { TYPOGRAPHY } from '@/lib/design-system';

TYPOGRAPHY.hero              // text-3xl font-bold - Hero numbers
TYPOGRAPHY.heroPrice          // text-2xl font-bold - Featured prices
TYPOGRAPHY.pageTitle          // text-2xl font-bold - Page titles
TYPOGRAPHY.sectionTitle       // text-xl font-semibold - Section headers
TYPOGRAPHY.cardTitle          // text-lg font-semibold - Card headers
TYPOGRAPHY.subheading         // text-base font-medium - Subheadings
TYPOGRAPHY.bodyLarge          // text-base font-normal - Large body
TYPOGRAPHY.body               // text-sm font-normal - Standard body
TYPOGRAPHY.bodySmall          // text-xs font-normal - Small body
TYPOGRAPHY.buttonPrimary      // text-sm font-bold - Primary buttons
TYPOGRAPHY.buttonSecondary    // text-sm font-medium - Secondary buttons
TYPOGRAPHY.buttonCompact      // text-xs font-medium - Small buttons
TYPOGRAPHY.label              // text-sm font-medium - Labels
TYPOGRAPHY.labelSmall         // text-xs font-medium - Small labels
TYPOGRAPHY.badge              // text-xs font-semibold - Badges
TYPOGRAPHY.caption            // text-xs font-normal - Captions
TYPOGRAPHY.stockPrice         // text-sm font-semibold - Stock prices
```

---

## 🎨 Colors

```tsx
import { TEXT_COLORS } from '@/lib/design-system';

TEXT_COLORS.primary           // text-gray-900 dark:text-white
TEXT_COLORS.secondary         // text-gray-600 dark:text-gray-300
TEXT_COLORS.muted             // text-gray-500 dark:text-gray-400
TEXT_COLORS.brand             // text-bdsec dark:text-indigo-400
TEXT_COLORS.success           // text-green-600 dark:text-green-400
TEXT_COLORS.error             // text-red-600 dark:text-red-400
TEXT_COLORS.priceUp           // text-green-500
TEXT_COLORS.priceDown         // text-red-500
```

---

## 📏 Spacing

```tsx
import { SPACING } from '@/lib/design-system';

// Padding
SPACING.compact               // p-2 (8px)
SPACING.small                 // p-3 (12px) - Stock cards
SPACING.standard              // p-4 (16px) - Standard
SPACING.large                 // p-6 (24px) - Modals

// Vertical
SPACING.vCompact              // py-1 (4px)
SPACING.vSmall                // py-2 (8px) - Buttons
SPACING.vStandard             // py-3 (12px)

// Horizontal
SPACING.hCompact              // px-2 (8px)
SPACING.hStandard             // px-3 (12px)
SPACING.hWide                 // px-4 (16px) - Buttons
SPACING.hWider                // px-6 (24px)

// Gap
SPACING.gapCompact            // gap-2 (8px)
SPACING.gapStandard           // gap-3 (12px)
SPACING.gapWide               // gap-4 (16px)
```

---

## 🔘 Border Radius

```tsx
import { RADIUS } from '@/lib/design-system';

RADIUS.base                   // rounded-md - Images
RADIUS.standard               // rounded-lg - Buttons
RADIUS.large                  // rounded-xl - Cards
RADIUS.full                   // rounded-full - Badges, Pills
```

---

## 🎨 Backgrounds

```tsx
import { BACKGROUNDS } from '@/lib/design-system';

BACKGROUNDS.page              // bg-white dark:bg-gray-900
BACKGROUNDS.card              // bg-white dark:bg-gray-800/50
BACKGROUNDS.input             // bg-gray-50 dark:bg-gray-800
BACKGROUNDS.primary           // bg-bdsec dark:bg-indigo-600
BACKGROUNDS.secondary         // bg-gray-100 dark:bg-gray-800
BACKGROUNDS.success           // bg-green-50 dark:bg-green-900/20
BACKGROUNDS.error             // bg-red-50 dark:bg-red-900/20
```

---

## 📐 Button Heights

```tsx
import { BUTTON_HEIGHTS } from '@/lib/design-system';

BUTTON_HEIGHTS.compact        // h-8 (32px)
BUTTON_HEIGHTS.standard       // h-10 (40px) - Most common
BUTTON_HEIGHTS.large          // h-11 (44px)
BUTTON_HEIGHTS.xl             // h-12 (48px)
```

---

## 🔧 Utility Functions

```tsx
import { 
  getButtonClasses, 
  getInputClasses, 
  getCardClasses,
  getBadgeClasses,
  cn 
} from '@/lib/design-system';

// Buttons
<button className={getButtonClasses('primary', 'standard')}>
<button className={getButtonClasses('secondary', 'compact')}>
<button className={getButtonClasses('ghost', 'large')}>

// Inputs
<input className={getInputClasses()} />
<input className={getInputClasses(hasError)} />

// Cards
<div className={getCardClasses()}>
<div className={getCardClasses(true)}>  // Interactive

// Badges
<span className={getBadgeClasses('success')}>
<span className={getBadgeClasses('error')}>

// Combine classes
<div className={cn(SPACING.standard, RADIUS.large, 'custom-class')}>
```

---

## 📦 Common Patterns

```tsx
import { PATTERNS } from '@/lib/design-system';

// Pre-composed patterns
<div className={PATTERNS.card}>
<div className={PATTERNS.cardInteractive}>
<input className={PATTERNS.input} />
<button className={PATTERNS.buttonPrimary}>
<button className={PATTERNS.buttonSecondary}>
<span className={PATTERNS.badge}>
<div className={PATTERNS.stockCard}>
```

---

## 📋 Usage Examples

### Page Layout
```tsx
import { TYPOGRAPHY, TEXT_COLORS, SPACING } from '@/lib/design-system';

<div className={SPACING.pageContainer}>
  <h1 className={`${TYPOGRAPHY.pageTitle} ${TEXT_COLORS.primary}`}>
    Page Title
  </h1>
  <p className={`${TYPOGRAPHY.body} ${TEXT_COLORS.secondary}`}>
    Description text
  </p>
</div>
```

### Card Component
```tsx
import { PATTERNS, TYPOGRAPHY, TEXT_COLORS } from '@/lib/design-system';

<div className={PATTERNS.cardInteractive}>
  <h3 className={`${TYPOGRAPHY.cardTitle} ${TEXT_COLORS.primary}`}>
    Card Title
  </h3>
  <p className={`${TYPOGRAPHY.body} ${TEXT_COLORS.secondary}`}>
    Card content
  </p>
</div>
```

### Form Input
```tsx
import { getInputClasses, TYPOGRAPHY, SPACING } from '@/lib/design-system';

<div className={SPACING.sectionSmall}>
  <label className={TYPOGRAPHY.label}>
    Label Text
  </label>
  <input 
    type="text" 
    className={getInputClasses(hasError)}
  />
</div>
```

### Button Group
```tsx
import { getButtonClasses, SPACING } from '@/lib/design-system';

<div className={`flex ${SPACING.gapCompact}`}>
  <button className={getButtonClasses('primary', 'standard')}>
    Save
  </button>
  <button className={getButtonClasses('secondary', 'standard')}>
    Cancel
  </button>
</div>
```

---

## 🚨 Common Mistakes to Avoid

### ❌ Don't Do This:
```tsx
// Hard-coded values
<h1 className="text-lg font-semibold">Title</h1>
<button className="px-4 py-2 bg-blue-500 h-9">Button</button>
<div className="p-5">...</div>
<div className="rounded-2xl">...</div>
```

### ✅ Do This Instead:
```tsx
// Use design system
import { TYPOGRAPHY, getButtonClasses, SPACING, RADIUS } from '@/lib/design-system';

<h1 className={TYPOGRAPHY.pageTitle}>Title</h1>
<button className={getButtonClasses('primary')}>Button</button>
<div className={SPACING.standard}>...</div>
<div className={RADIUS.large}>...</div>
```

---

## 🎯 Design Tokens Cheatsheet

| Category | Token | Value | Use Case |
|----------|-------|-------|----------|
| **Typography** | pageTitle | text-2xl font-bold | Page headers |
| | body | text-sm font-normal | Body text |
| | caption | text-xs font-normal | Captions |
| **Spacing** | small | p-3 | Stock cards |
| | standard | p-4 | Standard cards |
| | large | p-6 | Modals |
| **Heights** | standard | h-10 | Buttons/inputs |
| **Radius** | standard | rounded-lg | Buttons |
| | large | rounded-xl | Cards |
| | full | rounded-full | Badges |

---

**For full documentation, see**: `/UI_DESIGN_SYSTEM_IMPLEMENTATION.md`
