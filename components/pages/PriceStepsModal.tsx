'use client';

import React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PriceStepsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function PriceStepsModal({ isOpen, onClose }: PriceStepsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50">
      <div className="max-w-md mx-auto min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center px-4 py-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg mr-3"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Үнийн алхам
          </h1>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b border-gray-200">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700">
                Нэгжийн үнэ
              </h3>
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700">
                Өөрчлөлтийн хэмжээ
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {priceSteps.map((step, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-4 py-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="text-center text-gray-800">
                  {step.range}
                </div>
                <div className="text-center text-gray-800">
                  {step.step}
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Тайлбар:</h4>
            <p className="text-sm text-blue-800">
              Үнийн алхам нь тухайн үнийн хязгаарт захиалгын үнийг өөрчлөх боломжтой хамгийн бага хэмжээг харуулдаг.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}