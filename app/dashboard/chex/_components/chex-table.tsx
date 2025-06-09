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
import { useRouter, useSearchParams } from 'next/navigation';
import { CHEXSecurity } from './ubx-overview-table';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';

export function CHEXSecurityTable({ data }: { data: CHEXSecurity[] }) {
  console.log(data);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedSymbol = searchParams.get('SYMBOL') || 'AND';

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
            <TableHead>{t('chextable.isin')}</TableHead>
            <TableHead>{t('chextable.symbol')}</TableHead>
            <TableHead>{t('chextable.name')}</TableHead>
            <TableHead>{t('chextable.offeredQuantity')}</TableHead>
            <TableHead>{t('chextable.bondPercentage')}</TableHead>
            <TableHead>{t('chextable.nominalPrice')}</TableHead>
            <TableHead>{t('chextable.currency')}</TableHead>
            <TableHead>{t('chextable.stockType')}</TableHead>
            <TableHead>{t('chextable.bondType')}</TableHead>
            <TableHead>{t('chextable.interestFrequency')}</TableHead>
            <TableHead>{t('chextable.initialInterestDate')}</TableHead>
            <TableHead>{t('chextable.finalInterestDate')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((quote) => (
            <TableRow
              key={quote.id}
              onClick={() => handleRowClick(quote.symbol)}
              className={`cursor-pointer ${
                quote.symbol === selectedSymbol ? 'bg-accent' : ''
              }`}
            >
              <TableCell>{quote.isin || '-'}</TableCell>
              <TableCell>
                <span className="font-bold text-blue-500">
                  {quote.symbol || '-'}
                </span>
              </TableCell>
              <TableCell>{quote.name || '-'}</TableCell>
              <TableCell>
                {quote.outstandingShares?.toLocaleString() || '-'}
              </TableCell>
              <TableCell>{quote.bondRate ?? '-'}</TableCell>
              <TableCell>
                {quote.parValue
                  ? `${quote.parValue.toLocaleString()} MNT`
                  : '-'}
              </TableCell>
              <TableCell>{quote.currency || '-'}</TableCell>
              <TableCell>
                <span
                  className={`tag ${
                    quote.securityMarketType === 'PRIMARY'
                      ? 'bg-red-500 text-white'
                      : ''
                  }`}
                >
                  {quote.securityMarketType || '-'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{quote.couponType || '-'}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{quote.couponPeriod || '-'}</Badge>
              </TableCell>
              <TableCell>
                {quote.firstCouponDate
                  ? moment(quote.firstCouponDate).format('YYYY-MM-DD')
                  : '-'}
              </TableCell>
              <TableCell>
                {quote.finalCouponDate
                  ? moment(quote.finalCouponDate).format('YYYY-MM-DD')
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
