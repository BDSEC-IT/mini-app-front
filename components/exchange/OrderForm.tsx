import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from '../ui';

type OrderSide = 'BUY' | 'SELL';

interface OrderFormProps {
  orderType: string;
  setOrderType: (type: string) => void;
  orderSide: OrderSide;
  setOrderSide: (side: OrderSide) => void;
  orderDuration: string;
  setOrderDuration: (duration: string) => void;
  expireDate: string;
  setExpireDate: (date: string) => void;
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
  feeEquity: string | null;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  orderType,
  setOrderType,
  orderSide,
  setOrderSide,
  orderDuration,
  setOrderDuration,
  expireDate,
  setExpireDate,
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
  onPlaceOrder,
  feeEquity
}) => {
  const { t } = useTranslation('common');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  
  // Helper function to validate and round price to nearest valid step
  const validateAndRoundPrice = (inputValue: string): string => {
    if (!inputValue || inputValue === '') return '';
    
    const numericValue = parseFloat(inputValue);
    if (isNaN(numericValue) || numericValue <= 0) return '';
    
    // Get the appropriate price step for this value
    const step = getPriceStep(numericValue);
    
    // Round to nearest valid step
    const roundedValue = Math.round(numericValue / step) * step;
    
    // Format based on step size
    if (step >= 1) {
      return roundedValue.toString();
    } else {
      return roundedValue.toFixed(2);
    }
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '' || inputValue === '.') {
      setPrice(inputValue);
      return;
    }
    
    // Only allow numbers with up to 2 decimal places
    const regex = /^\d*\.?\d{0,2}$/;
    if (regex.test(inputValue)) {
      setPrice(inputValue);
    }
  };
  
  const handlePriceBlur = () => {
    // Validate and round when user leaves the input field
    const validatedPrice = validateAndRoundPrice(price);
    setPrice(validatedPrice);
  };
  
  // Calculate min and max dates for date picker (today to 30 days from now)
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateString = maxDate.toISOString().split('T')[0];
  
  // Generate array of available dates for mobile picker
  const generateDateOptions = () => {
    const dates = [];
    const current = new Date();
    for (let i = 0; i <= 30; i++) {
      const date = new Date(current);
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('mn-MN', { 
          month: 'short', 
          day: 'numeric',
          weekday: 'short'
        })
      });
    }
    return dates;
  };
  
  const dateOptions = generateDateOptions();
  return (
    <div className="bg-white dark:bg-gray-900  mt-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-6">
      {/* Order Type & Side Row - Keep Original 3-Column Structure */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <Select
          value={orderType}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setOrderType(e.target.value)}
          className="text-xs py-2"
        >
          <option value="Зах зээлийн">{t('exchange.market', 'Зах зээл')}</option>
          <option value="Нөхцөлт">{t('exchange.limit', 'Нөхцөлт')}</option>
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
            {t('exchange.buy', 'АВАХ')}
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
            {t('exchange.sell', 'ЗАРАХ')}
          </button>
        </div>
      </div>

      {/* Order Duration */}
      <div className="mb-3">
        <Select
          value={orderDuration}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setOrderDuration(e.target.value);
            // Clear expireDate when switching away from GTD
            if (e.target.value !== 'GTD') {
              setExpireDate('');
              setShowDatePicker(false);
            }
          }}
          className="w-full text-xs py-2"
        >
          <option value="GTC">{t('exchange.gtc', 'Захиалга цуцлагдах хүртэл (GTC)')}</option>
          <option value="DAY">{t('exchange.day', 'Өдрийн захиалга (DAY)')}</option>
          <option value="GTD">{t('exchange.gtd', 'Заасан өдөр (GTD)')}</option>
        </Select>
      </div>

      {/* Mobile-Friendly Date Picker for GTD orders */}
      {orderDuration === 'GTD' && (
        <div className="mb-3">
          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
            {t('exchange.expireDate', 'Захиалга дуусах огноо')}
          </label>
          
          {/* Enhanced mobile-friendly date input with larger touch target */}
          <Input
            type="date"
            value={expireDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpireDate(e.target.value)}
            min={minDate}
            max={maxDateString}
            className="w-full text-sm py-3 px-4"
            style={{
              minHeight: '44px', // iOS recommended minimum touch target
              fontSize: '16px', // Prevents iOS zoom on focus
            }}
            placeholder={t('exchange.selectDate', 'Огноо сонгох')}
          />
          
          {expireDate && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('exchange.orderActiveUntil', { 
                date: new Date(expireDate).toLocaleDateString('mn-MN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })
              })}
            </p>
          )}
        </div>
      )}

      {/* Quantity Input with Balance Display on Top */}
      <div className="mb-4">
        {/* Balance Display - Above Quantity */}
        <div className="mb-2 flex justify-between items-center px-1">
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {t('exchange.balance')}:
          </span>
          <span className="text-sm text-gray-900 dark:text-white font-bold">
            {orderSide === 'BUY'
              ? (accountBalance !== null ? `${formatNumber(accountBalance)}₮` : '...')
              : `${selectedStockHolding?.quantity || 0} ${t('exchange.shares')}`
            }
          </span>
        </div>
        
        {/* Quantity Input */}
        <div className="relative">
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
            placeholder={t('exchange.quantity', 'Тоо ширхэг')}
            className={`w-full ${quantity ? 'pr-16' : ''}`}
            min="1"
            max={getMaxQuantity()}
            step="1"
          />
          {quantity && (
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
              {t('exchange.shares', 'ширхэг')}
            </span>
          )}
        </div>
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
                onChange={handlePriceChange}
                onBlur={handlePriceBlur}
                placeholder={t('exchange.price')}
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
              {t('exchange.step')}: {selectedStock ? getPriceStep(selectedStock.PreviousClose || 0) : 0.01}₮
            </span>
            <Button
              variant="secondary"
              onClick={() => setShowPriceSteps(!showPriceSteps)}
              className="px-2 py-1 text-xs"
            >
              {t('exchange.priceStep')}
            </Button>
          </div>
        </div>
      )}

      {/* Total Summary with Color Styling */}
      <div className="mb-3">
        {/* <div className="flex justify-between text-sm items-center mb-2">
          <span className="text-gray-700 dark:text-gray-300 font-medium">{t('exchange.total')}:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatNumber(calculateTotal())}₮
          </span>
        </div> */}
        {feeEquity && (
          <>
            <div className="flex justify-between text-xs py-1 border-t border-gray-200 dark:border-gray-700">
              <span className="text-blue-700 dark:text-blue-400 font-medium">
                {t('exchange.tradingFee', 'Шимтгэл')}:
              </span>
              <span className="text-blue-700 dark:text-blue-400 font-semibold">
                {feeEquity}%
              </span>
            </div>
            <div className="flex justify-between text-sm items-center mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
              <span className="text-blue-700 dark:text-blue-400 font-bold">
                {t('exchange.netTotal', 'Шимтгэл тооцсон нийт дүн')}:
              </span>
              <span className="text-blue-800 dark:text-blue-300 font-bold">
                {formatNumber(calculateTotal())}₮
              </span>
            </div>
          </>
        )}
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
          {placing ? t('exchange.placing', 'Захиалж байна...') : orderSide === 'BUY' ? t('exchange.buy', 'АВАХ') : t('exchange.sell', 'ЗАРАХ')}
        </Button>
      </div>
    </div>
  );
};