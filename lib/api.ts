import { AccountSetupFormData, mongolianBanks } from './schemas';

// API base URL
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://miniapp.bdsec.mn/apitest';
export const BDSEC_MAIN =  'https://new.bdsec.mn'
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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errorCode?: string;
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

interface CompanyData {
  id: number;
  mnTitle: string;
  enTitle: string;
  ruTitle: string | null;
  jpTitle: string | null;
  companycode: number;
  symbol: string;
  logo: string | null;
  issued_shares: string;
  outstanding_shares: string;
  MarketSegmentID: string;
  segments: number;
  state_own: number;
  state_own_date: string | null;
  ISIN: string;
  changedate: string;
  adjustmentcoef: number;
}

interface CompaniesResponse {
  success: boolean;
  data: CompanyData[];
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

interface NewsData {
  id: number;
  mnTitle: string;
  mnBody: string;
  cover: string;
  seenCount: number;
  publishedAt: string;
}

interface NewsResponse {
  success: boolean;
  data: NewsData[];
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
      
      // Create a mock response for timeout
      return new Response(JSON.stringify({
        success: false,
        message: 'Request timed out',
        errorCode: 'TIMEOUT'
      }), {
        status: 408,
        statusText: 'Request Timeout',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else if ((error as Error).name === 'AbortError') {
      console.log('Request was aborted')
      
      // Create a mock response for aborted requests
      return new Response(JSON.stringify({
        success: false,
        message: 'Request was aborted',
        errorCode: 'ABORTED'
      }), {
        status: 499,
        statusText: 'Client Closed Request',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    } else if ((error as Error).name === 'TypeError' && (error as Error).message.includes('Failed to fetch')) {
      console.log('Network error:', error)
      
      // Create a mock response for network errors
      return new Response(JSON.stringify({
        success: false,
        message: 'Network error. Please check your connection.',
        errorCode: 'NETWORK_ERROR'
      }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      })
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
    MDEntryTime: new Date().toISOString(),
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

// JWT Secret for development purposes only - in production this would be handled securely by the backend
const JWT_SECRET = "vxp3:oz6&Ht<?fQ";

// Helper function to log only in development
const logDev = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[API Fallback] ${message}`);
  }
};

export const fetchStockData = async (symbol?: string): Promise<ApiResponse<StockData[]>> => {
  // Use lowercase symbol for trading status endpoint
  const tradingSymbol = symbol ? symbol.toLowerCase() : undefined;
  const url = tradingSymbol 
    ? `${BASE_URL}/securities/trading-status/${tradingSymbol}`
    : `${BASE_URL}/securities/trading-status`;
  
  console.log('=== TRADING STATUS API DEBUG ===');
  console.log('Original symbol:', symbol);
  console.log('Trading symbol (lowercase):', tradingSymbol);
  console.log('Trading status URL:', url);
  
  try {
    const response = await fetchWithTimeout(url)
    
    // Response status logging removed
    
    if (!response.ok) {
      logDev(`API call failed with status ${response.status}`);
      console.error('API call failed:', response.status, response.statusText);
      // For debugging, let's see what the error response is
      try {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
      } catch (e) {
        console.error('Could not read error response');
      }
      
      // Return mock data instead of throwing
      const mockData = generateMockStockData(symbol)
      console.log('Using mock data:', mockData);
      return {
        success: true,
        message: 'Mock data',
        data: mockData
      }
    }
    
    const responseData = await response.json();
    console.log('fetchStockData real data:', responseData);
    return responseData;
  } catch (error) {
    logDev('Using fallback mock stock data');
    console.error('fetchStockData error:', error);
    
    // Return mock data as fallback
    const mockData = generateMockStockData(symbol)
    console.log('Using fallback mock data:', mockData);
    
    return {
      success: true,
      message: 'Mock data',
      data: mockData
    }
  }
};

// Enhanced version of fetchStockData that includes company information
export const fetchStockDataWithCompanyInfo = async (symbol?: string): Promise<ApiResponse<StockData[]>> => {
  try {
    console.log('=== fetchStockDataWithCompanyInfo START ===');
    console.log('Symbol:', symbol);
    
    // Fetch trading data first
    const tradingResponse = await fetchStockData(symbol);
    console.log('Trading response:', tradingResponse.success, tradingResponse.data ? 'has data' : 'no data');

    if (!tradingResponse.success || !tradingResponse.data) {
      console.log('Trading data failed, using mock data');
      const mockData = generateMockStockData(symbol)
      return {
        success: true,
        message: 'Mock data',
        data: mockData
      };
    }

    // Fetch company data for the specific symbol (use original case for companies API)
    const companiesResponse = await fetchCompanies(1, 5000, symbol);
    console.log('Companies response:', companiesResponse.success, companiesResponse.data ? companiesResponse.data.length : 0, 'companies');

    let stocksData = tradingResponse.data;
    let companiesData: CompanyData[] = [];

    if (companiesResponse.success && companiesResponse.data) {
      companiesData = companiesResponse.data;
    }

    // Get company info (should be only one company for the specific symbol)
    const companyInfo = companiesData.length > 0 ? companiesData[0] : null;
    console.log('Company info found:', companyInfo?.mnTitle, companyInfo?.enTitle);

    // Handle single stock object vs array
    const stocksArray = Array.isArray(stocksData) ? stocksData : [stocksData];
    console.log('Stocks data type:', Array.isArray(stocksData) ? 'array' : 'object', 'length:', stocksArray.length);

    // Merge trading data with company information
    const enrichedStocks = stocksArray.map(stock => {
      const baseSymbol = stock.Symbol.split('-')[0];
      
      const enrichedStock = {
        ...stock,
        mnName: companyInfo?.mnTitle || stock.mnName || `${baseSymbol} Компани`,
        enName: companyInfo?.enTitle || stock.enName || `${baseSymbol} Company`
      };
      
      console.log(`Enriched ${stock.Symbol}:`, enrichedStock.mnName, enrichedStock.enName);
      return enrichedStock;
    });

    console.log('=== fetchStockDataWithCompanyInfo SUCCESS ===');
    return {
      success: true,
      message: tradingResponse.message,
      data: enrichedStocks
    };

  } catch (error) {
    console.error('=== fetchStockDataWithCompanyInfo ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return mock data as fallback
    const mockData = generateMockStockData(symbol)
    
    return {
      success: true,
      message: 'Mock data',
      data: mockData
    }
  }
};


export const fetchOrderBook = async (symbol: string): Promise<OrderBookResponse> => {
  // Use lowercase symbol for order book endpoint
  const tradingSymbol = symbol.toLowerCase();
  const url = `${BASE_URL}/securities/order-book/${tradingSymbol}`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      logDev(`Using mock order book data (${response.status})`);
      // Return mock data instead of throwing
      return {
        status: true,
        data: generateMockOrderBook(symbol)
      }
    }
    return response.json()
  } catch (error) {
    logDev('Using fallback mock order book data');
    
    // Return mock data as fallback
    const mockData = generateMockOrderBook(symbol)
    
    return {
      status: true,
      data: mockData
    }
  }
};

// Fetch all stocks with enriched data
export const fetchAllStocks = async (): Promise<AllStocksResponse> => {
  const url = `${BASE_URL}/securities/trading-status`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      logDev(`Using mock stocks data (${response.status})`);
      // Don't throw error, return mock data instead
      return {
        success: true,
        data: generateMockStockData()
      }
    }
    return response.json()
  } catch (error) {
    logDev('Using fallback mock stocks data');
    
    // Return mock data as fallback
    const mockData = generateMockStockData()
    
    return {
      success: true,
      data: mockData
    }
  }
};

// Enhanced function that merges stock trading data with company information
export const fetchAllStocksWithCompanyInfo = async (): Promise<AllStocksResponse> => {
  try {
    const [tradingResponse, companiesResponse] = await Promise.all([
      fetchAllStocks(),
      fetchCompanies()
    ]);

    if (!tradingResponse.success || !tradingResponse.data) {
      logDev('Failed to fetch trading data, using mock data');
      return { success: true, data: generateMockStockData() };
    }

    let stocksData = tradingResponse.data;
    let companiesData: CompanyData[] = companiesResponse.success && companiesResponse.data ? companiesResponse.data : [];

    // Create a map of company data by both base symbol and full symbol (uppercase)
    const companyMap = new Map<string, CompanyData>();
    companiesData.forEach(company => {
      if (company.symbol && company.symbol.endsWith('-O-0000')) {
        const baseSymbol = company.symbol.split('-')[0].toUpperCase();
        companyMap.set(baseSymbol, company);
        companyMap.set(company.symbol.toUpperCase(), company); // Add full symbol as key
      }
    });

    // Merge trading data with company information
    const enrichedStocks: StockData[] = [];
    const seen = new Set<string>();

    for (const stock of stocksData) {
      const baseSymbol = stock.Symbol.split('-')[0].toUpperCase();
      if (seen.has(baseSymbol)) continue; // Skip duplicates
      seen.add(baseSymbol);

      // Try full symbol first, then base symbol
      const companyInfo = companyMap.get(stock.Symbol.toUpperCase()) || companyMap.get(baseSymbol);

      enrichedStocks.push({
        ...stock,
        mnName: companyInfo?.mnTitle || stock.mnName || `${baseSymbol} Компани`,
        enName: companyInfo?.enTitle || stock.enName || `${baseSymbol} Company`
      });
    }

    logDev(`Enriched ${enrichedStocks.length} stocks with company data from ${companiesData.length} companies`);

    return { success: true, data: enrichedStocks };

  } catch (error) {
    logDev('Error in fetchAllStocksWithCompanyInfo, using fallback mock data');
    return { success: true, data: generateMockStockData() };
  }
};

export const fetchFAQ = async () => {
  console.log("fetchFAQ");
  const url = `https://new.bdsec.mn/api/v1/faq`;
  type FAQType = {
  id: number;
  mnName: string;
  enName: string;
};

type FAQ = {
  id: number;
  type_id: number;
  mnQuestion: string;
  enQuestion: string;
  mnAnswer: string;
  enAnswer: string;
  createdAt: string | null;
  updatedAt: string | null;
  FAQType: FAQType;
};


  try {
  const response = await fetchWithTimeout(url)
    const responseData = await response.json();
  return (responseData as any).data as FAQ
  } catch (error) {
    
  }
};

export const fetchFAQType = async () => {
  console.log("fetchFAQTypes");
  const url = `https://new.bdsec.mn/api/v1/faq/types`;
  type FAQType = {
  id: number;
  mnName: string;
  enName: string;
  createdAt: string |null;
  updatedAt: string | null;
};



  try {
  const response = await fetchWithTimeout(url)
    const responseData = await response.json();
    console.log("responseData",responseData);
  return (responseData as any).data as FAQType
  } catch (error) {
      console.log("error",error);
  }
};

export const fetchTradingHistory = async (symbol: string, page: number = 1, limit: number = 100): Promise<TradingHistoryResponse> => {
  const url = `${BASE_URL}/securities/trading-history?page=${page}&limit=${limit}&sortField&sortOrder=desc&symbol=${symbol}`;
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      logDev(`Using mock trading history data (${response.status})`);
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
    return response.json()
  } catch (error) {
    logDev('Using fallback mock trading history data');
    
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
  logDev(`Fetching bonds from: ${url}`);
  try {
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      logDev(`Using mock bonds data (${response.status})`);
      return { success: false, data: [] };
    }
    return response.json();
  } catch (error) {
    logDev('Using fallback mock bonds data');
    return { success: false, data: [] };
  }
};

export const fetchCompanies = async (page: number = 1, limit: number = 5000, symbol?: string): Promise<CompaniesResponse> => {
  const url = symbol 
    ? `${BASE_URL}/securities/companies?page=${page}&limit=${limit}&sortField&symbol=${symbol}`
    : `${BASE_URL}/securities/companies?page=${page}&limit=${limit}&sortField`;
    
  console.log('=== COMPANIES API DEBUG ===');
  console.log('fetchCompanies URL:', url);
  console.log('Symbol filter:', symbol);
  
  try {
    const response = await fetchWithTimeout(url);
    console.log('Companies response status:', response.status);
    console.log('Companies response statusText:', response.statusText);
    
    if (!response.ok) {
      console.error(`Error fetching companies: ${response.status} ${response.statusText}`);
      logDev(`Error fetching companies: ${response.statusText}`);
      return { success: false, data: [] };
    }
    
    const data = await response.json();
    console.log('Companies response data:', data);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Companies API exception:', error);
    logDev(`Exception in fetchCompanies: ${errorMessage}`);
    return { success: false, data: [] };
  }
};

export const fetch52WeekHighLow = async (): Promise<WeekHighLowResponse> => {
  const url = `${BASE_URL}/securities/52-week-high-low`;
  logDev('Fetching 52-week high-low data...');
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      logDev(`Using mock 52-week high-low data (${response.status})`);
      // Return mock data instead of throwing
      return {
        success: true,
        data: generateMock52WeekData()
      }
    }
    return response.json()
  } catch (error) {
    logDev('Using fallback mock 52-week high-low data');
    
    // Return mock data as fallback
    const mockData = generateMock52WeekData()
    
    return {
      success: true,
      data: mockData
    }
  }
};

// Search account by registration number (deprecated - use sendRegistrationNumber instead)
export const searchAccountByRegNumber = async (registrationNumber: string) => {
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

// Response type for registration
interface RegistrationResponse {
  success: boolean;
  message: string;
  data: any;
  statusCode: number;
  errorCode?: string;
}

// DigiPay login to get authentication token
export const digipayLogin = async (userIdKhan: string) => {
  const url = `${BASE_URL}/user/digipay-login`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify({ userIdKhan }),
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Parse the response regardless of status code
    const responseData = await response.json();
    
    if (!response.ok) {
      // If response is not ok, return the error from the server
      console.log('DigiPay login failed, using mock token for development');
      
      // For development purposes, return a mock token
      return {
        success: true,
        message: 'Using mock token for development',
        data: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTE0NDg4MjN9.CP4XJIAlErOi8fwrQ-vmBA4XT_wzdvIXw2lZ1wFbBII",
          user: {
            userId: 3
          }
        }
      };
    }
    
    // Success case - return the data with token
    return {
      success: true,
      message: responseData.message || 'Login successful',
      data: responseData.data || responseData
    };
  } catch (error) {
    console.error('Error during DigiPay login:', error);
    
    // For development purposes, return a mock token
    console.log('DigiPay login error, using mock token for development');
    return {
      success: true,
      message: 'Using mock token for development',
      data: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTE0NDg4MjN9.CP4XJIAlErOi8fwrQ-vmBA4XT_wzdvIXw2lZ1wFbBII",
        user: {
          userId: 3
        }
      }
    };
  }
};

// Update the sendRegistrationNumber function to handle all error cases
export const sendRegistrationNumber = async (registrationNumber: string, token: string): Promise<RegistrationResponse> => {
  const url = `${BASE_URL}/user/send-registration-number`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: JSON.stringify({ registrationNumber }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Parse the response regardless of status code
    const responseData = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      let errorCode = '';
      
      if (response.status === 400) {
        if (responseData.message?.includes('Not permitted')) {
          errorCode = 'NOT_PERMITTED';
        } else if (responseData.message?.includes('User not found')) {
          errorCode = 'USER_NOT_FOUND';
        } else if (responseData.message?.includes('MCSD Already created')) {
          errorCode = 'MCSD_ALREADY_CREATED';
        } else if (responseData.message?.includes('Firstname or Lastname does not match')) {
          errorCode = 'NAME_MISMATCH';
        }
      } else if (response.status === 500) {
        errorCode = 'MCSD_CONNECTION_ERROR';
      }
      
      // Return structured error response
      return {
        success: false,
        message: responseData.message || `HTTP error! status: ${response.status}`,
        data: null,
        statusCode: response.status,
        errorCode
      };
    }
    
    // Success cases
    let successType = '';
    
    if (responseData.data?.mcsdAccountCreated) {
      successType = 'MCSD_ACCOUNT_CREATED';
    } else if (responseData.data?.userUpdated) {
      successType = 'USER_UPDATED';
    } else if (responseData.data?.userCreated) {
      successType = 'USER_CREATED';
    }
    
    // Success case - return the data
    return {
      success: true,
      message: responseData.message || 'Registration number sent successfully',
      data: {
        ...responseData.data,
        successType
      },
      statusCode: response.status
    };
  } catch (error) {
    console.error('Error sending registration number:', error);
    
    // Network or parsing error
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send registration number',
      data: null,
      statusCode: 500,
      errorCode: 'NETWORK_ERROR'
    };
  }
};

