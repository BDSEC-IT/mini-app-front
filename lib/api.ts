import { AccountSetupFormData, mongolianBanks } from './schemas';

// API base URL
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://miniapp.bdsec.mn/apitest';
export const BDSEC_MAIN =  'https://new.bdsec.mn'

// Bank codes for Mongolia
export const MONGOLIAN_BANKS = [
  { "name": "Монголбанк", "code": "010000" },
  { "name": "Ариг банк", "code": "210000" },
  { "name": "Богд банк", "code": "380000" },
  { "name": "Голомт банк", "code": "150000" },
  { "name": "Капитрон банк", "code": "300000" },
  { "name": "М банк", "code": "390000" },
  { "name": "Төрийн банк", "code": "340000" },
  { "name": "Тээвэр хөгжлийн банк", "code": "190000" },
  { "name": "Үндэсний хөрөнгө оруулалтын банк", "code": "290000" },
  { "name": "Хаан банк", "code": "050000" },
  { "name": "Хас банк", "code": "320000" },
  { "name": "Хөгжлийн банк", "code": "360000" },
  { "name": "Худалдаа хөгжлийн банк", "code": "040000" },
  { "name": "Чингис хаан банк", "code": "330000" },
  { "name": "Капитал банк ЭХА", "code": "030000" },
  { "name": "Хадгаламж банк ЭХА", "code": "180000" },
  { "name": "Анод банк", "code": "250000" },
  { "name": "Зоос банк", "code": "240000" },
  { "name": "Сангийн яам (Төрийн сан)", "code": "900000" },
  { "name": "Үнэт цаасны төвлөрсөн хадгаламжийн төв", "code": "950000" },
  { "name": "Монголын үнэт цаасны клирингийн төв", "code": "940000" },
  { "name": "360 Файнанс ББСБ", "code": "560000" },
  { "name": "Ард кредит ББСБ", "code": "520000" },
  { "name": "Дата бэйнк", "code": "550000" },
  { "name": "Инвескор Хэтэвч ББСБ", "code": "530000" },
  { "name": "Мобифинанс ББСБ", "code": "500000" },
  { "name": "Нэткапитал Финанс Корпораци ББСБ", "code": "540000" },
  { "name": "Хай пэймэнт солюшнс", "code": "510000" }
]
;

// Withdrawal types
export type WithdrawalType = 'NOMINAL' | 'CSD';

// Withdrawal request interfaces
export interface WithdrawalRequest {
  date: string;
  shareCode: string | null;
  withdrawalid: number;
  amount: number;
  stockAccountId: number;
  channel: string;
  description: string;
  accountNumber: string;
  type: string;
  acceptedDate: string | null;
  feeAmount: number;
  name: string;
  state: 'new' | 'accepted' | 'cancelled' | 'completed';
}

export interface BankAccount {
  bankCode: string;
  accNumber: string;
  accHolderName: string;
  resPartnerBankId: number;
  active: boolean;
  bankName: string;
  partnerId: number;
}

export interface NominalBalance {
  balance: number;
  nominalId: number;
  hbo: number;
  hbz: number;
  currencyFullName: string;
  currency: string;
  withdrawalAmount: number;
  orderAmount: number | null;
  totalHbz: number | null;
  accountId: number;
  firstBalance: number | null;
}

export interface CSDAgreement {
  brokerCode: string;
  stkAcntNum: string;
  lastName: string;
  firstName: string;
  register: string;
  bankBic: string | null;
  bankAcntNum: string | null;
  contractNo: string | null;
  hasContract: boolean;
}
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
  MDSubOrderBookType?: string;
  MDEntryType?: string; // "0" for buy, "1" for sell
  MDEntryPositionNo?: number;
  MDEntryID?: string;
  MDEntryPx?: number;
  MDEntrySize?: number;
  NumberOfOrders?: number | null;
  MDPriceLevel?: string;
  bondInfo?: BondData; // Add bond info for bond securities
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
    }, 30000) // 30 second timeout
    
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

// Fetch specific stock data using symbol-specific endpoint
export const fetchSpecificStockData = async (symbol: string): Promise<ApiResponse<StockData>> => {
  const url = `${BASE_URL}/securities/trading-status/${symbol}`;
  
  console.log('=== SPECIFIC TRADING STATUS API DEBUG ===');
  console.log('Symbol:', symbol);
  console.log('Specific trading status URL:', url);
  
  try {
    const response = await fetchWithTimeout(url)
    
    if (!response.ok) {
      logDev(`Specific API call failed with status ${response.status}`);
      console.error('Specific API call failed:', response.status, response.statusText);
      
      // Return mock data instead of throwing
      const mockData = createMockStock(symbol.split('-')[0])
      console.log('Using mock data for specific stock:', mockData);
      return {
        success: true,
        message: 'Mock data',
        data: mockData
      }
    }
    
    const responseData = await response.json();
    console.log('fetchSpecificStockData real data:', responseData);
    
    return responseData;
  } catch (error) {
    logDev('Using fallback mock specific stock data');
    console.error('fetchSpecificStockData error:', error);
    
    // Return mock data as fallback
    const mockData = createMockStock(symbol.split('-')[0])
    console.log('Using fallback mock data for specific stock:', mockData);
    
    return {
      success: true,
      message: 'Mock data',
      data: mockData
    }
  }
};

