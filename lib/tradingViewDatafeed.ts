interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface HistoryCallback {
  bars: Bar[];
  meta: { noData: boolean };
}

interface SubscribeCallback {
  (bar: Bar): void;
}

interface StockData {
  Symbol: string;
  mnName: string;
  enName: string;
  OpeningPrice: number;
  HighPrice: number;
  LowPrice: number;
  LastTradedPrice: number;
  Volume: number;
  MDEntryTime: string;
}

interface ApiResponse {
  success: boolean;
  data: StockData | StockData[];
}

// Generate mock historical data
function generateMockData(symbol: string, days: number): Bar[] {
  const now = new Date();
  const bars: Bar[] = [];
  let lastClose = 1000; // Starting price

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(14, 0, 0, 0); // Set to 2 PM UB time

    // Generate realistic price movements
    const volatility = 0.02; // 2% daily volatility
    const change = lastClose * volatility * (Math.random() * 2 - 1);
    const open = lastClose + (Math.random() * change);
    const close = open + change;
    const high = Math.max(open, close) + (Math.random() * Math.abs(change));
    const low = Math.min(open, close) - (Math.random() * Math.abs(change));
    
    // Generate realistic volume
    const volume = Math.floor(Math.random() * 100000) + 50000;

    const bar: Bar = {
      time: date.getTime(),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: volume,
    };

    bars.push(bar);
    lastClose = close;
  }

  return bars;
}

class Datafeed {
  private lastBars = new Map<string, Bar>();
  private subscribers = new Map<string, SubscribeCallback>();
  private pollingIntervals = new Map<string, NodeJS.Timeout>();
  private historicalData = new Map<string, Bar[]>();

  async onReady() {
    return {
      supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'],
      supports_time: true,
      supports_marks: false,
      supports_timescale_marks: false,
    };
  }

  async searchSymbols(userInput: string) {
    try {
      const response = await fetch('https://miniapp.bdsec.mn/apitest/securities/trading-status');
      const data = await response.json() as ApiResponse;
      
      if (!data.success) return [];

      const symbols = Array.isArray(data.data) ? data.data : [data.data];
      
      return symbols
        .filter(symbol => 
          symbol.Symbol.toLowerCase().includes(userInput.toLowerCase()) ||
          symbol.mnName.toLowerCase().includes(userInput.toLowerCase()) ||
          symbol.enName.toLowerCase().includes(userInput.toLowerCase())
        )
        .map(symbol => ({
          symbol: `MSE:${symbol.Symbol}`,
          full_name: `MSE:${symbol.Symbol}`,
          description: symbol.mnName,
          exchange: 'MSE',
          type: 'stock',
        }));
    } catch (error) {
      console.error('Error searching symbols:', error);
      return [];
    }
  }

  async resolveSymbol(symbolName: string) {
    try {
      const symbol = symbolName.replace('MSE:', '');
      const response = await fetch(`https://miniapp.bdsec.mn/apitest/securities/trading-status/${symbol}`);
      const data = await response.json() as ApiResponse;
      
      if (!data.success || Array.isArray(data.data)) throw new Error('Symbol not found');

      const stockData = data.data as StockData;

      return {
        name: symbolName,
        full_name: symbolName,
        description: stockData.mnName,
        type: 'stock',
        session: '0930-1700',
        timezone: 'Asia/Ulaanbaatar',
        exchange: 'MSE',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'],
        data_status: 'streaming',
      };
    } catch (error) {
      console.error('Error resolving symbol:', error);
      throw new Error('Symbol not found');
    }
  }

  async getBars(symbolInfo: any, resolution: string, periodParams: any) {
    try {
      const symbol = symbolInfo.name.replace('MSE:', '');
      
      // Generate or retrieve historical data
      if (!this.historicalData.has(symbol)) {
        this.historicalData.set(symbol, generateMockData(symbol, 365)); // 1 year of data
      }
      
      const allBars = this.historicalData.get(symbol) || [];
      
      // Filter bars based on time range
      const bars = allBars.filter(bar => 
        bar.time >= periodParams.from * 1000 && 
        bar.time <= periodParams.to * 1000
      );

      if (bars.length === 0) {
        return {
          bars: [],
          meta: { noData: true },
        };
      }

      // Store the last bar for real-time updates
      this.lastBars.set(symbol, bars[bars.length - 1]);

      return {
        bars,
        meta: { noData: false },
      };
    } catch (error) {
      console.error('Error fetching bars:', error);
      return {
        bars: [],
        meta: { noData: true },
      };
    }
  }

  subscribeBars(symbolInfo: any, resolution: string, onRealtimeCallback: SubscribeCallback) {
    const symbol = symbolInfo.name.replace('MSE:', '');
    this.subscribers.set(symbol, onRealtimeCallback);

    // Clear existing polling interval if any
    const existingInterval = this.pollingIntervals.get(symbol);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Start new polling
    this.startPolling(symbol, onRealtimeCallback);
  }

  unsubscribeBars(subscriberUID: string) {
    const symbol = subscriberUID.replace('MSE:', '');
    this.subscribers.delete(symbol);
    
    // Clear polling interval
    const interval = this.pollingIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(symbol);
    }

    // Clean up last bar data
    this.lastBars.delete(symbol);
  }

  private startPolling(symbol: string, callback: SubscribeCallback) {
    const pollInterval = 5000; // Poll every 5 seconds

    const poll = async () => {
      if (!this.subscribers.has(symbol)) return;

      try {
        const lastBar = this.lastBars.get(symbol);
        if (!lastBar) return;

        // Generate a new realistic bar based on the last one
        const change = lastBar.close * 0.002 * (Math.random() * 2 - 1); // 0.2% max change
        const newClose = Number((lastBar.close + change).toFixed(2));
        const newHigh = Math.max(lastBar.high, newClose);
        const newLow = Math.min(lastBar.low, newClose);
        const newVolume = lastBar.volume + Math.floor(Math.random() * 1000);

        const newBar: Bar = {
          ...lastBar,
          high: newHigh,
          low: newLow,
          close: newClose,
          volume: newVolume,
        };

        this.lastBars.set(symbol, newBar);
        callback(newBar);

        // Update historical data
        const historicalBars = this.historicalData.get(symbol) || [];
        historicalBars[historicalBars.length - 1] = newBar;
        this.historicalData.set(symbol, historicalBars);
      } catch (error) {
        console.error('Error polling data:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval and store it
    const interval = setInterval(poll, pollInterval);
    this.pollingIntervals.set(symbol, interval);
  }
}

export const datafeed = new Datafeed(); 