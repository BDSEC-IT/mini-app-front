export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('mn-MN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const calculateSecuritiesValue = (yieldAnalysis: any[]): number => {
  return yieldAnalysis.reduce((sum, a) => sum + (a.totalNow || 0), 0);
};

export const calculateTotalBalance = (nominalBalance: number, securitiesValue: number): number => {
  return nominalBalance + securitiesValue;
};