// User profile interface
interface UserProfile {
  id: number;
  registerNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  hasMcsdAccount: boolean;
  hasBrokerAccount: boolean;
  nationality: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileResponse {
  success: boolean;
  message?: string;
  data: UserProfile | null;
  statusCode?: number;
  errorCode?: string;
}

interface KhanUser {
  id: number;
  phone: string;
  lastName: string;
  firstName: string;
  lastNameEn: string;
  firstNameEn: string;
  email: string | null;
  limitAmount: number | null;
  userIdKhan: string;
  register: string;
  cif: string | null;
  userId: number;
  registrationFee: RegistrationFee | null;
  MCSDStateRequest: string | null;
}
interface RegistrationFee{
  id: number,
  digiId: string,
  khanUserId: 2,
  createdAt: Date,
  updatedAt: Date,
  status: "PENDING" | "COMPLETED" | "ERROR",
  mcsdError: string | null,
  message?: string,
  register: string,
  expiresAt: Date
}

interface UserAccountResponse {
  success: boolean;
  message?: string;
  data: {
    id: number;
    role: string;
    createdAt: string;
    updatedAt: string;
    username: string | null;
    refreshTokenExpiresAt: string | null;
    MCSDAccount: any | null;
    khanUser: KhanUser;
  } | null;
  statusCode?: number;
  errorCode?: string;
}

// Get user profile information with enhanced error handling
export const getUserProfile = async (token?: string): Promise<UserProfileResponse> => {
  const url = `${BASE_URL}/user/profile`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    
    // Parse the response regardless of status code
    const responseData = await response.json();
    
    if (!response.ok) {
      // If response is not ok, return the error from the server
      return {
        success: false,
        message: responseData.message || `HTTP error! status: ${response.status}`,
        data: null,
        statusCode: response.status,
        errorCode: response.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR'
      };
    }
    
    // Success case - return the data
    return {
      success: true,
      message: responseData.message || 'Profile retrieved successfully',
      data: responseData.data || responseData,
      statusCode: response.status
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // For development purposes, return mock profile data
    console.log('Using mock profile data for development');
    return {
      success: true,
      message: 'Using mock profile data',
      data: {
        id: 1,
        registerNumber: 'AA12345678',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '99112233',
        hasMcsdAccount: true,
        hasBrokerAccount: false,
        nationality: 'MN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      statusCode: 200
    };
  }
};

export const getUserAccountInformation = async (token?: string): Promise<UserAccountResponse> => {
  try {
    // Set up headers with authorization token
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Make the API request
    const response = await fetchWithTimeout(`${BASE_URL}/user/get-account-information`, {
      method: 'GET',
      headers
    })

    // Parse the response
    const data = await response.json()
    
    // Return the data
    return {
      success: true,
      data: data.data,
      message: data.message
    }
  } catch (error) {
    logDev('Using fallback mock account information data');
    
    // Return mock data for development
    return {
      success: true,
      data: {
        id: 3,
        role: "USER",
        createdAt: "2025-06-26T08:24:28.876Z",
        updatedAt: "2025-06-26T08:24:28.876Z",
        username: null,
        refreshTokenExpiresAt: null,
        MCSDAccount: null,
        khanUser: {
          id: 2,
          phone: "44444442",
          lastName: "TEST",
          firstName: "TESTT",
          lastNameEn: "TEST",
          firstNameEn: "TESTT",
          email: "batbaatar.t@khanbank.com",
          limitAmount: null,
          userIdKhan: "102410030477058",
          register: "УП02251010",
          cif: null,
          userId: 3,
          registrationFee: null,
          MCSDStateRequest: "SUBMITTED"
        }
      }
    }
  }
}

export const getUpdateMCSDStatus=async(token:string)=>{
  const url = `${BASE_URL}/user/get-update-mcsd-status`;
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
        return{ ...data.data,success:true }as {
          success: boolean,
          accountOpened: boolean,
          message: string,
        };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch MCSD request status',
        accountOpened: false,
      };
    }
  } catch (error) {
    console.error('Error fetching MCSD request status:', error);
    return {
      success: false,
      message: 'Failed to fetch MCSD request status',
      errorCode: 'UNKNOWN_ERROR'
    };
  }
}

