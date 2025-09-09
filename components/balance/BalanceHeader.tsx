"use client";

import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/balanceUtils';
import type { NominalBalance } from '@/types/balance';

interface BalanceHeaderProps {
  totalBalance: number;
  nominalBalance: NominalBalance | null;
  showBalance: boolean;
  loadingNominal: boolean;
  onToggleBalance: () => void;
}

export default function BalanceHeader({
  totalBalance,
  nominalBalance,
  showBalance,
  loadingNominal,
  onToggleBalance
}: BalanceHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden p-6 rounded-xl m-4 text-white">
      {/* Aurora Effect Background - Indigo/Blue Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/30 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-500/25 to-transparent animate-pulse delay-1000"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bdsec/15 to-transparent animate-pulse delay-2000"></div>
      
      {/* Animated particles - Blue/Indigo Theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-blue-400/60 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-indigo-400/50 rounded-full animate-ping delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-sky-400/40 rounded-full animate-pulse delay-1500"></div>
        <div className="absolute top-2/3 left-1/2 w-1 h-1 bg-cyan-300/30 rounded-full animate-ping delay-2500"></div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 flex items-center justify-between mb-3 text-white">
        <div>
          <p className="text-sm opacity-90">{t('balance.totalAssets')}</p>
          {loadingNominal ? (
            <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold drop-shadow-sm">
              {showBalance ? formatCurrency(totalBalance) : '***.**'}
            </p>
          )}
          <div className="mt-2">
            <p className="text-xs opacity-75">{t('balance.nominalBalance')}</p>
            {loadingNominal ? (
              <div className="h-5 bg-white/20 rounded w-24 animate-pulse"></div>
            ) : (
              <p className="text-sm font-medium drop-shadow-sm">
                {showBalance ? formatCurrency(nominalBalance?.balance || 0) : '***.**'} ₮
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleBalance}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm border border-white/20 hover:border-white/40"
          >
            {showBalance ? (
              <Eye className="w-5 h-5 drop-shadow-sm" />
            ) : (
              <EyeOff className="w-5 h-5 drop-shadow-sm" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}