export const fetchStockData = async (symbol?: string): Promise<ApiResponse<StockData[]>> => {
  // Always fetch all stocks from the API, then filter if symbol is provided
  const url = `${BASE_URL}/securities/trading-status`;
  
  console.log('=== TRADING STATUS API DEBUG ===');
  console.log('Original symbol:', symbol);
  console.log('Trading status URL:', url);
  
  try {
    const response = await fetchWithTimeout(url)
    
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
    
    // If a specific symbol is requested, filter the results
    if (symbol && responseData.success && responseData.data) {
      const tradingSymbol = symbol.toLowerCase();
      const filteredData = responseData.data.filter((stock: StockData) => 
        stock.Symbol.toLowerCase().includes(tradingSymbol)
      );
      
      console.log(`Filtered data for symbol ${symbol}:`, filteredData.length, 'stocks found');
      return {
        ...responseData,
        data: filteredData
      };
    }
    
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
    
    let tradingResponse: ApiResponse<StockData[]>;
    
    // If symbol is provided, use the specific endpoint for more accurate data
    if (symbol) {
      console.log('Using specific trading status endpoint for symbol:', symbol);
      const specificResponse = await fetchSpecificStockData(symbol);
      console.log('Specific trading response:', specificResponse.success, specificResponse.data ? 'has data' : 'no data');
      
      // Convert single stock data to array format for consistency
      tradingResponse = {
        ...specificResponse,
        data: specificResponse.data ? [specificResponse.data] : []
      };
    } else {
      // Fetch all stocks using the general endpoint
      tradingResponse = await fetchStockData(symbol);
      console.log('General trading response:', tradingResponse.success, tradingResponse.data ? 'has data' : 'no data');
    }

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
  const tradingSymbol = symbol.toLowerCase();
  
  // Check if it's a bond symbol
  const isBond = tradingSymbol.includes('-bd') || tradingSymbol.includes('ombs') || tradingSymbol.includes('moni');
  
  // if (isBond) {
  //   // For bonds, fetch from bonds endpoint
  //   try {
  //     const response = await fetchWithTimeout(`${BASE_URL}/securities/bonds?page=1&limit=5000&sortField`)
  //     if (!response.ok) {
  //       return { status: false, data: [] }
  //     }
  //     const bondsData = await response.json();
  //     if (!bondsData.success) {
  //       return { status: false, data: [] }
  //     }
  //     // Return the specific bond data that matches our symbol
  //     const bondInfo = bondsData.data.find((bond: BondData) => 
  //       bond.Symbol.toLowerCase() === tradingSymbol
  //     );
  //     if (!bondInfo) {
  //       return { status: false, data: [] }
  //     }
  //     // Return bond info in a format compatible with order book display
  //     return {
  //       status: true,
  //       data: [{
  //         id: bondInfo.pkId,
  //         Symbol: bondInfo.Symbol,
  //         bondInfo: bondInfo // Additional bond-specific information
  //       }]
  //     }
  //   } catch (error) {
  //     logDev('Error fetching bond data');
  //     return { status: false, data: [] }
  //   }
  // }

  // For non-bond securities, fetch order book as usual
  const url = `${BASE_URL}/securities/order-book?symbol=${tradingSymbol}`;
  try {
    const response = await fetchWithTimeout(url)
    if (!response.ok) {
      logDev(`Failed to fetch order book data (${response.status})`);
      return { status: false, data: [] }
    }
    return response.json()
  } catch (error) {
    logDev('Error fetching order book data');
    return { status: false, data: [] }
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

  // Mock FAQ data based on the API response you provided
  const mockFAQData: FAQ[] = [
    {
      id: 1,
      type_id: 1,
      mnQuestion: "Хувьцаа гэж юу вэ?",
      enQuestion: "What is share?",
      mnAnswer: "Хувьцаа гэдэг нь хувь хүн, хуулийн этгээд тодорхой нэг компанид хөрөнгө оруулалт хийснийг баталгаажуулсан үнэт цаас юм. Хувьцаа эзэмшигч нь тухайн компанийн ашиг орлогоос ногдол ашиг авах, мөн хөрөнгийн зах зээл дээр хувьцаагаа арилжих замаар ханшийн зөрүүнээс ашиг олох боломжтой.",
      enAnswer: "A Share is a type of security that certifies an individual or legal legal entity's investment in a specific company. A shareholder is entitled to receive dividends from the company's profits and may also gain returns by selling the shares on the capital market based on price fluctuations.",
      createdAt: null,
      updatedAt: null,
      FAQType: { id: 1, mnName: "Хувьцаа", enName: "Stock" }
    },
    {
      id: 2,
      type_id: 1,
      mnQuestion: "Хувьцааны ханшийг хэрхэн харах вэ ?",
      enQuestion: "How to check share prices?",
      mnAnswer: "Та BDSec апп-ын нүүр хуудас болон Монголын хөрөнгийн биржийн mse.mn вэб сайтаас компанийн хувьцаа бүрийн ханшийн мэдээллийг хугацааны үечлэлээр харах боломжтой.",
      enAnswer: "You can view the share price information of each listed company over different time periods through the homepage of the BDSec mobile application or the official website of the Mongolian Stock Exchange at www.mse.mn",
      createdAt: null,
      updatedAt: null,
      FAQType: { id: 1, mnName: "Хувьцаа", enName: "Stock" }
    },
    {
      id: 3,
      type_id: 2,
      mnQuestion: "Бонд гэж юу вэ?",
      enQuestion: "What is a bond?",
      mnAnswer: "Бонд гэдэг нь тогтмол орлоготой, эрсдэл багатай үнэт цаас юм. Компанийн болон засгийн газрын бондод хөрөнгө оруулж байгаа нь тухайн компани болон засгийн газарт мөнгө зээлж байна гэсэн ба тодорхой хугацааны дараа үндсэн мөнгө болон хүүг эргэн төлөлтийн хуваарийн дагуу буцаан авдаг.",
      enAnswer: "A bond is a fixed-income, low-risk security. Investing in corporate or government bonds means lending money to a company or the government. In return, the investor receives periodic interest payments and is repaid the principal amount at the end of the specified term, according to the repayment schedule.",
      createdAt: null,
      updatedAt: null,
      FAQType: { id: 2, mnName: "Бонд", enName: "Bond" }
    },
    {
      id: 4,
      type_id: 3,
      mnQuestion: "Хэрхэн арилжаанд орж захиалга өгөх вэ?",
      enQuestion: "How to Participate in Trading and Place an Order?",
      mnAnswer: "Та үнэт цаасны арилжаанд оролцохын тулд заавал үнэт цаасны данстай байх шаардлагатай бөгөөд хэрэв та данстай бол \"Арилжаа\" цэс рүү хандаж, тухайн хувьцааг авах эсвэл зарах захиалга өгөх боломжтой",
      enAnswer: "To participate in securities trading, you must first have a securities account. If you already have an account, you can go to the \"Trading\" section and place a buy or sell order for the desired stock.",
      createdAt: null,
      updatedAt: null,
      FAQType: { id: 3, mnName: "Арилжаанд оролцох", enName: "Trading" }
    },
    {
      id: 5,
      type_id: 4,
      mnQuestion: "Хэрхэн онлайн данс нээх вэ ?",
      enQuestion: "How to Open an Account?",
      mnAnswer: "Онлайнаар данс нээх : Хэрэв та үнэт цаасны дансгүй бол BDSec апп руу нэвтрэх үед танд Нүүр цэсний дээд талд \"Данс нээх\" харагдах бөгөөд та шаардлагатай мэдээллийг бүрэн бөглөж, дансны хураамж төлснөөр данс нээгдэнэ.",
      enAnswer: "Opening an Account Online: If you do not have a securities account, when you log into the BDSec app, you will see the \"Open Account\" option at the top of the homepage. By providing the required information and paying the account opening fee, your account will be successfully opened.",
      createdAt: null,
      updatedAt: null,
      FAQType: { id: 4, mnName: "Данс нээх", enName: "Opening account" }
    }
  ];

  try {
  const response = await fetchWithTimeout(url)
    const responseData = await response.json();
    
    // Check if the response is successful and has data
    if (responseData && responseData.success && responseData.data) {
      return responseData.data as FAQ[]
    } else {
      return mockFAQData
    }
  } catch (error) {
    return mockFAQData
  }
};

export const fetchFAQType = async () => {
  const url = `https://new.bdsec.mn/api/v1/faq/types`;
  type FAQType = {
  id: number;
  mnName: string;
  enName: string;
  createdAt: string |null;
  updatedAt: string | null;
};

  // Mock FAQ types data based on the API response you provided
  const mockFAQTypesData: FAQType[] = [
    { id: 1, mnName: "Хувьцаа", enName: "Stock", createdAt: null, updatedAt: null },
    { id: 2, mnName: "Бонд", enName: "Bond", createdAt: null, updatedAt: null },
    { id: 3, mnName: "Арилжаанд оролцох", enName: "Trading", createdAt: null, updatedAt: null },
    { id: 4, mnName: "Данс нээх", enName: "Opening account", createdAt: null, updatedAt: null },
    { id: 5, mnName: "1072 хувьцаа", enName: "1072 stock", createdAt: null, updatedAt: null }
  ];

  try {
  const response = await fetchWithTimeout(url)
    const responseData = await response.json();
    
    // Check if the response is successful and has data
    if (responseData && responseData.success && responseData.data) {
      return responseData.data as FAQType[]
    } else {
      return mockFAQTypesData
    }
  } catch (error) {
      return mockFAQTypesData
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

const getMock52WeekDataForSymbol = (symbol: string): WeekHighLowData | null => {
  const mockData = generateMock52WeekData();
  const baseSymbol = symbol.split('-')[0].toUpperCase();
  const match = mockData.find(item => item.Symbol.split('-')[0].toUpperCase() === baseSymbol);
  return match || mockData[0] || null;
};

export const fetch52WeekHighLowBySymbol = async (symbol: string): Promise<WeekHighLowData | null> => {
  const normalizedSymbol = symbol.includes('-') ? symbol : `${symbol}-O-0000`;
  const url = `${BASE_URL}/securities/52-week-high-low/symbol/${normalizedSymbol}`;
  logDev(`Fetching 52-week high-low for ${normalizedSymbol}...`);

  try {
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      logDev(`Using mock 52-week high-low data for ${normalizedSymbol} (${response.status})`);
      return getMock52WeekDataForSymbol(normalizedSymbol);
    }

    const responseData = await response.json();
    const payload = Array.isArray(responseData.data)
      ? responseData.data[0]
      : responseData.data;

    return payload || null;
  } catch (error) {
    logDev(`Using fallback mock 52-week high-low data for ${normalizedSymbol}`);
    return getMock52WeekDataForSymbol(normalizedSymbol);
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
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9zZSI6IlVTRVIiLCJ1c2VybmFtZSI6ImRpZ2lwYXkiLCJpYXQiOjE3NTE0NDg4MjN9.CP4XJIAlErOi8fwrQ-vmBA4XT_wzdvIXw2lZ1wFbBII",
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

interface RegistrationFeeItem {
  id: number;
  digiId: string;
  createdAt: string;
  updatedAt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  mcsdError?: string | null;
  mcsdLogField?: string | null;
  register: string;
  expiresAt?: string | null;
}

interface MCSDStateRequestItem {
  id: number;
  RegistryNumber?: string | null;
  FirstName?: string | null;
  LastName?: string | null;
  BirthDate?: string | null;
  Country?: string | null;
  Gender?: string | null;
  HomePhone?: string | null;
  MobilePhone?: string | null;
  Occupation?: string | null;
  HomeAddress?: string | null;
  CustomerType?: number | null;
  BankCode?: string | null;
  BankName?: string | null;
  BankAccountNumber?: string | null;
  SuperAppAccountId?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface MCSDAccountItem {
  id: number;
  BDCAccountID: string;
  BDCAccountNumber: string;
  RegistryNumber: string;
  FirstName: string;
  LastName: string;
  DGStatus: 'PENDING' | 'COMPLETED';
  [key: string]: any; // Allow other fields from backend
}

interface SuperAppAccountItem {
  id: number;
  userId: number;
  merchantType: 'DIGIPAY' | 'SOCIALPAY' | 'MONPAY';
  externalUserId: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  refreshTokenExpiresAt?: string | null;
  phone?: string | null;
  email?: string | null;
  firstName: string;
  lastName: string;
  firstNameEn?: string | null;
  lastNameEn?: string | null;
  registerConfirmed: boolean;
  register?: string | null;
  MCSDAccountId?: number | null;
  MCSDAccount?: MCSDAccountItem | null;
  createdAt: string;
  updatedAt: string;
  kycMethod: 'NONE' | 'MCSD' | 'DIGIPAY' | 'SOCIALPAY' | 'MONPAY';
  kycDate?: string | null;
  registrationFee?: RegistrationFeeItem | null;
  MCSDStateRequest?: MCSDStateRequestItem | null;
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
    superAppAccount: SuperAppAccountItem | null;
  } | null;
  statusCode?: number;
  errorCode?: string;
}

/**
 * DRY Helper Functions for Account Status Checks
 * 
 * These functions centralize all account status logic to avoid repetition.
 */

/**
 * Condition 1: Check if user has completed the account setup forms
 * Returns true if MCSDStateRequest exists with valid data
 */
export const hasCompletedForms = (accountData: UserAccountResponse['data']): boolean => {
  if (!accountData?.superAppAccount) return false;
  const req: any = accountData.superAppAccount.MCSDStateRequest;
  return !!(req && typeof req === 'object' && (
    (req.FirstName && req.LastName) || req.RegistryNumber || req.id
  ));
};

/**
 * Condition 2: Check if user has paid registration fee
 * Returns true if any registrationFee has status === 'COMPLETED'
 */
export const hasPaidRegistrationFee = (accountData: UserAccountResponse['data']): boolean => {
  if (!accountData?.superAppAccount) return false;
  return accountData.superAppAccount.registrationFee?.status === 'COMPLETED';
};

/**
 * Condition 3: Check if user has an active (COMPLETED) MCSD account
 * 
 * CRITICAL: An account is only considered "active" or "opened" if:
 * 1. MCSDAccount object exists (not just MCSDAccountId)
 * 2. MCSDAccount.DGStatus === 'COMPLETED'
 * 
 * DO NOT use MCSDAccountId alone - it only indicates a relationship exists,
 * but the account may still be PENDING and not usable for trading.
 * 
 * @param accountData - The user account data from getUserAccountInformation
 * @returns true only if at least one superAppAccount has a COMPLETED MCSD account
 */
export const hasActiveMCSDAccount = (accountData: UserAccountResponse['data']): boolean => {
  if (!accountData?.superAppAccount) return false;
  return accountData.superAppAccount.MCSDAccount?.DGStatus === 'COMPLETED';
};

/**
 * Get MCSD account error message if account exists but is not COMPLETED
 * Returns the error message from MCSDAccount or registrationFee if available
 */
export const getMCSDAccountError = (accountData: UserAccountResponse['data']): string | null => {
  if (!accountData?.superAppAccount) return null;
  const acc = accountData.superAppAccount;
  if (acc.MCSDAccount && acc.MCSDAccount.DGStatus !== 'COMPLETED') {
    return acc.MCSDAccount.ErrorMessage || 'Account is pending approval';
  }
  if (acc.registrationFee?.mcsdError) return acc.registrationFee.mcsdError;
  return null;
};

/**
 * Check if user has MCSD account that is NOT completed (PENDING state)
 * Used to show error status in UI
 */
export const hasPendingMCSDAccount = (accountData: UserAccountResponse['data']): boolean => {
  if (!accountData?.superAppAccount) return false;
  const acc = accountData.superAppAccount;
  return !!(acc.MCSDAccount && acc.MCSDAccount.DGStatus === 'PENDING');
};

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
    
    // Return mock data for development aligned to new shape
    return {
      success: true,
      data: {
        id: 24,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        username: null,
        superAppAccount: {
          id: 1,
          userId: 24,
          merchantType: 'DIGIPAY',
          externalUserId: 'MOCK_USER_123',
          accessToken: null,
          refreshToken: null,
          refreshTokenExpiresAt: null,
          phone: '999999',
          email: 'mock@example.com',
          firstName: 'TEST',
          lastName: 'TEST',
          firstNameEn: 'TEST',
          lastNameEn: 'TEST',
          registerConfirmed: true,
          register: 'ТЕ03322252',
          MCSDAccountId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          kycMethod: 'NONE',
          kycDate: null,
          registrationFee: null,
          MCSDStateRequest: null
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
    console.log("BASE_URL", BASE_URL);
    console.log("url", `${BASE_URL}/securities/news-of-bds?page=${page}&limit=${limit}`);
    const response = await fetchWithTimeout(`${BASE_URL}/securities/news-of-bds?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    console.log("response", response);

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

// ================= iStock Partner / Accounts / Portfolio =================
// Types (kept intentionally broad to accommodate evolving backend)
interface IStockPartner {
  partnerId: number;
  registerNumber?: string;
  name?: string;
  [key: string]: any;
}

interface IStockAccount {
  accountId: number;
  partnerId?: number;
  accountNo?: string;
  currency?: string;
  [key: string]: any;
}

interface PortfolioTotalRequest {
  accountId: number;
  register: string;
  currency: string; // e.g. 'MNT'
  assetId: string;  // e.g. 'NEH'
}

interface PortfolioTotalResponse {
  success: boolean;
  data: {
    totalAssetValue?: number;
    totalMarketValue?: number;
    totalProfitLoss?: number;
    [key: string]: any;
  } | null;
  message?: string;
  statusCode?: number;
  errorCode?: string;
}

// Fetch partner(s) by partial or full register number
export const fetchPartnersByRegisterNumber = async (registerNumber: string, token: string): Promise<{ success: boolean; data: IStockPartner[]; message?: string; statusCode?: number; errorCode?: string; }> => {
  const url = `${BASE_URL}apitest/istock/partner/list?registerNumber=${encodeURIComponent(registerNumber)}`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, data: [], message: json.message || 'Failed to fetch partners', statusCode: response.status, errorCode: 'API_ERROR' };
    }
    const partners: IStockPartner[] = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    return { success: true, data: partners, message: json.message, statusCode: response.status };
  } catch (e) {
    return { success: false, data: [], message: (e as Error).message, errorCode: 'NETWORK_ERROR' };
  }
};

// Fetch accounts for a partner
export const fetchAccountsByPartnerId = async (partnerId: number, token: string, pageSize: number = 10, currentPage: number = 0): Promise<{ success: boolean; data: IStockAccount[]; message?: string; statusCode?: number; errorCode?: string; }> => {
  const url = `${BASE_URL}apitest/istock/accounts?partnerId=${partnerId}&pageSize=${pageSize}&currentPage=${currentPage}`;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, data: [], message: json.message || 'Failed to fetch accounts', statusCode: response.status, errorCode: 'API_ERROR' };
    }
    const accounts: IStockAccount[] = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    return { success: true, data: accounts, message: json.message, statusCode: response.status };
  } catch (e) {
    return { success: false, data: [], message: (e as Error).message, errorCode: 'NETWORK_ERROR' };
  }
};

// Fetch portfolio total for an account
export const fetchPortfolioTotal = async (body: PortfolioTotalRequest, token: string): Promise<PortfolioTotalResponse> => {
  const url = `${BASE_URL}apitest/istock/portfolio-total`;
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('fetchPortfolioTotal error response:', json);
      return { success: false, data: null, message: json.message || 'Failed to fetch portfolio total', statusCode: response.status, errorCode: 'API_ERROR' };
    }
    // Console log the important values as requested
    if (json?.data) {
      console.log('Portfolio Total:', json.data);
    } else {
      console.log('Portfolio Total raw response:', json);
    }
    return { success: true, data: json.data || json, message: json.message, statusCode: response.status };
  } catch (e) {
    console.error('fetchPortfolioTotal network error:', e);
    return { success: false, data: null, message: (e as Error).message, errorCode: 'NETWORK_ERROR' };
  }
};

// Convenience function: full flow using registerNumber -> first partner -> first account -> portfolio total
export const fetchFirstPortfolioTotalByRegister = async (registerNumber: string, token: string, currency: string = 'MNT', assetId: string = 'NEH') => {
  const partnersRes = await fetchPartnersByRegisterNumber(registerNumber, token);
  if (!partnersRes.success || !partnersRes.data.length) {
    console.warn('No partners found for registerNumber', registerNumber);
    return null;
  }
  const partner = partnersRes.data[0];
  const accountsRes = await fetchAccountsByPartnerId(partner.partnerId, token, 1, 0);
  if (!accountsRes.success || !accountsRes.data.length) {
    console.warn('No accounts found for partnerId', partner.partnerId);
    return null;
  }
  const account = accountsRes.data[0];
  const portfolioRes = await fetchPortfolioTotal({ accountId: account.accountId, register: registerNumber, currency, assetId }, token);
  return {
    partner,
    account,
    portfolio: portfolioRes
  };
};

// ================= iStockApp helper wrappers =================
// Simple in-memory cache for CSD transactions to avoid repeated slow calls
let _csdCache: { data: any; ts: number } | null = null
const CSD_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function istockFetch(path: string, token?: string) {
  const url = `${BASE_URL}/istockApp/${path}`
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
    const res = await fetchWithTimeout(url, { method: 'GET', headers })
    if (!res.ok) {
      return { success: false, data: null }
    }
    const json = await res.json()
    return json
  } catch (e) {
    return { success: false, data: null }
  }
}


export const fetchIstockNominalBalance = async (token?: string) => {
  return istockFetch('nominal-balance', token)
}

export const fetchIstockBalanceAsset = async (token?: string) => {
  return istockFetch('balance-asset', token)
}

export const fetchIstockSecurityTransactions = async (token?: string) => {
  return istockFetch('security-transaction-history', token)
}

export const fetchIstockYieldAnalysis = async (token?: string) => {
  return istockFetch('yield-analysis', token)
}

export const fetchIstockCashTransactions = async (token?: string) => {
  return istockFetch('transaction-cash', token)
}

export const fetchIstockCsdTransactions = async (token?: string, forceRefresh = false) => {
  // Return cached copy if recent and not forced
  if (!forceRefresh && _csdCache && (Date.now() - _csdCache.ts) < CSD_CACHE_TTL) {
    return _csdCache.data
  }

  const result = await istockFetch('csd-transaction-history', token)
  if (result && result.success) {
    _csdCache = { data: result, ts: Date.now() }
  }
  return result
}

// ================= Secondary Order Types =================

export interface SecondaryOrderData {
  symbol: string;
  orderType: string;
  buySell: string;
  quantity: number;
  stockAccountId: number;
  fee: number;
  createdUsername: string;
  cumQty: number;
  leavesQty: number;
  statusname: string;
  buySellTxt: string;
  feeAmt: number;
  exchangeId: number;
  total: number;
  createdDate: string;
  price: number;
  name: string;
  exchangeName: string;
  id: number;
  timeInForce: string;
}

export interface SecondaryOrderResponse {
  success: boolean;
  data: SecondaryOrderData[];
}

// ================= Secondary Order API Functions =================

export const fetchSecondaryOrders = async (token?: string): Promise<SecondaryOrderResponse> => {
  return istockFetch('secondary-order', token)
}

export const fetchSecondaryOrderStatus = async (orderId: number, token?: string) => {
  return istockFetch(`secondary-order/status?orderId=${orderId}`, token)
}

export const placeSecondaryOrder = async (orderData: {
  symbol: string;
  orderType: string;
  timeForce: string;
  channel: string;
  side: string;
  price: number;
  quantity: number;
  expireDate?: string;
  exchangeId: number;
}, token?: string) => {
  const url = `${BASE_URL}/istockApp/secondary-order/place`
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    })
    
    const json = await res.json()
    
    // If response is not ok, return the error message from API
    if (!res.ok) {
      return { 
        success: false, 
        data: null,
        message: json.message || json.error || 'Захиалга өгөхөд алдаа гарлаа',
        error: json.message || json.error
      }
    }
    
    return json
  } catch (e: any) {
    return { 
      success: false, 
      data: null,
      message: e.message || 'Захиалга өгөхөд алдаа гарлаа',
      error: e.message
    }
  }
}

export const cancelSecondaryOrder = async (orderId: number, token?: string) => {
  const url = `${BASE_URL}/istockApp/secondary-order/cancel`
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ orderId })
    })
    
    const json = await res.json()
    
    // If response is not ok, return the error message from API
    if (!res.ok) {
      return { 
        success: false, 
        data: null,
        message: json.message || json.error || 'Захиалга цуцлахад алдаа гарлаа',
        error: json.message || json.error
      }
    }
    
    return json
  } catch (e: any) {
    return { 
      success: false, 
      data: null,
      message: e.message || 'Захиалга цуцлахад алдаа гарлаа',
      error: e.message
    }
  }
}

// ================= Order Book and Market Data API Functions =================

export interface EnhancedOrderBookEntry {
  buySell: string;
  price: number;
  symbol: string;
  quantity: number;
  id: number;
}

export interface EnhancedOrderBookData {
  buy: EnhancedOrderBookEntry[];
  sell: EnhancedOrderBookEntry[];
}

export interface EnhancedOrderBookResponse {
  success: boolean;
  data: EnhancedOrderBookData;
  source: string;
}

export interface CompletedOrderEntry {
  mdentryTime: string;
  mdentrySize: number;
  mdentryPx: number;
}

export interface CompletedOrdersData {
  count: number;
  assetList: any;
  assetTradeList: CompletedOrderEntry[];
  assetTradeBuySells: any;
}

export interface CompletedOrdersResponse {
  success: boolean;
  data: CompletedOrdersData;
  message: string;
}

export const fetchEnhancedOrderBook = async (symbol: string, token?: string, limit?: number): Promise<EnhancedOrderBookResponse> => {
  const limitParam = limit ? `&limit=${limit}&count=${limit}&size=${limit}&depth=${limit}` : '';
  const url = `${BASE_URL}/securities/enhanced-order-book?limited=false&symbol=${symbol}${limitParam}`
  console.log('Enhanced OrderBook URL:', url);
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
    const res = await fetchWithTimeout(url, { method: 'GET', headers })
    if (!res.ok) {
      return { success: false, data: { buy: [], sell: [] }, source: '' }
    }
    const json = await res.json()
    return json
  } catch (e) {
    return { success: false, data: { buy: [], sell: [] }, source: '' }
  }
}

export const fetchTodayCompletedOrders = async (symbol: string, token?: string): Promise<CompletedOrdersResponse> => {
  const url = `${BASE_URL}/securities/today-completed-orders?symbol=${symbol}`
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
    const res = await fetchWithTimeout(url, { method: 'GET', headers })
    if (!res.ok) {
      return { success: false, data: { count: 0, assetList: null, assetTradeList: [], assetTradeBuySells: null }, message: 'Error' }
    }
    const json = await res.json()
    return json
  } catch (e) {
    return { success: false, data: { count: 0, assetList: null, assetTradeList: [], assetTradeBuySells: null }, message: 'Error' }
  }
}

// ...existing code...
// Types used by portfolio charts and utilities
interface AssetBalance {
  exchangeId: number;
  symbol: string;
  quantity: number;
  stockAccountId: number;
  name: string;
}

interface YieldAnalysis {
  symbol: string;
  amount: number;
  totalNow: number;
  withdrawWaitingAmount: number;
  holdQty: number;
  fee: number;
  depositWaitingAmount: number;
  type: string;
  profitPer: number;
  offerTypeCode: string | null;
  exchangeId: number;
  accountId: number;
  total: number;
  rate: number;
  firstTotal: number;
  exchangeName: string;
  closePrice: number;
  profit: number;
}

// ================= Order Management Types =================
interface OrderData {
  symbol: string;
  orderType: string;
  buySell: string;
  quantity: number;
  stockAccountId: number;
  fee: number;
  createdUsername: string;
  cumQty: number;
  leavesQty: number;
  statusname: string;
  buySellTxt: string;
  feeAmt: number;
  exchangeId: number;
  total: number;
  createdDate: string;
  price: number;
  name: string;
  exchangeName: string;
  id: number;
  timeInForce: string;
}

interface OrderHistoryResponse {
  success: boolean;
  data: OrderData[];
  message?: string;
}

interface PlaceOrderRequest {
  accountId: number;
  symbol: string;
  orderType: 'MARKET' | 'CONDITIONAL';
  timeForce: 'DAY' | 'GTT' | 'GTC' | 'GTD';
  channel: 'WEB' | 'APP' | 'API' | 'ERP';
  side: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  expireDate?: string;
  exchangeId: number;
}

interface PlaceOrderResponse {
  success: boolean;
  data?: any;
  message?: string;
  errorCode?: string;
}

// ================= Order Management API Functions =================

// Fetch order history for the authenticated user
export const fetchOrderHistory = async (token: string): Promise<OrderHistoryResponse> => {
  const url = `${BASE_URL}/istockApp/secondary-order`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: responseData.message || `Failed to fetch order history: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data || [],
      message: responseData.message
    };
  } catch (error) {
    console.error('Error fetching order history:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch order history'
    };
  }
};

// Place a new order
export const placeOrder = async (orderData: PlaceOrderRequest, token: string): Promise<PlaceOrderResponse> => {
  const url = `${BASE_URL}/istockApp/secondary-order/place`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to place order: ${response.status}`,
        errorCode: responseData.errorCode || 'ORDER_PLACEMENT_FAILED'
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message || 'Order placed successfully'
    };
  } catch (error) {
    console.error('Error placing order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to place order',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

// Cancel an order
export const cancelOrder = async (orderId: number, token: string): Promise<PlaceOrderResponse> => {
  const url = `${BASE_URL}/istockApp/secondary-order/cancel/${orderId}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to cancel order: ${response.status}`,
        errorCode: responseData.errorCode || 'ORDER_CANCELLATION_FAILED'
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message || 'Order cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel order',
      errorCode: 'NETWORK_ERROR'
    };
  }
};

// ================= Withdrawal API Functions =================

// Fetch withdrawal request list
export const fetchWithdrawalList = async (token: string): Promise<{ success: boolean; data: WithdrawalRequest[]; message?: string }> => {
  const url = `${BASE_URL}/istockApp/withdrawal/list`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: responseData.message || `Failed to fetch withdrawal list: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data || [],
      message: responseData.message
    };
  } catch (error) {
    console.error('Error fetching withdrawal list:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch withdrawal list'
    };
  }
};

// Create withdrawal request
export const createWithdrawalRequest = async (
  type: WithdrawalType,
  requestData: {
    accountNumber: string;
    amount: number;
    description: string;
    assetCode?: string;
    channel: string;
  },
  token: string
): Promise<{ success: boolean; data?: { id: number; message: string }; message?: string }> => {
  const url = `${BASE_URL}/istockApp/withdrawal/create/${type}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to create withdrawal request: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create withdrawal request'
    };
  }
};

// Cancel withdrawal request
export const cancelWithdrawalRequest = async (withdrawalId: number, token: string): Promise<{ success: boolean; message?: string }> => {
  const url = `${BASE_URL}/istockApp/withdrawal/cancel?withdrawalId=${withdrawalId}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to cancel withdrawal request: ${response.status}`
      };
    }
    
    return {
      success: true,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error cancelling withdrawal request:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel withdrawal request'
    };
  }
};

// Fetch bank account list
export const fetchBankList = async (token: string): Promise<{ success: boolean; data: BankAccount[]; message?: string }> => {
  const url = `${BASE_URL}/istockApp/bank/list`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        data: [],
        message: responseData.message || `Failed to fetch bank list: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data || [],
      message: responseData.message
    };
  } catch (error) {
    console.error('Error fetching bank list:', error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : 'Failed to fetch bank list'
    };
  }
};

// Add new bank account
export const addBankAccount = async (
  bankData: {
    accNumber: string;
    accName: string;
    bankCode: string;
    currency: string;
  },
  token: string
): Promise<{ success: boolean; data?: BankAccount; message?: string }> => {
  const url = `${BASE_URL}/istockApp/bank`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bankData)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to add bank account: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error adding bank account:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to add bank account'
    };
  }
};

