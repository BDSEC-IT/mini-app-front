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
import { UBXQuotesTable } from './ubx-table';
import { getTranslations } from 'next-intl/server';

export interface UBXQuotes {
  id: number | null;
  code: string | null;
  buyqty: number | null;
  buymin: number | null;
  buymax: number | null;
  bidqty: number | null;
  bidprice: number | null;
  sellqty: number | null;
  sellmin: number | null;
  sellmax: number | null;
  askqty: number | null;
  askprice: number | null;
  prevcloseprice: number | null;
  openprice: number | null;
  lowprice: number | null;
  highprice: number | null;
  closeprice: number | null;
  lastprice: number | null;
  lastvolume: number | null;
  totalprice: number | null;
  totalvolume: number | null;
  refprice: number | null;
  state: string | null;
  modified: string | null;
  received: string | null;
  min52: number | null;
  max52: number | null;
}

export async function UBXTable() {
  const TOKEN = await getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/ubx/quotes`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch(() => notFound());

  const data: UBXQuotes[] = await response.json();
  const t = await getTranslations('mseBondTable');
  return (
    <Card className="">
      <CardHeader>
        <CardTitle>{t('ubxcardtitle')}</CardTitle>
        <CardDescription>{t('ubxcarddescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className=" ">
          <UBXQuotesTable data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
