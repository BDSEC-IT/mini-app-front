import React, { useState } from 'react';
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
  orders: OrderData[];
  orderTab: OrderTab;
  setOrderTab: (tab: OrderTab) => void;
  formatNumber: (num: number) => string;
  onCancelOrder: (orderId: string) => void;
}

export const MyOrders: React.FC<MyOrdersProps> = ({
  orders,
  orderTab,
  setOrderTab,
  formatNumber,
  onCancelOrder
}) => {
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
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Миний захиалгууд
          </h3>
        </div>
        <div className="flex gap-1">
          {[
            { key: 'active', label: 'Идэвхтэй', count: orders.filter(o => o.statusname === 'pending').length },
            { key: 'completed', label: 'Биелсэн', count: orders.filter(o => o.statusname === 'completed').length },
            { key: 'cancelled', label: 'Цуцлагдсан', count: orders.filter(o => o.statusname === 'cancelled').length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setOrderTab(tab.key as OrderTab)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
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
      <div className="px-4 pb-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 mb-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    order.buySell === 'BUY'
                      ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                      : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {order.buySell === 'BUY' ? 'АВАХ' : 'ЗАРАХ'}
                  </span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">
                    {formatNumber(order.quantity * order.price)}₮
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-300 mt-1">
                  {order.quantity} × {order.price.toLocaleString()}₮
                </div>
              </div>
              {orderTab === 'active' && (
                <Button
                  variant="danger"
                  onClick={() => handleCancelClick(order)}
                  className="ml-2 px-2 py-1 text-xs"
                >
                  ЦУЦЛАХ
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
            {orderTab === 'active' && 'Идэвхтэй захиалга байхгүй'}
            {orderTab === 'completed' && 'Биелсэн захиалга байхгүй'}
            {orderTab === 'cancelled' && 'Цуцлагдсан захиалга байхгүй'}
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