interface StockData {
  pkId: number;
  id: number;
  Symbol: string;
  mnName: string;
  enName: string;
  Volume: number;
  Turnover: number;
  MDSubOrderBookType: string;
  LastTradedPrice: number;
  PreviousClose: number;
  ClosingPrice: number;
  OpeningPrice: number;
  Changes: number;
  Changep: number;
  VWAP: number;
  MDEntryTime: string;
  trades: number;
  HighPrice: number;
  LowPrice: number;
  MarketSegmentID: string;
  sizemd: string;
  MDEntryPx: number;
  sizemd2: string;
  MDEntryPx2: number;
  HighestBidPrice: number;
  LowestOfferPrice: number;
  AuctionClearingPrice: number;
  Imbalance: number;
  BuyOrderVWAP: number;
  SellOrderVWAP: number;
  BuyOrderQty: number;
  SellOrderQty: number;
  OpenIndicator: string;
  CloseIndicator: string;
  TradeCondition: string;
  securityType: string;
  dates: string;
  createdAt: string;
  updatedAt: string;
  BestBidPx?: number; // For backward compatibility
  BestOfferPx?: number; // For backward compatibility
  category?: string; // Stock category (I, II, III)
}

interface BondData {
  pkId: number;
  id: number;
  Symbol: string;
  BondmnName: string;
  BondenName: string;
  Issuer: string;
  IssuerEn: string;
  Interest: string;
  Date: string;
  NominalValue: number;
  mnInterestConditions: string;
  enInterestConditions: string;
  MoreInfo: string;
  updatedAt: string;
  TradedDate: string;
  RefundDate: string;
  Isdollar: string | null;
  createdAt: string;
}

interface WeekHighLowData {
  Symbol: string;
  trade_count: number;
  mnTitle: string;
  enTitle: string;
  avg_52_week_closing_price: number;
  "52low": number;
  "52high": number;
  last_closing_date: string;
  last_closing_price: number;
}

// Type guard to check if a key is '52high' or '52low'
function is52WeekKey(key: string): key is "52high" | "52low" {
  return key === "52high" || key === "52low";
}

interface OrderBookEntry {
  id: number;
  Symbol: string;
  MDSubOrderBookType: string;
  MDEntryType: string; // "0" for buy, "1" for sell
  MDEntryPositionNo: number;
  MDEntryID: string;
  MDEntryPx: number;
  MDEntrySize: number;
  NumberOfOrders: number | null;
  MDPriceLevel: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: StockData | StockData[];
}

interface OrderBookResponse {
  status: boolean;
  data: OrderBookEntry[];
}

interface AllStocksResponse {
  success: boolean;
  data: StockData[];
}

interface BondsResponse {
  success: boolean;
  data: BondData[];
}

interface WeekHighLowResponse {
  success: boolean;
  data: WeekHighLowData[];
}

