import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { TransactionFilter, TransactionType, DateRangeOption } from '@/types/balance';

type ValidType = typeof VALID_TYPES[number];
type ValidFilter = typeof VALID_FILTERS[number];
type ValidDateRange = typeof VALID_DATE_RANGES[number];

const VALID_TYPES = ['security', 'cash', 'csd'] as const;
const VALID_FILTERS = ['all', 'income', 'expense'] as const;
const VALID_DATE_RANGES = ['all', '7', '30', 'custom'] as const;

export function useTransactionParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get and validate type parameter - directly from URL
  const type = (() => {
    const param = searchParams.get('type');
    const validType = VALID_TYPES.includes(param as ValidType) ? (param as ValidType) : 'security';
    console.log('📊 Current type from URL:', validType);
    return validType;
  })();

  // Get and validate filter parameter
  const filter = (() => {
    const param = searchParams.get('filter');
    return VALID_FILTERS.includes(param as ValidFilter)
      ? (param as ValidFilter)
      : 'all';
  })();

  // Get and validate date range parameter
  const dateRange = (() => {
    const param = searchParams.get('dateRange');
    return VALID_DATE_RANGES.includes(param as ValidDateRange)
      ? (param as ValidDateRange)
      : 'all';
  })();

  // Get other parameters
  const symbol = searchParams.get('symbol');
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  // Update URL parameters using window.location for immediate update
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    console.log('🔄 Updating params:', updates);
    
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    
    const search = current.toString();
    const query = search ? `?${search}` : '';
    const newUrl = `${pathname}${query}`;
    
    console.log('🌐 New URL:', newUrl);
    
    // Use window.history.replaceState for immediate update
    window.history.replaceState({}, '', newUrl);
    
    // Then use router to trigger React re-render
    router.replace(newUrl, { scroll: false });
  }, [searchParams, router, pathname]);

  // Handlers for different parameter updates
  const setType = useCallback((newType: TransactionType) => {
    console.log('🎯 setType called with:', newType);
    
    if (!VALID_TYPES.includes(newType as ValidType)) {
      console.log('❌ Invalid type:', newType);
      return;
    }
    
    // Update URL params
    updateParams({ 
      type: newType,
      // Clear symbol when changing to non-security type
      ...(newType !== 'security' && { symbol: null })
    });
  }, [updateParams]);

  const setFilter = useCallback((newFilter: TransactionFilter) => {
    if (!VALID_FILTERS.includes(newFilter as ValidFilter)) return;
    updateParams({ filter: newFilter });
  }, [updateParams]);

  const setDateRange = useCallback((newRange: DateRangeOption) => {
    if (!VALID_DATE_RANGES.includes(newRange as ValidDateRange)) return;
    updateParams({ 
      dateRange: newRange,
      // Clear custom dates when not using custom range
      ...(newRange !== 'custom' && { 
        startDate: null, 
        endDate: null 
      })
    });
  }, [updateParams]);

  const setSymbol = useCallback((newSymbol: string | null) => {
    updateParams({ symbol: newSymbol });
  }, [updateParams]);

  const setCustomDates = useCallback((start: string, end: string) => {
    updateParams({ 
      dateRange: 'custom',
      startDate: start,
      endDate: end
    });
  }, [updateParams]);

  return {
    // Current values
    type: type as TransactionType,
    filter: filter as TransactionFilter,
    dateRange: dateRange as DateRangeOption,
    symbol,
    startDate,
    endDate,
    
    // Update functions
    setType,
    setFilter,
    setDateRange,
    setSymbol,
    setCustomDates
  };
}