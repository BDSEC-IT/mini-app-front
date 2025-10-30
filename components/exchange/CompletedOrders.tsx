import React from 'react';
import { useTranslation } from 'react-i18next';

interface CompletedOrderEntry {
  mdentryTime: string;
  mdentryPx: number;
  mdentrySize: number;
}

interface CompletedOrdersProps {
  completedOrders: CompletedOrderEntry[];
}

export const CompletedOrders: React.FC<CompletedOrdersProps> = ({ completedOrders }) => {
  const { t } = useTranslation('common');
  
  return (
    <div className="col-span-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-1.5 border border-gray-200 dark:border-gray-700">
      <div className="text-[10px] font-medium h-6 text-center text-gray-600 dark:text-gray-300">
        {t('exchange.completedTrades', 'Биелсэн захиалга')}
      </div>
      <div className={`${completedOrders.length > 3 ? 'max-h-[88px] overflow-y-auto' : ''} space-y-0.5`}>
        {completedOrders.length > 0 ? completedOrders.map((trade, index) => (
          <div key={index} className="text-[10px] py-1 bg-white dark:bg-gray-700/50 rounded">
            <div className="grid grid-cols-[minmax(20px,auto)_1fr_minmax(30px,auto)] gap-x-[2px] items-center">
              {/* Quantity - takes minimum space needed */}
              <span className="text-gray-600 dark:text-gray-300 text-left tabular-nums">
                {trade.mdentrySize}
              </span>
           
              {/* Price - takes remaining space, centered */}
              <span className="font-medium text-gray-900 dark:text-gray-100 text-center tabular-nums">
                {trade.mdentryPx.toFixed(2)}₮
              </span>
              
              {/* Time - fixed width for consistency */}
              <span className="text-gray-500 dark:text-gray-300 text-right tabular-nums">
                {trade.mdentryTime ? 
                  (trade.mdentryTime.includes(' ') ? 
                    trade.mdentryTime.split(' ')[1]?.slice(0,5) : 
                    trade.mdentryTime.slice(-8, -3)
                  ) : '--:--'
                }
              </span>
            </div>
          </div>
        )) : (
          <div className="text-[10px] text-gray-500 dark:text-gray-400 py-2 text-center">
            {t('exchange.noTrades', 'Арилжаа байхгүй')}
          </div>
        )}
      </div>
    </div>
  );
};