interface TradingHistoryResponse {
  success: boolean;
  data: TradingHistoryData[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

interface TradingHistoryData {
  id: number;
  Symbol: string;
  MDSubOrderBookType: string;
  OpeningPrice: number;
  ClosingPrice: number;
  HighPrice: number;
  LowPrice: number;
  VWAP: number;
  Volume: number;
  HighestBidPrice: number;
  LowestOfferPrice: number;
  PreviousClose: number;
  BuyOrderQty: number;
  SellOrderQty: number;
  Turnover: number;
  Trades: number;
  MDEntryTime: string;
  companycode: number;
  MarketSegmentID: string;
  securityType: string;
  dates: string;
}

// Helper function to create a fetch request with timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  // Create an abort controller with a timeout
  const controller = new AbortController()
  const signal = controller.signal
  
  // Create a separate timeout promise
  const timeout = new Promise<never>((_, reject) => {
    // Use a named function for the timeout callback
    const id = setTimeout(() => {
      // Clear the timeout to prevent memory leaks
      clearTimeout(id)
      // Create a custom error instead of using abort()
      const error = new Error('Request timed out')
      error.name = 'TimeoutError'
      reject(error)
    }, 10000) // 10 second timeout
    
    // Add an abort listener to clear the timeout if aborted elsewhere
    signal.addEventListener('abort', () => clearTimeout(id))
  })
  
  try {
    // Race between the fetch and the timeout
    return await Promise.race([
      fetch(url, { 
        ...options,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        signal
      }),
      timeout
    ]) as Response
  } catch (error) {
    if ((error as Error).name === 'TimeoutError') {
      console.log('Request timed out')
      // Only abort the controller if it's a timeout
      controller.abort()
    } else if ((error as Error).name === 'AbortError') {
      console.log('Request was aborted')
    }
    throw error
  }
}

// Generate mock stock data
function generateMockStockData(symbol?: string): StockData[] {
  // If a specific symbol is requested, return just that one
  if (symbol) {
    const symbolBase = symbol.split('-')[0]
    return [createMockStock(symbolBase)]
  }
  
  // Otherwise return a list of mock stocks
  const mockSymbols = ['BDS', 'GOV', 'APU', 'MCS', 'INV', 'TCK', 'TTL', 'SUU', 'HGN', 'SHG']
  return mockSymbols.map(sym => createMockStock(sym))
}

// Create a single mock stock
function createMockStock(symbol: string): StockData {
  const basePrice = 5000 + Math.random() * 15000 // Random price between 5,000 and 20,000
  const change = basePrice * (Math.random() * 0.1 - 0.05) // Random change between -5% and +5%
  const changePercent = (change / basePrice) * 100
  
  return {
    pkId: Math.floor(Math.random() * 1000),
    id: Math.floor(Math.random() * 1000),
    Symbol: `${symbol}-O-0000`,
    mnName: `${symbol} Компани`,
    enName: `${symbol} Company`,
    Volume: Math.floor(Math.random() * 100000),
    Turnover: Math.floor(Math.random() * 1000000000),
    MDSubOrderBookType: "0",
    LastTradedPrice: basePrice,
    PreviousClose: basePrice - change,
    ClosingPrice: basePrice,
    OpeningPrice: basePrice - (change / 2),
    Changes: change,
    Changep: changePercent,
    VWAP: basePrice * (0.99 + Math.random() * 0.02),
    MDEntryTime: "14:00:00",
    trades: Math.floor(Math.random() * 100),
    HighPrice: basePrice * 1.02,
    LowPrice: basePrice * 0.98,
    MarketSegmentID: "MAIN",
    sizemd: "100",
    MDEntryPx: basePrice * 0.99,
    sizemd2: "100",
    MDEntryPx2: basePrice * 1.01,
    HighestBidPrice: basePrice * 0.99,
    LowestOfferPrice: basePrice * 1.01,
    AuctionClearingPrice: basePrice,
    Imbalance: Math.floor(Math.random() * 1000) - 500,
    BuyOrderVWAP: basePrice * 0.99,
    SellOrderVWAP: basePrice * 1.01,
    BuyOrderQty: Math.floor(Math.random() * 5000),
    SellOrderQty: Math.floor(Math.random() * 5000),
    OpenIndicator: "0",
    CloseIndicator: "0",
    TradeCondition: "0",
    securityType: "STOCK",
    dates: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    BestBidPx: basePrice * 0.99,
    BestOfferPx: basePrice * 1.01,
    category: Math.random() > 0.5 ? "I" : (Math.random() > 0.5 ? "II" : "III")
  }
}

// Generate mock order book data
function generateMockOrderBook(symbol: string): OrderBookEntry[] {
  const mockOrderBook: OrderBookEntry[] = []
  const basePrice = 10000 + Math.random() * 5000 // Base price between 10,000 and 15,000
  
  // Generate buy orders (lower prices)
  for (let i = 0; i < 10; i++) {
    const priceOffset = i * 50 // Each order is 50₮ apart
    mockOrderBook.push({
      id: 1000 + i,
      Symbol: symbol,
      MDSubOrderBookType: "0",
      MDEntryType: "0", // Buy order
      MDEntryPositionNo: i + 1,
      MDEntryID: `B${1000 + i}`,
      MDEntryPx: basePrice - priceOffset,
      MDEntrySize: Math.floor(Math.random() * 1000) + 100,
      NumberOfOrders: Math.floor(Math.random() * 5) + 1,
      MDPriceLevel: `${i + 1}`
    })
  }
  
  // Generate sell orders (higher prices)
  for (let i = 0; i < 10; i++) {
    const priceOffset = i * 50 // Each order is 50₮ apart
    mockOrderBook.push({
      id: 2000 + i,
      Symbol: symbol,
      MDSubOrderBookType: "0",
      MDEntryType: "1", // Sell order
      MDEntryPositionNo: i + 1,
      MDEntryID: `S${2000 + i}`,
      MDEntryPx: basePrice + priceOffset + 50, // Start a bit higher than base price
      MDEntrySize: Math.floor(Math.random() * 1000) + 100,
      NumberOfOrders: Math.floor(Math.random() * 5) + 1,
      MDPriceLevel: `${i + 1}`
    })
  }
  
  return mockOrderBook
}

// Generate mock bonds data
function generateMockBonds(page: number = 1, limit: number = 5000): BondData[] {
  const mockBonds: BondData[] = []
  const today = new Date()
  
  for (let i = 0; i < 20; i++) {
    const issueDate = new Date(today)
    issueDate.setDate(issueDate.getDate() - Math.floor(Math.random() * 365))
    
    const refundDate = new Date(today)
    refundDate.setFullYear(refundDate.getFullYear() + 2 + Math.floor(Math.random() * 5))
    
    mockBonds.push({
      pkId: i + 1,
      id: i + 1,
      Symbol: `BOND${i + 1}`,
      BondmnName: `Бонд ${i + 1}`,
      BondenName: `Bond ${i + 1}`,
      Issuer: `Компани ${i + 1}`,
      IssuerEn: `Company ${i + 1}`,
      Interest: `${(Math.random() * 5 + 8).toFixed(2)}%`,
      Date: issueDate.toISOString().split('T')[0],
      NominalValue: Math.floor(Math.random() * 5 + 1) * 100000,
      mnInterestConditions: "Хагас жил тутам",
      enInterestConditions: "Semi-annually",
      MoreInfo: "https://example.com/bond-info",
      updatedAt: new Date().toISOString(),
      TradedDate: issueDate.toISOString().split('T')[0],
      RefundDate: refundDate.toISOString().split('T')[0],
      Isdollar: Math.random() > 0.8 ? "1" : null,
      createdAt: new Date().toISOString()
    })
  }
  
  // Apply pagination
  const startIndex = (page - 1) * limit
  const endIndex = Math.min(startIndex + limit, mockBonds.length)
  return mockBonds.slice(startIndex, endIndex)
}

// Generate mock 52-week high-low data
function generateMock52WeekData(): WeekHighLowData[] {
  const mockSymbols = ['BDS', 'GOV', 'APU', 'MCS', 'INV', 'TCK', 'TTL', 'SUU', 'HGN', 'SHG']
  const mockData: WeekHighLowData[] = []
  
  for (const symbol of mockSymbols) {
    const basePrice = 10000 + Math.random() * 5000
    const low52 = basePrice * (0.7 + Math.random() * 0.1)
    const high52 = basePrice * (1.1 + Math.random() * 0.2)
    const lastPrice = low52 + Math.random() * (high52 - low52)
    
    mockData.push({
      Symbol: `${symbol}-O-0000`,
      trade_count: Math.floor(Math.random() * 1000) + 100,
      mnTitle: `${symbol} Компани`,
      enTitle: `${symbol} Company`,
      avg_52_week_closing_price: (low52 + high52) / 2,
      "52low": low52,
      "52high": high52,
      last_closing_date: new Date().toISOString().split('T')[0],
      last_closing_price: lastPrice
    })
  }
  
  return mockData
}

const BASE_URL = 'https://miniapp.bdsec.mn/apitest';

export const fetchStockData = async (symbol?: string): Promise<ApiResponse> => {
  const url = symbol 
    ? `${BASE_URL}/securities/trading-status/${symbol}`
    : `${BASE_URL}/securities/trading-status`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching stock data:', error)
    
    // Return mock data as fallback
    console.log('Using fallback mock stock data')
    const mockData = generateMockStockData(symbol)
    
    return {
      success: true,
      message: 'Mock data',
      data: symbol ? mockData[0] : mockData
    }
  }
};

