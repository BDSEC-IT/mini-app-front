import React from 'react';

interface CompletedOrderEntry {
  mdentryTime: string;
  mdentryPx: number;
  mdentrySize: number;
}

interface CompletedOrdersProps {
  completedOrders: CompletedOrderEntry[];
}

export const CompletedOrders: React.FC<CompletedOrdersProps> = ({ completedOrders }) => {
  return (
    <div className="col-span-2 pl-2">
      <div className="text-xs font-medium h-10 text-center  place-content-center text-gray-600 dark:text-gray-400 mb-0 pb-0 border-b border-gray-200 dark:border-gray-700">
        Биелсэн захиалга
      </div>
      <div className="h-20 overflow-y-auto">
        {completedOrders.length > 0 ? completedOrders.map((trade, index) => (
          <div key={index} className="text-xs py-1 px-1 bg-gray-50 dark:bg-gray-800 rounded-lg mb-1">
            <div className="grid grid-cols-3 gap-1 text-xs text-center">
              <span className="text-gray-500 dark:text-gray-400">
                {trade.mdentryTime ? 
                  (trade.mdentryTime.includes(' ') ? 
                    trade.mdentryTime.split(' ')[1]?.slice(0,5) : 
                    trade.mdentryTime.slice(-8, -3)
                  ) : '--:--'
                }
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {trade.mdentryPx.toFixed(0)}₮
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {trade.mdentrySize}
              </span>
            </div>
          </div>
        )) : (
          <div className="text-xs text-gray-400 dark:text-gray-500 py-0 text-center">
            Арилжаа байхгүй
          </div>
        )}
      </div>
    </div>
  );
};