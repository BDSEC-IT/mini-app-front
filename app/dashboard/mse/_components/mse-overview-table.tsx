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
import { fetcher } from '@/lib/clientFetcher';
import { DataTable } from './bond-table/data-table';
import { columns } from './bond-table/columns';
import { getTranslations } from 'next-intl/server';

export interface MSEBond {
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
  BondName: string;
}

export async function MSETable() {
  const TOKEN = await getToken();

  const bonds = (await fetcher<{ data: MSEBond[] }>(`/bonds/getmsebonds`)).data;
  const t = await getTranslations('mseBondTable');

  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t('mseTableTitle')}</CardTitle>
        <CardDescription>{t('mseTableDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden ">
          <DataTable columns={columns} data={bonds} />
          {/* <UBXQuotesTable data={bonds} /> */}
        </div>
      </CardContent>
    </Card>
  );
}