export const fetchOrderBook = async (symbol: string): Promise<OrderBookResponse> => {
  const url = `${BASE_URL}/securities/order-book/${symbol}`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch order book data')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching order book data:', error)
    
    // Return mock data as fallback
    console.log('Using fallback mock order book data')
    const mockData = generateMockOrderBook(symbol)
    
    return {
      status: true,
      data: mockData
    }
  }
};

export const fetchAllStocks = async (): Promise<AllStocksResponse> => {
  const url = `${BASE_URL}/securities/trading-status`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch all stocks data')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching all stocks data:', error)
    
    // Return mock data as fallback
    console.log('Using fallback mock stocks data')
    const mockData = generateMockStockData()
    
    return {
      success: true,
      data: mockData
    }
  }
};

export const fetchTradingHistory = async (symbol: string, page: number = 1, limit: number = 100): Promise<TradingHistoryResponse> => {
  const url = `${BASE_URL}/securities/trading-history?page=${page}&limit=${limit}&sortField&sortOrder=desc&symbol=${symbol}`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch trading history data')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching trading history data:', error)
    
    // Return mock data as fallback
    console.log('Using fallback mock trading history data')
    
    // Generate mock data for the requested symbol
    const mockData: TradingHistoryData[] = []
    const today = new Date()
    const basePrice = 10000 + Math.random() * 5000 // Random base price between 10,000 and 15,000
    
    // Generate data points for the last 100 days, ensuring we include today's date
    for (let i = 100; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i) // This ensures we have data up to today
      
      // Generate realistic price movements
      const dailyVolatility = 0.02 // 2% daily volatility
      const priceChange = basePrice * dailyVolatility * (Math.random() * 2 - 1)
      const dayPrice = basePrice + (priceChange * (100 - i) / 10) // Slight trend over time
      
      // Create mock data point
      mockData.push({
        id: i,
        Symbol: symbol,
        MDSubOrderBookType: "0",
        OpeningPrice: dayPrice * (0.98 + Math.random() * 0.04),
        ClosingPrice: dayPrice,
        HighPrice: dayPrice * (1 + Math.random() * 0.03),
        LowPrice: dayPrice * (0.97 + Math.random() * 0.03),
        VWAP: dayPrice * (0.99 + Math.random() * 0.02),
        Volume: Math.floor(Math.random() * 10000) + 1000,
        HighestBidPrice: dayPrice * 0.99,
        LowestOfferPrice: dayPrice * 1.01,
        PreviousClose: dayPrice * (0.99 + Math.random() * 0.02),
        BuyOrderQty: Math.floor(Math.random() * 5000) + 500,
        SellOrderQty: Math.floor(Math.random() * 5000) + 500,
        Turnover: Math.floor(Math.random() * 100000000) + 10000000,
        Trades: Math.floor(Math.random() * 100) + 10,
        MDEntryTime: "14:00:00",
        companycode: 123,
        MarketSegmentID: "MAIN",
        securityType: "STOCK",
        dates: date.toISOString().split('T')[0]
      })
    }
    
    // Calculate pagination
    const startIndex = (page - 1) * limit
    const endIndex = Math.min(startIndex + limit, mockData.length)
    const paginatedData = mockData.slice(startIndex, endIndex)
    
    return {
      success: true,
      data: paginatedData,
      pagination: {
        total: mockData.length,
        totalPages: Math.ceil(mockData.length / limit),
        currentPage: page,
        limit: limit
      }
    }
  }
};

