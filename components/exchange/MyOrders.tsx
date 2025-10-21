import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { CancelOrderModal } from './CancelOrderModal';

type OrderTab = 'active' | 'completed' | 'cancelled';

interface OrderData {
  id: string;
  statusname: string;
  buySell: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

interface MyOrdersProps {
  loading?: boolean;
  orders: OrderData[];
  orderTab: OrderTab;
  setOrderTab: (tab: OrderTab) => void;
  formatNumber: (num: number) => string;
  onCancelOrder: (orderId: string) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
  loading = false,
  orders,
  orderTab,
  setOrderTab,
  formatNumber,
  onCancelOrder
}) => {
  const { t } = useTranslation('common');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderData | null>(null);

  const filteredOrders = orders.filter(order => {
    if (orderTab === 'active') return order.statusname === 'pending';
    if (orderTab === 'completed') return order.statusname === 'completed';
    if (orderTab === 'cancelled') return order.statusname === 'cancelled';
    return false;
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

  return (
    <div className="bg-white dark:bg-gray-900 mx-3 mt-3 mb-6 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header - More Compact */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-[14px] font-medium text-gray-700 dark:text-gray-300">
            {t('exchange.myOrders', 'Миний захиалгууд')}
          </h3>
        </div>
        <div className="flex gap-1">
          {[
            { key: 'active', label: t('exchange.activeOrders', 'Идэвхтэй'), count: orders.filter(o => o.statusname === 'pending').length },
            { key: 'completed', label: t('exchange.completedOrdersTab', 'Биелсэн'), count: orders.filter(o => o.statusname === 'completed').length },
            { key: 'cancelled', label: t('exchange.cancelledOrders', 'Цуцлагдсан'), count: orders.filter(o => o.statusname === 'cancelled').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOrderTab(tab.key as OrderTab)}
              className={`px-2 py-0.5 text-[12px] mb-3 font-medium rounded transition-colors ${
                orderTab === tab.key
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>
      
      {/* Order Content - Compact */}
      <div className="px-3 pb-2">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 mb-1 bg-gray-50 dark:bg-gray-800/30 rounded">
                <div className="flex-1">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-1.5 px-2 mb-1 bg-gray-50 dark:bg-gray-800/30 rounded text-[10px] hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex-1">
                <div>
                  <span className={`font-medium px-1.5 py-0.5 rounded ${
                    order.buySell === 'BUY'
                      ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                      : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {order.buySell === 'BUY' ? t('exchange.buy', 'АВАХ') : t('exchange.sell', 'ЗАРАХ')}
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-1">
                  {order.quantity} × {order.price.toLocaleString()}₮
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {formatNumber(order.quantity * order.price)}₮
                </span>
                {orderTab === 'active' && (
                  <button
                    onClick={() => handleCancelClick(order)}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-[10px]">
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