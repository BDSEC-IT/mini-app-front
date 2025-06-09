import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { getTranslations } from 'next-intl/server';
function isWithinTradingHours(key: string): boolean {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTime = currentHours * 60 + currentMinutes; // Convert to minutes for easy comparison
  const dayOfWeek = now.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false; // No trading on weekends
  }
  // Define the trading time intervals
  const intervals: { [key: string]: { start: number; end: number } } = {
    mse: { start: 10 * 60, end: 13 * 60 }, // 10:00 - 13:00
    otc: { start: 10 * 60, end: 17 * 60 }, // 10:00 - 17:00
    ubx: { start: 9 * 60 + 30, end: 15 * 60 }, // 09:30 - 15:00
    chex: { start: 10 * 60, end: 13 * 60 } // Default chex
  };

  // Use the provided key, or default to 'chex' if not found
  const { start, end } = intervals[key] || intervals.chex;
  return currentTime >= start && currentTime <= end;
}

export default async function TradingTime({
  tradingKey
}: {
  tradingKey: string;
}) {
  const isOpen = isWithinTradingHours(tradingKey);

  const tradingHours: { [key: string]: string } = {
    mse: '10:00 - 13:00',
    otc: '10:00 - 17:00',
    ubx: '09:30 - 15:00',
    chex: '10:00 - 13:00' // Default display
  };

  const tradingHoursText = tradingHours[tradingKey] || tradingHours.chex;
  const t = await getTranslations('overview');
  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p className={` text-xs`}>
              {t('tradingtime')}{' '}
              <span
                className={` ${isOpen ? 'text-green-500' : 'text-red-500'}`}
              >
                {tradingHoursText}
              </span>
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isOpen ? t('tradingtimeOpen') : t('tradingtimeClose')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
