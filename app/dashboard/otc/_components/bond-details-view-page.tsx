import { ScrollArea } from '@/components/ui/scroll-area';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { OTCBond, OTCPrimaryTableCard } from './otcbond-primarytable-card';
import getToken from '@/lib/GetTokenServer';
import { notFound } from 'next/navigation';
import { OTCSecondaryTableCard } from './otcbond-secondarytable-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
export interface File {
  pkId: number;
  id: number;
  estimate: string;
  form: string;
  ugha: string;
  security_intro: string;
  otcbond_info_id: number;
}
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { OTCTransactionTable } from './otcbond-transaction-table/data-table';
import { OTCTransactionTableColumn } from './otcbond-transaction-table/columns';
import { Button } from '@/components/ui/button';
import OTCLinks from './bond-links';
import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
export interface History {
  pkId: number;
  id: number;
  otcbond_info_id: number;
  settlement_date: string;
  symbol: string;
  name: string;
  quantity: string;
  price: string;
  total_amount: string;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Bond {
  pkId: number;
  id: number;
  type: string;
  board: string;
  symbol: string;
  name: string;
  underwriter: string;
  isinNumber: string;
  currency: string;
  price: string;
  totalAmount: string;
  interestRate: string;
  start_date: string;
  end_date: string;
  maturity_date: string;
  progress: string;
  state: string;
  issuer_name: string;
  coupon_payment_period: string;
  updatedAt: string | null;
  createdAt: string | null;
  isdollar: string;
  nominalValue: string;
  maturityMonths: number;
  isPrimary: string;
}

interface BondDetails {
  files: File[];
  history: History[];
  bond: Bond;
}

export default async function BondDetailsViewPage({
  bondId
}: {
  bondId: string;
}) {
  const TOKEN = await getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/otc/real/detail/${bondId}`,
    {
      cache: 'force-cache', // Enables caching
      next: { revalidate: 1800 }, // Cache for 30 minutes (1800 seconds)
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch(() => notFound());

  const jsonResponse = await response.json();

  const data: BondDetails = jsonResponse.data;
  const t = await getTranslations('OTCBond');
  return (
    <PageContainer>
      <PageContainer scrollable>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <Heading
              title={`${data.bond.name || t('Table.detailbigtitle')}`}
              description={t('Table.detailbigdescription')}
            />
          </div>
          <Separator />
          <OTCLinks data={data.files} />

          <div className="flex flex-col gap-4 lg:flex-row">
            <OTCInfo data={data.bond} />
            <div className="flex w-full flex-col gap-3">
              <OTCTransaction data={data.history} />
              <OTCSecondaryTransaction data={data.history} />
            </div>
          </div>
        </div>
      </PageContainer>
    </PageContainer>
  );
}
function formatBigNumber(num: number): string {
  return num.toLocaleString('en-US');
}
async function OTCInfo({ data }: { data: Bond }) {
  const t = await getTranslations('OTCBond');
  return (
    <div className="space-y-4">
      {/* Card for Bond Details */}
      <Card className="md:w[450px] w-full max-w-full overflow-x-auto lg:w-[500px]">
        <CardHeader>
          <CardTitle>{t('Table.detailtitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full gap-4">
            {/* Bond Information Table */}
            <Table className="w-full">
              <TableBody>
                <TableRow>
                  <TableCell>{t('Table.type')}</TableCell>
                  <TableCell>
                    <Badge variant={'outline'}>{data.type}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.status')}</TableCell>
                  <TableCell>
                    <Badge variant={'outline'}>
                      {data.isPrimary === 'yes'
                        ? t('Table.primary')
                        : t('Table.secondary')}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.board')}</TableCell>
                  <TableCell>{data.board}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.symbol_value')}</TableCell>
                  <TableCell>{data.symbol}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.name')}</TableCell>
                  <TableCell>{data.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.issuer_name')}</TableCell>
                  <TableCell>{data.issuer_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.underwriter')}</TableCell>
                  <TableCell>{data.underwriter}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t('Table.currency')}</TableCell>
                  <TableCell>{data.currency}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t('Table.nominal_value')}</TableCell>
                  <TableCell>
                    {formatBigNumber(Number(data.nominalValue))} {data.currency}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.total_value')}</TableCell>
                  <TableCell>
                    {formatBigNumber(Number(data.totalAmount))} {data.currency}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.interest_rate')}</TableCell>
                  <TableCell>{Number(data.interestRate).toFixed(2)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.start_date')}</TableCell>
                  <TableCell>
                    {new Date(data.start_date).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.end_date')}</TableCell>
                  <TableCell>
                    {new Date(data.end_date).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.maturity_date')}</TableCell>
                  <TableCell>
                    {new Date(data.maturity_date).toLocaleString()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.progress')}</TableCell>
                  <TableCell>{data.progress}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.state')}</TableCell>
                  <TableCell>
                    <Badge variant={'outline'}>{data.state}</Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t('Table.coupon_payment_period')}</TableCell>
                  <TableCell>
                    <Badge variant={'outline'}>
                      {data.coupon_payment_period}
                    </Badge>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>{t('Table.maturity_months')}</TableCell>
                  <TableCell>{data.maturityMonths} сар</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{t('Table.isin_number')}</TableCell>
                  <TableCell>{data.isinNumber}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
async function OTCTransaction({ data }: { data: History[] }) {
  const t = await getTranslations('OTCBond');
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t('Table.primary_trading')}</CardTitle>
        <CardDescription>{t('Table.primary_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" ">
          <OTCTransactionTable
            columns={OTCTransactionTableColumn}
            data={data}
          />
          {/* <CHEXSecurityTable data={data} /> */}
        </div>
      </CardContent>
    </Card>
  );
}
async function OTCSecondaryTransaction({ data }: { data: History[] }) {
  const t = await getTranslations('OTCBond');
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t('Table.secondary_trading')}</CardTitle>
        <CardDescription>{t('Table.secondary_description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" ">
          <OTCTransactionTable
            columns={OTCTransactionTableColumn}
            data={data}
          />
          {/* <CHEXSecurityTable data={data} /> */}
        </div>
      </CardContent>
    </Card>
  );
}