export const fetchBonds = async (page: number = 1, limit: number = 5000): Promise<BondsResponse> => {
  const url = `${BASE_URL}/securities/bonds?page=${page}&limit=${limit}&sortField`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch bonds data')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching bonds data:', error)
    
    // Return mock data as fallback
    console.log('Using fallback mock bonds data')
    const mockData = generateMockBonds(page, limit)
    
    return {
      success: true,
      data: mockData
    }
  }
};

export const fetch52WeekHighLow = async (): Promise<WeekHighLowResponse> => {
  const url = `${BASE_URL}/securities/52-week-high-low`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      throw new Error('Failed to fetch 52-week high-low data')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching 52-week high-low data:', error)
    
    // Return mock data as fallback
    console.log('Using fallback mock 52-week high-low data')
    const mockData = generateMock52WeekData()
    
    return {
      success: true,
      data: mockData
    }
  }
};

export const sendRegistrationNumber = async (registrationNumber: string) => {
  const url = `${BASE_URL}/helper/search-account/${registrationNumber}`;
  
  try {
    const response = await fetchWithTimeout(url);
    
    // Parse the response regardless of status code
    const responseData = await response.json();
    
    if (!response.ok) {
      // If response is not ok, return the error from the server
      return {
        success: false,
        message: responseData.message || `HTTP error! status: ${response.status}`,
        data: null
      };
    }
    
    // Success case - return the data
    return {
      success: true,
      message: responseData.message || 'Account found',
      data: responseData.data || responseData
    };
  } catch (error) {
    console.error('Error searching account:', error);
    
    // Network or parsing error
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to search account',
      data: null
    };
  }
};

export type { 
  StockData, 
  ApiResponse, 
  OrderBookEntry, 
  OrderBookResponse, 
  AllStocksResponse, 
  TradingHistoryResponse, 
  TradingHistoryData,
  BondData,
  BondsResponse,
  WeekHighLowData,
  WeekHighLowResponse
}; 