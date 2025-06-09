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
import { OTCPrimaryTable } from './otcbond-primary-table/data-table';
import { OTCPrimaryTableColumn } from './otcbond-primary-table/columns';
import { getTranslations } from 'next-intl/server';
export interface OTCBond {
  pkId: number;
  id: number;
  type: string;
  board: string;
  symbol: string;
  name: string;
  underwriter: string;
  isinNumber: string;
  currency: string;
  price: string; // If it's a numeric value, consider using number instead of string
  totalAmount: string; // Same as above
  interestRate: string;
  start_date: string;
  end_date: string;
  maturity_date: string;
  progress: string; // You can use number if progress is a percentage and always a number
  state: string;
  issuer_name: string;
  coupon_payment_period: string;
  updatedAt: string | null; // If updatedAt is nullable
  createdAt: string | null; // Same for createdAt
  isdollar: string; // Consider using boolean if it's a true/false value
  nominalValue: string; // Same as price and totalAmount, consider using number
  maturityMonths: number;
  isPrimary: string; // If it's a boolean, you could change this to `boolean`
}

export async function OTCPrimaryTableCard({ data }: { data: OTCBond[] }) {
  const t = await getTranslations('OTCBond');

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t('primarytitle')}</CardTitle>
        <CardDescription>{t('primarydescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" ">
          <OTCPrimaryTable columns={OTCPrimaryTableColumn} data={data} />
          {/* <CHEXSecurityTable data={data} /> */}
        </div>
      </CardContent>
    </Card>
  );
}
