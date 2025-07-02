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
  BestBidPx?: number;
  BestOfferPx?: number;
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

interface AccountStatusResponse {
  success: boolean;
  message?: string;
  data: any;
}

interface InvoiceResponse {
  success: boolean;
  message?: string;
  data: any;
}

const BASE_URL = 'https://miniapp.bdsec.mn/apitest';

export const fetchStockData = async (symbol?: string): Promise<ApiResponse> => {
  const url = symbol 
    ? `${BASE_URL}/securities/trading-status/${symbol}`
    : `${BASE_URL}/securities/trading-status`;
    
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch stock data');
  }
  return response.json();
};

export const fetchOrderBook = async (symbol: string): Promise<OrderBookResponse> => {
  const url = `${BASE_URL}/securities/order-book/${symbol}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch order book data');
  }
  return response.json();
};

export const fetchAllStocks = async (): Promise<AllStocksResponse> => {
  const url = `${BASE_URL}/securities/trading-status`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch all stocks data');
  }
  return response.json();
};

export const getAccountStatusRequest = async (token: string): Promise<AccountStatusResponse> => {
  try {
    const url = `${BASE_URL}/user/get-account-information`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get account status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting account status:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error', data: null };
  }
};

export const createOrRenewInvoice = async (token: string): Promise<InvoiceResponse> => {
  try {
    const url = `${BASE_URL}/payment/create-invoice`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: 5000,
        description: 'Account opening fee',
        callbackUrl: 'https://miniapp.bdsec.mn/account-setup/payment-status'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error', data: null };
  }
};

export type { StockData, ApiResponse, OrderBookEntry, OrderBookResponse, AllStocksResponse, AccountStatusResponse, InvoiceResponse }; 