// Fetch nominal balance
export const fetchNominalBalance = async (token: string): Promise<{ success: boolean; data?: NominalBalance; message?: string }> => {
  const url = `${BASE_URL}/istockApp/nominal-balance`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to fetch nominal balance: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error fetching nominal balance:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch nominal balance'
    };
  }
};

// Fetch CSD balance from portfolio total
export const fetchCSDBalance = async (token: string): Promise<{ success: boolean; data?: { mcsdBalance: any[] }; message?: string }> => {
  const url = `${BASE_URL}/istock/core/stk-balance/portfolio-total`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to fetch CSD balance: ${response.status}`
      };
    }
    
    // Filter only codes 9992 and 9998
    const filteredMcsdBalance = responseData.data?.mcsdBalance?.filter((item: any) => 
      item.code === '9992' || item.code === '9998'
    ) || [];
    
    return {
      success: true,
      data: { mcsdBalance: filteredMcsdBalance },
      message: responseData.message
    };
  } catch (error) {
    console.error('Error fetching CSD balance:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch CSD balance'
    };
  }
};

// Check CSD agreement
export const checkCSDAgreement = async (token: string): Promise<{ success: boolean; data?: CSDAgreement; message?: string }> => {
  const url = `${BASE_URL}/istockApp/csd-agreement/check`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to check CSD agreement: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error checking CSD agreement:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to check CSD agreement'
    };
  }
};

// Create CSD agreement
export const createCSDAgreement = async (accNumber: string, token: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  const url = `${BASE_URL}/istockApp/csd-agreement/new?accNumber=${accNumber}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to create CSD agreement: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error creating CSD agreement:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create CSD agreement'
    };
  }
};

