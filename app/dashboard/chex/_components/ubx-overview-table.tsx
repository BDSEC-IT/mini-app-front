'use server';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import moment from 'moment';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { CHEXSecurityTable } from './chex-table';
import { getTranslations } from 'next-intl/server';

interface BaseSecurity {
  systemTime: string;
  registeredAt: string;
  name: string;
  symbol: string;
  issuerId: number;
  issuedShares: number;
  stockType: string;
  segment: string | null;
  id: number;
  deleted: boolean;
}

interface InvestmentPortfolio {
  id: number;
  type: string;
  qty: number;
  price: number;
  wvaptime: string | null;
  wvappercent: number;
  approved: boolean;
  wvaptimeLength: number;
}

export interface CHEXSecurity {
  registeredAt: string;
  isin: string;
  symbol: string;
  code: number;
  name: string;
  outstandingShares: number;
  issuedShares: number;
  icon: string;
  securityType: string;
  securityMarketType: string;
  securityStatus: string;
  boardType: string;
  tranche: number;
  firstExchangedDate: string | null;
  lastExchangedDate: string | null;
  removedDate: string | null;
  modifiedDate: string | null;
  currency: string;
  stockIndex: number;
  parValue: number;
  referencePrice: number;
  fhPercent: number;
  dynamicCB: number;
  staticCB: number;
  lotSize: number;
  multicastChannelId: number;
  internalLoadId: number;
  session: string | null;
  issuerId: number;
  tickSize: number;
  VWAPTimeLength: string | null;
  modifiedAt: string;
  id: number;
  baseSecurity: BaseSecurity;
  auditorInfo: string | null;
  flagForDelete: boolean;
  synopsisName: string;
  maturityDate: string;
  bondRate: number;
  multiplier: number;
  couponType: string;
  couponRate: number;
  couponPeriod: string;
  firstCouponDate: string;
  finalCouponDate: string;
  firstInterestDate: string;
  dayCountValue: string;
  accruedInterest: number;
  absType: string;
  investmentPortfolio: InvestmentPortfolio;
  securityRegistrationType: string;
  vwaptimeLength: string | null;
  vwapminQuantity: number;
}

export async function CHEXTable({ data }: { data: CHEXSecurity[] }) {
  const t = await getTranslations('mseBondTable');
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t('chex.chexpagetitle')}</CardTitle>
        <CardDescription>{t('chex.chexpagedescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="">
          <CHEXSecurityTable data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
