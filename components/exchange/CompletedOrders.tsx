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
    <div className="col-span-2 bg-gray-50 dark:bg-gray-800/30 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <div className="text-xs font-medium h-10 text-center place-content-center text-gray-600 dark:text-gray-300 mb-2 pb-0">
        Биелсэн захиалга
      </div>
      <div className={`${completedOrders.length > 3 ? 'max-h-24 overflow-y-auto' : ''} space-y-1`}>
        {completedOrders.length > 0 ? completedOrders.map((trade, index) => (
          <div key={index} className="text-xs py-2 px-2 bg-white dark:bg-gray-700/50 rounded-lg">
            <div className="grid grid-cols-3 gap-1 text-xs text-center">
              <span className="text-gray-500 dark:text-gray-300">
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
              <span className="text-gray-600 dark:text-gray-300">
                {trade.mdentrySize}
              </span>
            </div>
          </div>
        )) : (
          <div className="text-xs text-gray-500 dark:text-gray-400 py-4 text-center">
            Арилжаа байхгүй
          </div>
        )}
      </div>
    </div>
  );
};