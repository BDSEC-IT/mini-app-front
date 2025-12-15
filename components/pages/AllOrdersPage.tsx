'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  Filter,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import {
  fetchSecondaryOrdersPaginated,
  fetchSecondaryOrderStatus,
  cancelSecondaryOrder,
  fetchAllStocksWithCompanyInfo,
  type SecondaryOrderData,
  type SecondaryOrderParams,
  type PaginatedResponse,
  type StockData
} from '@/lib/api';
import { toast } from 'react-hot-toast';
import { CancelOrderModal } from '@/components/exchange/CancelOrderModal';
import { OrderDetailModal } from '@/components/exchange/OrderDetailModal';

type OrderTab = 'all' | 'active' | 'completed' | 'cancelled';
type SortField = 'createdDate' | 'price' | 'quantity' | 'total';
type SortDir = 'asc' | 'desc';
type DateRangeOption = 'all' | '7' | '30' | '90' | 'custom';

interface Execution {
  execPrice: number;
  execQty: number;
  execDate: string;
  execAmount: number;
}

// Extend SecondaryOrderData with optional executions array
type OrderWithExecution = SecondaryOrderData & {
  executions?: Execution[];
};

export default function AllOrdersPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // URL params
  const initialSymbol = searchParams.get('symbol') || '';
  const initialTab = (searchParams.get('tab') as OrderTab) || 'all';

  // State
  const [orders, setOrders] = useState<OrderWithExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stocks, setStocks] = useState<StockData[]>([]);
  
  // Filters
  const [orderTab, setOrderTab] = useState<OrderTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState(initialSymbol);
  const [symbolFilter, setSymbolFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'partial'>('all');
  const [buySellFilter, setBuySellFilter] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [dateRange, setDateRange] = useState<DateRangeOption>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderWithExecution | null>(null);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // Calculate date range
  const getDateRange = useCallback(() => {
    const now = new Date();
    let dateFrom: string | undefined;
    let dateTo: string | undefined = now.toISOString().split('T')[0];

    switch (dateRange) {
      case '7':
        const week = new Date(now);
        week.setDate(week.getDate() - 7);
        dateFrom = week.toISOString().split('T')[0];
        break;
      case '30':
        const month = new Date(now);
        month.setDate(month.getDate() - 30);
        dateFrom = month.toISOString().split('T')[0];
        break;
      case '90':
        const quarter = new Date(now);
        quarter.setDate(quarter.getDate() - 90);
        dateFrom = quarter.toISOString().split('T')[0];
        break;
      case 'custom':
        dateFrom = customStartDate || undefined;
        dateTo = customEndDate || undefined;
        break;
      default:
        dateFrom = undefined;
        dateTo = undefined;
    }

    return { dateFrom, dateTo };
  }, [dateRange, customStartDate, customEndDate]);

  // Get status filter
  const getStatusFilter = useCallback((): SecondaryOrderParams['statusname'] | undefined => {
    switch (orderTab) {
      case 'active':
        return 'pending';
      case 'completed':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return undefined;
    }
  }, [orderTab]);

  // Fetch orders
  const fetchOrders = useCallback(async (isRefresh = false) => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/auth/nationality');
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { dateFrom, dateTo } = getDateRange();
      const statusname = getStatusFilter();
      
      // When filtering for partial orders client-side on 'all' tab, fetch more results
      const isPartialFilterActive = (statusFilter === 'partial' && orderTab === 'all');
      const effectivePageSize = isPartialFilterActive ? 500 : pageSize; // Increased to 500
      const effectivePage = isPartialFilterActive ? 1 : currentPage;
      
      const params: SecondaryOrderParams = {
        symbol: symbolFilter !== 'all' ? symbolFilter : undefined,
        ...(statusname && { statusname }), // Only include if defined
        buySell: buySellFilter !== 'all' ? buySellFilter : undefined,
        dateFrom,
        dateTo,
        page: effectivePage,
        pageSize: effectivePageSize,
        orderBy: sortField,
        orderDir: sortDir,
      };

      const result = await fetchSecondaryOrdersPaginated(params, token);
      
      console.log('🔍 DEBUG:', {
        orderTab,
        statusFilter,
        isPartialFilterActive,
        resultCount: result.data?.length,
        params
      });
      
      if (result.success && result.data) {
        let filteredData = result.data;
        
        // Filter for partial orders if that filter is selected AND we're on 'all' tab
        if (isPartialFilterActive) {
          console.log('🔍 BEFORE FILTER:', result.data.length);
          console.log('🔍 SAMPLE DATA:', result.data.slice(0, 3).map(o => ({
            symbol: o.symbol,
            cumQty: o.cumQty,
            quantity: o.quantity,
            status: o.statusname
          })));
          
          filteredData = result.data.filter(order => {
            // A partial order is one that has SOME fills but not complete
            // This includes orders with any status where 0 < cumQty < quantity
            const isPartial = (order.cumQty > 0 && order.cumQty < order.quantity);
            if (isPartial) {
              console.log('✅ FOUND PARTIAL:', order.symbol, order.cumQty, '/', order.quantity);
            }
            return isPartial;
          });
          console.log('🔍 AFTER FILTER:', filteredData.length);
        }
        
        // Sort orders by date locally as well (server-side may not work perfectly)
        const sortedOrders = [...filteredData].sort((a, b) => {
          const dateA = new Date(a.createdDate || 0).getTime();
          const dateB = new Date(b.createdDate || 0).getTime();
          return sortDir === 'desc' ? dateB - dateA : dateA - dateB;
        });

        setOrders(sortedOrders);
        
        // Use metadata if available, otherwise infer from data
        if (statusFilter === 'partial' && orderTab === 'all') {
          // For client-side filtering, set total based on filtered results
          setTotalPages(1); // All results on one page for client-side filtering
          setTotalItems(filteredData.length);
        } else if (result.metadata) {
          setTotalPages(Math.ceil(result.metadata.totalRecordCount / result.metadata.pageSize));
          setTotalItems(result.metadata.totalRecordCount);
        } else if (result.pagination) {
          // Fallback to pagination object if metadata not available
          setTotalPages(result.pagination.totalPages || (result.data.length === pageSize ? currentPage + 1 : currentPage));
          setTotalItems(result.pagination.totalItems || result.data.length);
        } else {
          // If no metadata, infer from data length
          const hasMorePages = result.data.length === pageSize;
          setTotalPages(hasMorePages ? currentPage + 1 : currentPage);
          setTotalItems(currentPage * pageSize - (pageSize - result.data.length));
        }

        // Fetch execution details for active orders (non-blocking) - skip if already fetched for partial filter
        if (!(statusFilter === 'partial' && orderTab === 'all')) {
          sortedOrders
            .filter(order => order.statusname === 'pending' || order.statusname === 'Active' || order.statusname === 'PartiallyFilled')
            .slice(0, 5)
            .forEach(async (order) => {
              try {
                const statusResult = await fetchSecondaryOrderStatus(order.id, token);
                if (statusResult.success && statusResult.data?.executions) {
                  const totalExecuted = statusResult.data.executions.reduce(
                    (sum: number, exec: any) => sum + (exec.execQty || 0),
                    0
                  );
                  setOrders(prev => prev.map(o =>
                    o.id === order.id
                      ? {
                          ...o,
                          cumQty: totalExecuted,
                          leavesQty: o.quantity - totalExecuted,
                          executions: statusResult.data.executions
                        }
                      : o
                  ));
                }
              } catch (e) {
                console.error('Error fetching status for order', order.id);
              }
            });
        }
      } else {
        setOrders([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t('allOrders.fetchError', 'Захиалгууд ачаалахад алдаа гарлаа'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [symbolFilter, statusFilter, orderTab, buySellFilter, dateRange, customStartDate, customEndDate, currentPage, pageSize, sortField, sortDir, getDateRange, getStatusFilter, router, t]);

  // Fetch stocks on mount
  useEffect(() => {
    const loadStocks = async () => {
      try {
        const result = await fetchAllStocksWithCompanyInfo();
        if (result.success && result.data) {
          setStocks(result.data);
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    };
    loadStocks();
  }, []);

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [orderTab, searchQuery, symbolFilter, statusFilter, buySellFilter, dateRange, customStartDate, customEndDate]);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    if (showFilters) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [showFilters]);

  // Handlers
  const handleCancelClick = (order: OrderWithExecution) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleOrderDetailClick = (order: OrderWithExecution) => {
    setSelectedOrderId(String(order.id));
    setShowOrderDetailModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;
    
    const token = Cookies.get('token');
    if (!token) return;

    try {
      const result = await cancelSecondaryOrder(orderToCancel.id, token);
      if (result.success) {
        toast.success(t('exchange.cancelSuccess', 'Захиалга амжилттай цуцлагдлаа'));
        setShowCancelModal(false);
        fetchOrders(true);
      } else {
        toast.error(result.message || t('exchange.cancelError', 'Захиалга цуцлахад алдаа гарлаа'));
      }
    } catch (error) {
      toast.error(t('exchange.cancelError', 'Захиалга цуцлахад алдаа гарлаа'));
    }
  };

  const handleOrderCancelled = () => {
    fetchOrders(true);
  };

  // Format helpers
  const formatNumber = (num: number) => num.toLocaleString();
  
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Active':
      case 'PartiallyFilled':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'completed':
      case 'Filled':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
      case 'Cancelled':
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
      case 'Active':
        return t('exchange.statusPending', 'Идэвхтэй');
      case 'PartiallyFilled':
        return t('exchange.statusPartial', 'Хэсэгчлэн');
      case 'completed':
      case 'Filled':
        return t('exchange.statusCompleted', 'Биелсэн');
      case 'cancelled':
      case 'Cancelled':
        return t('exchange.statusCancelled', 'Цуцлагдсан');
      case 'expired':
        return t('exchange.statusExpired', 'Дууссан');
      default:
        return status;
    }
  };

  const isPartialOrder = (order: OrderWithExecution) => {
    // Check by statusname first
    const status = order.statusname?.toLowerCase();
    if (status === 'partiallyfilled') return true;
    // Then check by cumQty
    if (order.cumQty === undefined || order.cumQty === 0) return false;
    return order.cumQty > 0 && order.cumQty < order.quantity;
  };

  // Filter counts
  const getFilterCounts = useMemo(() => {
    // This would ideally come from the API, but we calculate locally for now
    const all = orders.length;
    const active = orders.filter(o => {
      const s = o.statusname?.toLowerCase();
      return s === 'pending' || s === 'active' || s === 'partiallyfilled';
    }).length;
    const completed = orders.filter(o => {
      const s = o.statusname?.toLowerCase();
      return s === 'completed' || s === 'filled' || s === 'expired';
    }).length;
    const cancelled = orders.filter(o => o.statusname?.toLowerCase() === 'cancelled').length;
    return { all, active, completed, cancelled };
  }, [orders]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (symbolFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    if (buySellFilter !== 'all') count++;
    if (dateRange !== 'all') count++;
    return count;
  }, [searchQuery, symbolFilter, statusFilter, buySellFilter, dateRange]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('allOrders.title', 'Захиалгын түүх')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {loading ? t('common.loading', 'Уншиж байна...') : totalItems > 0 ? `${t('common.total', 'Нийт')} ${totalItems} ${t('common.items', 'бичлэг')}` : t('allOrders.noOrders', 'Захиалга олдсонгүй')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Toggle sort direction
                setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative group"
              title={sortDir === 'desc' ? t('common.sortNewestFirst', 'Шинээс хуучин') : t('common.sortOldestFirst', 'Хуучнаас шинэ')}
            >
              {sortDir === 'desc' ? (
                <ChevronDown className="w-5 h-5 text-bdsec dark:text-indigo-400" />
              ) : (
                <ChevronUp className="w-5 h-5 text-bdsec dark:text-indigo-400" />
              )}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {sortDir === 'desc' ? t('common.sortNewestFirst', 'Шинээс хуучин') : t('common.sortOldestFirst', 'Хуучнаас шинэ')}
              </span>
            </button>
            <button
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-bdsec text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setSearchQuery(value);
                // Also update the symbol filter when typing in search
                if (value) {
                  setSymbolFilter(value);
                } else {
                  setSymbolFilter('all');
                }
              }}
              placeholder={t('allOrders.searchPlaceholder', 'Хувьцааны код хайх... (BDS, APU, etc)')}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500"
              style={{ fontSize: '16px' }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSymbolFilter('all');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[
              { key: 'all', label: t('allOrders.all', 'Бүгд') },
              { key: 'active', label: t('exchange.activeOrders', 'Идэвхтэй') },
              { key: 'completed', label: t('exchange.completedOrdersTab', 'Биелсэн') },
              { key: 'cancelled', label: t('exchange.cancelledOrders', 'Цуцлагдсан') }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setOrderTab(tab.key as OrderTab);
                  // Reset status filter when changing tabs
                  setStatusFilter('all');
                }}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                  orderTab === tab.key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Panel Modal */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30 transition-opacity" />
          <div
            ref={filterPanelRef}
            className="pb-28 fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('allOrders.filters', 'Шүүлтүүр')}
              </h2>
              <button
                onClick={() => setShowFilters(false)}
                className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-4 space-y-4">
              {/* Stock Symbol Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('allOrders.stockSymbol', 'Хувьцааны код')}
                </label>
                <select
                  value={symbolFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSymbolFilter(value);
                    // Also update search query to match
                    setSearchQuery(value === 'all' ? '' : value);
                  }}
                  className="w-full px-3 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-bdsec dark:focus:ring-indigo-500"
                >
                  <option value="all">{t('allOrders.allStocks', 'Бүх хувьцаа')}</option>
                  {stocks.map((stock) => (
                    <option key={stock.Symbol} value={stock.Symbol.split('-')[0]}>
                      {stock.Symbol.split('-')[0]} - {stock.mnName || stock.enName || stock.Symbol}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('allOrders.status', 'Төлөв')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      statusFilter === 'all'
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md scale-[1.02]'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('allOrders.all', 'Бүгд')}
                  </button>
                  <button
                    onClick={() => setStatusFilter('partial')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                      statusFilter === 'partial'
                        ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-md scale-[1.02]'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('allOrders.partial', 'Хэсэгчлэн')}
                  </button>
                </div>
              </div>

              {/* Buy/Sell Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('allOrders.orderSide', 'Захиалгын төрөл')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'all', label: t('allOrders.all', 'Бүгд') },
                    { key: 'BUY', label: t('exchange.buy', 'Авах'), color: 'green' },
                    { key: 'SELL', label: t('exchange.sell', 'Зарах'), color: 'red' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setBuySellFilter(option.key as 'all' | 'BUY' | 'SELL')}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        buySellFilter === option.key
                          ? option.key === 'BUY'
                            ? 'bg-green-600 text-white shadow-md scale-[1.02]'
                            : option.key === 'SELL'
                            ? 'bg-red-600 text-white shadow-md scale-[1.02]'
                            : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md scale-[1.02]'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {t('allOrders.dateRange', 'Хугацаа')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'all', label: t('allOrders.allTime', 'Бүгд') },
                    { key: '7', label: t('allOrders.last7Days', '7 хоног') },
                    { key: '30', label: t('allOrders.last30Days', '30 хоног') },
                    { key: '90', label: t('allOrders.last90Days', '90 хоног') }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setDateRange(option.key as DateRangeOption)}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                        dateRange === option.key
                          ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md scale-[1.02]'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Date Range */}
                <button
                  onClick={() => setDateRange('custom')}
                  className={`mt-2 w-full py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    dateRange === 'custom'
                      ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {t('allOrders.customRange', 'Өөр хугацаа сонгох')}
                </button>
                
                {dateRange === 'custom' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('allOrders.from', 'Эхлэх')}
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t('allOrders.to', 'Дуусах')}
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSymbolFilter('all');
                    setStatusFilter('all');
                    setBuySellFilter('all');
                    setDateRange('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="w-full py-3 px-4 rounded-xl text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all"
                >
                  {t('allOrders.clearFilters', 'Шүүлтүүр цэвэрлэх')}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Orders List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 animate-pulse">
                <div className="flex justify-between mb-3">
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="space-y-3">
              {orders.map((order) => {
                const isPartial = isPartialOrder(order);
                const symbol = order.symbol?.split('-')[0] || order.symbol;
                
                return (
                  <div
                    key={order.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Symbol + Type + Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {symbol}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            order.buySell === 'BUY'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {order.buySell === 'BUY' ? t('exchange.buy', 'Авах') : t('exchange.sell', 'Зарах')}
                          </span>
                          {isPartial ? (
                            <button
                              onClick={() => handleOrderDetailClick(order)}
                              className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline decoration-amber-600 dark:decoration-amber-400 underline-offset-2 cursor-pointer"
                            >
                              {t('exchange.partial', 'Хэсэгчлэн биелсэн')} ({order.cumQty}/{order.quantity})
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              {getStatusIcon(order.statusname)}
                              {getStatusText(order.statusname)}
                            </span>
                          )}
                        </div>

                        {/* Quantity × Price */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {order.quantity.toLocaleString()} ш × {order.price.toLocaleString()}₮
                        </div>

                        {/* Date */}
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatDateTime(order.createdDate)}
                        </div>

                        {/* Execution info for partial orders */}
                        {isPartial && order.executions && order.executions.length > 0 && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span className="text-gray-400 dark:text-gray-500">Биелсэн: </span>
                            {order.executions.map((exec, idx) => (
                              <span key={idx}>
                                {exec.execQty.toLocaleString()}×{exec.execPrice.toLocaleString()}
                                {idx < order.executions!.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right side: Total + Actions */}
                      <div className="flex flex-col items-end gap-2 ml-3">
                        <span className="text-base font-semibold text-gray-900 dark:text-white tabular-nums">
                          {formatNumber(order.total)}₮
                        </span>
                        {order.statusname === 'pending' && (
                          <button
                            onClick={() => handleCancelClick(order)}
                            className="text-xs text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            {t('exchange.cancelOrder', 'Цуцлах')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={() => {
                    setCurrentPage(p => {
                      const newPage = Math.max(1, p - 1);
                      return newPage;
                    });
                  }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {t('pagination.previous', 'Өмнөх')}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentPage} / {totalPages}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({totalItems} {t('common.total', 'нийт')})
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCurrentPage(p => p + 1);
                  }}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {t('pagination.next', 'Дараах')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {t('allOrders.noOrders', 'Захиалга олдсонгүй')}
            </p>
            <button
              onClick={() => router.push('/exchange')}
              className="mt-4 px-4 py-2 bg-bdsec dark:bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-bdsec/90 dark:hover:bg-indigo-700 transition-colors"
            >
              {t('allOrders.goToExchange', 'Арилжаа хийх')}
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        order={orderToCancel ? {
          id: String(orderToCancel.id),
          buySell: orderToCancel.buySell as 'BUY' | 'SELL',
          quantity: orderToCancel.quantity,
          price: orderToCancel.price
        } : null}
        formatNumber={formatNumber}
      />

      <OrderDetailModal
        isOpen={showOrderDetailModal}
        onClose={() => setShowOrderDetailModal(false)}
        orderId={selectedOrderId}
        onOrderCancelled={handleOrderCancelled}
      />
    </div>
  );
}