// Update CSD agreement
export const updateCSDAgreement = async (accNumber: string, token: string): Promise<{ success: boolean; data?: any; message?: string }> => {
  const url = `${BASE_URL}/istockApp/csd-agreement/update?accNumber=${accNumber}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Failed to update CSD agreement: ${response.status}`
      };
    }
    
    return {
      success: true,
      data: responseData.data,
      message: responseData.message
    };
  } catch (error) {
    console.error('Error updating CSD agreement:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update CSD agreement'
    };
  }
};

// MSE Financial Report Types
export interface MSEReportRow {
  type: 'header' | 'data';
  rowNumber?: number;
  data: {
    number: string;
    indicator: string;
    initialBalance: string;
    finalBalance: string;
  };
}

export interface MSEReportData {
  companyInfo: {
    companyName: string;
    registryNumber: string;
  };
  currency: string;
  balanceData: MSEReportRow[];
  incomeData: MSEReportRow[];
  companyCode: string;
  year: string;
  quarter: string;
}

export interface MSEReportResponse {
  success: boolean;
  message: string;
  data: MSEReportData | null;
}

// Fetch MSE Financial Report
export const fetchMSEReport = async (
  companyCode: string,
  year: string,
  quarter: string
): Promise<MSEReportResponse> => {
  const url = `${BASE_URL}/helper/mse-report?companyCode=${companyCode}&year=${year}&quarter=${quarter}`;
  
  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      return { success: false, message: `HTTP error! status: ${response.status}`, data: null };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: 'Error fetching MSE report', data: null };
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
  CompaniesResponse,
  IStockPartner,
  IStockAccount,
  PortfolioTotalRequest,
  PortfolioTotalResponse,
  AssetBalance, 
  YieldAnalysis,
  OrderData,
  OrderHistoryResponse,
  PlaceOrderRequest,
  PlaceOrderResponse
};