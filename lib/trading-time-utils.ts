/**
 * Trading time utilities for determining which stocks to display based on trading hours and days
 * Only applies to stocks, not bonds (bonds are rarely traded)
 */

/**
 * Check if MDEntryTime is from today (fresh trading data)
 * @param mdEntryTime The MDEntryTime from stock data
 * @returns true if the data is from today
 */
export function isTodaysFreshData(mdEntryTime: string | undefined): boolean {
  if (!mdEntryTime) {
    return false;
  }
  
  try {
    const entryDate = new Date(mdEntryTime);
    const today = new Date();
    
    // Check if it's the same date (ignore time)
    const isFresh = (
      entryDate.getFullYear() === today.getFullYear() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getDate() === today.getDate()
    );
    return isFresh;
  } catch (error) {
    return false;
  }
}

/**
 * Filter stocks to show only today's fresh trading data OR stocks with valid order book data
 * @param stocks Array of stock data
 * @returns Stocks with today's fresh data or active trading data
 */
export function filterTodaysFreshStocks<T extends { MDEntryTime?: string; Symbol: string; PreviousClose?: number; HighestBidPrice?: number; LowestOfferPrice?: number }>(stocks: T[]): T[] {
  return stocks.filter(stock => {
    // Always show bonds regardless of date
    const isBond = stock.Symbol?.toUpperCase().includes('-BD');
    if (isBond) return true;
    
    // For stocks, show if:
    // 1. It has today's fresh data, OR
    // 2. It has active order book data (bid/ask prices), OR
    // 3. It has a valid previous close price
    const hasFreshData = isTodaysFreshData(stock.MDEntryTime);
    const hasOrderBookData = (stock.HighestBidPrice && stock.HighestBidPrice > 0) || 
                            (stock.LowestOfferPrice && stock.LowestOfferPrice > 0);
    const hasValidPrice = stock.PreviousClose && stock.PreviousClose > 0;
    
    return hasFreshData || hasOrderBookData || hasValidPrice;
  });
}

export interface TradingTimeConfig {
  // Trading hours in 24-hour format (Mongolia time)
  startTime: { hour: number; minute: number };
  endTime: { hour: number; minute: number };
  // Trading days (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  tradingDays: number[];
}

// Default Mongolia Stock Exchange trading hours
export const DEFAULT_TRADING_CONFIG: TradingTimeConfig = {
  startTime: { hour: 9, minute: 30 }, // 9:30 AM
  endTime: { hour: 16, minute: 0 },   // 4:00 PM
  tradingDays: [1, 2, 3, 4, 5] // Monday to Friday
};

/**
 * Get the target date for filtering stocks based on current time and trading schedule
 * @param now Current date/time
 * @param config Trading time configuration
 * @returns Target date string in YYYY-MM-DD format
 */
export function getStockFilterDate(
  now: Date = new Date(), 
  config: TradingTimeConfig = DEFAULT_TRADING_CONFIG
): string {
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Convert current time to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const tradingStartMinutes = config.startTime.hour * 60 + config.startTime.minute;
  const tradingEndMinutes = config.endTime.hour * 60 + config.endTime.minute;
  
  // Check if today is a trading day
  const isTradingDay = config.tradingDays.includes(currentDay);
  
  // Check if we're in trading hours
  const isDuringTradingHours = currentTimeInMinutes >= tradingStartMinutes && 
                               currentTimeInMinutes <= tradingEndMinutes;
  
  if (isTradingDay) {
    if (isDuringTradingHours) {
      // During trading hours: Show today's stocks
      return formatDate(now);
    } else if (currentTimeInMinutes > tradingEndMinutes) {
      // After trading hours (same day): Show that day's stocks
      return formatDate(now);
    } else {
      // Before trading hours: Show yesterday's stocks
      return formatDate(getPreviousTradingDay(now, config));
    }
  } else {
    // Weekend or non-trading day
    if (currentDay === 0) { // Sunday
      // Sunday: Show Friday's stocks
      return formatDate(getFridayFromSunday(now));
    } else if (currentDay === 6) { // Saturday  
      // Saturday: Show Friday's stocks
      return formatDate(getFridayFromSaturday(now));
    } else if (currentDay === 1) { // Monday (if it's not a trading day due to holiday)
      if (currentTimeInMinutes < tradingStartMinutes) {
        // Monday before trading: Show last Friday's stocks
        return formatDate(getLastFriday(now));
      } else {
        // Monday during/after trading hours: Show today's stocks
        return formatDate(now);
      }
    } else {
      // Other non-trading days: Show last trading day
      return formatDate(getPreviousTradingDay(now, config));
    }
  }
}

/**
 * Get the previous trading day
 */
function getPreviousTradingDay(date: Date, config: TradingTimeConfig): Date {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  
  // Keep going back until we find a trading day
  while (!config.tradingDays.includes(previous.getDay())) {
    previous.setDate(previous.getDate() - 1);
  }
  
  return previous;
}

/**
 * Get Friday from Sunday
 */
function getFridayFromSunday(sunday: Date): Date {
  const friday = new Date(sunday);
  friday.setDate(friday.getDate() - 2); // Sunday - 2 days = Friday
  return friday;
}

/**
 * Get Friday from Saturday
 */
function getFridayFromSaturday(saturday: Date): Date {
  const friday = new Date(saturday);
  friday.setDate(friday.getDate() - 1); // Saturday - 1 day = Friday
  return friday;
}

/**
 * Get last Friday from any day
 */
function getLastFriday(date: Date): Date {
  const lastFriday = new Date(date);
  const daysSinceLastFriday = (lastFriday.getDay() + 2) % 7; // Calculate days since last Friday
  lastFriday.setDate(lastFriday.getDate() - daysSinceLastFriday);
  return lastFriday;
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Check if current time is during trading hours
 */
export function isDuringTradingHours(
  now: Date = new Date(),
  config: TradingTimeConfig = DEFAULT_TRADING_CONFIG
): boolean {
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const tradingStartMinutes = config.startTime.hour * 60 + config.startTime.minute;
  const tradingEndMinutes = config.endTime.hour * 60 + config.endTime.minute;
  
  const isTradingDay = config.tradingDays.includes(currentDay);
  const isInTradingHours = currentTimeInMinutes >= tradingStartMinutes && 
                          currentTimeInMinutes <= tradingEndMinutes;
  
  return isTradingDay && isInTradingHours;
}

/**
 * Check if a stock should be displayed based on its MDEntryTime
 * Only applies to stocks, not bonds
 */
export function shouldDisplayStock(
  stockMDEntryTime: string,
  targetDate: string,
  isBond: boolean = false
): boolean {
  // For both stocks and bonds, check if MDEntryTime matches the target date
  if (!stockMDEntryTime) {
    return false;
  }

  const stockDate = stockMDEntryTime.slice(0, 10); // Extract YYYY-MM-DD part
  return stockDate === targetDate;
}

/**
 * Get a human-readable description of what time period we're showing
 * Returns date in YYYY.MM.DD format
 */
export function getDisplayPeriodDescription(
  now: Date = new Date(),
  config: TradingTimeConfig = DEFAULT_TRADING_CONFIG
): string {
  const targetDate = getStockFilterDate(now, config);
  
  // Convert YYYY-MM-DD to YYYY.MM.DD format
  return targetDate.replace(/-/g, '.');
}