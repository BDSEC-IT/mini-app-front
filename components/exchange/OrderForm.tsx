import React from 'react';
import { Button, Input, Select } from '../ui';

type OrderSide = 'BUY' | 'SELL';

interface OrderFormProps {
  orderType: string;
  setOrderType: (type: string) => void;
  orderSide: OrderSide;
  setOrderSide: (side: OrderSide) => void;
  orderDuration: string;
  setOrderDuration: (duration: string) => void;
  quantity: string;
  setQuantity: (quantity: string) => void;
  price: string;
  setPrice: (price: string) => void;
  accountBalance: number | null;
  selectedStockHolding: any;
  calculateTotal: () => number;
  formatNumber: (num: number) => string;
  getMaxQuantity: () => number;
  adjustPriceByStep: (currentPrice: string, direction: 'up' | 'down') => string;
  getPriceStep: (price: number) => number;
  selectedStock: any;
  showPriceSteps: boolean;
  setShowPriceSteps: (show: boolean) => void;
  placing: boolean;
  onPlaceOrder: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  orderType,
  setOrderType,
  orderSide,
  setOrderSide,
  orderDuration,
  setOrderDuration,
  quantity,
  setQuantity,
  price,
  setPrice,
  accountBalance,
  selectedStockHolding,
  calculateTotal,
  formatNumber,
  getMaxQuantity,
  adjustPriceByStep,
  getPriceStep,
  selectedStock,
  showPriceSteps,
  setShowPriceSteps,
  placing,
  onPlaceOrder
}) => {
  return (
    <div className="bg-white dark:bg-gray-900  mt-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-6">
      {/* Order Type & Side Row - Keep Original 3-Column Structure */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Select
          value={orderType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrderType(e.target.value)}
          className="text-xs py-2"
        >
          <option value="Зах зээлийн">Зах зээл</option>
          <option value="Нөхцөлт">Нөхцөлт</option>
        </Select>

        {/* Buy/Sell Toggle Buttons */}
        <div className="col-span-2 flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setOrderSide('BUY')}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              orderSide === 'BUY'
                ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            style={{
              filter: orderSide === 'BUY'
                ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.5))'
                : 'none'
            }}
          >
            АВАХ
          </button>
          <button
            onClick={() => setOrderSide('SELL')}
            className={`flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
              orderSide === 'SELL'
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            style={{
              filter: orderSide === 'SELL'
                ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'
                : 'none'
            }}
          >
            ЗАРАХ
          </button>
        </div>
      </div>

      {/* Order Duration */}
      <div className="mb-3">
        <Select
          value={orderDuration}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrderDuration(e.target.value)}
          className="w-full text-xs py-2"
        >
          <option value="GTC">Захиалга цуцлагдах хүртэл</option>
          <option value="DAY">Захиалга хийсэн өдөр</option>
          <option value="IOC">Заасан өдөр</option>
        </Select>
      </div>

      {/* Quantity Input */}
      <div className="mb-4 relative">
        <Input
          type="number"
          value={quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (value === '' || /^\d+$/.test(value)) {
              setQuantity(value);
            }
          }}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === '+') {
              e.preventDefault();
            }
          }}
          placeholder="Тоо ширхэг"
          className={`w-full ${quantity ? 'pr-16' : ''}`}
          min="1"
          max={getMaxQuantity()}
          step="1"
        />
        {quantity && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            ширхэг
          </span>
        )}
      </div>

      {/* Price Input for Limit Orders */}
      {orderType === 'Нөхцөлт' && (
        <div className="mb-4">
          <div className="grid grid-cols-[40px_1fr_40px] gap-1">
            <Button
              variant="secondary"
              onClick={() => setPrice(adjustPriceByStep(price, 'down'))}
              className="rounded h-[38px] flex items-center justify-center"
            >
              -
            </Button>
            <div className="relative w-full">
              <Input
                type="number"
                value={price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                placeholder="Үнэ"
                className={`w-full rounded ${price ? 'pr-8' : ''}`}
                step={selectedStock ? getPriceStep(selectedStock.PreviousClose || 0) : 0.01}
              />
              {price && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                  ₮
                </span>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => setPrice(adjustPriceByStep(price, 'up'))}
              className="rounded h-[38px] flex items-center justify-center"
            >
              +
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Алхам: {selectedStock ? getPriceStep(selectedStock.PreviousClose || 0) : 0.01}₮
            </span>
            <Button
              variant="secondary"
              onClick={() => setShowPriceSteps(!showPriceSteps)}
              className="px-2 py-1 text-xs"
            >
              Үнийн алхам
            </Button>
          </div>
        </div>
      )}

      {/* Balance & Total - Minimal */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400">Үлдэгдэл:</span>
          <span className="text-gray-900 dark:text-white">
            {orderSide === 'BUY' 
              ? (accountBalance !== null ? `${formatNumber(accountBalance)}₮` : '...')
              : `${selectedStockHolding?.quantity || 0} ширхэг`
            }
          </span>
        </div>
        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-700 dark:text-gray-300 font-medium">Нийт:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatNumber(calculateTotal())}₮
          </span>
        </div>
      </div>

      {/* Submit Button with Glow Effect */}
      <div className="relative mb-2">
        <Button
          variant={orderSide === 'BUY' ? 'success' : 'danger'}
          onClick={onPlaceOrder}
          disabled={placing || !quantity || (orderType === 'Нөхцөлт' && !price)}
          className={`relative w-full py-3 text-sm font-bold transition-all duration-200 transform hover:scale-[1.02] ${
            placing || !quantity || (orderType === 'Нөхцөлт' && !price)
              ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 transform-none'
              : ''
          }`}
          style={{
            filter: !(placing || !quantity || (orderType === 'Нөхцөлт' && !price))
              ? `drop-shadow(0 0 12px ${orderSide === 'BUY' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'})`
              : 'none',
            textShadow: !(placing || !quantity || (orderType === 'Нөхцөлт' && !price))
              ? `0 0 8px ${orderSide === 'BUY' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.8)'}, 0 0 16px ${orderSide === 'BUY' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
              : 'none'
          }}
        >
          {placing ? 'Захиалж байна...' : orderSide === 'BUY' ? 'АВАХ' : 'ЗАРАХ'}
        </Button>
      </div>
    </div>
  );
};