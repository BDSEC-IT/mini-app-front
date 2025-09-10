'use client';

import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const priceSteps = [
  { range: '1000-с доош', step: '0.01 төгрөг' },
  { range: '1000-5000', step: '1 төгрөг' },
  { range: '5000-10000', step: '5 төгрөг' },
  { range: '10000-20000', step: '10 төгрөг' },
  { range: '20000-40000', step: '20 төгрөг' },
  { range: '40000-50000', step: '40 төгрөг' },
  { range: '50000-80000', step: '50 төгрөг' },
  { range: '80000-100000', step: '80 төгрөг' },
];

interface PriceStepsProps {
  onBack: () => void;
}

export default function PriceSteps({ onBack }: PriceStepsProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mr-3"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Үнийн алхам
          </h1>
        </div>
      </div>

      {/* Price Steps Table */}
      <div className="bg-white dark:bg-gray-800">
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Нэгжийн үнэ
              </h3>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Өөрчлөлтийн хэмжээ
              </h3>
            </div>
          </div>

          <div className="space-y-1">
            {priceSteps.map((step, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="text-center text-gray-800 dark:text-gray-200">
                  {step.range}
                </div>
                <div className="text-center text-gray-800 dark:text-gray-200">
                  {step.step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}