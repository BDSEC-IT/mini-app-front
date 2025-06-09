'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

import moment from 'moment';
import { useRouter } from 'next/navigation';

import { useSearchParams } from 'next/navigation';
import { UBXQuotes } from './ubx-overview-table';
import { useTranslations } from 'next-intl';
export function UBXQuotesTable({ data }: { data: UBXQuotes[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSymbol = searchParams.get('SYMBOL') || 'AND'; // Get 'SYMBOL' from URL
  const handleRowClick = (symbol: string | null) => {
    if (symbol) {
      const params = new URLSearchParams(window.location.search);
      params.set('SYMBOL', symbol);
      router.push(`?${params.toString()}`);
    }
  };
  const t = useTranslations('mseBondTable');
  return (
    <ScrollArea className="grid h-[calc(80vh-240px)] rounded-md border md:h-[calc(90dvh-300px)]">
      <Table className="relative">
        <TableHeader>
          <TableRow>
            <TableHead>{t('ubxtable.symbol')}</TableHead>
            <TableHead>{t('ubxtable.open')}</TableHead>
            <TableHead>{t('ubxtable.high')}</TableHead>
            <TableHead>{t('ubxtable.low')}</TableHead>
            <TableHead>{t('ubxtable.previousClose')}</TableHead>
            <TableHead>{t('ubxtable.todayClose')}</TableHead>
            <TableHead>{t('ubxtable.totalVolume')}</TableHead>
            <TableHead>{t('ubxtable.closingPrice')}</TableHead>
            <TableHead>{t('ubxtable.closingCount')}</TableHead>
            <TableHead>{t('ubxtable.tradedPrice')}</TableHead>
            <TableHead>{t('ubxtable.tradedVolume')}</TableHead>
            <TableHead>{t('ubxtable.lastUpdated')}</TableHead>
            {/* <TableHead>Ирсэн огноо</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((quote) => (
            <TableRow
              key={quote.id}
              onClick={() => handleRowClick(quote.code)}
              className={`cursor-pointer ${
                quote.code === selectedSymbol ? 'bg-accent' : ''
              }`}
            >
              <TableCell>
                <span
                  className={`rounded px-2 py-1 ${
                    quote.code === 'MOST'
                      ? 'bg-red-500 text-white'
                      : quote.code === 'AND'
                      ? 'bg-blue-500 text-white'
                      : 'bg-green-500 text-white'
                  }`}
                >
                  {quote.code || '-'}
                </span>
              </TableCell>
              <TableCell>
                {Number(quote.openprice).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.highprice).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.lowprice).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.prevcloseprice).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.closeprice).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.bidqty).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.lastprice).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.lastvolume).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.totalprice).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {Number(quote.totalvolume).toLocaleString('en-US') ?? '-'}
              </TableCell>
              <TableCell>
                {quote.modified
                  ? moment(quote.modified).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </TableCell>
              {/* <TableCell>
                {quote.received
                  ? moment(quote.received).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
