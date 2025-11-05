# CRITICAL: MCSD Account Status Check Pattern

## ⚠️ IMPORTANT: Always Check DGStatus === 'COMPLETED'

This document explains the **critical pattern** that must be followed throughout the codebase when checking if a user has an active MCSD account.

## The Problem

The backend API response includes `MCSDAccountId` in `superAppAccounts`, which indicates that a relationship exists between a user and an MCSD account. However, **this does NOT mean the account is active or usable**.

An MCSD account can have the following states:
- `PENDING`: Account exists but is not yet approved/active
- `COMPLETED`: Account is fully approved and usable for trading

**Only accounts with `DGStatus === 'COMPLETED'` should be considered "active" or "opened".**

## The Solution

### ✅ DO: Use the Helper Function

**Always use the `hasActiveMCSDAccount()` helper function** from `@/lib/api`:

```typescript
import { hasActiveMCSDAccount, getUserAccountInformation } from '@/lib/api';

// Get account data
const accountInfo = await getUserAccountInformation(token);

// Check if account is active (COMPLETED)
const accountOpened = hasActiveMCSDAccount(accountInfo.data);

// Use this for conditional rendering
if (accountOpened) {
  // Show trading features
}
```

### ❌ DON'T: Check MCSDAccountId Alone

**Never check only for `MCSDAccountId` existence:**

```typescript
// ❌ WRONG - This will treat PENDING accounts as active!
const accountOpened = !!accountInfo?.superAppAccounts?.some((a: any) => !!a.MCSDAccountId);

// ✅ CORRECT - This checks DGStatus === 'COMPLETED'
const accountOpened = hasActiveMCSDAccount(accountInfo);
```

## When to Use This Check

Use `hasActiveMCSDAccount()` in these scenarios:

1. **Sidebar/Bottom Navigation** - Show advanced menu items (Exchange, Portfolio, Balance)
2. **Trading Features** - Enable/disable trading functionality
3. **Order Placement** - Allow users to place orders
4. **Portfolio Access** - Show portfolio data
5. **Balance Operations** - Allow recharge/withdrawal
6. **Any MCSD-related Operations** - Any feature that requires an active account

## Implementation Details

The `hasActiveMCSDAccount()` function:

```typescript
/**
 * CRITICAL: Check if user has an active MCSD account
 * 
 * IMPORTANT: An account is only considered "active" or "opened" if:
 * 1. MCSDAccount object exists (not just MCSDAccountId)
 * 2. MCSDAccount.DGStatus === 'COMPLETED'
 * 
 * @param accountData - The user account data from getUserAccountInformation
 * @returns true only if at least one superAppAccount has a COMPLETED MCSD account
 */
export const hasActiveMCSDAccount = (accountData: UserAccountResponse['data']): boolean => {
  if (!accountData?.superAppAccounts) return false;
  
  return accountData.superAppAccounts.some((account: SuperAppAccountItem) => {
    return account.MCSDAccount?.DGStatus === 'COMPLETED';
  });
};
```

## Type Definitions

The `SuperAppAccountItem` interface includes:

```typescript
interface MCSDAccountItem {
  id: number;
  BDCAccountID: string;
  BDCAccountNumber: string;
  RegistryNumber: string;
  FirstName: string;
  LastName: string;
  DGStatus: 'PENDING' | 'COMPLETED';  // ⚠️ CRITICAL FIELD
  [key: string]: any;
}

interface SuperAppAccountItem {
  // ... other fields
  MCSDAccountId?: number | null;
  MCSDAccount?: MCSDAccountItem | null;  // ⚠️ Check this object, not just the ID
  // ... other fields
}
```

## Files Updated

The following files have been updated to use the correct pattern:

- ✅ `components/layout/SideMenu.tsx` - Uses `hasActiveMCSDAccount()` for menu visibility
- ✅ `components/layout/BottomNavigation.tsx` - Uses `hasActiveMCSDAccount()` for navigation items
- ✅ `components/pages/Dashboard.tsx` - Uses `hasActiveMCSDAccount()` for `canTrade` state
- ✅ `components/pages/Profile.tsx` - Uses `hasActiveMCSDAccount()` for account status display
- ✅ `components/pages/Orders.tsx` - Only uses accountId from COMPLETED accounts
- ✅ `app/account-setup/general/page.tsx` - Checks DGStatus before redirecting
- ✅ `app/account-setup/opening-process/page.tsx` - Checks DGStatus for account opening status

## Common Mistakes to Avoid

1. **Checking `MCSDAccountId` alone** - This doesn't verify the account is active
2. **Not checking `MCSDAccount` object** - The object might not be populated even if ID exists
3. **Assuming account is active if ID exists** - Always verify `DGStatus === 'COMPLETED'`
4. **Using different logic in different files** - Always use the helper function for consistency

## Testing Checklist

When adding new features that require an active account:

- [ ] Import `hasActiveMCSDAccount` from `@/lib/api`
- [ ] Use the helper function instead of checking `MCSDAccountId` directly
- [ ] Test with accounts that have `DGStatus === 'PENDING'` (should be disabled)
- [ ] Test with accounts that have `DGStatus === 'COMPLETED'` (should be enabled)
- [ ] Test with accounts that have no MCSD account (should be disabled)

## Summary

**The golden rule:** Always check `MCSDAccount?.DGStatus === 'COMPLETED'` using the `hasActiveMCSDAccount()` helper function. Never rely on `MCSDAccountId` existence alone.

---

**Last Updated:** 2025-01-XX  
**Related Files:** `lib/api.ts` (helper function definition)
