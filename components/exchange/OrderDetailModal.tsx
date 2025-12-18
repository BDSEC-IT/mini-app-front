import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';
import { useTranslation } from 'react-i18next';
import { fetchSecondaryOrderStatus, cancelSecondaryOrder } from '@/lib/api';
import Cookies from 'js-cookie';

interface Execution {
  execPrice: number;
  execQty: number;
  execDate: string;
  execAmount: number;
}

interface OrderDetailData {
  orderId: number;
  symbol: string;
  statusname: string;
  orderDate: string;
  orderQty: number;
  buySell: 'BUY' | 'SELL';
  orderPrice: number;
  prefix: string;
  qtyCompleted: number | null;
  fee: number;
  feeAmount: number;
  channel: string;
  exchange: string;
  exchangeId: number | null;
  orderType: string;
  timeInForce: string;
  avgPrice: number | null;
  untilDate?: string;
  executions: Execution[];
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onOrderCancelled?: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onOrderCancelled
}) => {
  const { t } = useTranslation('common');
  const [orderDetail, setOrderDetail] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await fetchSecondaryOrderStatus(parseInt(orderId), token);
      if (response.success) {
        setOrderDetail(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      const token = Cookies.get('token');
      const response = await cancelSecondaryOrder(parseInt(orderId), token);
      if (response.success) {
        setShowCancelConfirm(false);
        onOrderCancelled?.();
        onClose();
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('mn-MN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatExecutionDate = (dateString: string) => {
    const date = new Date(dateString);
    // Add 8 hours for timezone
    date.setHours(date.getHours() );
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const getTimeInForceLabel = (tif: string) => {
    switch (tif) {
      case 'GTC':
        return t('exchange.untilCancelled', 'Захиалга цуцлагдах хүртэл');
      case 'DAY':
        return t('exchange.day', 'Өдрийн захиалга');
      case 'GTD':
        return t('exchange.gtd', 'Заасан өдөр');
      default:
        return tif;
    }
  };

  const getOrderTypeLabel = (type: string) => {
    switch (type) {
      case 'MARKET':
        return t('exchange.market', 'Зах зээл');
      case 'CONDITIONAL':
        return t('exchange.conditional', 'Нөхцөлт');
      default:
        return type;
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed  inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : orderDetail ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {orderDetail.symbol} {orderDetail.buySell === 'BUY' ? t('exchange.buy', 'Авах') : t('exchange.sell', 'Зарах')} захиалга ({formatDate(orderDetail.orderDate)})
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-500 transition-colors"
                aria-label={t('exchange.close', 'Болих')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Key-Value Pairs */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.status', 'Төлөв')}:
                  </span>
                  <span className="text-sm font-semibold px-2 py-1 rounded bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                    {t('exchange.partial', 'Хэсэгчлэн биелсэн')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.quantity', 'Тоо')}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {orderDetail.orderQty.toLocaleString()}ш
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.orderType', 'Төрөл')}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {getOrderTypeLabel(orderDetail.orderType)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.timeInForce', 'Хугацаа')}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {getTimeInForceLabel(orderDetail.timeInForce)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.price', 'Үнэ')}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {orderDetail.orderPrice.toLocaleString()}₮
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.avgPrice', 'Дундаж үнэ')}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {(orderDetail.avgPrice || 0).toLocaleString()}₮
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.fee', 'Шимтгэл')}:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {orderDetail.feeAmount.toLocaleString()}₮
                  </span>
                </div>

                <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('exchange.total', 'Нийт')} ({t('exchange.total', 'Дүн')}+{t('exchange.fee', 'Шимтгэл')}):
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {(orderDetail.orderQty * orderDetail.orderPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₮
                  </span>
                </div>
              </div>

              {/* Completed/Remaining Badges */}
              <div className="flex gap-2">
                <div className="flex-1 text-center border border-green-500 bg-white dark:bg-gray-900 px-3 py-2 rounded-md">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exchange.completedQty', 'Биелсэн')}
                  </div>
                  <div className="text-sm flex flex-col leading-tight font-semibold text-green-600 dark:text-green-400">
                    <span>{(orderDetail.executions?.reduce((sum, exec) => sum + exec.execQty, 0) || 0).toLocaleString()}ш</span>
                    <span>{orderDetail.executions&& (Number(orderDetail.executions?.reduce((sum, exec) => sum + exec.execQty, 0)) * orderDetail.orderPrice).toLocaleString('en-US')}₮</span>
                  </div>
                </div>
                <div className="flex-1 text-center border border-yellow-500 bg-white dark:bg-gray-900 px-3 py-2 rounded-md">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('exchange.remainingQty', 'Үлдсэн')}
                  </div>
                  <div className="text-sm flex flex-col leading-tight font-semibold text-yellow-600 dark:text-yellow-400">
                    <span>{(orderDetail.orderQty - (orderDetail.executions?.reduce((sum, exec) => sum + exec.execQty, 0) || 0)).toLocaleString()}ш</span>
                    <span>{orderDetail.executions&& (Number(orderDetail.orderQty - (orderDetail.executions?.reduce((sum, exec) => sum + exec.execQty, 0) || 0)) * orderDetail.orderPrice).toLocaleString('en-US')}₮</span>
                  
                  </div>
                </div>
              </div>

              {/* Separator */}
              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Executions Table */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  {t('exchange.executions', 'Биелэлтийн тайлан')}
                </h3>
                <div className="space-y-2">
                  {/* Table Header */}
                  <div className="flex text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                    <div className="flex-1">{t('exchange.date', 'Огноо')}</div>
                    <div className="flex-1 text-center">{t('exchange.quantity', 'Тоо')}</div>
                    <div className="flex-1 text-center">{t('exchange.price', 'Үнэ')}</div>
                    <div className="flex-1 text-right">{t('exchange.amount', 'Дүн')}</div>
                  </div>

                  {/* Table Rows */}
                  {(orderDetail.executions || [])
                    .sort((a, b) => new Date(b.execDate).getTime() - new Date(a.execDate).getTime())
                    .map((exec, index) => (
                    <div key={index} className="flex text-xs text-gray-900 dark:text-white">
                      <div className="flex-1">{formatExecutionDate(exec.execDate)}</div>
                      <div className="flex-1 text-center">{exec.execQty.toLocaleString()}</div>
                      <div className="flex-1 text-center">{exec.execPrice.toLocaleString()}</div>
                      <div className="flex-1 text-right">{exec.execAmount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Button */}
              {orderDetail.statusname !== 'cancelled' && (
                <div className="pt-4">
                  <Button
                    variant="danger"
                    onClick={() => setShowCancelConfirm(true)}
                    className="w-full !bg-transparent !text-red-600 hover:!bg-red-50 dark:hover:!bg-red-900/20 border border-red-500"
                  >
                    {t('exchange.cancelOrder', 'Цуцлах')}
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : null}

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm shadow-lg p-4">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
                {t('exchange.cancelConfirm', 'Цуцлах баталгаажуулах')}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {t('exchange.cancelOrderConfirm', 'Та дараах захиалгыг цуцлахдаа итгэлтэй байна уу?')}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1"
                >
                  {t('exchange.close', 'Болих')}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleCancelOrder}
                  className="flex-1"
                >
                  {t('exchange.confirmCancel', 'Цуцлах')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
