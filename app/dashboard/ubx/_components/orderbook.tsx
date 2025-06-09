'use server';
import * as React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import SearchSelectInput from '@/components/pagination/SearchSelectInput';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from '@/components/ui/table';

import { notFound } from 'next/navigation';
import getToken from '@/lib/GetTokenServer';
import { searchParamsCache } from '@/lib/searchparams';
import { Separator } from '@/components/ui/separator';
import { getTranslations } from 'next-intl/server';
interface OrderBook {
  price: number;
  qty: number;
  cnt: number;
}

export async function UBXOrderBook() {
  const page = searchParamsCache.get('SYMBOL') || 'AND';

  const TOKEN = await getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/external/ubx/best-offer/${page}`,
    {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch((err) => notFound());

  const data = await response.json();
  const topAsks: OrderBook[] = data.topAsks;
  const topBids: OrderBook[] = data.topBids;
  const t = await getTranslations(`mseBondTable`);
  return (
    <Card className="w-full max-w-full overflow-x-auto lg:w-[400px]">
      <CardHeader>
        <CardTitle>{t('orderbooktitle')}</CardTitle>
        <CardDescription>{t('orderbookdescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="framework">{t('orderbooksymbol')}</Label>

            <SearchSelectInput
              placeholder={t('orderbooksymbolplaceholder')}
              defaultValue={page}
              className="flex-none"
              query="SYMBOL"
              options={[
                {
                  value: 'AND',
                  label: 'AND'
                },
                {
                  value: 'INQ',
                  label: 'INQ'
                },
                {
                  value: 'MOST',
                  label: 'MOST'
                },

                {
                  value: 'ADBB1',
                  label: 'ADBB1'
                },
                {
                  value: 'ADBB2',
                  label: 'ADBB2'
                },
                {
                  value: 'ADBB3',
                  label: 'ADBB3'
                },
                {
                  value: 'ADBB4',
                  label: 'ADBB4'
                }
              ]}
            />
          </div>
          <Separator />
          <span className="rounded-2xl bg-primary text-center text-primary-foreground">
            {t('orderbookbuy')}
          </span>
          <Table className="overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('orderbookqty')}</TableHead>
                <TableHead> {t('orderbookprice')}</TableHead>
                <TableHead className="text-right">
                  {t('orderbookorders')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topAsks.map((ask, ind) => (
                <TableRow key={ind}>
                  <TableCell className="font-medium">{ask.qty}</TableCell>
                  <TableCell>{ask.price}</TableCell>
                  <TableCell className="text-right">{ask.cnt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {topAsks.length <= 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    {t('orderbooknobuy')}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
          <Separator />
          <span className="rounded-2xl bg-primary text-center text-primary-foreground">
            {t('orderbooksell')}
          </span>
          <Table className="overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">{t('orderbookqty')}</TableHead>
                <TableHead> {t('orderbookprice')}</TableHead>
                <TableHead className="text-right">
                  {t('orderbookorders')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topBids.map((bids, ind) => (
                <TableRow key={ind}>
                  <TableCell className="font-medium">{bids.qty}</TableCell>
                  <TableCell>{bids.price}</TableCell>
                  <TableCell className="text-right">{bids.cnt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {topBids.length <= 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-center ">
                    {t('orderbooknosell')}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
