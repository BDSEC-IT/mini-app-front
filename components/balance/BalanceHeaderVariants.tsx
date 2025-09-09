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
  variant?: 'gradient' | 'mesh' | 'glass' | 'aurora' | 'neon' | 'cosmic';
}

export default function BalanceHeaderVariants({
  totalBalance,
  nominalBalance,
  showBalance,
  loadingNominal,
  onToggleBalance,
  variant = 'gradient'
}: BalanceHeaderProps) {
  const { t } = useTranslation();

  const renderBackground = () => {
    switch (variant) {
      case 'gradient':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-700 animate-gradient-x"></div>
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
              <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping delay-500"></div>
            </div>
          </>
        );
      
      case 'mesh':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-blue-600 via-violet-600 to-indigo-700 opacity-80"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/5 to-transparent"></div>
          </>
        );
      
      case 'glass':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 via-purple-600/70 to-blue-700/80"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/20"></div>
            <div className="absolute inset-0 bg-noise opacity-10"></div>
          </>
        );
      
      case 'aurora':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-500/30 to-transparent animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-blue-500/20 to-transparent animate-pulse delay-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent animate-pulse delay-2000"></div>
          </>
        );
      
      case 'neon':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(147,51,234,0.3)]"></div>
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-60"></div>
          </>
        );
      
      case 'cosmic':
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
            <div className="absolute inset-0 opacity-50">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-1 h-1 bg-white rounded-full animate-pulse`}
                  style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse"></div>
          </>
        );
      
      default:
        return <div className="absolute inset-0 bg-bdsec dark:bg-indigo-600"></div>;
    }
  };

  return (
    <div className="relative overflow-hidden p-4 rounded-xl m-4 text-white">
      {renderBackground()}
      
      {/* Content container with higher z-index */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div>
          <p className="text-sm opacity-90">{t('balance.totalAssets')}</p>
          {loadingNominal ? (
            <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold">
              {showBalance ? formatCurrency(totalBalance) : '***.**'}
            </p>
          )}
          <div className="mt-2">
            <p className="text-xs opacity-75">{t('balance.nominalBalance')}</p>
            {loadingNominal ? (
              <div className="h-5 bg-white/20 rounded w-24 animate-pulse"></div>
            ) : (
              <p className="text-sm font-medium">
                {showBalance ? formatCurrency(nominalBalance?.balance || 0) : '***.**'} ₮
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggleBalance}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            {showBalance ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}