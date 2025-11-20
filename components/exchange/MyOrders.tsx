import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { CancelOrderModal } from './CancelOrderModal';

type OrderTab = 'active' | 'completed' | 'cancelled';

interface Execution {
  execPrice: number;
  execQty: number;
  execDate: string;
  execAmount: number;
}

interface OrderData {
  id: string;
  statusname: string;
  buySell: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  symbol?: string;
  createdDate?: string;
  cumQty?: number;
  leavesQty?: number;
  executions?: Execution[];
}

interface MyOrdersProps {
  loading?: boolean;
  orders: OrderData[];
  orderTab: OrderTab;
  setOrderTab: (tab: OrderTab) => void;
  formatNumber: (num: number) => string;
  onCancelOrder: (orderId: string) => void;
  feeEquity?: string | null;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
  loading = false,
  orders,
  orderTab,
  setOrderTab,
  formatNumber,
  onCancelOrder,
  feeEquity
}) => {
  const { t } = useTranslation('common');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderData | null>(null);

  const filteredOrders = orders
    .filter(order => {
      if (orderTab === 'active') return order.statusname === 'pending';
      if (orderTab === 'completed') return order.statusname === 'completed' || order.statusname === 'expired';
      if (orderTab === 'cancelled') return order.statusname === 'cancelled';
      return false;
    })
    .sort((a, b) => {
      if (!a.createdDate || !b.createdDate) return 0;
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });

  const handleCancelClick = (order: OrderData) => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    if (orderToCancel) {
      onCancelOrder(orderToCancel.id);
    }
  };

  // Calculate fee-adjusted total
  const calculateTotal = (order: OrderData) => {
    const baseTotal = order.quantity * order.price;
    const feePercent = parseFloat(feeEquity || '1');
    const feeAmount = baseTotal * (feePercent / 100);

    if (order.buySell === 'BUY') {
      return baseTotal + feeAmount;
    } else {
      return baseTotal - feeAmount;
    }
  };

  // Format date and time from createdDate
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

  // Check if order is partial
  const isPartialOrder = (order: OrderData) => {
    if (order.cumQty === undefined || order.cumQty === 0) return false;
    return order.cumQty > 0 && order.cumQty < order.quantity;
  };

  return (
    <div className="bg-white dark:bg-gray-900 mx-3 mt-3 mb-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3">
          {t('exchange.myOrders', 'Миний захиалгууд')}
        </h3>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          {[
            { key: 'active', label: t('exchange.activeOrders', 'Идэвхтэй'), count: orders.filter(o => o.statusname === 'pending').length },
            { key: 'completed', label: t('exchange.completedOrdersTab', 'Биелсэн'), count: orders.filter(o => o.statusname === 'completed' || o.statusname === 'expired').length },
            { key: 'cancelled', label: t('exchange.cancelledOrders', 'Цуцлагдсан'), count: orders.filter(o => o.statusname === 'cancelled').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOrderTab(tab.key as OrderTab)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                orderTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>
      
      {/* Order Content */}
      <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg animate-pulse">
                <div className="flex justify-between mb-2">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredOrders.map((order) => {
              const totalWithFee = calculateTotal(order);
              const isPartial = isPartialOrder(order);

              return (
                <div key={order.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Top row: Symbol + Type */}
                      <div className="flex items-center gap-2">
                        {order.symbol && (
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {order.symbol.split('-')[0]}
                          </span>
                        )}
                        <span className={`text-[10px] font-medium ${
                          order.buySell === 'BUY'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {order.buySell === 'BUY' ? t('exchange.buy', 'Авах') : t('exchange.sell', 'Зарах')}
                        </span>
                        {isPartial && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">
                            {t('exchange.partial', 'Хэсэгчилсэн')}
                          </span>
                        )}
                      </div>

                      {/* Middle row: Quantity × Price */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {order.quantity.toLocaleString()} ш × {order.price.toLocaleString()}₮
                      </div>

                      {/* Date */}
                      {order.createdDate && (
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatDateTime(order.createdDate)}
                        </div>
                      )}

                      {/* Execution breakdown for partial orders */}
                      {isPartial && order.executions && order.executions.length > 0 && (
                        <div className="mt-1.5 text-[10px] text-gray-500 dark:text-gray-400">
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

                    {/* Right side: Total + Cancel */}
                    <div className="flex flex-col items-end gap-1 ml-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                        {formatNumber(totalWithFee)}₮
                      </span>
                      {orderTab === 'active' && (
                        <button
                          onClick={() => handleCancelClick(order)}
                          className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          Цуцлах
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            {orderTab === 'active' && t('exchange.noActiveOrders', 'Идэвхтэй захиалга байхгүй')}
            {orderTab === 'completed' && t('exchange.noCompletedOrders', 'Биелсэн захиалга байхгүй')}
            {orderTab === 'cancelled' && t('exchange.noCancelledOrders', 'Цуцлагдсан захиалга байхгүй')}
          </div>
        )}
      </div>

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        order={orderToCancel}
        formatNumber={formatNumber}
      />
    </div>
  );
};