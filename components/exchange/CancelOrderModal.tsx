import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';

interface OrderData {
  id: string;
  buySell: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  order: OrderData | null;
  formatNumber: (num: number) => string;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  formatNumber
}) => {
  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Захиалга цуцлах
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Хаах"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Та дараах захиалгыг цуцлахдаа итгэлтэй байна уу?
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Төрөл:
              </span>
              <span className={`text-sm font-semibold px-2 py-1 rounded ${
                order.buySell === 'BUY'
                  ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                  : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
              }`}>
                {order.buySell === 'BUY' ? 'АВАХ' : 'ЗАРАХ'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Тоо ширхэг:
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {order.quantity}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Үнэ:
              </span>
              <span className="text-sm text-gray-900 dark:text-white">
                {order.price}₮
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Нийт дүн:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatNumber(order.quantity * order.price)}₮
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Болих
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirm}
              className="flex-1"
            >
              Цуцлах
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};