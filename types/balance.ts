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
  // Optional MCSD balances returned by nominal-balance API
  mcsdBalance?: Array<{
    account: number | null;
    currency: string;
    amount: number;
    code: string;
    withdrawalBalance: number | null;
  }>;
}

export interface SecurityTransaction {
  statementAmount: number;
  symbol: string;
  buySell: string;
  code: string;
  feePercent: number;
  description: string;
  transactionDate: string;
  exchangeId: number;
  lastBalance: number;
  feeAmount: number;
  totalAmount: number;
  accountId: number;
  price?: number;
  assetId?: number;
  name?: string;
  exchange?: string;
  currency?: string;
  creditAmt?: number;
  id?: number;
  firstBalance?: number;
  debitAmt?: number;
}

export interface CSDTransaction {
  code: string;
  stockAccountId: number;
  description: string;
  transactionDate: string;
  typeCode: string;
  lastBalance: number;
  totalAmount: number;
  feeAmount: number;
  price: number;
  creditAmt: number;
  firstBalance: number;
  debitAmt: number;
  username: string;
}

export interface CashTransaction {
  symbol: string;
  description: string;
  transactionDate: string;
  lastBalance: number;
  feeAmount: number;
  totalAmount: number;
  totalFee: number;
  price: number;
  custId: number;
  creditAmt: number;
  partnerId: number;
  firstBalance: number;
  taxAmount: number;
  debitAmt: number;
}

export type BalanceType = 'securities' | 'nominal' | 'fund';
export type PageType = 'balance' | 'transactions' | 'withdrawals';
export type TransactionFilter = 'all' | 'income' | 'expense';
export type TransactionType = 'all' | 'security' | 'csd' | 'cash' | 'dividend' | 'primary' | 'secondary';
export type DateRangeOption = 'all' | '7' | '30' | 'custom';