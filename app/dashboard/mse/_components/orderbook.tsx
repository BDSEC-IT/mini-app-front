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
import { fetcher } from '@/lib/clientFetcher';
import { MSEBond } from './mse-overview-table';
import SearchComboBox from '@/components/pagination/SearchComboBox';
interface MSEOrderBook {
  id: number;
  Symbol: string;
  MDSubOrderBookType: string;
  MDEntryType: '0' | '1'; // "0" for buy, "1" for sell
  MDEntryPositionNo: number;
  MDEntryID: string;
  MDEntryPx: number;
  MDEntrySize: number;
  NumberOfOrders: number | null;
  MDPriceLevel: string;
}
interface SymbolKeys {
  Symbol: string;
  BondenName: string;
}
export async function MSEOrderBook() {
  const bonds = (await fetcher<{ data: MSEBond[] }>(`/bonds/getmsebonds`)).data;
  const page =
    searchParamsCache.get('SYMBOL') ||
    bonds[0].Symbol ||
    'ICBN-BD-21/06/23-C0013-13';
  const body = {
    id: page
  };
  const TOKEN = await getToken();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/bonds/orderbook`,
    {
      cache: 'no-store',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  ).catch((err) => notFound());

  const data = await response.json();
  const responseKeys = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/bonds/getkeys`,
    {
      cache: 'reload',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  ).catch((err) => notFound());

  const dataKeys = await responseKeys.json();
  const keys: SymbolKeys[] = dataKeys.data;
  const buy: MSEOrderBook[] = data.data.buy;
  const sell: MSEOrderBook[] = data.data.sell;
  const t = await getTranslations('mseBondTable');
  return (
    <Card className="w-full max-w-full overflow-x-auto xl:w-[400px]">
      <CardHeader>
        <CardTitle>{t('orderbooktitle')}</CardTitle>
        <CardDescription>{t('orderbookdescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            {/* <Label htmlFor="framework">{t('orderbooksymbol')}</Label> */}
            <Label htmlFor="framework">{t('bond')}</Label>

            {/* <SearchSelectInput
              placeholder={t('orderbooksymbolplaceholder')}
              defaultValue={page}
              className="flex-none"
              query="SYMBOL"
              options={keys
                .filter((item) => item.Symbol) // Ensure the symbol is not empty
                .map((item) => ({
                  value: item.Symbol,
                  label: item.Symbol
                  // label: item.Symbol.split('-')[0] // Display the first part of the symbol
                }))}
            /> */}
            <SearchComboBox
              placeholder={t('orderbooksymbolplaceholder')}
              defaultValue={page}
              className="flex-none"
              query="SYMBOL"
              options={keys
                .filter((item) => item.Symbol) // Ensure the symbol is not empty
                .map((item) => ({
                  value: item.Symbol,
                  label: item.BondenName
                  // label: item.Symbol.split('-')[0] // Display the first part of the symbol
                }))}
            />
          </div>
          <Separator />
          <span className="rounded-2xl bg-primary text-center text-primary-foreground">
            {t('orderbookbuy')}
          </span>
          <Table className="overflow-x-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2"> {t('orderbookqty')}</TableHead>
                <TableHead className="w-1/2"> {t('orderbookbuy')}</TableHead>
                {/* <TableHead className="text-right">Захиалгын тоо</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {buy.map((ask, ind) => (
                <TableRow key={ind}>
                  <TableCell className="font-medium">
                    {ask.MDEntrySize}
                  </TableCell>
                  <TableCell>{ask.MDEntryPx}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {buy.length <= 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
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
                <TableHead className="w-1/2"> {t('orderbookqty')}</TableHead>
                <TableHead className="w-1/2"> {t('orderbookbuy')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sell.map((bids, ind) => (
                <TableRow key={ind}>
                  <TableCell>{bids.MDEntrySize}</TableCell>
                  <TableCell className="font-medium">
                    {bids.MDEntryPx}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {sell.length <= 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2} className="text-center ">
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
