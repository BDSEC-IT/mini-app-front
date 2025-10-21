"use client";

import { ChevronDown, Download, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/utils/balanceUtils';
import InfoTooltip from '@/components/ui/InfoTooltip';
import type { BalanceType, PageType } from '@/types/balance';

interface BalanceNavigationProps {
  balanceType: BalanceType;
  securitiesValue: number;
  showBalance: boolean;
  onBalanceTypeChange: (type: BalanceType) => void;
  onPageChange: (page: PageType) => void;
}

export default function BalanceNavigation({
  balanceType,
  securitiesValue,
  showBalance,
  onBalanceTypeChange,
  onPageChange
}: BalanceNavigationProps) {
  const router = useRouter();
  // Get tooltip content based on selected type
  const getTooltipContent = (type: BalanceType) => {
    switch (type) {
      case 'securities':
        return 'Таны эзэмшиж буй үнэт цаасны жагсаалт';
      case 'nominal':
        return 'Таны арилжаанд ашиглах боломжтой бэлэн мөнгө';
      case 'fund':
        return 'Үнэт цаасны төвлөрсөн хадгаламж дахь таны мөнгөн хөрөнгө';
      default:
        return '';
    }
  };

  return (
    <div className="flex justify-between items-center space-x-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 flex items-center gap-2">
        <div className="relative">
          <select
            value={balanceType}
            onChange={(e) => onBalanceTypeChange(e.target.value as BalanceType)}
            className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 pr-7 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-bdsec"
          >
            <option value="securities">Үнэт цаас</option>
            <option value="nominal">Номинал</option>
            <option value="fund">ҮЦТХТ</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
        <InfoTooltip 
          content={getTooltipContent(balanceType)}
          position="bottom"
          iconSize="sm"
        />
      </div>
      
      {balanceType === 'securities' ? (
        <div className="ml-auto text-right">
          <div className="text-xs text-gray-400">Үнэт цаасны үнэлгээ</div>
          <div className="text-lg font-bold">{showBalance ? formatCurrency(securitiesValue) : '***,***.**'}</div>
        </div>
      ) : balanceType === 'nominal' ? (
        <div className='flex gap-x-2 flex-shrink-0'>
          <button 
            onClick={() => router.push('/balance/history?type=cash')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Хуулга</span>
          </button>
        </div>
      ) : (
        // ҮЦТХТ tab - no buttons
        <div className="ml-auto"></div>
      )}
    </div>
  );
}