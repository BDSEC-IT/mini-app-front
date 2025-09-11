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
    <div className="bg-white dark:bg-gray-900  py-4 border-t border-gray-200 dark:border-gray-700">
      {/* Order Type & Side Row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Select
          value={orderType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrderType(e.target.value)}
          className="text-xs py-2"
        >
          <option value="Зах зээлийн">Зах зээлийн</option>
          <option value="Нөхцөлт">Нөхцөлт</option>
        </Select>
        <Button
          variant={orderSide === 'BUY' ? 'success' : 'secondary'}
          onClick={() => setOrderSide('BUY')}
          className="py-2 text-xs font-semibold transition-all duration-200 transform hover:scale-105"
        >
          Авах
        </Button>
        <Button
          variant={orderSide === 'SELL' ? 'danger' : 'secondary'}
          onClick={() => setOrderSide('SELL')}
          className="py-2 text-xs font-semibold transition-all duration-200 transform hover:scale-105"
        >
          Зарах
        </Button>
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
          <div className="flex items-center gap-2 relative">
            <Button
              variant="secondary"
              onClick={() => setPrice(adjustPriceByStep(price, 'down'))}
              className="px-3 py-2"
            >
              -
            </Button>
            <div className="flex-1 relative">
              <Input
                type="number"
                value={price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                placeholder="Үнэ"
                className={`flex-1 ${price ? 'pr-8' : ''}`}
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
              className="px-3 py-2"
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
              үнийн алхам
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

      {/* Submit Button */}
      <Button
        variant={orderSide === 'BUY' ? 'success' : 'danger'}
        onClick={onPlaceOrder}
        disabled={placing || !quantity || (orderType === 'Нөхцөлт' && !price)}
        className={`w-full py-3 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${
          placing || !quantity || (orderType === 'Нөхцөлт' && !price)
            ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400 transform-none'
            : ''
        }`}
      >
        {placing ? 'Захиалж байна...' : orderSide === 'BUY' ? 'АВАХ' : 'ЗАРАХ'}
      </Button>
    </div>
  );
};