'use server';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { OTCPrimaryTable } from './otcbond-secondary-table/data-table';
import { OTCPrimaryTableColumn } from './otcbond-secondary-table/columns';
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

export async function OTCSecondaryTableCard({ data }: { data: OTCBond[] }) {
  const t = await getTranslations('OTCBond');

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t('secondarytitle')}</CardTitle>
        <CardDescription>{t('secondarydescription')}</CardDescription>
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
