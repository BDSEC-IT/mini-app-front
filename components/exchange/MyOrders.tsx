import React from 'react';
import { Button } from '../ui';

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
  const filteredOrders = orders.filter(order => {
    if (orderTab === 'active') return order.statusname === 'pending';
    if (orderTab === 'completed') return order.statusname === 'completed';
    if (orderTab === 'cancelled') return order.statusname === 'cancelled';
    return false;
  });

  return (
    <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-20">
      {/* Header - Compact */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Миний захиалгууд</span>
          <div className="flex gap-1">
            {[
              { key: 'active', label: 'Идэвхтэй', count: orders.filter(o => o.statusname === 'pending').length },
              { key: 'completed', label: 'Биелсэн', count: orders.filter(o => o.statusname === 'completed').length },
              { key: 'cancelled', label: 'Цуцлагдсан', count: orders.filter(o => o.statusname === 'cancelled').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setOrderTab(tab.key as OrderTab)}
                className={`px-2 py-1 text-xs transition-colors ${
                  orderTab === tab.key
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Order Content */}
      <div className="p-2 overflow-y-auto">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between mb-1.5 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    order.buySell === 'BUY' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {order.buySell === 'BUY' ? 'АВАХ' : 'ЗАРАХ'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    {order.quantity} ширхэг × {order.price}₮
                  </span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {formatNumber(order.quantity * order.price)}₮
                  </span>
                </div>
              </div>
              {orderTab === 'active' && (
                <Button
                  variant="danger"
                  onClick={() => onCancelOrder(order.id)}
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
    </div>
  );
};