interface AccountSetupResponse {
  success: boolean;
  message?: string;
  data?: any;
  statusCode?: number;
  errorCode?: string;
}

export const submitAccountSetup = async (data: any, token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/user/mcsd-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        // Format country as an object with code and name
        country: {
          code: data.nationality,
          name: data.nationalityName || 'Mongolia' // Default to Mongolia if name not provided
        },
        firstName: data.firstName,
        lastName: data.lastName,
        register: data.register,
        phone: data.phone,
        email: data.email,
        bankCode: data.bankCode,
        bankName: data.bankName,
        accountNumber: data.accountNumber
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to submit account setup',
        errorCode: result.errorCode || 'UNKNOWN_ERROR'
      };
    }
  } catch (error) {
    console.error('Error submitting account setup:', error);
    return {
      success: false,
      message: 'Network error',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

// Send account status request with general and bank information
export const sendAccountStatusRequest = async (data: any, token: string) => {
  try {
    // Debug: Log the request body
    console.log('sendAccountStatusRequest - Request body:', data);

    const response = await fetch(`${BASE_URL}/user/send-account-status-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data) // Send the data as-is (camelCase)
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data: result
      };
    } else {
      console.error('sendAccountStatusRequest - Error response:', result);
      return {
        success: false,
        message: result.message || 'Failed to send account status request',
        errorCode: result.errorCode || 'UNKNOWN_ERROR'
      };
    }
  } catch (error) {
    console.error('Error sending account status request:', error);
    return {
      success: false,
      message: 'Network error',
      errorCode: 'NETWORK_ERROR'
    };
  }
};
//get acc from mcsd
export const getAccountRequest=async(token:string)=>{
  const url = `${BASE_URL}/user/get-account-request`;
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
}
// Get account status request
export const getAccountStatusRequest = async (token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/user/get-account-status-request`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to get account status request',
        errorCode: result.errorCode || 'UNKNOWN_ERROR'
      };
    }
  } catch (error) {
    console.error('Error getting account status request:', error);
    return {
      success: false,
      message: 'Network error',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

// Create or renew invoice
export const createOrRenewInvoice = async (token: string) => {
  try {
    console.log('=== CREATE INVOICE DEBUG ===');
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('Full token:', token);
    console.log('URL:', `${BASE_URL}/user/create-or-renew-invoice-register`);
    console.log('Headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    console.log('=== END DEBUG ===');

    // Use the same fetchWithTimeout function that works for other endpoints
    const response = await fetchWithTimeout(`${BASE_URL}/user/create-or-renew-invoice-register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is JSON before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Response is not JSON (likely HTML error page)
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse.substring(0, 200));
      
      return {
        success: false,
        message: `Server returned ${response.status} error. Please check your authentication.`,
        errorCode: response.status === 404 ? 'ENDPOINT_NOT_FOUND' : 'SERVER_ERROR',
        statusCode: response.status
      };
    }

    const result = await response.json();
    console.log('Response data:', result);
    
    if (response.ok) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        message: result.message || `Failed to create invoice (${response.status})`,
        errorCode: result.errorCode || 'UNKNOWN_ERROR',
        statusCode: response.status
      };
    }
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

// Check invoice status
export const checkInvoiceStatus = async (token: string) => {
  try {
    console.log('=== CHECK INVOICE STATUS DEBUG ===');
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token');
    console.log('URL:', `${BASE_URL}/user/check-invoice-status`);
    console.log('=== END DEBUG ===');

    const response = await fetchWithTimeout(`${BASE_URL}/user/check-invoice-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Check if response is JSON before trying to parse it
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Response is not JSON (likely HTML error page)
      const textResponse = await response.text();
      console.error('Non-JSON response received:', textResponse.substring(0, 200));
      
      return {
        success: false,
        message: `Server returned ${response.status} error. Please check your authentication.`,
        errorCode: response.status === 404 ? 'ENDPOINT_NOT_FOUND' : 'SERVER_ERROR',
        statusCode: response.status
      };
    }

    const result = await response.json();
    console.log('Response data:', result);
    
    if (response.ok) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        message: result.message || `Failed to check invoice status (${response.status})`,
        errorCode: result.errorCode || 'UNKNOWN_ERROR',
        statusCode: response.status
      };
    }
  } catch (error) {
    console.error('Error checking invoice status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

// Fetch news from BDS
export const fetchNews = async (page: number = 1, limit: number = 100): Promise<NewsResponse> => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/securities/news-of-bds?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    logDev(`fetchNews response: ${JSON.stringify(data)}`);
    
    return {
      success: data.success || true,
      data: data.data || []
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      success: false,
      data: []
    };
  }
};

export const getRegistrationNumber = async (token?: string) => {
  const url = `${BASE_URL}/user/get-registration-number`;
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });
    const data = await response.json();
    
    // Debug logging to see the actual response structure - reduced to improve performance
    // console.log('getRegistrationNumber - Raw response data:', data);
    // console.log('getRegistrationNumber - Response structure:', {
    //   hasData: !!data?.data,
    //   dataType: typeof data?.data,
    //   hasRegisterNumber: !!data?.data?.registerNumber,
    //   directData: typeof data === 'string' ? data : 'not string'
    // });
    
    // Try multiple possible response structures
    let registerNumber = null;
    if (typeof data === 'string') {
      // Backend returns just the string directly
      registerNumber = data;
    } else if (data?.data?.registerNumber) {
      // Backend returns { data: { registerNumber: "..." } }
      registerNumber = data.data.registerNumber;
    } else if (data?.registerNumber) {
      // Backend returns { registerNumber: "..." }
      registerNumber = data.registerNumber;
    } else if (data?.data && typeof data.data === 'string') {
      // Backend returns { data: "..." }
      registerNumber = data.data;
    }
    
    // console.log('getRegistrationNumber - Extracted registerNumber:', registerNumber);
    
    return {
      success: response.ok,
      registerNumber: registerNumber,
      data: data?.data || null,
      message: data?.message || null
    };
  } catch (error) {
    console.error('getRegistrationNumber - Error:', error);
    return {
      success: false,
      registerNumber: null,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to fetch registration number'
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
  WeekHighLowResponse,
  UserProfile,
  UserProfileResponse,
  RegistrationResponse,
  UserAccountResponse,
  AccountSetupResponse,
  NewsData,
  NewsResponse,
  CompanyData,
  CompaniesResponse
};