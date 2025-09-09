"use client";

import { ArrowLeft, ChevronDown } from 'lucide-react';
import { formatCurrency } from '@/utils/balanceUtils';
import type { NominalBalance } from '@/types/balance';

interface WithdrawalsPageProps {
  nominalBalance: NominalBalance | null;
  showBalance: boolean;
  onBack: () => void;
}

export default function WithdrawalsPage({
  nominalBalance,
  showBalance,
  onBack
}: WithdrawalsPageProps) {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Зарлага</h1>
        <div></div>
      </div>
      
      <div className="p-4">
        <div className="bg-bdsec dark:bg-indigo-600 text-white p-4 rounded-lg mb-6">
          <p className="text-sm opacity-90 mb-1">Номинал дансны үлдэгдэл</p>
          <p className="text-xl font-bold">
            {showBalance ? `${formatCurrency(nominalBalance?.balance || 0)} ${nominalBalance?.currency || 'MNT'}` : '***.**'}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 dark:text-white">Банкны данс</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-4 text-gray-900 dark:text-white">Мөнгөн дүн</div>
            <div className="p-4 text-gray-900 dark:text-white">Мөнгөн дүн (үсгээр)</div>
            <div className="p-4 text-gray-900 dark:text-white">Гүйлгээний утга (Заавал биш)</div>
          </div>
          
          <button className="w-full bg-bdsec dark:bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-bdsec/90">
            Мөнгөн дүн
          </button>
        </div>
      </div>
    </div>
  );
}